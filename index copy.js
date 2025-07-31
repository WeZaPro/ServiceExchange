// server-fetch-send.js
require("dotenv").config();
const express = require("express");
const fetch = require("node-fetch");
const cron = require("node-cron");
const axios = require("axios");

const app = express();
const PORT = 3001; // พอร์ตฝั่ง A

// ฟังก์ชันดึงค่าเงิน และส่งไป API ภายนอก
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

      // ส่งไปยัง API ภายนอก
      const payload = {
        base: "USD",
        target: "THB",
        rate: rateTHB,
        timestamp: new Date().toISOString(),
      };

      console.log("📤 ส่งข้อมูล payload ไปยัง API ภายนอก:", payload);

      const response = await axios.post(process.env.EXTERNAL_API_URL, payload);
      console.log("📤 ส่งข้อมูลไปยัง API ภายนอก:", response.data);
    } else {
      console.error("❌ ไม่พบค่าเงิน THB");
    }
  } catch (err) {
    console.error("❌ Error:", err.message);
  }
}

// Cron: ทุกวัน 00:00
// cron.schedule("0 0 * * *", fetchAndForwardExchangeRate);

//รันทุกวันเวลา 13:10 (บ่าย 1 โมง 10 นาที)
cron.schedule("35 13 * * *", fetchAndForwardExchangeRate);

//รัน ทุก 2 ชั่วโมง
// cron.schedule("0 */2 * * *", fetchAndForwardExchangeRate);

app.listen(PORT, () => {
  console.log(`📡 Service A ดึงค่าเงินรันที่ http://localhost:${PORT}`);
});
