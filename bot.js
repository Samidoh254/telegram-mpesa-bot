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

// 🔹 Services Catalog
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

// 🔹 Sub-flows with chained buttons (arrays for rows)
const SUB_FLOWS = {
  transcription_training: {
    options: [
      [{ text: "👤 Rev", callback_data: "trans_rev" }, { text: "📹 GoTranscript", callback_data: "trans_gotranscript" }],
      [{ text: "🔊 Verbit", callback_data: "trans_verbit" }, { text: "🎙️ AI-Media", callback_data: "trans_aimedia" }],
    ],
  },
  transcription_link: {
    initialOptions: [
      [{ text: "🔒 Private Exclusive (Ksh 800)", callback_data: "link_private" }],
      [{ text: "🌐 Public (Ksh 300)", callback_data: "link_public" }],
    ],
    accounts: [
      [{ text: "👤 Rev", callback_data: "account_rev" }, { text: "📹 GoTranscript", callback_data: "account_gotranscript" }],
      [{ text: "🔊 Verbit", callback_data: "account_verbit" }, { text: "🎙️ AI-Media", callback_data: "account_aimedia" }],
    ],
  },
  remote_ai_jobs: {
    options: [
      [{ text: "🤝 Handshake AI", callback_data: "ai_handshake" }, { text: "🚗 Uber AI", callback_data: "ai_uber" }],
      [{ text: "📝 AI English Evaluator", callback_data: "ai_evaluator" }, { text: "📊 Sigma AI", callback_data: "ai_sigma" }],
      [{ text: "⚡ Surge AI", callback_data: "ai_surge" }, { text: "🔄 RWS Train AI", callback_data: "ai_rws" }],
      [{ text: "🌍 Welocalize", callback_data: "ai_welocalize" }, { text: "🎮 Playment", callback_data: "ai_playment" }],
      [{ text: "📐 Alignerr", callback_data: "ai_alignerr" }],
    ],
  },
  proxies: {
    countries: [
      [{ text: "🇺🇸 USA", callback_data: "proxy_usa" }, { text: "🇩🇪 Germany", callback_data: "proxy_germany" }],
      [{ text: "🇮🇳 India", callback_data: "proxy_india" }, { text: "🇨🇦 Canada", callback_data: "proxy_canada" }],
      [{ text: "🇷🇺 Russia", callback_data: "proxy_russia" }, { text: "🇲🇽 Mexico", callback_data: "proxy_mexico" }],
      [{ text: "🇦🇺 Australia", callback_data: "proxy_australia" }, { text: "🇫🇷 France", callback_data: "proxy_france" }],
      [{ text: "🇪🇬 Egypt", callback_data: "proxy_egypt" }, { text: "🇰🇼 Kuwait", callback_data: "proxy_kuwait" }],
    ],
    subscriptions: [
      [{ text: "📅 Monthly (Ksh 2500)", callback_data: "sub_monthly" }],
      [{ text: "⏰ Weekly (Ksh 800)", callback_data: "sub_weekly" }],
    ],
  },
  usa_numbers: {
    options: [
      [{ text: "📱 WhatsApp", callback_data: "num_whatsapp" }],
      [{ text: "🔐 Other Verifications", callback_data: "num_other" }],
    ],
  },
  graphic_design: {
    types: [
      [{ text: "🏷️ Logo", callback_data: "graphic_logo" }],
      [{ text: "📣 Banner Ads", callback_data: "graphic_banner" }],
      [{ text: "📱 Social Graphics", callback_data: "graphic_social" }],
    ],
  },
  social_media: {
    platforms: [
      [{ text: "📸 Instagram", callback_data: "social_instagram" }],
      [{ text: "🐦 Twitter/X", callback_data: "social_twitter" }],
      [{ text: "💼 LinkedIn", callback_data: "social_linkedin" }],
    ],
  },
};

// 🔹 State Management
const userState = new Map();

// 🔹 FAQ Buttons
function getFAQButtons() {
  return {
    inline_keyboard: [
      [{ text: "❓ How to Pay?", callback_data: "faq_payment" }],
      [{ text: "📞 Support", url: "https://t.me/Luqman2893" }],
      [{ text: "🔄 Main Menu", callback_data: "restart_menu" }],
    ],
  };
}

