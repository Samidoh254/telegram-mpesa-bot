// bot.js — complete Telegram + M-Pesa bot
require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");
const express = require("express");

// ---------- Basic config ----------
const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
if (!TELEGRAM_TOKEN) {
  console.error("ERROR: TELEGRAM_BOT_TOKEN is not set in env");
  process.exit(1);
}
const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });
const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const SUPPORT_USERNAME = process.env.SUPPORT_TELEGRAM_USERNAME || "Luqman2893"; // no @
const SUPPORT_CHAT_ID = process.env.SUPPORT_CHAT_ID || null; // optional numeric id or channel @name (if available)

// ---------- Services list (edit prices here) ----------
const services = [
  { id: 1, name: "📝 Training — Transcription", price: 1500 },
  { id: 2, name: "🔗 Transcription Application Link", price: 500 },
  { id: 3, name: "🌍 Exclusive Remote Work Application Links", price: 2000 },
  { id: 4, name: "📚 Training — How to Apply to Remote Work Account", price: 1800 },
  { id: 5, name: "🛡️ Strong Proxies (All Countries)", price: 2500 },
  { id: 6, name: "📦 Fullu", price: 3000 },
  { id: 7, name: "📞 USA Numbers", price: 1000 },
];

// ---------- In-memory maps (simple) ----------
const userState = {}; // chatId -> { step, service, phone, orderId, ... }
const pendingCheckout = {}; // checkoutRequestId -> { chatId, service, orderId }

// ---------- Helpers ----------
function generateOrderId() {
  return "ORD" + Date.now().toString().slice(-8);
}

function showMainMenu(chatId) {
  const keyboard = services.map((s) => [
    { text: `${s.name} — Ksh ${s.price}`, callback_data: `service_${s.id}` },
  ]);
  keyboard.push([
    { text: "📋 View Services", callback_data: "view_services" },
    { text: "💬 Contact Support", url: `https://t.me/${SUPPORT_USERNAME}` },
  ]);

  bot.sendMessage(
    chatId,
    "👋 *Welcome to Echo Labs Services Bot!*\n\nPlease select a service below:",
    {
      parse_mode: "Markdown",
      reply_markup: { inline_keyboard: keyboard },
    }
  );

  userState[chatId] = { step: "chooseService" };
}

// Normalize and validate phone numbers
function normalizePhone(input) {
  if (!input) return null;
  const digits = input.replace(/\D/g, ""); // remove non-digits
  // Accept 07XXXXXXXX, 7XXXXXXXX, 2547XXXXXXXX
  if (/^2547\d{8}$/.test(digits)) return digits;
  if (/^07\d{8}$/.test(digits)) return "254" + digits.slice(1);
  if (/^7\d{8}$/.test(digits)) return "254" + digits;
  return null;
}

// Send notification to support (if SUPPORT_CHAT_ID provided) else just attempt to send to username link
async function notifySupport(text, extra = {}) {
  try {
    if (SUPPORT_CHAT_ID) {
      await bot.sendMessage(SUPPORT_CHAT_ID, text, extra);
    } else {
      // best-effort: send to the username (works if the user has started the bot or it's a channel)
      await bot.sendMessage(`@${SUPPORT_USERNAME}`, text, extra);
    }
  } catch (err) {
    console.warn("notifySupport failed:", err.message || err.toString());
  }
}

// ---------- Command & message handlers ----------

