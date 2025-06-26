import { NextFunction, Request, Response } from "express";
import { loginSchema, registerSchema } from "@/schemas/auth.schema";
import { ZodError } from "zod";
import { User } from "@/models/user";
import { generateToken } from "@/utils/jwt";
import { hashPassword } from "@/utils/hast";
import bcrypt from "bcrypt";
import { AppError } from "@/domain/errors/AppError";

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const validationResult = registerSchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: validationResult.error.errors,
      });
    }

    const { firstName, lastName, email, username, password, pic } =
      validationResult.data;

    const hashed = await hashPassword(password);

    const displayName = `${firstName} ${lastName}`;

    const userExists = await User.findOne({ email });

    if (userExists) {
      throw new AppError("Email already exists", 409);
    }

    const user = await User.create({
      firstName,
      lastName,
      email,
      password: hashed,
      username,
      displayName,
      pic,
    });

    return res.status(201).json({
      message: "Registered successfully",
      data: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        username: user.username,
        displayName: user.displayName,
        pic: user.pic,
        token: generateToken(user._id as string),
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Something went wrong",
      error: error instanceof Error ? error.message : error,
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const validationResult = loginSchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: validationResult.error.errors,
      });
    }

    const { email, password } = validationResult.data;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid user credentials" });
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      String(user.password)
    );
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    return res.status(200).json({
      message: "Login successful",
      data: {
        email: user.email,
        token: generateToken(user._id as string),
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Error occurred while login",
      error: error instanceof Error ? error.message : error,
    });
  }
};
