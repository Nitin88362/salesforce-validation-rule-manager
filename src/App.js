import React, { useEffect, useState } from "react";
import axios from "axios";

function App() {
  const [accessToken, setAccessToken] = useState("");
  const [instanceUrl, setInstanceUrl] = useState("");
  const [rules, setRules] = useState([]);
  const [message, setMessage] = useState("Please load validation rules.");
  const [loading, setLoading] = useState(false);

  // ✅ Salesforce Config
  const CLIENT_ID = "3MVG9dAEux2v1sLukFhQF9vBZ.qENfdR_rvfqzAtMu97Uao21TxTxZXc7nPbu8lIdxmiWZ8hJwpo1VWMkzDf1";

  // ✅ IMPORTANT FIX (auto dynamic URL)
  const REDIRECT_URI = window.location.origin + "/callback";

  useEffect(() => {
    const hash = window.location.hash;

    if (hash && hash.includes("access_token")) {
      const params = new URLSearchParams(hash.substring(1));
      const token = params.get("access_token");
      const url = params.get("instance_url");

      if (token && url) {
        setAccessToken(token);
        setInstanceUrl(url);
        localStorage.setItem("access_token", token);
        localStorage.setItem("instance_url", url);
        window.history.replaceState({}, document.title, "/");
      }
    } else {
      const savedToken = localStorage.getItem("access_token");
      const savedUrl = localStorage.getItem("instance_url");

      if (savedToken && savedUrl) {
        setAccessToken(savedToken);
        setInstanceUrl(savedUrl);
      }
    }
  }, []);

  const loginWithSalesforce = () => {
    const authUrl =
      `https://login.salesforce.com/services/oauth2/authorize` +
      `?response_type=token` +
      `&client_id=${CLIENT_ID}` +
      `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`;

    window.location.href = authUrl;
  };

  const getValidationRules = async () => {
    try {
      setLoading(true);
      setMessage("Loading validation rules...");

      const query =
        "SELECT Id, ValidationName, Active FROM ValidationRule";

      const response = await axios.get(
        `${instanceUrl}/services/data/v60.0/tooling/query/?q=${encodeURIComponent(query)}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const fetchedRules = response.data.records || [];
      setRules(fetchedRules);
      setMessage(`${fetchedRules.length} validation rule(s) loaded successfully.`);
    } catch (error) {
      setMessage("Failed to load rules");
      setRules([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleRule = (id) => {
    const updatedRules = rules.map((rule) =>
      rule.Id === id ? { ...rule, Active: !rule.Active } : rule
    );
    setRules(updatedRules);
    setMessage("Updated locally. Click Deploy.");
  };

  const toggleAllRules = () => {
    const allActive = rules.every((rule) => rule.Active);
    const updatedRules = rules.map((rule) => ({
      ...rule,
      Active: !allActive,
    }));

    setRules(updatedRules);
    setMessage("All updated. Click Deploy.");
  };

  const deployChanges = async () => {
    try {
      setLoading(true);
      setMessage("Deploying changes...");

      // ✅ FINAL BACKEND URL (Render)
      const response = await axios.post(
        "https://salesforce-validation-rule-manager-3.onrender.com/deploy-rules",
        {
          rules,
          accessToken,
          instanceUrl,
        }
      );

      setMessage(response.data.message || "Deploy success");
    } catch (error) {
      setMessage("Deploy failed ❌");
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.clear();
    setAccessToken("");
    setInstanceUrl("");
    setRules([]);
    setMessage("Logged out");
  };

  return (
    <div style={{ padding: "30px" }}>
      <h1>Salesforce Validation Rule Manager</h1>

      {!accessToken ? (
        <button onClick={loginWithSalesforce}>
          Login with Salesforce
        </button>
      ) : (
        <>
          <button onClick={getValidationRules}>Get Rules</button>
          <button onClick={toggleAllRules}>Toggle All</button>
          <button onClick={deployChanges}>Deploy</button>
          <button onClick={logout}>Logout</button>

          <p>{loading ? "Loading..." : message}</p>

          <table border="1">
            <thead>
              <tr>
                <th>Name</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {rules.map((rule) => (
                <tr key={rule.Id}>
                  <td>{rule.ValidationName}</td>
                  <td>{rule.Active ? "Active" : "Inactive"}</td>
                  <td>
                    <button onClick={() => toggleRule(rule.Id)}>
                      {rule.Active ? "Disable" : "Enable"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}

export default App;