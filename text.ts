import express from "express";
import { getAccessToken } from "../services/authService";
import { sendSoapRequest } from "../services/soapService";
import { basicAuth } from "../middlewares/authMiddleware"; // Protect with Basic Auth

const router = express.Router();

// Apply Basic Authentication Middleware
router.use(basicAuth);

router.post("/", async (req: any, res: any) => {
  try {
    const { msisdn } = req.body;
    if (!msisdn) {
      return res.status(400).json({ error: "msisdn is required in the request body" });
    }

    // Authenticate and get the service URL + token
    const authResult = await getAccessToken();
    if (!authResult) {
      return res.status(401).json({ error: "Authentication failed" });
    }

    const { access_token, serviceUrl } = authResult;
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
----
  import express from "express";
import { getAccessToken } from "../services/authService";
import { sendSoapRequest } from "../services/soapService";
import { basicAuth } from "../middlewares/authMiddleware"; // Protect with Basic Auth

const router = express.Router();

// Apply Basic Authentication Middleware
router.use(basicAuth);

// Handle DELETE request with msisdn in the URL
router.delete("/:msisdn", async (req: any, res: any) => {
  try {
    const { msisdn } = req.params;
    if (!msisdn) {
      return res.status(400).json({ error: "msisdn is required in the request URL" });
    }

    // Authenticate and get the service URL + token
    const authResult = await getAccessToken();
    if (!authResult) {
      return res.status(401).json({ error: "Authentication failed" });
    }

    const { access_token, serviceUrl } = authResult;
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
