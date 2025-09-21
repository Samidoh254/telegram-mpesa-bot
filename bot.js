require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");
const express = require("express");
const fs = require("fs"); // Added for logging

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

// 🔹 Support Username for forwarding proofs
const SUPPORT_USERNAME = '@Luqman2893'; // Forward payment proofs here

// 🔹 Crypto Wallets
const BINANCE_WALLET = process.env.BINANCE_WALLET || 'your_binance_wallet_address_here'; // Replace or set in .env
const TRUST_WALLET = process.env.TRUST_WALLET || 'your_trust_wallet_address_here'; // Replace or set in .env

// 🔹 Exchange Rate (USD to KSH)
const EXCHANGE_RATE = 129;

// 🔹 Jobs List
const JOBS = [
  "Handshake AI", "Uber AI", "AI English Evaluator", "Sigma AI", "Surge AI", "RWS Train AI", "Welocalize", "Playment", "Alignerr",
  "Mecor AI", "Scale AI", "Lionbridge AI", "clickworker", "TELUS International AI", "LXT", "OneForma", "CloudFactory", "iMerit",
  "Labelbox", "SuperAnnotate", "Toloka", "Hive", "Innodata", "Outlier", "TaskUs", "Shaip", "Sama", "Snorkel AI", "Defined.ai", "Invisible Technologies"
];

// 🔹 Services Catalog
const services = [
  { id: 1, name: "Beginners Masterclass", price: null, subFlow: "beginners_masterclass" },
  { id: 2, name: "Proxies (All Countries)", price: null, subFlow: "proxies" },
  { id: 3, name: "Remote Jobs (Working Accounts)", price: null, subFlow: "remote_jobs" },
  { id: 4, name: "Remote Job Training and application links", price: null, subFlow: "remote_job_training_links" },
  { id: 5, name: "Chat Home Base", price: null, subFlow: "chat_home_base" },
  { id: 6, name: "Echo Labs", price: null, subFlow: "echo_labs" },
  { id: 7, name: "Handshake AI", price: null, subFlow: "handshake_ai" },
  { id: 8, name: "Mercor AI", price: null, subFlow: "mercor_ai" },
  { id: 9, name: "Uber AI", price: null, subFlow: "uber_ai" },
  { id: 10, name: "Cloudworkers", price: null, subFlow: "cloudworkers" },
  { id: 11, name: "Referral Links", price: null, subFlow: "referral_links" },
  { id: 12, name: "USA and UK Numbers", price: null, subFlow: "usa_uk_numbers" },
  { id: 13, name: "Maffulu", price: null, subFlow: "maffulu" },
  { id: 14, name: "Remote Jobs Training", price: null, subFlow: "remote_jobs_training" },
  { id: 15, name: "Extra services", price: null, subFlow: "extra_services" },
];

