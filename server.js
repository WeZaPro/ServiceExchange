require("dotenv").config();
const express = require("express");
const fetch = require("node-fetch");
const cron = require("node-cron");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3001; // ใช้จาก .env ได้เช่นกัน

// === ฟังก์ชันหลัก ===
async function fetchAndForwardExchangeRate() {
  try {
    const url = `https://v6.exchangerate-api.com/v6/${process.env.API_KEY}/latest/USD`;
    const res = await fetch(url);
    const data = await res.json();

    if (
      data.result === "success" &&
      data.conversion_rates &&
      data.conversion_rates.THB
    ) {
      const rateTHB = data.conversion_rates.THB;

      const payload = {
        base: "USD",
        target: "THB",
        rate: rateTHB,
        timestamp: new Date().toISOString(),
      };

      console.log("📤 ส่งข้อมูล payload ไปยัง API ภายนอก:", payload);

      const response = await axios.post(process.env.EXTERNAL_API_URL, payload);
      console.log("✅ ส่งสำเร็จ:", response.data);
      return { status: "success", rate: rateTHB, response: response.data };
    } else {
      console.error("❌ ไม่พบค่าเงิน THB");
      return { status: "error", message: "THB not found in rates" };
    }
  } catch (err) {
    console.error("❌ Error:", err.message);
    return { status: "error", message: err.message };
  }
}

// === API Endpoint ===
app.get("/fetch-now", async (req, res) => {
  const result = await fetchAndForwardExchangeRate();
  res.json(result);
});

// === Cron job (รันทุกวัน 13:35) ===
// cron.schedule("35 13 * * *", () => {
//   console.log("⏰ [CRON] กำลังดึงค่าเงิน...");
//   fetchAndForwardExchangeRate();
// });

// === Start server ===
app.listen(PORT, () => {
  console.log(`📡 ดึงค่าเงินรันที่ http://localhost:${PORT}`);
});
