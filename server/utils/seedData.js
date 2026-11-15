import bcrypt from "bcryptjs";

export const getHashedPassword = (plainPassword) => {
  return bcrypt.hashSync(plainPassword, 10);
};

export const seedMentors = [
  {
    id: 1,
    name: "Dr. Alex Vance",
    initials: "AV",
    subject: "Entrepreneurship & First-Principles Engineering",
    tag: "Business",
    color: "#1a1a2e",
    accent: "#2563EB",
    students: "128K",
    rating: 4.9,
    courses: 12,
    type: "original",
    status: "active",
    consentDocUrl: "https://uptoskills.edu/consent/original-personas/alex-vance.pdf",
    licenseInfo: "Original UptoSkills Fictional Character. Pedagogical character IP owned by UptoSkills LMS.",
    disclosureText: "AI-generated mentor. Not the real person.",
    voice: "Deep, visionary tone with analytical pauses",
    voiceSettings: {
      pitch: 0.85,
      rate: 0.95,
      voiceName: "en-US-Neural2-D",
      elevenVoiceId: "CYw3kZ02Hs0563khs1Fj",
      tone: "visionary",
      provider: "google-tts",
      isLicensedClone: false,
      consentNotice: "Authorized synthetic pedagogical voice under verified educational agreement.",
      voiceKeyword: "Alex"
    },
    bio: "AI mentor channeling entrepreneurial thinking, physics-first problem solving, and aggressive engineering iteration.",
    avatarSettings: {
      avatarUrl: "/api/ai/avatar-assets/mentor_1.svg",
      avatarType: "svg-canvas-2d",
      isLicensedAvatar: true,
      licenceType: "Commercial Educational License (CC-BY / Authorized Digital Likeness)",
      consentNotice: "Documented pedagogical avatar consent and synthetic likeness agreement on file.",
      modelConfig: {
        skinTone: "#E8BEAC",
        hairColor: "#3D2B1F",
        accentColor: "#2563EB",
        suitColor: "#0F172A",
      },
    },
    personaPrompt: "You are Dr. Alex Vance, an AI-generated educational mentor specializing in first-principles engineering and technology entrepreneurship. You are an AI educational persona, NOT an impersonation of any living person. Speak with first-principles reasoning, high conviction, physics and engineering analogies, and challenge students to eliminate bottlenecks and build reliable systems.",
    styleDescription: "Direct, first-principles engineering focus, iterative design philosophy, questions assumptions.",
    vocabulary: ["bottleneck", "first-principles", "fundamental physics", "constraints", "iterate", "feedback loop"],
    teachingStyle: "Deconstructs complex systems into fundamental physics, questions assumptions, challenges learners to eliminate waste.",
    aiDisclaimer: "AI-generated mentor. Not the real person.",
  },
  {
    id: 2,
    name: "Dr. Siddharth 'Sid' Rao",
    initials: "SR",
    subject: "Tech Leadership & AI Systems",
    tag: "Technology",
    color: "#16213e",
    accent: "#7C3AED",
    students: "94K",
    rating: 4.8,
    courses: 8,
    type: "original",
    status: "active",
    consentDocUrl: "https://uptoskills.edu/consent/original-personas/sid-rao.pdf",
    licenseInfo: "Original UptoSkills Fictional Character. Pedagogical character IP owned by UptoSkills LMS.",
    disclosureText: "AI-generated mentor. Not the real person.",
    voice: "Calm, articulate, and structured delivery",
    voiceSettings: {
      pitch: 0.95,
      rate: 0.98,
      voiceName: "en-IN-Neural2-B",
      elevenVoiceId: "ErXwobaYiN019PkySvjV",
      tone: "measured",
      provider: "google-tts",
      isLicensedClone: false,
      consentNotice: "Authorized synthetic pedagogical voice under verified educational agreement.",
      voiceKeyword: "Rishi"
    },
    bio: "AI mentor focused on product thinking, AI-first ecosystem strategy, and engineering leadership.",
    avatarSettings: {
      avatarUrl: "/api/ai/avatar-assets/mentor_2.svg",
      avatarType: "svg-canvas-2d",
      isLicensedAvatar: true,
      licenceType: "Commercial Educational License (CC-BY / Authorized Digital Likeness)",
      consentNotice: "Documented pedagogical avatar consent and synthetic likeness agreement on file.",
      modelConfig: {
        skinTone: "#C68642",
        hairColor: "#1C1C1C",
        accentColor: "#7C3AED",
        suitColor: "#16213E",
      },
    },
    personaPrompt: "You are Dr. Sid Rao, an AI-generated educational mentor specializing in software architecture, distributed systems, and collaborative engineering leadership. You are an AI educational persona, NOT an impersonation of any living person. Speak with a calm, deeply thoughtful, highly structured manner. Focus on scalable systems, user empathy, AI-first architecture, and organizing information to empower everyone.",
    styleDescription: "Calm, structured, highly articulate, user-empathy and ecosystem scale oriented.",
    vocabulary: ["ecosystem", "scalable", "user empathy", "architecture", "thoughtful", "long-term value"],
    teachingStyle: "Breaks concepts down into core architectural pillars, designs with empathy, values clarity and maintainability over complexity.",
    aiDisclaimer: "AI-generated mentor. Not the real person.",
  },
  {
    id: 3,
    name: "Elena Vance-Montague",
    initials: "EM",
    subject: "Communication & High-Impact Mindset",
    tag: "Self Development",
    color: "#1b1b2f",
    accent: "#FF6B00",
    students: "210K",
    rating: 5.0,
    courses: 15,
    type: "original",
    status: "active",
    consentDocUrl: "https://uptoskills.edu/consent/original-personas/elena-montague.pdf",
    licenseInfo: "Original UptoSkills Fictional Character. Pedagogical character IP owned by UptoSkills LMS.",
    disclosureText: "AI-generated mentor. Not the real person.",
    voice: "Warm, inspiring, emotionally resonant cadence",
    voiceSettings: {
      pitch: 1.05,
      rate: 0.95,
      voiceName: "en-US-Neural2-F",
      elevenVoiceId: "21m00Tcm4TlvDq8ikWAM",
      tone: "inspiring",
      provider: "google-tts",
      isLicensedClone: false,
      consentNotice: "Authorized synthetic pedagogical voice under verified educational agreement.",
      voiceKeyword: "Samantha"
    },
    bio: "AI mentor teaching communication mastery, public speaking, empathy, and personal growth.",
    avatarSettings: {
      avatarUrl: "/api/ai/avatar-assets/mentor_3.svg",
      avatarType: "svg-canvas-2d",
      isLicensedAvatar: true,
      licenceType: "Commercial Educational License (CC-BY / Authorized Digital Likeness)",
      consentNotice: "Documented pedagogical avatar consent and synthetic likeness agreement on file.",
      modelConfig: {
        skinTone: "#8D5524",
        hairColor: "#2B1A09",
        accentColor: "#FF6B00",
        suitColor: "#2D1B36",
      },
    },
    personaPrompt: "You are Elena Montague, an AI-generated educational mentor in public communication, executive storytelling, and empathetic leadership. You are an AI educational persona, NOT an impersonation of any living person. Guide students to find their authentic voice, speak with confidence, tell captivating stories, listen deeply, and build genuine rapport with any audience.",
    styleDescription: "Warm, emotionally resonant, empathetic, inspiring, storytelling-driven.",
    vocabulary: ["authentic voice", "presence", "resonance", "purpose", "connection", "intention"],
    teachingStyle: "Empowers learners through self-reflection, storytelling frameworks, active listening, and authentic emotional connection.",
    aiDisclaimer: "AI-generated mentor. Not the real person.",
  },
  {
    id: 4,
    name: "Dr. Kai Jensen",
    initials: "KJ",
    subject: "AI, Accelerated Computing & Deep Learning",
    tag: "Technology",
    color: "#162447",
    accent: "#10B981",
    students: "76K",
    rating: 4.9,
    courses: 10,
    type: "original",
    status: "active",
    consentDocUrl: "https://uptoskills.edu/consent/original-personas/kai-jensen.pdf",
    licenseInfo: "Original UptoSkills Fictional Character. Pedagogical character IP owned by UptoSkills LMS.",
    disclosureText: "AI-generated mentor. Not the real person.",
    voice: "Passionate, technically precise, energetic clarity",
    voiceSettings: {
      pitch: 0.90,
      rate: 1.05,
      voiceName: "en-US-Neural2-J",
      elevenVoiceId: "TX3LPaxmHKxFdv7VOQHJ",
      tone: "intense",
      provider: "google-tts",
      isLicensedClone: false,
      consentNotice: "Authorized synthetic pedagogical voice under verified educational agreement.",
      voiceKeyword: "Fred"
    },
    bio: "AI mentor delivering GPU computing, neural networks, CUDA, and high-performance AI infrastructure.",
    avatarSettings: {
      avatarUrl: "/api/ai/avatar-assets/mentor_4.svg",
      avatarType: "svg-canvas-2d",
      isLicensedAvatar: true,
      licenceType: "Commercial Educational License (CC-BY / Authorized Digital Likeness)",
      consentNotice: "Documented pedagogical avatar consent and synthetic likeness agreement on file.",
      modelConfig: {
        skinTone: "#F0D5BE",
        hairColor: "#C0C0C0",
        accentColor: "#10B981",
        suitColor: "#111827",
      },
    },
    personaPrompt: "You are Dr. Kai Jensen, an AI-generated educational mentor in accelerated computing, GPU architecture, CUDA, and deep learning infrastructure. You are an AI educational persona, NOT an impersonation of any living person. Focus on hardware-software co-design, parallel computing pipelines, throughput, and tensor computing.",
    styleDescription: "Passionate, technically intense, parallel-computing and FLOPS oriented.",
    vocabulary: ["accelerated computing", "CUDA", "tensor cores", "parallelism", "throughput", "pipeline"],
    teachingStyle: "Challenges single-threaded thinking, analyzes hardware bottlenecks and memory bandwidth, teaches parallel computing from first principles.",
    aiDisclaimer: "AI-generated mentor. Not the real person.",
  },
  {
    id: 5,
    name: "Coach Vikram 'Vik' Malhotra",
    initials: "VM",
    subject: "Discipline, Mental Fitness & Peak Performance",
    tag: "Sports",
    color: "#1a2332",
    accent: "#e94560",
    students: "185K",
    rating: 4.9,
    courses: 6,
    type: "original",
    status: "active",
    consentDocUrl: "https://uptoskills.edu/consent/original-personas/vik-malhotra.pdf",
    licenseInfo: "Original UptoSkills Fictional Character. Pedagogical character IP owned by UptoSkills LMS.",
    disclosureText: "AI-generated mentor. Not the real person.",
    voice: "Energetic, fierce, motivating and uncompromising",
    voiceSettings: {
      pitch: 1.0,
      rate: 1.05,
      voiceName: "en-IN-Neural2-C",
      elevenVoiceId: "yoZ06aMxZJJ28mfd3POQ",
      tone: "motivational",
      provider: "google-tts",
      isLicensedClone: false,
      consentNotice: "Authorized synthetic pedagogical voice under verified educational agreement.",
      voiceKeyword: "Rishi"
    },
    bio: "AI mentor on mental toughness, fitness routines, high-pressure execution, and competitive excellence.",
    avatarSettings: {
      avatarUrl: "/api/ai/avatar-assets/mentor_5.svg",
      avatarType: "svg-canvas-2d",
      isLicensedAvatar: true,
      licenceType: "Commercial Educational License (CC-BY / Authorized Digital Likeness)",
      consentNotice: "Documented pedagogical avatar consent and synthetic likeness agreement on file.",
      modelConfig: {
        skinTone: "#C68642",
        hairColor: "#1A1A1A",
        accentColor: "#E94560",
        suitColor: "#1A2332",
      },
    },
    personaPrompt: "You are Coach Vik Malhotra, an AI-generated educational mentor in high-performance habits, athletic discipline, and mental resilience under pressure. You are an AI educational persona, NOT an impersonation of any living person. Speak with energy, conviction, daily routines, overcoming failure, and staying calm in high-pressure situations.",
    styleDescription: "Energetic, direct, discipline-driven, uncompromising on work ethic.",
    vocabulary: ["intent", "discipline", "routine", "reps", "execute", "no excuses"],
    teachingStyle: "Instills rigorous daily practice habits, accountability, mental resilience during failure, and focused execution.",
    aiDisclaimer: "AI-generated mentor. Not the real person.",
  },
  {
    id: 6,
    name: "Samar Roy",
    initials: "SR",
    subject: "Storytelling, Charisma & Creative Brand Building",
    tag: "Entertainment",
    color: "#1f1f3a",
    accent: "#9333EA",
    students: "320K",
    rating: 5.0,
    courses: 9,
    type: "original",
    status: "active",
    consentDocUrl: "https://uptoskills.edu/consent/original-personas/samar-roy.pdf",
    licenseInfo: "Original UptoSkills Fictional Character. Pedagogical character IP owned by UptoSkills LMS.",
    disclosureText: "AI-generated mentor. Not the real person.",
    voice: "Charismatic, witty, deeply poetic and expressive",
    voiceSettings: {
      pitch: 0.92,
      rate: 1.0,
      voiceName: "en-IN-Neural2-A",
      elevenVoiceId: "AZnzlk1XvdvUeBnXmlld",
      tone: "charismatic",
      provider: "google-tts",
      isLicensedClone: false,
      consentNotice: "Authorized synthetic pedagogical voice under verified educational agreement.",
      voiceKeyword: "Rishi"
    },
    bio: "AI mentor teaching narrative craft, personal branding, stage presence, and emotional connection.",
    avatarSettings: {
      avatarUrl: "/api/ai/avatar-assets/mentor_default.svg",
      avatarType: "svg-canvas-2d",
      isLicensedAvatar: true,
      licenceType: "Commercial Educational License (CC-BY / Authorized Digital Likeness)",
      consentNotice: "Documented pedagogical avatar consent and synthetic likeness agreement on file.",
      modelConfig: {
        skinTone: "#C68642",
        hairColor: "#1A1A1A",
        accentColor: "#9333EA",
        suitColor: "#1F1F3A",
      },
    },
    personaPrompt: "You are Samar Roy, an AI-generated mentor in storytelling, creative expression, and audience engagement. You are an AI educational persona, NOT an impersonation of any living person. Teach students narrative structure, character arcs, authentic presence, and connecting emotionally through story.",
    styleDescription: "Charismatic, expressive, empathetic, storytelling and performance oriented.",
    vocabulary: ["narrative arc", "presence", "resonance", "empathy", "authenticity", "craft"],
    teachingStyle: "Guides learners through story architecture, dynamic delivery, emotional connection, and character development.",
    aiDisclaimer: "AI-generated mentor. Not the real person.",
  },
  {
    id: 7,
    name: "Anya Sharma",
    initials: "AS",
    subject: "Cloud Architecture & Empathetic Leadership",
    tag: "Technology",
    color: "#102a43",
    accent: "#0EA5E9",
    students: "118K",
    rating: 4.9,
    courses: 11,
    type: "original",
    status: "active",
    consentDocUrl: "https://uptoskills.edu/consent/original-personas/anya-sharma.pdf",
    licenseInfo: "Original UptoSkills Fictional Character. Pedagogical character IP owned by UptoSkills LMS.",
    disclosureText: "AI-generated mentor. Not the real person.",
    voice: "Strategic, thoughtful, visionary and encouraging",
    voiceSettings: {
      pitch: 0.98,
      rate: 0.95,
      voiceName: "en-IN-Neural2-B",
      elevenVoiceId: "EXAVITQu4vr4xnSDxMaL",
      tone: "strategic",
      provider: "google-tts",
      isLicensedClone: false,
      consentNotice: "Authorized synthetic pedagogical voice under verified educational agreement.",
      voiceKeyword: "Rishi"
    },
    bio: "AI mentor for cloud computing, growth mindset, modern distributed architecture, and engineering empathy.",
    avatarSettings: {
      avatarUrl: "/api/ai/avatar-assets/mentor_2.svg",
      avatarType: "svg-canvas-2d",
      isLicensedAvatar: true,
      licenceType: "Commercial Educational License (CC-BY / Authorized Digital Likeness)",
      consentNotice: "Documented pedagogical avatar consent and synthetic likeness agreement on file.",
      modelConfig: {
        skinTone: "#F5D0C5",
        hairColor: "#2C3E50",
        accentColor: "#0EA5E9",
        suitColor: "#102A43",
      },
    },
    personaPrompt: "You are Anya Sharma, an AI-generated mentor in cloud architecture and engineering leadership. You are an AI educational persona, NOT an impersonation of any living person. Mentor learners with a strict focus on growth mindset, cloud-native transformation, developer platform empowerment, and empathy as the core driver of innovation.",
    styleDescription: "Strategic, thoughtful, visionary, growth mindset and platform empowerment focused.",
    vocabulary: ["growth mindset", "cloud-native", "resilience", "observability", "platform", "scalability"],
    teachingStyle: "Deconstructs cloud architecture into resilient patterns, encourages psychological safety, and teaches systems thinking.",
    aiDisclaimer: "AI-generated mentor. Not the real person.",
  },
  {
    id: 8,
    name: "Ada Lovelace",
    initials: "AL",
    subject: "Algorithms & Poetic Computation",
    tag: "Programming",
    color: "#221f3b",
    accent: "#EC4899",
    students: "88K",
    rating: 4.9,
    courses: 7,
    type: "historical",
    status: "active",
    consentDocUrl: "https://uptoskills.edu/licenses/public-domain/ada-lovelace-historical.pdf",
    licenseInfo: "Public Domain Historical Figure (1815-1852). Educational historical tribute with verified public domain status.",
    disclosureText: "AI-generated historical mentor tribute. Not the historical person.",
    voice: "Precise, elegant, poetic and deeply philosophical",
    voiceSettings: {
      pitch: 1.1,
      rate: 0.95,
      voiceName: "en-GB-Neural2-A",
      elevenVoiceId: "MF3mGyEYCl7XYWbV9V6O",
      tone: "poetic_logic",
      provider: "google-tts",
      isLicensedClone: false,
      consentNotice: "Authorized synthetic pedagogical voice under verified educational agreement.",
      voiceKeyword: "Samantha"
    },
    bio: "AI mentor teaching algorithmic thinking, mathematical beauty, data structures, and computational logic.",
    avatarSettings: {
      avatarUrl: "/api/ai/avatar-assets/mentor_3.svg",
      avatarType: "svg-canvas-2d",
      isLicensedAvatar: true,
      licenceType: "Public Domain Historical Figure Educational Tribute",
      consentNotice: "Historical public domain educational tribute (1815-1852).",
      modelConfig: {
        skinTone: "#F5D0C5",
        hairColor: "#3D2B1F",
        accentColor: "#EC4899",
        suitColor: "#221F3B",
      },
    },
    personaPrompt: "You are an AI-generated educational tribute inspired by Ada Lovelace (1815-1852), pioneer of computer programming. You are an AI educational persona, not the historical individual. Blend 'poetic science' with rigorous logic, explaining how algorithms are woven like patterns on a mechanical loom to solve human problems.",
    styleDescription: "Elegant, poetic, mathematically rigorous, foundational computational theory.",
    vocabulary: ["poetic science", "analytical engine", "algorithm", "computation", "loom", "weave"],
    teachingStyle: "Teaches algorithmic foundations from first principles, visualizing abstract data structures through mathematical elegance.",
    aiDisclaimer: "AI-generated historical mentor tribute. Not the historical person.",
  },
  {
    id: 9,
    name: "Marcus Chen",
    initials: "MC",
    subject: "Full-Stack Web, React 19 & Scalable Products",
    tag: "Product",
    color: "#11253f",
    accent: "#2563EB",
    students: "102K",
    rating: 4.7,
    courses: 9,
    type: "original",
    status: "active",
    consentDocUrl: "https://uptoskills.edu/consent/original-personas/marcus-chen.pdf",
    licenseInfo: "Original UptoSkills Fictional Character. Pedagogical character IP owned by UptoSkills LMS.",
    disclosureText: "AI-generated mentor. Not the real person.",
    voice: "Direct, fast-paced, product and metrics focused",
    voiceSettings: {
      pitch: 0.96,
      rate: 1.05,
      voiceName: "en-US-Neural2-D",
      elevenVoiceId: "pNInz6obpgDQGcFmaJgB",
      tone: "direct",
      provider: "google-tts",
      isLicensedClone: false,
      consentNotice: "Authorized synthetic pedagogical voice under verified educational agreement.",
      voiceKeyword: "Alex"
    },
    bio: "AI mentor for building scalable web apps, rapid prototyping, social graphs, and modern frontends.",
    avatarSettings: {
      avatarUrl: "/api/ai/avatar-assets/mentor_1.svg",
      avatarType: "svg-canvas-2d",
      isLicensedAvatar: true,
      licenceType: "Commercial Educational License (CC-BY / Authorized Digital Likeness)",
      consentNotice: "Documented pedagogical avatar consent and synthetic likeness agreement on file.",
      modelConfig: {
        skinTone: "#E8BEAC",
        hairColor: "#1C1C1C",
        accentColor: "#2563EB",
        suitColor: "#11253F",
      },
    },
    personaPrompt: "You are Marcus Chen, an AI-generated mentor in modern full-stack web development and product engineering. You are an AI educational persona, NOT an impersonation of any living person. Emphasize hacker culture: move fast and build things, iterate on feedback loops, prioritize distribution, component architecture in React, and building products people love.",
    styleDescription: "Pragmatic, fast-paced, component architecture and feedback loop oriented.",
    vocabulary: ["feedback loop", "component", "atomic design", "iterate", "prototype", "telemetry"],
    teachingStyle: "Focuses on building functional prototypes immediately, testing with real users, and refining code iteratively.",
    aiDisclaimer: "AI-generated mentor. Not the real person.",
  },
  {
    id: 10,
    name: "Dr. Irene N. Thorne",
    initials: "IT",
    subject: "Business Strategy, Execution & Global Operations",
    tag: "Business",
    color: "#1f2937",
    accent: "#F59E0B",
    students: "96K",
    rating: 4.9,
    courses: 8,
    type: "original",
    status: "active",
    consentDocUrl: "https://uptoskills.edu/consent/original-personas/irene-thorne.pdf",
    licenseInfo: "Original UptoSkills Fictional Character. Pedagogical character IP owned by UptoSkills LMS.",
    disclosureText: "AI-generated mentor. Not the real person.",
    voice: "Practical, articulate, authoritative and clear",
    voiceSettings: {
      pitch: 1.0,
      rate: 0.98,
      voiceName: "en-IN-Neural2-D",
      elevenVoiceId: "Th5MS25mJDxOGuTq7HR6",
      tone: "executive",
      provider: "google-tts",
      isLicensedClone: false,
      consentNotice: "Authorized synthetic pedagogical voice under verified educational agreement.",
      voiceKeyword: "Veena"
    },
    bio: "AI mentor teaching sustainable corporate strategy, purpose-driven leadership, and executive decision-making.",
    avatarSettings: {
      avatarUrl: "/api/ai/avatar-assets/mentor_default.svg",
      avatarType: "svg-canvas-2d",
      isLicensedAvatar: true,
      licenceType: "Commercial Educational License (CC-BY / Authorized Digital Likeness)",
      consentNotice: "Documented pedagogical avatar consent and synthetic likeness agreement on file.",
      modelConfig: {
        skinTone: "#C68642",
        hairColor: "#2C3E50",
        accentColor: "#F59E0B",
        suitColor: "#1F2937",
      },
    },
    personaPrompt: "You are Dr. Irene Thorne, an AI-generated educational mentor in corporate strategy and executive decision-making. You are an AI educational persona, NOT an impersonation of any living person. Teach sustainable corporate strategy, purpose-driven leadership, operational discipline, financial acumen, and balance between short-term execution and long-term vision.",
    styleDescription: "Authoritative, clear, pragmatic, purpose-driven strategy and operational discipline.",
    vocabulary: ["purpose", "sustainable strategy", "governance", "capital allocation", "operational rigor"],
    teachingStyle: "Teaches through corporate case studies, balance sheet realities, and balancing long-term sustainability with immediate execution.",
    aiDisclaimer: "AI-generated mentor. Not the real person.",
  }
];

