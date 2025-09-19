require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");
const express = require("express");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// ✅ Initialize bot in webhook mode
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN);
bot.setWebHook(`${process.env.WEBHOOK_URL}/bot${process.env.TELEGRAM_BOT_TOKEN}`);

// ✅ Services
const services = [
  { id: 1, name: "📝 Training — Transcription", price: 1500 },
  { id: 2, name: "🔗 Transcription Application Link", price: 500 },
  { id: 3, name: "🌍 Exclusive Remote Work Application Links", price: 2000 },
  { id: 4, name: "📚 Training — How to Apply to Remote Work Account", price: 1800 },
  { id: 5, name: "🛡️ Strong Proxies (All Countries)", price: 2500 },
  { id: 6, name: "📦 Fullu", price: 3000 },
  { id: 7, name: "📞 USA Numbers", price: 1000 },
];

// Track user states
const userState = {};

// ✅ Show main menu
function showMainMenu(chatId) {
  const buttons = services.map((s) => [
    { text: `${s.name} — Ksh ${s.price}`, callback_data: `service_${s.id}` },
  ]);

  buttons.push([{ text: "💬 Contact Support", url: "https://t.me/Luqman2893" }]);

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

// ✅ Handle text messages
bot.on("message", (msg) => {
  const chatId = msg.chat.id;

  // If expecting phone input
  if (userState[chatId]?.step === "enterPhone") {
    const text = msg.text.trim();
    if (/^2547\d{8}$/.test(text)) {
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
      bot.sendMessage(chatId, "⚠️ Invalid number format! Use *2547XXXXXXXX*", {
        parse_mode: "Markdown",
      });
    }
    return;
  }

  // If expecting proof of payment but user typed text
  if (userState[chatId]?.step === "awaitingProof" && msg.text) {
    bot.sendMessage(chatId, "⚠️ Please upload a *screenshot/photo* of your payment as proof.");
    return;
  }

  if (!userState[chatId]) {
    showMainMenu(chatId);
  }
});

// ✅ Handle photos (proof of payment)
bot.on("photo", async (msg) => {
  const chatId = msg.chat.id;

  if (userState[chatId]?.step === "awaitingProof") {
    const photos = msg.photo;
    const fileId = photos[photos.length - 1].file_id;

    // Get file link
    const fileUrl = await bot.getFileLink(fileId);

    bot.sendMessage(chatId, "✅ Thank you! Your proof of payment has been received. Our support team will verify shortly.");

    // Forward proof to admin
    bot.sendMessage(
      process.env.ADMIN_CHAT_ID,
      `📩 Proof of payment received from user *${msg.from.username || msg.from.first_name}*.\n\nService: ${userState[chatId].service.name}\nAmount: ${userState[chatId].service.price} Ksh\n\nScreenshot: ${fileUrl}`,
      { parse_mode: "Markdown" }
    );

    delete userState[chatId];
  } else {
    bot.sendMessage(chatId, "📸 I received your photo. If it’s proof of payment, please select a service first.");
  }
});

// ✅ Handle button clicks
bot.on("callback_query", async (query) => {
  const chatId = query.message.chat.id;
  const data = query.data;

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

  if (data === "pay_mpesa") {
    userState[chatId].step = "enterPhone";
    bot.sendMessage(chatId, "📱 Please enter your M-Pesa phone number (format: 2547XXXXXXXX)", {
      parse_mode: "Markdown",
    });
  }

  if (data === "pay_crypto") {
    userState[chatId].step = "awaitingProof";
    bot.sendMessage(
      chatId,
      "🪙 *Crypto Payments*\n\nSend the amount to:\n\n" +
        "BTC: `1ABCyourBTCwallet`\n" +
        "USDT (TRC20): `TGyourTRC20wallet`\n\n" +
        "📸 After payment, upload a *screenshot* here as proof.",
      { parse_mode: "Markdown" }
    );
  }

  if (data.startsWith("confirmPhone_")) {
    const phone = data.split("_")[1];
    const service = userState[chatId].service;
    sendStkPush(chatId, phone, service);
    delete userState[chatId];
  }

  if (data === "changePhone") {
    userState[chatId].step = "enterPhone";
    bot.sendMessage(chatId, "🔁 Please re-enter your phone number (2547XXXXXXXX).");
  }
});

// ✅ Send STK Push
async function sendStkPush(chatId, phone, service) {
  bot.sendMessage(chatId, `💳 Sending payment request of *Ksh ${service.price}* to *${phone}*...`, {
    parse_mode: "Markdown",
  });

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
      bot.sendMessage(chatId, `📲 STK Push sent! Enter your M-Pesa PIN to complete.`);
    } else {
      handleFailedPayment(chatId);
    }
  } catch (err) {
    console.error("STK Push Error:", err.response ? err.response.data : err.message);
    handleFailedPayment(chatId);
  }
}

// ✅ Handle failed payment
function handleFailedPayment(chatId) {
  bot.sendMessage(chatId, "❌ Payment request failed. Do you want to try again?", {
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
  res.json({ status: "ok" });
});

// ✅ Start express server
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
