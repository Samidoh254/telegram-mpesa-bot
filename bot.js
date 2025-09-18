require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");
const express = require("express");

const app = express();
app.use(express.json());

// ✅ Start server for M-Pesa callbacks
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});

// 🔹 Initialize Telegram Bot
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

// 🔹 Services
const services = [
  { id: 1, name: "📝 Training — Transcription", price: 1500 },
  { id: 2, name: "🔗 Transcription Application Link", price: 500 },
  { id: 3, name: "🌍 Exclusive Remote Work Application Links", price: 2000 },
  { id: 4, name: "📚 Training — How to Apply to Remote Work Account", price: 1800 },
  { id: 5, name: "🛡️ Strong Proxies (All Countries)", price: 2500 },
  { id: 6, name: "📦 Fullu", price: 3000 },
  { id: 7, name: "📞 USA Numbers", price: 1000 },
];

// 🔹 Track user flow
const userState = {};

// ✅ Main Menu
function showMainMenu(chatId) {
  const buttons = services.map((s) => [
    { text: `${s.name} — Ksh ${s.price}`, callback_data: `service_${s.id}` },
  ]);

  // Extra buttons
  buttons.push([{ text: "💬 Contact Support", url: "https://t.me/TokyoKenya" }]);

  bot.sendMessage(
    chatId,
    "👋 Welcome to *Echo Labs Services Bot*!\n\nPlease select a service below:",
    {
      parse_mode: "Markdown",
      reply_markup: { inline_keyboard: buttons },
    }
  );

  userState[chatId] = { step: "chooseService" };
}

// ✅ Always reset to menu when random text is typed (unless expecting phone)
bot.on("message", (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text.trim();

  // If expecting phone input
  if (userState[chatId]?.step === "enterPhone") {
    if (/^2547\d{8}$/.test(text)) {
      // ✅ Valid phone
      const service = userState[chatId].service;
      userState[chatId].phone = text;

      bot.sendMessage(chatId, `📱 You entered *${text}*.\nIs this correct?`, {
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [{ text: "✅ Yes", callback_data: `confirmPhone_${text}` }],
            [{ text: "✏️ Change", callback_data: "changePhone" }],
          ],
        },
      });
    } else {
      // ❌ Invalid phone
      bot.sendMessage(
        chatId,
        "⚠️ Invalid number format!\n\nPlease enter in format: *2547XXXXXXXX*",
        { parse_mode: "Markdown" }
      );
    }
    return;
  }

  // If expecting something else (like payment choice) → ignore free text
  if (userState[chatId]?.step && userState[chatId].step !== "enterPhone") {
    showMainMenu(chatId);
    return;
  }

  // New user → show menu
  if (!userState[chatId]) {
    showMainMenu(chatId);
  }
});

// ✅ Handle button clicks
bot.on("callback_query", async (query) => {
  const chatId = query.message.chat.id;
  const data = query.data;

  // Restart flow
  if (data === "restart_yes") {
    showMainMenu(chatId);
    return;
  }
  if (data === "restart_no") {
    bot.sendMessage(chatId, "👍 Okay! You can come back anytime.");
    delete userState[chatId];
    return;
  }

  // Service selection → ask payment method
  if (data.startsWith("service_")) {
    const serviceId = parseInt(data.split("_")[1]);
    const service = services.find((s) => s.id === serviceId);
    if (!service) return;

    userState[chatId] = { step: "choosePayment", service };

    bot.sendMessage(chatId, `✅ You selected *${service.name}* (Ksh ${service.price}).\n\n💳 Choose your payment method:`, {
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [{ text: "📲 M-Pesa", callback_data: "pay_mpesa" }],
          [{ text: "🪙 Binance / Crypto", callback_data: "pay_crypto" }],
        ],
      },
    });
  }

  // M-Pesa chosen → ask phone
  if (data === "pay_mpesa") {
    userState[chatId].step = "enterPhone";
    bot.sendMessage(chatId, "📱 Please enter your M-Pesa phone number in format: *2547XXXXXXXX*", {
      parse_mode: "Markdown",
    });
  }

  // Crypto chosen → show wallet address
  if (data === "pay_crypto") {
    bot.sendMessage(
      chatId,
      "🪙 *Crypto Payments*\n\nPlease send the amount to our wallet:\n\nBTC: `1ABCyourBTCwallet`\nUSDT (TRC20): `TGyourTRC20wallet`\n\nOnce sent, contact support with transaction proof.",
      { parse_mode: "Markdown" }
    );
    showMainMenu(chatId);
  }

  // Confirm phone
  if (data.startsWith("confirmPhone_")) {
    const [_, phone] = data.split("_");
    const service = userState[chatId].service;

    sendStkPush(chatId, phone, service);
    delete userState[chatId];
  }

  if (data === "changePhone") {
    userState[chatId].step = "enterPhone";
    bot.sendMessage(chatId, "🔁 Please re-enter your phone number (2547XXXXXXXX).");
  }
});

