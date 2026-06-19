// Re-export auth functions + API helpers for route handlers
export {
  generateTOTPSecret,
  generateTOTPCode,
  verifyTOTP,
  generateOTPAuthURL,
  hashPassword,
  verifyPassword,
  createSession,
  verifySession,
  getUserFromRequest,
  type SessionData,
} from "./auth";

export { ok, bad, parseBody } from "./api";
