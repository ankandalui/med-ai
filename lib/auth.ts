import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret";

export interface JWTPayload {
  userId: string;
  email: string;
  userType: "PATIENT" | "HEALTH_WORKER";
}

export const hashPassword = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, 12);
};

export const comparePassword = async (
  password: string,
  hash: string
): Promise<boolean> => {
  return await bcrypt.compare(password, hash);
};

export const generateToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
};

export const verifyToken = (token: string): JWTPayload | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    return null;
  }
};

export const generateOTP = (): string => {
  if (process.env.OTP_BYPASS_ENABLED === "true") {
    return process.env.OTP_BYPASS_CODE || "123456";
  }
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const isOTPValid = (otp: string, storedOTP: string): boolean => {
  if (process.env.OTP_BYPASS_ENABLED === "true") {
    return otp === (process.env.OTP_BYPASS_CODE || "123456");
  }
  return otp === storedOTP;
};