// Accept any message (not only /start) as "start" unless we are in phone entry step
bot.on("message", (msg) => {
  const chatId = msg.chat.id;
  const text = (msg.text || "").trim();

  // If user is asked to send phone number
  if (userState[chatId]?.step === "enterPhone") {
    // if message contains photo/document, ask for phone instead
    if (!text) {
      bot.sendMessage(chatId, "⚠️ Please type your phone number in the format *2547XXXXXXXX* (no letters).", {
        parse_mode: "Markdown",
      });
      return;
    }
    const normalized = normalizePhone(text);
    if (!normalized) {
      bot.sendMessage(chatId, "❌ Invalid phone number.\nPlease enter *2547XXXXXXXX* or *07XXXXXXXX*.", {
        parse_mode: "Markdown",
      });
      return;
    }
    // Valid phone
    userState[chatId].phone = normalized;
    const service = userState[chatId].service;
    bot.sendMessage(chatId, `📱 You entered *${normalized}* for *${service.name}* (Ksh ${service.price}).\nIs this correct?`, {
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [{ text: "✅ Yes — Pay with M-Pesa", callback_data: `confirmPhone_${normalized}` }],
          [{ text: "✏️ Change number", callback_data: "changePhone" }],
          [{ text: "❌ Cancel", callback_data: "restart_yes" }],
        ],
      },
    });
    return;
  }

  // If awaiting proof upload: allow only photo/documents — if user types text, restart flow as requested
  if (userState[chatId]?.step === "awaitingProof") {
    // user typed text instead of uploading proof -> restart per your requirement
    showMainMenu(chatId);
    return;
  }

  // If user typed anything while in some other step, restart menu per your requirement
  if (userState[chatId]?.step && userState[chatId].step !== "enterPhone") {
    showMainMenu(chatId);
    return;
  }

  // New/idle user — show menu
  if (!userState[chatId]) {
    showMainMenu(chatId);
    return;
  }

  // If user clicked buttons and we already replied, nothing else to do
});

// /start as well (for users who do type it)
bot.onText(/\/start/, (msg) => {
  showMainMenu(msg.chat.id);
});

// ---------- Inline callbacks ----------
bot.on("callback_query", async (query) => {
  const chatId = query.message.chat.id;
  const data = query.data;

  // Restart flow
  if (data === "restart_yes" || data === "restart") {
    showMainMenu(chatId);
    return bot.answerCallbackQuery(query.id);
  }
  if (data === "restart_no") {
    bot.sendMessage(chatId, "👍 Okay! You can come back anytime.");
    delete userState[chatId];
    return bot.answerCallbackQuery(query.id);
  }

  // View services -> just re-show services
  if (data === "view_services") {
    showMainMenu(chatId);
    return bot.answerCallbackQuery(query.id);
  }

  // Service selection
  if (data.startsWith("service_")) {
    const id = parseInt(data.split("_")[1], 10);
    const service = services.find((s) => s.id === id);
    if (!service) return bot.answerCallbackQuery(query.id, { text: "Service not found" });

    userState[chatId] = { step: "choosePayment", service };
    const msg = `✅ You selected *${service.name}* (Ksh ${service.price}).\n\n💳 Choose a payment method:`;
    await bot.sendMessage(chatId, msg, {
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [{ text: "📲 M-Pesa", callback_data: "pay_mpesa" }],
          [{ text: "🪙 Binance / Crypto", callback_data: "pay_crypto" }],
          [{ text: "❌ Cancel", callback_data: "restart_yes" }],
        ],
      },
    });
    return bot.answerCallbackQuery(query.id);
  }

  // Payment method: M-Pesa
  if (data === "pay_mpesa") {
    if (!userState[chatId]?.service) {
      showMainMenu(chatId);
      return bot.answerCallbackQuery(query.id);
    }
    userState[chatId].step = "enterPhone";
    await bot.sendMessage(chatId, "📱 Please enter your M-Pesa phone number in one of these formats: *2547XXXXXXXX*, *07XXXXXXXX* or *7XXXXXXXX*.", {
      parse_mode: "Markdown",
    });
    return bot.answerCallbackQuery(query.id);
  }

  // Payment method: Crypto
  if (data === "pay_crypto") {
    if (!userState[chatId]?.service) {
      showMainMenu(chatId);
      return bot.answerCallbackQuery(query.id);
    }
    const service = userState[chatId].service;
    userState[chatId].step = "awaitingProof";
    userState[chatId].orderId = generateOrderId();

    const walletMsg =
      `🪙 *Crypto Payment Instructions*\n\n` +
      `Service: *${service.name}* — *Ksh ${service.price}*\n` +
      `Order ID: \`${userState[chatId].orderId}\`\n\n` +
      `Please send the exact amount to one of our wallets below and then upload *proof of payment* (screenshot/txid):\n\n` +
      `• BTC: \`1YourBTCWalletAddressHere\`\n` +
      `• USDT (TRC20): \`TYourTRC20WalletHere\`\n\n` +
      `After you upload proof, our support team will verify and confirm access/delivery.`;

    await bot.sendMessage(chatId, walletMsg, {
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [{ text: "📤 Upload Proof Now", callback_data: "upload_proof" }],
          [{ text: "💬 Contact Support", url: `https://t.me/${SUPPORT_USERNAME}` }],
          [{ text: "❌ Cancel", callback_data: "restart_yes" }],
        ],
      },
    });

    // notify admin (best-effort)
    notifySupport(`🪙 New crypto payment started\nUser: ${chatId}\nService: ${service.name}\nOrder: ${userState[chatId].orderId}`);
    return bot.answerCallbackQuery(query.id);
  }

  // Confirm phone (starts STK Push)
  if (data && data.startsWith("confirmPhone_")) {
    const phone = data.split("_")[1];
    const st = userState[chatId];
    if (!st || !st.service) {
      showMainMenu(chatId);
      return bot.answerCallbackQuery(query.id, { text: "Session expired. Restarting." });
    }
    sendStkPush(chatId, phone, st.service).catch((e) => {
      console.error("sendStkPush error:", e);
      bot.sendMessage(chatId, "Error initiating payment. Please try again later.");
    });
    delete userState[chatId]; // clear (we map via checkout later)
    return bot.answerCallbackQuery(query.id);
  }

  // Upload proof button: just remind user to upload (we also accept photo/doc)
  if (data === "upload_proof") {
    userState[chatId].step = "awaitingProof";
    await bot.sendMessage(chatId, "📤 Please upload your proof (photo or file). Our support team will review it and confirm.");
    return bot.answerCallbackQuery(query.id);
  }

  // Change phone callback
  if (data === "changePhone") {
    userState[chatId].step = "enterPhone";
    await bot.sendMessage(chatId, "🔁 Please re-enter your phone number (2547XXXXXXXX).");
    return bot.answerCallbackQuery(query.id);
  }

  // any other unknown callback
  bot.answerCallbackQuery(query.id);
});

