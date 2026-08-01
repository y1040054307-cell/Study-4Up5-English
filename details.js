// 单元拓展内容依据闽教版（三年级起点）单元主题原创编写，不复制教材正文。
const makeWord = (word, meaning, emoji, example, exampleZh) => ({ word, meaning, emoji, example, exampleZh });
const makeExtra = (word, meaning, example) => ({ word, meaning, example });

const LESSON_DETAILS = {
  1: {
    unit: "四年级下册 Unit 1 · Days of the Week", time: 50,
    core: [
      makeWord("Saturday", "星期六", "6️⃣", "I play basketball on Saturday.", "我星期六打篮球。"),
      makeWord("Sunday", "星期日", "7️⃣", "We visit Grandma on Sunday.", "我们星期日看望奶奶。"),
      makeWord("week", "星期；周", "🗓️", "There are seven days in a week.", "一周有七天。")
    ],
    extra: [
      makeExtra("weekday", "工作日；上学日", "Monday is a weekday."),
      makeExtra("weekend", "周末", "I read books at the weekend."),
      makeExtra("today", "今天", "Today is Tuesday."),
      makeExtra("schedule", "日程安排", "This is my weekly schedule."),
      makeExtra("favourite", "最喜欢的", "Friday is my favourite day.")
    ],
    objectives: ["认读并按顺序说出一周七天", "用 on + 星期表达某天的活动", "询问并回答每周的日常安排"],
    knowledge: [
      { title: "on + 星期", text: "表示在具体某一天做某事，星期前面用 on。", example: "I have PE on Wednesday." },
      { title: "What do you do...?", text: "询问经常做的事情，回答用 I + 动词。", example: "What do you do on Sunday? I read books." },
      { title: "星期首字母大写", text: "Monday、Tuesday 等专有名称，书写时首字母必须大写。", example: "Monday ✓  monday ✗" }
    ],
    reading: { title: "My Busy Week", en: "I have a busy week. I play football on Monday. I read English stories on Wednesday. On Saturday, I help my parents. Sunday is my favourite day because we visit Grandma.", zh: "我一周很充实。星期一我踢足球，星期三读英语故事。星期六我帮助父母。星期日是我最喜欢的一天，因为我们会去看望奶奶。", questions: [{ q: "When does the child read English stories?", a: "On Wednesday." }, { q: "Why is Sunday the favourite day?", a: "Because the family visits Grandma." }] },
    memory: ["把七天按 Monday→Sunday 编成节奏口令。", "制作一张自己的英文课程表，每天看一遍。", "记住 Saturday 和 Sunday 都以 S 开头，是周末伙伴。"],
    mistakes: ["具体星期前用 on，不能说 in Monday。", "询问日常活动用 do；回答 I play，不加 is。"],
    practice: [{ q: "补全：I have English ___ Friday.", a: "on" }, { q: "翻译：你星期六做什么？", a: "What do you do on Saturday?" }, { q: "排序：day / favourite / my / is / Sunday", a: "Sunday is my favourite day." }]
  },
  2: {
    unit: "四年级下册 Unit 2 · Cleaning Day", time: 50,
    core: [
      makeWord("clean", "打扫；干净的", "🧽", "Let us clean the classroom.", "让我们打扫教室。"),
      makeWord("window", "窗户", "🪟", "Please open the window.", "请打开窗户。"),
      makeWord("floor", "地板", "🧹", "The floor is clean.", "地板很干净。")
    ],
    extra: [makeExtra("sweep", "清扫", "Sweep the floor, please."), makeExtra("wipe", "擦拭", "Wipe the desk."), makeExtra("tidy", "整洁的；整理", "Keep your room tidy."), makeExtra("dust", "灰尘", "There is dust on the fan."), makeExtra("rubbish", "垃圾", "Put the rubbish in the bin.")],
    objectives: ["听懂并执行简单清洁指令", "使用 Let’s 和 Please 礼貌提出建议", "用 clean、bright 等词描述环境"],
    knowledge: [
      { title: "祈使句", text: "用动词原形开头，表示指令或请求；加 please 更礼貌。", example: "Close the door, please." },
      { title: "Let’s + 动词", text: "Let’s 表示“让我们……吧”，后面必须接动词原形。", example: "Let’s clean the windows." },
      { title: "一词两用", text: "clean 可作动词“打扫”，也可作形容词“干净的”。", example: "Clean the desk. The desk is clean." }
    ],
    reading: { title: "A Clean Classroom", en: "Today is Cleaning Day. Ben sweeps the floor. Lily wipes the desks. I clean the windows. Our teacher turns on the fan. Now our classroom is clean and bright.", zh: "今天是大扫除日。本扫地，莉莉擦桌子，我擦窗户。老师打开风扇。现在我们的教室又干净又明亮。", questions: [{ q: "Who wipes the desks?", a: "Lily." }, { q: "How is the classroom now?", a: "It is clean and bright." }] },
    memory: ["做动作记单词：说 sweep 就做扫地动作。", "把 door、window、floor 贴在家中相应位置。", "记忆 close 和 open 为一对反义词。"],
    mistakes: ["Let’s 后不能加 to：Let’s clean ✓。", "Please 可放句首或句末，句末前常加逗号。"],
    practice: [{ q: "选择：Let’s (clean / cleans) the room.", a: "clean" }, { q: "翻译：请关上窗户。", a: "Please close the window." }, { q: "用两个形容词描述教室。", a: "The classroom is clean and bright." }]
  },
  3: {
    unit: "四年级下册 Unit 3 · School Subjects", time: 50,
    core: [makeWord("PE", "体育", "⚽", "We run in PE class.", "我们在体育课上跑步。"), makeWord("music", "音乐", "🎵", "I like music very much.", "我非常喜欢音乐。"), makeWord("art", "美术", "🎨", "We draw pictures in art class.", "我们在美术课上画画。")],
    extra: [makeExtra("subject", "学科", "English is a school subject."), makeExtra("timetable", "课程表", "Look at the timetable."), makeExtra("lesson", "课", "The lesson begins at eight."), makeExtra("useful", "有用的", "English is useful."), makeExtra("difficult", "困难的", "Math is difficult but interesting.")],
    objectives: ["说出常见学校课程名称", "询问和回答最喜欢的学科", "使用 because 简单说明喜欢的原因"],
    knowledge: [
      { title: "favourite subject", text: "询问最喜欢的学科，用 What is your favourite subject?", example: "My favourite subject is science." },
      { title: "I like...", text: "like 后接学科名；very much 可表示“非常”。", example: "I like English very much." },
      { title: "because 说明原因", text: "because 后接一个原因，使表达更完整。", example: "I like art because it is fun." }
    ],
    reading: { title: "Our School Day", en: "We have Chinese, math and English in the morning. In the afternoon, we have science and art. My favourite subject is science because I like plants. My friend likes art. She can draw very well.", zh: "上午我们有语文、数学和英语课。下午有科学和美术课。我最喜欢科学，因为我喜欢植物。我的朋友喜欢美术，她画得很好。", questions: [{ q: "What subjects do they have in the afternoon?", a: "Science and art." }, { q: "Why does the child like science?", a: "Because the child likes plants." }] },
    memory: ["把科目和课堂动作配对：art—draw，music—sing。", "每天用英文读一次自己的课程表。", "用 favourite 造一个关于自己的真实句子。"],
    mistakes: ["Chinese、English、PE 的首字母要大写。", "What is 可缩写为 What’s；回答不能漏掉 is。"],
    practice: [{ q: "补全：My favourite ___ is English.", a: "subject" }, { q: "翻译：我喜欢科学，因为它很有趣。", a: "I like science because it is interesting." }, { q: "回答：What is your favourite subject?", a: "开放题，如 My favourite subject is art." }]
  },
  4: {
    unit: "四年级下册 Unit 4 · Transportation", time: 50,
    core: [makeWord("by", "乘；通过", "➡️", "I go there by train.", "我乘火车去那里。"), makeWord("plane", "飞机", "✈️", "We go to Beijing by plane.", "我们乘飞机去北京。"), makeWord("ship", "轮船", "🚢", "The ship is very big.", "这艘轮船很大。")],
    extra: [makeExtra("taxi", "出租车", "Let us take a taxi."), makeExtra("subway", "地铁", "The subway is fast."), makeExtra("station", "车站", "Meet me at the station."), makeExtra("helmet", "头盔", "Wear a helmet on a bike."), makeExtra("traffic", "交通", "There is heavy traffic today.")],
    objectives: ["说出常见交通工具", "询问并回答上学或出行方式", "区分 by bus、walk 和 on foot"],
    knowledge: [
      { title: "How do you go...?", text: "How 用来询问方式，回答常用 by + 交通工具。", example: "How do you go to school? By bus." },
      { title: "by 后不加冠词", text: "说交通方式时，by bus/train/bike 中间没有 a 或 the。", example: "by car ✓  by a car ✗" },
      { title: "walk = on foot", text: "walk to school 和 go to school on foot 意思相同。", example: "I walk to school. = I go to school on foot." }
    ],
    reading: { title: "How We Go to School", en: "I live near my school, so I walk there. Amy lives far away. She goes by bus. Ben rides a bike with a helmet. We all arrive before eight o’clock.", zh: "我住得离学校近，所以步行上学。艾米住得远，她乘公交车。本戴着头盔骑自行车。我们都在八点前到校。", questions: [{ q: "Who goes to school by bus?", a: "Amy." }, { q: "Why does the child walk?", a: "Because the child lives near the school." }] },
    memory: ["把交通工具画成路线图，并写上 by。", "用家人的真实出行方式造句。", "记住 walk 自己就是动词，前面不用 by。"],
    mistakes: ["不能说 by walk；应说 walk 或 on foot。", "go to school 中 school 前通常不加 the。"],
    practice: [{ q: "改错：I go to school by a bus.", a: "I go to school by bus." }, { q: "翻译：你怎样去公园？", a: "How do you go to the park?" }, { q: "同义句：I walk to school.", a: "I go to school on foot." }]
  },
  5: {
    unit: "四年级下册 Unit 5 · Shopping", time: 55,
    core: [makeWord("buy", "购买", "🛍️", "I want to buy some apples.", "我想买一些苹果。"), makeWord("price", "价格", "🏷️", "The price is twenty yuan.", "价格是二十元。"), makeWord("kilo", "千克；公斤", "⚖️", "We need one kilo of bananas.", "我们需要一公斤香蕉。")],
    extra: [makeExtra("basket", "购物篮", "Put the fruit in the basket."), makeExtra("fresh", "新鲜的", "These oranges are fresh."), makeExtra("cheap", "便宜的", "The pencils are cheap."), makeExtra("expensive", "昂贵的", "That toy is expensive."), makeExtra("change", "找零", "Here is your change.")],
    objectives: ["表达需要购买的物品和数量", "使用 How much 询问价格", "在购物情境中使用礼貌用语"],
    knowledge: [
      { title: "need + 名词", text: "need 表示需要，some 常用于肯定句中的复数或不可数名词。", example: "We need some fruit and juice." },
      { title: "How much...?", text: "询问价格用 How much is/are...?", example: "How much are the apples?" },
      { title: "数量表达", text: "可数名词用 two apples；按重量购买可用 a kilo of。", example: "a kilo of bananas" }
    ],
    reading: { title: "At the Supermarket", en: "Mum and I are at the supermarket. We need a kilo of apples, some bread and orange juice. The apples are ten yuan. I put everything in the basket and help Mum carry the bag.", zh: "妈妈和我在超市。我们需要一公斤苹果、一些面包和橙汁。苹果十元。我把所有东西放进购物篮，并帮妈妈提袋子。", questions: [{ q: "How much are the apples?", a: "Ten yuan." }, { q: "What drink do they buy?", a: "Orange juice." }] },
    memory: ["把家中食品贴上英文价格标签，玩购物游戏。", "need、buy、price 串成一句话记忆。", "cheap 和 expensive 当作反义词一起记。"],
    mistakes: ["juice 通常不可数，不能随便说 two juices。", "询问单数物品用 How much is；复数用 are。"],
    practice: [{ q: "补全：We need ___ bread.", a: "some" }, { q: "翻译：这些香蕉多少钱？", a: "How much are these bananas?" }, { q: "写出 cheap 的反义词。", a: "expensive" }]
  },
  6: {
    unit: "四年级下册 Unit 6 · Weather ＋ Unit 7 · Seasons", time: 60,
    core: [makeWord("sunny", "晴朗的", "🌞", "It is sunny today.", "今天天气晴朗。"), makeWord("rainy", "下雨的", "🌧️", "It is rainy in Putian.", "莆田今天有雨。"), makeWord("windy", "有风的", "🌬️", "It is windy by the sea.", "海边风很大。"), makeWord("warm", "温暖的", "🌤️", "Spring is warm.", "春天很温暖。")],
    extra: [makeExtra("cloudy", "多云的", "It is cloudy this morning."), makeExtra("forecast", "天气预报", "Listen to the weather forecast."), makeExtra("temperature", "温度", "The temperature is high."), makeExtra("umbrella", "雨伞", "Take an umbrella with you."), makeExtra("season", "季节", "There are four seasons in a year.")],
    objectives: ["描述常见天气状况", "说出四季及典型气候", "根据天气提出合适的生活建议"],
    knowledge: [
      { title: "How is the weather?", text: "询问天气也可以说 What is the weather like?", example: "How is the weather today? It is sunny." },
      { title: "It is + 天气词", text: "描述天气常用形式主语 It，不能省略 is。", example: "It is warm in spring." },
      { title: "in + 季节", text: "表示在某个季节，通常用介词 in。", example: "We swim in summer." },
      { title: "天气与建议", text: "根据天气用 Take、Wear、Let’s 等提出建议。", example: "It is rainy. Take an umbrella." }
    ],
    reading: { title: "Seasons in Putian", en: "Spring in Putian is warm and often rainy. Summer is hot, so many families go to the seaside. Autumn is cool and comfortable. Winter is not very cold, but we still wear warm coats on windy days.", zh: "莆田的春天温暖且常下雨。夏天炎热，许多家庭会去海边。秋天凉爽舒适。冬天不算很冷，但刮风时我们仍会穿暖和的外套。", questions: [{ q: "What is spring like in Putian?", a: "It is warm and often rainy." }, { q: "Where do many families go in summer?", a: "To the seaside." }] },
    memory: ["把四季画成四色转盘，每季写两个天气词。", "sun→sunny、rain→rainy、wind→windy，用词根记忆。", "每天看窗外，用 It is... 报一次天气。"],
    mistakes: ["不能说 Today is rainy；描述天气应说 It is rainy today。", "weather 通常不可数，不说 a weather。"],
    practice: [{ q: "写出 rain 的形容词。", a: "rainy" }, { q: "翻译：莆田夏天天气怎么样？", a: "What is the weather like in Putian in summer?" }, { q: "根据 rainy 提一条建议。", a: "Take an umbrella." }]
  },
  7: {
    unit: "四年级下册 Unit 8 · Summer Vacation", time: 55,
    core: [makeWord("camp", "露营", "⛺", "We will camp by the lake.", "我们将在湖边露营。"), makeWord("travel", "旅行", "🧳", "I will travel with my family.", "我将和家人一起旅行。"), makeWord("learn", "学习", "📖", "I will learn to swim.", "我将学习游泳。")],
    extra: [makeExtra("beach", "海滩", "We play on the beach."), makeExtra("suitcase", "旅行箱", "Pack your suitcase."), makeExtra("postcard", "明信片", "I will send you a postcard."), makeExtra("sunscreen", "防晒霜", "Use sunscreen at the seaside."), makeExtra("festival", "节日；活动节", "There is a summer festival.")],
    objectives: ["使用 will 表达暑假计划", "询问他人的假期安排", "写出3—5句自己的暑假计划"],
    knowledge: [
      { title: "will + 动词原形", text: "will 表示将要做的事，后面无论主语是谁都用动词原形。", example: "She will visit Fuzhou." },
      { title: "will 的问句", text: "把 will 放到主语前构成一般疑问句。", example: "Will you go swimming? Yes, I will." },
      { title: "What will you do?", text: "用来询问未来计划，可回答 I will...", example: "What will you do in summer?" }
    ],
    reading: { title: "My Summer Plan", en: "Summer vacation is coming. I will visit my grandparents first. Then my family will go to Meizhou Island. I will swim, take photos and read an English story every evening.", zh: "暑假就要来了。我会先去看望祖父母，然后和家人去湄洲岛。我会游泳、拍照，并且每天晚上读一个英语故事。", questions: [{ q: "Where will the family go?", a: "Meizhou Island." }, { q: "What will the child do every evening?", a: "Read an English story." }] },
    memory: ["把 will 想成一张“未来车票”，后面带动词原形。", "用真实暑假计划做一张英文愿望清单。", "visit、travel、camp 按“去哪里—怎么去—做什么”串联。"],
    mistakes: ["will 后不能用 goes/visited，要用 go/visit。", "go to the seaside 有 to；visit the seaside 不加 to。"],
    practice: [{ q: "选择：I will (visit / visited) Grandma.", a: "visit" }, { q: "改为问句：You will go swimming.", a: "Will you go swimming?" }, { q: "写两句自己的暑假计划。", a: "开放题，如 I will read books. I will visit the seaside." }]
  },
  8: {
    unit: "五年级上册 Unit 1 · Meeting New Friends", time: 55,
    core: [makeWord("which", "哪一个", "❔", "Which boy is Peter?", "哪个男孩是彼得？"), makeWord("short", "矮的；短的", "📐", "The short girl is my friend.", "那个矮个子女孩是我的朋友。"), makeWord("umbrella", "雨伞", "☂️", "The girl with an umbrella is Lily.", "拿雨伞的女孩是莉莉。")],
    extra: [makeExtra("friendly", "友好的", "Our new classmate is friendly."), makeExtra("hobby", "爱好", "What is your hobby?"), makeExtra("introduce", "介绍", "Let me introduce my friend."), makeExtra("curly", "卷曲的", "She has curly hair."), makeExtra("nationality", "国籍", "We can talk about nationality.")],
    objectives: ["根据外貌和位置辨认人物", "介绍新同学来自哪里", "使用 which、that 和方位介词进行交流"],
    knowledge: [
      { title: "Which one?", text: "当有多个选择时，用 which 询问“哪一个”。", example: "Which girl? The girl beside the window." },
      { title: "方位介词", text: "beside 表示在旁边；behind 表示在后面。", example: "Ben is beside the tall boy." },
      { title: "be from", text: "be from 表示来自某地，be 要随主语变化。", example: "He is from Australia. I am from China." }
    ],
    reading: { title: "Our New Classmate", en: "This is Jack, our new classmate. He is the tall boy beside the window. He is from Australia. Jack likes football and Chinese food. He is friendly and helps us practise English.", zh: "这是我们的新同学杰克。他就是窗户旁边的高个子男孩，来自澳大利亚。杰克喜欢足球和中国食物。他很友好，还帮助我们练习英语。", questions: [{ q: "Where is Jack from?", a: "Australia." }, { q: "How can we find Jack?", a: "He is the tall boy beside the window." }] },
    memory: ["用班级合照练习 beside、behind 和 which。", "tall—short 作为反义词成对记忆。", "Australia 中大写 A 提醒我们它是国家名称。"],
    mistakes: ["描述位置说 beside Wang Tao，不说 beside of。", "He is from... 中不能漏掉 is。"],
    practice: [{ q: "补全：___ boy is Peter?", a: "Which" }, { q: "翻译：门后面的女孩是谁？", a: "Who is the girl behind the door?" }, { q: "介绍一位新朋友，至少写三句。", a: "开放题：姓名＋外貌/位置＋来自哪里。" }]
  },
  9: {
    unit: "五年级上册 Unit 2 · Teachers’ Day", time: 50,
    core: [makeWord("flower", "花", "🌷", "These flowers are for you.", "这些花送给您。"), makeWord("present", "礼物", "🎁", "We have a present for our teacher.", "我们给老师准备了礼物。"), makeWord("card", "卡片", "💌", "I make a card for Miss Gao.", "我给高老师制作卡片。")],
    extra: [makeExtra("celebrate", "庆祝", "We celebrate Teachers’ Day."), makeExtra("thankful", "感激的", "We are thankful to our teachers."), makeExtra("respect", "尊敬", "We respect our teachers."), makeExtra("surprise", "惊喜", "The class has a surprise."), makeExtra("handmade", "手工制作的", "This is a handmade card.")],
    objectives: ["了解并说出教师节日期", "表达感谢并赠送小礼物", "使用 where 询问人物位置"],
    knowledge: [
      { title: "Where is/are...?", text: "询问一个人或物用 is，复数用 are。", example: "Where is Miss Gao? Where are the flowers?" },
      { title: "for 表示给", text: "This is for you 用于赠送礼物或表达心意。", example: "This card is for you." },
      { title: "What a/an...!", text: "感叹一个可数名词时，可用 What a/an + 形容词 + 名词。", example: "What a lovely flower!" }
    ],
    reading: { title: "A Surprise for Our Teacher", en: "Tomorrow is Teachers’ Day. We make a big card after class. Lily brings flowers and Ben writes a thank-you message. When our teacher comes in, we say, “Happy Teachers’ Day!”", zh: "明天是教师节。放学后我们制作了一张大卡片。莉莉带来鲜花，本写下感谢的话。老师进来时，我们一起说：“教师节快乐！”", questions: [{ q: "Who brings flowers?", a: "Lily." }, { q: "What does Ben write?", a: "A thank-you message." }] },
    memory: ["September 的开头 Sep 可与“开学季”联系。", "礼物上写 for you，立刻记住 for 的用法。", "亲手制作一张英文教师节卡片。"],
    mistakes: ["Teachers’ Day 中 Teachers 后有表示复数所有格的撇号。", "What a lovely... 是感叹句，不要漏掉 a。"],
    practice: [{ q: "补全：This flower is ___ you.", a: "for" }, { q: "翻译：高老师在哪里？", a: "Where is Miss Gao?" }, { q: "改成感叹句：The panda is lovely.", a: "What a lovely panda!" }]
  },
  10: {
    unit: "五年级上册 Unit 3 · Planning a Trip", time: 55,
    core: [makeWord("visit", "参观；拜访", "📍", "We will visit Fuzhou.", "我们将游览福州。"), makeWord("place", "地方", "🗺️", "It is a beautiful place.", "那是一个美丽的地方。"), makeWord("famous", "著名的", "⭐", "Mount Wuyi is famous.", "武夷山很有名。")],
    extra: [makeExtra("itinerary", "行程", "Let us make an itinerary."), makeExtra("ticket", "票", "We need train tickets."), makeExtra("hotel", "旅馆", "The hotel is near the lake."), makeExtra("camera", "照相机", "Take your camera."), makeExtra("culture", "文化", "We can learn about local culture.")],
    objectives: ["询问旅行地点、时间和交通方式", "用 will 描述完整行程", "制作一张简单的英文旅行计划表"],
    knowledge: [
      { title: "Where will...?", text: "询问未来要去哪里，用 Where + will + 主语 + go。", example: "Where will you go? I will go to Quanzhou." },
      { title: "When will...?", text: "询问未来时间用 when。", example: "When will you go? In October." },
      { title: "visit 与 go to", text: "visit 后直接接地点；go 后通常要加 to。", example: "visit Fuzhou / go to Fuzhou" }
    ],
    reading: { title: "A Trip to Mount Wuyi", en: "We will visit Mount Wuyi in October. We will go there by train and stay for two days. On the first day, we will climb a mountain. On the second day, we will take a boat and enjoy the beautiful view.", zh: "十月我们将游览武夷山。我们会乘火车去，并住两天。第一天爬山，第二天乘船欣赏美丽景色。", questions: [{ q: "How will they go there?", a: "By train." }, { q: "What will they do on the second day?", a: "Take a boat and enjoy the view." }] },
    memory: ["旅行计划按 Where—When—How—What 四格填写。", "visit 后面不带 to，把它想成能直接到达地点。", "用福建地图标出 Fuzhou、Quanzhou、Mount Wuyi。"],
    mistakes: ["will 后的动词仍用原形。", "Mount Wuyi 是专有名称，两个单词首字母大写。"],
    practice: [{ q: "补全：Where ___ you go?", a: "will" }, { q: "改错：We will visit to Fuzhou.", a: "We will visit Fuzhou." }, { q: "用四个问题制作自己的旅行计划。", a: "Where? When? How? What will you do?" }]
  },
  11: {
    unit: "五年级上册 Unit 4 · Weekend Activities", time: 55,
    core: [makeWord("usually", "通常", "🔁", "I usually read at the weekend.", "我周末通常阅读。"), makeWord("together", "一起", "🤝", "Let us play chess together.", "让我们一起下棋。"), makeWord("watch", "观看", "📺", "We watch a film on Sunday.", "我们星期日看电影。")],
    extra: [makeExtra("activity", "活动", "Swimming is a fun activity."), makeExtra("picnic", "野餐", "We have a picnic in the park."), makeExtra("library", "图书馆", "I go to the library."), makeExtra("practise", "练习", "I practise the piano."), makeExtra("relax", "放松", "Music helps me relax.")],
    objectives: ["介绍自己通常进行的周末活动", "询问朋友的周末安排", "使用邀请语和同伴约定活动"],
    knowledge: [
      { title: "usually 的位置", text: "usually 常放在主语后、行为动词前。", example: "I usually play chess." },
      { title: "一般现在时", text: "表达经常发生的活动；主语是 he/she 时动词常加 s。", example: "She watches films at the weekend." },
      { title: "邀请别人", text: "Let’s... 或 Would you like to...? 都可以提出邀请。", example: "Let’s go to the cinema." }
    ],
    reading: { title: "A Fun Weekend", en: "I usually finish my homework on Saturday morning. In the afternoon, I play chess with Dad. On Sunday, my friends and I go to the library. Sometimes we watch a film together.", zh: "星期六上午我通常完成作业，下午和爸爸下棋。星期日我和朋友们去图书馆。有时我们会一起看电影。", questions: [{ q: "When does the child play chess?", a: "On Saturday afternoon." }, { q: "Where do the friends go on Sunday?", a: "To the library." }] },
    memory: ["制作“我的周末饼图”，给活动配英文。", "usually、sometimes、always 按频率排队记忆。", "watch a film 与 go to the cinema 成组记。"],
    mistakes: ["he/she 作主语时注意 watches、goes。", "at the weekend 是固定搭配，不能漏掉 the。"],
    practice: [{ q: "选择：She (watch / watches) a film.", a: "watches" }, { q: "翻译：我周末通常下棋。", a: "I usually play chess at the weekend." }, { q: "邀请朋友去电影院。", a: "Let’s go to the cinema." }]
  },
  12: {
    unit: "五年级上册 Unit 5 · Months of the Year", time: 60,
    core: [
      makeWord("February", "二月", "2️⃣", "February is the second month.", "二月是第二个月。"),
      makeWord("May", "五月", "5️⃣", "May is warm and sunny.", "五月温暖晴朗。"),
      makeWord("July", "七月", "7️⃣", "Summer vacation begins in July.", "暑假在七月开始。"),
      makeWord("August", "八月", "8️⃣", "It is hot in August.", "八月天气炎热。"),
      makeWord("September", "九月", "9️⃣", "School begins in September.", "学校九月开学。"),
      makeWord("October", "十月", "🔟", "National Day is in October.", "国庆节在十月。"),
      makeWord("November", "十一月", "🍁", "November is cool.", "十一月天气凉爽。")
    ],
    extra: [makeExtra("calendar", "日历", "Look at the calendar."), makeExtra("date", "日期", "What is the date today?"), makeExtra("first", "第一", "January is the first month."), makeExtra("last", "最后的", "December is the last month."), makeExtra("birthday", "生日", "My birthday is in May.")],
    objectives: ["按顺序认读并拼写十二个月份", "询问和回答生日月份", "用月份谈论常见节日和季节"],
    knowledge: [
      { title: "in + 月份", text: "表示在某个月，用介词 in。", example: "My birthday is in April." },
      { title: "月份首字母大写", text: "所有月份都是专有名称，首字母必须大写。", example: "January ✓  january ✗" },
      { title: "When is...?", text: "询问生日或节日在什么时候，用 when。", example: "When is your birthday?" },
      { title: "月份规律", text: "September、November、December 都含有共同结尾 -ember。", example: "Sept-ember / Nov-ember / Dec-ember" }
    ],
    reading: { title: "Our Birthday Calendar", en: "We have a birthday calendar in our classroom. Amy’s birthday is in February. Ben’s is in July. My birthday is in November. We write a kind message for each classmate on their special month.", zh: "教室里有一张生日月历。艾米的生日在二月，本的在七月，我的在十一月。每到同学的生日月份，我们都会写一句温暖的祝福。", questions: [{ q: "Whose birthday is in July?", a: "Ben’s." }, { q: "What do the classmates write?", a: "A kind message." }] },
    memory: ["按季度把12个月分成四组，每组三个。", "用手指关节帮助记大小月，但拼写仍要单独练。", "把家人生日写进英文日历，形成真实记忆。"],
    mistakes: ["月份前用 in；具体日期前才常用 on。", "February 容易漏掉第一个 r，要分音节慢读。"],
    practice: [{ q: "写出一年中的第六个月。", a: "June" }, { q: "补全：My birthday is ___ August.", a: "in" }, { q: "按顺序写出 September 后面的三个月。", a: "October, November, December" }]
  },
  13: {
    unit: "五年级上册 Unit 6 · Asking the Way", time: 55,
    core: [makeWord("left", "左边；向左", "⬅️", "Turn left at the hospital.", "在医院处左转。"), makeWord("turn", "转弯", "↪️", "Turn right at the crossing.", "在十字路口右转。"), makeWord("crossing", "十字路口", "🚦", "Stop at the crossing.", "在十字路口停下。")],
    extra: [makeExtra("corner", "街角", "The shop is on the corner."), makeExtra("block", "街区；路段", "Walk for two blocks."), makeExtra("traffic lights", "交通信号灯", "Turn left at the traffic lights."), makeExtra("opposite", "在……对面", "The bank is opposite the park."), makeExtra("map", "地图", "Let us look at the map.")],
    objectives: ["礼貌询问到达某地的路线", "理解并发出直行、左转、右转指令", "结合简单地图描述完整路线"],
    knowledge: [
      { title: "How can I get to...?", text: "这是常用问路句型，to 后接地点。", example: "How can I get to the hospital?" },
      { title: "路线指令", text: "Go straight、turn left、turn right 都用动词原形开头。", example: "Go straight. Then turn left." },
      { title: "near 与 nearby", text: "near 后可接地点；nearby 通常单独使用。", example: "near the school / Is there a bank nearby?" }
    ],
    reading: { title: "Finding the Museum", en: "A visitor asks me the way to the museum. I say, “Go straight for one block. Turn left at the traffic lights. The museum is opposite the park.” The visitor thanks me and follows the map.", zh: "一位游客向我询问去博物馆的路。我说：“直走一个街区，在红绿灯处左转，博物馆就在公园对面。”游客向我道谢，然后按地图前往。", questions: [{ q: "Where should the visitor turn left?", a: "At the traffic lights." }, { q: "What is opposite the park?", a: "The museum." }] },
    memory: ["在纸上画迷你街区，让玩具沿英文指令移动。", "伸出左右手配合说 left/right。", "straight 中含有 eight 的字母组合，可分段记。"],
    mistakes: ["turn left/right 前通常不加 to。", "get to the station 有 to；get home 不加 to。"],
    practice: [{ q: "翻译：一直走，然后右转。", a: "Go straight. Then turn right." }, { q: "补全：How can I get ___ the station?", a: "to" }, { q: "画路线并用三句英文说明。", a: "开放题，至少使用 go straight 和 turn。" }]
  },
  14: {
    unit: "五年级上册 Unit 7 · Making Phone Calls", time: 50,
    core: [makeWord("answer", "接听；回答", "☎️", "Please answer the phone.", "请接电话。"), makeWord("number", "号码；数字", "🔢", "What is your phone number?", "你的电话号码是多少？"), makeWord("hello", "你好（电话用语）", "👋", "Hello. This is Sally.", "你好，我是萨莉。")],
    extra: [makeExtra("message", "留言；信息", "Can I leave a message?"), makeExtra("dial", "拨号", "Dial the phone number."), makeExtra("available", "有空的；可联系的", "She is not available now."), makeExtra("later", "稍后", "Please call again later."), makeExtra("line", "电话线路", "The line is busy.")],
    objectives: ["使用规范英语电话开场语", "礼貌请求与某人通话", "在对方不方便时请求等待或留言"],
    knowledge: [
      { title: "This is...", text: "电话中介绍自己常说 This is...，通常不说 I am...。", example: "Hello. This is Wang Tao." },
      { title: "May I speak to...?", text: "这是礼貌请求与某人通话的表达。", example: "May I speak to Lily?" },
      { title: "请稍等", text: "Please wait a minute、Hold on, please 都可以请对方稍等。", example: "Hold on, please. She is coming." }
    ],
    reading: { title: "A Phone Call", en: "“Hello. This is Ben. May I speak to Sally?” “Please wait a minute.” Sally comes to the phone. Ben invites her to the library on Saturday. They agree to meet at nine.", zh: "“你好，我是本。我可以和萨莉通话吗？”“请稍等。”萨莉来接电话。本邀请她星期六去图书馆，他们约好九点见面。", questions: [{ q: "Who makes the phone call?", a: "Ben." }, { q: "When will they meet?", a: "At nine on Saturday." }] },
    memory: ["用两部玩具电话进行角色扮演。", "固定背三步：Hello—This is—May I speak to。", "wait a minute 把 minute 与钟表画面联系。"],
    mistakes: ["电话中问“你是谁”常说 Who’s speaking?，不要直译成 Who are you。", "May I 后接动词原形 speak。"],
    practice: [{ q: "补全：Hello. ___ is Wang Tao.", a: "This" }, { q: "翻译：我可以和莉莉通话吗？", a: "May I speak to Lily?" }, { q: "对方不在，请写一句留言请求。", a: "Can I leave a message?" }]
  },
  15: {
    unit: "五年级上册 Unit 8 · My Friends", time: 60,
    core: [makeWord("helpful", "乐于助人的", "🤲", "My friend is very helpful.", "我的朋友很乐于助人。"), makeWord("clever", "聪明的", "🧩", "She is clever and kind.", "她聪明又善良。"), makeWord("active", "活跃的；积极的", "🏃", "Ben is active in class.", "本在课堂上很积极。")],
    extra: [makeExtra("honest", "诚实的", "An honest friend tells the truth."), makeExtra("patient", "有耐心的", "She is patient with me."), makeExtra("cheerful", "开朗的", "He is always cheerful."), makeExtra("creative", "有创造力的", "My friend has creative ideas."), makeExtra("teammate", "队友", "We are good teammates.")],
    objectives: ["从外貌、性格和能力介绍朋友", "询问对方是否认识某人", "完成一段5—8句的朋友介绍"],
    knowledge: [
      { title: "be + 形容词", text: "描述人的外貌或性格时，用 am/is/are + 形容词。", example: "She is young and kind." },
      { title: "can + 动词原形", text: "描述能力用 can，后面接动词原形。", example: "He can play football well." },
      { title: "Do you know...?", text: "询问是否认识某人，可用 Yes, I do / No, I don’t 回答。", example: "Do you know that girl?" },
      { title: "第三人称的 like", text: "主语是 he/she 时，like 要变为 likes。", example: "She likes reading." }
    ],
    reading: { title: "My Best Friend", en: "Lily is my best friend and classmate. She is young, cheerful and helpful. She likes science and reading. She can draw beautiful pictures, too. When I do not understand a question, she explains it patiently.", zh: "莉莉是我最好的朋友，也是我的同班同学。她年轻、开朗并且乐于助人。她喜欢科学和阅读，也会画漂亮的图画。当我不理解问题时，她会耐心地给我讲解。", questions: [{ q: "What subjects or activities does Lily like?", a: "Science and reading." }, { q: "How does Lily help her friend?", a: "She explains questions patiently." }] },
    memory: ["画朋友画像，旁边写3个性格词和2项能力。", "young/old、tall/short 用反义词成对记。", "介绍顺序固定为：姓名—外貌—性格—爱好—能力。"],
    mistakes: ["She is like reading ✗；应说 She likes reading。", "can 后不能加 plays，应说 can play。", "形容词前要有 be：He helpful ✗，He is helpful ✓。"],
    practice: [{ q: "选择：She (like / likes) English.", a: "likes" }, { q: "改错：He can plays chess.", a: "He can play chess." }, { q: "写一段5—8句的朋友介绍。", a: "包括姓名、外貌/性格、爱好和能力。" }]
  }
};

