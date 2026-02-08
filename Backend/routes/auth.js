const express = require("express");
const router = express.Router();

<<<<<<< HEAD
router.get("/check-session", (req, res) => {
  if (req.session && req.session.userId) {
    return res.json({ userId: req.session.userId });
  }
  return res.status(401).json({ message: "Not logged in" });
});

=======
>>>>>>> 7d06af8fae8d8ceb290ce443e9eef383d840faea
/* =================================
   PUBLIC LOGIN (NO VALIDATION)
================================= */
router.post("/login", (req, res) => {
  const { email } = req.body;

  // 🔓 Public session
  req.session.userId = "public-user";

  res.json({
    success: true,
    user: {
      name: "Guest User",
      email: email || "guest@cabii.in"
    }
  });
});

<<<<<<< HEAD

=======
>>>>>>> 7d06af8fae8d8ceb290ce443e9eef383d840faea
/* =================================
   PUBLIC SIGNUP (OPTIONAL)
================================= */
router.post("/signup", (req, res) => {
  const { name, email } = req.body;

  req.session.userId = "public-user";

  res.json({
    success: true,
    user: {
      name: name || "Guest User",
      email: email || "guest@cabii.in"
    }
  });
});

<<<<<<< HEAD
module.exports = router;
=======
module.exports = router;
>>>>>>> 7d06af8fae8d8ceb290ce443e9eef383d840faea
