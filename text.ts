# **MSISDN Management Service**

## **Overview**
This microservice provides an API to manage MSISDN (Mobile Station International Subscriber Directory Number) operations using SOAP-based backend services. It includes functionalities to:

- Invoke a new MSISDN (Create/Activate)
- Revoke an MSISDN (Delete/Deactivate)
- Perform health checks
- Implement Basic Authentication for security

The service interacts with two backend SOAP services (`MTAS` and `ENUM`). If one service succeeds while the other fails, the response will clearly indicate which one failed.

---

## **Installation & Setup**

### **Prerequisites**
- Node.js (>= 16)
- npm or yarn
- `.env` file with required configurations

### **Clone the repository**
```sh
git clone <repo-url>
cd <repo-name>
```

### **Install dependencies**
```sh
npm install
```

### **Environment Variables**
Create a `.env` file in the root directory with the following details:

```env
PORT=3000
SERVICE1_URL=https://service1.example.com
SERVICE2_URL=https://service2.example.com
USERNAME=your_username
PASSWORD=your_password
```

### **Run the service**
```sh
npm start
```

The service will be available at `http://localhost:3000`.

---

## **Authentication**
All endpoints require **Basic Authentication**. Include the `Authorization` header with base64-encoded credentials:

```sh
Authorization: Basic base64(username:password)
```

Example using `curl`:
```sh
curl -u username:password http://localhost:3000/health
```

---

## **API Endpoints**

### **1. Health Check**
#### **Endpoint:**
```http
GET /health
```
#### **Response:**
```json
{
  "success": true
}
```
#### **Sample Request:**
```sh
curl -u username:password http://localhost:3000/health
```

---

### **2. Invoke MSISDN (Create)**
This API registers an MSISDN using `MTAS` and `ENUM` services. If the value already exists, it is still considered a success.

#### **Endpoint:**
```http
POST /invoke
```
#### **Request Body:**
```json
{
  "msisdn": "1234567890"
}
```
#### **Responses:**

✅ **Success (Both MTAS & ENUM succeed or exist)**
```json
{
  "message": "Invoke successful."
}
```

❌ **MTAS Failed, ENUM Succeeded**
```json
{
  "code": "INTERNAL_SERVER_ERROR",
  "reason": "MTAS failed",
  "message": "MTAS operation failed, but ENUM succeeded."
}
```

❌ **ENUM Failed, MTAS Succeeded**
```json
{
  "code": "INTERNAL_SERVER_ERROR",
  "reason": "ENUM failed",
  "message": "ENUM operation failed, but MTAS succeeded."
}
```

❌ **Both Failed**
```json
{
  "code": "INTERNAL_SERVER_ERROR",
  "reason": "MTAS and ENUM failed",
  "message": "Both MTAS and ENUM operations failed."
}
```

#### **Sample Request:**
```sh
curl -X POST http://localhost:3000/invoke \
  -u username:password \
  -H "Content-Type: application/json" \
  -d '{"msisdn": "1234567890"}'
```

---

### **3. Revoke MSISDN (Delete)**
Deletes an MSISDN from `MTAS` and `ENUM`. If the MSISDN is not found, it is still considered a success.

#### **Endpoint:**
```http
DELETE /revoke/:msisdn
```
#### **Responses:**

✅ **Success (Both MTAS & ENUM delete or not found)**
```json
{
  "message": "Revoke successful."
}
```

❌ **MTAS Failed, ENUM Succeeded**
```json
{
  "code": "INTERNAL_SERVER_ERROR",
  "reason": "MTAS failed",
  "message": "MTAS delete operation failed, but ENUM succeeded."
}
```

❌ **ENUM Failed, MTAS Succeeded**
```json
{
  "code": "INTERNAL_SERVER_ERROR",
  "reason": "ENUM failed",
  "message": "ENUM delete operation failed, but MTAS succeeded."
}
```

❌ **Both Failed**
```json
{
  "code": "INTERNAL_SERVER_ERROR",
  "reason": "MTAS and ENUM failed",
  "message": "Both MTAS and ENUM delete operations failed."
}
```

#### **Sample Request:**
```sh
curl -X DELETE http://localhost:3000/revoke/1234567890 \
  -u username:password
```

---

## **Error Handling**
Errors follow this structure:
```json
{
  "code": "ERROR_CODE",
  "reason": "Short reason",
  "message": "Detailed explanation"
}
```

### **Common Error Codes**
| Code                   | Reason                    | Description |
|------------------------|--------------------------|-------------|
| `MISSING_PARAMETER`    | `MSISDN required`        | `msisdn` is missing in request |
| `AUTH_FAILED`         | `Invalid credentials`    | Authentication failed |
| `INTERNAL_SERVER_ERROR` | `MTAS failed`           | MTAS operation failed |
| `INTERNAL_SERVER_ERROR` | `ENUM failed`           | ENUM operation failed |
| `INTERNAL_SERVER_ERROR` | `MTAS and ENUM failed` | Both operations failed |

---

## **Logging & Debugging**
- All failed operations are logged for debugging.
- Logs are available in the console output.

---

## **Deployment**
For production, use a process manager like **PM2**:
```sh
npm install -g pm2
pm2 start npm -- start
```

To restart the service:
```sh
pm2 restart all
```

---

## **License**
MIT License

---

This README provides clear documentation for the API, making it easy for developers to integrate and debug issues. Let me know if you need any refinements! 🚀
