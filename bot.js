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
    "🌟 *Welcome to Echo Labs Professional Services* 🌟\n\nExplore our curated offerings for freelancers. Each service is designed for efficiency and results.\n\n*Payments: Secure M-Pesa or Crypto.*",
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
    bot.sendMessage(chatId, "🔄 Restarting your session. Let's begin fresh—what service interests you today?", { parse_mode: "Markdown" });
    showMainMenu(chatId);
    return;
  }

  // Handle photo uploads for crypto proof
  if (msg.photo && userState.get(chatId)?.step === "uploadProof") {
    bot.sendMessage(chatId, "📸 Transaction proof received. Our team will verify and deliver your service promptly. Thank you for your business!", {
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

  // Specific step validations with professional tone
  switch (state.step) {
    case "enterPhone":
      if (/^2547\d{8}$/.test(text)) {
        state.phone = text;
        bot.sendMessage(chatId, `📱 Number confirmed: ${text}. Proceeding to generate your secure payment prompt.`, {
          parse_mode: "Markdown",
          reply_markup: {
            inline_keyboard: [
              [{ text: "✅ Authorize Prompt", callback_data: `confirmPhone_${text}` }],
              [{ text: "✏️ Update Number", callback_data: "changePhone" }],
            ],
          },
        });
      } else if (text !== "start") {
        bot.sendMessage(chatId, "⚠️ Invalid format detected. Please provide a valid Kenyan M-Pesa number in the format 2547XXXXXXXX. We're here to assist—try again.", {
          parse_mode: "Markdown",
        });
      }
      break;

    case "fulluQuantity":
      const qty = parseInt(text);
      if (qty >= 1 && qty <= 1000) {
        state.quantity = qty;
        state.finalPrice = qty * 150;
        bot.sendMessage(chatId, `🧾 Order summary: ${qty} Fullu units at Ksh 150 each, totaling Ksh ${state.finalPrice}. This configuration suits your requirements.`, {
          parse_mode: "Markdown",
          reply_markup: {
            inline_keyboard: [
              [{ text: "💳 Finalize Payment", callback_data: "choosePayment" }],
              [{ text: "🔙 Modify Quantity", callback_data: "backToService" }],
            ],
          },
        });
        state.step = "confirmOrder";
      } else if (text !== "start") {
        bot.sendMessage(chatId, "⚠️ Quantity out of range. Specify a value between 1 and 1000. Precision ensures accurate fulfillment—please retry.", {
          parse_mode: "Markdown",
        });
      }
      break;

    case "usaOtherCode":
      state.codeRequest = text;
      state.finalPrice = 150;
      bot.sendMessage(chatId, `🔑 Verified request: "${text}". Provisioning a dedicated USA number for this purpose at Ksh 150.`, {
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [{ text: "💳 Process Order", callback_data: "choosePayment" }],
            [{ text: "🔙 Revise Request", callback_data: "backToService" }],
          ],
        },
      });
      state.step = "confirmOrder";
      break;

    case "websiteDetails":
      state.websiteDetails = text;
      bot.sendMessage(chatId, `🌐 Project specifications noted: ${text}. Estimated development cost: Ksh 10,000. This aligns with professional standards.`, {
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [{ text: "💳 Initiate Development", callback_data: "choosePayment" }],
            [{ text: "🔙 Refine Specifications", callback_data: "backToService" }],
          ],
        },
      });
      state.step = "confirmOrder";
      break;

    case "botDetails":
      state.botDetails = text;
      bot.sendMessage(chatId, `🤖 Bot requirements documented: ${text}. Custom build priced at Ksh 15,000. Ready for execution.`, {
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [{ text: "💳 Commence Build", callback_data: "choosePayment" }],
            [{ text: "🔙 Update Requirements", callback_data: "backToService" }],
          ],
        },
      });
      state.step = "confirmOrder";
      break;

    case "bmCredentials":
      state.bmCredentials = text;
      bot.sendMessage(chatId, `🔒 Credentials securely received. BM verification process at Ksh 5,000. Confidentiality assured.`, {
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [{ text: "💳 Authorize Verification", callback_data: "choosePayment" }],
            [{ text: "🔙 Back", callback_data: "backToService" }],
          ],
        },
      });
      state.step = "confirmOrder";
      break;

    case "writingDetails":
      state.writingDetails = text;
      state.finalPrice = 2500;
      bot.sendMessage(chatId, `✍️ Writing brief confirmed: ${text}. Professional delivery for Ksh 2,500.`, {
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [{ text: "💳 Assign Writer", callback_data: "choosePayment" }],
            [{ text: "🔙 Edit Brief", callback_data: "backToService" }],
          ],
        },
      });
      state.step = "confirmOrder";
      break;

    default:
      // Invalid input → Main Menu with professional redirect
      bot.sendMessage(chatId, "Input not recognized. Returning to the main menu for clarity. Which service shall we pursue?", {
        parse_mode: "Markdown",
        reply_markup: getFAQButtons(),
      });
      showMainMenu(chatId);
      break;
  }
});

