const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Notification = require("../models/Notification");
const multer = require("multer");
const path = require("path");


const storage = multer.diskStorage({

  destination: function (req, file, cb) {

    cb(null, "uploads/");

  },

  filename: function (req, file, cb) {

    const uniqueName =
      Date.now() +
      path.extname(file.originalname);

    cb(null, uniqueName);

  }

});

const upload = multer({
  storage
});


// Register API
router.post(
  "/register",
  upload.single("nidImage"),
  async (req, res) => {

    try {

      const {
        name,
        email,
        phone,
        password,
        role,
        nidNumber,
        district,
        area
      } = req.body;

      const nidImage =
        req.file
          ? `http://localhost:3000/uploads/${req.file.filename}`
          : "";

      const existingNid =
        await User.findOne({
          nidNumber
        });

if (existingNid) {
  return res.status(400).json({
    message: "NID already used"
  });
}
const existingEmail = await User.findOne({
  email
});

if (existingEmail) {
  return res.status(400).json({
    message: "Email already exists"
  });
}
        const user = new User({
            name,
  email,
  phone,
  password,

  role,

  nidNumber,

  nidImage,

  district,
  area,

  isVerified:
  role === "admin",

verificationStatus:
  role === "admin"
    ? "verified"
    : "pending"
        });

        await user.save();

        // Emit real-time update
        const io = req.app.get("io");
        io?.emit("user:registered", user);

        res.json({ message: "User registered successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post("/login", async (req, res) => {
    try {
        const { email, phone, password } = req.body;

        const user = await User.findOne({
        $or: [
         email ? { email: email } : null,
    phone ? { phone: phone } : null
  ].filter(Boolean)
});

        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        if (user.password !== password) {
            return res.status(400).json({ message: "Wrong password" });
        }
        if (!user.isVerified) {

  return res.status(403).json({

    message:
      "Your account is pending admin verification"

  });

}
        // BLOCK CHECK
if (user.isBlocked) {

  if (
    user.blockedUntil &&
    new Date() > new Date(user.blockedUntil)
  ) {

    user.isBlocked = false;
    user.warningCount = 0;
    user.blockedUntil = null;

    await user.save();

  }

  else {

    return res.status(403).json({

      message:
        `You are blocked until ${new Date(
          user.blockedUntil
        ).toDateString()}`

    });

  }

}

        res.json({
            message: "Login successful",
            user
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// See all the users(for admin)
router.get("/", async (req, res) => {
  const users = await User.find();
  res.json(users);
});

// BLOCK USER
router.put("/block/:id", async (req, res) => {
  const { days } = req.body;

  const blockedUntil = new Date();
  blockedUntil.setDate(blockedUntil.getDate() + days);

  const user = await User.findByIdAndUpdate(
    req.params.id,
    {
      isBlocked: true,
      blockedUntil
    },
    { new: true }
  );

  // Emit real-time update
  global.io?.emit("user:blocked", user);

  res.json(user);
});
//UNBLOCK USER
router.put("/unblock/:id", async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    {
      isBlocked: false,
      blockedUntil: null,
      warningCount: 0
    },
    { new: true }
  );

  // Emit real-time update
  global.io?.emit("user:unblocked", user);

  res.json(user);
});
// WARN USER
router.put("/warn/:id", async (req, res) => {

  try {

    const user = await User.findById(req.params.id);

    if (!user) {

      return res.status(404).json({
        message: "User not found"
      });

    }

    // increase warning
    user.warningCount += 1;

    let notificationTitle =
      "Warning From Admin";

    let notificationMessage =
      "You received a warning from admin.";

    // SECOND WARNING
    if (user.warningCount === 2) {

      notificationMessage =
        "You received 2 warnings. One more warning will block your account for 5 days.";

    }

    // THIRD WARNING = BLOCK
    if (user.warningCount >= 3) {

      const blockedUntil = new Date();

      blockedUntil.setDate(
        blockedUntil.getDate() + 5
      );

      user.isBlocked = true;
      user.blockedUntil = blockedUntil;

      notificationTitle =
        "Account Blocked";

      notificationMessage =
        "Your account has been blocked for 5 days.";

    }

    await user.save();

    // CREATE NOTIFICATION
    await Notification.create({

      userId: user._id,

      title: notificationTitle,

      message: notificationMessage,

      type: "warning"

    });

    // Emit real-time update
    global.io?.emit("user:warned", user);

    res.json(user);

  } catch (err) {

    console.log(err);

    res.status(500).json({
      error: err.message
    });

  }

});

// See single user (for admin)
router.get("/:id", async (req, res) => {
  const user = await User.findById(req.params.id);
  res.json(user);
});

//update user profile 
router.put("/:id", async (req, res) => {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(user);
});

//  DELETE USER
router.delete("/:id", async (req, res) => {
  const userId = req.params.id;
  await User.findByIdAndDelete(userId);
  
  // Emit real-time update
  global.io?.emit("user:deleted", { userId });
  
  res.json({ message: "User deleted" });
});

router.put(
  "/verify/:id",
  async (req, res) => {

    try {

      const user =
        await User.findByIdAndUpdate(

          req.params.id,

          {

            isVerified: true,

            verificationStatus:
              "verified"

          },

          { new: true }

        );

      // Emit real-time update
      const io = req.app.get("io");
      io?.emit("user:verified", user);

      res.json(user);

    } catch (err) {

      res.status(500).json({
        error: err.message
      });

    }

  }
);

module.exports = router;