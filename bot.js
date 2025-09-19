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
  { id: 1, name: "📝 Training — Transcription", price: 1500, subFlow: "transcription_training" },
  { id: 2, name: "🔗 Transcription Application Link", price: null, subFlow: "transcription_link" }, // Dynamic price
  { id: 3, name: "🌍 Training — Remote AI Jobs", price: 2000, subFlow: "remote_ai_jobs" },
  { id: 4, name: "📚 Training — How to Apply to Remote Work Account", price: 1800, subFlow: "remote_work_apply" },
  { id: 5, name: "🛡️ Strong Proxies (All Countries)", price: null, subFlow: "proxies" }, // Dynamic
  { id: 6, name: "📦 Fullu", price: null, subFlow: "fullu" }, // Dynamic
  { id: 7, name: "📞 USA Numbers", price: null, subFlow: "usa_numbers" }, // Dynamic
  { id: 8, name: "🌐 Website Development", price: 10000, subFlow: "website_dev" }, // Reasonable price
  { id: 9, name: "🤖 Bot Development", price: 15000, subFlow: "bot_dev" }, // Reasonable price
  { id: 10, name: "🔒 BM Verification", price: 5000, subFlow: "bm_verification" },
  { id: 11, name: "💎 OnlyFans Training", price: 3000, subFlow: "onlyfans_training" },
  { id: 12, name: "✍️ Freelance Writing Services", price: 2500, subFlow: "freelance_writing" },
  { id: 13, name: "🎨 Graphic Design Packages", price: 3500, subFlow: "graphic_design" },
  { id: 14, name: "📈 Social Media Management", price: 4000, subFlow: "social_media" },
];

// Sub-flow configurations
const SUB_FLOWS = {
  transcription_training: {
    options: [
      { text: "👤 Rev", callback_data: "trans_rev" },
      { text: "🔊 Echo Labs", callback_data: "trans_echo" },
      { text: "📹 Go Transcript", callback_data: "trans_go" },
      { text: "🎙️ TranscribeMe", callback_data: "trans_transcribeme" },
    ],
  },
  transcription_link: {
    initialOptions: [
      { text: "🔒 Private Referral Exclusive Link (Ksh 800)", callback_data: "link_private" },
      { text: "🌐 Public Link (Ksh 300)", callback_data: "link_public" },
    ],
    accounts: [
      { text: "👤 Rev", callback_data: "account_rev" },
      { text: "🔊 Echo Labs", callback_data: "account_echo" },
      { text: "📹 Go Transcript", callback_data: "account_go" },
      { text: "🎙️ TranscribeMe", callback_data: "account_transcribeme" },
    ],
  },
  remote_ai_jobs: {
    options: [
      { text: "🤝 Handshake AI", callback_data: "ai_handshake" },
      { text: "🚗 Uber AI", callback_data: "ai_uber" },
      { text: "📝 AI English Writing Evaluator", callback_data: "ai_evaluator" },
      { text: "📊 Sigma AI", callback_data: "ai_sigma" },
      { text: "⚡ Surge AI", callback_data: "ai_surge" },
      { text: "🔄 RWS Train AI", callback_data: "ai_rws" },
      { text: "🌍 Welocalize", callback_data: "ai_welocalize" },
      { text: "🎮 Playment", callback_data: "ai_playment" },
      { text: "📐 Aligner", callback_data: "ai_aligner" },
    ],
  },
  remote_work_apply: { /* Direct to payment, no sub-options */ },
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
      { text: "📅 Monthly Subscription (Ksh 2500)", callback_data: "sub_monthly" },
      { text: "⏰ Weekly Subscription (Ksh 800)", callback_data: "sub_weekly" },
    ],
  },
  fullu: { /* Quantity input */ },
  usa_numbers: {
    options: [
      { text: "📱 For WhatsApp", callback_data: "num_whatsapp" },
      { text: "🔐 For Other Verifications", callback_data: "num_other" },
    ],
  },
  website_dev: { /* Ask for details via text */ },
  bot_dev: { /* Ask for details via text */ },
  bm_verification: { /* Request credentials via text */ },
  onlyfans_training: { /* Direct to payment */ },
  freelance_writing: { /* Ask for topic/word count via text */ },
  graphic_design: { /* Ask for type (logo, banner) via buttons */ },
  social_media: { /* Ask for platform (Instagram, Twitter) via buttons */ },
};

