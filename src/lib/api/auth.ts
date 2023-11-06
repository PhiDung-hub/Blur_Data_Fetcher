import { IncomingMessage } from "http";
import { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
dotenv.config(); // Load environment variables from .env file

// Function to validate the Bearer token
export function authorize(req: IncomingMessage) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return false; // No authorization header
  }

  const token = authHeader.split(' ')[1]; // Get the token from the header
  if (!token) {
    return false; // No token found
  }

  const isValidToken = token === process.env.AUTH_TOKEN;

  return isValidToken;
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (authorize(req)) {
    next();
  } else {
    // If not authorized, send a 401 Unauthorized response
    res.status(401).json({ error: 'Unauthorized' });
  }
};
