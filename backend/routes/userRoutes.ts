import { getAllUsers, allUsers } from "@/controllers/userController";
import express, { Handler, RequestHandler } from "express";
import { authenticate } from "@/middlewares/authMiddleware";

const router = express.Router();

router.get("/users", getAllUsers as RequestHandler);

router.get("/user", authenticate as Handler, allUsers);

export default router;
