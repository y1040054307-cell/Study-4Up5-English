/* 三年级上册精品示范册：人工编写的对话、分级阅读与针对性练习。 */
(() => {
  "use strict";

  const P = (level, q, answer, opts, word, why) => ({ level, q, answer, opts, word, why });
  const R = (level, title, focus, text, questions) => ({ level, title, focus, text, questions });

  window.QUALITY_G3A_CONTENT = {
    "g3a-u1": {
      reviewed: "2026-08-03",
      dialogues: [
        { title:"场景一 · 校门口第一次见面", tip:"先听完整对话，再交换角色朗读。", lines:[["A","Hello! I'm Amy."],["B","Hello, Amy. I'm Ben."],["A","Nice to meet you, Ben."],["B","Nice to meet you, too."],["A","How are you today?"],["B","I'm fine, thank you."]] },
        { title:"场景二 · 询问并记住名字", tip:"注意 What's your name? 的语调和回答方式。", lines:[["A","Hello! What's your name?"],["B","My name is Lily."],["A","Can you spell your name, please?"],["B","L-I-L-Y, Lily."],["A","Thank you, Lily."],["B","You're welcome."]] },
        { title:"场景三 · 礼貌告别新朋友", tip:"把 Amy、Ben 换成自己和同学的名字。", lines:[["A","Ben, this is my friend, Mia."],["B","Hello, Mia. Nice to meet you."],["A","Nice to meet you, Ben."],["B","We are new friends now."],["A","Goodbye, Ben. Have a good day!"],["B","Goodbye! See you tomorrow."]] }
      ],
      readings: [
        R("LEVEL 1","基础精读：A New Friend","找出人物姓名和问候语。","Amy is at the school gate. She sees a new boy. 'Hello! I'm Amy,' she says. The boy smiles and says, 'I'm Ben. Nice to meet you.' Now Amy and Ben are friends.",[["Where is Amy?","She is at the school gate."],["Who is the new boy?","The new boy is Ben."],["What does Amy say first?","She says, 'Hello! I'm Amy.'"],["How does Ben feel?","He smiles, so he is friendly and happy."],["What happens at the end?","Amy and Ben become friends."]]),
        R("LEVEL 2","对话阅读：The Name Card","理解询问姓名、拼写姓名和致谢。","Mia makes a name card for a new classmate. 'What's your name?' she asks. 'My name is Leo,' the boy says. He spells L-E-O. Mia writes the name carefully. Leo says, 'Thank you.'",[["What does Mia make?","She makes a name card."],["What is the boy's name?","His name is Leo."],["How does Leo spell his name?","L-E-O."],["Why does Mia ask his name?","She needs the name for the card."],["Which words show good manners?","What's your name, thank you, and a polite answer show good manners."]]),
        R("LEVEL 3","迁移阅读：Be Kind to a New Classmate","理解怎样主动帮助新同学。","A new girl comes to Class Three. She looks a little worried. Amy says hello and tells the girl her name. Then Amy shows her the classroom and introduces two friends. The new girl smiles. A kind hello can help someone feel welcome.",[["Why may the new girl feel worried?","She is new to the class."],["What does Amy do first?","Amy says hello and tells her name."],["What else does Amy do?","She shows the classroom and introduces friends."],["Which sentence tells the main idea?","A kind hello can help someone feel welcome."],["What can you say to a new classmate?","示例：Hello! I'm ____. Nice to meet you."]])
      ],
      practice: [
        P("第一关 · 词义理解","“hello”的常见意思是：","你好",["再见","名字","你好","朋友"],"hello","hello 是见面时使用的问候语。"),
        P("第一关 · 词义理解","“friend”表示：","朋友",["老师","朋友","学校","一天"],"friend","friend 是“朋友”，复数是 friends。"),
        P("第一关 · 词义理解","“fine”在 I'm fine. 中表示：","很好",["请","很好","再见","担心"],"fine","I'm fine. 用来回答身体或心情状况良好。"),
        P("第一关 · 词义理解","“name”表示：","名字",["名字","年龄","号码","同学"],"name","询问姓名用 What's your name?"),
        P("第一关 · 词义理解","“meet”在 Nice to meet you. 中表示：","遇见；认识",["拼写","感谢","遇见；认识","帮助"],"meet","meet 在问候语中表示“认识、见到”。"),
        P("第二关 · 拼写辨析","选择“请”的正确英文：","please",["place","please","peace","pleas"],"please","please 中间是 ea，结尾有 se。"),
        P("第二关 · 拼写辨析","选择“再见”的正确英文：","goodbye",["goodbay","good day","goodbye","goodboy"],"goodbye","goodbye 是一个完整单词，不要写成 goodbay。"),
        P("第二关 · 拼写辨析","选择“朋友”的正确英文：","friend",["fiend","frend","friend","friendly"],"friend","friend 的字母顺序是 f-r-i-e-n-d。"),
        P("第二关 · 拼写辨析","选择“名字”的正确英文：","name",["mane","name","game","same"],"name","name 是 n-a-m-e；mane 是“鬃毛”。"),
        P("第二关 · 拼写辨析","选择“一天；白天”的正确英文：","day",["day","say","bay","dye"],"day","day 与 say 只差首字母，要看清 d。"),
        P("第三关 · 句式填空","Hello! ___ Amy.","I'm",["My","I'm","Is","Are"],"hello","介绍自己用 I'm + 名字。"),
        P("第三关 · 句式填空","What's your ___?","name",["fine","name","friend","day"],"name","What's your name? 是询问姓名的固定问句。"),
        P("第三关 · 句式填空","How ___ you?","are",["am","is","are","be"],"fine","主语是 you，be 动词用 are。"),
        P("第三关 · 句式填空","Nice to ___ you.","meet",["meat","meet","met","meeting"],"meet","to 后用动词原形 meet；meat 是“肉”。"),
        P("第三关 · 句式填空","I'm fine, ___ you.","thank",["think","thanks","thank","please"],"fine","完整表达是 I'm fine, thank you."),
        P("第四关 · 情境运用","第一次见到新同学，最合适的一句是：","Nice to meet you.",["Goodbye.","Nice to meet you.","I'm nine.","Open the door."],"meet","初次见面用 Nice to meet you."),
        P("第四关 · 情境运用","别人问 How are you?，合适的回答是：","I'm fine, thank you.",["My name is Ben.","Goodbye.","I'm fine, thank you.","Nice name."],"fine","How are you? 询问状况，应回答 I'm fine 等。"),
        P("第四关 · 情境运用","想知道对方姓名，应该问：","What's your name?",["How old are you?","What's your name?","How are you?","Who is she?"],"name","What's your name? 专门询问姓名。"),
        P("第四关 · 情境运用","放学分别时，最合适的是：","Goodbye! See you tomorrow.",["Hello! I'm Amy.","Goodbye! See you tomorrow.","What's your name?","I'm fine."],"goodbye","告别时可说 Goodbye 和 See you tomorrow。"),
        P("第四关 · 情境运用","把 Mia 介绍给 Ben，正确语序是：","Ben, this is my friend, Mia.",["This Ben is friend my Mia.","Ben, my this friend is Mia.","Ben, this is my friend, Mia.","Mia is this Ben friend."],"friend","介绍身边的人用 This is my friend, ...。")
      ]
    },

    "g3a-u2": {
      reviewed: "2026-08-03",
      dialogues: [
        { title:"场景一 · 数一数池塘里的鸭子", tip:"不要按固定数字顺序猜答案，要真正听清数量。", lines:[["A","Look at the ducks by the river."],["B","They are cute. How many ducks?"],["A","Let's count them together."],["B","One, three, five, seven..."],["A","Please count every duck, not every other duck."],["B","You're right. There are eight ducks."]] },
        { title:"场景二 · 询问年龄", tip:"区分 How many 和 How old。", lines:[["A","How old are you, Leo?"],["B","I'm nine years old."],["A","Is your sister nine, too?"],["B","No. She is seven."],["A","So you are two years older."],["B","Yes, that's right."]] },
        { title:"场景三 · 记录电话号码", tip:"电话号码逐个数字读，0 通常读 zero。", lines:[["A","What's your phone number?"],["B","It's five-eight-one-zero-three-six."],["A","Is the fourth number zero?"],["B","Yes, it is."],["A","Let me read it again: five-eight-one-zero-three-six."],["B","Correct. You wrote every number."]] }
      ],
      readings: [
        R("LEVEL 1","基础精读：Ducks by the River","用数量词确认总数。","Ben sees some ducks by the river. He points to each duck and counts slowly: one, two, three, four, five. There are five ducks. One small duck is behind its mother.",[["Who sees the ducks?","Ben sees the ducks."],["Where are the ducks?","They are by the river."],["How does Ben count?","He points to each duck and counts slowly."],["How many ducks are there?","There are five ducks."],["Where is the small duck?","It is behind its mother."]]),
        R("LEVEL 2","信息阅读：Our Class Survey","从表述中提取年龄和人数。","There are ten children in the English club. Three children are eight years old. Five children are nine. Two children are ten. The teacher checks the numbers: three plus five plus two is ten.",[["How many children are in the club?","There are ten children."],["How many are eight years old?","Three children."],["Which age group has five children?","The nine-year-old group."],["How many are ten years old?","Two children."],["Why does the teacher add the numbers?","To check that the total is ten."]]),
        R("LEVEL 3","迁移阅读：Check the Number","理解数字准确性的重要性。","Mia writes Ben's phone number, but one digit is wrong. Ben reads the number again, one digit at a time. Mia listens, points to each digit and finds the mistake. She changes six to seven. Careful listening makes the number correct.",[["What is wrong at first?","One digit in the phone number is wrong."],["How does Ben help?","He reads the number again, one digit at a time."],["What does Mia do while listening?","She points to each digit."],["Which digit does she change?","She changes six to seven."],["What is the reading lesson?","Read and check numbers carefully."]])
      ],
      practice: [
        P("第一关 · 数字辨认","选择“七”：","seven",["six","seven","eight","five"],"seven","seven 表示7。"),
        P("第一关 · 数字辨认","选择“九”：","nine",["five","nine","one","ten"],"nine","nine 表示9，注意结尾是 ne。"),
        P("第一关 · 数字辨认","“three”表示：","三",["二","三","四","五"],"three","three 表示3，开头是 th。"),
        P("第一关 · 数字辨认","“eight”表示：","八",["六","七","八","九"],"eight","eight 表示8，拼写中有 eigh。"),
        P("第一关 · 数字辨认","“ten”表示：","十",["一","二","九","十"],"ten","ten 表示10。"),
        P("第二关 · 拼写辨析","选择“四”的正确拼写：","four",["for","four","fore","faur"],"four","four 是数字4；for 是介词“为了、给”。"),
        P("第二关 · 拼写辨析","选择“五”的正确拼写：","five",["fife","five","fine","fiv"],"five","five 是5；fine 是“很好”。"),
        P("第二关 · 拼写辨析","选择“二”的正确拼写：","two",["to","too","two","tow"],"two","two 是数字2；to 和 too 意思不同。"),
        P("第二关 · 拼写辨析","选择“八”的正确拼写：","eight",["eigth","eight","eighty","height"],"eight","eight 中 g 在 h 前面。"),
        P("第二关 · 拼写辨析","选择“三”的正确拼写：","three",["there","tree","three","thirteen"],"three","three 是3；there 表示“那里”。"),
        P("第三关 · 句式理解","How ___ ducks?","many",["old","many","much","number"],"five","可数名词复数 ducks 前用 How many。"),
        P("第三关 · 句式理解","How old are you? — I'm ___.","nine",["fine","name","nine","friend"],"nine","询问年龄时回答 I'm + 数字。"),
        P("第三关 · 句式理解","There ___ five ducks.","are",["is","am","are","be"],"five","five ducks 是复数，there be 用 are。"),
        P("第三关 · 句式理解","Let's ___ them.","count",["counts","counting","count","number"],"five","Let's 后接动词原形 count。"),
        P("第三关 · 句式理解","What's your phone ___?","number",["name","old","number","many"],"five","phone number 是“电话号码”。"),
        P("第四关 · 实际运用","想问桌上有多少本书，应说：","How many books?",["How old books?","How many books?","What books old?","How much book?"],"five","books 是可数名词复数，用 How many。"),
        P("第四关 · 实际运用","想问同学年龄，应说：","How old are you?",["How many are you?","How are old you?","How old are you?","What's old?"],"nine","询问年龄的固定语序是 How old are you?"),
        P("第四关 · 实际运用","电话号码 581036 应怎样读？","five-eight-one-zero-three-six",["five hundred and eighty-one thousand","five-eight-one-zero-three-six","five-eight-ten-three-six","fifty-eight-one-three-six"],"five","电话号码通常逐个数字读。"),
        P("第四关 · 实际运用","看到7只猫，正确表达是：","There are seven cats.",["There is seven cat.","There are seven cats.","There seven are cat.","There am seven cats."],"seven","复数 seven cats 搭配 There are。"),
        P("第四关 · 实际运用","哪组数字不是按大小顺序排列？","two, eight, five",["one, two, three","four, five, six","seven, eight, nine","two, eight, five"],"five","two, eight, five 的数值先增后减，不是顺序排列。")
      ]
    },

    "g3a-u3": {
      reviewed: "2026-08-03",
      dialogues: [
        { title:"场景一 · 找出教室里的颜色", tip:"先看单个物品，再用 it 回答。", lines:[["A","What color is the door?"],["B","It's blue."],["A","What color is the clock?"],["B","It's yellow."],["A","And the blackboard?"],["B","It is black."]] },
        { title:"场景二 · 描述多个物品", tip:"多个物品用 they 和 are。", lines:[["A","Look at these flowers."],["B","They are beautiful."],["A","What color are they?"],["B","They are red and pink."],["A","Are the leaves red, too?"],["B","No. The leaves are green."]] },
        { title:"场景三 · 美术课调颜色", tip:"理解 red + yellow 可以调出 orange。", lines:[["A","Please give me red and yellow."],["B","Here you are."],["A","I mix the two colors."],["B","Look! Now it is orange."],["A","That's interesting."],["B","Colors can change when we mix them."]] }
      ],
      readings: [
        R("LEVEL 1","基础精读：A Colorful Classroom","寻找颜色词对应的物品。","Our classroom is colorful. The door is blue. The clock is yellow. Two flowers are red, and the leaves are green. The blackboard is black. Every color helps us describe what we see.",[["What color is the door?","It is blue."],["What color is the clock?","It is yellow."],["How many flowers are red?","Two flowers."],["What is green?","The leaves are green."],["What is the passage mainly about?","Colors in the classroom."]]),
        R("LEVEL 2","观察阅读：One or Many","区分 it is 和 they are。","Mia has one orange bag and two white books. She points to the bag and says, 'It is orange.' Then she points to the books and says, 'They are white.' One thing uses it. Two or more things use they.",[["What color is Mia's bag?","It is orange."],["How many books does she have?","She has two books."],["What color are the books?","They are white."],["Why does Mia use it for the bag?","Because the bag is one thing."],["When do we use they?","We use they for two or more people or things."]]),
        R("LEVEL 3","科学阅读：Mixing Colors","理解颜色混合并用完整句表达结果。","Amy puts a little red paint beside yellow paint. She mixes them with a brush. The new color is orange. Next, she mixes blue and yellow. The new color is green. Amy writes each result in a full sentence.",[["Which colors make orange?","Red and yellow make orange."],["Which colors make green?","Blue and yellow make green."],["What does Amy use to mix the paint?","She uses a brush."],["What does she do after mixing?","She writes the result in a full sentence."],["Write one result sentence.","示例：The new color is orange."]])
      ],
      practice: [
        P("第一关 · 颜色词义","“green”表示：","绿色",["红色","蓝色","绿色","黄色"],"green","green 是绿色。"),
        P("第一关 · 颜色词义","“black”表示：","黑色",["白色","黑色","粉色","蓝色"],"black","black 是黑色。"),
        P("第一关 · 颜色词义","“colorful”表示：","五颜六色的",["没有颜色的","五颜六色的","只有红色的","透明的"],"colorful","colorful 是形容词，表示颜色丰富。"),
        P("第一关 · 颜色词义","“pink”表示：","粉色",["橙色","粉色","紫色","白色"],"pink","pink 是粉色。"),
        P("第一关 · 颜色词义","“white”表示：","白色",["黑色","黄色","白色","绿色"],"white","white 是白色。"),
        P("第二关 · 拼写辨析","选择“蓝色”的正确拼写：","blue",["bule","blue","blur","bleu"],"blue","blue 的字母顺序是 b-l-u-e。"),
        P("第二关 · 拼写辨析","选择“颜色”的正确拼写：","color",["colourful","collor","color","cloor"],"color","美式拼写 color；本站统一使用 color。"),
        P("第二关 · 拼写辨析","选择“黄色”的正确拼写：","yellow",["yello","yellow","bellow","yallow"],"yellow","yellow 结尾是 ow。"),
        P("第二关 · 拼写辨析","选择“橙色”的正确拼写：","orange",["orenge","orange","range","orang"],"orange","orange 既可表示橙色，也可表示橙子。"),
        P("第二关 · 拼写辨析","选择“红色”的正确拼写：","red",["read","red","ride","reed"],"red","red 是颜色；read 是“阅读”。"),
        P("第三关 · 单复数句式","What color ___ it?","is",["am","is","are","be"],"color","主语 it 是单数，be 动词用 is。"),
        P("第三关 · 单复数句式","What color ___ they?","are",["am","is","are","be"],"color","主语 they 是复数，be 动词用 are。"),
        P("第三关 · 单复数句式","The door ___ blue.","is",["are","am","is","be"],"blue","The door 是单数，使用 is。"),
        P("第三关 · 单复数句式","The flowers ___ red.","are",["is","are","am","be"],"red","flowers 是复数，使用 are。"),
        P("第三关 · 单复数句式","Show ___ blue, please.","me",["I","my","me","mine"],"blue","动词 show 后用宾格 me。"),
        P("第四关 · 观察运用","问一扇门的颜色，应说：","What color is it?",["What color are they?","What color is it?","How many colors?","Where is color?"],"color","单个物品用 it 和 is。"),
        P("第四关 · 观察运用","问两本书的颜色，应说：","What color are they?",["What color is it?","What color are they?","Who are the books?","How old are they?"],"color","多个物品用 they 和 are。"),
        P("第四关 · 观察运用","red 与 yellow 混合得到：","orange",["green","blue","orange","black"],"orange","基础颜料中红色和黄色混合可得到橙色。"),
        P("第四关 · 观察运用","选择语序正确的句子：","The leaves are green.",["The green are leaves.","Leaves the are green.","The leaves are green.","Are green the leaves."],"green","陈述句语序是主语 The leaves + be 动词 are + 形容词 green。"),
        P("第四关 · 观察运用","别人说 Show me blue, please.，你应：","指出或拿出蓝色物品",["说自己的年龄","指出或拿出蓝色物品","离开教室","数一数物品"],"blue","show me blue 是请对方展示蓝色。")
      ]
    },

    "g3a-u4": {
      reviewed: "2026-08-03",
      dialogues: [
        { title:"场景一 · 介绍家庭照片", tip:"介绍近处的人用 This is...。", lines:[["A","Look at my family photo."],["B","Who is she?"],["A","This is my mother."],["B","Who is the boy beside her?"],["A","He is my brother."],["B","You have a warm family."]] },
        { title:"场景二 · 区分 he 与 she", tip:"男性用 he，女性用 she。", lines:[["A","Is this your grandpa?"],["B","Yes, he is."],["A","And who is she?"],["B","She is my grandma."],["A","Do they live with you?"],["B","No, but we visit them every week."]] },
        { title:"场景三 · 介绍多位家人", tip:"两人或多人用 they / are。", lines:[["A","Who are they in the photo?"],["B","They are my father and mother."],["A","What do they like?"],["B","My father likes reading, and my mother likes music."],["A","What does your family do together?"],["B","We have dinner together every day."]] }
      ],
      readings: [
        R("LEVEL 1","基础精读：My Family Photo","找出家庭成员并辨认代词。","This is Mia's family photo. Her father is tall, and her mother has a warm smile. The little boy is her brother. Mia loves her family. They have dinner together every day.",[["Whose family photo is it?","It is Mia's family photo."],["Who is tall?","Her father is tall."],["Who has a warm smile?","Her mother."],["Who is the little boy?","He is Mia's brother."],["What do they do together?","They have dinner together every day."]]),
        R("LEVEL 2","代词阅读：He, She and They","理解代词指代谁。","Grandpa is in the garden. He waters the flowers. Grandma is in the kitchen. She makes some fruit salad. After that, they sit together and talk with Mia. He means Grandpa, she means Grandma, and they means both of them.",[["Where is Grandpa?","He is in the garden."],["What does he do?","He waters the flowers."],["Where is Grandma?","She is in the kitchen."],["What does they mean in the passage?","It means Grandpa and Grandma together."],["Why are pronouns useful?","They help us avoid repeating names."]]),
        R("LEVEL 3","迁移阅读：Family Jobs at Home","理解每位家人的行动并概括主旨。","On Sunday morning, everyone helps at home. Father cleans the windows. Mother washes the clothes. The brother puts books on the shelf, and the sister waters a plant. Grandpa tells a story after lunch. The family works, rests and laughs together.",[["When does the family help at home?","On Sunday morning."],["Who cleans the windows?","Father cleans the windows."],["What does the brother do?","He puts books on the shelf."],["Who tells a story?","Grandpa tells a story."],["What is the main idea?","Family members help and spend time together."]])
      ],
      practice: [
        P("第一关 · 家庭词汇","“father”表示：","爸爸",["妈妈","爸爸","兄弟","爷爷"],"father","father 是爸爸。"),
        P("第一关 · 家庭词汇","“sister”表示：","姐妹",["兄弟","姐妹","妈妈","奶奶"],"sister","sister 可以表示姐姐或妹妹。"),
        P("第一关 · 家庭词汇","“grandma”表示：","奶奶或外婆",["爷爷或外公","奶奶或外婆","妈妈","姐妹"],"grandma","grandma 是 grandmother 的口语形式。"),
        P("第一关 · 家庭词汇","“family”表示：","家庭；家人",["朋友","班级","家庭；家人","学校"],"family","family 可表示家庭整体或家人。"),
        P("第一关 · 家庭词汇","“love”表示：","爱",["看","爱","帮助","介绍"],"love","love 可作动词，表示爱、喜爱。"),
        P("第二关 · 拼写辨析","选择“妈妈”的正确拼写：","mother",["mather","mother","mouth","another"],"mother","mother 是 m-o-t-h-e-r。"),
        P("第二关 · 拼写辨析","选择“兄弟”的正确拼写：","brother",["broter","brother","bother","brought"],"brother","brother 中有 th。"),
        P("第二关 · 拼写辨析","选择“她”的正确英文：","she",["he","her","she","they"],"she","she 是女性第三人称单数主格。"),
        P("第二关 · 拼写辨析","选择“他”的正确英文：","he",["she","he","his","they"],"he","he 是男性第三人称单数主格。"),
        P("第二关 · 拼写辨析","选择“爷爷或外公”的正确英文：","grandpa",["grandma","grandpa","father","parents"],"grandpa","grandpa 指爷爷或外公。"),
        P("第三关 · 代词与be动词","Who is he? — ___ is my brother.","He",["She","They","He","It"],"he","he 指男性单数，句首要大写。"),
        P("第三关 · 代词与be动词","Who is she? — ___ is my sister.","She",["He","She","They","We"],"she","she 指女性单数。"),
        P("第三关 · 代词与be动词","Who are they? — They ___ my grandparents.","are",["am","is","are","be"],"family","主语 they 是复数，be 动词用 are。"),
        P("第三关 · 代词与be动词","This ___ my mother.","is",["am","is","are","be"],"mother","This is... 用来介绍近处的一个人或物。"),
        P("第三关 · 代词与be动词","I love ___ family.","my",["I","me","my","mine"],"family","family 前用形容词性物主代词 my。"),
        P("第四关 · 情境运用","介绍身边的妈妈，应说：","This is my mother.",["She my mother is.","This is my mother.","Who is my mother?","They are mother."],"mother","介绍身边的人用 This is...。"),
        P("第四关 · 情境运用","问照片中的男性是谁，应说：","Who is he?",["Who is she?","Who are they?","Who is he?","What color is he?"],"he","男性单数用 he。"),
        P("第四关 · 情境运用","问照片中的两个人是谁，应说：","Who are they?",["Who is he?","Who are they?","What are they color?","How old it?"],"family","多人用 they，be 动词用 are。"),
        P("第四关 · 情境运用","选择代词指代正确的一项：","Grandma is kind. She smiles at me.",["Grandma is kind. He smiles at me.","Grandma is kind. She smiles at me.","Grandma are kind. They smiles.","Grandma am kind. I smiles."],"grandma","Grandma 是女性单数，用 she。"),
        P("第四关 · 情境运用","选择语序正确的一项：","They have dinner together every day.",["They dinner have together every day.","Have they dinner every together day.","They have dinner together every day.","Together they every day dinner have."],"family","陈述句语序是主语 + 动词 + 宾语 + 方式/时间。")
      ]
    }
  };
})();
