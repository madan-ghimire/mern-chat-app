import { NextFunction, Request, Response } from "express";
import { loginSchema, registerSchema } from "@/schemas/auth.schema";
import User from "../models/userModel";
import { generateToken } from "@/utils/jwt";

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

    console.log('Original password during registration:', password);
    const displayName = `${firstName} ${lastName}`;

    const userExists = await User.findOne({ email });

    if (userExists) {
      throw new AppError("Email already exists", 409);
    }

    const user = await User.create({
      firstName,
      lastName,
      email,
      password, 
      displayName,
      username,
      pic: pic || 'https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg',
      isAdmin: false
    });

    return res.status(201).json({
      message: "Registered successfully",
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        email: user.email,
        pic: user.pic,
        isAdmin: user.isAdmin,
      },
      token: generateToken(user._id.toString(), user.username, user.email)
    });
  } catch (error) {
    console.log(error);
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

    console.log("check user", user)

    console.log('Password from login request:', password);
    console.log('Stored hashed password:', user.password);
    
    // Use the matchPassword method from the user model
    const isPasswordCorrect = await user.matchPassword(password);
    
    console.log('Password match result:', isPasswordCorrect);
    
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    return res.status(200).json({
      message: "Login successful",
      data: {
        isAdmin: user.isAdmin,
        token: generateToken(user._id.toString(), user.username, user.email)
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Error occurred while login",
      error: error instanceof Error ? error.message : error,
    });
  }
};