// 🔹 Robust State Management with Map
const userState = new Map();

// 🔹 FAQ/Help Buttons (Anticipated Questions)
function getFAQButtons() {
  return {
    inline_keyboard: [
      [{ text: "❓ How to Pay?", callback_data: "faq_payment" }],
      [{ text: "📞 Support Contact", url: "https://t.me/Luqman2893" }],
      [{ text: "🔄 Restart Menu", callback_data: "restart_menu" }],
    ],
  };
}

// ✅ Enhanced Main Menu with Styling
function showMainMenu(chatId) {
  const buttons = services.map((s) => [{ text: `${s.name} — Ksh ${s.price || 'Varies'}`, callback_data: `service_${s.id}` }]);
  buttons.push([{ text: "💬 Contact Support", url: "https://t.me/Luqman2893" }]);
  buttons.push([{ text: "❓ Help & FAQs", callback_data: "show_faq" }]);

  bot.sendMessage(
    chatId,
    "🌟 *Welcome to Echo Labs Premium Services Bot!* 🌟\n\n" +
    "Discover top-tier freelancing tools, trainings, and verifications. " +
    "Select a service below to get started! 🚀\n\n" +
    "*Pro Tip:* All payments are secure via M-Pesa or Crypto. Let's elevate your freelance game! 💼",
    {
      parse_mode: "Markdown",
      reply_markup: { inline_keyboard: buttons },
    }
  );

  userState.set(chatId, { step: "chooseService" });
}

