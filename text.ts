.env
BASIC_AUTH_USERNAME=admin
BASIC_AUTH_PASSWORD=secret123
------------
app.ts
import express from "express";
import dotenv from "dotenv";
import { basicAuth } from "./middlewares/authMiddleware"; // Import middleware
import invokeRouter from "./routes/invoke";
import revokeRouter from "./routes/revoke";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

// Apply Basic Auth Middleware to all routes
app.use(basicAuth);

app.use("/soap/invoke", invokeRouter);
app.use("/soap/revoke", revokeRouter);

app.get("/health", (req, res) => {
  res.json({ success: true });
});

// Catch-all route for 404 errors
app.use((req, res) => {
  res.status(404).json({ error: "Not Found" });
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
--------------
authMiddleware.ts
import { Request, Response, NextFunction } from "express";

/**
 * Middleware to enforce Basic Authentication
 */
export const basicAuth = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Basic ")) {
    return res.status(401).json({ error: "Unauthorized: Missing Authorization header" });
  }

  // Extract Base64 encoded credentials
  const base64Credentials = authHeader.split(" ")[1];
  const credentials = Buffer.from(base64Credentials, "base64").toString("utf-8");
  const [username, password] = credentials.split(":");

  // Validate credentials
  if (
    username === process.env.BASIC_AUTH_USERNAME &&
    password === process.env.BASIC_AUTH_PASSWORD
  ) {
    return next(); // Authentication successful, proceed to API
  }

  return res.status(401).json({ error: "Unauthorized: Invalid credentials" });
};
-------------
  invoke.ts
import express from "express";
import { getAccessToken } from "../services/authService";
import { sendSoapRequest } from "../services/soapService";

const router = express.Router();

router.get("/", async (req: any, res: any) => {
  try {
    const authResult = await getAccessToken();
    if (!authResult) {
      return res.status(401).json({ error: "Authentication failed" });
    }

    const { access_token, serviceUrl } = authResult;

    try {
      // Try mats_create first
      const matsResponse = await sendSoapRequest(serviceUrl, "mats_create.xml", {
        msisdn: req.body.msisdn,
        access_token,
      });

      try {
        // If mats_create succeeds, try enum_create
        const enumResponse = await sendSoapRequest(serviceUrl, "enum_create.xml", {
          msisdn: req.body.msisdn,
          access_token,
        });

        res.json({ matsResponse, enumResponse });
      } catch {
        res.status(500).json({ error: "mats_create succeeded, but enum_create failed" });
      }
    } catch {
      res.status(500).json({ error: "mats_create failed" });
    }
  } catch (error) {
    console.error("Invoke request failed:", error);
    res.status(500).json({ error: "Failed to process invoke request" });
  }
});

export default router;
---------
  authService.ts

import dotenv from "dotenv";
import { sendSoapRequest } from "./soapService";

dotenv.config();

const getAccessToken = async () => {
  const services = [
    {
      url: process.env.SERVICE1_URL,
      username: process.env.SERVICE1_USERNAME,
      password: process.env.SERVICE1_PASSWORD,
    },
    {
      url: process.env.SERVICE2_URL,
      username: process.env.SERVICE2_USERNAME,
      password: process.env.SERVICE2_PASSWORD,
    },
  ];

  for (const service of services) {
    if (!service.url || !service.username || !service.password) {
      console.error(`⚠️ Missing credentials for service: ${service.url}`);
      continue;
    }

    try {
      console.log(`🔹 Trying authentication with ${service.url}`);

      const responseXml = await sendSoapRequest(service.url, "login.xml", {
        username: service.username,
        password: service.password,
      });

      // Extract access token from SOAP response
      const tokenMatch = responseXml.match(/<access_token>(.*?)<\/access_token>/);
      if (tokenMatch) {
        console.log(`✅ Authentication successful with ${service.url}`);
        return { access_token: tokenMatch[1], serviceUrl: service.url };
      }

      console.error(`⚠️ Failed to extract access token from ${service.url}`);
    } catch (error) {
      console.error(`❌ Authentication failed with ${service.url}:`, error.message);
    }
  }

  throw new Error("Authentication failed with all services.");
};

export { getAccessToken };