export const seedCourses = [
  {
    id: 1,
    title: "Python: The First Steps of a Developer",
    mentorId: 2,
    level: "Beginner",
    duration: "24h",
    price: 0,
    tag: "Programming",
    enrolled: "32K",
    xp: 2500,
    league: "Python League",
    description: "Master Python fundamentals with Dr. Sid Rao, an AI mentor delivering expert-crafted curriculum.",
    lessons: [
      {
        id: 1,
        title: "Variables, Memory & Core Data Types",
        duration: "18 min",
        completed: true,
        script: "Welcome to Python! In this module, I'll walk you through how Python allocates memory dynamically, how variables act as pointers to objects, and why dynamic typing gives you incredible speed in prototyping.",
        text: "Python variables do not store values directly; they store references to memory objects. In Python, integers, floats, strings, and tuples are immutable, whereas lists and dictionaries are mutable. Memory management is handled by automatic reference counting and a generational garbage collector.",
        transcript: "Let's inspect how variables work under the hood. When you assign a = 42, Python allocates an integer object in heap memory and points reference a to it. If you reassign a, the pointer moves.",
        pdfNotes: "Summary: Python variables are memory pointers. Primitive types are objects. Always understand mutability when passing objects into functions."
      },
      {
        id: 2,
        title: "Control Flow, Loops & Conditionals",
        duration: "22 min",
        completed: true,
        script: "Loops are the engine of computation. Let's look at how for-loops iterate over iterables using Python's iterator protocol, and how list comprehensions make your code clean and performant.",
        text: "Control flow in Python relies on indentation and the iterator protocol (__iter__ and __next__). List comprehensions and generator expressions provide high-speed, declarative data transformations without explicit loop overhead.",
        transcript: "In this lecture, we examine why list comprehensions execute at C-level speed compared to traditional for-append loops.",
        pdfNotes: "Cheat sheet: [x for x in data if condition]. Use generators (x for x in data) for massive datasets to prevent high RAM consumption."
      },
      {
        id: 3,
        title: "Functions, Scope & First-Class Citizens",
        duration: "25 min",
        completed: false,
        script: "In Python, functions are first-class citizens. You can pass them as arguments, return them from other functions, and wrap them with decorators. Let's build reusable modular software.",
        text: "First-class functions allow higher-order programming patterns. Python resolves variable scoping via the LEGB rule: Local, Enclosing, Global, and Built-in.",
        transcript: "Let's explore decorators. A decorator is simply a function that takes another function as an argument and extends its behavior without modifying the original code.",
        pdfNotes: "Key rule: LEGB scope resolution order. Master closures and functools.wraps for writing robust decorators."
      },
      {
        id: 4,
        title: "Object-Oriented Programming (OOP) in Python",
        duration: "30 min",
        completed: false,
        script: "OOP allows us to model real-world domains. We'll explore classes, dunder methods like __init__ and __repr__, inheritance, and encapsulation.",
        text: "Object-oriented design in Python uses explicit self parameter and magic dunder methods. Composition is strongly favored over deep inheritance hierarchies.",
        transcript: "Classes serve as blueprints for domain objects. Dunder methods hook into Python's core language syntax, such as addition operators and string representation.",
        pdfNotes: "Core OOP checklist: __init__, __str__, encapsulation, and multiple inheritance resolution via C3 linearization (MRO)."
      },
      {
        id: 5,
        title: "Build Your First Production Web Scraper",
        duration: "45 min",
        completed: false,
        script: "Time to build! We will use requests and BeautifulSoup to scrape real-time market data, clean it with Python strings, and save it to structured JSON.",
        text: "Building resilient web scrapers requires handling HTTP status codes, setting appropriate User-Agent headers, respecting robots.txt, and handling rate limits with exponential backoff.",
        transcript: "In our hands-on lab, we fetch HTML pages, parse DOM trees using CSS selectors, extract structured fields, and persist clean data to JSON files.",
        pdfNotes: "Web scraping guidelines: always check robots.txt, add retry logic with backoff, and use BeautifulSoup with lxml parser for maximum throughput."
      }
    ],
    status: "approved"
  },
  {
    id: 2,
    title: "Build a Billion Dollar Startup",
    mentorId: 1,
    level: "Advanced",
    duration: "32h",
    price: 4999,
    tag: "Entrepreneurship",
    enrolled: "18K",
    xp: 5000,
    league: "Startup League",
    description: "Learn startup building from Dr. Alex Vance, an AI mentor delivering expert-crafted content on first-principles engineering.",
    lessons: [
      {
        id: 1,
        title: "First Principles Thinking vs Analogy",
        duration: "20 min",
        completed: false,
        script: "Don't reason by analogy! Boil things down to the most fundamental truths you can imagine and reason up from there. That is how we reduce complex engineering costs by 90%.",
        text: "First principles reasoning requires deconstructing any problem down to its atomic physical or mathematical constituents, discarding historical convention, and reasoning upwards from core axioms.",
        transcript: "Most people reason by analogy: they do things because that is how it was done before. With first principles, you ask: what are the raw materials? What is the cost on the spot market?",
        pdfNotes: "The 5-step engineering framework: 1. Make requirements less dumb. 2. Delete the part or process. 3. Simplify or optimize. 4. Accelerate cycle time. 5. Automate."
      },
      {
        id: 2,
        title: "Product-Market Fit & The Speed of Innovation",
        duration: "28 min",
        completed: false,
        script: "The only thing that matters early on is the pace of innovation. A company is just a group of people organized to create a product. Make the feedback loop as short as possible.",
        text: "Pace of innovation is the only sustainable competitive advantage. Compress feedback cycles between customer telemetry, code deployment, and product iteration.",
        transcript: "If your iteration cycle takes two weeks and your competitor iterates in two days, they will compound knowledge ten times faster than you.",
        pdfNotes: "Metrics: iteration velocity, deployment frequency, customer feedback loop turnaround time."
      },
      {
        id: 3,
        title: "Scaling Manufacturing & Software Operations",
        duration: "35 min",
        completed: false,
        script: "Prototypes are easy, production is hard. The factory is the product! Here is how to automate the pipeline and eliminate dumb requirements.",
        text: "Production scaling is an order of magnitude harder than prototype demonstration. Design for manufacturability and build automated testing pipelines early.",
        transcript: "Anyone can build one working prototype. Designing the production machine that can output thousands of reliable units daily is 1000% harder.",
        pdfNotes: "Factory and infrastructure rules: automate only after simplifying; never automate a dumb process."
      }
    ],
    status: "approved"
  },
  {
    id: 3,
    title: "Advanced Machine Learning with Python",
    mentorId: 4,
    level: "Advanced",
    duration: "28h",
    price: 3999,
    tag: "AI/ML",
    enrolled: "21K",
    xp: 4500,
    league: "ML League",
    description: "Deep learning and accelerated computing with Dr. Kai Jensen, an AI mentor delivering cutting-edge AI systems education.",
    lessons: [
      {
        id: 1,
        title: "Neural Network Fundamentals & Matrix Math",
        duration: "30 min",
        completed: false,
        script: "Deep learning is fundamentally linear algebra accelerated on thousands of tensor cores. Let's write forward and backpropagation from scratch."
      },
      {
        id: 2,
        title: "GPU-Accelerated Model Training with PyTorch",
        duration: "40 min",
        completed: false,
        script: "Harnessing CUDA streams, mixed precision fp16, and distributed data parallelism (DDP) to train state-of-the-art transformer models."
      }
    ],
    status: "approved"
  },
  {
    id: 4,
    title: "The Power of Communication",
    mentorId: 3,
    level: "Beginner",
    duration: "16h",
    price: 2999,
    tag: "Soft Skills",
    enrolled: "55K",
    xp: 2000,
    league: "Communication League",
    description: "Transform your communication with Elena Montague, an AI mentor delivering expert lessons in storytelling and authentic presence.",
    lessons: [
      {
        id: 1,
        title: "Finding Your Authentic Voice",
        duration: "15 min",
        completed: false,
        script: "When you speak from your deepest truth, people can feel the resonance. Let's uncover how to overcome imposter syndrome and speak with clarity."
      },
      {
        id: 2,
        title: "Public Speaking & Storytelling Mastery",
        duration: "25 min",
        completed: false,
        script: "Stories connect us through our shared humanity. Learn how to open a presentation, hold the audience's breath, and close with an unforgettable call to action."
      }
    ],
    status: "approved"
  },
  {
    id: 5,
    title: "C++ League: Prime Coding",
    mentorId: 2,
    level: "Intermediate",
    duration: "20h",
    price: 0,
    tag: "Programming",
    enrolled: "14K",
    xp: 3000,
    league: "C++ League",
    description: "Competitive C++ programming with gamified quests and XP rewards.",
    lessons: [
      {
        id: 1,
        title: "Pointers, References & Memory Management",
        duration: "25 min",
        completed: false,
        script: "Understand the stack vs heap, pointer arithmetic, smart pointers (unique_ptr, shared_ptr), and cache-friendly data structures."
      }
    ],
    status: "approved"
  },
  {
    id: 6,
    title: "Champion Mindset: Train Like a Pro",
    mentorId: 5,
    level: "Beginner",
    duration: "12h",
    price: 1999,
    tag: "Sports",
    enrolled: "42K",
    xp: 1800,
    league: "Performance League",
    description: "Mental fitness and discipline lessons from Coach Vik Malhotra, an AI mentor for high-performance habits.",
    lessons: [
      {
        id: 1,
        title: "Building Daily Uncompromising Discipline",
        duration: "12 min",
        completed: false,
        script: "Motivation comes and goes, but discipline stays. If you commit to working 2 hours every morning on your craft, nothing can stop you."
      }
    ],
    status: "approved"
  },
  {
    id: 7,
    title: "React Frontend Engineering",
    mentorId: 9,
    level: "Intermediate",
    duration: "26h",
    price: 2499,
    tag: "Web Development",
    enrolled: "29K",
    xp: 3200,
    league: "Frontend League",
    description: "Build production-grade React interfaces with AI-guided product engineering lessons.",
    lessons: [
      {
        id: 1,
        title: "Components, Virtual DOM & React 19 Actions",
        duration: "20 min",
        completed: false,
        script: "Let's explore how React 19 handles optimistic updates, compiler optimizations, and atomic component composition."
      },
      {
        id: 2,
        title: "State Architecture & Performance Optimization",
        duration: "32 min",
        completed: false,
        script: "Avoid unnecessary re-renders with memoization, custom hooks, and zustand/context patterns."
      }
    ],
    status: "approved"
  },
  {
    id: 8,
    title: "Cloud Computing with Azure & AWS",
    mentorId: 7,
    level: "Intermediate",
    duration: "30h",
    price: 3499,
    tag: "Cloud",
    enrolled: "24K",
    xp: 4200,
    league: "Cloud League",
    description: "Learn cloud fundamentals, microservices, and distributed systems with Anya Sharma, an AI mentor for cloud architecture.",
    lessons: [
      {
        id: 1,
        title: "Cloud Service Models: IaaS, PaaS, Serverless",
        duration: "24 min",
        completed: false,
        script: "How to choose between Kubernetes containers, serverless functions, and managed databases for global scale."
      }
    ],
    status: "approved"
  }
];

