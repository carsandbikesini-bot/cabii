const axios = require("axios");
const dealers = require("../config/mumbaiDealers");

module.exports = async function sendWhatsApp(ad) {
  const url = `https://graph.facebook.com/v18.0/${process.env.WHATSAPP_PHONE_ID}/messages`;

  const message = `
🚗 *48H GUARANTEED VEHICLE*

Brand: ${ad.brand}
Model: ${ad.model}
Price: ₹${ad.price}
City: ${ad.location}

⏱ Valid for 48 Hours
📞 Seller Contact: ${ad.contactNumber}
`;

  for (let number of dealers) {
    try {
      await axios.post(url, {
        messaging_product: "whatsapp",
        to: number,
        type: "text",
        text: { body: message }
      }, {
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
          "Content-Type": "application/json"
        }
      });
    } catch (err) {
      console.log("WhatsApp failed:", number);
    }
  }
};