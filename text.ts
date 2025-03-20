invoke.ts
import express from "express";
import { getAccessToken } from "../services/authService";
import { sendSoapRequest } from "../services/soapService";
import { basicAuth } from "../middlewares/authMiddleware"; // Protect with Basic Auth

const router = express.Router();

// Apply Basic Authentication Middleware
router.use(basicAuth);

router.post("/", async (req: any, res: any) => {
  try {
    // Authenticate and get the service URL + token
    const authResult = await getAccessToken();
    if (!authResult) {
      return res.status(401).json({ error: "Authentication failed" });
    }

    const { access_token, serviceUrl } = authResult;
    const msisdn = req.body.msisdn;

    let matsResponse, enumResponse;

    try {
      matsResponse = await sendSoapRequest(serviceUrl, "mats_create.xml", { "%MSISDN%": msisdn, "%session_id%": access_token });
    } catch (error) {
      console.error("mats_create failed:", error);
      matsResponse = { error: "mats_create failed" };
    }

    if (!matsResponse.error) {
      try {
        enumResponse = await sendSoapRequest(serviceUrl, "enum_create.xml", { "%MSISDN%": msisdn, "%session_id%": access_token });
      } catch (error) {
        console.error("enum_create failed:", error);
        enumResponse = { error: "enum_create failed" };
      }
    } else {
      enumResponse = { skipped: "Skipped due to mats_create failure" };
    }

    res.json({ matsResponse, enumResponse });
  } catch (error) {
    console.error("Invoke request failed:", error);
    res.status(500).json({ error: "Failed to process invoke request" });
  }
});

export default router;
-----
  revoke.ts
import express from "express";
import { getAccessToken } from "../services/authService";
import { sendSoapRequest } from "../services/soapService";
import { basicAuth } from "../middlewares/authMiddleware"; // Protect with Basic Auth

const router = express.Router();

// Apply Basic Authentication Middleware
router.use(basicAuth);

router.post("/", async (req: any, res: any) => {
  try {
    // Authenticate and get the service URL + token
    const authResult = await getAccessToken();
    if (!authResult) {
      return res.status(401).json({ error: "Authentication failed" });
    }

    const { access_token, serviceUrl } = authResult;
    const msisdn = req.body.msisdn;

    let matsResponse, enumResponse;

    try {
      matsResponse = await sendSoapRequest(serviceUrl, "mats_delete.xml", { "%MSISDN%": msisdn, "%session_id%": access_token });
    } catch (error) {
      console.error("mats_delete failed:", error);
      matsResponse = { error: "mats_delete failed" };
    }

    if (!matsResponse.error) {
      try {
        enumResponse = await sendSoapRequest(serviceUrl, "enum_delete.xml", { "%MSISDN%": msisdn, "%session_id%": access_token });
      } catch (error) {
        console.error("enum_delete failed:", error);
        enumResponse = { error: "enum_delete failed" };
      }
    } else {
      enumResponse = { skipped: "Skipped due to mats_delete failure" };
    }

    res.json({ matsResponse, enumResponse });
  } catch (error) {
    console.error("Revoke request failed:", error);
    res.status(500).json({ error: "Failed to process revoke request" });
  }
});

export default router;
-----
  soapService.ts

import fs from "fs";
import path from "path";
import axios from "axios";

export async function sendSoapRequest(serviceUrl: string, xmlFileName: string, replacements: { [key: string]: string }) {
  try {
    // Load the SOAP XML template from the payloads folder
    const xmlPath = path.join(__dirname, "../payloads", xmlFileName);
    let xmlContent = fs.readFileSync(xmlPath, "utf-8");

    // Replace placeholders in XML with actual values
    for (const [placeholder, value] of Object.entries(replacements)) {
      xmlContent = xmlContent.replace(new RegExp(placeholder, "g"), value);
    }

    // Send the SOAP request
    const response = await axios.post(serviceUrl, xmlContent, {
      headers: { "Content-Type": "text/xml" }
    });

    return response.data;
  } catch (error) {
    console.error(`SOAP request failed for ${xmlFileName}:`, error);
    throw new Error(`SOAP request failed: ${xmlFileName}`);
  }
}
