import { z } from "zod";

export const gstinSchema = z
  .string()
  .regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, "Invalid GSTIN format")
  .optional()
  .or(z.literal(""));

export const phoneSchema = z
  .string()
  .regex(/^\+?[1-9]\d{9,14}$/, "Enter a valid mobile number with country code");

export const idParamSchema = z.string().uuid();
