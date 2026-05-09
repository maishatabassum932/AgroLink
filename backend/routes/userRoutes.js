const express = require("express");
const router = express.Router();
const User = require("../models/User");

// Register API
router.post("/register", async (req, res) => {
    try {
        const { name, email, phone, password, role, nidNumber, district, area } = req.body;
         const existingNid = await User.findOne({ nidNumber});

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
            district,
            area
        });

        await user.save();

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
        if (user.isBlocked && user.blockedUntil && new Date(user.blockedUntil) > new Date()) {
      return res.status(403).json({
        message: `You are blocked until ${new Date(user.blockedUntil).toDateString()}`
    });
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

  res.json(user);
});
// WARN USER
router.put("/warn/:id", async (req, res) => {
  const user = await User.findById(req.params.id);

  user.warningCount += 1;

  // Auto block after 3 warnings
  if (user.warningCount >= 3) {
    user.isBlocked = true;

    const blockedUntil = new Date();
    blockedUntil.setDate(blockedUntil.getDate() + 5); // auto 5 days
    user.blockedUntil = blockedUntil;
  }

  await user.save();

  res.json(user);
});

//  DELETE USER
router.delete("/:id", async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: "User deleted" });
});

module.exports = router;