// ✅ Handle Random Messages Intelligently
bot.on("message", (msg) => {
  const chatId = msg.chat.id;

  // Handle photo uploads for crypto proof
  if (msg.photo && userState.get(chatId)?.step === "uploadProof") {
    bot.sendMessage(chatId, "📸 *Proof Received! ✅*\n\nOur team will verify your crypto transaction within 24 hours and deliver your service. Stay tuned! 📩", {
      parse_mode: "Markdown",
      reply_markup: getFAQButtons(),
    });
    userState.delete(chatId);
    return;
  }

  const text = msg.text?.trim();
  if (!text) return;

  const state = userState.get(chatId);
  if (!state) {
    showMainMenu(chatId);
    return;
  }

  // Handle specific text inputs based on step
  switch (state.step) {
    case "enterPhone":
      if (/^2547\d{8}$/.test(text)) {
        state.phone = text;
        bot.sendMessage(chatId, `📱 *Confirmed: ${text}* ✅\n\nIs this your M-Pesa number?`, {
          parse_mode: "Markdown",
          reply_markup: {
            inline_keyboard: [
              [{ text: "✅ Yes, Proceed", callback_data: `confirmPhone_${text}` }],
              [{ text: "✏️ Change Number", callback_data: "changePhone" }],
            ],
          },
        });
      } else {
        bot.sendMessage(chatId, "⚠️ *Invalid Format!* Please use: *2547XXXXXXXX* (Kenyan number only).", {
          parse_mode: "Markdown",
        });
      }
      break;

    case "fulluQuantity":
      const qty = parseInt(text);
      if (qty >= 1 && qty <= 1000) {
        state.quantity = qty;
        state.finalPrice = qty * 150;
        bot.sendMessage(chatId, `🧾 *Order Summary:* ${qty} Fullu x Ksh 150 = *Ksh ${state.finalPrice}* 💰\n\nReady to pay?`, {
          parse_mode: "Markdown",
          reply_markup: {
            inline_keyboard: [
              [{ text: "💳 Choose Payment", callback_data: "choosePayment" }],
              [{ text: "🔙 Back", callback_data: "backToService" }],
            ],
          },
        });
        state.step = "confirmOrder";
      } else {
        bot.sendMessage(chatId, "⚠️ *Invalid Quantity!* Enter a number between 1-1000.", { parse_mode: "Markdown" });
      }
      break;

    case "usaOtherCode":
      state.codeRequest = text;
      state.finalPrice = 150; // Per code
      bot.sendMessage(chatId, `🔑 *Code Request: ${text}* 📝\n\nPrice: *Ksh 150* per code. Proceed?`, {
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [{ text: "💳 Pay Now", callback_data: "choosePayment" }],
            [{ text: "🔙 Back", callback_data: "backToService" }],
          ],
        },
      });
      state.step = "confirmOrder";
      break;

    case "websiteDetails":
      state.websiteDetails = text;
      bot.sendMessage(chatId, `🌐 *Project: ${text}* 📋\n\nEstimated: *Ksh 10,000*. Ready?`, {
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [{ text: "💳 Proceed to Pay", callback_data: "choosePayment" }],
            [{ text: "🔙 Back", callback_data: "backToService" }],
          ],
        },
      });
      state.step = "confirmOrder";
      break;

    case "botDetails":
      state.botDetails = text;
      bot.sendMessage(chatId, `🤖 *Project: ${text}* ⚙️\n\nEstimated: *Ksh 15,000*. Proceed?`, {
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [{ text: "💳 Proceed to Pay", callback_data: "choosePayment" }],
            [{ text: "🔙 Back", callback_data: "backToService" }],
          ],
        },
      });
      state.step = "confirmOrder";
      break;

    case "bmCredentials":
      state.bmCredentials = text;
      bot.sendMessage(chatId, `🔒 *Credentials Received Privately* 🔐\n\nService: BM Verification - *Ksh 5,000*.\nProceed to payment for processing.`, {
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [{ text: "💳 Pay Securely", callback_data: "choosePayment" }],
            [{ text: "🔙 Back", callback_data: "backToService" }],
          ],
        },
      });
      state.step = "confirmOrder";
      break;

    case "writingDetails":
      state.writingDetails = text;
      state.finalPrice = 2500;
      bot.sendMessage(chatId, `✍️ *Project: ${text}* 📄\n\nPrice: *Ksh 2,500*. Let's get writing!`, {
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [{ text: "💳 Confirm & Pay", callback_data: "choosePayment" }],
            [{ text: "🔙 Back", callback_data: "backToService" }],
          ],
        },
      });
      state.step = "confirmOrder";
      break;

    case "graphicType":
      // This is handled in callback, but if text, fallback
      state.graphicType = text;
      state.finalPrice = 3500;
      bot.sendMessage(chatId, `🎨 *Type: ${text}* 🖌️\n\nPrice: *Ksh 3,500*. Proceed?`, {
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [{ text: "💳 Pay Now", callback_data: "choosePayment" }],
            [{ text: "🔙 Back", callback_data: "backToService" }],
          ],
        },
      });
      state.step = "confirmOrder";
      break;

    case "socialPlatform":
      state.socialPlatform = text;
      state.finalPrice = 4000;
      bot.sendMessage(chatId, `📈 *Platform: ${text}* 🚀\n\nPrice: *Ksh 4,000*. Boost your presence!`, {
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [{ text: "💳 Start Management", callback_data: "choosePayment" }],
            [{ text: "🔙 Back", callback_data: "backToService" }],
          ],
        },
      });
      state.step = "confirmOrder";
      break;

    default:
      // Inquisitive response for random queries
      bot.sendMessage(chatId, `🤔 *Interesting question: "${text}"*!\n\nTo help better, select a service or ask about payments. What sparks your interest today? 💡`, {
        parse_mode: "Markdown",
        reply_markup: getFAQButtons(),
      });
      break;
  }
});

