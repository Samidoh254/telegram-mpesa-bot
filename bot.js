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
      { text: "🔒 Private Exclusive (Ksh 800)", callback_data: "link_private" },
      { text: "🌐 Public (Ksh 300)", callback_data: "link_public" },
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
      { text: "📝 AI English Evaluator", callback_data: "ai_evaluator" },
      { text: "📊 Sigma AI", callback_data: "ai_sigma" },
      { text: "⚡ Surge AI", callback_data: "ai_surge" },
      { text: "🔄 RWS Train AI", callback_data: "ai_rws" },
      { text: "🌍 Welocalize", callback_data: "ai_welocalize" },
      { text: "🎮 Playment", callback_data: "ai_playment" },
      { text: "📐 Aligner", callback_data: "ai_aligner" },
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

// ✅ Concise Main Menu
function showMainMenu(chatId) {
  const buttons = services.map((s) => [{ text: `${s.name} — Ksh ${s.price || 'Varies'}`, callback_data: `service_${s.id}` }]);
  buttons.push([{ text: "💬 Support", url: "https://t.me/Luqman2893" }]);
  buttons.push([{ text: "❓ FAQs", callback_data: "show_faq" }]);

  bot.sendMessage(
    chatId,
    "🌟 *Echo Labs Services* 🌟\n\nSelect a service:\n\n*Secure payments via M-Pesa or Crypto.*",
    {
      parse_mode: "Markdown",
      reply_markup: { inline_keyboard: buttons },
    }
  );

  userState.set(chatId, { step: "chooseService" });
}

// ✅ Enhanced Message Handler: Handle "Start" Restart, Strict Validations
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
    bot.sendMessage(chatId, "📸 Proof received. Verification in 24h. Great choice—let's get your service ready!", {
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

  // Specific step validations with conversational tone
  switch (state.step) {
    case "enterPhone":
      if (/^2547\d{8}$/.test(text)) {
        state.phone = text;
        bot.sendMessage(chatId, `Excellent! Confirming your number: ${text}. Ready to send the payment prompt?`, {
          parse_mode: "Markdown",
          reply_markup: {
            inline_keyboard: [
              [{ text: "✅ Yes, Send Prompt", callback_data: `confirmPhone_${text}` }],
              [{ text: "✏️ Change Number", callback_data: "changePhone" }],
            ],
          },
        });
      } else if (text !== "start") { // Ignore "start" as handled above
        bot.sendMessage(chatId, "⚠️ Invalid number. Please enter exactly: 2547XXXXXXXX (e.g., 254712345678). We're almost there—try again!", {
          parse_mode: "Markdown",
        });
      }
      break;

    case "fulluQuantity":
      const qty = parseInt(text);
      if (qty >= 1 && qty <= 1000) {
        state.quantity = qty;
        state.finalPrice = qty * 150;
        bot.sendMessage(chatId, `Perfect selection! ${qty} Fullu at Ksh 150 each totals Ksh ${state.finalPrice}. Excited to fulfill your order—what's next?`, {
          parse_mode: "Markdown",
          reply_markup: {
            inline_keyboard: [
              [{ text: "💳 Proceed to Payment", callback_data: "choosePayment" }],
              [{ text: "🔙 Adjust Quantity", callback_data: "backToService" }],
            ],
          },
        });
        state.step = "confirmOrder";
      } else if (text !== "start") {
        bot.sendMessage(chatId, "⚠️ Invalid quantity. Please enter a number between 1-1000. Tell me how many you'd like!", {
          parse_mode: "Markdown",
        });
      }
      break;

    case "usaOtherCode":
      state.codeRequest = text;
      state.finalPrice = 150;
      bot.sendMessage(chatId, `Got it—your request for "${text}" sounds spot on. That's Ksh 150. Shall we proceed to secure it for you?`, {
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [{ text: "💳 Yes, Pay Now", callback_data: "choosePayment" }],
            [{ text: "🔙 Back", callback_data: "backToService" }],
          ],
        },
      });
      state.step = "confirmOrder";
      break;

    case "websiteDetails":
      state.websiteDetails = text;
      bot.sendMessage(chatId, `Wonderful idea! A ${text} website for Ksh 10,000. Let's build something amazing—ready to get started?`, {
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [{ text: "💳 Secure & Pay", callback_data: "choosePayment" }],
            [{ text: "🔙 Refine Details", callback_data: "backToService" }],
          ],
        },
      });
      state.step = "confirmOrder";
      break;

    case "botDetails":
      state.botDetails = text;
      bot.sendMessage(chatId, `Love that concept—a ${text} bot for Ksh 15,000. We're experts at this; excited to bring it to life! Proceed?`, {
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [{ text: "💳 Yes, Let's Build", callback_data: "choosePayment" }],
            [{ text: "🔙 Adjust Specs", callback_data: "backToService" }],
          ],
        },
      });
      state.step = "confirmOrder";
      break;

    case "bmCredentials":
      state.bmCredentials = text;
      bot.sendMessage(chatId, `Thanks for trusting us with your details. BM Verification at Ksh 5,000—your account will be verified swiftly. Pay to begin?`, {
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [{ text: "💳 Confirm Payment", callback_data: "choosePayment" }],
            [{ text: "🔙 Back", callback_data: "backToService" }],
          ],
        },
      });
      state.step = "confirmOrder";
      break;

    case "writingDetails":
      state.writingDetails = text;
      state.finalPrice = 2500;
      bot.sendMessage(chatId, `Fantastic topic: ${text}. We'll craft high-quality content for Ksh 2,500. Sound good? Let's make it happen!`, {
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [{ text: "💳 Start Writing", callback_data: "choosePayment" }],
            [{ text: "🔙 Edit Request", callback_data: "backToService" }],
          ],
        },
      });
      state.step = "confirmOrder";
      break;

    default:
      // Any other input → Main Menu with conversational nudge
      bot.sendMessage(chatId, `Hmm, that doesn't quite match what I expected. No worries—let's head back to the main menu to explore options. What catches your eye today?`, {
        parse_mode: "Markdown",
        reply_markup: getFAQButtons(),
      });
      showMainMenu(chatId);
      break;
  }
});