// ✅ Function to send STK Push
async function sendStkPush(chatId, phone, service) {
  bot.sendMessage(
    chatId,
    `💳 Sending payment request of *Ksh ${service.price}* to *${phone}*...\nPlease check your phone and enter your M-Pesa PIN.`,
    { parse_mode: "Markdown" }
  );

  try {
    const authResponse = await axios.get(
      "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
      {
        auth: {
          username: process.env.MPESA_CONSUMER_KEY,
          password: process.env.MPESA_CONSUMER_SECRET,
        },
      }
    );

    const token = authResponse.data.access_token;
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, "").slice(0, 14);

    const password = Buffer.from(
      process.env.MPESA_SHORTCODE + process.env.MPESA_PASSKEY + timestamp
    ).toString("base64");

    const stkResponse = await axios.post(
      "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
      {
        BusinessShortCode: process.env.MPESA_SHORTCODE,
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerPayBillOnline",
        Amount: service.price,
        PartyA: phone,
        PartyB: process.env.MPESA_SHORTCODE,
        PhoneNumber: phone,
        CallBackURL: process.env.MPESA_CALLBACK_URL,
        AccountReference: "EchoLabsBot",
        TransactionDesc: service.name,
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (stkResponse.data.ResponseCode === "0") {
      bot.sendMessage(chatId, `📲 STK Push sent!\n👉 Complete the payment on your phone.`);
    } else {
      handleFailedPayment(chatId);
    }
  } catch (err) {
    console.error("STK Push Error:", err.response ? err.response.data : err.message);
    handleFailedPayment(chatId);
  }
}

// ✅ Handle failed/canceled payment
function handleFailedPayment(chatId) {
  bot.sendMessage(chatId, "❌ Payment request failed or canceled. Do you want to restart?", {
    reply_markup: {
      inline_keyboard: [
        [{ text: "🔄 Yes", callback_data: "restart_yes" }],
        [{ text: "❌ No", callback_data: "restart_no" }],
      ],
    },
  });
}

// ✅ Callback for payment confirmation
app.post("/callback", (req, res) => {
  console.log("📩 M-Pesa Callback:", JSON.stringify(req.body, null, 2));

  const result = req.body?.Body?.stkCallback?.ResultCode;

  if (result === 0) {
    // Payment success
    const chatId = Object.keys(userState)[0]; // in real system, map properly
    if (chatId) {
      bot.sendMessage(
        chatId,
        `✅ Payment received successfully!\n\nThank you for purchasing. Our support team will contact you shortly.`,
        { parse_mode: "Markdown" }
      );
      showMainMenu(chatId);
    }
  } else {
    const chatId = Object.keys(userState)[0];
    if (chatId) handleFailedPayment(chatId);
  }

  res.json({ status: "ok" });
});