// ✅ Enhanced Button Handler with Inquisitive Flows
bot.on("callback_query", async (query) => {
  const chatId = query.message.chat.id;
  const data = query.data;
  await bot.answerCallbackQuery(query.id);

  let state = userState.get(chatId);
  if (!state) state = { step: "chooseService" }; userState.set(chatId, state);

  // Global handlers
  if (data === "restart_menu") {
    showMainMenu(chatId);
    return;
  }
  if (data === "show_faq") {
    bot.sendMessage(chatId, "❓ *FAQs*\n\n💳 *Payments:* Secure M-Pesa STK or Crypto (BTC/USDT).\n⏱️ *Delivery:* 24-48 hours post-payment.\n🔒 *Privacy:* All data encrypted.\n\nNeed more? Contact support!", {
      parse_mode: "Markdown",
      reply_markup: getFAQButtons(),
    });
    return;
  }
  if (data === "faq_payment") {
    bot.sendMessage(chatId, "💳 *Payment Guide:*\n• M-Pesa: Enter PIN on prompt.\n• Crypto: Send to BTC `1ABCyourBTCwallet` or USDT `TGyourTRC20wallet`, then upload proof.\n\nSafe & Fast! 🛡️", {
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
    state.finalPrice = service.price;

    handleServiceSelection(chatId, serviceId);
    return;
  }

  // Transcription Training
  if (data.startsWith("trans_")) {
    const account = data.split("_")[1];
    state.account = account;
    state.finalPrice = 1500;
    bot.sendMessage(chatId, `🎓 *Training for ${account.toUpperCase()} Selected!* 📚\n\nPrice: *Ksh 1,500*. This covers step-by-step application & tips. Ready?`, {
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [{ text: "💳 Choose Payment Method", callback_data: "choosePayment" }],
          [{ text: "❓ More Details?", callback_data: "faq_service" }],
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
    bot.sendMessage(chatId, `🔗 *${state.linkType} Link Selected!* (Ksh ${state.finalPrice})\n\nNow, choose the transcription account:`, {
      parse_mode: "Markdown",
      reply_markup: { inline_keyboard: SUB_FLOWS.transcription_link.accounts },
    });
    state.step = "chooseAccount";
    return;
  }
  if (data.startsWith("account_")) {
    const account = data.split("_")[1];
    state.account = account;
    bot.sendMessage(chatId, `🔗 *Exclusive ${state.linkType} for ${account.toUpperCase()}!* 📎\n\nPrice: *Ksh ${state.finalPrice}*. Get instant access post-payment. Proceed?`, {
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [{ text: "💳 Pay Now", callback_data: "choosePayment" }],
          [{ text: "🔙 Back", callback_data: "backToService" }],
        ],
      },
    });
    state.step = "confirmOrder";
    return;
  }

  // Remote AI Jobs
  if (data.startsWith("ai_")) {
    const job = data.split("_")[1].replace(/_/g, ' ').toUpperCase();
    state.job = job;
    bot.sendMessage(chatId, `🌍 *Training for ${job} Secured!* 🎯\n\nPrice: *Ksh 2,000*. Includes resume tips, interview prep, & links. Excited?`, {
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [{ text: "💳 Start Training", callback_data: "choosePayment" }],
          [{ text: "❓ Job Insights?", callback_data: "faq_ai_jobs" }],
          [{ text: "🔙 Back", callback_data: "backToService" }],
        ],
      },
    });
    state.step = "confirmOrder";
    return;
  }

  // Proxies
  if (data.startsWith("proxy_")) {
    state.country = data.split("_")[1];
    bot.sendMessage(chatId, `🛡️ *Proxy for ${state.country.toUpperCase()} Selected!* 🌐\n\nChoose subscription:`, {
      parse_mode: "Markdown",
      reply_markup: { inline_keyboard: SUB_FLOWS.proxies.subscriptions },
    });
    state.step = "chooseSub";
    return;
  }
  if (data === "sub_monthly" || data === "sub_weekly") {
    state.subscription = data === "sub_monthly" ? "Monthly" : "Weekly";
    state.finalPrice = data === "sub_monthly" ? 2500 : 800;
    bot.sendMessage(chatId, `🛡️ *${state.subscription} Proxy for ${state.country.toUpperCase()}* ⚡\n\nPrice: *Ksh ${state.finalPrice}*. High-speed & secure! Pay to activate.`, {
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [{ text: "💳 Activate Proxy", callback_data: "choosePayment" }],
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
    state.finalPrice = 1000; // Per number for WhatsApp
    bot.sendMessage(chatId, `📞 *USA Number for WhatsApp* ✅\n\nPrice: *Ksh 1,000*. Instant delivery post-payment. Proceed?`, {
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [{ text: "💳 Get Number", callback_data: "choosePayment" }],
          [{ text: "🔙 Back", callback_data: "backToService" }],
        ],
      },
    });
    state.step = "confirmOrder";
    return;
  }
  if (data === "num_other") {
    state.step = "usaOtherCode";
    bot.sendMessage(chatId, `🔐 *Other Verifications* 📝\n\nWhat code/service do you need? (e.g., 'SMS for Gmail')`, {
      parse_mode: "Markdown",
      reply_markup: getFAQButtons(),
    });
    return;
  }

  // Website/Bot Dev
  if (data === "website_dev") {
    state.step = "websiteDetails";
    bot.sendMessage(chatId, `🌐 *Website Development* 🏗️\n\nDescribe your project (e.g., 'E-commerce site for clothes').`, {
      parse_mode: "Markdown",
      reply_markup: getFAQButtons(),
    });
    return;
  }
  if (data === "bot_dev") {
    state.step = "botDetails";
    bot.sendMessage(chatId, `🤖 *Bot Development* ⚡\n\nWhat kind of bot? (e.g., 'Telegram sales bot').`, {
      parse_mode: "Markdown",
      reply_markup: getFAQButtons(),
    });
    return;
  }

  // BM Verification
  if (data === "bm_verification") {
    state.step = "bmCredentials";
    bot.sendMessage(chatId, `🔒 *BM Verification* 🛡️\n\n*Securely share your BM credentials here* (e.g., email/password). We'll verify & confirm. Price: Ksh 5,000.`, {
      parse_mode: "Markdown",
      reply_markup: getFAQButtons(),
    });
    return;
  }

  // OnlyFans
  if (data === "onlyfans_training") {
    bot.sendMessage(chatId, `💎 *OnlyFans Mastery Training* 🌟\n\nLearn account setup, content strategy, & monetization. Price: *Ksh 3,000*.\n\nUnlock your potential!`, {
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [{ text: "💳 Enroll Now", callback_data: "choosePayment" }],
          [{ text: "❓ Training Outline?", callback_data: "faq_onlyfans" }],
          [{ text: "🔙 Back", callback_data: "backToService" }],
        ],
      },
    });
    state.step = "confirmOrder";
    return;
  }

  // Freelance Writing
  if (data === "freelance_writing") {
    state.step = "writingDetails";
    bot.sendMessage(chatId, `✍️ *Freelance Writing* 📖\n\nTell us about your project (topic, word count).`, {
      parse_mode: "Markdown",
      reply_markup: getFAQButtons(),
    });
    return;
  }

  // Graphic Design
  if (data === "graphic_design") {
    bot.sendMessage(chatId, `🎨 *Graphic Design* 🖼️\n\nChoose type:`, {
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [{ text: "🏷️ Logo Design", callback_data: "graphic_logo" }],
          [{ text: "📣 Banner Ads", callback_data: "graphic_banner" }],
          [{ text: "📱 Social Media Graphics", callback_data: "graphic_social" }],
        ],
      },
    });
    state.step = "graphicType";
    return;
  }
  if (data.startsWith("graphic_")) {
    state.graphicType = data.split("_")[1];
    state.finalPrice = 3500;
    bot.sendMessage(chatId, `🎨 *${state.graphicType.toUpperCase()} Design* ✨\n\nPrice: *Ksh 3,500*. Custom & high-quality!`, {
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [{ text: "💳 Order Design", callback_data: "choosePayment" }],
          [{ text: "🔙 Back", callback_data: "backToService" }],
        ],
      },
    });
    state.step = "confirmOrder";
    return;
  }

  // Social Media
  if (data === "social_media") {
    bot.sendMessage(chatId, `📈 *Social Media Management* 📊\n\nWhich platform?`, {
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [{ text: "📸 Instagram", callback_data: "social_instagram" }],
          [{ text: "🐦 Twitter/X", callback_data: "social_twitter" }],
          [{ text: "💼 LinkedIn", callback_data: "social_linkedin" }],
        ],
      },
    });
    state.step = "socialPlatform";
    return;
  }
  if (data.startsWith("social_")) {
    state.socialPlatform = data.split("_")[1];
    state.finalPrice = 4000;
    bot.sendMessage(chatId, `📈 *Management for ${state.socialPlatform.toUpperCase()}* 🎯\n\nPrice: *Ksh 4,000/month*. Growth guaranteed!`, {
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [{ text: "💳 Subscribe", callback_data: "choosePayment" }],
          [{ text: "🔙 Back", callback_data: "backToService" }],
        ],
      },
    });
    state.step = "confirmOrder";
    return;
  }

  // Payment Flow
  if (data === "choosePayment") {
    bot.sendMessage(chatId, `💰 *Secure Payment for ${state.service.name}* (Total: *Ksh ${state.finalPrice}*)\n\nChoose method:`, {
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [{ text: "📲 M-Pesa (Recommended)", callback_data: "pay_mpesa" }],
          [{ text: "🪙 Binance / Crypto", callback_data: "pay_crypto" }],
        ],
      },
    });
    state.step = "choosePayment";
    return;
  }
  if (data === "pay_mpesa") {
    state.step = "enterPhone";
    bot.sendMessage(chatId, `📱 *M-Pesa Payment* 🔄\n\nEnter your number: *2547XXXXXXXX* (We'll send a prompt!)\n\n*Summary:* ${state.service.name} - Ksh ${state.finalPrice}`, {
      parse_mode: "Markdown",
      reply_markup: getFAQButtons(),
    });
    return;
  }
  if (data === "pay_crypto") {
    state.step = "uploadProof";
    bot.sendMessage(chatId, `🪙 *Crypto Payment Guide* 💎\n\nSend exact amount to:\n• BTC: \`1ABCyourBTCwallet\`\n• USDT (TRC20): \`TGyourTRC20wallet\`\n\n*Amount: Ksh ${state.finalPrice} equivalent.*\n\n📸 Upload transaction screenshot here for verification.`, {
      parse_mode: "Markdown",
      reply_markup: getFAQButtons(),
    });
    return;
  }
  if (data.startsWith("confirmPhone_")) {
    const phone = data.split("_")[1];
    sendStkPush(chatId, phone, state);
    userState.delete(chatId);
    return;
  }
  if (data === "changePhone") {
    state.step = "enterPhone";
    bot.sendMessage(chatId, "🔄 *Re-enter Phone:* 2547XXXXXXXX", { parse_mode: "Markdown" });
    return;
  }
});