// ✅ Enhanced Button Handler: Conversational Flows with Narrowing
bot.on("callback_query", async (query) => {
  const chatId = query.message.chat.id;
  const data = query.data;
  await bot.answerCallbackQuery(query.id);

  let state = userState.get(chatId);
  if (!state) {
    state = { step: "chooseService" };
    userState.set(chatId, state);
  }

  // Global handlers
  if (data === "restart_menu") {
    showMainMenu(chatId);
    return;
  }
  if (data === "show_faq") {
    bot.sendMessage(chatId, "❓ *Quick FAQs*\n\n💳 *Payments:* M-Pesa (enter PIN) or Crypto (upload proof).\n⏱️ *Delivery:* 24-48 hours.\n🔒 *Secure:* Your data is protected.\n\nGot questions? I'm here! 😊", {
      parse_mode: "Markdown",
      reply_markup: getFAQButtons(),
    });
    return;
  }
  if (data === "faq_payment") {
    bot.sendMessage(chatId, "💳 *Payment Made Easy*\n\n📲 *M-Pesa:* We'll send a prompt—enter your PIN.\n🪙 *Crypto:* Send to BTC: 1ABCyourBTCwallet or USDT: TGyourTRC20wallet, then share proof.\n\nReady when you are!", {
      parse_mode: "Markdown",
      reply_markup: getFAQButtons(),
    });
    return;
  }
  if (data === "backToService") {
    handleServiceSelection(chatId, state.serviceId);
    return;
  }

  // Service Selection: Start Conversational Flow
  if (data.startsWith("service_")) {
    const serviceId = parseInt(data.split("_")[1]);
    const service = services.find((s) => s.id === serviceId);
    if (!service) return;

    state.service = service;
    state.serviceId = serviceId;
    state.finalPrice = service.price || 0;

    bot.sendMessage(chatId, `Great choice on ${service.name}! 😊 This can really boost your freelancing. Let's narrow it down—what specific aspect are you most interested in?`, {
      parse_mode: "Markdown",
    });
    handleServiceSelection(chatId, serviceId);
    return;
  }

  // Transcription Training: Narrow to Account
  if (data.startsWith("trans_")) {
    state.account = data.split("_")[1].toUpperCase();
    state.finalPrice = 1500;
    bot.sendMessage(chatId, `Smart pick—${state.account} training is in high demand! We'll cover applications, tips, and insider strategies. Any particular challenges you're facing with it? (Optional, or proceed.) Price: Ksh 1,500.`, {
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [{ text: "💳 Proceed to Payment", callback_data: "choosePayment" }],
          [{ text: "🔙 Explore More", callback_data: "backToService" }],
        ],
      },
    });
    state.step = "confirmOrder";
    return;
  }

  // Transcription Link: Narrow to Type then Account
  if (data === "link_private" || data === "link_public") {
    state.linkType = data === "link_private" ? "Private Exclusive" : "Public";
    state.finalPrice = data === "link_private" ? 800 : 300;
    bot.sendMessage(chatId, `Excellent—${state.linkType} links give you that edge! Which transcription platform are you targeting? This will get you the perfect fit.`, {
      parse_mode: "Markdown",
      reply_markup: { inline_keyboard: SUB_FLOWS.transcription_link.accounts },
    });
    state.step = "chooseAccount";
    return;
  }
  if (data.startsWith("account_")) {
    state.account = data.split("_")[1].toUpperCase();
    bot.sendMessage(chatId, `Spot on! ${state.linkType} for ${state.account} at Ksh ${state.finalPrice}. You'll have direct access—imagine the opportunities! Ready to grab it?`, {
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [{ text: "💳 Secure the Link", callback_data: "choosePayment" }],
          [{ text: "🔙 Adjust", callback_data: "backToService" }],
        ],
      },
    });
    state.step = "confirmOrder";
    return;
  }

  // Remote AI Jobs: Narrow to Specific Job
  if (data.startsWith("ai_")) {
    state.job = data.split("_")[1].replace(/_/g, ' ').toUpperCase();
    bot.sendMessage(chatId, `Thrilling! ${state.job} training is a game-changer for remote work. We'll dive into resumes, interviews, and exclusive tips. What's your experience level with AI tasks? (Share if you'd like, or proceed.) Price: Ksh 2,000.`, {
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [{ text: "💳 Start Learning", callback_data: "choosePayment" }],
          [{ text: "🔙 Choose Another", callback_data: "backToService" }],
        ],
      },
    });
    state.step = "confirmOrder";
    return;
  }

  // Proxies: Narrow to Country then Subscription
  if (data.startsWith("proxy_")) {
    state.country = data.split("_")[1].toUpperCase();
    bot.sendMessage(chatId, `Reliable proxies for ${state.country}—perfect for unrestricted access! Now, how long do you need it for? This ensures seamless freelancing.`, {
      parse_mode: "Markdown",
      reply_markup: { inline_keyboard: SUB_FLOWS.proxies.subscriptions },
    });
    state.step = "chooseSub";
    return;
  }
  if (data === "sub_monthly" || data === "sub_weekly") {
    state.subscription = data === "sub_monthly" ? "Monthly" : "Weekly";
    state.finalPrice = data === "sub_monthly" ? 2500 : 800;
    bot.sendMessage(chatId, `${state.subscription} plan for ${state.country} proxies at Ksh ${state.finalPrice}. High-speed and secure—ideal for your needs! Shall we activate?`, {
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [{ text: "💳 Activate Now", callback_data: "choosePayment" }],
          [{ text: "🔙 Change Plan", callback_data: "backToService" }],
        ],
      },
    });
    state.step = "confirmOrder";
    return;
  }

  // USA Numbers: Narrow to Purpose
  if (data === "num_whatsapp") {
    state.numType = "WhatsApp";
    state.finalPrice = 1000;
    bot.sendMessage(chatId, `USA number for WhatsApp—unlocks global chats! At Ksh 1,000, you'll get it instantly. Any specific use case in mind? Proceed whenever ready.`, {
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
    bot.sendMessage(chatId, `Versatile USA numbers for verifications—smart move! What exact service or code do you need it for? (e.g., 'SMS for Gmail'). I'm here to tailor it perfectly.`, {
      parse_mode: "Markdown",
      reply_markup: getFAQButtons(),
    });
    return;
  }

  // Website Dev: Narrow to Details
  if (state.service?.subFlow === "website_dev") {
    state.step = "websiteDetails";
    bot.sendMessage(chatId, `Website development—let's create your digital presence! Tell me more: What type of site (e.g., e-commerce, portfolio)? Features? Budget notes? The more details, the better I can customize.`, {
      parse_mode: "Markdown",
      reply_markup: getFAQButtons(),
    });
    return;
  }

  // Bot Dev: Narrow to Details
  if (state.service?.subFlow === "bot_dev") {
    state.step = "botDetails";
    bot.sendMessage(chatId, `Custom bot development—automation at its best! Describe your vision: Platform (e.g., Telegram)? Functions? This will make it spot-on for you.`, {
      parse_mode: "Markdown",
      reply_markup: getFAQButtons(),
    });
    return;
  }

  // BM Verification: Narrow to Credentials
  if (state.service?.subFlow === "bm_verification") {
    state.step = "bmCredentials";
    bot.sendMessage(chatId, `BM verification—secure and swift! Share your credentials (email/password) safely here. We'll handle the rest confidentially. What's the account for? (Optional insight.) Price: Ksh 5,000.`, {
      parse_mode: "Markdown",
      reply_markup: getFAQButtons(),
    });
    return;
  }

  // OnlyFans Training: Conversational Confirm
  if (state.service?.subFlow === "onlyfans_training") {
    bot.sendMessage(chatId, `OnlyFans training—empower your content game! Setup, strategies, monetization secrets for Ksh 3,000. What's your goal—new account or scaling? Proceed to unlock tips.`, {
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [{ text: "💳 Enroll & Pay", callback_data: "choosePayment" }],
          [{ text: "🔙 Back", callback_data: "backToService" }],
        ],
      },
    });
    state.step = "confirmOrder";
    return;
  }

  // Freelance Writing: Narrow to Details
  if (state.service?.subFlow === "freelance_writing") {
    state.step = "writingDetails";
    bot.sendMessage(chatId, `Freelance writing services—your words, our craft! Share details: Topic? Word count? Style (e.g., SEO, creative)? We'll deliver polished work for Ksh 2,500.`, {
      parse_mode: "Markdown",
      reply_markup: getFAQButtons(),
    });
    return;
  }

  // Graphic Design: Narrow to Type
  if (state.service?.subFlow === "graphic_design") {
    bot.sendMessage(chatId, `Graphic design—visuals that captivate! What type suits your project? We'll refine based on your vision.`, {
      parse_mode: "Markdown",
      reply_markup: { inline_keyboard: SUB_FLOWS.graphic_design.types },
    });
    state.step = "graphicType";
    return;
  }
  if (data.startsWith("graphic_")) {
    state.graphicType = data.split("_")[1].toUpperCase();
    state.finalPrice = 3500;
    bot.sendMessage(chatId, `${state.graphicType} design—tailored just for you at Ksh 3,500. Colors, style preferences? (Tell me more, or proceed.)`, {
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [{ text: "💳 Design It", callback_data: "choosePayment" }],
          [{ text: "🔙 Refine", callback_data: "backToService" }],
        ],
      },
    });
    state.step = "confirmOrder";
    return;
  }

  // Social Media: Narrow to Platform
  if (state.service?.subFlow === "social_media") {
    bot.sendMessage(chatId, `Social media management—grow your audience effortlessly! Which platform to focus on? We'll strategize content and engagement.`, {
      parse_mode: "Markdown",
      reply_markup: { inline_keyboard: SUB_FLOWS.social_media.platforms },
    });
    state.step = "socialPlatform";
    return;
  }
  if (data.startsWith("social_")) {
    state.socialPlatform = data.split("_")[1].toUpperCase();
    state.finalPrice = 4000;
    bot.sendMessage(chatId, `${state.socialPlatform} management for Ksh 4,000/month. Goals like followers or sales? Let's amplify your brand!`, {
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [{ text: "💳 Launch Campaign", callback_data: "choosePayment" }],
          [{ text: "🔙 Switch Platform", callback_data: "backToService" }],
        ],
      },
    });
    state.step = "confirmOrder";
    return;
  }

  // Payment Flow: Conversational
  if (data === "choosePayment") {
    bot.sendMessage(chatId, `Wonderful! For ${state.service.name} at Ksh ${state.finalPrice}, how would you like to pay? We're secure and quick.`, {
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [{ text: "📲 M-Pesa (Easy PIN)", callback_data: "pay_mpesa" }],
          [{ text: "🪙 Crypto (Flexible)", callback_data: "pay_crypto" }],
        ],
      },
    });
    state.step = "choosePayment";
    return;
  }
  if (data === "pay_mpesa") {
    state.step = "enterPhone";
    bot.sendMessage(chatId, `M-Pesa it is—super convenient! Enter your number: 2547XXXXXXXX. We'll send the prompt right away for ${state.service.name}.`, {
      parse_mode: "Markdown",
      reply_markup: getFAQButtons(),
    });
    return;
  }
  if (data === "pay_crypto") {
    state.step = "uploadProof";
    bot.sendMessage(chatId, `Crypto works great for global payments! Send Ksh ${state.finalPrice} equivalent to BTC: 1ABCyourBTCwallet or USDT: TGyourTRC20wallet. Then upload the proof—I'll confirm fast.`, {
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
    bot.sendMessage(chatId, `No problem—let's get the right number. Enter: 2547XXXXXXXX for the prompt.`, { parse_mode: "Markdown" });
    return;
  }
});

