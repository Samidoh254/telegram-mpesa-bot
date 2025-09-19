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

// 🔹 Initialize Telegram Bot in webhook mode
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN);
bot.setWebHook(`${process.env.RENDER_EXTERNAL_URL}/bot${process.env.TELEGRAM_BOT_TOKEN}`);

// 🔹 Telegram Webhook endpoint
app.post(`/bot${process.env.TELEGRAM_BOT_TOKEN}`, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

// 🔹 Enhanced Services Catalog with Sub-Flows
const services = [
  { id: 1, name: "📝 Transcription Training", price: 1500, subFlow: "transcription_training" },
  { id: 2, name: "🔗 Application Link", price: null, subFlow: "transcription_link" },
  { id: 3, name: "🌍 Remote AI Jobs Training", price: 2000, subFlow: "remote_ai_jobs" },
  { id: 4, name: "📚 Remote Work Application Training", price: 1800, subFlow: "remote_work_apply" },
  { id: 5, name: "🛡️ Proxies", price: null, subFlow: "proxies" },
  { id: 6, name: "📦 Fullu", price: null, subFlow: "fullu" },
  { id: 7, name: "📞 USA Numbers", price: null, subFlow: "usa_numbers" },
  { id: 8, name: "🌐 Website Development", price: 10000, subFlow: "website_dev" },
  { id: 9, name: "🤖 Bot Development", price: 15000, subFlow: "bot_dev" },
  { id: 10, name: "🔒 BM Verification", price: 5000, subFlow: "bm_verification" },
  { id: 11, name: "💎 OnlyFans Training", price: 3000, subFlow: "onlyfans_training" },
  { id: 12, name: "✍️ Freelance Writing", price: 2500, subFlow: "freelance_writing" },
  { id: 13, name: "🎨 Graphic Design", price: 3500, subFlow: "graphic_design" },
  { id: 14, name: "📈 Social Media Management", price: 4000, subFlow: "social_media" },
];

// Sub-flow configurations with researched platforms
const SUB_FLOWS = {
  transcription_training: {
    options: [
      { text: "👤 Rev", callback_data: "trans_rev" },
      { text: "📹 GoTranscript", callback_data: "trans_gotranscript" },
      { text: "🔊 Verbit", callback_data: "trans_verbit" },
      { text: "🎙️ AI-Media", callback_data: "trans_aimedia" },
    ],
  },
  transcription_link: {
    initialOptions: [
      { text: "🔒 Private Exclusive (Ksh 800)", callback_data: "link_private" },
      { text: "🌐 Public (Ksh 300)", callback_data: "link_public" },
    ],
    accounts: [
      { text: "👤 Rev", callback_data: "account_rev" },
      { text: "📹 GoTranscript", callback_data: "account_gotranscript" },
      { text: "🔊 Verbit", callback_data: "account_verbit" },
      { text: "🎙️ AI-Media", callback_data: "account_aimedia" },
    ],
  },
  remote_ai_jobs: {
    options: [
      { text: "🤝 Handshake AI", callback_data: "ai_handshake" },
      { text: "🚗 Uber AI", callback_data: "ai_uber" },
      { text: "📝 AI English Evaluator", callback_data: "ai_evaluator" },
      { text: "📊 Sigma AI", callback_data: "ai_sigma" },
      { text: "⚡ Surge AI", callback_data: "ai_surge" },
      { text: "🔄 RWS Train AI", callback_data: "ai_rws" },
      { text: "🌍 Welocalize", callback_data: "ai_welocalize" },
      { text: "🎮 Playment", callback_data: "ai_playment" },
      { text: "📐 Alignerr", callback_data: "ai_alignerr" },
    ],
  },
  proxies: {
    countries: [
      { text: "🇩🇪 Germany", callback_data: "proxy_germany" },
      { text: "🇺🇸 USA", callback_data: "proxy_usa" },
      { text: "🇪🇬 Egypt", callback_data: "proxy_egypt" },
      { text: "🇮🇳 India", callback_data: "proxy_india" },
      { text: "🇨🇦 Canada", callback_data: "proxy_canada" },
      { text: "🇷🇺 Russia", callback_data: "proxy_russia" },
      { text: "🇲🇽 Mexico", callback_data: "proxy_mexico" },
      { text: "🇦🇺 Australia", callback_data: "proxy_australia" },
      { text: "🇫🇷 France", callback_data: "proxy_france" },
      { text: "🇰🇼 Kuwait", callback_data: "proxy_kuwait" },
    ],
    subscriptions: [
      { text: "📅 Monthly (Ksh 2500)", callback_data: "sub_monthly" },
      { text: "⏰ Weekly (Ksh 800)", callback_data: "sub_weekly" },
    ],
  },
  usa_numbers: {
    options: [
      { text: "📱 WhatsApp", callback_data: "num_whatsapp" },
      { text: "🔐 Other Verifications", callback_data: "num_other" },
    ],
  },
  graphic_design: {
    types: [
      { text: "🏷️ Logo", callback_data: "graphic_logo" },
      { text: "📣 Banner Ads", callback_data: "graphic_banner" },
      { text: "📱 Social Graphics", callback_data: "graphic_social" },
    ],
  },
  social_media: {
    platforms: [
      { text: "📸 Instagram", callback_data: "social_instagram" },
      { text: "🐦 Twitter/X", callback_data: "social_twitter" },
      { text: "💼 LinkedIn", callback_data: "social_linkedin" },
    ],
  },
};

// 🔹 Robust State Management with Map
const userState = new Map();

// 🔹 FAQ/Help Buttons
function getFAQButtons() {
  return {
    inline_keyboard: [
      [{ text: "❓ How to Pay?", callback_data: "faq_payment" }],
      [{ text: "📞 Support", url: "https://t.me/Luqman2893" }],
      [{ text: "🔄 Main Menu", callback_data: "restart_menu" }],
    ],
  };
}

// ✅ Professional Main Menu
function showMainMenu(chatId) {
  const buttons = services.map((s) => [{ text: `${s.name} — Ksh ${s.price || 'Varies'}`, callback_data: `service_${s.id}` }]);
  buttons.push([{ text: "💬 Support", url: "https://t.me/Luqman2893" }]);
  buttons.push([{ text: "❓ FAQs", callback_data: "show_faq" }]);

  bot.sendMessage(
    chatId,
    "🌟 *Echo Labs Services* 🌟\n\nSelect a category below for tailored solutions.\n\n*Pro Tip: All transactions are encrypted.*",
    {
      parse_mode: "Markdown",
      reply_markup: { inline_keyboard: buttons },
    }
  );

  userState.set(chatId, { step: "chooseService" });
}

// ✅ Enhanced Message Handler: "Start" Restart, Strict Validations
bot.on("message", (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text?.trim().toLowerCase(); // Normalize for "start" check
  if (!text) return;

  // Global "Start" restart anywhere
  if (text === "start") {
    userState.delete(chatId);
    showMainMenu(chatId);
    return;
  }

  // Handle photo uploads for crypto proof
  if (msg.photo && userState.get(chatId)?.step === "uploadProof") {
    bot.sendMessage(chatId, "📸 Proof uploaded. Processing verification—expect confirmation soon.", {
      parse_mode: "Markdown",
      reply_markup: getFAQButtons(),
    });
    userState.delete(chatId);
    return;
  }

  const state = userState.get(chatId);
  if (!state) {
    showMainMenu(chatId);
    return;
  }

  // Specific step validations with concise professional tone
  switch (state.step) {
    case "enterPhone":
      if (/^2547\d{8}$/.test(text)) {
        state.phone = text;
        bot.sendMessage(chatId, `📱 Verified: ${text}.`, {
          parse_mode: "Markdown",
          reply_markup: {
            inline_keyboard: [
              [{ text: "✅ Send Prompt", callback_data: `confirmPhone_${text}` }],
              [{ text: "✏️ Edit", callback_data: "changePhone" }],
            ],
          },
        });
      } else if (text !== "start") {
        bot.sendMessage(chatId, "⚠️ Invalid. Use: 2547XXXXXXXX", { parse_mode: "Markdown" });
      }
      break;

    case "fulluQuantity":
      const qty = parseInt(text);
      if (qty >= 1 && qty <= 1000) {
        state.quantity = qty;
        state.finalPrice = qty * 150;
        bot.sendMessage(chatId, `🧾 Total: Ksh ${state.finalPrice}`, {
          parse_mode: "Markdown",
          reply_markup: {
            inline_keyboard: [
              [{ text: "💳 Pay", callback_data: "choosePayment" }],
              [{ text: "🔙 Back", callback_data: "backToService" }],
            ],
          },
        });
        state.step = "confirmOrder";
      } else if (text !== "start") {
        bot.sendMessage(chatId, "⚠️ Enter 1-1000", { parse_mode: "Markdown" });
      }
      break;

    case "usaOtherCode":
      state.codeRequest = text;
      state.finalPrice = 150;
      bot.sendMessage(chatId, `🔑 Set for ${text}. Ksh 150.`, {
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [{ text: "💳 Pay", callback_data: "choosePayment