// ✅ Service Selection Handler (Centralized)
function handleServiceSelection(chatId, serviceId) {
  const subFlow = services.find(s => s.id === serviceId)?.subFlow;
  const state = userState.get(chatId);

  switch (subFlow) {
    case "transcription_training":
      bot.sendMessage(chatId, `📝 *Transcription Training* 🎓\n\nWhich platform? Select below:`, {
        parse_mode: "Markdown",
        reply_markup: { inline_keyboard: SUB_FLOWS[subFlow].options },
      });
      state.step = "chooseTransAccount";
      break;

    case "transcription_link":
      bot.sendMessage(chatId, `🔗 *Application Link* 📎\n\nPrivate Exclusive or Public?`, {
        parse_mode: "Markdown",
        reply_markup: { inline_keyboard: SUB_FLOWS[subFlow].initialOptions },
      });
      state.step = "chooseLinkType";
      break;

    case "remote_ai_jobs":
      bot.sendMessage(chatId, `🌍 *Remote AI Jobs Training* 🤖\n\nPick your dream job:`, {
        parse_mode: "Markdown",
        reply_markup: { inline_keyboard: SUB_FLOWS[subFlow].options },
      });
      state.step = "chooseAIJob";
      break;

    case "proxies":
      bot.sendMessage(chatId, `🛡️ *Strong Proxies* 🌐\n\nWhich country?`, {
        parse_mode: "Markdown",
        reply_markup: { inline_keyboard: SUB_FLOWS[subFlow].countries },
      });
      state.step = "chooseCountry";
      break;

    case "fullu":
      state.step = "fulluQuantity";
      bot.sendMessage(chatId, `📦 *Fullu Packs* 🛒\n\nHow many Fullu? (1-1000)\n*Price: Ksh 150 each*`, {
        parse_mode: "Markdown",
        reply_markup: getFAQButtons(),
      });
      break;

    case "usa_numbers":
      bot.sendMessage(chatId, `📞 *USA Numbers* 🇺🇸\n\nPurpose?`, {
        parse_mode: "Markdown",
        reply_markup: { inline_keyboard: SUB_FLOWS[subFlow].options },
      });
      state.step = "chooseNumType";
      break;

    case "website_dev":
      // Triggered in message handler
      break;

    case "bot_dev":
      // Triggered in message handler
      break;

    case "bm_verification":
      // Triggered in message handler
      break;

    case "onlyfans_training":
      // Direct confirm in callback
      break;

    case "freelance_writing":
      // Triggered in message handler
      break;

    case "graphic_design":
      // Handled in callback
      break;

    case "social_media":
      // Handled in callback
      break;

    default:
      // Direct services like remote_work_apply
      bot.sendMessage(chatId, `📚 *${state.service.name}* ✅\n\nPrice: *Ksh ${state.finalPrice}*. Comprehensive guide included!`, {
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [{ text: "💳 Proceed to Pay", callback_data: "choosePayment" }],
            [{ text: "🔙 Main Menu", callback_data: "restart_menu" }],
          ],
        },
      });
      state.step = "confirmOrder";
      break;
  }
}