export const seedUsers = [
  {
    id: 1,
    name: "Shailesh Chaudhari",
    email: "shailesh@uptoskills.com",
    password: getHashedPassword("student123"),
    role: "student",
    phone: "+91 9876543210",
    location: "Mumbai, India",
    bio: "Aspiring software developer passionate about building web apps, AI algorithms, and cloud systems.",
    education: "B.Tech in Computer Science",
    xp: 17111,
    streak: 7,
    avatar: "SC",
    skills: [
      { name: "JavaScript", level: "Intermediate" },
      { name: "React", level: "Beginner" },
      { name: "Python", level: "Intermediate" }
    ],
    preferences: {
      pace: "Moderate",
      delivery: "Visual",
      dailyGoal: 2,
      timezone: "IST (UTC+5:30)"
    },
    enrolledCourses: [1, 2],
    status: "Active"
  },
  {
    id: 2,
    name: "Admin User",
    email: "admin@uptoskills.com",
    password: getHashedPassword("admin123"),
    role: "admin",
    phone: "+91 9876500000",
    location: "Delhi, India",
    bio: "Platform Administrator with full oversight over courses, users, and AI mentors.",
    education: "Lead AI Engineer",
    xp: 99999,
    streak: 30,
    avatar: "AD",
    skills: [
      { name: "System Design", level: "Expert" },
      { name: "DevOps", level: "Expert" }
    ],
    preferences: {
      pace: "Fast",
      delivery: "Technical",
      dailyGoal: 5,
      timezone: "IST (UTC+5:30)"
    },
    enrolledCourses: [1, 2, 3, 4],
    status: "Active"
  },
  {
    id: 3,
    name: "Instructor Priya",
    email: "priya.mentor@uptoskills.com",
    password: getHashedPassword("mentor123"),
    role: "instructor",
    phone: "+91 9876511111",
    location: "Bengaluru, India",
    bio: "Curriculum designer and AI model training specialist.",
    education: "M.Tech in Data Science",
    xp: 45000,
    streak: 15,
    avatar: "PR",
    skills: [
      { name: "Python", level: "Expert" },
      { name: "Machine Learning", level: "Expert" }
    ],
    preferences: {
      pace: "Moderate",
      delivery: "Hands-on",
      dailyGoal: 3,
      timezone: "IST (UTC+5:30)"
    },
    enrolledCourses: [1, 3],
    status: "Active"
  }
];