// ✅ Service Selection Handler: Initiates Narrowing Conversation
function handleServiceSelection(chatId, serviceId) {
  const subFlow = services.find(s => s.id === serviceId)?.subFlow;
  const state = userState.get(chatId);

  switch (subFlow) {
    case "transcription_training":
      bot.sendMessage(chatId, `Diving into transcription training—great for steady income! Which platform excites you most? Each has unique tips we'll cover.`, {
        parse_mode: "Markdown",
        reply_markup: { inline_keyboard: SUB_FLOWS[subFlow].options },
      });
      state.step = "chooseTransAccount";
      break;

    case "transcription_link":
      bot.sendMessage(chatId, `Application links to skip the queue—smart strategy! Private exclusive or public? Private gives referral perks.`, {
        parse_mode: "Markdown",
        reply_markup: { inline_keyboard: SUB_FLOWS[subFlow].initialOptions },
      });
      state.step = "chooseLinkType";
      break;

    case "remote_ai_jobs":
      bot.sendMessage(chatId, `Remote AI jobs training—future-proof your career! Browse these opportunities; we'll train you for success in your pick.`, {
        parse_mode: "Markdown",
        reply_markup: { inline_keyboard: SUB_FLOWS[subFlow].options },
      });
      state.step = "chooseAIJob";
      break;

    case "proxies":
      bot.sendMessage(chatId, `Proxies for global access—essential for freelancing! Select your country; we'll match the best speed and security.`, {
        parse_mode: "Markdown",
        reply_markup: { inline_keyboard: SUB_FLOWS[subFlow].countries },
      });
      state.step = "chooseCountry";
      break;

    case "fullu":
      state.step = "fulluQuantity";
      bot.sendMessage(chatId, `Fullu packs—versatile tools! How many do you need (1-1000)? At Ksh 150 each, it's scalable for your projects.`, {
        parse_mode: "Markdown",
        reply_markup: getFAQButtons(),
      });
      break;

    case "usa_numbers":
      bot.sendMessage(chatId, `USA numbers for seamless verifications—bypass restrictions! For WhatsApp or other? Let's get you set up.`, {
        parse_mode: "Markdown",
        reply_markup: { inline_keyboard: SUB_FLOWS[subFlow].options },
      });
      state.step = "chooseNumType";
      break;

    case "remote_work_apply":
      bot.sendMessage(chatId, `Remote work application training—land that dream gig! Step-by-step guidance for Ksh 1,800. Any specific platforms in mind?`, {
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [{ text: "💳 Get the Guide", callback_data: "choosePayment" }],
            [{ text: "🔙 Back", callback_data: "backToService" }],
          ],
        },
      });
      state.step = "confirmOrder";
      break;

    default:
      // Fallback for direct services
      bot.sendMessage(chatId, `Solid pick on ${state.service.name} for Ksh ${state.finalPrice}. This includes full support—any questions before we proceed?`, {
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [{ text: "💳 Continue", callback_data: "choosePayment" }],
            [{ text: "🔙 Main Menu", callback_data: "restart_menu" }],
          ],
        },
      });
      state.step = "confirmOrder";
      break;
  }
}