// ---------- Accept file uploads (proof) ----------
bot.on("photo", async (msg) => {
  const chatId = msg.chat.id;
  if (userState[chatId]?.step !== "awaitingProof") {
    // If not expecting proof, treat as normal message -> restart menu
    showMainMenu(chatId);
    return;
  }
  try {
    const photos = msg.photo;
    const best = photos[photos.length - 1];
    const fileId = best.file_id;
    const fileLink = await bot.getFileLink(fileId);
    const orderId = userState[chatId].orderId || "unknown";

    // forward to support (best-effort)
    await notifySupport(`📸 *Payment Proof Received*\nOrder: \`${orderId}\`\nUser: ${chatId}\nPhoto: ${fileLink}`, { parse_mode: "Markdown" });

    await bot.sendMessage(chatId, `✅ Proof received for order \`${orderId}\`. Support will verify and confirm shortly.`, {
      parse_mode: "Markdown",
    });

    // clear state and show menu
    delete userState[chatId];
  } catch (err) {
    console.error("photo handling error:", err);
    bot.sendMessage(chatId, "❌ Could not process the photo. Please try again.");
  }
});

bot.on("document", async (msg) => {
  const chatId = msg.chat.id;
  if (userState[chatId]?.step !== "awaitingProof") {
    showMainMenu(chatId);
    return;
  }
  try {
    const doc = msg.document;
    const fileId = doc.file_id;
    const fileLink = await bot.getFileLink(fileId);
    const orderId = userState[chatId].orderId || "unknown";

    await notifySupport(`📁 *Payment Proof Received*\nOrder: \`${orderId}\`\nUser: ${chatId}\nFile: ${fileLink}`, { parse_mode: "Markdown" });
    await bot.sendMessage(chatId, `✅ Proof received for order \`${orderId}\`. Support will verify and confirm shortly.`, { parse_mode: "Markdown" });
    delete userState[chatId];
  } catch (err) {
    console.error("document handling error:", err);
    bot.sendMessage(chatId, "❌ Could not process the file. Please try again.");
  }
});