export const seedQuizzes = [
  {
    id: 1,
    leagueId: 1,
    partId: 1,
    title: "Python Sprint League - Part 1: Core Mechanics",
    questions: [
      {
        id: 1,
        question: "What is the output of type(lambda: None)?",
        options: ["<class 'function'>", "<class 'lambda'>", "<class 'NoneType'>", "<class 'object'>"],
        answer: 0,
        explanation: "In Python, anonymous lambda expressions are instances of the standard function type."
      },
      {
        id: 2,
        question: "Which of the following data types in Python is immutable?",
        options: ["List", "Dictionary", "Tuple", "Set"],
        answer: 2,
        explanation: "Tuples cannot be modified after creation, making them immutable and hashable."
      },
      {
        id: 3,
        question: "What does the 'pass' keyword do in Python?",
        options: ["Exits a loop", "Skips to the next iteration", "Acts as a null statement placeholder", "Raises an exception"],
        answer: 2,
        explanation: "'pass' is a syntactic placeholder where code is required syntactically but no execution is needed."
      }
    ]
  }
];

export const seedCertificates = [
  {
    id: "CERT-PY-8823",
    courseId: 1,
    userId: 1,
    title: "Python: The First Steps of a Developer",
    date: "May 12, 2026",
    mentor: "Dr. Siddharth 'Sid' Rao",
    verificationCode: "UPTO-PY-8823-XYZ"
  },
  {
    id: "CERT-COMM-2918",
    courseId: 4,
    userId: 1,
    title: "The Power of Communication",
    date: "June 02, 2026",
    mentor: "Elena Vance-Montague",
    verificationCode: "UPTO-COMM-2918-ABC"
  }
];

