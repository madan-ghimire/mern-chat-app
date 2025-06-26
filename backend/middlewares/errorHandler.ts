import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import mongoose from "mongoose";
import { AppError } from "../domain/errors/AppError";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error("🛑 Error occurred:", err);

  if (err.name === "TokenExpiredError") {
    res.status(401).json({ error: "Token has expired. Please log in again." });
    return;
  }

  if (err.name === "JsonWebTokenError") {
    res.status(401).json({ error: "Invalid token. Authentication failed." });
    return;
  }

  if (err instanceof ZodError) {
    const flattened = err.flatten();
    res.status(400).json({
      error: "Validation failed",
      issues: {
        fieldErrors: flattened.fieldErrors,
        formErrors: flattened.formErrors,
      },
    });
    return;
  }

  if (err instanceof mongoose.Error.CastError) {
    res.status(400).json({
      error: `Invalid value for field "${err.path}": ${err.value}`,
    });
    return;
  }

  if (err instanceof mongoose.Error.ValidationError) {
    const errors = Object.values(err.errors).map((e) => ({
      message: e.message,
      path: (e as any).path,
    }));

    res.status(400).json({
      error: "Validation failed",
      issues: errors,
    });
    return;
  }

  if ((err as any).code === 11000 && (err as any).name === "MongoServerError") {
    const duplicatedField = Object.keys((err as any).keyValue)[0];
    res.status(409).json({
      error: `Duplicate value for field "${duplicatedField}". Please use another.`,
    });
    return;
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }

  res.status(500).json({
    error: "Internal server error. Please try again later.",
    details: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
};