// ✅ Enhanced STK Push with Conversational Feedback
async function sendStkPush(chatId, phone, state) {
  const loadingMsg = await bot.sendMessage(chatId, `Sending the secure prompt to ${phone} now... Check your M-Pesa app and enter the PIN. You're one step away from ${state.service.name}!`, { parse_mode: "Markdown" });

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
      await bot.editMessageText(`Prompt sent successfully! Enter your PIN to complete. I'll notify you once confirmed—exciting times ahead! 🚀`, {
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
    await bot.editMessageText(`Oops, prompt send failed. Let's try again or switch to crypto. Your satisfaction matters!`, {
      chat_id: chatId,
      message_id: loadingMsg.message_id,
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [{ text: "🔄 Retry M-Pesa", callback_data: "pay_mpesa" }],
          [{ text: "🪙 Switch to Crypto", callback_data: "pay_crypto" }],
          [{ text: "📞 Support", url: "https://t.me/Luqman2893" }],
        ],
      },
    });
  }
}

// ✅ Fixed Async Callback Handler
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
        await bot.sendMessage(chatId, `🎉 Payment confirmed! Ksh ${amount} received (Receipt: ${receipt}). Your ${state.service.name} is on the way—expect details in 24h. Thanks for choosing us; you're all set! 🌟`, {
          parse_mode: "Markdown",
          reply_markup: { inline_keyboard: [[{ text: "🏠 Explore More", callback_data: "restart_menu" }]] },
        });
        userState.delete(chatId);
        break;
      }
    }
  } else {
    for (let [chatId] of userState.entries()) {
      bot.sendMessage(chatId, `⚠️ Payment not completed yet. No rush—retry or chat with support. We're here to help! 😊`, {
        parse_mode: "Markdown",
        reply_markup: { inline_keyboard: [[{ text: "🔄 Retry", callback_data: "restart_menu" }]] },
      }).catch(err => console.error(`Send error:`, err));
    }
  }

  res.json({ ResultCode: 0, ResultDesc: "Accepted" });
});

// ✅ Start Command: Conversational Welcome
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  userState.delete(chatId);
  bot.sendMessage(chatId, `Hello! 👋 Welcome back to Echo Labs—your partner in freelancing success. What service can I help you with today? Let's make progress!`, {
    parse_mode: "Markdown",
  });
  showMainMenu(chatId);
});