// ✅ Enhanced STK Push with Retry & Transaction Tracking
async function sendStkPush(chatId, phone, state) {
  const loadingMsg = await bot.sendMessage(chatId, `🔄 *Initiating Secure Payment...* 💳\n\nAmount: *Ksh ${state.finalPrice}*\nTo: *${phone}*\n\nCheck your M-Pesa!`, { parse_mode: "Markdown" });

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
        TransactionDesc: `${state.service.name} - ${state.account || state.job || state.country || ''}`,
      },
      { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
    );

    if (stkResponse.data.ResponseCode === "0") {
      state.transactionId = stkResponse.data.CheckoutRequestID;
      await bot.editMessageText(`✅ *STK Push Sent!* 📲\n\nEnter PIN on your phone to complete.\n\nWe'll notify on success! 🔔\n\n*Order:* ${state.service.name}`, {
        chat_id: chatId,
        message_id: loadingMsg.message_id,
        parse_mode: "Markdown",
        reply_markup: getFAQButtons(),
      });
    } else {
      throw new Error(stkResponse.data.errorMessage || "STK Failed");
    }
  } catch (err) {
    console.error("STK Push Error:", err);
    await bot.editMessageText(`❌ *Payment Failed!* 🔄\n\nRetrying in 5s... Or choose another method.`, {
      chat_id: chatId,
      message_id: loadingMsg.message_id,
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [{ text: "🔄 Retry M-Pesa", callback_data: "retryMpesa" }],
          [{ text: "🪙 Switch to Crypto", callback_data: "pay_crypto" }],
        ],
      },
    });
    // Retry logic: setTimeout to recall sendStkPush after 5s
    setTimeout(() => sendStkPush(chatId, phone, state), 5000);
  }
}

