// 课程主题依据2026闽教版（三年级起点）四年级下册、五年级上册目录编排。
// 例句与中文提示为本学习工具原创，避免复制教材正文。
const LESSONS = [
  {
    day: 1, phase: "四下复习", phaseKey: "review", icon: "📅", title: "Days of the Week",
    focus: "复习星期名称，学会介绍一周安排。",
    words: [
      { word: "Monday", meaning: "星期一", emoji: "1️⃣", example: "We have English on Monday.", exampleZh: "我们星期一有英语课。" },
      { word: "Tuesday", meaning: "星期二", emoji: "2️⃣", example: "Tuesday is a school day.", exampleZh: "星期二是上学日。" },
      { word: "Wednesday", meaning: "星期三", emoji: "3️⃣", example: "I play chess on Wednesday.", exampleZh: "我星期三下棋。" },
      { word: "Thursday", meaning: "星期四", emoji: "4️⃣", example: "We read on Thursday.", exampleZh: "我们星期四阅读。" },
      { word: "Friday", meaning: "星期五", emoji: "5️⃣", example: "Friday is my favourite day.", exampleZh: "星期五是我最喜欢的一天。" }
    ],
    sentences: [
      { en: "What do you often do on Monday?", zh: "你星期一经常做什么？" },
      { en: "I play football on Friday.", zh: "我星期五踢足球。" }
    ]
  },
  {
    day: 2, phase: "四下复习", phaseKey: "review", icon: "🧹", title: "Cleaning Day",
    focus: "复习教室清洁和简单动作指令。",
    words: [
      { word: "stand", meaning: "站立", emoji: "🧍", example: "Please stand near the door.", exampleZh: "请站在门旁边。" },
      { word: "door", meaning: "门", emoji: "🚪", example: "Please open the door.", exampleZh: "请打开门。" },
      { word: "close", meaning: "关闭", emoji: "🔒", example: "Close the window, please.", exampleZh: "请关上窗户。" },
      { word: "fan", meaning: "风扇", emoji: "🌀", example: "The fan is clean now.", exampleZh: "风扇现在很干净。" },
      { word: "bright", meaning: "明亮的", emoji: "✨", example: "Our classroom is clean and bright.", exampleZh: "我们的教室干净又明亮。" }
    ],
    sentences: [
      { en: "Let us clean our classroom.", zh: "让我们打扫教室吧。" },
      { en: "Please close the door.", zh: "请把门关上。" }
    ]
  },
  {
    day: 3, phase: "四下复习", phaseKey: "review", icon: "📚", title: "School Subjects",
    focus: "复习课程名称，表达自己喜欢的学科。",
    words: [
      { word: "Chinese", meaning: "语文；中文", emoji: "📝", example: "Chinese is interesting.", exampleZh: "语文很有趣。" },
      { word: "English", meaning: "英语", emoji: "🔤", example: "We speak English in class.", exampleZh: "我们在课堂上说英语。" },
      { word: "math", meaning: "数学", emoji: "➗", example: "I have math this morning.", exampleZh: "我今天上午有数学课。" },
      { word: "science", meaning: "科学", emoji: "🔬", example: "We learn about plants in science.", exampleZh: "我们在科学课上学习植物。" },
      { word: "interesting", meaning: "有趣的", emoji: "💡", example: "The music class is interesting.", exampleZh: "音乐课很有趣。" }
    ],
    sentences: [
      { en: "What is your favourite subject?", zh: "你最喜欢什么学科？" },
      { en: "I like English. It is interesting.", zh: "我喜欢英语，它很有趣。" }
    ]
  },
  {
    day: 4, phase: "四下复习", phaseKey: "review", icon: "🚌", title: "Transportation",
    focus: "复习交通方式，介绍自己怎样上学。",
    words: [
      { word: "bus", meaning: "公共汽车", emoji: "🚌", example: "I go to school by bus.", exampleZh: "我乘公共汽车上学。" },
      { word: "car", meaning: "小汽车", emoji: "🚗", example: "My father goes to work by car.", exampleZh: "我爸爸开车上班。" },
      { word: "bike", meaning: "自行车", emoji: "🚲", example: "She goes to the park by bike.", exampleZh: "她骑自行车去公园。" },
      { word: "train", meaning: "火车", emoji: "🚆", example: "The train is fast.", exampleZh: "火车很快。" },
      { word: "walk", meaning: "步行", emoji: "🚶", example: "I walk to school with my friend.", exampleZh: "我和朋友步行上学。" }
    ],
    sentences: [
      { en: "How do you go to school?", zh: "你怎样去学校？" },
      { en: "I go to school by bus.", zh: "我乘公共汽车上学。" }
    ]
  },
  {
    day: 5, phase: "四下复习", phaseKey: "review", icon: "🛒", title: "Shopping",
    focus: "复习购物物品、数量和价格表达。",
    words: [
      { word: "need", meaning: "需要", emoji: "🧾", example: "We need some fruit.", exampleZh: "我们需要一些水果。" },
      { word: "supermarket", meaning: "超市", emoji: "🏪", example: "Mum is in the supermarket.", exampleZh: "妈妈在超市里。" },
      { word: "fruit", meaning: "水果", emoji: "🍎", example: "The fruit is fresh.", exampleZh: "这些水果很新鲜。" },
      { word: "hundred", meaning: "一百", emoji: "💯", example: "The toy is one hundred yuan.", exampleZh: "这个玩具一百元。" },
      { word: "juice", meaning: "果汁", emoji: "🧃", example: "I would like some orange juice.", exampleZh: "我想要一些橙汁。" }
    ],
    sentences: [
      { en: "What do we need?", zh: "我们需要什么？" },
      { en: "We need some fruit and juice.", zh: "我们需要一些水果和果汁。" }
    ]
  },
  {
    day: 6, phase: "四下复习", phaseKey: "review", icon: "🌦️", title: "Weather and Seasons",
    focus: "把天气与季节联系起来描述。",
    words: [
      { word: "weather", meaning: "天气", emoji: "🌦️", example: "How is the weather today?", exampleZh: "今天天气怎么样？" },
      { word: "spring", meaning: "春天", emoji: "🌷", example: "It is warm in spring.", exampleZh: "春天天气温暖。" },
      { word: "summer", meaning: "夏天", emoji: "☀️", example: "It is hot in summer.", exampleZh: "夏天天气炎热。" },
      { word: "autumn", meaning: "秋天", emoji: "🍂", example: "Autumn is cool.", exampleZh: "秋天天气凉爽。" },
      { word: "winter", meaning: "冬天", emoji: "❄️", example: "It is cold in winter.", exampleZh: "冬天天气寒冷。" }
    ],
    sentences: [
      { en: "What is the weather like in Putian?", zh: "莆田的天气怎么样？" },
      { en: "It is hot in summer and cool in autumn.", zh: "夏天炎热，秋天凉爽。" }
    ]
  },
  {
    day: 7, phase: "四下复习", phaseKey: "challenge", icon: "🏖️", title: "Summer Vacation Review",
    focus: "复习暑假表达，并完成四年级综合回顾。",
    words: [
      { word: "vacation", meaning: "假期", emoji: "🏖️", example: "Summer vacation is coming.", exampleZh: "暑假就要到了。" },
      { word: "seaside", meaning: "海边", emoji: "🌊", example: "We will go to the seaside.", exampleZh: "我们将去海边。" },
      { word: "visit", meaning: "参观；拜访", emoji: "🎒", example: "I will visit my grandparents.", exampleZh: "我将拜访祖父母。" },
      { word: "will", meaning: "将要", emoji: "🔜", example: "I will read English books.", exampleZh: "我将读英语书。" },
      { word: "plan", meaning: "计划", emoji: "🗺️", example: "This is my summer plan.", exampleZh: "这是我的暑假计划。" }
    ],
    sentences: [
      { en: "What will you do in summer?", zh: "你暑假将做什么？" },
      { en: "I will learn English and visit the seaside.", zh: "我将学习英语并去海边。" }
    ]
  },
  {
    day: 8, phase: "五上预习", phaseKey: "preview", icon: "🧑‍🤝‍🧑", title: "Meeting New Friends",
    focus: "预习人物外貌和位置描述，结识新朋友。",
    words: [
      { word: "tall", meaning: "高的", emoji: "📏", example: "The tall boy is my new classmate.", exampleZh: "那个高个子男孩是我的新同学。" },
      { word: "beside", meaning: "在……旁边", emoji: "↔️", example: "She is beside the door.", exampleZh: "她在门旁边。" },
      { word: "pupil", meaning: "小学生", emoji: "🎒", example: "Peter is a new pupil.", exampleZh: "彼得是一名新学生。" },
      { word: "Australia", meaning: "澳大利亚", emoji: "🇦🇺", example: "He is from Australia.", exampleZh: "他来自澳大利亚。" },
      { word: "behind", meaning: "在……后面", emoji: "🙈", example: "The bike is behind the tree.", exampleZh: "自行车在树后面。" }
    ],
    sentences: [
      { en: "Who is that boy?", zh: "那个男孩是谁？" },
      { en: "The tall boy beside Wang Tao.", zh: "王涛旁边的高个子男孩。" }
    ]
  },
  {
    day: 9, phase: "五上预习", phaseKey: "preview", icon: "💐", title: "Teachers' Day",
    focus: "预习教师节、位置和表达感谢。",
    words: [
      { word: "where", meaning: "哪里", emoji: "❓", example: "Where is Miss Gao?", exampleZh: "高老师在哪里？" },
      { word: "lovely", meaning: "可爱的", emoji: "🐼", example: "What a lovely panda!", exampleZh: "多可爱的熊猫呀！" },
      { word: "September", meaning: "九月", emoji: "9️⃣", example: "Teachers' Day is in September.", exampleZh: "教师节在九月。" },
      { word: "tomorrow", meaning: "明天", emoji: "🌅", example: "Tomorrow is Teachers' Day.", exampleZh: "明天是教师节。" },
      { word: "kind", meaning: "亲切的；和蔼的", emoji: "😊", example: "Our English teacher is kind.", exampleZh: "我们的英语老师很和蔼。" }
    ],
    sentences: [
      { en: "Tomorrow is Teachers' Day.", zh: "明天是教师节。" },
      { en: "This flower is for you.", zh: "这朵花送给您。" }
    ]
  },
  {
    day: 10, phase: "五上预习", phaseKey: "preview", icon: "🧳", title: "Planning a Trip",
    focus: "预习节日旅行计划和将来时表达。",
    words: [
      { word: "holiday", meaning: "假日", emoji: "🧳", example: "We will go for a holiday.", exampleZh: "我们将去度假。" },
      { word: "uncle", meaning: "叔叔；伯伯", emoji: "👨", example: "My uncle lives in Fuzhou.", exampleZh: "我叔叔住在福州。" },
      { word: "mount", meaning: "山", emoji: "⛰️", example: "We will visit Mount Wuyi.", exampleZh: "我们将游览武夷山。" },
      { word: "tell", meaning: "告诉", emoji: "🗣️", example: "Tell me about your trip.", exampleZh: "告诉我你的旅行吧。" },
      { word: "October", meaning: "十月", emoji: "🔟", example: "National Day is in October.", exampleZh: "国庆节在十月。" }
    ],
    sentences: [
      { en: "Where will you go?", zh: "你将去哪里？" },
      { en: "I will go to Mount Wuyi.", zh: "我将去武夷山。" }
    ]
  },
  {
    day: 11, phase: "五上预习", phaseKey: "preview", icon: "🎬", title: "Weekend Activities",
    focus: "预习周末活动、邀请和兴趣表达。",
    words: [
      { word: "cinema", meaning: "电影院", emoji: "🎬", example: "We will go to the cinema.", exampleZh: "我们将去电影院。" },
      { word: "glasses", meaning: "眼镜", emoji: "👓", example: "Put on your glasses.", exampleZh: "戴上你的眼镜。" },
      { word: "film", meaning: "电影", emoji: "🎞️", example: "The film is interesting.", exampleZh: "这部电影很有趣。" },
      { word: "museum", meaning: "博物馆", emoji: "🏛️", example: "I visit the museum at the weekend.", exampleZh: "我周末参观博物馆。" },
      { word: "chess", meaning: "国际象棋", emoji: "♟️", example: "Let us play chess together.", exampleZh: "让我们一起下国际象棋。" }
    ],
    sentences: [
      { en: "What do you usually do at the weekend?", zh: "你周末通常做什么？" },
      { en: "I usually watch a film.", zh: "我通常看电影。" }
    ]
  },
  {
    day: 12, phase: "五上预习", phaseKey: "preview", icon: "🗓️", title: "Months of the Year",
    focus: "预习月份名称并谈论生日和节日。",
    words: [
      { word: "January", meaning: "一月", emoji: "❄️", example: "January is the first month.", exampleZh: "一月是第一个月。" },
      { word: "March", meaning: "三月", emoji: "🌱", example: "Spring begins in March.", exampleZh: "春天在三月开始。" },
      { word: "April", meaning: "四月", emoji: "🌧️", example: "My birthday is in April.", exampleZh: "我的生日在四月。" },
      { word: "June", meaning: "六月", emoji: "☀️", example: "Children's Day is in June.", exampleZh: "儿童节在六月。" },
      { word: "December", meaning: "十二月", emoji: "🎄", example: "December is the last month.", exampleZh: "十二月是最后一个月。" }
    ],
    sentences: [
      { en: "When is your birthday?", zh: "你的生日在什么时候？" },
      { en: "My birthday is in April.", zh: "我的生日在四月。" }
    ]
  },
  {
    day: 13, phase: "五上预习", phaseKey: "preview", icon: "🗺️", title: "Asking the Way",
    focus: "预习问路、地点和方向表达。",
    words: [
      { word: "station", meaning: "车站", emoji: "🚉", example: "Where is the train station?", exampleZh: "火车站在哪里？" },
      { word: "hospital", meaning: "医院", emoji: "🏥", example: "The hospital is nearby.", exampleZh: "医院就在附近。" },
      { word: "nearby", meaning: "附近", emoji: "📍", example: "Is there a museum nearby?", exampleZh: "附近有博物馆吗？" },
      { word: "straight", meaning: "笔直地", emoji: "⬆️", example: "Go straight, please.", exampleZh: "请一直往前走。" },
      { word: "right", meaning: "右边；向右", emoji: "➡️", example: "Then turn right.", exampleZh: "然后向右转。" }
    ],
    sentences: [
      { en: "How can I get to the train station?", zh: "我怎样到达火车站？" },
      { en: "Go straight. Then turn right.", zh: "一直往前走，然后向右转。" }
    ]
  },
  {
    day: 14, phase: "五上预习", phaseKey: "preview", icon: "📞", title: "Making Phone Calls",
    focus: "预习礼貌打电话和确认对方身份。",
    words: [
      { word: "speak", meaning: "说话；通话", emoji: "🗣️", example: "May I speak to Lily?", exampleZh: "我可以和莉莉通话吗？" },
      { word: "wait", meaning: "等待", emoji: "⏳", example: "Please wait a minute.", exampleZh: "请等一下。" },
      { word: "minute", meaning: "分钟", emoji: "⏱️", example: "Wait a minute, please.", exampleZh: "请等一分钟。" },
      { word: "call", meaning: "打电话", emoji: "📱", example: "Please call me this evening.", exampleZh: "请今晚给我打电话。" },
      { word: "mobile", meaning: "手机", emoji: "📲", example: "Call her mobile phone.", exampleZh: "打她的手机。" }
    ],
    sentences: [
      { en: "Hello. This is Wang Tao.", zh: "你好，我是王涛。" },
      { en: "May I speak to Lily?", zh: "我可以和莉莉通话吗？" }
    ]
  },
  {
    day: 15, phase: "终极挑战", phaseKey: "challenge", icon: "🏆", title: "My Friends & Final Show",
    focus: "预习朋友特点，并完成15天英语展示。",
    words: [
      { word: "classmate", meaning: "同班同学", emoji: "🧑‍🤝‍🧑", example: "Ben is my classmate.", exampleZh: "本是我的同班同学。" },
      { word: "understand", meaning: "理解；明白", emoji: "💡", example: "I can understand the question.", exampleZh: "我能理解这个问题。" },
      { word: "know", meaning: "知道；认识", emoji: "🧠", example: "Do you know that girl?", exampleZh: "你认识那个女孩吗？" },
      { word: "young", meaning: "年轻的", emoji: "🙂", example: "My teacher is young and kind.", exampleZh: "我的老师年轻又和蔼。" },
      { word: "welcome", meaning: "欢迎", emoji: "🎉", example: "Welcome to our class.", exampleZh: "欢迎来到我们班。" }
    ],
    sentences: [
      { en: "Who is your best friend?", zh: "谁是你最好的朋友？" },
      { en: "She is young, kind and helpful.", zh: "她年轻、和蔼并且乐于助人。" }
    ]
  }
];

const ALL_WORDS = LESSONS.flatMap((lesson) => lesson.words);
