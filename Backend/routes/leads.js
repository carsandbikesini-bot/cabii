const router = require("express").Router();
const Lead = require("../models/Lead");   // ✅ FIXED
// const Dealer = require("../models/Dealer"); // future use
// const axios = require("axios"); // BankSathi ke time enable karna

// ================= APPLY LOAN API =================
router.post("/", async (req, res) => {
  try {
    const { name, mobile, city, amount } = req.body;

    // 🔐 Basic validation
    if (!name || !mobile || !city || !amount) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields"
      });
    }

    // 1️⃣ SAVE LEAD IN DB
    const lead = await Lead.create({
      name,
      mobile,
      city,
      amount,
      source: "CABII"
    });

    // 2️⃣ BANKSATHI INTEGRATION (ENABLE AFTER APPROVAL)
    /*
    await axios.post(
      "https://banksathi-partner-url",
      {
        name,
        mobile,
        city,
        amount,
        source: "CABII"
      },
      {
        headers: {
          Authorization: "Bearer YOUR_API_KEY",
          "Content-Type": "application/json"
        }
      }
    );
    */

    // 3️⃣ RESPONSE
    res.json({
      success: true,
      message: "Lead submitted successfully",
      leadId: lead._id
    });

  } catch (error) {
    console.error("Lead Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

module.exports = router;