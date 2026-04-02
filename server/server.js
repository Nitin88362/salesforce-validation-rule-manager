const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend running successfully 🚀");
});

app.post("/deploy-rules", async (req, res) => {
  const { rules, accessToken, instanceUrl } = req.body;

  try {
    for (const rule of rules) {
      // Step 1: fetch single rule with Metadata
      const query = `SELECT Id, ValidationName, Active, Metadata FROM ValidationRule WHERE Id = '${rule.Id}'`;

      const fetchResponse = await axios.get(
        `${instanceUrl}/services/data/v60.0/tooling/query/?q=${encodeURIComponent(query)}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const fetchedRule = fetchResponse.data.records?.[0];

      if (!fetchedRule || !fetchedRule.Metadata) {
        throw new Error(`Metadata not found for rule: ${rule.ValidationName}`);
      }

      // Step 2: update only active flag, keep all required metadata
      const updatedMetadata = {
        ...fetchedRule.Metadata,
        active: rule.Active,
      };

      // Step 3: patch back to Salesforce
      await axios.patch(
        `${instanceUrl}/services/data/v60.0/tooling/sobjects/ValidationRule/${rule.Id}`,
        {
          Metadata: updatedMetadata,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );
    }

    res.json({
      success: true,
      message: "Validation rules updated in Salesforce successfully ✅",
    });
  } catch (error) {
    console.error("Deploy Error:", error?.response?.data || error.message);

    res.status(500).json({
      success: false,
      message: "Error updating Salesforce",
      error: error?.response?.data || error.message,
    });
  }
});

app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});