// ✅ Enhanced Button Handler: Professional Flows with Researched Examples
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
    bot.sendMessage(chatId, "❓ *Professional FAQs*\n\n💳 *Payment Options:* M-Pesa for instant local processing; Crypto for global flexibility.\n⏱️ *Turnaround:* 24-48 hours standard.\n🔒 *Compliance:* Full GDPR/HIPAA adherence.\n\nFurther inquiries welcome.", {
      parse_mode: "Markdown",
      reply_markup: getFAQButtons(),
    });
    return;
  }
  if (data === "faq_payment") {
    bot.sendMessage(chatId, "💳 *Payment Protocol*\n\n📲 *M-Pesa:* Prompt-based PIN entry for seamless authorization.\n🪙 *Crypto:* Blockchain-verified transfers to designated wallets, followed by proof upload.\n\nEfficiency and security prioritized.", {
      parse_mode: "Markdown",
      reply_markup: getFAQButtons(),
    });
    return;
  }
  if (data === "backToService") {
    handleServiceSelection(chatId, state.serviceId);
    return;
  }

  // Service Selection: Professional Intro + Buttons
  if (data.startsWith("service_")) {
    const serviceId = parseInt(data.split("_")[1]);
    const service = services.find((s) => s.id === serviceId);
    if (!service) return;

    state.service = service;
    state.serviceId = serviceId;
    state.finalPrice = service.price || 0;

    bot.sendMessage(chatId, `Selected: ${service.name}. This service equips freelancers with industry-leading tools and knowledge. Proceed to customize your selection below.`, {
      parse_mode: "Markdown",
    });
    handleServiceSelection(chatId, serviceId);
    return;
  }

  // Transcription Training: Buttons First, Then Researched Details on Click
  if (data.startsWith("trans_")) {
    const platform = data.split("_")[1];
    let description = "";
    switch (platform) {
      case "rev":
        description = "Rev specializes in high-accuracy human and AI-assisted transcription for freelancers. Examples: Podcast transcripts, legal depositions, or video captions—earn up to $1.50/minute with flexible hours.";
        break;
      case "gotranscript":
        description = "GoTranscript offers 99.4% accurate 100% human transcription in 40+ languages. Ideal for freelancers handling academic papers, interviews, or subtitles—rates from $0.60/minute with global demand.";
        break;
      case "verbit":
        description = "Verbit combines AI with human expertise for media transcription and captioning. Freelancers thrive on live broadcasts, films, or e-learning content—fast turnaround and hybrid model for efficiency.";
        break;
      case "aimedia":
        description = "AI-Media focuses on accessible captioning and transcription for broadcasts and videos. Perfect for freelancers in subtitling, live events, or compliance work—emphasizes accuracy in diverse accents.";
        break;
      default:
        description = "Platform-specific training for optimal performance.";
    }
    state.platform = platform;
    state.finalPrice = 1500;
    bot.sendMessage(chatId, `${platform.toUpperCase()} Training Overview: ${description}\n\nThis tailored program enhances your skills for immediate application. Proceed professionally.`, {
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [{ text: "💳 Acquire Training", callback_data: "choosePayment" }],
          [{ text: "🔙 Select Another Platform", callback_data: "backToService" }],
        ],
      },
    });
    state.step = "confirmOrder";
    return;
  }

  // Transcription Link: Buttons for Type, Then Accounts with Details
  if (data === "link_private" || data === "link_public") {
    state.linkType = data === "link_private" ? "Private Exclusive" : "Public";
    state.finalPrice = data === "link_private" ? 800 : 300;
    bot.sendMessage(chatId, `${state.linkType} Application Links: Provides direct access to premium opportunities. Select your target platform for the customized link.`, {
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
        description = "Rev link: Access freelance transcription gigs with human/AI hybrid model—ideal for quick earnings on diverse audio.";
        break;
      case "gotranscript":
        description = "GoTranscript link: Join for human-only transcription in multiple languages—suits detailed projects like research transcripts.";
        break;
      case "verbit":
        description = "Verbit link: Enter AI-enhanced captioning roles—focus on media and live content for broadcasters.";
        break;
      case "aimedia":
        description = "AI-Media link: Secure positions in accessible transcription—specializing in subtitles for videos and events.";
        break;
      default:
        description = "Platform-specific access.";
    }
    state.account = platform;
    bot.sendMessage(chatId, `${state.linkType} for ${platform.toUpperCase()}: ${description}\n\nKsh ${state.finalPrice}. Instant activation post-payment.`, {
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [{ text: "💳 Obtain Link", callback_data: "choosePayment" }],
          [{ text: "🔙 Change Platform", callback_data: "backToService" }],
        ],
      },
    });
    state.step = "confirmOrder";
    return;
  }

  // Remote AI Jobs: Buttons for Jobs, Then Researched Details
  if (data.startsWith("ai_")) {
    const job = data.split("_")[1];
    let description = "";
    switch (job) {
      case "handshake":
        description = "Handshake AI: Paid fellowship for AI model validation—no experience needed. Examples: Review AI responses for accuracy in career advice datasets.";
        break;
      case "uber":
        description = "Uber AI: Training roles in autonomous systems. Examples: Annotate driving data or evaluate NLP for ride-sharing queries.";
        break;
      case "evaluator":
        description = "AI English Evaluator: Assess AI-generated writing. Examples: Rate essays for grammar, coherence in educational tools.";
        break;
      case "sigma":
        description = "Sigma AI: Linguistic projects for English speakers. Examples: Validate translations or sentiment analysis in chatbots.";
        break;
      case "surge":
        description = "Surge AI: Data annotation for advanced models. Examples: Label images/text for ethical AI training.";
        break;
      case "rws":
        description = "RWS Train AI: Freelance data tasks for AI improvement. Examples: Transcribe multilingual audio or tag entities.";
        break;
      case "welocalize":
        description = "Welocalize: AI training via annotation. Examples: Categorize search results or moderate content.";
        break;
      case "playment":
        description = "Playment: Gamified data labeling. Examples: Annotate videos for computer vision in gaming AI.";
        break;
      case "alignerr":
        description = "Alignerr: Expert-led AI training. Examples: Refine voice models or evaluate domain-specific queries.";
        break;
      default:
        description = "Job-specific training.";
    }
    state.job = job.replace(/_/g, ' ').toUpperCase();
    bot.sendMessage(chatId, `${state.job} Training: ${description}\n\nKsh 2,000. Comprehensive preparation for remote success.`, {
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [{ text: "💳 Enroll in Training", callback_data: "choosePayment" }],
          [{ text: "🔙 Select Different Job", callback_data: "backToService" }],
        ],
      },
    });
    state.step = "confirmOrder";
    return;
  }

  // Proxies: Country Buttons, Then Subscription
  if (data.startsWith("proxy_")) {
    state.country = data.split("_")[1].toUpperCase();
    bot.sendMessage(chatId, `Proxies for ${state.country}: Enterprise-grade IP rotation for unrestricted access. Select duration for optimal coverage.`, {
      parse_mode: "Markdown",
      reply_markup: { inline_keyboard: SUB_FLOWS.proxies.subscriptions },
    });
    state.step = "chooseSub";
    return;
  }
  if (data === "sub_monthly" || data === "sub_weekly") {
    state.subscription = data === "sub_monthly" ? "Monthly" : "Weekly";
    state.finalPrice = data === "sub_monthly" ? 2500 : 800;
    bot.sendMessage(chatId, `${state.subscription} Subscription for ${state.country} Proxies: Unlimited bandwidth, 99.9% uptime. Ksh ${state.finalPrice}.`, {
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [{ text: "💳 Subscribe", callback_data: "choosePayment" }],
          [{ text: "🔙 Alter Subscription", callback_data: "backToService" }],
        ],
      },
    });
    state.step = "confirmOrder";
    return;
  }

  // USA Numbers: Purpose Buttons
  if (data === "num_whatsapp") {
    state.numType = "WhatsApp";
    state.finalPrice = 1000;
    bot.sendMessage(chatId, `USA Number for WhatsApp: VoIP-enabled for international verification. Ksh 1,000. Includes activation guide.`, {
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [{ text: "💳 Provision Number", callback_data: "choosePayment" }],
          [{ text: "🔙 Back", callback_data: "backToService" }],
        ],
      },
    });
    state.step = "confirmOrder";
    return;
  }
  if (data === "num_other") {
    state.step = "usaOtherCode";
    bot.sendMessage(chatId, `USA Number for Other Verifications: Versatile for SMS/voice codes. Specify the service (e.g., 'Gmail recovery') for tailored setup.`, {
      parse_mode: "Markdown",
      reply_markup: getFAQButtons(),
    });
    return;
  }

  // Other Services: Direct with Professional Confirm
  if (state.service?.subFlow === "website_dev") {
    state.step = "websiteDetails";
    bot.sendMessage(chatId, `Website Development: Full-stack solutions from concept to launch. Provide details (e.g., features, design preferences) for a precise quote.`, {
      parse_mode: "Markdown",
      reply_markup: getFAQButtons(),
    });
    return;
  }

  if (state.service?.subFlow === "bot_dev") {
    state.step = "botDetails";
    bot.sendMessage(chatId, `Bot Development: Custom automation tailored to your workflow. Describe functionality (e.g., integrations, triggers) for optimal design.`, {
      parse_mode: "Markdown",
      reply_markup: getFAQButtons(),
    });
    return;
  }

  if (state.service?.subFlow === "bm_verification") {
    state.step = "bmCredentials";
    bot.sendMessage(chatId, `BM Verification: Thorough account validation with compliance checks. Submit credentials securely for processing at Ksh 5,000.`, {
      parse_mode: "Markdown",
      reply_markup: getFAQButtons(),
    });
    return;
  }

  if (state.service?.subFlow === "onlyfans_training") {
    bot.sendMessage(chatId, `OnlyFans Training: Strategic guidance on profile optimization and revenue streams. Ksh 3,000. Professional roadmap included.`, {
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [{ text: "💳 Access Training", callback_data: "choosePayment" }],
          [{ text: "🔙 Back", callback_data: "backToService" }],
        ],
      },
    });
    state.step = "confirmOrder";
    return;
  }

  if (state.service?.subFlow === "freelance_writing") {
    state.step = "writingDetails";
    bot.sendMessage(chatId, `Freelance Writing: SEO-optimized, original content. Specify scope (topic, length, tone) for bespoke delivery at Ksh 2,500.`, {
      parse_mode: "Markdown",
      reply_markup: getFAQButtons(),
    });
    return;
  }

  if (state.service?.subFlow === "graphic_design") {
    bot.sendMessage(chatId, `Graphic Design: Vector-based, brand-aligned visuals. Choose category for specialized options.`, {
      parse_mode: "Markdown",
      reply_markup: { inline_keyboard: SUB_FLOWS.graphic_design.types },
    });
    state.step = "graphicType";
    return;
  }
  if (data.startsWith("graphic_")) {
    state.graphicType = data.split("_")[1].toUpperCase();
    state.finalPrice = 3500;
    bot.sendMessage(chatId, `${state.graphicType} Design: High-resolution deliverables in Adobe formats. Ksh 3,500. Revisions included.`, {
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [{ text: "💳 Commission Design", callback_data: "choosePayment" }],
          [{ text: "🔙 Select Alternative", callback_data: "backToService" }],
        ],
      },
    });
    state.step = "confirmOrder";
    return;
  }

  if (state.service?.subFlow === "social_media") {
    bot.sendMessage(chatId, `Social Media Management: Data-driven growth strategies. Select platform for targeted execution.`, {
      parse_mode: "Markdown",
      reply_markup: { inline_keyboard: SUB_FLOWS.social_media.platforms },
    });
    state.step = "socialPlatform";
    return;
  }
  if (data.startsWith("social_")) {
    state.socialPlatform = data.split("_")[1].toUpperCase();
    state.finalPrice = 4000;
    bot.sendMessage(chatId, `${state.socialPlatform} Management: Analytics, content calendar, engagement protocols. Ksh 4,000/month.`, {
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [{ text: "💳 Engage Services", callback_data: "choosePayment" }],
          [{ text: "🔙 Platform Switch", callback_data: "backToService" }],
        ],
      },
    });
    state.step = "confirmOrder";
    return;
  }

  // Payment Flow: Professional
  if (data === "choosePayment") {
    bot.sendMessage(chatId, `Order Summary: ${state.service.name} at Ksh ${state.finalPrice}.\n\nSelect payment method for secure processing.`, {
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
    bot.sendMessage(chatId, `M-Pesa selected. Provide your registered number (2547XXXXXXXX) to receive the authorization prompt.`, {
      parse_mode: "Markdown",
      reply_markup: getFAQButtons(),
    });
    return;
  }
  if (data === "pay_crypto") {
    state.step = "uploadProof";
    bot.sendMessage(chatId, `Crypto selected. Transfer Ksh ${state.finalPrice} equivalent to BTC: 1ABCyourBTCwallet or USDT: TGyourTRC20wallet. Upload confirmation for validation.`, {
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
    bot.sendMessage(chatId, `Number update requested. Enter the correct M-Pesa number: 2547XXXXXXXX.`, { parse_mode: "Markdown" });
    return;
  }
});

// ✅ Service Selection Handler: Buttons with Professional Intro
function handleServiceSelection(chatId, serviceId) {
  const subFlow = services.find(s => s.id === serviceId)?.subFlow;
  const state = userState.get(chatId);

  switch (subFlow) {
    case "transcription_training":
      bot.sendMessage(chatId, `Transcription Training: Elevate your skills in audio-to-text conversion for freelance excellence. Select platform for specialized curriculum.`, {
        parse_mode: "Markdown",
        reply_markup: { inline_keyboard: SUB_FLOWS[subFlow].options },
      });
      state.step = "chooseTransAccount";
      break;

    case "transcription_link":
      bot.sendMessage(chatId, `Application Links: Streamlined access to transcription opportunities. Choose link type for your strategic entry.`, {
        parse_mode: "Markdown",
        reply_markup: { inline_keyboard: SUB_FLOWS[subFlow].initialOptions },
      });
      state.step = "chooseLinkType";
      break;

    case "remote_ai_jobs":
      bot.sendMessage(chatId, `Remote AI Jobs Training: Prepare for high-demand roles in AI data handling. Browse programs for your expertise level.`, {
        parse_mode: "Markdown",
        reply_markup: { inline_keyboard: SUB_FLOWS[subFlow].options },
      });
      state.step = "chooseAIJob";
      break;

    case "proxies":
      bot.sendMessage(chatId, `Proxies: Secure, high-speed IP solutions for global freelancing. Choose location for region-specific performance.`, {
        parse_mode: "Markdown",
        reply_markup: { inline_keyboard: SUB_FLOWS[subFlow].countries },
      });
      state.step = "chooseCountry";
      break;

    case "fullu":
      state.step = "fulluQuantity";
      bot.sendMessage(chatId, `Fullu Units: Scalable digital assets for verification and access. Indicate quantity (1-1000) for precise allocation.`, {
        parse_mode: "Markdown",
        reply_markup: getFAQButtons(),
      });
      break;

    case "usa_numbers":
      bot.sendMessage(chatId, `USA Numbers: Premium VoIP for international compliance. Specify purpose for optimized configuration.`, {
        parse_mode: "Markdown",
        reply_markup: { inline_keyboard: SUB_FLOWS[subFlow].options },
      });
      state.step = "chooseNumType";
      break;

    case "remote_work_apply":
      bot.sendMessage(chatId, `Remote Work Application Training: Master resumes and interviews for global positions. Ksh 1,800.`, {
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [{ text: "💳 Purchase Guide", callback_data: "choosePayment" }],
            [{ text: "🔙 Back", callback_data: "backToService" }],
          ],
        },
      });
      state.step = "confirmOrder";
      break;

    default:
      bot.sendMessage(chatId, `${state.service.name}: Premium service at Ksh ${state.finalPrice}. Full support provided.`, {
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [{ text: "💳 Proceed", callback_data: "choosePayment" }],
            [{ text: "🔙 Menu", callback_data: "restart_menu" }],
          ],
        },
      });
      state.step = "confirmOrder";
      break;
  }
}

