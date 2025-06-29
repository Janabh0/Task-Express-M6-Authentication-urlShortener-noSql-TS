import { NextFunction, Request, Response } from "express";
import User from "../../models/User";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export const signup = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Hash the password using bcrypt with 10 salt rounds
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    // Create user with hashed password
    const newUser = await User.create({
      ...req.body,
      password: hashedPassword,
    });

    // Create JWT token
    const token = jwt.sign(
      { userId: newUser._id, username: newUser.username },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.status(201).json({ user: newUser, token });
  } catch (err) {
    next(err);
  }
};

export const signin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Find user by username
    const user = await User.findOne({ username: req.body.username });

    if (!user) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    // Compare password with stored hash
    const isPasswordValid = await bcrypt.compare(
      req.body.password,
      user.password || ""
    );

    if (!isPasswordValid) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, username: user.username },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({ user, token });
  } catch (err) {
    next(err);
  }
};

export const getUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const users = await User.find().populate("urls");
    res.status(201).json(users);
  } catch (err) {
    next(err);
  }
};
