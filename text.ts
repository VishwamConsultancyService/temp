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
