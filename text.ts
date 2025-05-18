export const ResponseMessages = {
  SUCCESS: {
    code: "200",
    reason: "Success",
    message: "Operation completed successfully"
  },
  MATS_ENUM_FAILED: {
    code: "500",
    reason: "Partial Failure",
    message: "One or more operations failed. Check MATS/ENUM results."
  },
  AUTH_FAILED: {
    code: "401",
    reason: "Authentication Failed",
    message: "Unable to authenticate with backend"
  },
  INVALID_REQUEST: {
    code: "400",
    reason: "Bad Request",
    message: "Request payload or parameters are invalid"
  },
  NOT_FOUND: {
    code: "404",
    reason: "Not Found",
    message: "Resource not found"
  },
  INTERNAL_ERROR: {
    code: "500",
    reason: "Internal Server Error",
    message: "Something went wrong on the server"
  },
};
