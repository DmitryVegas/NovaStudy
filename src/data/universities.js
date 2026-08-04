export const universities = [
  {
    id: "snu",
    name: "Seoul National University",
    nativeName: "서울대학교",
    city: "Seoul",
    cityRu: "Сеул",
    rank: 1,
    badge: "TOP #1 SKY",
    image: "/images/unis/snu.jpg",
    logo: "🏛️",
    type: ["bachelor", "master", "gks"],
    topikReq: {
      ru: "TOPIK 5+",
      uz: "TOPIK 5+",
      en: "TOPIK 5+",
      ko: "TOPIK 5급 이상"
    },
    ieltsReq: "IELTS 6.5+",
    tuitionPerSemesterUSD: 2800,
    maxGrantPercentage: 100,
    majors: ["Computer Science", "Business Administration", "Engineering", "International Relations", "Medicine"],
    features: {
      ru: [
        "Флагманский университет Кореи (#1)",
        "Полное покрытие по правительственному гранту GKS",
        "Стипендии SNU President Fellowship"
      ],
      uz: [
        "Koreyaning #1 etakchi universiteti",
        "GKS hukumat granti bilan 100% bepul o'qish",
        "SNU President Fellowship stipendiyalari"
      ],
      en: [
        "South Korea's #1 Flagship University",
        "Full Coverage via GKS Government Scholarship",
        "SNU President Fellowship Grants"
      ],
      ko: [
        "대한민국 1위 최고 명문 국립대학교",
        "GKS 정부초청 장학생 100% 전액 장학 혜택",
        "SNU 우수 외국인 학생 전액 장학금 지원"
      ]
    },
    description: {
      ru: "Национальный университет Сеула — самый престижный вуз Южной Кореи (#1). Входит в лигу SKY. Выпускники SNU занимают ведущие руководящие посты в Samsung, Hyundai, LG и правительстве Кореи.",
      uz: "Seul Milliy Universiteti — Janubiy Koreyaning eng nufuzli universiteti (#1). SKY ligasiga kiradi. Bitiruvchilari Samsung, Hyundai va hukumatda yuqori lavozimlarni egallaydi.",
      en: "Seoul National University is South Korea's #1 flagship national university and SKY league member. SNU alumni lead global corporations like Samsung, Hyundai, and government ministries.",
      ko: "서울대학교는 대한민국 최고의 명문 국립대학교(#1)이자 SKY 대학 중 하나입니다. 삼성, 현대, 정부 주요 부처 리더들을 가장 많이 배출한 한국 대표 대학입니다."
    }
  },
  {
    id: "korea-univ",
    name: "Korea University",
    nativeName: "고려대학교",
    city: "Seoul",
    cityRu: "Сеул",
    rank: 2,
    badge: "TOP #2 SKY",
    image: "/images/unis/korea-univ.jpg",
    logo: "🦁",
    type: ["bachelor", "master", "language", "gks"],
    topikReq: {
      ru: "TOPIK 4+",
      uz: "TOPIK 4+",
      en: "TOPIK 4+",
      ko: "TOPIK 4급 이상"
    },
    ieltsReq: "IELTS 6.0+",
    tuitionPerSemesterUSD: 3400,
    maxGrantPercentage: 100,
    majors: ["Global Business", "Artificial Intelligence", "Media & Communications", "Economics", "Korean Studies"],
    features: {
      ru: [
        "Сильнейший бизнес-факультет в Азии (AACSB)",
        "Один из лучших языковых центров для иностранцев",
        "Гранты от 50% до 100% за успеваемость"
      ],
      uz: [
        "Osiyodagi eng kuchli biznes fakulteti (AACSB)",
        "Chet elliklar uchun eng yaxshi til markazi",
        "A'lo baholar uchun 50% dan 100% gacha grantlar"
      ],
      en: [
        "Top Business School in Asia (AACSB)",
        "Premier Korean Language Education Center",
        "50% to 100% Merit Scholarships"
      ],
      ko: [
        "아시아 최고 수준의 경영대학 (AACSB 국제인증)",
        "외국인 유학생을 위한 최상위 한국어교육원",
        "성적 우수 유학생 대상 50%~100% 장학금"
      ]
    },
    description: {
      ru: "Университет Корё славится своими традициями, выдающейся школой бизнеса и активным студенческим сообществом. Расположен в самом сердце Сеула.",
      uz: "Koreya Universiteti o'zining boy an'analari, kuchli biznes maktabi va faol talabalar hamjamiyati bilan mashhur. Seul markazida joylashgan.",
      en: "Korea University is renowned for its traditions, AACSB-accredited business school, and vibrant global student community in the heart of Seoul.",
      ko: "고려대학교는 오랜 역사와 전통, 세계적 수준의 경영대학(AACSB 인증) 및 활기찬 유학생 커뮤니티로 유명한 서울 중심 소재 명문 사립대학입니다."
    }
  },
  {
    id: "yonsei",
    name: "Yonsei University",
    nativeName: "연세대학교",
    city: "Seoul",
    cityRu: "Сеул",
    rank: 3,
    badge: "TOP #3 SKY",
    image: "/images/unis/yonsei.jpg",
    logo: "🦅",
    type: ["bachelor", "master", "language", "gks"],
    topikReq: {
      ru: "TOPIK 4+",
      uz: "TOPIK 4+",
      en: "TOPIK 4+",
      ko: "TOPIK 4급 이상"
    },
    ieltsReq: "IELTS 6.5+",
    tuitionPerSemesterUSD: 3600,
    maxGrantPercentage: 100,
    majors: ["Underwood International College (UIC)", "Biotechnology", "International Trade", "Architecture"],
    features: {
      ru: [
        "Подразделение UIC — обучение 100% на английском",
        "Красивейший кампус в районе Синчхон (Sinchon)",
        "Партнерство со стартап-инкубаторами"
      ],
      uz: [
        "UIC bo'limi — 100% ingliz tilida o'qish",
        "Sinchon tumanidagi eng go'zal kampus",
        "Startap inkubatorlari bilan hamkorlik"
      ],
      en: [
        "Underwood International College (100% English)",
        "Iconic Historic Campus in Sinchon, Seoul",
        "Global Startup & Corporate Incubator Links"
      ],
      ko: [
        "언더우드 국제대학(UIC) 100% 영어 학위 과정",
        "신촌 중심의 아름다운 역사적 아이비 캠퍼스",
        "글로벌 기업 및 스타트업 연계 산학협력"
      ]
    },
    description: {
      ru: "Университет Ёнсе — старейший частный исследовательский университет Кореи. Находится в молодежном районе Синчхон и предлагает множество англоязычных программ.",
      uz: "Yonsei Universiteti — Koreyaning eng qadimiy xususiy tadqiqot universiteti. Sinchon yoshlar tumanida joylashgan va ko'plab inglizcha dasturlarni taklif etadi.",
      en: "Yonsei University is Korea's oldest private research institution located in vibrant Sinchon, Seoul, offering world-class 100% English programs at Underwood International College.",
      ko: "연세대학교는 신촌 대학가 중심에 위치한 한국 최고의 사립 연구 중심 대학입니다. 언더우드 국제대학(UIC)을 통해 100% 영어 수업 학위 과정을 제공합니다."
    }
  },
  {
    id: "kaist",
    name: "KAIST",
    nativeName: "한국과학기술원",
    city: "Daejeon",
    cityRu: "Тэджон",
    rank: 4,
    badge: "TOP Tech & IT",
    image: "/images/unis/kaist.jpg",
    logo: "⚡",
    type: ["bachelor", "master", "gks"],
    topikReq: {
      ru: "Не требуется (100% English)",
      uz: "Talab qilinmaydi (100% Inglizcha)",
      en: "Not Required (100% English)",
      ko: "요구 없음 (100% 영어 수업)"
    },
    ieltsReq: "IELTS 6.5+",
    tuitionPerSemesterUSD: 3100,
    maxGrantPercentage: 100,
    majors: ["Robotics & AI", "Data Science", "Electrical Engineering", "Aerospace", "Bioengineering"],
    features: {
      ru: [
        "100% студентов получают стипендию на обучение",
        "Ежемесячная стипендия на проживание 350,000 KRW",
        "Обучение 100% на английском языке"
      ],
      uz: [
        "100% talabalar uchun o'qish granti",
        "Har oy 350,000 KRW yashash stipendiyasi",
        "100% ingliz tilida ta'lim"
      ],
      en: [
        "100% Tuition Waiver for All Admitted Students",
        "Monthly Living Stipend (~350,000 KRW)",
        "100% English Taught STEM Programs"
      ],
      ko: [
        "합격 유학생 전원 100% 등록금 면제 혜택",
        "매월 정액 생활비 지원 (약 35만 원)",
        "전 학위 과정 100% 영어 강의 진행"
      ]
    },
    description: {
      ru: "Корейский ведущий научно-технический институт (KAIST) — «MIT Азии». Все зачисленные иностранные студенты получают 100% грант на обучение!",
      uz: "Koreya Ilg'or Fan va Texnologiyalar Instituti (KAIST) — 'Osiyo MIT'si. Barcha qabul qilingan xalqaro talabalar 100% bepul o'qiydi!",
      en: "KAIST is Korea's top science & tech institute ('The MIT of Asia'). Every admitted international student receives a 100% tuition scholarship and monthly stipend!",
      ko: "한국과학기술원(KAIST)은 '아시아의 MIT'로 불리는 세계적 수준의 이공계 특성화 대학입니다. 합격한 모든 외국인 유학생에게 100% 전액 장학금과 생활비를 지원합니다."
    }
  },
  {
    id: "hanyang",
    name: "Hanyang University",
    nativeName: "한양대학교",
    city: "Seoul",
    cityRu: "Сеул",
    rank: 6,
    badge: "Leader in Engineering",
    image: "/images/unis/hanyang.jpg",
    logo: "⚙️",
    type: ["bachelor", "master", "language"],
    topikReq: {
      ru: "TOPIK 3+",
      uz: "TOPIK 3+",
      en: "TOPIK 3+",
      ko: "TOPIK 3급 이상"
    },
    ieltsReq: "IELTS 5.5+",
    tuitionPerSemesterUSD: 3200,
    maxGrantPercentage: 70,
    majors: ["Mechanical Engineering", "Software Engineering", "Industrial Design", "Tourism Management"],
    features: {
      ru: [
        "Первый инженерный университет Кореи",
        "Скидка 50% на 1-й семестр при TOPIK 4",
        "Прямые стажировки в Hyundai и Samsung"
      ],
      uz: [
        "Koreyadagi birinchi muhandislik universiteti",
        "TOPIK 4 bilan 1-semestrga 50% chegirma",
        "Hyundai va Samsungda amaliyotlar"
      ],
      en: [
        "Korea's First & Leading Engineering School",
        "50% First Semester Scholarship with TOPIK 4",
        "Direct Internship Placements at Samsung & Hyundai"
      ],
      ko: [
        "대한민국 최초 및 최고 수준의 공과대학",
        "TOPIK 4급 이상 소지자 첫 학기 50% 장학 혜택",
        "삼성, 현대 등 대기업 직연계 인턴십 프로그램"
      ]
    },
    description: {
      ru: "Ханьян известен как инкубатор инженеров и IT-специалистов Кореи. Собственная станция метро прямо внутри кампуса в Сеуле!",
      uz: "Hanyang Koreyaning muhandis va IT mutaxassislari instituti sifatida tanilgan. Seuldagi kampusining ichida o'z metro bekati bor!",
      en: "Hanyang University is Korea's premier engineering and innovation powerhouse, featuring its own dedicated subway station inside the Seoul campus.",
      ko: "한양대학교는 대한민국 공학 및 IT 산업의 리더를 배출한 명문 공과대학입니다. 서울 캠퍼스 내부에 전용 지하철역(한양대역)이 위치해 있습니다."
    }
  },
  {
    id: "dongguk",
    name: "Dongguk University",
    nativeName: "동국대학교",
    city: "Seoul",
    cityRu: "Сеул",
    rank: 11,
    badge: "Popular with CIS Students",
    image: "/images/unis/dongguk.jpg",
    logo: "🌸",
    type: ["bachelor", "master", "language", "college"],
    topikReq: {
      ru: "TOPIK 3+",
      uz: "TOPIK 3+",
      en: "TOPIK 3+",
      ko: "TOPIK 3급 이상"
    },
    ieltsReq: "IELTS 5.5+",
    tuitionPerSemesterUSD: 2900,
    maxGrantPercentage: 50,
    majors: ["Film & Digital Media", "Business Administration", "Korean Language & Literature", "Hotel Management"],
    features: {
      ru: [
        "Центр Сеула (рядом с Namsan Tower)",
        "Очень высокое одобрение виз для студентов из СНГ",
        "Льготы на проживание при языковом центре"
      ],
      uz: [
        "Seul markazi (Namsan minorasi yonida)",
        "TMI talabalari uchun viza tasdiqlash darajasi juda yuqori",
        "Til markazi talabalariga yashash imtiyozlari"
      ],
      en: [
        "Heart of Central Seoul (Near Namsan Tower)",
        "Outstanding Student Visa Approval Rates",
        "Dormitory Housing Discounts for Language Students"
      ],
      ko: [
        "서울 중심가 위치 (남산타워 및 명동 인접)",
        "우즈베키스탄 등 외국인 유학생 비자 높은 승인율",
        "어학연수생 전용 기숙사 우선 배정 혜택"
      ]
    },
    description: {
      ru: "Университет Донггук расположен в самом центре Сеула рядом с Namsan Tower. Сильнейший факультет кино, медиа, бизнеса и языковые курсы с высоким процентом виз.",
      uz: "Dongguk universiteti Seul markazida Namsan minorasi yonida joylashgan. Kino, media, biznes fakultetlari hamda viza olish ko'rsatkichi yuqori til kurslari bilan mashhur.",
      en: "Dongguk University is located right next to Namsan Tower in central Seoul, world-famous for film, digital media, business, and high visa acceptance rates.",
      ko: "동국대학교는 서울 남산타워 인근 중심가에 위치한 명문 사립대학입니다. 미디어, 영화, 경영학 분야가 매우 강하며 유학생 비자 발급 승인율이 매우 높습니다."
    }
  },
  {
    id: "inha",
    name: "Inha University",
    nativeName: "인하대학교",
    city: "Incheon",
    cityRu: "Инчхон",
    rank: 12,
    badge: "Logistics & Tech",
    image: "/images/unis/inha.jpg",
    logo: "✈️",
    type: ["bachelor", "master", "language"],
    topikReq: {
      ru: "TOPIK 3+",
      uz: "TOPIK 3+",
      en: "TOPIK 3+",
      ko: "TOPIK 3급 이상"
    },
    ieltsReq: "IELTS 5.5+",
    tuitionPerSemesterUSD: 2600,
    maxGrantPercentage: 100,
    majors: ["Global Logistics", "Naval Architecture", "Computer Engineering", "International Trade"],
    features: {
      ru: [
        "Поддержка от авиагиганта Korean Air",
        "Доступная стоимость проживания в Инчхоне",
        "Грант 100% при TOPIK 5+"
      ],
      uz: [
        "Korean Air avyakompaniyasi qo'llab-quvvatlaydi",
        "Inchondagi qulay yashash xarajatlari",
        "TOPIK 5+ bilan 100% grant"
      ],
      en: [
        "Backed by Korean Air Conglomerate",
        "Affordable Living Costs in Incheon",
        "100% Tuition Waiver for TOPIK 5+ Holders"
      ],
      ko: [
        "대한항공(한진그룹) 재단의 강력한 산학 지원",
        "인천 위치로 합리적인 기숙사 및 주거 비용",
        "TOPIK 5급 이상 취득 시 100% 전액 장학금"
      ]
    },
    description: {
      ru: "Университет Инха — лидер в сфере логистики, IT и инженерии. Находится в Инчхоне (40 минут от Сеула) с доступной стоимостью проживания.",
      uz: "Inha universiteti — logistika, IT va muhandislik sohasida yetakchi. Inchondagi kampusida (Seuldan 40 daqiqa) yashash xarajatlari arzonroq.",
      en: "Inha University is a top-ranked global logistics and technology university backed by Korean Air, located in Incheon, just 40 minutes from Seoul.",
      ko: "인하대학교는 한진그룹(대한항공)이 재단을 지원하는 물류, IT, 공학 분야 특성화 명문 대학입니다. 인천 소재로 서울 대비 주거비 부담이 적습니다."
    }
  },
  {
    id: "busan-national",
    name: "Busan National University",
    nativeName: "부산대학교",
    city: "Busan",
    cityRu: "Пусан",
    rank: 9,
    badge: "Top National in Busan",
    image: "/images/unis/busan-national.jpg",
    logo: "🌊",
    type: ["bachelor", "master", "language", "gks"],
    topikReq: {
      ru: "TOPIK 3+",
      uz: "TOPIK 3+",
      en: "TOPIK 3+",
      ko: "TOPIK 3급 이상"
    },
    ieltsReq: "IELTS 6.0+",
    tuitionPerSemesterUSD: 2100,
    maxGrantPercentage: 100,
    majors: ["Ocean & Marine Engineering", "Global Studies", "Chemical Engineering", "Economics"],
    features: {
      ru: [
        "Государственный университет (#1 в Пусане)",
        "Низкая стоимость обучения (от $1,900/сем)",
        "Жизнь на побережье Японского моря"
      ],
      uz: [
        "Davlat universiteti (Pusanda #1)",
        "Arzon o'qish narxi ($1,900/semestrdan)",
        "Dengiz bo'yida yashash imkoniyati"
      ],
      en: [
        "#1 Flagship National University in Busan",
        "Affordable Tuition Fees (from $1,900/sem)",
        "Beautiful Coastal Campus Lifestyle"
      ],
      ko: [
        "부산 지역 1위 거점 국립대학교",
        "합리적인 국립대 등록금 (학기당 $1,900부터)",
        "해양 도시 부산에서의 풍요로운 유학 생활"
      ]
    },
    description: {
      ru: "Пусанский национальный университет — главный государственный вуз морской столицы Кореи. Идеальное сочетание высокого качества учебы и комфортной жизни на побережье.",
      uz: "Pusan Milliy Universiteti — Koreyaning dengiz poytaxtidagi bosh davlat universiteti. Yuqori sifatli ta'lim va dengiz bo'yidagi qulay hayotning ideal uyg'unligi.",
      en: "Busan National University is the premier flagship national university of South Korea's maritime capital, offering top education and oceanfront living.",
      ko: "부산대학교는 대한민국 제2의 도시이자 해양 수도인 부산을 대표하는 최상위 거점 국립대학교입니다. 뛰어난 학업 환경과 바다를 낀 쾌적한 캠퍼스를 자랑합니다."
    }
  }
];
