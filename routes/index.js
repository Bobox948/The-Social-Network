const express = require("express");
const router = express.Router();

// Require controller modules.
const user_controller = require("../controllers/userController");

const message_controller = require("../controllers/messageController");

/// item ROUTES ///

router.get("/", user_controller.index);

router.get("/sign-up", user_controller.user_create_get);

router.post("/sign-up", user_controller.user_create_post);

router.post("/log-in", user_controller.user_login_post);

router.get("/log-out", user_controller.user_logout_get);

router.get("/update", message_controller.update_message_get);

router.post("/update", message_controller.update_message_post);

router.get("/create", message_controller.create_message_get);

router.post("/create", message_controller.create_message_post);

router.post("/delete", message_controller.delete_message_post);

router.get("/search", user_controller.user_search_get);

router.post("/add", user_controller.add_friend_post);

router.post("/accept", user_controller.accept_friend_post);

router.post("/decline", user_controller.decline_friend_post);

router.get("/user/:id", user_controller.user_detail);

router.post("/like", message_controller.like_message_post);

router.post("/unlike", message_controller.unlike_message_post);

router.post("/comment", message_controller.comment_message_post);

router.get("/messages", message_controller.messages_get);

router.post("/messages", message_controller.messages_post);


module.exports = router;