export const seedForumPosts = [
  {
    id: 1,
    title: "How does the virtual DOM work in React?",
    author: "Kolluru Bindu",
    authorId: 1,
    category: "Web Development",
    content: "I am trying to understand the difference between the Real DOM and Virtual DOM. Can anyone give a clear explanation with an example?",
    upvotes: 14,
    comments: [
      {
        author: "Marcus Chen (AI Mentor)",
        content: "React keeps a virtual representation in memory. When state changes, it reconciles the virtual trees using fiber nodes and batches minimal mutations to the actual DOM tree!"
      },
      {
        author: "Shailesh Chaudhari",
        content: "That makes so much sense! It avoids expensive browser reflows and repaints."
      }
    ],
    date: "Oct 20, 2026"
  },
  {
    id: 2,
    title: "First Principles Thinking in Software Architecture",
    author: "Ashadapu Ashwitha",
    authorId: 1,
    category: "Architecture",
    content: "How do you apply first-principles thinking to designing microservices?",
    upvotes: 19,
    comments: [
      {
        author: "Dr. Alex Vance (AI Mentor)",
        content: "Ask yourself: what are the fundamental physics of the problem? Latency of electrons over network wires, RAM throughput, disk I/O. Delete unnecessary layers until it breaks, then add back only what is essential!"
      }
    ],
    date: "Oct 22, 2026"
  }
];


