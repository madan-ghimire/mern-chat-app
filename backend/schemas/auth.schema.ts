import { z } from "zod";

export const registerSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  username: z.string().min(1, "Username is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  pic: z
    .string()
    .url("Invalid picture URL")
    .optional()
    .default(
      "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg"
    ),
});

// 🔑 Login schema: only email + password are required
export const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

// 🧠 Inferred types for reuse
export type Register = z.infer<typeof registerSchema>;
export type Login = z.infer<typeof loginSchema>;
