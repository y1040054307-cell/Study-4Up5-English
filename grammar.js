window.GRAMMAR_TOPICS = [
  {
    id:"articles", icon:"🧺", title:"冠词和限定词", subtitle:"先说清“一个、哪一个、多少个”",
    intro:"冠词和限定词放在名词前面，帮助听者知道你说的是一个、特定的一个，还是一些。",
    sections:[
      {title:"a：辅音音素前的“一个”",rule:"可数名词单数第一次出现，且后一个词以辅音音素开头时用 a。判断的是声音，不只看首字母。",points:["a book：一本书","a useful book：useful 开头读 /j/，是辅音音素","不能说 a books，也不能直接说 a water"],examples:[{en:"I have a new bag.",zh:"我有一个新书包。",why:"bag 是可数名词单数，第一次提到；new 以辅音音素 /n/ 开头。"},{en:"He is a useful helper.",zh:"他是一位有用的帮手。",why:"useful 虽以字母 u 开头，却读 /juː/，所以用 a。"}]},
      {title:"an：元音音素前的“一个”",rule:"可数名词单数第一次出现，且后一个词以元音音素开头时用 an。",points:["an apple：一个苹果","an orange bag：一个橙色书包","an hour：hour 的 h 不发音，开头是元音音素"],examples:[{en:"She eats an apple after lunch.",zh:"她午饭后吃一个苹果。",why:"apple 以元音音素 /æ/ 开头，所以用 an。"},{en:"We wait for an hour.",zh:"我们等一个小时。",why:"hour 的 h 不发音，读音以 /aʊ/ 开头，所以用 an。"}]},
      {title:"the：双方都知道的“这个/这些”",rule:"再次提到、被说明是哪一个、独一无二，或说话双方都知道时用 the；单数、复数和不可数名词前都能用。",points:["I see a dog. The dog is brown. 第二次提到","Open the door. 双方知道是哪扇门","the sun：独一无二的太阳"],examples:[{en:"I see a cat. The cat is under the chair.",zh:"我看见一只猫。这只猫在椅子下面。",why:"第二句再次提到前面的 cat，所以用 the。"},{en:"Please close the window.",zh:"请关上窗户。",why:"在当前情境中，双方知道要关的是哪扇窗。"}]},
      {title:"零冠词与其他限定词",rule:"复数名词或不可数名词表示一般事物时常不用 a/an/the。this、that、these、those、some、any、my 等也能限定名词，通常不和 a/an 同时使用。",points:["I like milk. 泛指牛奶","These books are mine. these 后接复数","Do you have any water? 疑问句常用 any"],examples:[{en:"Children need sleep.",zh:"孩子们需要睡眠。",why:"children 和 sleep 都表示一般事物，因此不用冠词。"},{en:"These two books are my books.",zh:"这两本书是我的书。",why:"these 指近处的复数；my 表示所属，它们都属于限定词。"}]}
    ],
    quiz:[
      {q:"I have ___ English book.",options:["a","an","the"],answer:"an",explain:"English 以元音音素开头，而且是一本第一次提到的书。"},
      {q:"This is a dog. ___ dog is white.",options:["A","An","The"],answer:"The",explain:"第二次提到同一只狗，用 the。"},
      {q:"He is ___ useful boy.",options:["a","an","the"],answer:"a",explain:"useful 开头读 /j/，是辅音音素。"},
      {q:"I like ___ milk.",options:["a","an","不填"],answer:"不填",explain:"milk 是不可数名词，表示一般的牛奶时不用冠词。"},
      {q:"Are there ___ apples in the bag?",options:["some","any","a"],answer:"any",explain:"一般疑问句中询问是否有一些，通常用 any。"}
    ]
  },
  {
    id:"nouns", icon:"📦", title:"名词：可数、不可数、单复数", subtitle:"先判断能不能一个一个数",
    intro:"名词表示人、事物、地点或概念。会不会数，决定前面用什么词，后面要不要加复数。",
    sections:[
      {title:"可数名词",rule:"能直接数出 one、two、three 的名词是可数名词。单数前通常要有限定词，数量大于一时用复数。",points:["one apple / two apples","a student / many students","单数不能孤零零出现：I have a pen."],examples:[{en:"There is a book on the desk.",zh:"书桌上有一本书。",why:"book 可数且只有一本，用 a book，be 动词用 is。"},{en:"There are three books on the desk.",zh:"书桌上有三本书。",why:"数量是 three，book 变成 books，be 动词用 are。"}]},
      {title:"复数变化",rule:"多数名词加 -s；以 s、x、ch、sh 结尾多加 -es；辅音字母+y 通常变 y 为 i 再加 -es；还有不规则变化。",points:["cat → cats；box → boxes","baby → babies；boy → boys","child → children；man → men；sheep → sheep"],examples:[{en:"Two babies are sleeping.",zh:"两个婴儿正在睡觉。",why:"baby 前是 two，复数把 y 变 i 再加 -es。"},{en:"The children are in the park.",zh:"孩子们在公园里。",why:"child 的不规则复数是 children，不能写 childs。"}]},
      {title:"不可数名词",rule:"不能直接用 one、two 数的物质或抽象概念通常不可数，前面不用 a/an，谓语常按单数处理。可用量词表达数量。",points:["water、milk、rice、homework","some water / much homework","a glass of water / two pieces of bread"],examples:[{en:"The milk is in the fridge.",zh:"牛奶在冰箱里。",why:"milk 不可数，谓语用 is，不能说 a milk。"},{en:"I need two pieces of paper.",zh:"我需要两张纸。",why:"paper 表示纸张材料时不可数，用 pieces of 来计数。"}]}
    ],
    quiz:[
      {q:"There are three ___ in the box.",options:["toy","toys","toies"],answer:"toys",explain:"three 后接可数名词复数，toy 的复数直接加 s。"},
      {q:"I drink some ___ every day.",options:["waters","water","a water"],answer:"water",explain:"water 是不可数名词。"},
      {q:"One child, two ___.",options:["childs","childes","children"],answer:"children",explain:"child 的复数是不规则形式 children。"},
      {q:"The rice ___ hot.",options:["is","are","am"],answer:"is",explain:"rice 是不可数名词，作主语时按单数处理。"}
    ]
  },
  {
    id:"verbs", icon:"⚙️", title:"动词：时态、语态、主谓一致", subtitle:"动作什么时候发生，谁来做",
    intro:"动词是句子的发动机。先找时间，再找主语，最后决定动词形式。小学阶段先牢固掌握一般现在、现在进行、一般过去和一般将来。",
    sections:[
      {title:"时态：先看时间线索",rule:"经常发生用一般现在时；正在发生用 be + doing；过去发生用过去式；将来计划用 will 或 be going to。",points:["every day → 一般现在时","now / look → 现在进行时","yesterday / last week → 一般过去时","tomorrow → 一般将来时"],examples:[{en:"She reads English every day.",zh:"她每天读英语。",why:"every day 表示习惯；主语 she 是第三人称单数，read 加 s。"},{en:"They are playing football now.",zh:"他们现在正在踢足球。",why:"now 表示此刻正在发生，用 are playing。"}]},
      {title:"主谓一致",rule:"一般现在时中，I/you/复数主语用动词原形；he/she/it 或一个人、一个物作主语时，实义动词通常加 -s/-es。be 动词要用 am/is/are。",points:["I play. / He plays.","The dog likes bones.","My friends are happy."],examples:[{en:"My brother goes to school by bus.",zh:"我哥哥乘公交车上学。",why:"my brother 是第三人称单数，go 变 goes。"},{en:"My parents work in Putian.",zh:"我的父母在莆田工作。",why:"parents 是复数，work 保持原形。"}]},
      {title:"主动与被动",rule:"主动句强调谁做事；被动句强调承受动作的人或物，基本形式是 be + 过去分词。小学先学会看懂常见被动句。",points:["We clean the room. 主动","The room is cleaned by us. 被动","be 的形式随时间和主语改变"],examples:[{en:"Students clean the classroom every day.",zh:"学生们每天打扫教室。",why:"students 是动作的执行者，使用主动语态。"},{en:"The classroom is cleaned every day.",zh:"教室每天被打扫。",why:"classroom 承受动作，用 is cleaned。"}]}
    ],
    quiz:[
      {q:"He ___ basketball every Sunday.",options:["play","plays","is play"],answer:"plays",explain:"every Sunday 是一般现在时；he 后动词加 s。"},
      {q:"Look! The cat ___ under the chair.",options:["sleeps","slept","is sleeping"],answer:"is sleeping",explain:"Look 提示动作正在发生。"},
      {q:"We ___ the museum yesterday.",options:["visit","visited","will visit"],answer:"visited",explain:"yesterday 提示使用一般过去时。"},
      {q:"The windows ___ cleaned every week.",options:["is","are","am"],answer:"are",explain:"windows 是复数，被动结构用 are cleaned。"},
      {q:"My mother and I ___ happy.",options:["am","is","are"],answer:"are",explain:"and 连接两个人，主语是复数。"}
    ]
  },
  {
    id:"prepositions", icon:"🧭", title:"介词和固定搭配", subtitle:"把时间、地点和动作关系说准确",
    intro:"介词像小路标，告诉我们人和事物在什么时间、什么位置，以及动作朝哪个方向。固定搭配要整组记忆。",
    sections:[
      {title:"时间介词 at / on / in",rule:"at 接具体时刻；on 接具体某一天或日期；in 接较长的时间段，也可表示多久以后。",points:["at seven o'clock","on Monday / on May 1st","in July / in 2026 / in the morning"],examples:[{en:"We get up at seven o'clock.",zh:"我们七点起床。",why:"seven o'clock 是具体时刻，用 at。"},{en:"My birthday is in August.",zh:"我的生日在八月。",why:"August 是月份，月份前用 in。"}]},
      {title:"地点介词 in / on / at",rule:"in 表示在内部或较大范围；on 表示接触表面；at 表示一个地点或位置点。",points:["in the room / in China","on the desk / on the wall","at school / at the bus stop"],examples:[{en:"The keys are on the table.",zh:"钥匙在桌上。",why:"钥匙和桌面接触，用 on。"},{en:"She is waiting at the bus stop.",zh:"她正在公交站等候。",why:"bus stop 被看作一个地点，用 at。"}]},
      {title:"方向与固定搭配",rule:"to 表示朝向；from 表示来源；with 表示和、用；for 表示为了、给。很多动词与介词要整组记。",points:["go to school / come from Fujian","listen to、look at、wait for","be good at、be afraid of、play with"],examples:[{en:"Please listen to the teacher.",zh:"请听老师讲。",why:"listen 后表示听的对象时固定搭配 to。"},{en:"Mia is good at English.",zh:"米娅擅长英语。",why:"be good at 表示“擅长”，要整组记忆。"}]}
    ],
    quiz:[
      {q:"The class starts ___ eight o'clock.",options:["at","on","in"],answer:"at",explain:"具体时刻前用 at。"},
      {q:"We have English ___ Monday.",options:["at","on","in"],answer:"on",explain:"具体星期前用 on。"},
      {q:"The picture is ___ the wall.",options:["in","on","at"],answer:"on",explain:"图画贴在墙面上，用 on。"},
      {q:"Please wait ___ me.",options:["to","for","of"],answer:"for",explain:"wait for 是“等待”的固定搭配。"}
    ]
  },
  {
    id:"pronouns", icon:"👥", title:"代词", subtitle:"不重复名字，也要说清是谁的",
    intro:"代词代替名词，让句子更自然。先判断它在句中是“做动作的人”“承受动作的人”，还是表示“谁的”。",
    sections:[
      {title:"人称代词：主格与宾格",rule:"主格放在动词前做主语；宾格放在动词或介词后做宾语。",points:["I/me，we/us","he/him，she/her，they/them","You help me. / I help you."],examples:[{en:"She helps me with English.",zh:"她帮助我学习英语。",why:"she 做动作，用主格；me 接受帮助，用宾格。"},{en:"Please come with us.",zh:"请和我们一起来。",why:"介词 with 后用宾格 us。"}]},
      {title:"物主代词：谁的",rule:"形容词性物主代词后必须接名词；名词性物主代词本身就等于“某人的东西”，后面不能再接名词。",points:["my book / mine","your bag / yours","his、her/hers、our/ours、their/theirs"],examples:[{en:"This is my pencil. That one is yours.",zh:"这是我的铅笔。那支是你的。",why:"my 后接 pencil；yours 后不再接名词。"},{en:"Their classroom is bigger than ours.",zh:"他们的教室比我们的更大。",why:"their 后接 classroom；ours 代替 our classroom。"}]},
      {title:"指示、疑问和不定代词",rule:"this/that 指单数，these/those 指复数；who/what/which 用来提问；someone、anything 等表示不确定的人或物。",points:["this book / these books","Who is she? / Which is yours?","something 常用于肯定句；anything 常用于疑问、否定句"],examples:[{en:"These are my new shoes.",zh:"这些是我的新鞋。",why:"shoes 是复数，近处用 these。"},{en:"Is there anything in the box?",zh:"盒子里有东西吗？",why:"一般疑问句中表示“任何东西”常用 anything。"}]}
    ],
    quiz:[
      {q:"___ am a student.",options:["Me","I","My"],answer:"I",explain:"句首作主语用主格 I。"},
      {q:"Please give the book to ___.",options:["he","his","him"],answer:"him",explain:"介词 to 后用宾格 him。"},
      {q:"This is her bag. That bag is ___.",options:["her","hers","she"],answer:"hers",explain:"后面没有名词，用名词性物主代词 hers。"},
      {q:"___ apples are very sweet.",options:["This","These","That"],answer:"These",explain:"apples 是复数，要用 these 或 those。"}
    ]
  },
  {
    id:"adjectives", icon:"🎨", title:"形容词和副词", subtitle:"一个修饰名词，一个说明动作",
    intro:"形容词描述人或事物；副词常说明动作怎样发生。比较时还要选择比较级或最高级。",
    sections:[
      {title:"形容词放在哪里",rule:"形容词常放在名词前，或放在 be、look、feel、sound 等系动词后。形容词没有单复数变化。",points:["a beautiful flower","The flower is beautiful.","two beautiful flowers（beautiful 不加 s）"],examples:[{en:"She has a small red bag.",zh:"她有一个红色的小书包。",why:"small 和 red 都修饰名词 bag，放在 bag 前。"},{en:"The soup smells good.",zh:"汤闻起来很香。",why:"smells 是系动词，后面用形容词 good。"}]},
      {title:"副词说明动作",rule:"副词常修饰动词、形容词或另一个副词。许多方式副词由形容词加 -ly 构成，但 fast、hard 等形式不变。",points:["speak slowly：慢慢地说","very happy：非常开心","run fast：跑得快（不是 fastly）"],examples:[{en:"Please speak slowly.",zh:"请慢慢说。",why:"slowly 修饰动作 speak，说明说的方式。"},{en:"He works hard every day.",zh:"他每天努力学习。",why:"hard 在这里是副词，修饰 works；不能写 hardly 来表示努力。"}]},
      {title:"比较级和最高级",rule:"两者比较用比较级，常跟 than；三者或更多中选“最……”用最高级，前面通常加 the。",points:["tall → taller → tallest","beautiful → more beautiful → most beautiful","good → better → best"],examples:[{en:"Tom is taller than Ben.",zh:"汤姆比本高。",why:"比较两个人，用 taller than。"},{en:"Lucy is the tallest girl in her class.",zh:"露西是班里最高的女生。",why:"在全班多人中比较，用 the tallest。"}]}
    ],
    quiz:[
      {q:"The little dog is very ___.",options:["cute","cutely","cuteness"],answer:"cute",explain:"is 后描述小狗的特点，用形容词 cute。"},
      {q:"Please read the sentence ___.",options:["careful","carefully","care"],answer:"carefully",explain:"修饰动作 read，用副词 carefully。"},
      {q:"My bag is ___ than yours.",options:["heavy","heavier","heaviest"],answer:"heavier",explain:"句中有 than，使用比较级 heavier。"},
      {q:"This is ___ book in the library.",options:["the oldest","older","old"],answer:"the oldest",explain:"在整个图书馆范围内比较，使用最高级。"}
    ]
  },
  {
    id:"sentence", icon:"🧱", title:"句子结构和语序", subtitle:"像搭积木一样按位置造句",
    intro:"英语主要依靠固定语序表达意思。先搭主干“谁 + 做什么”，再加入时间、地点和方式。",
    sections:[
      {title:"陈述句主干",rule:"最基础语序是主语 + 谓语；需要时再加宾语或表语。地点和时间通常放在后面。",points:["主语 + be + 表语：She is happy.","主语 + 动词 + 宾语：I like music.","谁 + 做什么 + 在哪里 + 什么时候"],examples:[{en:"We play football in the park after school.",zh:"放学后我们在公园踢足球。",why:"主干是 We play football，地点和时间放在后面。"},{en:"My father is a doctor.",zh:"我爸爸是一名医生。",why:"is 连接主语和表语 a doctor。"}]},
      {title:"一般疑问句",rule:"有 be 动词或情态动词时把它提前；一般现在或过去的实义动词句用 do/does/did 开头，后面的实义动词回到原形。",points:["Are you ready?","Can she swim?","Does he like apples?（like 不加 s）"],examples:[{en:"Does Lily go to school by bus?",zh:"莉莉乘公交车上学吗？",why:"Lily 是第三人称单数，用 Does；go 保持原形。"},{en:"Are they reading now?",zh:"他们现在正在读书吗？",why:"把陈述句中的 are 提到主语 they 前。"}]},
      {title:"特殊疑问句与否定句",rule:"特殊疑问词放句首，后面接一般疑问句语序；否定句在 be/情态动词后加 not，实义动词句用 don't/doesn't/didn't。",points:["Where do you live?","She isn't tired.","He doesn't play tennis."],examples:[{en:"What do you do after school?",zh:"你放学后做什么？",why:"What 放句首，后面用 do you do 的疑问语序。"},{en:"He doesn't like rainy days.",zh:"他不喜欢雨天。",why:"he 的一般现在时否定用 doesn't，like 回到原形。"}]}
    ],
    quiz:[
      {q:"选择正确语序。",options:["I every day read English.","I read English every day.","Read I English every day."],answer:"I read English every day.",explain:"主干 I read English 在前，时间 every day 放后。"},
      {q:"___ she like music?",options:["Do","Does","Is"],answer:"Does",explain:"she 是第三人称单数，实义动词疑问句用 Does。"},
      {q:"Where ___ your father work?",options:["do","does","is"],answer:"does",explain:"特殊疑问词后接一般疑问句语序；father 是单数。"},
      {q:"He ___ play computer games on weekdays.",options:["don't","doesn't","isn't"],answer:"doesn't",explain:"实义动词 play 的第三人称单数否定用 doesn't。"}
    ]
  },
  {
    id:"clauses", icon:"🔗", title:"从句和连接词", subtitle:"把两个意思有逻辑地连起来",
    intro:"连接词说明两个意思之间的关系。先说清是并列、转折、原因、结果、条件还是时间，再选择连接词。",
    sections:[
      {title:"and / but / or / so",rule:"and 表示增加；but 表示转折；or 表示选择；so 表示结果。连接的两部分在结构上应当相当。",points:["A and B：A 和 B","A, but B：A，但是 B","A, so B：因为 A 产生结果 B"],examples:[{en:"I like apples and bananas.",zh:"我喜欢苹果和香蕉。",why:"and 连接两个并列的名词。"},{en:"It was raining, so we stayed at home.",zh:"当时在下雨，所以我们待在家里。",why:"前面是原因，so 引出结果。"}]},
      {title:"because / if / when",rule:"because 引出原因；if 引出条件；when 引出时间。这些词带领的部分不能单独表达完整逻辑，需要和主句一起理解。",points:["I smile because I am happy.","If it rains, we will stay home.","Call me when you arrive."],examples:[{en:"I wear a coat because it is cold.",zh:"因为天气冷，所以我穿外套。",why:"because 后说明穿外套的原因。"},{en:"If you practise every day, you will improve.",zh:"如果你每天练习，你就会进步。",why:"if 引出条件；主句说明条件成立后的结果。"}]},
      {title:"宾语从句和定语从句入门",rule:"宾语从句放在动词后，说明“知道/认为/说什么”；定语从句放在名词后，说明“是哪一个人或物”。入门阶段先学会识别和读懂。",points:["I know that he is kind.","Can you tell me where she lives?","The boy who is running is Tom."],examples:[{en:"I think that English is interesting.",zh:"我认为英语很有趣。",why:"that 后的完整句子是 think 的内容。"},{en:"The girl who has a red bag is Mia.",zh:"背红书包的女孩是米娅。",why:"who has a red bag 说明是哪一个 girl。"}]}
    ],
    quiz:[
      {q:"I am tired, ___ I finish my homework.",options:["but","because","or"],answer:"but",explain:"虽然累仍完成作业，两个意思形成转折。"},
      {q:"We stayed inside ___ it was raining.",options:["because","and","or"],answer:"because",explain:"下雨是待在室内的原因。"},
      {q:"___ you study hard, you will make progress.",options:["If","But","So"],answer:"If",explain:"努力学习是取得进步的条件。"},
      {q:"I know ___ she is a good student.",options:["that","so","or"],answer:"that",explain:"that 引出 know 的具体内容。"}
    ]
  }
];
