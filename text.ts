import express from "express";
import { getAccessToken } from "../services/authService";
import { sendSoapRequest } from "../services/soapService";

const router = express.Router();

router.delete("/:msisdn", async (req, res) => {
  try {
    const { msisdn } = req.params;
    if (!msisdn) {
      return res.status(400).json({
        code: "MISSING_PARAMETER",
        reason: "MSISDN required",
        message: "The 'msisdn' parameter is required in the URL.",
      });
    }

    const authResult = await getAccessToken();
    if (!authResult) {
      return res.status(401).json({
        code: "AUTH_FAILED",
        reason: "Invalid credentials",
        message: "Authentication failed for the provided username and password.",
      });
    }

    const { access_token, serviceUrl } = authResult;
    let matsDeleteResponse, enumDeleteResponse;

    try {
      matsDeleteResponse = await sendSoapRequest(serviceUrl, "mats_delete.xml", access_token, msisdn);
      if (matsDeleteResponse.includes("value not found")) {
        console.warn("MATS Delete: Value not found. Treating as success.");
      }
    } catch (error) {
      if (error.message.includes("value not found")) {
        console.warn("MATS Delete: Value not found. Treating as success.");
      } else {
        throw error;
      }
    }

    try {
      enumDeleteResponse = await sendSoapRequest(serviceUrl, "enum_delete.xml", access_token, msisdn);
      if (enumDeleteResponse.includes("value not found")) {
        console.warn("ENUM Delete: Value not found. Treating as success.");
      }
    } catch (error) {
      if (error.message.includes("value not found")) {
        console.warn("ENUM Delete: Value not found. Treating as success.");
      } else {
        throw error;
      }
    }

    return res.json({ matsDeleteResponse, enumDeleteResponse });

  } catch (error) {
    console.error("Revoke request failed:", error);
    return res.status(500).json({
      code: "INTERNAL_SERVER_ERROR",
      reason: "Unexpected error",
      message: "An unexpected error occurred. Please try again later.",
    });
  }
});

export default router;
------
  import express from "express";
import { getAccessToken } from "../services/authService";
import { sendSoapRequest } from "../services/soapService";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { msisdn } = req.body;
    if (!msisdn) {
      return res.status(400).json({
        code: "MISSING_PARAMETER",
        reason: "MSISDN required",
        message: "The 'msisdn' parameter is required in the request body.",
      });
    }

    const authResult = await getAccessToken();
    if (!authResult) {
      return res.status(401).json({
        code: "AUTH_FAILED",
        reason: "Invalid credentials",
        message: "Authentication failed for the provided username and password.",
      });
    }

    const { access_token, serviceUrl } = authResult;
    let matsResponse, enumResponse;

    try {
      matsResponse = await sendSoapRequest(serviceUrl, "mats_create.xml", access_token, msisdn);
      if (matsResponse.includes("value already exists")) {
        console.warn("MATS Create: Value already exists. Treating as success.");
      }
    } catch (error) {
      if (error.message.includes("value already exists")) {
        console.warn("MATS Create: Value already exists. Treating as success.");
      } else {
        throw error;
      }
    }

    try {
      enumResponse = await sendSoapRequest(serviceUrl, "enum_create.xml", access_token, msisdn);
      if (enumResponse.includes("value already exists")) {
        console.warn("ENUM Create: Value already exists. Treating as success.");
      }
    } catch (error) {
      if (error.message.includes("value already exists")) {
        console.warn("ENUM Create: Value already exists. Treating as success.");
      } else {
        throw error;
      }
    }

    return res.json({ matsResponse, enumResponse });

  } catch (error) {
    console.error("Invoke request failed:", error);
    return res.status(500).json({
      code: "INTERNAL_SERVER_ERROR",
      reason: "Unexpected error",
      message: "An unexpected error occurred. Please try again later.",
    });
  }
});

export default router;