// ---------- STK Push (M-Pesa) ----------
async function sendStkPush(chatId, phone, service) {
  await bot.sendMessage(chatId, `💳 Sending payment request of *Ksh ${service.price}* to *${phone}*...\nPlease check your phone and enter your M-Pesa PIN.`, { parse_mode: "Markdown" });

  try {
    // Get token
    const authUrl = (process.env.MPESA_ENV === "prod")
      ? "https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials"
      : "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials";

    const authResponse = await axios.get(authUrl, {
      auth: {
        username: process.env.MPESA_CONSUMER_KEY,
        password: process.env.MPESA_CONSUMER_SECRET,
      },
    });
    const token = authResponse.data.access_token;

    // timestamp & password
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, "").slice(0, 14);
    const password = Buffer.from(process.env.MPESA_SHORTCODE + process.env.MPESA_PASSKEY + timestamp).toString("base64");

    const payload = {
      BusinessShortCode: process.env.MPESA_SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: Number(service.price),
      PartyA: phone,
      PartyB: process.env.MPESA_SHORTCODE,
      PhoneNumber: phone,
      CallBackURL: process.env.MPESA_CALLBACK_URL,
      AccountReference: "EchoLabsBot",
      TransactionDesc: service.name,
    };

    const stkUrl = (process.env.MPESA_ENV === "prod")
      ? "https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest"
      : "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest";

    const r = await axios.post(stkUrl, payload, {
      headers: { Authorization: `Bearer ${token}` },
    });

    // Save mapping for callback
    const checkoutId = r.data.CheckoutRequestID || r.data.checkoutRequestID || null;
    const merchantId = r.data.MerchantRequestID || null;

    const orderId = generateOrderId();
    if (checkoutId) {
      pendingCheckout[checkoutId] = { chatId, service, orderId, phone, merchantId };
    }
    // notify admin about outgoing charge
    notifySupport(`📲 STK Push initiated\nUser: ${chatId}\nPhone: ${phone}\nService: ${service.name}\nAmount: ${service.price}\nOrder: ${orderId}\nCheckout: ${checkoutId || "N/A"}`);

    if (r.data.ResponseCode === "0" || r.data.responseCode === "0" || (r.data.ResponseDescription && r.data.ResponseDescription.toLowerCase().includes("accepted"))) {
      await bot.sendMessage(chatId, `📲 STK Push sent! Order \`${orderId}\`. Please complete the payment on your phone. If you do not receive a prompt, try again or contact support.`, { parse_mode: "Markdown" });
    } else {
      console.warn("stkpush non-zero", r.data);
      await bot.sendMessage(chatId, "❌ Payment request failed to initiate. Please contact support.", { parse_mode: "Markdown" });
    }
  } catch (err) {
    console.error("STK Push Error:", err.response ? err.response.data : err.message);
    await bot.sendMessage(chatId, "❌ Payment request failed. Please try again or contact support.", { parse_mode: "Markdown" });
  }
}

// ---------- M-Pesa callback endpoint ----------
app.post("/callback", (req, res) => {
  try {
    // Log the callback
    console.log("📩 M-Pesa Callback:", JSON.stringify(req.body, null, 2));
    const callback = req.body?.Body?.stkCallback;
    if (!callback) {
      res.json({ status: "ok" });
      return;
    }
    const resultCode = callback.ResultCode;
    const checkoutId = callback.CheckoutRequestID;
    const details = pendingCheckout[checkoutId];

    if (!details) {
      console.warn("Callback for unknown checkout:", checkoutId);
      // still respond ok
      res.json({ status: "ok" });
      return;
    }
    const { chatId, service, orderId } = details;

    if (resultCode === 0) {
      // success
      bot.sendMessage(chatId, `✅ Payment successful for Order \`${orderId}\` (Service: ${service.name}).\nThank you! Support will contact you shortly.`, { parse_mode: "Markdown" });
      notifySupport(`✅ Payment confirmed\nOrder: ${orderId}\nUser: ${chatId}\nService: ${service.name}`);
    } else {
      // failed or canceled
      bot.sendMessage(chatId, `❌ Payment failed or canceled for Order \`${orderId}\`. Would you like to try again?`, {
        reply_markup: {
          inline_keyboard: [
            [{ text: "🔄 Try Again", callback_data: "restart_yes" }],
            [{ text: "💬 Contact Support", url: `https://t.me/${SUPPORT_USERNAME}` }],
          ],
        },
      });
      notifySupport(`❌ Payment failed for Order: ${orderId}\nCheckout: ${checkoutId}\nUser: ${chatId}\nResultCode: ${resultCode}`);
    }

    // cleanup
    delete pendingCheckout[checkoutId];

    res.json({ status: "ok" });
  } catch (e) {
    console.error("callback endpoint error:", e);
    res.status(500).json({ error: "server error" });
  }
});

// ---------- small endpoint to verify server ----------
app.get("/", (req, res) => res.send("Echo Labs bot running"));

// Start express server
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});

console.log("🤖 Bot started and polling for updates.");
