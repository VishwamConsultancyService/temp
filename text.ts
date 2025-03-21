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
    let matsSuccess = false;
    let enumSuccess = false;

    try {
      const matsResponse = await sendSoapRequest(serviceUrl, "mats_create.xml", access_token, msisdn);
      if (matsResponse.includes("value already exists") || matsResponse.includes("success")) {
        console.info("MATS Create: Success.");
        matsSuccess = true;
      }
    } catch (error) {
      console.error("MATS Create failed:", error);
    }

    try {
      const enumResponse = await sendSoapRequest(serviceUrl, "enum_create.xml", access_token, msisdn);
      if (enumResponse.includes("value already exists") || enumResponse.includes("success")) {
        console.info("ENUM Create: Success.");
        enumSuccess = true;
      }
    } catch (error) {
      console.error("ENUM Create failed:", error);
    }

    if (matsSuccess && enumSuccess) {
      return res.status(200).json({ message: "Invoke successful." });
    } else {
      return res.status(500).json({
        code: "INTERNAL_SERVER_ERROR",
        reason: "MTAS and/or ENUM operation failed",
        message: "One or more operations failed. Please check the logs.",
      });
    }

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
------

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
    let matsSuccess = false;
    let enumSuccess = false;

    try {
      const matsDeleteResponse = await sendSoapRequest(serviceUrl, "mats_delete.xml", access_token, msisdn);
      if (matsDeleteResponse.includes("value not found") || matsDeleteResponse.includes("success")) {
        console.info("MATS Delete: Success.");
        matsSuccess = true;
      }
    } catch (error) {
      console.error("MATS Delete failed:", error);
    }

    try {
      const enumDeleteResponse = await sendSoapRequest(serviceUrl, "enum_delete.xml", access_token, msisdn);
      if (enumDeleteResponse.includes("value not found") || enumDeleteResponse.includes("success")) {
        console.info("ENUM Delete: Success.");
        enumSuccess = true;
      }
    } catch (error) {
      console.error("ENUM Delete failed:", error);
    }

    if (matsSuccess && enumSuccess) {
      return res.status(200).json({ message: "Revoke successful." });
    } else {
      return res.status(500).json({
        code: "INTERNAL_SERVER_ERROR",
        reason: "MTAS and/or ENUM operation failed",
        message: "One or more operations failed. Please check the logs.",
      });
    }

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
