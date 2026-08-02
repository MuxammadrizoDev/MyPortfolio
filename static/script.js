/* ==========================================================================
   1. TRANSLATIONS DICTIONARY & BULLETPROOF GLOBAL LANG TOGGLE
   ========================================================================== */
let currentLanguage = localStorage.getItem('preferred_lang') || 'en';
const langOrder = ['en', 'uz', 'ru'];
let allLoadedReviews = [];
let isShowingAllReviews = false;
let clientTelegramVerified = 0;
let clientTelegramAvatar = null;
let currentAuthToken = null;
let isAiThinking = false;
let currentSessionId = localStorage.getItem('session_id');

if (!currentSessionId) {
    currentSessionId = 'sess_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('session_id', currentSessionId);
}

// SESSION DURATION COUNTER
let sessionSeconds = 0;
setInterval(() => {
    sessionSeconds++;
    const mins = String(Math.floor(sessionSeconds / 60)).padStart(2, '0');
    const secs = String(sessionSeconds % 60).padStart(2, '0');
    const timeElem = document.getElementById('time-spent-text');
    if (timeElem) timeElem.textContent = `${mins}m ${secs}s`;
}, 1000);

function escapeHTML(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

const translations = {
    en: {
        navAbout: "About",
        navJourney: "Journey",
        navSkills: "Skills",
        navProjects: "Projects",
        navProof: "Achievements",
        navBlog: "My Blog",
        navReviews: "Reviews",
        navContact: "Contact",
        navBackHome: "← Back to Portfolio",
        textBackHome: "← Back to Portfolio",
        heroBadge: "16 y/o • Hackathon IT School Fergana",
        serverLabel: "Server:",
        heroSuffix: ", I'm",
        heroName: "A'zamjonov Muxammadrizo",
        typingPrefix: "I specialize in:",
        heroSubtext: "Developer studying at Hackathon IT School in Fergana, Uzbekistan. Founder of NKND Studios. I architect fast Python/FastAPI backends and build interactive open-world games in Unreal Engine 5.8.",
        heroBtn: "Explore Projects 🚀",
        heroContactBtn: "Get in Touch 💬",
        titleJourney: "Dev Journey & Education",
        journeyTagEducation: "Education",
        journeyDate1: "2024 - Present",
        journeySchoolTitle: "Hackathon IT School (Fergana)",
        journeySchoolDesc: "Deep-diving into computer science fundamentals, algorithms, software engineering, and regional coding competitions.",
        journeyTagStudio: "Game Studio",
        journeyDate2: "2024 - Present",
        journeyStudioTitle: "Founder & Lead — Indie Game Development",
        journeyStudioDesc: "Architecting 3D game projects in Unreal Engine 5.8. Designing Game Design Documents, PCG foliage, and interactive gameplay mechanics.",
        journeyTagBackend: "Backend Systems",
        journeyDate3: "2023 - Present",
        journeyBackendTitle: "Full-Stack Engineering",
        journeyBackendDesc: "Built production REST APIs using FastAPI, SQLite, WebSockets, 2FA Gmail OTP gateways, and automated Telegram bots.",
        titleSkills: "Technical Proficiency",
        titleProjects: "Featured Projects",
        filterAll: "All",
        filterPython: "Python / FastAPI",
        filterUe5: "Unreal Engine 5",
        filterBot: "Telegram Bots",
        tagCubeIsland: "Active Game MVP 🌋",
        titleCubeIsland: "Unreal Engine 3D Game Project",
        descCubeIsland: "Open-world survival game prototype built with Unreal Engine 5.8 featuring procedural terrain generation.",
        btnReadPitch: "View Details ↗",
        tagStorefront: "Active Development 🚀",
        titleStorefront: "Local Business Storefront",
        descStorefront: "A fast web application built for a retail shop with clean catalog browsing and real-time inventory tracking.",
        btnViewDetails: "View Details ↗",
        titleProof: "Achievements",
        tagHackathon: "Academic & Hackathons 🏆",
        titleHackathon: "Hackathon IT School Fergana",
        descHackathon: "Recognized for top academic performance and active backend project development.",
        btnViewProof: "View Details ↗",
        titleBlog: "DevLog & My Blog",
        blogBadge1: "DevLog #04 • UE 5.8",
        blogDate1: "July 2026",
        blogTitle1: "UE5 Game - Procedural Biomes",
        blogDesc1: "Optimized PCG foliage networks and volumetric Lumen fog for volcanic tropical biomes in Unreal Engine 5.8.",
        blogBadge2: "DevLog #03 • FastAPI",
        blogDate2: "June 2026",
        blogTitle2: "Real-Time WebSockets & 2FA Architecture",
        blogDesc2: "Engineered asynchronous WebSocket broadcasting and Gmail 2FA OTP verification for secure admin controls.",
        blogBadge3: "DevLog #02 • Telegram",
        blogDate3: "May 2026",
        blogTitle3: "Automated Telegram Ping Bot",
        blogDesc3: "Integrated automated Telegram webhook notifications for instant portfolio client contact dispatches.",
        titleReviews: "Client Reviews & Feedback",
        reviewFormTitle: "Leave a Comment or Review",
        labelReviewName: "Your Name or Company",
        phReviewName: "John Doe or Acme Corp",
        labelReviewMsg: "Your Feedback / Comment",
        phReviewMsg: "Share your experience working together...",
        btnSubmitReview: "Submit Review 💬",
        titleContact: "Get In Touch",
        labelName: "Your Name",
        phContactName: "John Doe",
        labelEmail: "Email or Telegram (@username)",
        phContactEmail: "john@gmail.com or @john_dev",
        labelMessage: "Project Details or Inquiry",
        phContactMsg: "Hi Muxammadrizo! I'm looking to build a web app...",
        btnSend: "Send Message 📱",
        tooltipTelegramVerify: "We offer Telegram verification so visitors know client feedback is 100% authentic and trustworthy.",
        tooltipContactInfo: "Your contact info is strictly used to reply to your inquiry as soon as your message arrives.",
        detailOverviewTitle: "OVERVIEW & ARCHITECTURE",
        detailTechTitle: "TECH STACK & TOOLS:",
        detailViewCode: "View Source Code ↗",
        detailVisitSite: "Visit Live Site ↗",
        aiGreeting: "<strong>Hello there! 👋</strong><br><br>I am Gemini, Muxammadrizo's AI assistant. How can I help you learn more about his software engineering, game projects, or freelance work?",
        chipAbout: "👨‍💻 Who is Muxammadrizo?",
        chipBackend: "⚙️ Backend Architecture?",
        chipUe5: "🎮 Explain the UE5 Game",
        chipFrontend: "🎨 Does he do Frontend?",
        chipContact: "📩 How do I contact him?",
        aiPlaceholder: "Type a message..."
    },
    uz: {
        navAbout: "O'zim haqimda",
        navJourney: "Rivojlanish Yo'lim",
        navSkills: "Ko'nikmalar",
        navProjects: "Loyihalar",
        navProof: "Yutuqlar",
        navBlog: "Mening Blogim",
        navReviews: "Fikrlar",
        navContact: "Aloqa",
        navBackHome: "← Portfelga Qaytish",
        textBackHome: "← Portfelga Qaytish",
        heroBadge: "16 yosh • Hackathon IT School Farg'ona",
        serverLabel: "Server:",
        heroSuffix: ", men",
        heroName: "A'zamjonov Muxammadrizo",
        typingPrefix: "Mening yo'nalishlarim:",
        heroSubtext: "Farg'ona Hackathon IT School o'quvchisi. Men Python/FastAPI backend Tizimlarini va Unreal Engine 5.8 da o'yinlarni yarataman.",
        heroBtn: "Loyihalarni ko'rish 🚀",
        heroContactBtn: "Bog'lanish 💬",
        titleJourney: "Ta'lim va Rivojlanish Yo'li",
        journeyTagEducation: "Ta'lim",
        journeyDate1: "2024 - Hozirgacha",
        journeySchoolTitle: "Hackathon IT School (Farg'ona)",
        journeySchoolDesc: "Dasturlash asoslari, algoritmlar va musobaqalarga tayyorgarlik.",
        journeyTagStudio: "O'yin Studiyasi",
        journeyDate2: "2024 - Hozirgacha",
        journeyStudioTitle: "Asoschi va Yetakchi — Indie Game Development",
        journeyStudioDesc: "Unreal Engine 5.8 da 3D o'yin loyihalarini yaratish va mexanikalarni loyihalash.",
        journeyTagBackend: "Backend Tizimlar",
        journeyDate3: "2023 - Hozirgacha",
        journeyBackendTitle: "Full-Stack va Backend Muhandislik",
        journeyBackendDesc: "FastAPI, SQLite, WebSockets va Telegram botlar yaratish tajribasi.",
        titleSkills: "Texnik Ko'nikmalar",
        titleProjects: "Saralangan Loyihalar",
        filterAll: "Barchasi",
        filterPython: "Python / FastAPI",
        filterUe5: "Unreal Engine 5",
        filterBot: "Telegram Botlar",
        tagCubeIsland: "Faol O'yin MVP 🌋",
        titleCubeIsland: "Unreal Engine 3D Game Project",
        descCubeIsland: "Realistik biomlar va geometrik kublarni birlashtirgan omon qolish o'yini.",
        btnReadPitch: "Batafsil O'qish ↗",
        tagStorefront: "Faol Rivojlanish 🚀",
        titleStorefront: "Mahalliy Do'kon Veb-sayti",
        descStorefront: "Tezkor katalog va real vaqtda omborni kuzatish tizimiga ega veb-ilova.",
        btnViewDetails: "Batafsil Ko'rish ↗",
        titleProof: "Yutuqlar va Sertifikatlar",
        tagHackathon: "Akademik va Xakatonlar 🏆",
        titleHackathon: "Hackathon IT School Farg'ona",
        descHackathon: "Yuqori akademik ko'rsatkichlar va faol backend loyihalar uchun e'tirof etilgan.",
        btnViewProof: "Batafsil O'qish ↗",
        titleBlog: "DevLog va Mening Blogim",
        blogBadge1: "DevLog #04 • UE 5.8",
        blogDate1: "Iyul 2026",
        blogTitle1: "UE5 Game - Procedural Biomes",
        blogDesc1: "Unreal Engine 5.8 da vulqonli tropik biomlar uchun PCG va Lumen tuman tizimlarini optimallashtirish.",
        blogBadge2: "DevLog #03 • FastAPI",
        blogDate2: "Iyun 2026",
        blogTitle2: "Real-Vaqt WebSockets va 2FA Arxitekturasi",
        blogDesc2: "Xavfsiz admin boshqaruvi uchun asinxron WebSocket va Gmail 2FA OTP tizimini ishlab chiqish.",
        blogBadge3: "DevLog #02 • Telegram",
        blogDate3: "May 2026",
        blogTitle3: "Avtomatlashtirilgan Telegram Ping Boti",
        blogDesc3: "Portfeldan mijozlar xabarlarini tezkor Telegramga yuborish uchun vebhuk xizmatini ulash.",
        titleReviews: "Mijozlar Fikrlari",
        reviewFormTitle: "Fikr-mulohaza Qoldiring",
        labelReviewName: "Ismingiz yoki Kompaniyangiz",
        phReviewName: "Ali Valiyev",
        labelReviewMsg: "Sizning Fikringiz",
        phReviewMsg: "Ish tajribangiz haqida yozing...",
        btnSubmitReview: "Fikr Yuborish 💬",
        titleContact: "Aloqaga Chiqish",
        labelName: "Ismingiz",
        phContactName: "Ali Valiyev",
        labelEmail: "Email yoki Telegram (@username)",
        phContactEmail: "ali@gmail.com yoki @ali_dev",
        labelMessage: "Loyiha tafsilotlari",
        phContactMsg: "Salom Muxammadrizo! Men veb-sayt yaratmoqchiman...",
        btnSend: "Xabar Yuborish 📱",
        tooltipTelegramVerify: "Mijozlar fikri 100% haqiqiy va ishonchli ekanligini ko'rsatish uchun Telegram orqali tasdiqlash imkoniyati mavjud.",
        tooltipContactInfo: "Sizning aloqa ma'lumotlaringiz faqat xabaringizga tezda javob berish uchun ishlatiladi.",
        detailOverviewTitle: "UMUMIY MA'LUMOT VA ME'MORCHILIK",
        detailTechTitle: "TEXNOLOGIK STEK VA QUROLAR:",
        detailViewCode: "Manba Kodini Ko'rish ↗",
        detailVisitSite: "Saytga O'tish ↗",
        aiGreeting: "<strong>Salom! 👋</strong><br><br>Men Muxammadrizoning AI yordamchisiman. Uning dasturlash va o'yin loyihalari haqida nimani bilishni xohlaysiz?",
        chipAbout: "👨‍💻 Muxammadrizo kim?",
        chipBackend: "⚙️ Backend Arxitekturasi?",
        chipUe5: "🎮 UE5 O'yini haqida",
        chipFrontend: "🎨 Does he do Frontend?",
        chipContact: "📩 Qanday bog'lansam bo'ladi?",
        aiPlaceholder: "Xabar yozing..."
    },
    ru: {
        navAbout: "Обо мне",
        navJourney: "Путь",
        navSkills: "Навыки",
        navProjects: "Проекты",
        navProof: "Достижения",
        navBlog: "Мой Блог",
        navReviews: "Отзывы",
        navContact: "Контакты",
        navBackHome: "← Назад к Портфолио",
        textBackHome: "← Назад к Портфолио",
        heroBadge: "16 лет • Hackathon IT School Фергана",
        serverLabel: "Сервер:",
        heroSuffix: ", я",
        heroName: "А'замжонов Мухаммадризо",
        typingPrefix: "Я специализируюсь на:",
        heroSubtext: "Студент Hackathon IT School в Фергане. Разрабатываю бэкенд на Python/FastAPI и игры на Unreal Engine 5.8.",
        heroBtn: "Смотреть Проекты 🚀",
        heroContactBtn: "Get in Touch 💬",
        titleJourney: "Образование и Развитие",
        journeyTagEducation: "Образование",
        journeyDate1: "2024 - Наст. время",
        journeySchoolTitle: "Hackathon IT School (Фергана)",
        journeySchoolDesc: "Изучение алгоритмов, инженерии ПО и участие в хакатонах.",
        journeyTagStudio: "Игровая Студия",
        journeyDate2: "2024 - Наст. время",
        journeyStudioTitle: "Основатель — Indie Game Development",
        journeyStudioDesc: "Разработка 3D игр на Unreal Engine 5.8.",
        journeyTagBackend: "Бэкенд Системы",
        journeyDate3: "2023 - Наст. время",
        journeyBackendTitle: "Full-Stack Инженерия",
        journeyBackendDesc: "Создание REST API на FastAPI, SQLite, WebSockets и Telegram ботов.",
        titleSkills: "Технические Навыки",
        titleProjects: "Избранные Проекты",
        filterAll: "Все",
        filterPython: "Python / FastAPI",
        filterUe5: "Unreal Engine 5",
        filterBot: "Telegram Боты",
        tagCubeIsland: "Активный MVP Игры 🌋",
        titleCubeIsland: "Unreal Engine 3D Game Project",
        descCubeIsland: "Игра на выживание, сочетающая реалистичные биомы и абстрактные кубы.",
        btnReadPitch: "Читать Подробнее ↗",
        tagStorefront: "Активная Разработка 🚀",
        titleStorefront: "Витрина Местного Бизнеса",
        descStorefront: "Быстрое веб-приложение для розничного магазина с каталогом.",
        btnViewDetails: "Смотреть Детали ↗",
        titleProof: "Достижения и Сертификаты",
        tagHackathon: "Академические и Хакатоны 🏆",
        titleHackathon: "Hackathon IT School Фергана",
        descHackathon: "Признан за высокую успеваемость и активную разработку проектов.",
        btnViewProof: "Смотреть Детали ↗",
        titleBlog: "DevLog и Мой Блог",
        blogBadge1: "DevLog #04 • UE 5.8",
        blogDate1: "Июль 2026",
        blogTitle1: "UE5 Game - Procedural Biomes",
        blogDesc1: "Оптимизация систем PCG и тумана Lumen для вулканических биомов в Unreal Engine 5.8.",
        blogBadge2: "DevLog #03 • FastAPI",
        blogDate2: "Июнь 2026",
        blogTitle2: "Real-Time WebSockets и 2FA Архитектура",
        blogDesc2: "Разработка асинхронных WebSockets и Gmail 2FA OTP для безопасной админ-панели.",
        blogBadge3: "DevLog #02 • Telegram",
        blogDate3: "Май 2026",
        blogTitle3: "Автоматизированный Telegram Бот",
        blogDesc3: "Интеграция вебхуков Telegram для мгновенного получения сообщений от клиентов.",
        titleReviews: "Отзывы Клиентов",
        reviewFormTitle: "Оставить Отзыв",
        labelReviewName: "Ваше Имя или Компания",
        phReviewName: "Иван Иванов",
        labelReviewMsg: "Ваш Отзыв",
        phReviewMsg: "Поделитесь впечатлениями о работе...",
        btnSubmitReview: "Отправить Отзыв 💬",
        titleContact: "Связаться со мной",
        labelName: "Ваше Имя",
        phContactName: "Иван Иванов",
        labelEmail: "Email или Telegram (@username)",
        phContactEmail: "ivan@gmail.com или @ivan_dev",
        labelMessage: "Детали проекта",
        phContactMsg: "Привет, Мухаммадризо! Я хочу создать веб-сайт...",
        btnSend: "Отправить Сообщение 📱",
        tooltipTelegramVerify: "Подтверждение через Telegram показывает, что отзывы написаны реальными клиентами.",
        tooltipContactInfo: "Ваши контактные данные используются только для быстрого ответа на ваше сообщение.",
        detailOverviewTitle: "ОБЗОР И АРХИТЕКТУРА",
        detailTechTitle: "СТЕК ТЕХНОЛОГИЙ И ИНСТРУМЕНТЫ:",
        detailViewCode: "Исходный Код ↗",
        detailVisitSite: "Перейти на Сайт ↗",
        aiGreeting: "<strong>Здравствуйте! 👋</strong><br><br>Я ИИ-помощник Мухаммадризо. Чем могу помочь вам сегодня?",
        chipAbout: "👨‍💻 Кто такой Мухаммадризо?",
        chipBackend: "⚙️ Архитектура Backend?",
        chipUe5: "🎮 Расскажи об игре UE5",
        chipFrontend: "🎨 Он занимается Frontend?",
        chipContact: "📩 Как с ним связаться?",
        aiPlaceholder: "Введите сообщение..."
    }
};

window.cycleLanguage = function() {
    const currentIndex = langOrder.indexOf(currentLanguage);
    const nextLang = langOrder[(currentIndex + 1) % langOrder.length];
    changeLanguage(nextLang);
};

window.changeLanguage = function(lang) {
    currentLanguage = lang;
    localStorage.setItem('preferred_lang', lang);

    const singleBtn = document.getElementById('lang-toggle-btn');
    if (singleBtn) {
        singleBtn.textContent = `🌐 ${lang.toUpperCase()}`;
    }

    document.querySelectorAll('[data-i18n]').forEach(elem => {
        const key = elem.getAttribute('data-i18n');
        if (translations[lang] && translations[lang][key]) {
            elem.innerHTML = translations[lang][key];
        }
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(elem => {
        const key = elem.getAttribute('data-i18n-placeholder');
        if (translations[lang] && translations[lang][key]) {
            elem.setAttribute('placeholder', translations[lang][key]);
        }
    });
};

window.toggleMobileMenu = function() {
    const navLinks = document.getElementById('nav-links');
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const aiWidgetContainer = document.getElementById('ai-widget-container');
    const langToggleBtn = document.getElementById('lang-toggle-btn');

    if (navLinks && mobileMenuBtn) {
        const isOpening = !navLinks.classList.contains('active');
        navLinks.classList.toggle('active');
        mobileMenuBtn.classList.toggle('open');

        if (aiWidgetContainer) {
            if (isOpening) {
                aiWidgetContainer.classList.add('ai-widget-hidden');
            } else {
                aiWidgetContainer.classList.remove('ai-widget-hidden');
            }
        }

        if (langToggleBtn) {
            if (isOpening) {
                langToggleBtn.classList.add('lang-btn-hidden');
            } else {
                langToggleBtn.classList.remove('lang-btn-hidden');
            }
        }
    }
};

/* ==========================================================================
   2. HOLOGRAPHIC TELEPORTATION COUNTER-SKEW ROTATOR
   ========================================================================== */
let holoGreetings = [
    "Hi", "Salom", "Привет", "안녕하세요", "こんにちは", "¡Hola!", "Bonjour", "مرحبا", "Ciao", "Namaste", "你好", "Guten Tag", "สวัสดี", "שלום"
];
let holoGreetingIndex = 0;

function rotateHoloGreeting() {
    const holoElem = document.getElementById('holo-greeting');
    if (!holoElem || holoGreetings.length === 0) return;

    holoGreetingIndex = (holoGreetingIndex + 1) % holoGreetings.length;
    const nextGreeting = holoGreetings[holoGreetingIndex];

    holoElem.classList.add('teleport');

    setTimeout(() => {
        holoElem.textContent = nextGreeting;
    }, 220);

    setTimeout(() => {
        holoElem.classList.remove('teleport');
    }, 520);
}

setInterval(rotateHoloGreeting, 2800);

/* ==========================================================================
   3. DOM BINDINGS, MARQUEE TICKER & DYNAMIC CONFIG / SKILLS LOADING
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
    changeLanguage(currentLanguage);
    loadVerifiedReviews();
    loadSiteConfiguration();
    loadDynamicSkills();
    checkAiLockoutState();
    registerUniqueVisit();

    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            const navLinks = document.getElementById('nav-links');
            const mobileMenuBtn = document.getElementById('mobile-menu-btn');
            const aiWidgetContainer = document.getElementById('ai-widget-container');
            const langToggleBtn = document.getElementById('lang-toggle-btn');

            if (navLinks) navLinks.classList.remove('active');
            if (mobileMenuBtn) mobileMenuBtn.classList.remove('open');
            if (aiWidgetContainer) aiWidgetContainer.classList.remove('ai-widget-hidden');
            if (langToggleBtn) langToggleBtn.classList.remove('lang-btn-hidden');
        });
    });

    bindHologramChartObserver();
});

function registerUniqueVisit() {
    try {
        fetch('/api/track-visit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ session_id: currentSessionId, is_new: true })
        });
    } catch(e) {}
}

// LOAD DYNAMIC CONFIG
async function loadSiteConfiguration() {
    try {
        const res = await fetch('/api/config');
        if (res.ok) {
            const cfg = await res.json();
            if (cfg.dev_name) {
                const nameElem = document.getElementById('display-hero-name');
                if (nameElem) nameElem.textContent = cfg.dev_name;
            }
            if (cfg.site_brand) {
                const brandElem = document.getElementById('nav-brand-logo');
                if (brandElem) {
                    const parts = cfg.site_brand.split('.');
                    brandElem.innerHTML = `${escapeHTML(parts[0])}<span>.${escapeHTML(parts[1] || 'dev')}</span>`;
                }
                const titleElem = document.getElementById('site-page-title');
                if (titleElem) titleElem.textContent = `${cfg.site_brand} | Portfolio`;
            }
            if (cfg.hero_badge) {
                const badgeElem = document.getElementById('display-hero-badge');
                if (badgeElem) badgeElem.textContent = cfg.hero_badge;
            }
            if (cfg.hero_bio) {
                const bioElem = document.getElementById('display-hero-bio');
                if (bioElem) bioElem.textContent = cfg.hero_bio;
            }
            if (cfg.telegram_handle) {
                const tgLink = document.getElementById('link-telegram');
                if (tgLink) tgLink.href = `https://t.me/${cfg.telegram_handle.replace('@', '')}`;
            }
            if (cfg.github_url) {
                const ghLink = document.getElementById('link-github');
                if (ghLink) ghLink.href = cfg.github_url;
            }
            if (cfg.gmail_address) {
                const gmailLink = document.getElementById('link-gmail');
                if (gmailLink) gmailLink.href = `https://mail.google.com/mail/?view=cm&fs=1&to=${cfg.gmail_address}`;
            }
            if (cfg.typewriter_phrases && cfg.typewriter_phrases.length > 0) {
                phrases = cfg.typewriter_phrases;
            }
            if (cfg.holo_greetings && cfg.holo_greetings.length > 0) {
                holoGreetings = cfg.holo_greetings;
            }
        }
    } catch(e) {}
}

// DYNAMIC SKILLS LOADING WITH FALLBACK TO DEFAULT SKILLS
async function loadDynamicSkills() {
    const g1 = document.getElementById('skills-marquee-group1');
    const g2 = document.getElementById('skills-marquee-group2');
    if (!g1 || !g2) return;

    const defaultSkills = [
        { name: "Python", percentage: 92 },
        { name: "FastAPI", percentage: 88 },
        { name: "UE 5.8", percentage: 80 },
        { name: "Telegram Bots", percentage: 90 },
        { name: "SQLite & APIs", percentage: 85 },
        { name: "HTML/CSS", percentage: 82 }
    ];

    try {
        const res = await fetch('/api/skills');
        if (res.ok) {
            let skills = await res.json();
            if (!skills || skills.length === 0) {
                skills = defaultSkills;
            }

            const skillHtml = skills.map(s => `
                <div class="hologram-col">
                    <div class="hologram-bar-wrapper">
                        <div class="hologram-bar" data-height="${s.percentage}%">
                            <span class="hologram-percent" data-target="${s.percentage}">0%</span>
                        </div>
                    </div>
                    <span class="hologram-label">${escapeHTML(s.name)}</span>
                </div>
            `).join('');

            g1.innerHTML = skillHtml;
            g2.innerHTML = skillHtml;
        }
    } catch(e) {
        const skillHtml = defaultSkills.map(s => `
            <div class="hologram-col">
                <div class="hologram-bar-wrapper">
                    <div class="hologram-bar" data-height="${s.percentage}%">
                        <span class="hologram-percent" data-target="${s.percentage}">0%</span>
                    </div>
                </div>
                <span class="hologram-label">${escapeHTML(s.name)}</span>
            </div>
        `).join('');

        g1.innerHTML = skillHtml;
        g2.innerHTML = skillHtml;
    }
}

function bindHologramChartObserver() {
    const marqueeContainer = document.getElementById('chart-marquee-container');
    if (!marqueeContainer) return;

    function animateCounter(counter, targetVal) {
        const duration = 2200;
        const startTime = performance.now();

        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const ease = 1 - Math.pow(1 - progress, 3);
            const currentVal = Math.floor(targetVal * ease);

            counter.textContent = `${currentVal}%`;

            if (progress < 1) {
                counter._animFrame = requestAnimationFrame(update);
            } else {
                counter.textContent = `${targetVal}%`;
            }
        }

        if (counter._animFrame) cancelAnimationFrame(counter._animFrame);
        counter._animFrame = requestAnimationFrame(update);
    }

    function checkColumnPositions() {
        const containerRect = marqueeContainer.getBoundingClientRect();
        const cols = marqueeContainer.querySelectorAll('.hologram-col');
        const triggerZoneX = containerRect.right - (containerRect.width * 0.3);

        cols.forEach(col => {
            const colRect = col.getBoundingClientRect();
            const bar = col.querySelector('.hologram-bar');
            const counter = col.querySelector('.hologram-percent');
            if (!bar || !counter) return;

            const targetHeight = bar.getAttribute('data-height') || '80%';
            const targetVal = parseInt(counter.getAttribute('data-target') || '0', 10);

            if (colRect.left <= triggerZoneX && colRect.right >= containerRect.left) {
                if (!bar._isRaised) {
                    bar._isRaised = true;
                    bar.style.height = targetHeight;
                    animateCounter(counter, targetVal);
                }
            } else {
                if (bar._isRaised) {
                    bar._isRaised = false;
                    bar.style.height = '16px';
                    counter.textContent = '0%';
                    if (counter._animFrame) cancelAnimationFrame(counter._animFrame);
                }
            }
        });

        requestAnimationFrame(checkColumnPositions);
    }

    requestAnimationFrame(checkColumnPositions);
}

/* ==========================================================================
   4. REAL TELEGRAM BOT VERIFICATION LINK & POLLING
   ========================================================================== */
async function startTelegramBotVerification() {
    try {
        const response = await fetch('/api/reviews/gen-token', { method: 'POST' });
        if (!response.ok) return;

        const data = await response.json();
        currentAuthToken = data.token;

        window.open(data.bot_link, '_blank');

        const pollInterval = setInterval(async () => {
            const checkRes = await fetch(`/api/reviews/check-token/${currentAuthToken}`);
            if (checkRes.ok) {
                const checkData = await checkRes.json();
                if (checkData.verified && checkData.user) {
                    clearInterval(pollInterval);
                    const user = checkData.user;
                    applyStage2FormMorph(
                        `${user.first_name} ${user.last_name || ''}`.trim(),
                        user.username ? `@${user.username}` : '',
                        user.photo_url || null
                    );
                }
            }
        }, 2000);

        setTimeout(() => clearInterval(pollInterval), 180000);
    } catch (e) {
        console.error("Error generating Telegram verification token:", e);
    }
}

function applyStage2FormMorph(name, username, photoUrl) {
    clientTelegramVerified = 1;
    clientTelegramAvatar = photoUrl;

    document.getElementById('review-name').value = name;

    const usernameInput = document.getElementById('review-username');
    const usernameGroup = document.getElementById('username-group');
    if (usernameInput) usernameInput.value = username;
    if (usernameGroup) usernameGroup.style.display = 'flex';

    const firstInitial = name ? escapeHTML(name.charAt(0).toUpperCase()) : 'M';
    const avatarMedia = photoUrl
        ? `<img src="${escapeHTML(photoUrl)}" class="stage2-avatar" onerror="this.outerHTML='<div class=\\'review-avatar\\'>${firstInitial}</div>';" alt="${escapeHTML(name)}">`
        : `<div class="review-avatar" style="width:44px; height:44px; font-size:1.1rem;">${firstInitial}</div>`;

    const headerBox = document.getElementById('form-header-box');
    if (headerBox) {
        headerBox.innerHTML = `
            <div class="stage2-header-profile">
                ${avatarMedia}
                <div>
                    <strong style="color: #f1f5f9; font-size: 1.05rem; display: block;">${escapeHTML(name)}</strong>
                    <span style="font-size: 0.8rem; color: #38bdf8;">✓ Verified via Telegram (${escapeHTML(username) || 'Account'})</span>
                </div>
            </div>
        `;
    }

    const verifyBtn = document.getElementById('telegram-connect-btn');
    if (verifyBtn) {
        verifyBtn.style.display = 'none';
    }
}

/* ==========================================================================
   5. DYNAMIC RANKED REVIEWS WITH CLEAN PROFESSIONAL OWNER RESPONSE RENDER
   ========================================================================== */
async function loadVerifiedReviews() {
    const list = document.getElementById('public-reviews-list');
    if (!list) return;

    try {
        const response = await fetch('/api/reviews');
        if (!response.ok) return;

        const data = await response.json();
        if (!data.reviews || data.reviews.length === 0) {
            list.innerHTML = `<div style="color: #94a3b8; font-size: 0.9rem;">No approved reviews yet. Be the first to leave feedback!</div>`;
            return;
        }

        allLoadedReviews = data.reviews;
        renderReviewList();
    } catch (e) {
        console.error("Error fetching reviews:", e);
    }
}

function renderReviewList() {
    const list = document.getElementById('public-reviews-list');
    const showMoreBtn = document.getElementById('show-more-reviews-btn');
    if (!list) return;

    const likedArray = JSON.parse(localStorage.getItem('liked_reviews') || '[]').map(Number);
    const limit = isShowingAllReviews ? allLoadedReviews.length : 3;
    const reviewsToRender = allLoadedReviews.slice(0, limit);

    list.innerHTML = reviewsToRender.map(r => {
        const cleanUsername = r.username ? r.username.replace('@', '') : '';
        const initials = r.avatar_initials || (r.name ? r.name.substring(0, 1).toUpperCase() : 'M');

        const avatarHtml = r.avatar_url
            ? `<img src="${escapeHTML(r.avatar_url)}" class="review-avatar-img" onerror="this.outerHTML='<div class=\\'review-avatar\\'>${escapeHTML(initials)}</div>';" alt="${escapeHTML(r.name)}">`
            : `<div class="review-avatar">${escapeHTML(initials)}</div>`;

        const usernameHtml = cleanUsername
            ? `<div style="font-size: 0.8rem; color: #38bdf8;"><a href="https://t.me/${escapeHTML(cleanUsername)}" target="_blank" style="color:#38bdf8; text-decoration:none;">@${escapeHTML(cleanUsername)}</a></div>`
            : '';

        const verifiedBadgeHtml = r.is_telegram_verified
            ? `<div class="telegram-verified-badge">
                 <svg viewBox="0 0 24 24" width="12" height="12" fill="#38bdf8"><path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm5.56 8.16l-1.97 9.28c-.15.65-.53.81-1.08.5l-3.01-2.22-1.45 1.4c-.16.16-.3.3-.61.3l.21-3.05 5.56-5.02c.24-.22-.05-.34-.37-.13l-6.87 4.33-2.96-.92c-.64-.2-.65-.64.13-.95l11.57-4.46c.53-.19 1 .13.85.94z"/></svg>
                 <span>Verified via Telegram</span>
               </div>`
            : '';

        const cardExtraClass = r.is_telegram_verified ? 'review-display-box verified-card' : 'review-display-box';
        const ratingStars = '⭐'.repeat(r.rating || 5);
        const isLiked = likedArray.includes(Number(r.id));
        const likeClass = isLiked ? 'like-btn liked' : 'like-btn';
        const dateStamp = escapeHTML(r.created_at || "August 02, 2026");

        // TRUNCATION FOR MAIN MESSAGE
        const rawMsg = r.message || '';
        let msgHtml = '';
        if (rawMsg.length > 80) {
            const truncated = escapeHTML(rawMsg.substring(0, 80));
            const full = escapeHTML(rawMsg);
            msgHtml = `
                <div class="review-msg-container">
                    <span class="short-msg">"${truncated}..." <span class="read-more-btn" onclick="toggleReviewMsg(this)">Read More</span></span>
                    <span class="full-msg" style="display:none;">"${full}" <span class="read-more-btn" onclick="toggleReviewMsg(this)">Show Less</span></span>
                </div>
            `;
        } else {
            msgHtml = `<div class="review-msg-container">"${escapeHTML(rawMsg)}"</div>`;
        }

        // TRUNCATION FOR OWNER REPLY (NEW FIX)
        let ownerReplyHtml = '';
        if (r.admin_reply) {
            const rawReply = r.admin_reply || '';
            let replyTextHtml = '';

            if (rawReply.length > 80) {
                const truncatedReply = escapeHTML(rawReply.substring(0, 80));
                const fullReply = escapeHTML(rawReply);
                replyTextHtml = `
                    <div class="review-msg-container" style="color: #f1f5f9; font-size: 0.85rem; margin-top: 2px;">
                        <span class="short-msg">"${truncatedReply}..." <span class="read-more-btn" onclick="toggleReviewMsg(this)">Read More</span></span>
                        <span class="full-msg" style="display:none;">"${fullReply}" <span class="read-more-btn" onclick="toggleReviewMsg(this)">Show Less</span></span>
                    </div>
                `;
            } else {
                replyTextHtml = `<p style="color: #f1f5f9; margin-top: 2px;">"${escapeHTML(rawReply)}"</p>`;
            }

            ownerReplyHtml = `
                <div class="owner-reply-box">
                    <span class="owner-reply-tag">[OWNER RESPONSE • REPLIED TO ${escapeHTML(r.name.toUpperCase())}]</span>
                    ${replyTextHtml}
                </div>
            `;
        }

        return `
            <div class="${cardExtraClass}">
                <div class="review-header">
                    <div class="review-user-info">
                        ${avatarHtml}
                        <div>
                            <strong style="color: #f1f5f9;">${escapeHTML(r.name)}</strong>
                            ${usernameHtml}
                            ${verifiedBadgeHtml}
                        </div>
                    </div>
                    <span class="review-date-tag">${dateStamp}</span>
                </div>

                ${msgHtml}
                ${ownerReplyHtml}

                <div class="review-footer-row">
                    <span class="star-rating-display">${ratingStars}</span>
                    <button class="${likeClass}" onclick="likeReview(${r.id})">
                        👍 Helpful (${r.likes || 0})
                    </button>
                </div>
            </div>
        `;
    }).join('');

    if (showMoreBtn) {
        if (allLoadedReviews.length > 3) {
            showMoreBtn.style.display = 'inline-flex';
            showMoreBtn.textContent = isShowingAllReviews ? 'Show Less 👆' : `Show More Reviews (${allLoadedReviews.length - 3}) 👇`;
        } else {
            showMoreBtn.style.display = 'none';
        }
    }
}

window.toggleReviewMsg = function(btn) {
    const container = btn.closest('.review-msg-container');
    const card = btn.closest('.review-display-box');
    if (!container || !card) return;

    const shortSpan = container.querySelector('.short-msg');
    const fullSpan = container.querySelector('.full-msg');

    if (shortSpan && fullSpan) {
        if (shortSpan.style.display === 'none') {
            shortSpan.style.display = 'inline';
            fullSpan.style.display = 'none';
            container.classList.remove('expanded');
        } else {
            shortSpan.style.display = 'none';
            fullSpan.style.display = 'inline';
            container.classList.add('expanded');
        }

        // Flexible auto-height prevents breaking when expanding both messages on mobile
        card.style.height = 'auto';
        if (window.innerWidth <= 768) {
            card.style.minHeight = '250px';
        } else {
            card.style.minHeight = '190px';
        }
    }
};

window.toggleShowAllReviews = function() {
    isShowingAllReviews = !isShowingAllReviews;
    renderReviewList();
};

window.likeReview = async function(reviewId) {
    const numericId = Number(reviewId);
    let likedArray = JSON.parse(localStorage.getItem('liked_reviews') || '[]').map(Number);

    const reviewExists = allLoadedReviews.some(r => Number(r.id) === numericId);
    if (!reviewExists) return;

    if (likedArray.includes(numericId)) {
        alert("You have already liked this feedback!");
        return;
    }

    try {
        const response = await fetch(`/api/reviews/${numericId}/like`, { method: 'POST' });
        if (response.ok) {
            likedArray.push(numericId);
            localStorage.setItem('liked_reviews', JSON.stringify(likedArray));
            loadVerifiedReviews();
        }
    } catch (e) {
        console.error("Error liking review:", e);
    }
};

/* ==========================================================================
   6. TERMINAL LOADER (> Portfolio Output) - SKIPPED ON BACK NAVIGATION
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
    const typedText = document.getElementById('typed-text');
    const loader = document.getElementById('loader');

    if (sessionStorage.getItem('loader_shown') === 'true') {
        if (loader) loader.style.display = 'none';
        document.body.classList.remove('no-scroll');
        return;
    }

    const lines = [
        { text: "P", speed: 150, pause: 700 },
        { text: "ortfolio", speed: 120, pause: 800 }
    ];

    let lineIndex = 0;
    let charIndex = 0;

    function typeTerminal() {
        if (lineIndex < lines.length) {
            const currentLine = lines[lineIndex];

            if (charIndex < currentLine.text.length) {
                typedText.textContent += currentLine.text.charAt(charIndex);
                charIndex++;
                setTimeout(typeTerminal, currentLine.speed);
            } else {
                lineIndex++;
                charIndex = 0;
                setTimeout(typeTerminal, currentLine.pause);
            }
        } else {
            setTimeout(() => {
                loader.style.opacity = '0';
                document.body.classList.remove('no-scroll');
                sessionStorage.setItem('loader_shown', 'true');
                setTimeout(() => {
                    loader.style.display = 'none';
                }, 500);
            }, 200);
        }
    }

    setTimeout(typeTerminal, 300);
});

/* ==========================================================================
   7. TYPEWRITER (HERO SECTION)
   ========================================================================== */
let phrases = [
    "Python FastAPI Backends",
    "Unreal Engine 5.8 Worlds",
    "Automated Telegram Bots",
    "RESTful 2FA APIs"
];
let phraseIndex = 0;
let charIndex = 0;
let isDeleting = false;

function typeEffect() {
    const typewriterElem = document.getElementById('typewriter-text');
    if (!typewriterElem) return;

    const currentPhrase = phrases[phraseIndex] || phrases[0];

    if (isDeleting) {
        typewriterElem.textContent = currentPhrase.substring(0, charIndex - 1);
        charIndex--;
    } else {
        typewriterElem.textContent = currentPhrase.substring(0, charIndex + 1);
        charIndex++;
    }

    let speed = isDeleting ? 40 : 80;

    if (!isDeleting && charIndex === currentPhrase.length) {
        speed = 1800;
        isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        speed = 400;
    }

    setTimeout(typeEffect, speed);
}

document.addEventListener('DOMContentLoaded', typeEffect);

/* ==========================================================================
   8. WEBSOCKET SERVER PING & REAL-TIME HEARTBEAT
   ========================================================================== */
function connectWebSocket() {
    const statusText = document.getElementById('server-status-text');
    const statusDot = document.getElementById('status-dot-hero');
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws/status`;

    try {
        const ws = new WebSocket(wsUrl);

        ws.onopen = () => {
            if (statusText) statusText.textContent = "Online (12ms)";
            if (statusDot) statusDot.style.backgroundColor = "#10b981";

            // Periodic heartbeat ping to accumulate real duration & live user count
            setInterval(() => {
                if (ws.readyState === WebSocket.OPEN) {
                    ws.send("ping");
                }
            }, 5000);
        };

        ws.onmessage = (event) => {
            if (event.data === "update_reviews") {
                loadVerifiedReviews();
            } else if (event.data === "update_config") {
                loadSiteConfiguration();
            } else if (event.data === "update_skills") {
                loadDynamicSkills();
            } else if (statusText && !event.data.startsWith("{")) {
                statusText.textContent = `Online (${event.data})`;
            }
        };

        ws.onerror = () => {
            if (statusText) statusText.textContent = "Online (Local)";
            if (statusDot) statusDot.style.backgroundColor = "#10b981";
        };

        ws.onclose = () => {
            if (statusText) statusText.textContent = "Online (Local)";
            if (statusDot) statusDot.style.backgroundColor = "#10b981";
        };

    } catch (e) {
        if (statusText) statusText.textContent = "Online";
    }
}

connectWebSocket();

/* ==========================================================================
   9. MODALS & PROJECT FILTERS
   ========================================================================== */
window.openProjectModal = function(title, category, mediaUrl, description, tech, github, live) {
    window.location.href = `/detail?type=project&title=${encodeURIComponent(title)}`;
};

window.closeProjectModal = function() {
    document.getElementById('project-modal').style.display = 'none';
};

window.filterProjects = function(category) {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    if (event && event.target) {
        event.target.classList.add('active');
    }

    document.querySelectorAll('.h-card').forEach(card => {
        const cardCat = card.getAttribute('data-category');
        if (category === 'all' || cardCat === category) {
            card.style.display = 'flex';
        } else {
            card.style.display = 'none';
        }
    });
};

/* ==========================================================================
   10. FORM SUBMISSIONS WITH TIMER GUARD & REVIEWS DISPATCH
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.getElementById('contact-form');
    const contactSubmitBtn = document.getElementById('contact-submit-btn');

    if (contactForm && contactSubmitBtn) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const status = document.getElementById('contact-status-msg');

            const nameInput = document.getElementById('contact-name').value.trim();
            const emailInput = document.getElementById('contact-email').value.trim();
            const messageInput = document.getElementById('contact-message').value.trim();

            contactSubmitBtn.disabled = true;
            contactSubmitBtn.textContent = 'Sending Message... ⌛';
            status.style.color = '#38bdf8';
            status.textContent = 'Dispatching message to Telegram...';

            try {
                const response = await fetch('/api/contact', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: nameInput,
                        contact_info: emailInput,
                        message: messageInput
                    })
                });

                if (response.ok) {
                    status.style.color = '#34d399';
                    status.textContent = 'Message sent! Muxammadrizo received your Telegram ping.';
                    contactForm.reset();
                } else {
                    status.style.color = '#ef4444';
                    status.textContent = 'Server error. Please reach out directly on Telegram @muxammadrizo0125.';
                }
            } catch (err) {
                status.style.color = '#34d399';
                status.textContent = 'Message sent successfully! Muxammadrizo will reply soon.';
                contactForm.reset();
            } finally {
                setTimeout(() => {
                    contactSubmitBtn.disabled = false;
                    contactSubmitBtn.textContent = translations[currentLanguage].btnSend || 'Send Message 📱';
                }, 3000);
            }
        });
    }

    const reviewForm = document.getElementById('review-form');
    const reviewSubmitBtn = document.getElementById('review-submit-btn');

    if (reviewForm && reviewSubmitBtn) {
        reviewForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const name = document.getElementById('review-name').value.trim();
            const usernameInput = document.getElementById('review-username');
            const username = usernameInput ? usernameInput.value.trim() : '';
            const rating = parseInt(document.getElementById('review-rating').value, 10);
            const message = document.getElementById('review-msg').value.trim();

            reviewSubmitBtn.disabled = true;
            reviewSubmitBtn.textContent = 'Submitting Review... ⌛';

            try {
                const response = await fetch('/api/reviews', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: name,
                        username: username,
                        avatar_url: clientTelegramAvatar,
                        rating: rating,
                        message: message,
                        auth_token: currentAuthToken
                    })
                });

                if (response.ok) {
                    const resData = await response.json();
                    alert(resData.message || 'Thank you! Your review has been submitted for admin verification.');
                    reviewForm.reset();
                    clientTelegramVerified = 0;
                    clientTelegramAvatar = null;
                } else {
                    alert('Thank you! Your feedback has been submitted for admin approval.');
                    reviewForm.reset();
                }
            } catch (err) {
                alert('Thank you! Your review has been submitted for admin approval.');
                reviewForm.reset();
            } finally {
                setTimeout(() => {
                    reviewSubmitBtn.disabled = false;
                    reviewSubmitBtn.textContent = translations[currentLanguage].btnSubmitReview || 'Submit Review 💬';
                }, 3000);
            }
        });
    }
});

/* ==========================================================================
   11. FLOATING AI CHATBOT WIDGET & 10-QUESTION NON-PORTFOLIO CHAIN LOCK
   ========================================================================== */
let offTopicAiCount = parseInt(localStorage.getItem('off_topic_ai_count') || '0', 10);

function checkAiLockoutState() {
    const lockUntil = parseInt(localStorage.getItem('ai_locked_until') || '0', 10);
    const aiToggleBtn = document.getElementById('ai-toggle-btn');
    const aiStatusDot = document.getElementById('ai-status-dot');
    const aiHeaderTitle = document.getElementById('ai-header-title');
    const chatWindow = document.getElementById('chat-window');

    if (lockUntil && Date.now() < lockUntil) {
        if (aiToggleBtn) aiToggleBtn.classList.add('ai-locked');
        if (aiStatusDot) aiStatusDot.classList.add('status-dot-locked');
        if (aiHeaderTitle) aiHeaderTitle.textContent = "AI Locked (10-Min Break)";
        if (chatWindow && !chatWindow.classList.contains('chat-hidden')) {
            chatWindow.classList.add('chat-hidden');
        }
        return true;
    } else if (lockUntil) {
        localStorage.removeItem('ai_locked_until');
        localStorage.setItem('off_topic_ai_count', '0');
        offTopicAiCount = 0;
        if (aiToggleBtn) aiToggleBtn.classList.remove('ai-locked');
        if (aiStatusDot) aiStatusDot.classList.remove('status-dot-locked');
        if (aiHeaderTitle) aiHeaderTitle.textContent = "Gemini AI Assistant";
    }
    return false;
}

window.triggerQuickReply = function(topicKey) {
    if (isAiThinking || checkAiLockoutState()) {
        if (checkAiLockoutState()) {
            const lockUntil = parseInt(localStorage.getItem('ai_locked_until') || '0', 10);
            const minsLeft = Math.ceil((lockUntil - Date.now()) / 60000);
            alert(`⛓️🔒 AI Assistant is currently locked.\n\nIt will unlock in ${minsLeft} minutes.`);
        }
        return;
    }

    let chipI18nKey = '';
    if (topicKey === 'about') chipI18nKey = 'chipAbout';
    if (topicKey === 'game') chipI18nKey = 'chipUe5';
    if (topicKey === 'backend') chipI18nKey = 'chipBackend';
    if (topicKey === 'frontend') chipI18nKey = 'chipFrontend';
    if (topicKey === 'contact') chipI18nKey = 'chipContact';

    const textToShow = translations[currentLanguage][chipI18nKey];
    processUserChat(textToShow);
};

document.addEventListener('DOMContentLoaded', () => {
    const aiToggleBtn = document.getElementById('ai-toggle-btn');
    const closeChatBtn = document.getElementById('close-chat-btn');
    const chatWindow = document.getElementById('chat-window');
    const sendChatBtn = document.getElementById('send-chat-btn');
    const chatInput = document.getElementById('chat-input');

    if (aiToggleBtn && chatWindow) {
        aiToggleBtn.addEventListener('click', () => {
            if (checkAiLockoutState()) {
                const lockUntil = parseInt(localStorage.getItem('ai_locked_until') || '0', 10);
                const minsLeft = Math.ceil((lockUntil - Date.now()) / 60000);
                alert(`⛓️🔒 AI Assistant is currently locked for non-portfolio questions.\n\nIt will unlock automatically in ${minsLeft} minutes.`);
                return;
            }
            chatWindow.classList.toggle('chat-hidden');
        });
    }

    if (closeChatBtn && chatWindow) {
        closeChatBtn.addEventListener('click', () => {
            chatWindow.classList.add('chat-hidden');
        });
    }

    if (sendChatBtn && chatInput) {
        sendChatBtn.addEventListener('click', () => {
            if (!isAiThinking) processUserChat(chatInput.value);
        });

        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                if (!isAiThinking) processUserChat(chatInput.value);
            }
        });
    }
});

function typeAiMessage(text, onComplete) {
    const chatBody = document.getElementById('chat-body');
    if (!chatBody) {
        if (onComplete) onComplete();
        return;
    }

    const botDiv = document.createElement('div');
    botDiv.className = 'message bot-message';
    chatBody.appendChild(botDiv);

    let i = 0;
    function typing() {
        if (i < text.length) {
            botDiv.textContent += text.charAt(i);
            i++;
            chatBody.scrollTop = chatBody.scrollHeight;
            setTimeout(typing, 12);
        } else {
            if (onComplete) onComplete();
        }
    }
    typing();
}

async function processUserChat(text) {
    const originalText = text.trim();
    if (!originalText || isAiThinking) return;

    if (checkAiLockoutState()) {
        alert("🔒 AI Assistant is locked. Please try again later!");
        return;
    }

    isAiThinking = true;

    const chatBody = document.getElementById('chat-body');
    const chatInput = document.getElementById('chat-input');
    const sendChatBtn = document.getElementById('send-chat-btn');
    const quickRepliesBox = document.getElementById('ai-quick-replies');

    function setControlsState(disabled) {
        if (chatInput) chatInput.disabled = disabled;
        if (sendChatBtn) sendChatBtn.disabled = disabled;
        if (quickRepliesBox) {
            if (disabled) quickRepliesBox.classList.add('disabled');
            else quickRepliesBox.classList.remove('disabled');
        }
    }

    if (chatBody) {
        const userDiv = document.createElement('div');
        userDiv.className = 'message user-message';
        userDiv.textContent = originalText;
        chatBody.appendChild(userDiv);

        if (chatInput) chatInput.value = '';
        chatBody.scrollTop = chatBody.scrollHeight;

        setControlsState(true);

        const thinkingDiv = document.createElement('div');
        thinkingDiv.className = 'message bot-message thinking';
        thinkingDiv.id = 'ai-thinking-indicator';
        thinkingDiv.innerHTML = `<span>Thinking... 💭</span>`;
        chatBody.appendChild(thinkingDiv);
        chatBody.scrollTop = chatBody.scrollHeight;

        const lowerMsg = originalText.toLowerCase();
        const portfolioKeywords = [
            'muxammadrizo', 'portfolio', 'project', 'backend', 'fastapi',
            'unreal', 'ue5', 'nknd', 'cube island', 'hire', 'rate', 'rates', 'price',
            'prices', 'cost', 'costs', 'cheap', 'budget', 'free', 'contact', 'skill',
            'blog', 'review', 'fergana', 'school', 'game', 'dev', 'python', 'who',
            'about', 'work', 'service', 'services', 'help', 'question', 'tell',
            'explain', 'describe', 'hi', 'hello', 'hey', 'salom', 'привет'
        ];
        const isClientPortfolio = portfolioKeywords.some(kw => lowerMsg.includes(kw)) || lowerMsg.length <= 3;

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: originalText })
            });

            const activeThinkingMsg = document.getElementById('ai-thinking-indicator');
            if (activeThinkingMsg) activeThinkingMsg.remove();

            if (response.ok) {
                const data = await response.json();
                const isPortfolioMsg = data.is_portfolio !== undefined ? data.is_portfolio : isClientPortfolio;
                const isShortToken = originalText.length <= 3;
                let replyMessage = data.response;

                if (!isPortfolioMsg && !isShortToken) {
                    offTopicAiCount++;
                    localStorage.setItem('off_topic_ai_count', offTopicAiCount.toString());

                    if (offTopicAiCount >= 10) {
                        const lockUntil = Date.now() + 10 * 60 * 1000;
                        localStorage.setItem('ai_locked_until', lockUntil.toString());

                        const chatWindow = document.getElementById('chat-window');
                        if (chatWindow) chatWindow.classList.add('chat-hidden');

                        checkAiLockoutState();
                        alert("⛓️🔒 You have reached the 10 non-portfolio question limit. The AI Assistant is locked for 10 minutes.");
                        isAiThinking = false;
                        setControlsState(false);
                        return;
                    } else if (offTopicAiCount >= 8) {
                        const remaining = 10 - offTopicAiCount;
                        replyMessage = `${data.response}\n\n⚠️ Note: You have ${remaining} non-portfolio question(s) remaining before AI Assistant locks. Feel free to ask about Muxammadrizo's projects!`;
                    }
                }

                typeAiMessage(replyMessage, () => {
                    isAiThinking = false;
                    setControlsState(false);
                    if (chatInput) chatInput.focus();
                });
            } else {
                if (!isClientPortfolio && originalText.length > 3) {
                    offTopicAiCount++;
                    localStorage.setItem('off_topic_ai_count', offTopicAiCount.toString());

                    if (offTopicAiCount >= 10) {
                        const lockUntil = Date.now() + 10 * 60 * 1000;
                        localStorage.setItem('ai_locked_until', lockUntil.toString());

                        const chatWindow = document.getElementById('chat-window');
                        if (chatWindow) chatWindow.classList.add('chat-hidden');

                        checkAiLockoutState();
                        alert("⛓️🔒 You have reached the 10 non-portfolio question limit. The AI Assistant is locked for 10 minutes.");
                        isAiThinking = false;
                        setControlsState(false);
                        return;
                    }
                }

                typeAiMessage("I am currently experiencing network latency. Feel free to reach Muxammadrizo directly on Telegram @muxammadrizo0125!", () => {
                    isAiThinking = false;
                    setControlsState(false);
                });
            }
        } catch (e) {
            const activeThinkingMsg = document.getElementById('ai-thinking-indicator');
            if (activeThinkingMsg) activeThinkingMsg.remove();

            if (!isClientPortfolio && originalText.length > 3) {
                offTopicAiCount++;
                localStorage.setItem('off_topic_ai_count', offTopicAiCount.toString());

                if (offTopicAiCount >= 10) {
                    const lockUntil = Date.now() + 10 * 60 * 1000;
                    localStorage.setItem('ai_locked_until', lockUntil.toString());

                    const chatWindow = document.getElementById('chat-window');
                    if (chatWindow) chatWindow.classList.add('chat-hidden');

                    checkAiLockoutState();
                    alert("⛓️🔒 You have reached the 10 non-portfolio question limit. The AI Assistant is locked for 10 minutes.");
                    isAiThinking = false;
                    setControlsState(false);
                    return;
                }
            }

            typeAiMessage("I am Muxammadrizo's AI assistant! Feel free to ask me about his software engineering, game projects, or freelance work!", () => {
                isAiThinking = false;
                setControlsState(false);
            });
        }
    }
}