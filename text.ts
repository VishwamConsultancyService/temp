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

    // Send SOAP request for mats_delete
    let matsResponse, enumResponse;
    try {
      matsResponse = await sendSoapRequest(
        serviceUrl,
        "mats_delete.xml",
        access_token,
        req.body.msisdn
      );
    } catch (error) {
      console.error("mats_delete failed:", error);
      matsResponse = { error: "mats_delete failed" };
    }

    // Send SOAP request for enum_delete, even if mats_delete failed
    try {
      enumResponse = await sendSoapRequest(
        serviceUrl,
        "enum_delete.xml",
        access_token,
        req.body.msisdn
      );
    } catch (error) {
      console.error("enum_delete failed:", error);
      enumResponse = { error: "enum_delete failed" };
    }

    res.json({ matsResponse, enumResponse });
  } catch (error) {
    console.error("Revoke request failed:", error);
    res.status(500).json({ error: "Failed to process revoke request" });
  }
});

export default router;

-------
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

    // Send SOAP request for mats_create
    let matsResponse, enumResponse;
    try {
      matsResponse = await sendSoapRequest(
        serviceUrl,
        "mats_create.xml",
        access_token,
        req.body.msisdn
      );
    } catch (error) {
      console.error("mats_create failed:", error);
      matsResponse = { error: "mats_create failed" };
    }

    // Only attempt enum_create if mats_create succeeded
    if (!matsResponse.error) {
      try {
        enumResponse = await sendSoapRequest(
          serviceUrl,
          "enum_create.xml",
          access_token,
          req.body.msisdn
        );
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