// 🔹 Main Menu
function showMainMenu(chatId) {
  const buttons = services.map((s) => [{ text: `${s.name} — Ksh ${s.price || 'Varies'}`, callback_data: `service_${s.id}` }]);
  buttons.push([{ text: "💬 Support", url: "https://t.me/Luqman2893" }]);
  buttons.push([{ text: "❓ FAQs", callback_data: "show_faq" }]);

  bot.sendMessage(
    chatId,
    "🌟 *Echo Labs Services* 🌟\n\nSelect a service.",
    {
      parse_mode: "Markdown",
      reply_markup: { inline_keyboard: buttons },
    }
  );

  userState.set(chatId, { step: "chooseService" });
}

// 🔹 Message Handler
bot.on("message", (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text?.trim().toLowerCase();
  if (!text) return;

  if (text === "start") {
    userState.delete(chatId);
    showMainMenu(chatId);
    return;
  }

  if (msg.photo && userState.get(chatId)?.step === "uploadProof") {
    bot.sendMessage(chatId, "📸 Proof received. Verifying...", {
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

  switch (state.step) {
    case "enterPhone":
      if (/^2547\d{8}$/.test(text)) {
        state.phone = text;
        bot.sendMessage(chatId, `📱 ${text} confirmed.`, {
          parse_mode: "Markdown",
          reply_markup: {
            inline_keyboard: [
              [{ text: "✅ Proceed", callback_data: `confirmPhone_${text}` }],
              [{ text: "✏️ Edit", callback_data: "changePhone" }],
            ],
          },
        });
      } else if (text !== "start") {
        bot.sendMessage(chatId, "⚠️ Format: 2547XXXXXXXX", { parse_mode: "Markdown" });
      }
      break;

    case "fulluQuantity":
      const qty = parseInt(text);
      if (qty >= 1 && qty <= 1000) {
        state.quantity = qty;
        state.finalPrice = qty * 150;
        bot.sendMessage(chatId, `Ksh ${state.finalPrice}`, {
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
        bot.sendMessage(chatId, "⚠️ 1-1000 only", { parse_mode: "Markdown" });
      }
      break;

    case "usaOtherCode":
      state.codeRequest = text;
      state.finalPrice = 150;
      bot.sendMessage(chatId, `Ksh 150`, {
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [{ text: "💳 Pay", callback_data: "choosePayment" }],
            [{ text: "🔙 Back", callback_data: "backToService" }],
          ],
        },
      });
      state.step = "confirmOrder";
      break;

    case "websiteDetails":
      state.websiteDetails = text;
      bot.sendMessage(chatId, "Ksh 10,000", {
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [{ text: "💳 Pay", callback_data: "choosePayment" }],
            [{ text: "🔙 Back", callback_data: "backToService" }],
          ],
        },
      });
      state.step = "confirmOrder";
      break;

    case "botDetails":
      state.botDetails = text;
      bot.sendMessage(chatId, "Ksh 15,000", {
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [{ text: "💳 Pay", callback_data: "choosePayment" }],
            [{ text: "🔙 Back", callback_data: "backToService" }],
          ],
        },
      });
      state.step = "confirmOrder";
      break;

    case "bmCredentials":
      state.bmCredentials = text;
      bot.sendMessage(chatId, "Ksh 5,000", {
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [{ text: "💳 Pay", callback_data: "choosePayment" }],
            [{ text: "🔙 Back", callback_data: "backToService" }],
          ],
        },
      });
      state.step = "confirmOrder";
      break;

    case "writingDetails":
      state.writingDetails = text;
      state.finalPrice = 2500;
      bot.sendMessage(chatId, "Ksh 2,500", {
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [{ text: "💳 Pay", callback_data: "choosePayment" }],
            [{ text: "🔙 Back", callback_data: "backToService" }],
          ],
        },
      });
      state.step = "confirmOrder";
      break;

    default:
      showMainMenu(chatId);
      break;
  }
});

