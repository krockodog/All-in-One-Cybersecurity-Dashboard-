import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { Express } from "express";

/**
 * Security Middleware Configuration
 * Implements OWASP Top 10 protections
 */

// Helmet: HTTP Security Headers
export const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api.openai.com", "https://api.anthropic.com"],
    },
  },
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true,
  },
  frameguard: { action: "deny" },
  noSniff: true,
  xssFilter: true,
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
});

// Rate Limiting: Prevent brute force & DoS
export const rateLimiters = {
  // Global rate limit: 100 requests per 15 minutes
  global: rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: "Too many requests, please try again later",
    standardHeaders: true,
    legacyHeaders: false,
  }),

  // Strict rate limit for auth endpoints: 5 requests per 15 minutes
  auth: rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: "Too many login attempts, please try again later",
    skipSuccessfulRequests: true,
  }),

  // API rate limit: 1000 requests per hour
  api: rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 1000,
    message: "API rate limit exceeded",
  }),

  // Tool execution rate limit: 50 requests per hour
  tools: rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 50,
    message: "Tool execution rate limit exceeded",
  }),
};

/**
 * Input Validation & Sanitization
 */
export function validateInput(input: unknown, type: "string" | "email" | "url" | "number"): boolean {
  if (type === "string") {
    return typeof input === "string" && input.length > 0 && input.length < 1000;
  }
  if (type === "email") {
    return typeof input === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input);
  }
  if (type === "url") {
    try {
      new URL(input as string);
      return true;
    } catch {
      return false;
    }
  }
  if (type === "number") {
    return typeof input === "number" && !isNaN(input);
  }
  return false;
}

/**
 * SQL Injection Prevention
 * Use parameterized queries (Drizzle ORM handles this)
 */
export function sanitizeSQLInput(input: string): string {
  // Remove dangerous characters
  return input.replace(/[;'"\\]/g, "");
}

/**
 * XSS Prevention
 * Escape HTML special characters
 */
export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (char) => map[char]);
}

/**
 * CSRF Token Generation & Validation
 */
import crypto from "crypto";

export function generateCsrfToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export function validateCsrfToken(token: string, sessionToken: string): boolean {
  return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(sessionToken));
}

/**
 * Secure Headers Middleware
 */
export function secureHeaders(app: Express) {
  app.use((req, res, next) => {
    // Prevent clickjacking
    res.setHeader("X-Frame-Options", "DENY");

    // Prevent MIME type sniffing
    res.setHeader("X-Content-Type-Options", "nosniff");

    // Enable XSS protection
    res.setHeader("X-XSS-Protection", "1; mode=block");

    // Referrer policy
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");

    // Feature policy
    res.setHeader("Permissions-Policy", "geolocation=(), microphone=(), camera=()");

    next();
  });
}

/**
 * CORS Configuration
 */
export const corsConfig = {
  origin: process.env.NODE_ENV === "production" ? ["https://cyberdash-xnbpkymb.manus.space"] : "*",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

/**
 * API Key Validation
 */
export function validateApiKey(key: string): boolean {
  // Check if key matches expected format
  return /^[a-zA-Z0-9_-]{32,}$/.test(key);
}

/**
 * Password Strength Validation
 */
export function validatePasswordStrength(password: string): {
  strong: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 12) errors.push("Password must be at least 12 characters");
  if (!/[A-Z]/.test(password)) errors.push("Password must contain uppercase letter");
  if (!/[a-z]/.test(password)) errors.push("Password must contain lowercase letter");
  if (!/[0-9]/.test(password)) errors.push("Password must contain number");
  if (!/[!@#$%^&*]/.test(password)) errors.push("Password must contain special character");

  return {
    strong: errors.length === 0,
    errors,
  };
}

/**
 * Secure Cookie Options
 */
export const secureCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
};

/**
 * Environment Variable Validation
 */
export function validateEnvironment(): void {
  const required = [
    "DATABASE_URL",
    "JWT_SECRET",
    "VITE_APP_ID",
    "OAUTH_SERVER_URL",
    "BUILT_IN_FORGE_API_KEY",
  ];

  for (const env of required) {
    if (!process.env[env]) {
      throw new Error(`Missing required environment variable: ${env}`);
    }
  }

  // Validate JWT_SECRET length
  if ((process.env.JWT_SECRET || "").length < 32) {
    throw new Error("JWT_SECRET must be at least 32 characters");
  }
}