// ✅ Enhanced STK Push
async function sendStkPush(chatId, phone, state) {
  const loadingMsg = await bot.sendMessage(chatId, `Generating M-Pesa prompt for ${phone}. Authorization required for Ksh ${state.finalPrice}.`, { parse_mode: "Markdown" });

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
      await bot.editMessageText(`Prompt dispatched successfully. Complete authorization via PIN entry. Confirmation forthcoming.`, {
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
    await bot.editMessageText(`Prompt generation unsuccessful. Recommend retry or alternative method. Support available.`, {
      chat_id: chatId,
      message_id: loadingMsg.message_id,
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [{ text: "🔄 Retry", callback_data: "pay_mpesa" }],
          [{ text: "🪙 Crypto Alternative", callback_data: "pay_crypto" }],
          [{ text: "📞 Assistance", url: "https://t.me/Luqman2893" }],
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
        await bot.sendMessage(chatId, `Transaction validated: Ksh ${amount} (Receipt: ${receipt}). ${state.service.name} fulfillment initiated. Delivery within 24 hours.`, {
          parse_mode: "Markdown",
          reply_markup: { inline_keyboard: [[{ text: "🏠 Additional Services", callback_data: "restart_menu" }]] },
        });
        userState.delete(chatId);
        break;
      }
    }
  } else {
    for (let [chatId] of userState.entries()) {
      bot.sendMessage(chatId, `Authorization pending. Reattempt or consult support for alternatives.`, {
        parse_mode: "Markdown",
        reply_markup: { inline_keyboard: [[{ text: "🔄 Reattempt", callback_data: "restart_menu" }]] },
      }).catch(err => console.error(`Send error:`, err));
    }
  }

  res.json({ ResultCode: 0, ResultDesc: "Accepted" });
});

// ✅ Start Command: Professional Welcome
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  userState.delete(chatId);
  bot.sendMessage(chatId, `Greetings. Echo Labs delivers professional freelancing solutions. Explore services below to advance your objectives.`, {
    parse_mode: "Markdown",
  });
  showMainMenu(chatId);
});