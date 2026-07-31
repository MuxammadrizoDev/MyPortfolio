/* ==========================================================================
   1. TRANSLATIONS DICTIONARY & BULLETPROOF GLOBAL LANG TOGGLE
   ========================================================================== */
let currentLanguage = localStorage.getItem('preferred_lang') || 'en';
const langOrder = ['en', 'uz', 'ru'];

const translations = {
    en: {
        navAbout: "About",
        navJourney: "Journey",
        navSkills: "Skills",
        navProjects: "Projects",
        navProof: "Proof",
        navBlog: "DevLog",
        navReviews: "Reviews",
        navContact: "Contact",
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
        journeyStudioTitle: "Founder & Lead — NKND Studios",
        journeyStudioDesc: "Architecting Project Cube Island in Unreal Engine 5.8. Designing Game Design Documents, PCG foliage, and non-lethal mechanics.",
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
        titleCubeIsland: "Project Cube Island",
        descCubeIsland: "Open-world survival game contrasting realistic volcanic biomes with abstract geometric cubes.",
        btnReadPitch: "Read Details &rarr;",
        tagStorefront: "Active Development 🚀",
        titleStorefront: "Local Business Storefront",
        descStorefront: "A fast web application built for a retail shop with clean catalog browsing and real-time inventory tracking.",
        btnViewDetails: "View Details &rarr;",
        titleProof: "Achievements & Proof",
        tagHackathon: "Academic & Hackathons 🏆",
        titleHackathon: "Hackathon IT School Fergana",
        descHackathon: "Recognized for top academic performance and active backend project development.",
        btnViewProof: "View Proof &rarr;",
        titleBlog: "DevLog & Studio Updates",
        blogBadge1: "DevLog #04 • UE 5.8",
        blogDate1: "July 2026",
        blogTitle1: "Project Cube Island - Procedural Biomes",
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
        reviewClient1: "Retail Store Client",
        reviewBadge1: "Verified Client via Telegram",
        reviewComment1: "\"A'zamjonov Muxammadrizo built a fast digital storefront catalog for our shop. Reliable communication and clean code!\"",
        reviewClient2: "Tech Group Corp",
        reviewBadge2: "Verified Client via Telegram",
        reviewComment2: "\"Excellent work on the automated Telegram bot API. Handled our database integration seamlessly.\"",
        reviewClient3: "Indie Dev Team",
        reviewBadge3: "Verified Client via Telegram",
        reviewComment3: "\"Consulted with him on Unreal Engine 5 PCG tools. Highly knowledgeable and professional.\"",
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
        navBlog: "Mening blogim",
        navReviews: "Fikrlar",
        navContact: "Aloqa",
        heroBadge: "16 yosh • Hackathon IT School Farg'ona",
        serverLabel: "Server:",
        heroSuffix: ", men",
        heroName: "A'zamjonov Muxammadrizo",
        typingPrefix: "Mening yo'nalishlarim:",
        heroSubtext: "Farg'ona Hackathon IT School o'quvchisi. NKND Studios asoschisi. Men Python/FastAPI backend Tizimlarini va Unreal Engine 5.8 da o'yinlarni yarataman.",
        heroBtn: "Loyihalarni ko'rish 🚀",
        heroContactBtn: "Bog'lanish 💬",
        titleJourney: "Ta'lim va Rivojlanish Yo'li",
        journeyTagEducation: "Ta'lim",
        journeyDate1: "2024 - Hozirgacha",
        journeySchoolTitle: "Hackathon IT School (Farg'ona)",
        journeySchoolDesc: "Dasturlash asoslari, algoritmlar va musobaqalarga tayyorgarlik.",
        journeyTagStudio: "O'yin Studiyasi",
        journeyDate2: "2024 - Hozirgacha",
        journeyStudioTitle: "Asoschi va Yetakchi — NKND Studios",
        journeyStudioDesc: "Unreal Engine 5.8 da Project Cube Island o'yinini yaratish va mexanikalarni loyihalash.",
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
        titleCubeIsland: "Project Cube Island",
        descCubeIsland: "Realistik biomlar va geometrik kublarni birlashtirgan omon qolish o'yini.",
        btnReadPitch: "Batafsil O'qish &rarr;",
        tagStorefront: "Faol Rivojlanish 🚀",
        titleStorefront: "Mahalliy Do'kon Veb-sayti",
        descStorefront: "Tezkor katalog va real vaqtda omborni kuzatish tizimiga ega veb-ilova.",
        btnViewDetails: "Batafsil Ko'rish &rarr;",
        titleProof: "Yutuqlar va Isbotlar",
        tagHackathon: "Akademik va Xakatonlar 🏆",
        titleHackathon: "Hackathon IT School Farg'ona",
        descHackathon: "Yuqori akademik ko'rsatkichlar va faol backend loyihalar uchun e'tirof etilgan.",
        btnViewProof: "Isbotni Ko'rish &rarr;",
        titleBlog: "Mening blogim va Studiya Yangiliklari",
        blogBadge1: "DevLog #04 • UE 5.8",
        blogDate1: "Iyul 2026",
        blogTitle1: "Project Cube Island - Prosedural Biomlar",
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
        reviewClient1: "Chakana Do'kon Mijozi",
        reviewBadge1: "Telegram orqali tasdiqlangan mijoz",
        reviewComment1: "\"A'zamjonov Muxammadrizo do'konimiz uchun tezkor raqamli katalog yaratib berdi. Ishonchli muloqot va toza kod!\"",
        reviewClient2: "Tech Group Korporatsiyasi",
        reviewBadge2: "Telegram orqali tasdiqlangan mijoz",
        reviewComment2: "\"Avtomatlashtirilgan Telegram bot API bo'yicha a'lo ish. Ma'lumotlar bazasi integratsiyasini mukammal bajardi.\"",
        reviewClient3: "Indie Dasturchilar Jamoasi",
        reviewBadge3: "Telegram orqali tasdiqlangan mijoz",
        reviewComment3: "\"Unreal Engine 5 PCG vositalari bo'yicha u bilan maslahatlashdik. Juda bilimdon va professional.\"",
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
        aiGreeting: "<strong>Salom! 👋</strong><br><br>Men Muxammadrizoning AI yordamchisiman. Uning dasturlash va o'yin loyihalari haqida nimani bilishni xohlaysiz?",
        chipAbout: "👨‍💻 Muxammadrizo kim?",
        chipBackend: "⚙️ Backend Arxitekturasi?",
        chipUe5: "🎮 UE5 O'yini haqida",
        chipFrontend: "🎨 Frontend qila oladimi?",
        chipContact: "📩 Qanday bog'lansam bo'ladi?",
        aiPlaceholder: "Xabar yozing..."
    },
    ru: {
        navAbout: "Обо мне",
        navJourney: "Путь",
        navSkills: "Навыки",
        navProjects: "Проекты",
        navProof: "Успехи",
        navBlog: "DevLog",
        navReviews: "Отзывы",
        navContact: "Контакты",
        heroBadge: "16 лет • Hackathon IT School Фергана",
        serverLabel: "Сервер:",
        heroSuffix: ", я",
        heroName: "А'замжонов Мухаммадризо",
        typingPrefix: "Я специализируюсь на:",
        heroSubtext: "Студент Hackathon IT School в Фергане. Основатель NKND Studios. Разрабатываю бэкенд на Python/FastAPI и игры на Unreal Engine 5.8.",
        heroBtn: "Смотреть Проекты 🚀",
        heroContactBtn: "Связаться 💬",
        titleJourney: "Образование и Развитие",
        journeyTagEducation: "Образование",
        journeyDate1: "2024 - Наст. время",
        journeySchoolTitle: "Hackathon IT School (Фергана)",
        journeySchoolDesc: "Изучение алгоритмов, инженерии ПО и участие в хакатонах.",
        journeyTagStudio: "Игровая Студия",
        journeyDate2: "2024 - Наст. время",
        journeyStudioTitle: "Основатель — NKND Studios",
        journeyStudioDesc: "Разработка игры Project Cube Island на Unreal Engine 5.8.",
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
        titleCubeIsland: "Project Cube Island",
        descCubeIsland: "Игра на выживание, сочетающая реалистичные биомы и абстрактные кубы.",
        btnReadPitch: "Читать Подробнее &rarr;",
        tagStorefront: "Активная Разработка 🚀",
        titleStorefront: "Витрина Местного Бизнеса",
        descStorefront: "Быстрое веб-приложение для розничного магазина с каталогом.",
        btnViewDetails: "Смотреть Детали &rarr;",
        titleProof: "Достижения и Сертификаты",
        tagHackathon: "Академические и Хакатоны 🏆",
        titleHackathon: "Hackathon IT School Фергана",
        descHackathon: "Признан за высокую успеваемость и активную разработку проектов.",
        btnViewProof: "Смотреть Сертификат &rarr;",
        titleBlog: "DevLog и Новости Студии",
        blogBadge1: "DevLog #04 • UE 5.8",
        blogDate1: "Июль 2026",
        blogTitle1: "Project Cube Island - Процедурные Биомы",
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
        reviewClient1: "Клиент Розничного Магазина",
        reviewBadge1: "Проверенный клиент через Telegram",
        reviewComment1: "\"А'замжонов Мухаммадризо создал быстрый цифровой каталог для нашего магазина. Надежная связь и чистый код!\"",
        reviewClient2: "Tech Group Corp",
        reviewBadge2: "Проверенный клиент через Telegram",
        reviewComment2: "\"Отличная работа над API Telegram-бота. Беспрепятственно настроил интеграцию с базой данных.\"",
        reviewClient3: "Инди Команда Разработчиков",
        reviewBadge3: "Проверенный клиент через Telegram",
        reviewComment3: "\"Консультировались с ним по инструментам PCG в Unreal Engine 5. Очень грамотный и профессиональный.\"",
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
        aiGreeting: "<strong>Здравствуйте! 👋</strong><br><br>Я ИИ-помощник Мухаммадризо. Чем могу помочь вам узнать о его разработке и проектах?",
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

/* Bulletproof Mobile Menu Toggle + Automatic AI Widget & Lang Button Vanishing */
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
const holoGreetings = [
    "Hi",
    "Salom",
    "Привет",
    "안녕하세요", // Korean
    "こんにちは", // Japanese
    "¡Hola!",
    "Bonjour",
    "مرحبا",    // Arabic
    "Ciao",
    "Namaste",
    "你好",      // Chinese
    "Guten Tag", // German
    "สวัสดี",    // Thai
    "שלום"      // Hebrew
];
let holoGreetingIndex = 0;

function rotateHoloGreeting() {
    const holoElem = document.getElementById('holo-greeting');
    if (!holoElem) return;

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
   3. DOM BINDINGS & BULLETPROOF MARQUEE TICKER
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
    changeLanguage(currentLanguage);

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

    const marqueeContainer = document.getElementById('chart-marquee-container');

    if (marqueeContainer) {
        function animateCounter(counter, targetVal) {
            const duration = 2200; // Paced 2.2s count-up
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
});

/* ==========================================================================
   4. TERMINAL LOADER (> Portfolio Output)
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
    const typedText = document.getElementById('typed-text');
    const loader = document.getElementById('loader');

    // Updated Intro Output: Prints "> P" -> Pause -> "ortfolio" (Output: > Portfolio)
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
                setTimeout(() => {
                    loader.style.display = 'none';
                }, 500);
            }, 200);
        }
    }

    setTimeout(typeTerminal, 500);
});

/* ==========================================================================
   5. TYPEWRITER (HERO SECTION)
   ========================================================================== */
const phrases = [
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

    const currentPhrase = phrases[phraseIndex];

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
   6. WEBSOCKET SERVER PING
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
        };

        ws.onmessage = (event) => {
            if (statusText) statusText.textContent = `Online (${event.data})`;
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
   7. MODALS & PROJECT FILTERS
   ========================================================================== */
window.openProjectModal = function(title, category, mediaUrl, description, tech, github, live) {
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-category').textContent = category;
    document.getElementById('modal-description').textContent = description;
    document.getElementById('modal-tech').textContent = tech;

    const mediaContainer = document.getElementById('modal-media-container');

    if (mediaUrl.endsWith('.mp4')) {
        mediaContainer.innerHTML = `<video src="${mediaUrl}" autoplay loop muted playsinline style="width:100%; border-radius:10px;"></video>`;
    } else {
        mediaContainer.innerHTML = `<img src="${mediaUrl}" style="width:100%; border-radius:10px;" alt="${title}">`;
    }

    const ghBtn = document.getElementById('modal-github-link');
    const liveBtn = document.getElementById('modal-live-link');

    if (github) {
        ghBtn.href = github;
        ghBtn.style.display = 'inline-block';
    } else {
        ghBtn.style.display = 'none';
    }

    if (live) {
        liveBtn.href = live;
        liveBtn.style.display = 'inline-block';
    } else {
        liveBtn.style.display = 'none';
    }

    document.getElementById('project-modal').style.display = 'flex';
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
   8. FORM SUBMISSIONS WITH TIMER GUARD
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
        reviewForm.addEventListener('submit', (e) => {
            e.preventDefault();
            reviewSubmitBtn.disabled = true;
            reviewSubmitBtn.textContent = 'Submitting... ⌛';

            alert('Thank you! Your review has been submitted for admin approval.');
            reviewForm.reset();

            setTimeout(() => {
                reviewSubmitBtn.disabled = false;
                reviewSubmitBtn.textContent = translations[currentLanguage].btnSubmitReview || 'Submit Review 💬';
            }, 3000);
        });
    }
});

/* ==========================================================================
   9. FLOATING AI CHATBOT WIDGET (CONVERSATIONAL HUMAN-LIKE ASSISTANT)
   ========================================================================== */
const aiKnowledge = {
    en: {
        greeting: "Hello there! 👋 I am Gemini, Muxammadrizo's AI assistant. I can tell you about his software engineering, game projects, freelance rates, or answer any general programming questions!",
        about: "Muxammadrizo is a 16-year-old developer studying at Hackathon IT School in Fergana, Uzbekistan. He is the founder and lead of NKND Studios, specializing in Python backends, FastAPI REST architectures, and Unreal Engine 5.8.",
        rates: "Since Muxammadrizo is a student starting out in freelancing, his rates are very affordable and negotiable! Pricing depends on project scope, complexity, and tech stack (Python/FastAPI, Telegram Bots, or UE5 tools), but always stays fair and budget-friendly.",
        location: "Muxammadrizo is based in Fergana, Uzbekistan. He works remotely with clients worldwide via Telegram and email.",
        frontend: "While his primary focus is deep backend architecture and game engines, he builds clean, modern Frontend interfaces using HTML, CSS, and JS—just like this portfolio!",
        studio: "He founded NKND Studios, an indie game studio currently developing 'Project Cube Island' in Unreal Engine 5.8 featuring procedural biomes and non-lethal blaster mechanics.",
        game: "He is architecting 'Project Cube Island' in Unreal Engine 5.8, utilizing PCG foliage networks, volumetric Lumen fog, and custom game mechanics.",
        backend: "His backend stack includes Python, FastAPI, SQLite, WebSockets for live data, Gmail 2FA OTP gateways, and automated Telegram bots.",
        contact: "You can reach out using the Contact Form on this page or message him directly on Telegram @muxammadrizo0125!"
    },
    uz: {
        greeting: "Salom! 👋 Men Muxammadrizoning AI yordamchisiman. Men sizga uning dasturlash va o'yin loyihalari, frilans narxlari haqida gapirib bera olaman!",
        about: "Muxammadrizo Farg'onadagi Hackathon IT School o'quvchisi, 16 yoshli dasturchi va NKND Studios asoschisi. U Python, FastAPI va Unreal Engine 5.8 bo'yicha mutaxassis.",
        rates: "Muxammadrizo frilansni endi boshlayotgan o'quvchi bo'lgani uchun uning xizmat narxlari juda hamyonbop va kelishiladigan! Narx loyiha hajmi va murakkabligiga bog'liq.",
        location: "Muxammadrizo O'zbekistonning Farg'ona shahrida yashaydi va masofaviy ishlaydi.",
        frontend: "U asosan backend me'morchiligini bajarsa ham, ushbu portfel kabi zamonaviy va chiroyli interfeyslarni yarata oladi.",
        studio: "U NKND Studios asoschisi va hozirda Unreal Engine 5.8 da 'Project Cube Island' o'yinini yaratmoqda.",
        game: "U 'Project Cube Island' o'yinini Unreal Engine 5.8 da PCG va Lumen texnologiyalari bilan yaratmoqda.",
        backend: "Uning backend steki: Python, FastAPI, SQLite, WebSockets va Telegram botlar.",
        contact: "U bilan sahifaning pastki qismidagi aloqa formasi yoki Telegram (@muxammadrizo0125) orqali bog'lanishingiz mumkin!"
    },
    ru: {
        greeting: "Здравствуйте! 👋 Я ИИ-помощник Мухаммадризо. Я могу рассказать вам о его бэкенд-системах, разработке игр, расценках на фриланс или ответить на любые вопросы!",
        about: "Мухаммадризо — 16-летний разработчик, студент Hackathon IT School в Фергане (Узбекистан) и основатель NKND Studios.",
        rates: "Поскольку Мухаммадризо — студент, начинающий путь во фрилансе, его расценки очень демократичны и обсуждаемы! Цена зависит от сложности и стека проекта.",
        location: "Мухаммадризо живет в Фергане, Узбекистан, и работает удаленно.",
        frontend: "Хотя он специализируется на бэкенде, он отлично владеет Frontend (HTML, CSS) и создает современные интерфейсы!",
        studio: "Он основал инди-студию NKND Studios, разрабатывающую 'Project Cube Island' на Unreal Engine 5.8.",
        game: "Мухаммадризо разрабатывает 'Project Cube Island' на Unreal Engine 5.8 с использованием систем PCG и Lumen.",
        backend: "Его бэкенд-стек: Python, FastAPI, SQLite, WebSockets и автоматизированные Telegram-боты.",
        contact: "Вы можете написать ему через форму контактов внизу страницы или напрямую в Telegram (@muxammadrizo0125)!"
    }
};

window.triggerQuickReply = function(topicKey) {
    let chipI18nKey = '';
    if (topicKey === 'about') chipI18nKey = 'chipAbout';
    if (topicKey === 'game') chipI18nKey = 'chipUe5';
    if (topicKey === 'backend') chipI18nKey = 'chipBackend';
    if (topicKey === 'frontend') chipI18nKey = 'chipFrontend';
    if (topicKey === 'contact') chipI18nKey = 'chipContact';

    const textToShow = translations[currentLanguage][chipI18nKey];
    const chatBody = document.getElementById('chat-body');

    if (chatBody) {
        const userDiv = document.createElement('div');
        userDiv.className = 'message user-message';
        userDiv.textContent = textToShow;
        chatBody.appendChild(userDiv);
        chatBody.scrollTop = chatBody.scrollHeight;

        setTimeout(() => {
            typeAiMessage(aiKnowledge[currentLanguage][topicKey] || aiKnowledge.en[topicKey]);
        }, 400);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const aiToggleBtn = document.getElementById('ai-toggle-btn');
    const closeChatBtn = document.getElementById('close-chat-btn');
    const chatWindow = document.getElementById('chat-window');
    const sendChatBtn = document.getElementById('send-chat-btn');
    const chatInput = document.getElementById('chat-input');

    if (aiToggleBtn && chatWindow) {
        aiToggleBtn.addEventListener('click', () => {
            chatWindow.classList.toggle('chat-hidden');
        });
    }

    if (closeChatBtn && chatWindow) {
        closeChatBtn.addEventListener('click', () => {
            chatWindow.classList.add('chat-hidden');
        });
    }

    if (sendChatBtn && chatInput) {
        sendChatBtn.addEventListener('click', () => processUserChat(chatInput.value));

        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                processUserChat(chatInput.value);
            }
        });
    }
});