// 🔹 Callback Query Handler
bot.on("callback_query", async (query) => {
  const chatId = query.message.chat.id;
  const data = query.data;
  await bot.answerCallbackQuery(query.id);

  let state = userState.get(chatId);
  if (!state) {
    state = { step: "chooseService" };
    userState.set(chatId, state);
  }

  if (data === "restart_menu") {
    showMainMenu(chatId);
    return;
  }
  if (data === "show_faq") {
    bot.sendMessage(chatId, "❓ *FAQs*\n💳 Pay: M-Pesa or Crypto.\n⏱️ Delivery: 24-48h.\n🔒 Secure.", {
      parse_mode: "Markdown",
      reply_markup: getFAQButtons(),
    });
    return;
  }
  if (data === "faq_payment") {
    bot.sendMessage(chatId, "💳 M-Pesa: PIN prompt.\nCrypto: Upload proof.", {
      parse_mode: "Markdown",
      reply_markup: getFAQButtons(),
    });
    return;
  }
  if (data === "backToService") {
    handleServiceSelection(chatId, state.serviceId);
    return;
  }

  // Service Selection
  if (data.startsWith("service_")) {
    const serviceId = parseInt(data.split("_")[1]);
    const service = services.find((s) => s.id === serviceId);
    if (!service) return;

    state.service = service;
    state.serviceId = serviceId;
    state.finalPrice = service.price || 0;

    handleServiceSelection(chatId, serviceId);
    return;
  }

  // Transcription Training
  if (data.startsWith("trans_")) {
    const platform = data.split("_")[1];
    let description = "";
    switch (platform) {
      case "rev":
        description = "Rev: Human/AI. $1.50/min. Podcasts, legal.";
        break;
      case "gotranscript":
        description = "GoTranscript: 100% human. $0.60/min. Academic.";
        break;
      case "verbit":
        description = "Verbit: AI-human. Live broadcasts.";
        break;
      case "aimedia":
        description = "AI-Media: Captioning. Videos, events.";
        break;
    }
    state.platform = platform;
    state.finalPrice = 1500;
    bot.sendMessage(chatId, `${platform.toUpperCase()}: ${description}\nKsh 1,500`, {
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [{ text: "💳 Pay", callback_data: "choosePayment" }],
          [{ text: "🔙 Back", callback_data: "backToService" }],
        ],
      },
    });
    state.step = "confirmOrder";
    return;
  }

  // Transcription Link
  if (data === "link_private" || data === "link_public") {
    state.linkType = data === "link_private" ? "Private" : "Public";
    state.finalPrice = data === "link_private" ? 800 : 300;
    bot.sendMessage(chatId, "Select Account:", {
      parse_mode: "Markdown",
      reply_markup: { inline_keyboard: SUB_FLOWS.transcription_link.accounts },
    });
    state.step = "chooseAccount";
    return;
  }
  if (data.startsWith("account_")) {
    const platform = data.split("_")[1];
    let description = "";
    switch (platform) {
      case "rev":
        description = "Rev: Quick audio gigs.";
        break;
      case "gotranscript":
        description = "GoTranscript: Multilingual.";
        break;
      case "verbit":
        description = "Verbit: Media captioning.";
        break;
      case "aimedia":
        description = "AI-Media: Video subtitles.";
        break;
    }
    state.account = platform;
    bot.sendMessage(chatId, `${state.linkType} for ${platform.toUpperCase()}: ${description}\nKsh ${state.finalPrice}`, {
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [{ text: "💳 Pay", callback_data: "choosePayment" }],
          [{ text: "🔙 Back", callback_data: "backToService" }],
        ],
      },
    });
    state.step = "confirmOrder";
    return;
  }

  // Remote AI Jobs
  if (data.startsWith("ai_")) {
    const job = data.split("_")[1];
    let description = "";
    switch (job) {
      case "handshake":
        description = "Handshake AI: Validate AI responses.";
        break;
      case "uber":
        description = "Uber AI: Annotate driving data.";
        break;
      case "evaluator":
        description = "AI English: Rate essays.";
        break;
      case "sigma":
        description = "Sigma AI: Validate translations.";
        break;
      case "surge":
        description = "Surge AI: Label images/text.";
        break;
      case "rws":
        description = "RWS Train AI: Transcribe/tag.";
        break;
      case "welocalize":
        description = "Welocalize: Categorize content.";
        break;
      case "playment":
        description = "Playment: Annotate videos.";
        break;
      case "alignerr":
        description = "Alignerr: Refine voice models.";
        break;
    }
    state.job = job.replace(/_/g, ' ').toUpperCase();
    bot.sendMessage(chatId, `${state.job}: ${description}\nKsh 2,000`, {
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [{ text: "💳 Pay", callback_data: "choosePayment" }],
          [{ text: "🔙 Back", callback_data: "backToService" }],
        ],
      },
    });
    state.step = "confirmOrder";
    return;
  }

  // Proxies
  if (data.startsWith("proxy_")) {
    state.country = data.split("_")[1].toUpperCase();
    bot.sendMessage(chatId, "Select Plan:", {
      parse_mode: "Markdown",
      reply_markup: { inline_keyboard: SUB_FLOWS.proxies.subscriptions },
    });
    state.step = "chooseSub";
    return;
  }
  if (data === "sub_monthly" || data === "sub_weekly") {
    state.subscription = data === "sub_monthly" ? "Monthly" : "Weekly";
    state.finalPrice = data === "sub_monthly" ? 2500 : 800;
    bot.sendMessage(chatId, `${state.country} ${state.subscription}\nKsh ${state.finalPrice}`, {
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [{ text: "💳 Pay", callback_data: "choosePayment" }],
          [{ text: "🔙 Back", callback_data: "backToService" }],
        ],
      },
    });
    state.step = "confirmOrder";
    return;
  }

  // USA Numbers
  if (data === "num_whatsapp") {
    state.numType = "WhatsApp";
    state.finalPrice = 1000;
    bot.sendMessage(chatId, "Ksh 1,000", {
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [{ text: "💳 Pay", callback_data: "choosePayment" }],
          [{ text: "🔙 Back", callback_data: "backToService" }],
        ],
      },
    });
    state.step = "confirmOrder";
    return;
  }
  if (data === "num_other") {
    state.step = "usaOtherCode";
    bot.sendMessage(chatId, "Specify Service:", {
      parse_mode: "Markdown",
      reply_markup: getFAQButtons(),
    });
    return;
  }

  // Other Services
  if (state.service?.subFlow === "website_dev") {
    state.step = "websiteDetails";
    bot.sendMessage(chatId, "Describe:", {
      parse_mode: "Markdown",
      reply_markup: getFAQButtons(),
    });
    return;
  }
  if (state.service?.subFlow === "bot_dev") {
    state.step = "botDetails";
    bot.sendMessage(chatId, "Describe:", {
      parse_mode: "Markdown",
      reply_markup: getFAQButtons(),
    });
    return;
  }
  if (state.service?.subFlow === "bm_verification") {
    state.step = "bmCredentials";
    bot.sendMessage(chatId, "Submit:", {
      parse_mode: "Markdown",
      reply_markup: getFAQButtons(),
    });
    return;
  }
  if (state.service?.subFlow === "onlyfans_training") {
    state.finalPrice = 3000;
    bot.sendMessage(chatId, "Ksh 3,000", {
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [{ text: "💳 Pay", callback_data: "choosePayment" }],
          [{ text: "🔙 Back", callback_data: "backToService" }],
        ],
      },
    });
    state.step = "confirmOrder";
    return;
  }
  if (state.service?.subFlow === "freelance_writing") {
    state.step = "writingDetails";
    bot.sendMessage(chatId, "Specify:", {
      parse_mode: "Markdown",
      reply_markup: getFAQButtons(),
    });
    return;
  }
  if (state.service?.subFlow === "graphic_design") {
    bot.sendMessage(chatId, "Select Type:", {
      parse_mode: "Markdown",
      reply_markup: { inline_keyboard: SUB_FLOWS.graphic_design.types },
    });
    state.step = "graphicType";
    return;
  }
  if (data.startsWith("graphic_")) {
    state.graphicType = data.split("_")[1].toUpperCase();
    state.finalPrice = 3500;
    bot.sendMessage(chatId, `${state.graphicType}\nKsh 3,500`, {
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [{ text: "💳 Pay", callback_data: "choosePayment" }],
          [{ text: "🔙 Back", callback_data: "backToService" }],
        ],
      },
    });
    state.step = "confirmOrder";
    return;
  }
  if (state.service?.subFlow === "social_media") {
    bot.sendMessage(chatId, "Select Platform:", {
      parse_mode: "Markdown",
      reply_markup: { inline_keyboard: SUB_FLOWS.social_media.platforms },
    });
    state.step = "socialPlatform";
    return;
  }
  if (data.startsWith("social_")) {
    state.socialPlatform = data.split("_")[1].toUpperCase();
    state.finalPrice = 4000;
    bot.sendMessage(chatId, `${state.socialPlatform}\nKsh 4,000`, {
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [{ text: "💳 Pay", callback_data: "choosePayment" }],
          [{ text: "🔙 Back", callback_data: "backToService" }],
        ],
      },
    });
    state.step = "confirmOrder";
    return;
  }

  // Payment Flow
  if (data === "choosePayment") {
    bot.sendMessage(chatId, `${state.service.name}\nKsh ${state.finalPrice}`, {
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [{ text: "📲 M-Pesa", callback_data: "pay_mpesa" }],
          [{ text: "🪙 Crypto", callback_data: "pay_crypto" }],
        ],
      },
    });
    state.step = "choosePayment";
    return;
  }
  if (data === "pay_mpesa") {
    state.step = "enterPhone";
    bot.sendMessage(chatId, "Enter Number: 2547XXXXXXXX", {
      parse_mode: "Markdown",
      reply_markup: getFAQButtons(),
    });
    return;
  }
  if (data === "pay_crypto") {
    state.step = "uploadProof";
    bot.sendMessage(chatId, `Send Ksh ${state.finalPrice} equiv. Upload proof.`, {
      parse_mode: "Markdown",
      reply_markup: getFAQButtons(),
    });
    return;
  }
  if (data.startsWith("confirmPhone_")) {
    const phone = data.split("_")[1];
    sendStkPush(chatId, phone, state);
    return;
  }
  if (data === "changePhone") {
    state.step = "enterPhone";
    bot.sendMessage(chatId, "Re-enter: 2547XXXXXXXX", { parse_mode: "Markdown" });
    return;
  }
});

