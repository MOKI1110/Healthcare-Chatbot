import { Request, Response, NextFunction } from "express";

// ✅ Extend Express Request type globally
declare global {
  namespace Express {
    interface Request {
      locale?: string;
    }
  }
}

export default function localizationMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const locale = req.headers["accept-language"]?.split(",")[0] || "en";
  req.locale = locale;
  next();
}