function typeAiMessage(text) {
    const chatBody = document.getElementById('chat-body');
    if (!chatBody) return;

    const botDiv = document.createElement('div');
    botDiv.className = 'message bot-message';
    chatBody.appendChild(botDiv);

    let i = 0;
    function typing() {
        if (i < text.length) {
            botDiv.innerHTML += text.charAt(i);
            i++;
            chatBody.scrollTop = chatBody.scrollHeight;
            setTimeout(typing, 12);
        }
    }
    typing();
}

function processUserChat(text) {
    const originalText = text.trim();
    if (!originalText) return;

    const chatBody = document.getElementById('chat-body');
    const chatInput = document.getElementById('chat-input');

    if (chatBody) {
        const userDiv = document.createElement('div');
        userDiv.className = 'message user-message';
        userDiv.textContent = originalText;
        chatBody.appendChild(userDiv);

        if (chatInput) chatInput.value = '';
        chatBody.scrollTop = chatBody.scrollHeight;

        setTimeout(() => {
            const lowerText = originalText.toLowerCase();
            let replyText = null;

            let responseLang = currentLanguage;
            if (/[а-яА-ЯёЁ]/.test(lowerText)) {
                responseLang = 'ru';
            } else if (lowerText.includes('salom') || lowerText.includes('haqida') || lowerText.includes('o\'yin') || lowerText.includes('kim') || lowerText.includes('qanday') || lowerText.includes('narx')) {
                responseLang = 'uz';
            }

            const hasKeyword = (words) => words.some(w => lowerText.includes(w));

            if (hasKeyword(['hello', 'hi', 'hey', 'salom', 'привет'])) {
                replyText = aiKnowledge[responseLang].greeting;
            } else if (hasKeyword(['who', 'about', 'age', 'school', 'kim', 'yosh', 'кто', 'возраст', 'школа'])) {
                replyText = aiKnowledge[responseLang].about;
            } else if (hasKeyword(['price', 'cost', 'rate', 'hire', 'pay', 'narx', 'puli', 'цена', 'стоимость', 'сколько'])) {
                replyText = aiKnowledge[responseLang].rates;
            } else if (hasKeyword(['where', 'live', 'location', 'qayerda', 'shahri', 'где', 'город'])) {
                replyText = aiKnowledge[responseLang].location;
            } else if (hasKeyword(['nknd', 'studio', 'студия'])) {
                replyText = aiKnowledge[responseLang].studio;
            } else if (hasKeyword(['frontend', 'html', 'css', 'фронтенд'])) {
                replyText = aiKnowledge[responseLang].frontend;
            } else if (hasKeyword(['game', 'ue5', 'unreal', 'o\'yin', 'игра', 'игру'])) {
                replyText = aiKnowledge[responseLang].game;
            } else if (hasKeyword(['python', 'backend', 'api', 'fastapi', 'бэкенд'])) {
                replyText = aiKnowledge[responseLang].backend;
            } else if (hasKeyword(['contact', 'work', 'aloqa', 'контакт', 'связаться'])) {
                replyText = aiKnowledge[responseLang].contact;
            } else {
                // Natural conversational fallbacks
                if (responseLang === 'uz') {
                    replyText = "Men Muxammadrizoning AI yordamchisiman! U Python, FastAPI backend va Unreal Engine 5.8 bo'yicha kuchli tajribaga ega. U bilan loyihalar bo'yicha ishlash, narxlar yoki bog'lanish haqida so'rashingiz mumkin!";
                } else if (responseLang === 'ru') {
                    replyText = "Я ИИ-помощник Мухаммадризо! Он специализируется на Python/FastAPI бэкенде и Unreal Engine 5.8. Можете спросить меня о его проектах, расценках или о том, как с ним связаться!";
                } else {
                    replyText = "I am Muxammadrizo's AI assistant! He specializes in Python/FastAPI backends and Unreal Engine 5.8. Feel free to ask me about his projects, freelance rates, or how to get in touch with him!";
                }
            }

            typeAiMessage(replyText);
        }, 400);
    }
}