// 🔹 Service Selection Handler
function handleServiceSelection(chatId, serviceId) {
  const subFlow = services.find(s => s.id === serviceId)?.subFlow;
  const state = userState.get(chatId);

  switch (subFlow) {
    case "transcription_training":
      bot.sendMessage(chatId, "Select Platform:", {
        parse_mode: "Markdown",
        reply_markup: { inline_keyboard: SUB_FLOWS[subFlow].options },
      });
      state.step = "chooseTransAccount";
      break;

    case "transcription_link":
      bot.sendMessage(chatId, "Select Link Type:", {
        parse_mode: "Markdown",
        reply_markup: { inline_keyboard: SUB_FLOWS[subFlow].initialOptions },
      });
      state.step = "chooseLinkType";
      break;

    case "remote_ai_jobs":
      bot.sendMessage(chatId, "Select Job:", {
        parse_mode: "Markdown",
        reply_markup: { inline_keyboard: SUB_FLOWS[subFlow].options },
      });
      state.step = "chooseAIJob";
      break;

    case "proxies":
      bot.sendMessage(chatId, "Select Country:", {
        parse_mode: "Markdown",
        reply_markup: { inline_keyboard: SUB_FLOWS[subFlow].countries },
      });
      state.step = "chooseCountry";
      break;

    case "fullu":
      state.step = "fulluQuantity";
      bot.sendMessage(chatId, "Enter Quantity (1-1000):", {
        parse_mode: "Markdown",
        reply_markup: getFAQButtons(),
      });
      break;

    case "usa_numbers":
      bot.sendMessage(chatId, "Select Purpose:", {
        parse_mode: "Markdown",
        reply_markup: { inline_keyboard: SUB_FLOWS[subFlow].options },
      });
      state.step = "chooseNumType";
      break;

    case "remote_work_apply":
      state.finalPrice = 1800;
      bot.sendMessage(chatId, "Ksh 1,800", {
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [{ text: "💳 Pay", callback_data: "choosePayment" }],
            [{ text: "🔙 Back", callback_data: "backToService" }],
          ],
        },
      });
      state.step = "confirmOrder";
      break;

    default:
      bot.sendMessage(chatId, `${state.service.name}\nKsh ${state.finalPrice}`, {
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [{ text: "💳 Pay", callback_data: "choosePayment" }],
            [{ text: "🔙 Back", callback_data: "backToService" }],
          ],
        },
      });
      state.step = "confirmOrder";
      break;
  }
}