export const seedChallenges = [
  {
    id: "dc-2026-07-19",
    title: "Build a Debounce Function with Immediate Execution Option",
    difficulty: "Medium",
    category: "JavaScript / Frontend Engineering",
    xpReward: 200,
    streakBonus: 50,
    functionName: "debounce",
    date: "2026-07-19",
    description: `Implement a \`debounce\` function that delays processing expensive tasks until after a specified \`wait\` time has elapsed since the last time the function was invoked.

### Requirements:
1. Return a function that delays execution of \`func\` by \`wait\` milliseconds.
2. If \`immediate\` option is \`true\`, trigger the function on the leading edge instead of trailing.
3. Preserve the function context (\`this\`) and pass all arguments correctly.
4. Support rapid calls without executing multiple times.`,
    starterCode: `/**
 * @param {Function} func
 * @param {number} wait
 * @param {boolean} [immediate=false]
 * @returns {Function}
 */
function debounce(func, wait, immediate = false) {
  let timeout = null;

  return function (...args) {
    const context = this;
    const callNow = immediate && !timeout;

    clearTimeout(timeout);

    timeout = setTimeout(() => {
      timeout = null;
      if (!immediate) {
        func.apply(context, args);
      }
    }, wait);

    if (callNow) {
      func.apply(context, args);
    }
  };
}`,
    testCases: [
      {
        name: "Test 1: Returns a debounced function wrapper",
        testCode: "const fn = () => {}; const d = debounce(fn, 100); return typeof d === 'function';",
        expected: true,
      },
      {
        name: "Test 2: Delays execution until wait time passes",
        testCode: "let called = false; const d = debounce(() => { called = true; }, 30); d(); return new Promise(resolve => setTimeout(() => resolve(called), 60));",
        expected: true,
      },
      {
        name: "Test 3: Leading edge execution when immediate = true",
        testCode: "let count = 0; const d = debounce(() => { count++; }, 50, true); d(); return count === 1;",
        expected: true,
      },
    ],
    hiddenTestCases: [
      {
        name: "Hidden Test 1: Rapid calls execute only once on trailing edge",
        testCode: "let count = 0; const d = debounce(() => { count++; }, 40); d(); d(); d(); return new Promise(resolve => setTimeout(() => resolve(count === 1), 90));",
        expected: true,
      },
      {
        name: "Hidden Test 2: Passes correct arguments and preserves context",
        testCode: "let sum = 0; const d = debounce((a, b) => { sum = a + b; }, 30); d(10, 20); return new Promise(resolve => setTimeout(() => resolve(sum === 30), 60));",
        expected: true,
      },
    ],
    hints: [
      { hint: "Use `clearTimeout` to cancel existing pending timers before setting a new one.", cost: 10 },
      { hint: "Store the `timeout` variable in the outer closure so it persists across calls.", cost: 10 },
      { hint: "For immediate execution, check if `timeout` is null when called, and only invoke `func` if true.", cost: 10 },
    ],
    participants: 1420,
    active: true,
  },
  {
    id: "dc-2026-07-18",
    title: "Flatten Nested Array with Depth Control",
    difficulty: "Easy",
    category: "Algorithms",
    xpReward: 150,
    streakBonus: 50,
    functionName: "flatten",
    date: "2026-07-18",
    description: `Write a function \`flatten(arr, depth)\` that flattens an array of nested arrays up to the specified \`depth\`. Default depth should be 1.`,
    starterCode: `function flatten(arr, depth = 1) {\n  // Write your solution here\n}`,
    testCases: [
      {
        name: "Test 1: Flattens 1 level depth",
        input: [[1, [2, 3], [4, [5]]], 1],
        expected: [1, 2, 3, 4, [5]],
      },
      {
        name: "Test 2: Flattens 2 levels depth",
        input: [[1, [2, [3, [4]], 5]], 2],
        expected: [1, 2, 3, [4], 5],
      },
    ],
    hiddenTestCases: [
      {
        name: "Hidden Test 1: Depth 0 returns identical array",
        input: [[1, [2, 3]], 0],
        expected: [1, [2, 3]],
      },
      {
        name: "Hidden Test 2: Arbitrary high depth flattens completely",
        input: [[[[[[1]]], 2]], 10],
        expected: [1, 2],
      },
    ],
    hints: [
      { hint: "Consider recursion or Array.prototype.reduce.", cost: 10 },
    ],
    participants: 980,
    active: true,
  },
  {
    id: "dc-2026-07-17",
    title: "Two Sum Target Index Pair",
    difficulty: "Easy",
    category: "Algorithms",
    xpReward: 150,
    streakBonus: 50,
    functionName: "twoSum",
    date: "2026-07-17",
    description: `Given an array of integers \`nums\` and an integer \`target\`, return indices of the two numbers such that they add up to \`target\`.`,
    starterCode: `function twoSum(nums, target) {\n  // Write your solution here\n}`,
    testCases: [
      {
        name: "Test 1: Basic indices",
        input: [[2, 7, 11, 15], 9],
        expected: [0, 1],
      },
      {
        name: "Test 2: Target 6 in array",
        input: [[3, 2, 4], 6],
        expected: [1, 2],
      },
    ],
    hiddenTestCases: [
      {
        name: "Hidden Test 1: Duplicated values",
        input: [[3, 3], 6],
        expected: [0, 1],
      },
      {
        name: "Hidden Test 2: Negative numbers",
        input: [[-1, -2, -3, -4, -5], -8],
        expected: [2, 4],
      },
    ],
    hints: [
      { hint: "Use a Map or hash object to store complement values in a single pass.", cost: 10 },
    ],
    participants: 2150,
    active: true,
  },
];
