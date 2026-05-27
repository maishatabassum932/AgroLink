const express = require("express");
const router = express.Router();

const Notification = require("../models/Notification");

// MARK AS READ (must come BEFORE generic /:userId route)
router.put("/read/:userId", async (req, res) => {

  try {

    await Notification.updateMany(
      {
        userId: req.params.userId,
        isRead: false
      },
      {
        isRead: true
      }
    );

    res.json({
      message: "Notifications marked as read"
    });

  } catch (err) {

    res.status(500).json({
      error: err.message
    });

  }

});

// GET USER NOTIFICATIONS
router.get("/:userId", async (req, res) => {

  try {

    const notifications =
      await Notification.find({
        userId: req.params.userId
      })
      .sort({ createdAt: -1 });

    res.json(notifications);

  } catch (err) {

    res.status(500).json({
      error: err.message
    });

  }

});

module.exports = router;