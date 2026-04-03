import React, { useEffect, useState } from "react";
import axios from "axios";

function App() {
  const [accessToken, setAccessToken] = useState("");
  const [instanceUrl, setInstanceUrl] = useState("");
  const [rules, setRules] = useState([]);
  const [message, setMessage] = useState("Please load validation rules.");
  const [loading, setLoading] = useState(false);

  const CLIENT_ID =
    "3MVG9dAEux2v1sLukFhQF9vBZ.qENfdR_rvfqzAtMu97Uao21TxTxZXc7nPbu8lIdxmiWZ8hJwpo1VWMkzDf1";
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

      const query = "SELECT Id, ValidationName, Active FROM ValidationRule";

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
      setMessage("Failed to load rules.");
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
    setMessage("Rule updated locally. Click Deploy Changes.");
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
    setMessage("All rules updated locally. Click Deploy Changes.");
  };

  const deployChanges = async () => {
    try {
      setLoading(true);
      setMessage("Deploying changes...");

      const response = await axios.post(
        "https://salesforce-validation-rule-manager-4.onrender.com/deploy-rules",
        {
          rules,
          accessToken,
          instanceUrl,
        }
      );

      setMessage(response.data.message || "Deploy success");
    } catch (error) {
      setMessage("Deploy failed.");
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.clear();
    setAccessToken("");
    setInstanceUrl("");
    setRules([]);
    setMessage("Logged out successfully.");
  };

  const styles = {
    page: {
      minHeight: "100vh",
      background: "linear-gradient(135deg, #eef4ff 0%, #f8fbff 100%)",
      padding: "32px 16px",
      fontFamily: "Arial, sans-serif",
    },
    container: {
      maxWidth: "1050px",
      margin: "0 auto",
    },
    card: {
      backgroundColor: "#ffffff",
      borderRadius: "20px",
      boxShadow: "0 12px 35px rgba(15, 23, 42, 0.08)",
      padding: "32px",
    },
    title: {
      margin: 0,
      fontSize: "42px",
      fontWeight: "700",
      color: "#102a43",
      marginBottom: "10px",
    },
    subtitle: {
      margin: 0,
      color: "#5b6b7a",
      fontSize: "16px",
      marginBottom: "24px",
    },
    topBar: {
      display: "flex",
      flexWrap: "wrap",
      gap: "12px",
      marginBottom: "20px",
    },
    primaryButton: {
      backgroundColor: "#2563eb",
      color: "#fff",
      border: "none",
      borderRadius: "10px",
      padding: "12px 18px",
      fontSize: "15px",
      fontWeight: "600",
      cursor: "pointer",
      boxShadow: "0 6px 14px rgba(37, 99, 235, 0.22)",
    },
    grayButton: {
      backgroundColor: "#6b7280",
      color: "#fff",
      border: "none",
      borderRadius: "10px",
      padding: "12px 18px",
      fontSize: "15px",
      fontWeight: "600",
      cursor: "pointer",
    },
    greenButton: {
      backgroundColor: "#059669",
      color: "#fff",
      border: "none",
      borderRadius: "10px",
      padding: "12px 18px",
      fontSize: "15px",
      fontWeight: "600",
      cursor: "pointer",
      boxShadow: "0 6px 14px rgba(5, 150, 105, 0.20)",
    },
    loginButton: {
      backgroundColor: "#2563eb",
      color: "#fff",
      border: "none",
      borderRadius: "12px",
      padding: "14px 22px",
      fontSize: "16px",
      fontWeight: "700",
      cursor: "pointer",
      boxShadow: "0 8px 18px rgba(37, 99, 235, 0.24)",
    },
    messageBox: {
      backgroundColor: "#eef2ff",
      border: "1px solid #dbe3ff",
      color: "#1e3a8a",
      padding: "14px 16px",
      borderRadius: "12px",
      fontWeight: "600",
      marginBottom: "22px",
    },
    infoGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
      gap: "16px",
      marginBottom: "24px",
    },
    infoCard: {
      backgroundColor: "#f8fafc",
      border: "1px solid #e5e7eb",
      borderRadius: "14px",
      padding: "16px",
    },
    infoLabel: {
      color: "#64748b",
      fontSize: "13px",
      marginBottom: "6px",
    },
    infoValue: {
      color: "#0f172a",
      fontSize: "15px",
      fontWeight: "700",
      wordBreak: "break-word",
    },
    statusPill: {
      display: "inline-block",
      padding: "6px 12px",
      borderRadius: "999px",
      fontSize: "13px",
      fontWeight: "700",
      backgroundColor: "#dcfce7",
      color: "#166534",
    },
    tableWrap: {
      overflowX: "auto",
      border: "1px solid #e5e7eb",
      borderRadius: "16px",
    },
    table: {
      width: "100%",
      borderCollapse: "collapse",
      backgroundColor: "#fff",
    },
    th: {
      backgroundColor: "#f8fafc",
      color: "#0f172a",
      textAlign: "left",
      fontSize: "15px",
      padding: "16px",
      borderBottom: "1px solid #e5e7eb",
    },
    td: {
      padding: "16px",
      borderBottom: "1px solid #eef2f7",
      color: "#1f2937",
      fontSize: "15px",
    },
    actionButton: {
      backgroundColor: "#111827",
      color: "#fff",
      border: "none",
      borderRadius: "10px",
      padding: "9px 14px",
      fontSize: "14px",
      fontWeight: "600",
      cursor: "pointer",
    },
    activeBadge: {
      display: "inline-block",
      padding: "6px 12px",
      borderRadius: "999px",
      backgroundColor: "#dcfce7",
      color: "#166534",
      fontWeight: "700",
      fontSize: "13px",
    },
    inactiveBadge: {
      display: "inline-block",
      padding: "6px 12px",
      borderRadius: "999px",
      backgroundColor: "#fee2e2",
      color: "#b91c1c",
      fontWeight: "700",
      fontSize: "13px",
    },
    emptyState: {
      padding: "30px",
      textAlign: "center",
      color: "#64748b",
      fontWeight: "600",
    },
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.card}>
          <h1 style={styles.title}>Salesforce Validation Rule Manager</h1>
          <p style={styles.subtitle}>
            Manage Salesforce validation rules with login, fetch, toggle, and deploy actions.
          </p>

          {!accessToken ? (
            <button style={styles.loginButton} onClick={loginWithSalesforce}>
              Login with Salesforce
            </button>
          ) : (
            <>
              <div style={styles.topBar}>
                <button style={styles.primaryButton} onClick={getValidationRules} disabled={loading}>
                  Get Validation Rules
                </button>

                <button style={styles.grayButton} onClick={toggleAllRules} disabled={loading}>
                  Toggle All
                </button>

                <button style={styles.greenButton} onClick={deployChanges} disabled={loading}>
                  Deploy Changes
                </button>

                <button style={styles.grayButton} onClick={logout} disabled={loading}>
                  Logout
                </button>
              </div>

              <div style={styles.messageBox}>
                {loading ? "Please wait..." : message}
              </div>

              <div style={styles.infoGrid}>
                <div style={styles.infoCard}>
                  <div style={styles.infoLabel}>Login Status</div>
                  <div style={styles.infoValue}>
                    <span style={styles.statusPill}>Connected</span>
                  </div>
                </div>

                <div style={styles.infoCard}>
                  <div style={styles.infoLabel}>Instance URL</div>
                  <div style={styles.infoValue}>{instanceUrl || "Not available"}</div>
                </div>

                <div style={styles.infoCard}>
                  <div style={styles.infoLabel}>Total Rules</div>
                  <div style={styles.infoValue}>{rules.length}</div>
                </div>
              </div>

              <div style={styles.tableWrap}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Rule Name</th>
                      <th style={styles.th}>Status</th>
                      <th style={styles.th}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rules.length > 0 ? (
                      rules.map((rule) => (
                        <tr key={rule.Id}>
                          <td style={styles.td}>{rule.ValidationName}</td>
                          <td style={styles.td}>
                            {rule.Active ? (
                              <span style={styles.activeBadge}>Active</span>
                            ) : (
                              <span style={styles.inactiveBadge}>Inactive</span>
                            )}
                          </td>
                          <td style={styles.td}>
                            <button
                              style={styles.actionButton}
                              onClick={() => toggleRule(rule.Id)}
                            >
                              {rule.Active ? "Disable" : "Enable"}
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="3" style={styles.emptyState}>
                          No validation rules loaded yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;