// 🔹 Sub-flows with chained buttons (arrays for rows)
const SUB_FLOWS = {
  beginners_masterclass: {
    levels: [
      [{ text: "Complete Beginner ($1)", callback_data: "level_complete_beginner" }],
      [{ text: "Intermediary ($2.99)", callback_data: "level_intermediary" }],
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
  },
  remote_jobs: {
    initialOptions: [
      [{ text: "Complete Beginner Training ($1)", callback_data: "complete_beginner_training" }],
      [{ text: "Intermediary Training ($2.99)", callback_data: "intermediary_training" }],
      [{ text: "Application Links ($1.99)", callback_data: "application_links" }],
    ],
  },
  remote_job_training_links: {
    initialOptions: [
      [{ text: "Application Links Inclusive of Training ($2.99)", callback_data: "app_links_training" }],
    ],
  },
  chat_home_base: {
    options: [
      [{ text: "Training ($9.99)", callback_data: "chb_training" }],
      [{ text: "Buying Account ($199)", callback_data: "chb_buying" }],
    ],
  },
  echo_labs: {
    options: [
      [{ text: "Application Link ($1.99)", callback_data: "el_app_link" }],
      [{ text: "Training ($9.99)", callback_data: "el_training" }],
    ],
  },
  handshake_ai: {
    options: [
      [{ text: "Training ($9.99)", callback_data: "ha_training" }],
      [{ text: "Buying Account ($239)", callback_data: "ha_buying" }],
      [{ text: "Application Link ($1.99)", callback_data: "ha_app_link" }],
      [{ text: "Referral Link ($3.99)", callback_data: "ha_referral" }],
    ],
  },
  mercor_ai: {
    options: [
      [{ text: "Training ($9.99)", callback_data: "ma_training" }],
      [{ text: "Buying Account ($219)", callback_data: "ma_buying" }],
      [{ text: "Application Link ($1.99)", callback_data: "ma_app_link" }],
      [{ text: "Referral Link ($3.99)", callback_data: "ma_referral" }],
    ],
  },
  uber_ai: {
    options: [
      [{ text: "Training ($9.99)", callback_data: "ua_training" }],
      [{ text: "Buying Account ($199)", callback_data: "ua_buying" }],
      [{ text: "Application Link ($1.99)", callback_data: "ua_app_link" }],
      [{ text: "Referral Link ($3.99)", callback_data: "ua_referral" }],
    ],
  },
  cloudworkers: {
    options: [
      [{ text: "Buying Account ($219)", callback_data: "cw_buying" }],
      [{ text: "Application Link ($1.99)", callback_data: "cw_app_link" }],
      [{ text: "Referral Link ($3.99)", callback_data: "cw_referral" }],
    ],
  },
  usa_uk_numbers: {
    options: [
      [{ text: "One Time Code For Verification (OTP) ($1.9)", callback_data: "num_otp" }],
      [{ text: "Whatsapp Numbers ($2.9)", callback_data: "num_whatsapp" }],
      [{ text: "PayPal Verification ($1.9)", callback_data: "num_paypal" }],
      [{ text: "Gmail Verification ($1.9)", callback_data: "num_gmail" }],
    ],
  },
  remote_jobs_training: {
    options: [
      [{ text: "Transcription ($9.99)", callback_data: "rjt_transcription" }],
      [{ text: "Academic and Freelance Writing ($9.99)", callback_data: "rjt_writing" }],
      [{ text: "AI Jobs ($2.99)", callback_data: "rjt_ai_jobs" }],
      [{ text: "Virtual Assistant ($29.99)", callback_data: "rjt_va" }],
      [{ text: "Only Fans ($29.99)", callback_data: "rjt_onlyfans" }],
      [{ text: "Chat Moderation ($19.99)", callback_data: "rjt_chat_mod" }],
      [{ text: "Affiliate Marketing ($19.99)", callback_data: "rjt_affiliate" }],
      [{ text: "Upwork & Fiverr Training ($19.99)", callback_data: "rjt_upwork_fiverr" }],
    ],
  },
  extra_services: {
    options: [
      [{ text: "Website Development ($249.99)", callback_data: "extra_website" }],
      [{ text: "Bot Development ($201.99)", callback_data: "extra_bot" }],
      [{ text: "BM Verification ($201.99)", callback_data: "extra_bm" }],
    ],
  },
};

// 🔹 Generate Jobs Buttons
function generateJobsButtons(prefix) {
  const buttons = [];
  for (let i = 0; i < JOBS.length; i += 2) {
    const row = [];
    row.push({ text: JOBS[i], callback_data: `${prefix}${JOBS[i].toLowerCase().replace(/ /g, "_")}` });
    if (i + 1 < JOBS.length) {
      row.push({ text: JOBS[i + 1], callback_data: `${prefix}${JOBS[i + 1].toLowerCase().replace(/ /g, "_")}` });
    }
    buttons.push(row);
  }
  return buttons;
}

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
  const buttons = services.map((s) => [{ text: s.name, callback_data: `service_${s.id}` }]);
  buttons.push([{ text: "💬 Support", url: "https://t.me/Luqman2893" }]);
  buttons.push([{ text: "❓ FAQs", callback_data: "show_faq" }]);

  bot.sendMessage(
    chatId,
    "⭐ *Welcome to 🔝 Trusted Vendor.* Let's fight poverty. Select a service below:",
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
  const text = msg.text?.trim();
  if (!text) return;

  if (text.toLowerCase() === "/start" || text.toLowerCase() === "start") {
    userState.delete(chatId);
    showMainMenu(chatId);
    return;
  }

  if (msg.photo) {
    const photoId = msg.photo[msg.photo.length - 1].file_id;
    const state = userState.get(chatId);
    if (state?.step === "uploadProof" || state?.step === "confirmOrder") {
      bot.forwardMessage(SUPPORT_USERNAME, chatId, msg.message_id)
        .then(() => {
          bot.sendMessage(chatId, "📸 Payment proof sent to support. Verifying—support will reach you soon.", {
            parse_mode: "Markdown",
            reply_markup: getFAQButtons(),
          });
        })
        .catch(err => {
          console.error("Forward error:", err);
          bot.sendMessage(chatId, "⚠️ Error forwarding proof. Contact support.", {
            parse_mode: "Markdown",
            reply_markup: getFAQButtons(),
          });
        });
      userState.delete(chatId);
    } else {
      bot.sendMessage(chatId, "📷 Image received. This doesn’t appear to be a payment proof. Contact support if needed.", {
        parse_mode: "Markdown",
        reply_markup: getFAQButtons(),
      });
    }
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
      } else {
        bot.sendMessage(chatId, "⚠️ Invalid format. Use 2547XXXXXXXX", { parse_mode: "Markdown" });
      }
      break;

    case "maffuluQuantity":
      const qty = parseInt(text);
      if (!isNaN(qty) && qty >= 1 && qty <= 1000) {
        state.quantity = qty;
        state.usdPrice = qty * 1.19;
        state.kshPrice = Math.ceil(state.usdPrice * EXCHANGE_RATE);
        bot.sendMessage(chatId, `$${state.usdPrice.toFixed(2)} for ${qty} Maffulu.`, {
          parse_mode: "Markdown",
          reply_markup: {
            inline_keyboard: [
              [{ text: "💳 Pay", callback_data: "choosePayment" }],
              [{ text: "🔙 Back", callback_data: "backToService" }],
            ],
          },
        });
        state.step = "confirmOrder";
      } else {
        showMainMenu(chatId);
      }
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
    bot.sendMessage(chatId, "💳 M-Pesa: PIN prompt.\nCrypto: Use addresses below and upload proof.", {
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

    handleServiceSelection(chatId, serviceId);
    return;
  }

  // Beginners Masterclass
  if (data.startsWith("level_")) {
    const level = data.split("_").slice(1).join(" ");
    state.level = level.charAt(0).toUpperCase() + level.slice(1).replace(/_/g, " ");
    if (data === "level_complete_beginner") {
      state.usdPrice = 1;
    } else if (data === "level_intermediary") {
      state.usdPrice = 2.99;
    }
    state.kshPrice = Math.ceil(state.usdPrice * EXCHANGE_RATE);
    bot.sendMessage(chatId, `${state.level}: $${state.usdPrice.toFixed(2)}`, {
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
    state.usdPrice = 1;
    state.kshPrice = Math.ceil(1 * EXCHANGE_RATE);
    bot.sendMessage(chatId, `${state.country} Proxy: $${state.usdPrice.toFixed(2)}`, {
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

  // Remote Jobs (Working Accounts)
  if (data === "complete_beginner_training" || data === "intermediary_training" || data === "application_links") {
    state.trainingType = data.replace(/_/g, " ").charAt(0).toUpperCase() + data.replace(/_/g, " ").slice(1);
    let prefix;
    if (data === "complete_beginner_training") {
      state.usdPrice = 1;
      prefix = "beginner_";
    } else if (data === "intermediary_training") {
      state.usdPrice = 2.99;
      prefix = "inter_";
    } else {
      state.usdPrice = 1.99;
      prefix = "app_";
    }
    state.kshPrice = Math.ceil(state.usdPrice * EXCHANGE_RATE);
    bot.sendMessage(chatId, `Select Job for ${state.trainingType}:`, {
      parse_mode: "Markdown",
      reply_markup: { inline_keyboard: generateJobsButtons(prefix) },
    });
    state.step = "chooseJob";
    return;
  }
  if (data.startsWith("beginner_") || data.startsWith("inter_") || data.startsWith("app_")) {
    state.job = data.split("_").slice(1).join(" ").toUpperCase();
    bot.sendMessage(chatId, `${state.trainingType} - ${state.job}: $${state.usdPrice.toFixed(2)}`, {
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

  // Remote Job Training and application links
  if (data === "app_links_training") {
    state.usdPrice = 2.99;
    state.kshPrice = Math.ceil(2.99 * EXCHANGE_RATE);
    bot.sendMessage(chatId, "Select Job for Application Links Inclusive of Training:", {
      parse_mode: "Markdown",
      reply_markup: { inline_keyboard: generateJobsButtons("training_link_") },
    });
    state.step = "chooseJobTrainingLink";
    return;
  }
  if (data.startsWith("training_link_")) {
    state.job = data.split("_").slice(2).join(" ").toUpperCase();
    bot.sendMessage(chatId, `Application Links Inclusive of Training - ${state.job}: $${state.usdPrice.toFixed(2)}`, {
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

  // Chat Home Base
  if (data.startsWith("chb_")) {
    state.option = data.split("_")[1].charAt(0).toUpperCase() + data.split("_")[1].slice(1);
    if (data === "chb_training") {
      state.usdPrice = 9.99; // Updated from 2.99 to match your code
    } else if (data === "chb_buying") {
      state.usdPrice = 199;
    }
    state.kshPrice = Math.ceil(state.usdPrice * EXCHANGE_RATE);
    bot.sendMessage(chatId, `${state.option}: $${state.usdPrice.toFixed(2)}`, {
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

  // Echo Labs
  if (data.startsWith("el_")) {
    state.option = data.split("_").slice(1).join(" ").charAt(0).toUpperCase() + data.split("_").slice(1).join(" ").slice(1);
    if (data === "el_app_link") {
      state.usdPrice = 1.99;
    } else if (data === "el_training") {
      state.usdPrice = 9.99; // Updated from 2.99 to match your code
    }
    state.kshPrice = Math.ceil(state.usdPrice * EXCHANGE_RATE);
    bot.sendMessage(chatId, `${state.option}: $${state.usdPrice.toFixed(2)}`, {
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

  // Handshake AI
  if (data.startsWith("ha_")) {
    state.option = data.split("_").slice(1).join(" ").charAt(0).toUpperCase() + data.split("_").slice(1).join(" ").slice(1);
    if (data === "ha_training") {
      state.usdPrice = 9.99; // Updated from 2.99 to match your code
    } else if (data === "ha_buying") {
      state.usdPrice = 239;
    } else if (data === "ha_app_link") {
      state.usdPrice = 1.99;
    } else if (data === "ha_referral") {
      state.usdPrice = 3.99;
    }
    state.kshPrice = Math.ceil(state.usdPrice * EXCHANGE_RATE);
    bot.sendMessage(chatId, `${state.option}: $${state.usdPrice.toFixed(2)}`, {
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

  // Mercor AI
  if (data.startsWith("ma_")) {
    state.option = data.split("_").slice(1).join(" ").charAt(0).toUpperCase() + data.split("_").slice(1).join(" ").slice(1);
    if (data === "ma_training") {
      state.usdPrice = 9.99; // Updated from 2.99 to match your code
    } else if (data === "ma_buying") {
      state.usdPrice = 219;
    } else if (data === "ma_app_link") {
      state.usdPrice = 1.99;
    } else if (data === "ma_referral") {
      state.usdPrice = 3.99;
    }
    state.kshPrice = Math.ceil(state.usdPrice * EXCHANGE_RATE);
    bot.sendMessage(chatId, `${state.option}: $${state.usdPrice.toFixed(2)}`, {
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

  // Uber AI
  if (data.startsWith("ua_")) {
    state.option = data.split("_").slice(1).join(" ").charAt(0).toUpperCase() + data.split("_").slice(1).join(" ").slice(1);
    if (data === "ua_training") {
      state.usdPrice = 9.99; // Updated from 2.99 to match your code
    } else if (data === "ua_buying") {
      state.usdPrice = 199;
    } else if (data === "ua_app_link") {
      state.usdPrice = 1.99;
    } else if (data === "ua_referral") {
      state.usdPrice = 3.99;
    }
    state.kshPrice = Math.ceil(state.usdPrice * EXCHANGE_RATE);
    bot.sendMessage(chatId, `${state.option}: $${state.usdPrice.toFixed(2)}`, {
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

  // Cloudworkers
  if (data.startsWith("cw_")) {
    state.option = data.split("_").slice(1).join(" ").charAt(0).toUpperCase() + data.split("_").slice(1).join(" ").slice(1);
    if (data === "cw_training") {
      state.usdPrice = 2.99; // Assuming training was omitted intentionally
    } else if (data === "cw_buying") {
      state.usdPrice = 219;
    } else if (data === "cw_app_link") {
      state.usdPrice = 1.99;
    } else if (data === "cw_referral") {
      state.usdPrice = 3.99;
    }
    state.kshPrice = Math.ceil(state.usdPrice * EXCHANGE_RATE);
    bot.sendMessage(chatId, `${state.option}: $${state.usdPrice.toFixed(2)}`, {
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

  // USA and UK Numbers
  if (data.startsWith("num_")) {
    state.numType = data.split("_").slice(1).join(" ").toUpperCase();
    if (data === "num_otp" || data === "num_paypal" || data === "num_gmail") {
      state.usdPrice = 1.9;
    } else if (data === "num_whatsapp") {
      state.usdPrice = 2.9;
    }
    state.kshPrice = Math.ceil(state.usdPrice * EXCHANGE_RATE);
    bot.sendMessage(chatId, `${state.numType}: $${state.usdPrice.toFixed(1)}`, {
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

  // Remote Jobs Training
  if (data.startsWith("rjt_")) {
    state.option = data.split("_").slice(1).join(" ").charAt(0).toUpperCase() + data.split("_").slice(1).join(" ").slice(1);
    if (data === "rjt_transcription" || data === "rjt_writing") {
      state.usdPrice = 9.99;
    } else if (data === "rjt_ai_jobs") {
      state.usdPrice = 2.99;
    } else if (data === "rjt_va") {
      state.usdPrice = 29.99;
    } else {
      state.usdPrice = 19.99;
    }
    state.kshPrice = Math.ceil(state.usdPrice * EXCHANGE_RATE);
    bot.sendMessage(chatId, `${state.option}: $${state.usdPrice.toFixed(2)}`, {
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

  // Extra services
  if (data.startsWith("extra_")) {
    state.option = data.split("_").slice(1).join(" ").charAt(0).toUpperCase() + data.split("_").slice(1).join(" ").slice(1);
    if (data === "extra_website") {
      state.usdPrice = 249.99;
    } else {
      state.usdPrice = 201.99;
    }
    state.kshPrice = Math.ceil(state.usdPrice * EXCHANGE_RATE);
    bot.sendMessage(chatId, `${state.option}: $${state.usdPrice.toFixed(2)}`, {
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
    const detail = state.level || state.country || state.job || state.option || state.trainingType || state.numType || `${state.quantity} Maffulu` || '';
    bot.sendMessage(chatId, `${state.service.name} - ${detail}\n$${state.usdPrice.toFixed(2)}`, {
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
    bot.sendMessage(chatId, "Enter Phone Number (2547XXXXXXXX):", {
      parse_mode: "Markdown",
      reply_markup: getFAQButtons(),
    });
    return;
  }
  if (data === "pay_crypto") {
    state.step = "uploadProof";
    bot.sendMessage(chatId, `🪙 Pay $${state.usdPrice.toFixed(2)} (or equivalent in crypto) to:\nBinance: ${BINANCE_WALLET}\nTrust Wallet: ${TRUST_WALLET}\nUpload proof (screenshot).`, {
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
    bot.sendMessage(chatId, "Re-enter Phone Number (2547XXXXXXXX):", { parse_mode: "Markdown" });
    return;
  }
});

// 🔹 Service Selection Handler
function handleServiceSelection(chatId, serviceId) {
  const subFlow = services.find(s => s.id === serviceId)?.subFlow;
  const state = userState.get(chatId);

  switch (subFlow) {
    case "beginners_masterclass":
      bot.sendMessage(chatId, "Select Level:", {
        parse_mode: "Markdown",
        reply_markup: { inline_keyboard: SUB_FLOWS[subFlow].levels },
      });
      state.step = "chooseLevel";
      break;

    case "proxies":
      bot.sendMessage(chatId, "Select Country:", {
        parse_mode: "Markdown",
        reply_markup: { inline_keyboard: SUB_FLOWS[subFlow].countries },
      });
      state.step = "chooseCountry";
      break;

    case "remote_jobs":
      bot.sendMessage(chatId, "Select Option:", {
        parse_mode: "Markdown",
        reply_markup: { inline_keyboard: SUB_FLOWS[subFlow].initialOptions },
      });
      state.step = "chooseRemoteOption";
      break;

    case "remote_job_training_links":
      bot.sendMessage(chatId, "Select Option:", {
        parse_mode: "Markdown",
        reply_markup: { inline_keyboard: SUB_FLOWS[subFlow].initialOptions },
      });
      state.step = "chooseTrainingLinkOption";
      break;

    case "chat_home_base":
    case "echo_labs":
    case "handshake_ai":
    case "mercor_ai":
    case "uber_ai":
    case "cloudworkers":
    case "usa_uk_numbers":
    case "remote_jobs_training":
    case "extra_services":
      bot.sendMessage(chatId, "Select Option:", {
        parse_mode: "Markdown",
        reply_markup: { inline_keyboard: SUB_FLOWS[subFlow].options },
      });
      state.step = "chooseOption";
      break;

    case "referral_links":
      state.usdPrice = 3.99;
      state.kshPrice = Math.ceil(3.99 * EXCHANGE_RATE);
      bot.sendMessage(chatId, `Referral Links: $${state.usdPrice.toFixed(2)}`, {
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

    case "maffulu":
      state.step = "maffuluQuantity";
      bot.sendMessage(chatId, "Enter Quantity (1-1000):", {
        parse_mode: "Markdown",
        reply_markup: getFAQButtons(),
      });
      break;

    default:
      showMainMenu(chatId);
      break;
  }
}

// 🔹 STK Push
async function sendStkPush(chatId, phone, state) {
  const loadingMsg = await bot.sendMessage(chatId, `Sending prompt to ${phone} for Ksh ${state.kshPrice}.`, { parse_mode: "Markdown" });

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
        Amount: state.kshPrice,
        PartyA: phone,
        PartyB: process.env.MPESA_SHORTCODE,
        PhoneNumber: phone,
        CallBackURL: process.env.MPESA_CALLBACK_URL,
        AccountReference: `EchoLabs_${Date.now()}`,
        TransactionDesc: `${state.service.name} - ${state.level || state.country || state.job || state.option || state.trainingType || state.numType || ''}`,
      },
      { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
    );

    if (stkResponse.data.ResponseCode === "0") {
      state.transactionId = stkResponse.data.CheckoutRequestID;
      await bot.editMessageText(`Prompt sent to ${phone}. Enter PIN to complete payment.`, {
        chat_id: chatId,
        message_id: loadingMsg.message_id,
        parse_mode: "Markdown",
        reply_markup: getFAQButtons(),
      });
    } else {
      throw new Error("STK Push failed");
    }
  } catch (err) {
    console.error("STK Error:", err);
    await bot.editMessageText(`Failed to send prompt. Please retry or contact support.`, {
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
        await bot.sendMessage(chatId, `✅ Payment successful! Ksh ${amount}. Receipt: ${receipt}. Your service will be delivered soon.`, {
          parse_mode: "Markdown",
          reply_markup: { inline_keyboard: [[{ text: "🏠 Main Menu", callback_data: "restart_menu" }]] },
        });

        // Log transaction to file
        const logEntry = {
          timestamp: new Date().toISOString(),
          chatId,
          service: state.service.name,
          detail: state.level || state.country || state.job || state.option || state.trainingType || state.numType || `${state.quantity} Maffulu` || '',
          amount,
          receipt,
          phone,
        };
        fs.appendFileSync('transactions.log', JSON.stringify(logEntry) + '\n');

        // Send notification to support
        await bot.sendMessage(SUPPORT_USERNAME, `✅ New Payment: Ksh ${amount} from ${phone}. Receipt: ${receipt}. User: ${chatId}. Service: ${state.service.name} - ${logEntry.detail}`, {
          parse_mode: "Markdown",
        });

        userState.delete(chatId);
        break;
      }
    }
  } else {
    for (let [chatId, state] of userState.entries()) {
      if (state.transactionId) {
        bot.sendMessage(chatId, `❌ Payment cancelled or failed. Would you like to retry?`, {
          parse_mode: "Markdown",
          reply_markup: { inline_keyboard: [[{ text: "🔄 Retry", callback_data: "restart_menu" }]] },
        }).catch(err => console.error(`Send error:`, err));
      }
    }
  }

  res.json({ ResultCode: 0, ResultDesc: "Accepted" });
});