// 🔹 STK Push
async function sendStkPush(chatId, phone, state) {
  const loadingMsg = await bot.sendMessage(chatId, `Prompt to ${phone}. Ksh ${state.finalPrice}.`, { parse_mode: "Markdown" });

  try {
    const authResponse = await axios.get(
      "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
      { auth: { username: process.env.MPESA_CONSUMER_KEY, password: process.env.MPESA_CONSUMER_SECRET } }
    );
    const token = authResponse.data.access_token;
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, "").slice(0, 14);
    const password = Buffer.from(`${process.env.MPESA_SHORTCODE}${process.env.MPESA_PASSKEY}${timestamp}`).toString("base64");

    const stkResponse = await axios.post(
      "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
      {
        BusinessShortCode: process.env.MPESA_SHORTCODE,
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerPayBillOnline",
        Amount: state.finalPrice,
        PartyA: phone,
        PartyB: process.env.MPESA_SHORTCODE,
        PhoneNumber: phone,
        CallBackURL: process.env.MPESA_CALLBACK_URL,
        AccountReference: `EchoLabs_${Date.now()}`,
        TransactionDesc: state.service.name,
      },
      { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
    );

    if (stkResponse.data.ResponseCode === "0") {
      state.transactionId = stkResponse.data.CheckoutRequestID;
      await bot.editMessageText(`Prompt sent. Enter PIN.`, {
        chat_id: chatId,
        message_id: loadingMsg.message_id,
        parse_mode: "Markdown",
        reply_markup: getFAQButtons(),
      });
    } else {
      throw new Error("STK Failed");
    }
  } catch (err) {
    console.error("STK Error:", err);
    await bot.editMessageText(`Failed. Retry?`, {
      chat_id: chatId,
      message_id: loadingMsg.message_id,
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [{ text: "🔄 Retry", callback_data: "pay_mpesa" }],
          [{ text: "🪙 Crypto", callback_data: "pay_crypto" }],
        ],
      },
    });
  }
}