// ✅ Enhanced Callback Handler for M-Pesa
app.post("/callback", (req, res) => {
  console.log("📩 M-Pesa Callback:", JSON.stringify(req.body, null, 2));
  const callback = req.body.Body?.stkCallback;

  if (callback?.ResultCode === 0) {
    const transactionId = callback.CheckoutRequestID;
    const metadata = callback.CallbackMetadata?.Item || [];
    const amount = metadata.find(item => item.Name === "Amount")?.Value;
    const receipt = metadata.find(item => item.Name === "MpesaReceiptNumber")?.Value;
    const phone = metadata.find(item => item.Name === "PhoneNumber")?.Value;

    // Find matching user
    for (let [chatId, state] of userState.entries()) {
      if (state.transactionId === transactionId) {
        await bot.sendMessage(chatId, `🎉 *Payment Successful!* ✅\n\n*Amount:* Ksh ${amount}\n*Receipt:* ${receipt}\n*From:* ${phone}\n\nYour ${state.service.name} is being prepared. Expect delivery in 24h! 📦\n\nThank you! 🌟`, {
          parse_mode: "Markdown",
          reply_markup: { inline_keyboard: [[{ text: "🏠 Main Menu", callback_data: "restart_menu" }]] },
        });
        userState.delete(chatId);
        break;
      }
    }
  } else {
    // Notify all pending (or match by time, but simple for now)
    for (let [chatId] of userState.entries()) {
      await bot.sendMessage(chatId, `⚠️ *Payment Timed Out or Cancelled* 😔\n\nNo worries! Restart anytime.`, {
        parse_mode: "Markdown",
        reply_markup: { inline_keyboard: [[{ text: "🔄 Retry Order", callback_data: "restart_menu" }]] },
      });
    }
  }

  res.json({ ResultCode: 0, ResultDesc: "Accepted" });
});

// ✅ Start Command
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  userState.delete(chatId); // Reset
  showMainMenu(chatId);
});