// import { getAllUsers, allUsers } from "@/controllers/userController";
import express, { Handler, RequestHandler } from "express";
import { authenticate } from "@/middlewares/authMiddleware";

const router = express.Router();

router.post("/", authenticate as Handler, accessChat as RequestHandler);

router.get("/", authenticate as Handler, fetchChats as RequestHandler);

router.post("/group", authenticate as Handler, createGroupChat);

export default router;
