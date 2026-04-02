import React, { useEffect, useState } from "react";
import axios from "axios";

function App() {
  const [accessToken, setAccessToken] = useState("");
  const [instanceUrl, setInstanceUrl] = useState("");
  const [rules, setRules] = useState([]);
  const [message, setMessage] = useState("Please load validation rules.");
  const [loading, setLoading] = useState(false);

  const CLIENT_ID = "YAHAN_APNA_CONSUMER_KEY_DALO";
  const REDIRECT_URI = "http://localhost:3000/callback";

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
      const errorMsg =
        error?.response?.data?.[0]?.message ||
        error?.message ||
        "Unknown error";

      setMessage(`Failed to load rules: ${errorMsg}`);
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
    setMessage("Rule status updated locally. Click Deploy Changes to continue.");
  };

  const toggleAllRules = () => {
    if (rules.length === 0) {
      setMessage("Please load validation rules first.");
      return;
    }

    const allActive = rules.every((rule) => rule.Active);
    const updatedRules = rules.map((rule) => ({
      ...rule,
      Active: !allActive,
    }));

    setRules(updatedRules);
    setMessage("All rule statuses updated locally. Click Deploy Changes to continue.");
  };

  const deployChanges = async () => {
    try {
      if (rules.length === 0) {
        setMessage("No rules available to deploy.");
        return;
      }

      setLoading(true);
      setMessage("Sending updated rules to backend...");

      const response = await axios.post("http://localhost:5000/deploy-rules", {
        rules,
        accessToken,
        instanceUrl,
      });

      setMessage(response.data.message || "Changes sent successfully.");
    } catch (error) {
      setMessage("Deploy failed. Please check backend server.");
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("instance_url");
    setAccessToken("");
    setInstanceUrl("");
    setRules([]);
    setMessage("Logged out successfully.");
  };

  const pageStyle = {
    minHeight: "100vh",
    backgroundColor: "#f4f6f8",
    padding: "30px",
    fontFamily: "Arial, sans-serif",
  };

  const cardStyle = {
    maxWidth: "900px",
    margin: "0 auto",
    backgroundColor: "#ffffff",
    padding: "25px",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
  };

  const headingStyle = {
    marginBottom: "20px",
    color: "#1f2937",
  };

  const buttonStyle = {
    padding: "10px 16px",
    marginRight: "10px",
    marginBottom: "10px",
    border: "none",
    borderRadius: "8px",
    backgroundColor: "#2563eb",
    color: "#ffffff",
    cursor: "pointer",
    fontWeight: "bold",
  };

  const secondaryButtonStyle = {
    ...buttonStyle,
    backgroundColor: "#6b7280",
  };

  const successButtonStyle = {
    ...buttonStyle,
    backgroundColor: "#059669",
  };

  const ruleButtonStyle = {
    padding: "6px 12px",
    border: "none",
    borderRadius: "6px",
    backgroundColor: "#111827",
    color: "#ffffff",
    cursor: "pointer",
  };

  const messageStyle = {
    padding: "12px",
    borderRadius: "8px",
    backgroundColor: "#eef2ff",
    color: "#1e3a8a",
    marginBottom: "20px",
    fontWeight: "bold",
  };

  const infoStyle = {
    marginBottom: "20px",
    lineHeight: "1.8",
    color: "#374151",
  };

  const tableStyle = {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: "15px",
  };

  const thTdStyle = {
    border: "1px solid #d1d5db",
    padding: "12px",
    textAlign: "left",
  };

  const thStyle = {
    ...thTdStyle,
    backgroundColor: "#f3f4f6",
  };

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        <h1 style={headingStyle}>Salesforce Validation Rule Manager</h1>

        {!accessToken ? (
          <button style={buttonStyle} onClick={loginWithSalesforce}>
            Login with Salesforce
          </button>
        ) : (
          <>
            <div>
              <button style={buttonStyle} onClick={getValidationRules} disabled={loading}>
                Get Validation Rules
              </button>

              <button style={secondaryButtonStyle} onClick={toggleAllRules} disabled={loading}>
                Toggle All
              </button>

              <button style={successButtonStyle} onClick={deployChanges} disabled={loading}>
                Deploy Changes
              </button>

              <button style={secondaryButtonStyle} onClick={logout} disabled={loading}>
                Logout
              </button>
            </div>

            <div style={messageStyle}>{loading ? "Please wait..." : message}</div>

            <div style={infoStyle}>
              <div><b>Login Status:</b> Connected</div>
              <div><b>Instance URL:</b> {instanceUrl || "Not available"}</div>
              <div><b>Total Rules:</b> {rules.length}</div>
            </div>

            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Rule Name</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Action</th>
                </tr>
              </thead>
              <tbody>
                {rules.length > 0 ? (
                  rules.map((rule) => (
                    <tr key={rule.Id}>
                      <td style={thTdStyle}>{rule.ValidationName}</td>
                      <td style={thTdStyle}>
                        {rule.Active ? "Active" : "Inactive"}
                      </td>
                      <td style={thTdStyle}>
                        <button
                          style={ruleButtonStyle}
                          onClick={() => toggleRule(rule.Id)}
                        >
                          {rule.Active ? "Disable" : "Enable"}
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td style={thTdStyle} colSpan="3">
                      No validation rules loaded.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </>
        )}
      </div>
    </div>
  );
}

export default App;