const DEFAULT_STUDY_TASKS = [
  { id: "listen", icon: "🎧", title: "听读必备单词", detail: "每个单词听2遍并跟读3遍" },
  { id: "core", icon: "✍️", title: "掌握必备单词", detail: "完成认读、中文意思和拼写检查" },
  { id: "extra", icon: "🌱", title: "学习拓展单词", detail: "选3个拓展词各造一个短语或句子" },
  { id: "sentence", icon: "🗣️", title: "替换练习句型", detail: "每个重点句型换词说3遍" },
  { id: "reading", icon: "📖", title: "完成单元阅读", detail: "朗读短文并回答阅读问题" },
  { id: "practice", icon: "✅", title: "完成知识练习", detail: "先口答，再展开核对答案" }
];

LESSONS.forEach((lesson) => {
  const detail = LESSON_DETAILS[lesson.day];
  if (!detail) return;
  lesson.words = [...lesson.words, ...detail.core].filter(
    (item, index, list) => list.findIndex((word) => word.word.toLowerCase() === item.word.toLowerCase()) === index
  );
  Object.assign(lesson, detail, { studyTasks: DEFAULT_STUDY_TASKS });
  delete lesson.core;
});

ALL_WORDS = LESSONS.flatMap((lesson) => lesson.words);
