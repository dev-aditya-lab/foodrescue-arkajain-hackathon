import express from "express";
import { identifyUser } from "../middleware/auth.middleware.js";
import {
  getMyNotifications,
  getUnreadNotificationCount,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "../controllers/notification.controller.js";

const notificationRouter = express.Router();

notificationRouter.get("/", identifyUser, getMyNotifications);
notificationRouter.get("/unread-count", identifyUser, getUnreadNotificationCount);
notificationRouter.patch("/read-all", identifyUser, markAllNotificationsAsRead);
notificationRouter.patch("/:notificationId/read", identifyUser, markNotificationAsRead);

export default notificationRouter;