// 🔹 Callback Handler
app.post("/callback", async (req, res) => {
  console.log("📩 Callback:", JSON.stringify(req.body, null, 2));
  const callback = req.body.Body?.stkCallback;

  if (callback?.ResultCode === 0) {
    const transactionId = callback.CheckoutRequestID;
    const metadata = callback.CallbackMetadata?.Item || [];
    const amount = metadata.find(item => item.Name === "Amount")?.Value;
    const receipt = metadata.find(item => item.Name === "MpesaReceiptNumber")?.Value;
    const phone = metadata.find(item => item.Name === "PhoneNumber")?.Value;

    for (let [chatId, state] of userState.entries()) {
      if (state.transactionId === transactionId) {
        await bot.sendMessage(chatId, `Success. Ksh ${amount}. Receipt: ${receipt}. Delivery soon.`, {
          parse_mode: "Markdown",
          reply_markup: { inline_keyboard: [[{ text: "🏠 Menu", callback_data: "restart_menu" }]] },
        });
        userState.delete(chatId);
        break;
      }
    }
  } else {
    for (let [chatId] of userState.entries()) {
      bot.sendMessage(chatId, `Cancelled. Retry?`, {
        parse_mode: "Markdown",
        reply_markup: { inline_keyboard: [[{ text: "🔄 Yes", callback_data: "restart_menu" }]] },
      }).catch(err => console.error(`Send error:`, err));
    }
  }

  res.json({ ResultCode: 0, ResultDesc: "Accepted" });
});

// 🔹 Start Command
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  userState.delete(chatId);
  showMainMenu(chatId);
});