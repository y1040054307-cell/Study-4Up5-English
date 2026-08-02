(() => {
  "use strict";

  const STORE = "sunny-english-longterm-v3";
  const ACTIVE_PROFILE_STORE = `${STORE}:active-profile`;
  const USER_PROFILES = [
    {id:"astronaut",name:"小宇航员",icon:"🚀",color:"#4f78d8",motto:"向着英语星球出发"},
    {id:"captain",name:"智慧船长",icon:"⚓",color:"#238c86",motto:"掌好方向，坚持前进"},
    {id:"lightning",name:"闪电博士",icon:"⚡",color:"#c58216",motto:"快速思考，认真理解"},
    {id:"alo",name:"阿洛探险家",icon:"🧭",color:"#d26745",motto:"每天发现一个新知识"},
    {id:"mia",name:"米娅小博士",icon:"🔬",color:"#8c5bc4",motto:"观察、练习、找到规律"}
  ];
  const validProfileId = id => USER_PROFILES.some(profile=>profile.id===id) ? id : USER_PROFILES[0].id;
  const profileStoreKey = id => `${STORE}:profile:${validProfileId(id)}`;
  let activeUserId = validProfileId(localStorage.getItem(ACTIVE_PROFILE_STORE));
  const TEST_MODE = false;
  const TEST_BALANCE = 99999;
  let persistedEconomy = {suns:0,foods:0};
  const iso = (date = new Date()) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`;
  const defaultState = { bookId:"g4a", unitIndex:0, stage:"overview", suns:0, foods:0, mastered:[], weak:[], phonicsDone:[], stageDone:[], dailyDone:[], bonuses:[], signIns:[], activity:{}, quiz:{correct:0,total:0}, beginner:{letters:[]}, grammar:{completed:[],quizBest:{},attempts:{}}, abilities:{diagnostic:null,phonicsCompleted:[],listeningCompleted:[],speakingCompleted:[],rewarded:[]}, papers:{scores:{},attempts:{}}, plant:{selected:"sunflower",owned:["sunflower"],progress:{sunflower:{energy:70,xp:0,lastFed:""}},lastDate:iso()}, pets:{selected:"",owned:[],progress:{}} };
  const load = (profileId=activeUserId) => { try {
    const key=profileStoreKey(profileId);
    if(!localStorage.getItem(key)&&profileId===USER_PROFILES[0].id&&localStorage.getItem(STORE))localStorage.setItem(key,localStorage.getItem(STORE));
    const raw=JSON.parse(localStorage.getItem(key)||"{}");
    persistedEconomy={suns:Number(raw.suns||0),foods:Number(raw.foods||0)};
    const legacyPlant=raw.plant||{},plant={...defaultState.plant,...legacyPlant,owned:[...new Set(["sunflower",...(legacyPlant.owned||[])])],progress:{...defaultState.plant.progress,...(legacyPlant.progress||{})}};
    if(!legacyPlant.progress)plant.progress.sunflower={energy:Number(legacyPlant.energy??70),xp:Number(legacyPlant.xp??0),lastFed:""};
    const legacyPets=raw.pets||{},petKind=id=>String(id||"").startsWith("cat")?"cat":String(id||"").startsWith("dog")?"dog":String(id||"").startsWith("turtle")?"turtle":"",petProgressMerged={};
    Object.entries(legacyPets.progress||{}).forEach(([id,data])=>{const kind=petKind(id);if(!kind)return;const old=petProgressMerged[kind];if(!old||Number(data.xp||0)>Number(old.xp||0))petProgressMerged[kind]={...data};else old.fullness=Math.max(Number(old.fullness||0),Number(data.fullness||0));});
    const petOwned=[...new Set((legacyPets.owned||[]).map(petKind).filter(Boolean))],selectedKind=petKind(legacyPets.selected),petSelected=petOwned.includes(selectedKind)?selectedKind:petOwned[0]||"";
    const pets={...defaultState.pets,...legacyPets,selected:petSelected,owned:petOwned,progress:petProgressMerged};
    const rawBeginner=raw.beginner||{},beginner={...defaultState.beginner,...rawBeginner,letters:[...(rawBeginner.letters||[])]};
    const rawGrammar=raw.grammar||{},grammar={...defaultState.grammar,...rawGrammar,completed:[...(rawGrammar.completed||[])],quizBest:{...(rawGrammar.quizBest||{})},attempts:{...(rawGrammar.attempts||{})}};
    const rawAbilities=raw.abilities||{},abilities={...defaultState.abilities,...rawAbilities,phonicsCompleted:[...(rawAbilities.phonicsCompleted||[])],listeningCompleted:[...(rawAbilities.listeningCompleted||[])],speakingCompleted:[...(rawAbilities.speakingCompleted||[])],rewarded:[...(rawAbilities.rewarded||[])]};
    const rawPapers=raw.papers||{},papers={...defaultState.papers,...rawPapers,scores:{...(rawPapers.scores||{})},attempts:{...(rawPapers.attempts||{})}};
    return {...defaultState,...raw,suns:TEST_MODE?TEST_BALANCE:persistedEconomy.suns,foods:TEST_MODE?TEST_BALANCE:persistedEconomy.foods,plant,pets,quiz:{...defaultState.quiz,...(raw.quiz||{})},beginner,grammar,abilities,papers};
  } catch { persistedEconomy={suns:0,foods:0};const fresh=structuredClone(defaultState);fresh.suns=TEST_MODE?TEST_BALANCE:0;fresh.foods=TEST_MODE?TEST_BALANCE:0;return fresh; } };
  let state = load(activeUserId);
  let selectedGrade = Number(state.bookId[1]) || 4;
  let selectedTerm = state.bookId.endsWith("a") ? "上册" : "下册";
  let memoryFilter = "current";
  let memoryIndex = 0;
  let memoryFlipped = false;
  let phonicsGroup = "short";
  let beginnerTab = "alphabet";
  let outlineGrade = selectedGrade;
  let outlineTerm = selectedTerm;
  let dictionarySection = "primary";
  let dictionaryLetter = "all";
  let dictionaryLimit = 48;
  let dictionaryQuery = "";
  let marketTab = "plants";
  let quizAnswers = {};
  let grammarTopicId = (window.GRAMMAR_TOPICS||[])[0]?.id || "articles";
  let grammarAnswers = {};
  let grammarResult = null;
  let abilityTab = "diagnostic";
  let diagnosticAnswers = {};
  let diagnosticPage = 0;
  let abilityPhonicsLesson = "short-vowels";
  let abilityPhonicsAnswers = {};
  let abilityPhonicsChecked = false;
  let abilityListeningAnswers = {};
  let abilityListeningChecked = false;
  let speakingRecording = null;
  let speakingRecorder = null;
  let speakingStream = null;
  let speakingChunks = [];
  let speakingRecordedKeys = new Set();
  let paperGrade = selectedGrade;
  let paperTerm = selectedTerm;
  let paperUnitIndex = state.unitIndex;
  let paperActiveId = "";
  let paperAnswers = {};
  let paperChecked = false;
  let toastTimer;
  let petActionTimer;
  let deferredInstallPrompt = null;
  let activeAudio = null;
  let activeLocalSource = null;
  let localAudioContext = null;
  const localAudioPartBlobs = new Map();
  let localAudioPackReady = false;
  let phonemeAudioContext = null;
  let phonemeAudioPackBlob = null;
  let localAudioAbort = null;
  let speechRequestId = 0;
  let networkVoiceNoticeShown = false;
  const AUDIO_PACK_CACHE = "sunny-audio-pack-v31";

  const $ = (id) => document.getElementById(id);
  const esc = (v) => String(v).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;");
  const bookNow = () => COURSE_BOOKS.find(b => b.id === state.bookId) || COURSE_BOOKS[2];
  const unitNow = () => bookNow().units[state.unitIndex] || bookNow().units[0];
  const unitKey = () => unitNow().id;
  const todayKey = (task) => task==="review"?`${iso()}:global:review`:`${iso()}:${unitKey()}:${task}`;
  const stageKey = (stage) => `${unitKey()}:${stage}`;
  const stages = [
    {id:"overview",icon:"🎯",name:"理解目标"},{id:"words",icon:"🔤",name:"必备单词"},{id:"patterns",icon:"🧩",name:"重点句型"},
    {id:"dialogue",icon:"🗣️",name:"情境对话"},{id:"reading",icon:"📖",name:"原创阅读"},{id:"practice",icon:"✅",name:"分层练习"}
  ];
  const tasks = [
    {id:"understand",icon:"👀",title:"看懂本单元目标",detail:"读学习目标和情境说明，先明白要学会做什么",stage:"overview"},
    {id:"vocab",icon:"🔤",title:"点读必备单词",detail:"听、读、看意思，至少主动回忆6个词",stage:"words"},
    {id:"speak",icon:"🗣️",title:"跟读并替换句型",detail:"每个重点句型读3遍，再换一个关键词",stage:"patterns"},
    {id:"read",icon:"📖",title:"完成对话或阅读",detail:"先读英文猜意思，再看中文理解线索",stage:"reading"},
    {id:"quiz",icon:"🎯",title:"完成20题分层练习",detail:"依次练词义、拼写、句式与语境，错题自动进入复习清单",stage:"practice"},
    {id:"zh2en",icon:"✍️",title:"看中文写英文",detail:"完成本单元5个词的英文默写，注意拼写",stage:"words"},
    {id:"en2zh",icon:"🀄",title:"看英文写中文",detail:"写出5个英文单词的准确中文意思",stage:"words"},
    {id:"review",icon:"🔁",title:"复习过往单词",detail:"只从已经学过的单元中随机抽取，不提前出现未来词汇",stage:"review"}
  ];
  const BEGINNER_TABS = [
    {id:"alphabet",icon:"🔠",name:"字母认识表",tip:"26个大小写字母"},
    {id:"sounds",icon:"👂",name:"字母与声音",tip:"分清名称和常见音"},
    {id:"phonics",icon:"🧩",name:"自然拼读起步",tip:"从声音拼成单词"},
    {id:"ipa",icon:"👄",name:"音标课堂",tip:"48个标准音素"}
  ];
  const ALPHABET_LESSONS = [
    ["A","a","/eɪ/","apple","苹果","a 在 apple 中常发 /æ/"],["B","b","/biː/","book","书","b 常发 /b/"],["C","c","/siː/","cat","猫","c 在 cat 中发 /k/"],["D","d","/diː/","dog","狗","d 常发 /d/"],["E","e","/iː/","egg","鸡蛋","e 在 egg 中常发 /e/"],["F","f","/ef/","fish","鱼","f 常发 /f/"],["G","g","/dʒiː/","girl","女孩","g 在 girl 中发 /g/"],["H","h","/eɪtʃ/","hand","手","h 常发 /h/"],["I","i","/aɪ/","ink","墨水","i 在 ink 中常发 /ɪ/"],["J","j","/dʒeɪ/","juice","果汁","j 常发 /dʒ/"],["K","k","/keɪ/","kite","风筝","k 常发 /k/"],["L","l","/el/","lion","狮子","l 常发 /l/"],["M","m","/em/","milk","牛奶","m 常发 /m/"],["N","n","/en/","nose","鼻子","n 常发 /n/"],["O","o","/əʊ/","orange","橙子","o 在 orange 中常发 /ɒ/"],["P","p","/piː/","pen","钢笔","p 常发 /p/"],["Q","q","/kjuː/","queen","女王","qu 常发 /kw/"],["R","r","/ɑː/","red","红色","r 常发 /r/"],["S","s","/es/","sun","太阳","s 常发 /s/"],["T","t","/tiː/","tiger","老虎","t 常发 /t/"],["U","u","/juː/","umbrella","雨伞","u 在 umbrella 中常发 /ʌ/"],["V","v","/viː/","van","货车","v 常发 /v/"],["W","w","/ˈdʌbəljuː/","water","水","w 常发 /w/"],["X","x","/eks/","box","盒子","x 在 box 中常发 /ks/"],["Y","y","/waɪ/","yellow","黄色","y 在 yellow 中发 /j/"],["Z","z","/zed/","zoo","动物园","z 常发 /z/"]
  ];
  const PAPER_TYPES = [
    {id:"unit-basic",icon:"🌱",kind:"本单元专项",title:"单元基础卷",level:"基础",minutes:30,desc:"按听力、词汇、句型和综合理解四部分检查本单元基础。"},
    {id:"unit-advanced",icon:"🚀",kind:"本单元专项",title:"单元提高卷",level:"提高",minutes:40,desc:"加入近形词、近音词、同词不同词形和相似句型，必须真正理解后才能选择。"},
    {id:"review-a",icon:"🔁",kind:"过往知识累计",title:"累计复习 A 卷",level:"巩固",minutes:35,desc:"随机回顾当前单元之前学过的词汇与句型。"},
    {id:"review-b",icon:"🧭",kind:"过往知识累计",title:"累计复习 B 卷",level:"综合",minutes:40,desc:"换一组题序和干扰项，检查是否真正记牢。"},
    {id:"review-c",icon:"🏆",kind:"过往知识累计",title:"累计挑战 C 卷",level:"挑战",minutes:40,desc:"把过往知识放进完整句子，训练理解与运用。"},
    {id:"fujian-combo",icon:"🏫",kind:"公开真题题型",title:"福建学校真题组合卷",level:"实战",minutes:45,desc:"参考福建多地学校公开卷结构，重新编写30道同类型题。"}
  ];
  const PUBLIC_PAPER_REFERENCES = [
    {area:"莆田",school:"麟峰小学",label:"六年级上学期期中阶段性评价",url:"https://zy.21cnjy.com/23958482"},
    {area:"泉州",school:"台商投资区小学",label:"五年级下学期期末质量抽测",url:"https://zy.21cnjy.com/23325412"},
    {area:"福州",school:"福州市小学",label:"2024年小升初英语试卷",url:"https://zy.21cnjy.com/21382786"},
    {area:"漳州",school:"诏安县桥东片区",label:"三年级上学期过程性评价",url:"https://www.xxsj.org/sjdetail/2551.html"},
    {area:"福建",school:"闽教版公开资源",label:"三年级上册Unit 3练习题",url:"https://www.tthaoke.com/shijuan_44837.html"}
  ];

  const ABILITY_TABS = [
    {id:"diagnostic",icon:"🧭",name:"入学诊断",tip:"找到合适起点"},
    {id:"natural-phonics",icon:"🔡",name:"自然拼读",tip:"看词会读、听音会拼"},
    {id:"listening",icon:"🎧",name:"听力训练",tip:"只听声音判断意思"},
    {id:"speaking",icon:"🎙️",name:"口语录音",tip:"听—录—回放—改进"}
  ];
  const DIAGNOSTIC_QUESTIONS = [
    {area:"词汇",grade:3,q:"‘书包’的英文是？",options:["bag","book","desk"],answer:"bag",why:"bag 表示书包；book 是书，desk 是课桌。"},
    {area:"句型",grade:3,q:"— How are you? — ____",options:["I'm fine.","I'm nine.","It's red."],answer:"I'm fine.",why:"How are you? 询问身体或近况，应回答 I'm fine. 等。"},
    {area:"语法",grade:3,q:"This is ____ apple.",options:["a","an","the"],answer:"an",why:"apple 以元音音素开头，表示一个苹果用 an。"},
    {area:"词汇",grade:4,q:"选择正确的复数：two ____",options:["box","boxs","boxes"],answer:"boxes",why:"box 以 x 结尾，复数通常加 -es。"},
    {area:"语序",grade:4,q:"哪一句语序正确？",options:["Where the book is?","Where is the book?","The book where is?"],answer:"Where is the book?",why:"特殊疑问句常用“疑问词 + be动词 + 主语”。"},
    {area:"阅读",grade:4,q:"‘It is rainy. Take an umbrella.’ 最合适的意思是？",options:["天晴了，戴帽子。","下雨了，带上雨伞。","天冷了，穿外套。"],answer:"下雨了，带上雨伞。",why:"rainy 是下雨的，umbrella 是雨伞。"},
    {area:"动词",grade:5,q:"She ____ breakfast at seven every day.",options:["have","has","having"],answer:"has",why:"一般现在时中 she 是第三人称单数，have 变为 has。"},
    {area:"时态",grade:5,q:"Yesterday I ____ to the park.",options:["go","went","will go"],answer:"went",why:"yesterday 表示过去，go 的过去式是 went。"},
    {area:"介词",grade:5,q:"We have English ____ Monday.",options:["in","on","at"],answer:"on",why:"具体星期前使用介词 on。"},
    {area:"句型",grade:6,q:"— What did you see? — I ____ two pandas.",options:["see","saw","seen"],answer:"saw",why:"问过去发生的事，回答中的 see 要用过去式 saw。"},
    {area:"连接词",grade:6,q:"I stayed home ____ it was raining.",options:["because","but","or"],answer:"because",why:"后半句说明待在家的原因，所以用 because。"},
    {area:"阅读",grade:6,q:"‘Tom is taller than Ben, but Ben runs faster.’ 哪项正确？",options:["Tom 更高，Ben 跑得更快。","Ben 更高，Tom 跑得更快。","两人一样高。"],answer:"Tom 更高，Ben 跑得更快。",why:"taller than 表示比……高；faster 表示更快。"},
    {area:"字母",grade:3,q:"哪个字母排在 G 后面？",options:["F","H","J"],answer:"H",why:"英文字母顺序是 F、G、H、I、J。"},
    {area:"词汇",grade:3,q:"‘红色’的英文是？",options:["red","read","blue"],answer:"red",why:"red 表示红色；read 表示阅读。"},
    {area:"句型",grade:3,q:"— What's your name? — ____",options:["My name is Lily.","I'm ten.","It's a cat."],answer:"My name is Lily.",why:"What's your name? 询问姓名，应回答 My name is... 或 I'm...。"},
    {area:"词汇",grade:4,q:"library 的意思是？",options:["图书馆","操场","教室"],answer:"图书馆",why:"library 是可以借阅和阅读书籍的图书馆。"},
    {area:"代词",grade:4,q:"Amy is my sister. ____ is nine.",options:["He","She","It"],answer:"She",why:"Amy 是女孩，后一句用代词 she 指代。"},
    {area:"介词",grade:4,q:"The ball is ____ the desk.（球在桌子下面）",options:["on","under","in"],answer:"under",why:"under 表示在……下面。"},
    {area:"动词",grade:4,q:"We can ____ English songs.",options:["sing","sings","singing"],answer:"sing",why:"情态动词 can 后使用动词原形。"},
    {area:"阅读",grade:4,q:"‘Lily has a blue coat.’ Lily 有什么？",options:["一件蓝色外套","一条蓝色裙子","一顶蓝色帽子"],answer:"一件蓝色外套",why:"blue coat 表示蓝色外套。"},
    {area:"词形",grade:5,q:"study 的第三人称单数是？",options:["studys","studies","studying"],answer:"studies",why:"辅音字母加 y 结尾，变 y 为 i 再加 -es。"},
    {area:"时态",grade:5,q:"Listen! The birds ____.",options:["sing","sang","are singing"],answer:"are singing",why:"Listen! 提示动作正在发生，应使用现在进行时。"},
    {area:"比较级",grade:5,q:"An elephant is ____ than a rabbit.",options:["big","bigger","biggest"],answer:"bigger",why:"than 前通常使用比较级；big 的比较级双写 g 加 -er。"},
    {area:"搭配",grade:5,q:"选择正确搭配：____ photos",options:["take","make","do"],answer:"take",why:"take photos 是“拍照”的固定搭配。"},
    {area:"阅读",grade:5,q:"‘Ben usually walks to school, but today he goes by bus.’ 今天 Ben 怎样上学？",options:["步行","坐公交车","骑自行车"],answer:"坐公交车",why:"today he goes by bus 表示今天他坐公交车。"},
    {area:"时态",grade:6,q:"We ____ Xiamen next Sunday.",options:["visit","visited","will visit"],answer:"will visit",why:"next Sunday 表示将来，使用 will + 动词原形。"},
    {area:"主谓一致",grade:6,q:"Neither Tom nor his friends ____ late.",options:["is","are","am"],answer:"are",why:"就近看 his friends 是复数，因此使用 are。"},
    {area:"从句",grade:6,q:"I know the girl ____ is reading under the tree.",options:["who","where","when"],answer:"who",why:"先行词是人，关系词在从句中作主语，可用 who。"},
    {area:"语序",grade:6,q:"选择正确句子。",options:["Could you tell me where the library is?","Could you tell me where is the library?","Where the library is could you tell me?"],answer:"Could you tell me where the library is?",why:"宾语从句使用陈述语序：where + 主语 + be动词。"},
    {area:"阅读",grade:6,q:"‘Although it was cold, the children kept playing outside.’ 哪项正确？",options:["天气冷，但孩子们继续在外面玩。","天气热，孩子们回家了。","因为下雨，孩子们停止玩耍。"],answer:"天气冷，但孩子们继续在外面玩。",why:"although 表示“虽然”，kept playing 表示继续玩。"}
  ];
  DIAGNOSTIC_QUESTIONS.sort((a,b)=>a.grade-b.grade);
  const NATURAL_PHONICS_LESSONS = [
    {id:"short-vowels",level:"第1关",title:"短元音与 CVC 拼读",rule:"三个音依次滑读，再合成一个词。元音要短，不要拖长。",pattern:"辅音 + 短元音 + 辅音",examples:["cat","pen","sit","hot","sun"],blend:["c → a → t","/k/ → /æ/ → /t/","cat"],quiz:{q:"哪个词中的 a 发短音 /æ/？",options:["cat","cake","day"],answer:"cat",why:"cat 是 CVC 结构，a 发 /æ/；cake 和 day 中 a 发 /eɪ/。"}},
    {id:"digraphs",level:"第2关",title:"辅音字母组合",rule:"两个字母常常合起来表示一个声音，不能拆成两个字母名来读。",pattern:"sh / ch / th / wh",examples:["ship","chair","three","white"],blend:["sh → i → p","/ʃ/ → /ɪ/ → /p/","ship"],quiz:{q:"哪个词以 /ʃ/ 开头？",options:["ship","chair","three"],answer:"ship",why:"sh 常发 /ʃ/；ch 常发 /tʃ/；th 在 three 中发 /θ/。"}},
    {id:"silent-e",level:"第3关",title:"神奇的静音 e",rule:"词尾 e 通常不单独发音，却会让前面的元音读字母本身的长音。",pattern:"a-e / i-e / o-e / u-e",examples:["cake","bike","home","cute"],blend:["c-a-k → cap 的短音规律","加上词尾 e","cake /keɪk/"],quiz:{q:"哪组词体现了静音 e 改变元音？",options:["cap—cape","cat—cats","dog—dogs"],answer:"cap—cape",why:"cape 的词尾 e 不发音，使 a 从 /æ/ 变为 /eɪ/。"}},
    {id:"vowel-teams",level:"第4关",title:"元音字母组合",rule:"两个元音字母组合后常出现稳定读音，但也要留意少量特殊词。",pattern:"ee / ea / ai / ay / oa",examples:["green","read","rain","day","boat"],blend:["r → ai → n","/r/ → /eɪ/ → /n/","rain"],quiz:{q:"哪个字母组合在 boat 中常发 /əʊ/？",options:["oa","ai","ee"],answer:"oa",why:"boat 中 oa 发 /əʊ/，把 b + oa + t 合读。"}},
    {id:"r-controlled",level:"第5关",title:"r 控制元音",rule:"元音后跟 r 时，读音会发生变化。先把组合当作一个整体记。",pattern:"ar / or / er / ir / ur",examples:["car","short","her","bird","nurse"],blend:["b → ir → d","/b/ → /ɜː/ → /d/","bird"],quiz:{q:"bird 和 nurse 中间的元音最接近哪个音？",options:["/ɜː/","/æ/","/eɪ/"],answer:"/ɜː/",why:"ir 和 ur 在这两个词中都常发 /ɜː/。"}},
    {id:"syllables",level:"第6关",title:"音节与重读",rule:"多音节词先分节，再找重读音节。重读部分更清楚，弱读部分更轻。",pattern:"音节拍手 + 重读标记",examples:["teacher","banana","computer","holiday"],blend:["com · PU · ter","中间音节重读","computer"],quiz:{q:"computer 的重读音节在哪里？",options:["第1音节","第2音节","第3音节"],answer:"第2音节",why:"computer /kəmˈpjuːtə/ 中 ˈ 在第二音节前。"}}
  ];
  const NATURAL_PHONICS_DRILLS = {
    "short-vowels":[
      {q:"pen 中的 e 发哪个音？",options:["/e/","/iː/","/əʊ/"],answer:"/e/",why:"pen 是 CVC 结构，e 发短音 /e/。"},
      {q:"sit 中的 i 发哪个音？",options:["/ɪ/","/aɪ/","/iː/"],answer:"/ɪ/",why:"sit 中 i 发短促的 /ɪ/。"},
      {q:"hot 中的 o 发哪个音？",options:["/ɒ/","/əʊ/","/uː/"],answer:"/ɒ/",why:"hot 中 o 发短元音 /ɒ/。"},
      {q:"sun 中的 u 发哪个音？",options:["/ʌ/","/uː/","/ʊ/"],answer:"/ʌ/",why:"sun 中 u 常发短元音 /ʌ/。"},
      {q:"哪个词符合 CVC 结构？",options:["dog","rain","tree"],answer:"dog",why:"dog 是辅音 d + 元音 o + 辅音 g。"},
      {q:"哪个词不使用短元音规律？",options:["cake","map","bed"],answer:"cake",why:"cake 有静音 e，a 发长音 /eɪ/。"},
      {q:"把 /m/、/æ/、/p/ 合起来是？",options:["map","mop","make"],answer:"map",why:"三个音依次合成 /mæp/，拼写为 map。"}
    ],
    digraphs:[
      {q:"ship 开头的 sh 发什么音？",options:["/ʃ/","/s/","/tʃ/"],answer:"/ʃ/",why:"sh 常作为整体发 /ʃ/。"},
      {q:"chair 开头的 ch 发什么音？",options:["/tʃ/","/ʃ/","/k/"],answer:"/tʃ/",why:"chair 中 ch 发 /tʃ/。"},
      {q:"three 开头的 th 发什么音？",options:["/θ/","/ð/","/f/"],answer:"/θ/",why:"three 中 th 是清音 /θ/。"},
      {q:"this 开头的 th 发什么音？",options:["/ð/","/θ/","/d/"],answer:"/ð/",why:"this 中 th 是声带振动的 /ð/。"},
      {q:"white 中哪个组合在词首？",options:["wh","sh","ch"],answer:"wh",why:"white 以字母组合 wh 开头。"},
      {q:"哪个词含有 sh 组合？",options:["fish","thin","chip"],answer:"fish",why:"fish 结尾是 sh。"},
      {q:"哪个词以 /tʃ/ 开头？",options:["child","ship","white"],answer:"child",why:"child 的 ch 发 /tʃ/。"}
    ],
    "silent-e":[
      {q:"kit 加上词尾 e 变成？",options:["kite","kitt","keit"],answer:"kite",why:"kite 中词尾 e 不发音，使 i 发 /aɪ/。"},
      {q:"hop 加上静音 e 后是？",options:["hope","hoop","hopp"],answer:"hope",why:"hope 中 o 发字母长音 /əʊ/。"},
      {q:"cub 加上静音 e 后是？",options:["cube","cubb","cobe"],answer:"cube",why:"cube 中 u 受到词尾 e 影响。"},
      {q:"tap 与 tape 的元音有什么不同？",options:["tap短、tape长","都发短音","都发长音"],answer:"tap短、tape长",why:"tape 的词尾 e 使 a 发 /eɪ/。"},
      {q:"哪个词含静音 e？",options:["home","hot","hand"],answer:"home",why:"home 的 e 通常不单独发音。"},
      {q:"静音 e 自己通常怎样发音？",options:["不发音","发 /e/","发 /iː/"],answer:"不发音",why:"它通常不发音，但会改变前面元音的读音。"},
      {q:"哪组是短音词变长音词？",options:["rid—ride","red—read","sit—sits"],answer:"rid—ride",why:"ride 的静音 e 使 i 从短音变为 /aɪ/。"}
    ],
    "vowel-teams":[
      {q:"green 中 ee 常发什么音？",options:["/iː/","/e/","/ɪ/"],answer:"/iː/",why:"green 中 ee 发长元音 /iː/。"},
      {q:"read（读，原形）中的 ea 常发？",options:["/iː/","/æ/","/ɒ/"],answer:"/iː/",why:"read 作原形时通常读 /riːd/。"},
      {q:"rain 中 ai 常发什么音？",options:["/eɪ/","/aɪ/","/əʊ/"],answer:"/eɪ/",why:"rain 中 ai 发 /eɪ/。"},
      {q:"day 中 ay 常发什么音？",options:["/eɪ/","/aʊ/","/ɔɪ/"],answer:"/eɪ/",why:"day 中 ay 发 /eɪ/。"},
      {q:"boat 中 oa 常发什么音？",options:["/əʊ/","/ɒ/","/uː/"],answer:"/əʊ/",why:"boat 中 oa 发 /əʊ/。"},
      {q:"哪个词含 ee 组合？",options:["sheep","ship","shop"],answer:"sheep",why:"sheep 中 ee 发长音 /iː/。"},
      {q:"看见元音组合时，第一步应该？",options:["把组合当整体尝试发音","逐个读字母名","直接跳过"],answer:"把组合当整体尝试发音",why:"自然拼读先识别常见字母组合，再合成整词。"}
    ],
    "r-controlled":[
      {q:"car 中 ar 常发什么音？",options:["/ɑː/","/eə/","/ɜː/"],answer:"/ɑː/",why:"car 中 ar 常发 /ɑː/。"},
      {q:"short 中 or 常发什么音？",options:["/ɔː/","/ɒ/","/aʊ/"],answer:"/ɔː/",why:"short 中 or 常发 /ɔː/。"},
      {q:"her 中 er 的读音接近？",options:["/ɜː/","/iː/","/æ/"],answer:"/ɜː/",why:"her 中 er 发 /ɜː/。"},
      {q:"bird 中控制元音的组合是？",options:["ir","bi","rd"],answer:"ir",why:"ir 是需要整体识别的 r 控制元音组合。"},
      {q:"nurse 中的 ur 常发？",options:["/ɜː/","/uː/","/ʌ/"],answer:"/ɜː/",why:"nurse 中 ur 发 /ɜː/。"},
      {q:"哪个词中的 ar 发 /ɑː/？",options:["park","pair","pen"],answer:"park",why:"park 中 ar 发 /ɑː/。"},
      {q:"遇到 ar、or、ir 时应该怎样拼？",options:["把元音和 r 当整体","忽略 r","只读 r"],answer:"把元音和 r 当整体",why:"r 会控制前面元音的音色，应整体识别。"}
    ],
    syllables:[
      {q:"teacher 有几个音节？",options:["1个","2个","3个"],answer:"2个",why:"teacher 可分为 teach·er 两个音节。"},
      {q:"banana 有几个音节？",options:["2个","3个","4个"],answer:"3个",why:"banana 可按 ba·na·na 分为三个音节。"},
      {q:"holiday 有几个音节？",options:["2个","3个","4个"],answer:"3个",why:"holiday 通常分为 hol·i·day 三个音节。"},
      {q:"computer 有几个音节？",options:["2个","3个","4个"],answer:"3个",why:"computer 可分为 com·pu·ter 三个音节。"},
      {q:"banana 通常重读哪个音节？",options:["第1音节","第2音节","第3音节"],answer:"第2音节",why:"banana /bəˈnɑːnə/ 的第二音节重读。"},
      {q:"holiday 通常重读哪个音节？",options:["第1音节","第2音节","第3音节"],answer:"第1音节",why:"holiday /ˈhɒlədeɪ/ 的第一音节重读。"},
      {q:"遇到很长的单词，先怎样做？",options:["分音节再拼读","只猜第一个字母","每个字母都读字母名"],answer:"分音节再拼读",why:"分音节能减少一次需要处理的声音数量。"}
    ]
  };

  const PHONICS_GROUPS = {
    short:{name:"短元音",tip:"声音短而有力，不要拖长。",items:[
      ["/ɪ/","sit","/sɪt/","嘴角放松，舌尖靠下，短促发音","i, y"],["/e/","pen","/pen/","嘴自然张开，舌前部稍抬","e, ea"],["/æ/","cat","/kæt/","嘴张大，嘴角向两边展开","a"],["/ʌ/","cup","/kʌp/","嘴半张，舌头放松居中","u, o"],["/ɒ/","hot","/hɒt/","嘴唇略圆，舌位较低，短促","o"],["/ʊ/","book","/bʊk/","嘴唇轻轻收圆，声音短","oo, u"],["/ə/","about","/əˈbaʊt/","最放松的中央音，轻轻带过","a, e, o"]]},
    long:{name:"长元音",tip:"带 ː 的音要保持得更久，口型不要中途改变。",items:[
      ["/iː/","sheep","/ʃiːp/","嘴角向两边展开，舌前部抬高","ee, ea, e"],["/ɑː/","car","/kɑː/","嘴张大，舌头放低并后缩","ar, a"],["/ɔː/","ball","/bɔːl/","嘴唇收圆，舌后部抬起","or, aw, al"],["/uː/","moon","/muːn/","嘴唇收圆向前，保持长音","oo, u-e, ew"],["/ɜː/","bird","/bɜːd/","嘴唇放松，舌头居中，保持长音","ir, ur, er"]]},
    diph:{name:"双元音",tip:"一个音中口型要从第一个位置自然滑向第二个位置。",items:[
      ["/eɪ/","day","/deɪ/","从 /e/ 滑向 /ɪ/，嘴逐渐变窄","a-e, ay, ai"],["/aɪ/","bike","/baɪk/","嘴从张大滑向变窄","i-e, y, igh"],["/ɔɪ/","boy","/bɔɪ/","从圆唇滑向嘴角展开","oy, oi"],["/əʊ/","home","/həʊm/","从放松状态滑向圆唇","o-e, oa, ow"],["/aʊ/","cow","/kaʊ/","从张口滑向圆唇","ow, ou"],["/ɪə/","ear","/ɪə/","从短 /ɪ/ 滑向中央音","ear, eer"],["/eə/","hair","/heə/","从 /e/ 滑向中央音","air, are"],["/ʊə/","tour","/tʊə/","从圆唇短音滑向中央音","our, ure"]]},
    stops:{name:"爆破与摩擦音",tip:"注意清音声带不振动，浊音声带振动。手放喉咙上可以感觉。",items:[
      ["/p/","pen","/pen/","双唇闭合后送气，声带不振动","p, pp"],["/b/","bag","/bæɡ/","双唇闭合后放开，声带振动","b, bb"],["/t/","tea","/tiː/","舌尖碰上齿龈后送气","t, tt"],["/d/","dog","/dɒɡ/","舌尖碰上齿龈，声带振动","d, dd"],["/k/","cat","/kæt/","舌后部抬起再送气","c, k, ck"],["/g/","go","/ɡəʊ/","舌后部抬起，声带振动","g, gg"],["/f/","fish","/fɪʃ/","上齿轻触下唇，气流摩擦","f, ph"],["/v/","van","/væn/","上齿轻触下唇，声带振动","v"],["/θ/","three","/θriː/","舌尖轻放上下齿间，送气不振动","th"],["/ð/","this","/ðɪs/","舌尖轻放齿间，声带振动","th"],["/s/","sun","/sʌn/","舌尖靠近齿龈，窄缝送气","s, c"],["/z/","zoo","/zuː/","口型像 /s/，声带振动","z, s"]]},
    consonants:{name:"其他辅音",tip:"先把音发清楚，再放进单词；不要在辅音后面多加“呃”。",items:[
      ["/ʃ/","ship","/ʃɪp/","嘴唇略圆，舌面靠近上腭送气","sh"],["/ʒ/","vision","/ˈvɪʒən/","口型像 /ʃ/，声带振动","s, si"],["/h/","hat","/hæt/","张嘴自然呼气，不摩擦喉咙","h"],["/tʃ/","chair","/tʃeə/","先堵住气流再摩擦放出","ch, tch"],["/dʒ/","jump","/dʒʌmp/","像 /tʃ/，但声带振动","j, g, dge"],["/m/","map","/mæp/","双唇闭合，声音从鼻腔出来","m, mm"],["/n/","nose","/nəʊz/","舌尖顶齿龈，声音走鼻腔","n, nn"],["/ŋ/","sing","/sɪŋ/","舌后部抬起，声音走鼻腔","ng"],["/l/","leg","/leɡ/","舌尖顶上齿龈，两侧出气","l, ll"],["/r/","red","/red/","舌尖略卷但不碰上腭","r, rr"],["/j/","yes","/jes/","舌前部抬高，快速滑向元音","y"],["/w/","we","/wiː/","双唇收圆后迅速展开","w, wh"]]}
    ,clusters:{name:"教材组合音",tip:"参考国内常用48音标表学习。这四组在现代语音学中也常按辅音组合来分析。",items:[
      ["/tr/","tree","/triː/","先发 /t/，舌尖迅速后移并连到 /r/，中间不要加元音","tr"],["/dr/","dress","/dres/","先发浊音 /d/，立即连到 /r/，声带保持振动","dr"],["/ts/","cats","/kæts/","/t/ 和 /s/ 紧密相连，一次送气完成","ts"],["/dz/","beds","/bedz/","/d/ 和 /z/ 紧密相连，声带振动","ds, dz"]]}
  };
  const MINIMAL_PAIRS=[["ship","/ʃɪp/","sheep","/ʃiːp/"],["full","/fʊl/","fool","/fuːl/"],["bed","/bed/","bad","/bæd/"],["fan","/fæn/","van","/væn/"],["three","/θriː/","tree","/triː/"],["rice","/raɪs/","rise","/raɪz/"]];
  const BASIC_MEANINGS={
    a:"一个",an:"一个",the:"这个；这些",i:"我","i'm":"我是",my:"我的",you:"你；你们",your:"你的；你们的",he:"他",his:"他的",she:"她",her:"她的",it:"它","it's":"它是",we:"我们",our:"我们的",they:"他们；它们","they're":"他们是；它们是",this:"这个",that:"那个",these:"这些",those:"那些",
    am:"是",is:"是",are:"是",was:"过去是",were:"过去是",be:"是",have:"有",has:"有",had:"过去有",do:"做；助动词",does:"做；助动词",did:"过去做；助动词",can:"能够",will:"将要",would:"会；愿意",may:"可以",must:"必须",
    what:"什么","what's":"是什么",who:"谁",where:"哪里",when:"什么时候",why:"为什么",how:"怎样",which:"哪一个",many:"许多",much:"许多",old:"……岁；年老的",color:"颜色",
    and:"和",or:"或者",but:"但是",because:"因为",so:"所以",if:"如果",of:"……的",to:"到；向；去",from:"从",for:"为了；给",with:"和；用",about:"关于",at:"在",in:"在……里面",on:"在……上面；在某天",by:"在旁边；通过",under:"在……下面",behind:"在……后面",near:"在……附近",before:"在……之前",after:"在……之后",
    hello:"你好",hi:"你好",yes:"是的",no:"不",not:"不",please:"请",thanks:"谢谢",thank:"感谢",sorry:"对不起",sure:"当然",great:"很好",again:"再一次",together:"一起",here:"这里",there:"那里",now:"现在",today:"今天",tomorrow:"明天",yesterday:"昨天",very:"非常",too:"也；太",also:"也",
    say:"说",tell:"告诉",talk:"谈论",speak:"说；讲",read:"读",write:"写",listen:"听",look:"看",see:"看见",learn:"学习",practise:"练习",practice:"练习",use:"使用",like:"喜欢",love:"喜爱",want:"想要",need:"需要",go:"去",went:"去了",come:"来",came:"来了",get:"得到",make:"制作",made:"制作了",play:"玩",played:"玩了",help:"帮助",work:"工作；学习",live:"居住",meet:"遇见",met:"遇见了",know:"知道",think:"想；认为",find:"找到",show:"展示",give:"给",take:"拿；带",eat:"吃",drink:"喝",wear:"穿",put:"放",
    good:"好的",fine:"很好",new:"新的",little:"小的",big:"大的",happy:"开心的",interesting:"有趣的",beautiful:"美丽的",true:"真实的",kind:"友善的",again:"再一次",school:"学校",classroom:"教室",friend:"朋友",name:"名字",number:"数字；号码",time:"时间",day:"一天；白天",year:"年",people:"人们"
  };
  const WORD_COMMON_MEANINGS={
    light:["灯；灯光","光线","轻的","浅色的","点燃"],in:["在……里面","进入；在内","在家；在场","流行的"],right:["右边","正确的","权利","恰好"],left:["左边","离开了","剩下的"],fine:["很好","健康的","精细的","罚款"],kind:["亲切的；善良的","种类"],well:["好；很好地","健康的","井"],watch:["观看","手表","留意；看守"],play:["玩；参加运动","演奏","戏剧","播放"],call:["打电话","呼叫；称呼","叫声"],change:["零钱","改变；变化","更换"],fit:["合身","适合","健康的"],mean:["意思是","意味着","吝啬的；刻薄的"],orange:["橙色","橙子"],fish:["鱼；鱼肉","捕鱼"],water:["水","给……浇水"],work:["工作","起作用","作品"],rest:["休息","其余部分"],plan:["计划","平面图"],trip:["旅行","绊倒"],train:["火车","训练"],book:["书","预订"],class:["班级","课程","等级；种类"],school:["学校","学派；学校全体师生"],read:["阅读","读懂；显示"],run:["跑步","经营","运行"],draw:["画画","拉；拖","平局"],wear:["穿；戴","磨损"],meet:["遇见；会面","满足；符合"],please:["请","使高兴；使满意"],name:["名字","命名"],friend:["朋友","支持者"],family:["家庭；家人","家族"],love:["爱；喜爱","热爱的人或事"],like:["喜欢","像；如同"],day:["一天","白天","时期"],color:["颜色","给……涂色"],cold:["寒冷的","感冒","冷淡的"],warm:["温暖的","热情的","使暖和"],party:["聚会","政党","一方；团体"],gift:["礼物","天赋"],time:["时间","次数","为……计时"],homework:["家庭作业","准备工作"],clean:["干净的","打扫","完全地"],flower:["花","开花"],visit:["拜访；参观","访问；逗留"],stay:["停留","保持","住宿"],message:["留言；消息","要旨"],busy:["忙碌的","占线的","热闹的"],number:["数字；号码","数量","编号"],short:["矮的；短的","缺少的","短裤（shorts）"],strong:["强壮的","强烈的","擅长的"],hard:["努力地","困难的","坚硬的"],star:["星星","明星","主演"],present:["礼物","现在","出席的","展示"],card:["卡片","纸牌","证件"],spring:["春天","泉水","弹簧","跳起"],season:["季节","给食物调味"],park:["公园","停车"],show:["展示","演出","表明"],matter:["问题；事情","要紧；有关系"],dream:["梦想","做梦"],future:["未来","将来的"],memory:["记忆；回忆","存储器"],miss:["想念","错过","未击中"],wish:["祝愿；愿望","希望"],help:["帮助","有帮助的人或事"],carry:["搬运；携带","传播；延伸"],cook:["厨师","做饭"],dance:["跳舞","舞蹈"],smile:["微笑","笑容"],exercise:["锻炼","练习；习题"],race:["赛跑；比赛","种族"],game:["游戏；比赛","猎物"],team:["队","合作"],floor:["地板","楼层"],view:["景色","观点","观看"],date:["日期","约会","枣"],space:["太空","空间；空白"],earth:["地球","泥土"],moon:["月球；月亮","一个月的时间（文学用法）"],sun:["太阳","晒太阳"],rock:["岩石","摇动","摇滚乐"]
  };
  const PAPER_EXTRA_MEANINGS={
    "let's":"让我们",all:"全部；所有",another:"另一个",any:"任何；一些",as:"作为；像",away:"离开",back:"回来；后面",bed:"床",best:"最好的",both:"两者都",chess:"国际象棋",computer:"计算机",cousin:"堂（表）兄弟姐妹",different:"不同的",down:"向下",during:"在……期间",each:"每一个",early:"早；早的",else:"其他",every:"每一个",first:"第一；首先",football:"足球",friendly:"友好的；亲切的",got:"得到；到达",into:"进入",just:"正好；只是",more:"更多",most:"最多；大多数",only:"仅仅；唯一的",other:"其他的",out:"向外",really:"真正地",room:"房间",same:"相同的",sentence:"句子",small:"小的",some:"一些",something:"某事",than:"比",them:"他们；它们（宾格）",then:"然后；那时",thing:"事情；东西",three:"三",two:"二",unit:"单元",up:"向上",word:"单词","didn't":"没有；did not","doesn't":"不；does not","don't":"不；do not","can't":"不能","won't":"不会","could":"能够；可以","should":"应该"
  };
  const paperTextKey=text=>String(text||"").trim().replace(/[“”]/g,'"').replace(/[’]/g,"'").replace(/\s+/g," ").replace(/[.!?]+$/g,"").toLowerCase();
  const PAPER_LEXICON=new Map(),PAPER_SENTENCE_MEANINGS=new Map();
  Object.entries(BASIC_MEANINGS).forEach(([word,meaning])=>PAPER_LEXICON.set(word,meaning));
  Object.entries(PAPER_EXTRA_MEANINGS).forEach(([word,meaning])=>PAPER_LEXICON.set(word,meaning));
  Object.entries(WORD_COMMON_MEANINGS).forEach(([word,meanings])=>PAPER_LEXICON.set(word,meanings[0]));
  (window.GAOKAO_WORDS||[]).forEach(item=>{if(!PAPER_LEXICON.has(item.word.toLowerCase()))PAPER_LEXICON.set(item.word.toLowerCase(),item.meaning);});
  COURSE_BOOKS.forEach(book=>book.units.forEach(unit=>{unit.core.forEach(word=>{const key=word.word.toLowerCase();if(!PAPER_LEXICON.has(key))PAPER_LEXICON.set(key,word.meaning);PAPER_SENTENCE_MEANINGS.set(paperTextKey(word.example),word.exampleZh);});unit.patterns.forEach(pattern=>PAPER_SENTENCE_MEANINGS.set(paperTextKey(pattern.en),pattern.zh));}));
  function paperTokenMeaning(token){
    const clean=String(token).toLowerCase().replace(/[’]/g,"'"),direct=PAPER_LEXICON.get(clean);if(direct)return direct;
    const candidates=[];
    if(clean.endsWith("'s"))candidates.push(clean.slice(0,-2));
    if(clean.endsWith("ies"))candidates.push(clean.slice(0,-3)+"y");
    if(clean.endsWith("ied"))candidates.push(clean.slice(0,-3)+"y");
    if(clean.endsWith("ing"))candidates.push(clean.slice(0,-3),clean.slice(0,-3)+"e");
    if(clean.endsWith("ed"))candidates.push(clean.slice(0,-2),clean.slice(0,-1));
    if(clean.endsWith("es"))candidates.push(clean.slice(0,-2),clean.slice(0,-1));
    if(clean.endsWith("s"))candidates.push(clean.slice(0,-1));
    for(const candidate of candidates){const meaning=PAPER_LEXICON.get(candidate);if(meaning)return`${meaning}（${token}为词形变化）`;}
    if(/^[A-Z]/.test(token))return"人名、地名或专有名称";
    return"结合本句语境理解";
  }
  function paperExactMeaning(text){const key=paperTextKey(text);return PAPER_SENTENCE_MEANINGS.get(key)||PAPER_LEXICON.get(key)||"";}
  function paperGlossaryMarkup(text,title="逐词中文意思"){
    const tokens=String(text||"").match(/[A-Za-z]+(?:['’][A-Za-z]+)?/g)||[],unique=[];tokens.forEach(token=>{if(!unique.some(item=>item.toLowerCase()===token.toLowerCase()))unique.push(token);});if(!unique.length)return"";
    const whole=paperExactMeaning(text),wholeMarkup=whole?`<p><b>整体意思</b><span>${esc(String(text).trim())}：${esc(whole)}</span></p>`:"";
    return `<div class="paper-word-glossary"><strong>${esc(title)}</strong>${wholeMarkup}<div>${unique.map(token=>`<span><b>${esc(token)}</b><em>${esc(paperTokenMeaning(token))}</em></span>`).join("")}</div></div>`;
  }
  function paperAnnotatedTextMarkup(text){
    const source=String(text||""),regex=/[A-Za-z]+(?:['’][A-Za-z]+)?/g,parts=[];let last=0,match;
    while((match=regex.exec(source))){parts.push(esc(source.slice(last,match.index)));parts.push(`<span class="paper-inline-word"><b>${esc(match[0])}</b><small>${esc(paperTokenMeaning(match[0]))}</small></span>`);last=match.index+match[0].length;}
    parts.push(esc(source.slice(last)));return parts.join("");
  }
  const WORD_PROFILE_OVERRIDES={
    light:{pos:"名词 / 形容词 / 动词",forms:"名词单数 light；复数 lights；形容词无单复数"},in:{pos:"介词 / 副词 / 形容词",forms:"无单复数变化"},right:{pos:"名词 / 形容词 / 副词",forms:"名词单数 right；复数 rights"},left:{pos:"名词 / 形容词 / 副词 / leave的过去式",forms:"名词单数 left；复数 lefts（少用）"},kind:{pos:"形容词 / 名词",forms:"名词单数 kind；复数 kinds"},watch:{pos:"动词 / 名词",forms:"名词单数 watch；复数 watches；动词三单 watches"},play:{pos:"动词 / 名词",forms:"名词单数 play；复数 plays；动词三单 plays"},call:{pos:"动词 / 名词",forms:"名词单数 call；复数 calls；动词三单 calls"},change:{pos:"动词 / 名词",forms:"名词单数 change；复数 changes；动词三单 changes"},fit:{pos:"动词 / 形容词",forms:"无名词单复数；动词三单 fits"},orange:{pos:"名词 / 形容词",forms:"名词单数 orange；复数 oranges"},fish:{pos:"名词 / 动词",forms:"名词单数 fish；复数 fish（常用）/ fishes（种类）"},water:{pos:"不可数名词 / 动词",forms:"通常无复数；动词三单 waters"},work:{pos:"不可数名词 / 动词",forms:"表示工作时通常无复数；动词三单 works"},rest:{pos:"名词 / 动词",forms:"名词单数 rest；复数 rests；动词三单 rests"},plan:{pos:"名词 / 动词",forms:"名词单数 plan；复数 plans；动词三单 plans"},train:{pos:"名词 / 动词",forms:"名词单数 train；复数 trains；动词三单 trains"},book:{pos:"名词 / 动词",forms:"名词单数 book；复数 books；动词三单 books"},class:{pos:"名词",forms:"单数 class；复数 classes"},present:{pos:"名词 / 形容词 / 动词",forms:"名词单数 present；复数 presents"},spring:{pos:"名词 / 动词",forms:"名词单数 spring；复数 springs"},park:{pos:"名词 / 动词",forms:"名词单数 park；复数 parks；动词三单 parks"},show:{pos:"动词 / 名词",forms:"名词单数 show；复数 shows；动词三单 shows"},matter:{pos:"名词 / 动词",forms:"名词单数 matter；复数 matters；动词三单 matters"},dream:{pos:"名词 / 动词",forms:"名词单数 dream；复数 dreams；动词三单 dreams"},miss:{pos:"动词 / 名词",forms:"动词三单 misses；名词 Miss 用于未婚女性称谓"},wish:{pos:"名词 / 动词",forms:"名词单数 wish；复数 wishes；动词三单 wishes"},help:{pos:"名词 / 动词",forms:"作“帮助”时通常不可数；动词三单 helps"},cook:{pos:"名词 / 动词",forms:"名词单数 cook；复数 cooks；动词三单 cooks"},dance:{pos:"名词 / 动词",forms:"名词单数 dance；复数 dances；动词三单 dances"},exercise:{pos:"名词 / 动词",forms:"名词单数 exercise；复数 exercises；动词三单 exercises"},race:{pos:"名词 / 动词",forms:"名词单数 race；复数 races；动词三单 races"},floor:{pos:"名词",forms:"单数 floor；复数 floors"},date:{pos:"名词 / 动词",forms:"名词单数 date；复数 dates；动词三单 dates"},view:{pos:"名词 / 动词",forms:"名词单数 view；复数 views；动词三单 views"},space:{pos:"名词",forms:"表示空间时可数或不可数；复数 spaces"}
  };
  const PHONEME_VOICE={"/ɪ/":"ih","/e/":"eh","/æ/":"aah","/ʌ/":"uh","/ɒ/":"aw","/ʊ/":"uuh","/ə/":"uh","/iː/":"eee","/ɑː/":"ahh","/ɔː/":"aw","/uː/":"ooo","/ɜː/":"err","/eɪ/":"ay","/aɪ/":"eye","/ɔɪ/":"oy","/əʊ/":"oh","/aʊ/":"ow","/ɪə/":"ear","/eə/":"air","/ʊə/":"oor","/p/":"puh","/b/":"buh","/t/":"tuh","/d/":"duh","/k/":"kuh","/g/":"guh","/f/":"fff","/v/":"vvv","/θ/":"thh","/ð/":"thuh","/s/":"sss","/z/":"zzz","/ʃ/":"shh","/ʒ/":"zhh","/h/":"hhh","/tʃ/":"ch","/dʒ/":"juh","/m/":"mmm","/n/":"nnn","/ŋ/":"ng","/l/":"lll","/r/":"rrr","/j/":"yuh","/w/":"wuh"};
  const XDF_PHONEME_AUDIO={
    "/iː/":"496fa8c5b185e9d155d7.mp3","/ɪ/":"9eeb45ac15980f053465.mp3","/e/":"51f575eab8eb20b5fbf7.mp3","/æ/":"0d692636a009ea99b9f9.mp3","/ɜː/":"2b2c11bd1dcf81f786f0.mp3","/ə/":"04c02a21344cc0750a68.mp3","/ʌ/":"1c0775f0ef22273a7e85.mp3","/uː/":"45f67d333cfcb525cd4f.mp3","/ʊ/":"ef8b714cea50701066b8.mp3","/ɔː/":"bdd75c97619e90b5035d.mp3","/ɒ/":"9bf1a8bbcfc0c68ee326.mp3","/ɑː/":"db4b962669f0c8e54737.mp3",
    "/eɪ/":"28dc047b815750a6c5ee.mp3","/aɪ/":"a83bc6c3a61e526de4ba.mp3","/ɔɪ/":"c037f2e2fa30fc2711b8.mp3","/aʊ/":"8088e9346a7f75cb9b3c.mp3","/əʊ/":"eae06d0db4f09c8f142c.mp3","/ɪə/":"6ff61b12d4e985c668ac.mp3","/eə/":"f4eac5545f36dce272b8.mp3","/ʊə/":"1c01bd93c34338ca2081.mp3",
    "/p/":"de1d50e7127182f7704d.mp3","/t/":"5df0fde0b4fd99cee219.mp3","/k/":"2d9c9b3d1ecdf33d659a.mp3","/f/":"a4209e9d9fd9709a1e76.mp3","/s/":"9b0599891bade0c04c46.mp3","/ʃ/":"c4a898ad851940132475.mp3","/θ/":"d994b922bc7ec82646ff.mp3","/h/":"fc7ee36388f605e0a8c6.mp3","/tʃ/":"a8bd1716350ce6be0735.mp3","/tr/":"4fad2aa8319f96b7034c.mp3","/ts/":"b854e5495600f691d169.mp3",
    "/b/":"f80e74ce936868ba6237.mp3","/d/":"9a351a93fddb04c95162.mp3","/g/":"9f1f33f7bd448e4b2262.mp3","/v/":"1ee6a0a833eb5f5c40b4.mp3","/z/":"21d839e770c9a38de14a.mp3","/ʒ/":"69df71ab3487efcb6bfa.mp3","/ð/":"ab9c619dfb987add2069.mp3","/r/":"b6c52369def91ab36852.mp3","/dʒ/":"70e57979284156031990.mp3","/dr/":"f981507e87b07895a224.mp3","/dz/":"a9879c494d9159bdd679.mp3","/m/":"01ef4567a1aa014ae30a.mp3","/n/":"7f9f8679b25155de6b47.mp3","/ŋ/":"9f10d5b95482af1e9815.mp3","/l/":"a4c2272a2e766194a4a1.mp3","/j/":"fe61e7decb7acb2e0d8b.mp3","/w/":"4e6d33cbf2ba6dfb91b7.mp3"
  };
  const XDF_PHONEME_BASE="https://www.xdf.cn/zhuanti/bd-phonetic-alphabet-card/";

  const save = () => { const snapshot={...state};if(TEST_MODE){snapshot.suns=persistedEconomy.suns;snapshot.foods=persistedEconomy.foods;}localStorage.setItem(profileStoreKey(activeUserId), JSON.stringify(snapshot)); renderHeader(); };
  const toast = (msg) => { const el=$("toast"); el.textContent=msg; el.classList.add("show"); clearTimeout(toastTimer); toastTimer=setTimeout(()=>el.classList.remove("show"),2200); };
  const speechChunks = text => {
    const parts=String(text||"").trim().match(/[^.!?。！？]+[.!?。！？]?/g)||[];const chunks=[];
    parts.forEach(part=>{let rest=part.trim();while(rest.length>150){let cut=rest.lastIndexOf(" ",150);if(cut<50)cut=150;chunks.push(rest.slice(0,cut));rest=rest.slice(cut).trim();}if(rest)chunks.push(rest);});
    return chunks.length?chunks:[String(text||"").trim()];
  };
  const audioKey = text => String(text||"").trim().replace(/[“”]/g,'"').replace(/[’]/g,"'").replace(/\s+/g," ").toLowerCase();
  const audioPack = () => window.LOCAL_AUDIO_PACK?.codec==="mp3"?window.LOCAL_AUDIO_PACK:null;
  const audioPackParts = pack => Array.isArray(pack?.parts)&&pack.parts.length?pack.parts:[pack?.url?{url:pack.url,bytes:pack.bytes}:null].filter(Boolean);
  async function localAudioBytes(entry){
    const pack=audioPack(),multipart=Array.isArray(pack?.parts)&&entry?.length>=3,partIndex=multipart?Number(entry[0]):0,start=Number(entry?.[multipart?1:0]),length=Number(entry?.[multipart?2:1]),part=audioPackParts(pack)[partIndex];
    if(!pack||!part?.url||!length)throw new Error("missing-local-audio");
    const memoryBlob=localAudioPartBlobs.get(part.url);if(memoryBlob)return new Uint8Array(await memoryBlob.slice(start,start+length).arrayBuffer());
    if("caches" in window){
      const cache=await caches.open(AUDIO_PACK_CACHE),stored=await cache.match(part.url);
      if(stored){const blob=await stored.blob();localAudioPartBlobs.set(part.url,blob);return new Uint8Array(await blob.slice(start,start+length).arrayBuffer());}
    }
    localAudioAbort?.abort();localAudioAbort=new AbortController();
    const response=await fetch(part.url,{headers:{Range:`bytes=${start}-${start+length-1}`},cache:"no-store",signal:localAudioAbort.signal});
    if(!response.ok)throw new Error(`local-audio-${response.status}`);
    const buffer=await response.arrayBuffer();
    if(response.status===206)return new Uint8Array(buffer);
    const blob=new Blob([buffer],{type:"application/octet-stream"});localAudioPartBlobs.set(part.url,blob);return new Uint8Array(await blob.slice(start,start+length).arrayBuffer());
  }
  function playLocalVoice(text,rate,requestId,fallback){
    const pack=audioPack(),entry=pack?.entries?.[audioKey(text)];if(!entry)return false;
    try{
      const AudioContextClass=window.AudioContext||window.webkitAudioContext;if(!AudioContextClass)return false;
      if(!localAudioContext)localAudioContext=pack.sampleRate?new AudioContextClass({sampleRate:pack.sampleRate}):new AudioContextClass();
      localAudioContext.resume?.();
    }catch{return false;}
    (async()=>{
      try{
        const bytes=await localAudioBytes(entry);if(requestId!==speechRequestId)return;
        let buffer;
        if(pack.codec==="mp3")buffer=await localAudioContext.decodeAudioData(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength));
        else{buffer=localAudioContext.createBuffer(1,bytes.length,pack.sampleRate);const channel=buffer.getChannelData(0);for(let i=0;i<bytes.length;i++)channel[i]=(bytes[i]-128)/128;}
        const source=localAudioContext.createBufferSource();source.buffer=buffer;source.playbackRate.value=Math.max(.92,Math.min(1.06,rate+.2));source.connect(localAudioContext.destination);activeLocalSource=source;
        source.onended=()=>{if(activeLocalSource===source)activeLocalSource=null;};source.start(0);
      }catch(error){if(error?.name!=="AbortError"&&requestId===speechRequestId)fallback();}
    })();
    return true;
  }
  const voicePlayer = () => {
    let player=$("voicePlayer");
    if(!player){player=document.createElement("audio");player.id="voicePlayer";player.hidden=true;player.preload="auto";player.setAttribute("playsinline","");document.body.appendChild(player);}
    player.referrerPolicy="no-referrer";
    return player;
  };
  function stopVoice(){
    speechRequestId+=1;
    try{window.speechSynthesis?.cancel();}catch{}
    localAudioAbort?.abort();localAudioAbort=null;
    if(activeLocalSource){try{activeLocalSource.stop();}catch{}activeLocalSource=null;}
    if(activeAudio){activeAudio.onended=null;activeAudio.onerror=null;activeAudio.pause();activeAudio.removeAttribute("src");try{activeAudio.load();}catch{}activeAudio=null;}
  }
  function playDeviceVoice(content,rate,requestId,allowNetworkFallback=true){
    if(!("speechSynthesis" in window)||typeof SpeechSynthesisUtterance==="undefined"){
      if(allowNetworkFallback)playNetworkVoice(content,rate,requestId,false);else if(!playLocalVoice(content,rate,requestId,()=>toast("语音暂时无法播放，请检查网络后重试"))&&requestId===speechRequestId)toast("语音暂时无法播放，请检查网络后重试");
      return;
    }
    try{
      const utterance=new SpeechSynthesisUtterance(content),voices=window.speechSynthesis.getVoices?.()||[];
      utterance.lang="en-US";utterance.rate=rate;utterance.pitch=1;utterance.voice=voices.find(voice=>voice.lang==="en-US")||voices.find(voice=>String(voice.lang).startsWith("en"))||null;
      let started=false,fellBack=false;
      const fallback=()=>{if(fellBack||started||requestId!==speechRequestId)return;fellBack=true;if(allowNetworkFallback)playNetworkVoice(content,rate,requestId,false);else if(!playLocalVoice(content,rate,requestId,()=>toast("语音暂时无法播放，请检查网络后重试")))toast("语音暂时无法播放，请检查网络后重试");};
      utterance.onstart=()=>{started=true};
      utterance.onerror=event=>{if(["canceled","interrupted"].includes(event.error))return;fallback();};
      window.speechSynthesis.resume?.();window.speechSynthesis.speak(utterance);
      setTimeout(()=>{if(!started&&!window.speechSynthesis.speaking&&!window.speechSynthesis.pending)fallback();},1200);
    }catch{if(allowNetworkFallback)playNetworkVoice(content,rate,requestId,false);else if(!playLocalVoice(content,rate,requestId,()=>toast("语音暂时无法播放，请检查网络后重试"))&&requestId===speechRequestId)toast("语音暂时无法播放，请检查网络后重试");}
  }
  function playNetworkVoice(text,rate,requestId,allowDeviceFallback=true){
    const chunks=speechChunks(text),player=voicePlayer();let index=0;
    activeAudio=player;
    if(!networkVoiceNoticeShown){networkVoiceNoticeShown=true;toast("正在使用自然人声发音");}
    const playNext=()=>{
      if(requestId!==speechRequestId)return;
      if(index>=chunks.length)return;
      const chunk=chunks[index],plain=chunk.replace(/[^A-Za-z0-9' -]/g," ").replace(/\s+/g," ").trim()||chunk;
      const encoded=encodeURIComponent(chunk),plainEncoded=encodeURIComponent(plain);
      const sources=/\s/.test(plain)?[
        `https://fanyi.baidu.com/gettts?lan=en&text=${encoded}&spd=3&source=web`,
        `https://dict.youdao.com/dictvoice?audio=${plainEncoded}&type=2`
      ]:[
        `https://dict.youdao.com/dictvoice?audio=${plainEncoded}&type=2`,
        `https://fanyi.baidu.com/gettts?lan=en&text=${encoded}&spd=3&source=web`
      ];
      let sourceIndex=0;
      const trySource=()=>{
        if(requestId!==speechRequestId)return;
        if(sourceIndex>=sources.length){if(allowDeviceFallback)playDeviceVoice(text,rate,requestId,false);else toast("语音暂时无法播放，请检查网络后重试");return;}
        let sourceSettled=false;
        const failSource=error=>{
          if(sourceSettled||requestId!==speechRequestId)return;
          sourceSettled=true;
          if(error?.name==="NotAllowedError"){toast("请再点击一次播放按钮，允许浏览器播放声音");return;}
          sourceIndex+=1;trySource();
        };
        player.onended=()=>{if(requestId!==speechRequestId)return;sourceSettled=true;index+=1;playNext();};
        player.onerror=()=>failSource();
        player.pause();player.src=sources[sourceIndex];player.playbackRate=Math.max(.7,Math.min(1.05,rate+.12));player.load();
        const started=player.play();if(started?.catch)started.catch(failSource);
      };
      trySource();
    };
    playNext();
  }
  function speak(text,rate=.78){
    const content=String(text||"").trim();if(!content)return;stopVoice();const requestId=speechRequestId;
    if(!playLocalVoice(content,rate,requestId,()=>playNetworkVoice(content,rate,requestId,true)))playNetworkVoice(content,rate,requestId,true);
  }
  async function phonemeAudioBytes(entry){
    const pack=window.PHONEM_AUDIO_PACK,start=Number(entry?.[0]),length=Number(entry?.[1]);if(!pack||!length)throw new Error("missing-standard-phoneme");
    if(pack.codec!=="mp3")throw new Error("legacy-mechanical-phoneme-disabled");
    if(!phonemeAudioPackBlob&&"caches" in window){const stored=await caches.match(pack.url);if(stored)phonemeAudioPackBlob=await stored.blob();}
    if(!phonemeAudioPackBlob){const response=await fetch(pack.url,{cache:"force-cache"});if(!response.ok)throw new Error(`phoneme-audio-${response.status}`);if("caches" in window){const cache=await caches.open(AUDIO_PACK_CACHE);await cache.put(pack.url,response.clone());}phonemeAudioPackBlob=await response.blob();}
    return new Uint8Array(await phonemeAudioPackBlob.slice(start,start+length).arrayBuffer());
  }
  function playLocalPhoneme(symbol,requestId){
    const pack=window.PHONEM_AUDIO_PACK,entry=pack?.entries?.[symbol];if(!entry){if(requestId===speechRequestId)toast("标准音素录音暂未加载，请刷新后重试");return;}
    (async()=>{try{
      const bytes=await phonemeAudioBytes(entry);if(requestId!==speechRequestId)return;
      let buffer;
      if(pack.codec==="mp3")buffer=await phonemeAudioContext.decodeAudioData(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength));
      else{const samples=Math.floor(bytes.length/2),view=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);buffer=phonemeAudioContext.createBuffer(1,samples,pack.sampleRate);const channel=buffer.getChannelData(0);for(let i=0;i<samples;i++)channel[i]=view.getInt16(i*2,true)/32768;}
      const source=phonemeAudioContext.createBufferSource();source.buffer=buffer;source.connect(phonemeAudioContext.destination);activeLocalSource=source;source.onended=()=>{if(activeLocalSource===source)activeLocalSource=null;};source.start(0);
    }catch(error){if(error?.name!=="AbortError"&&requestId===speechRequestId)toast("音素录音加载失败，请刷新后重试");}})();
  }
  function speakPhoneme(symbol){
    const pack=window.PHONEM_AUDIO_PACK;stopVoice();const requestId=speechRequestId;
    try{const AudioContextClass=window.AudioContext||window.webkitAudioContext;if(AudioContextClass){if(!phonemeAudioContext)phonemeAudioContext=new AudioContextClass({sampleRate:pack?.sampleRate||16000});phonemeAudioContext.resume?.();}}catch{}
    const file=XDF_PHONEME_AUDIO[symbol];if(!file||!phonemeAudioContext){playLocalPhoneme(symbol,requestId);return;}
    const player=voicePlayer();let settled=false;activeAudio=player;
    const fallback=()=>{if(settled||requestId!==speechRequestId)return;settled=true;player.pause();player.removeAttribute("src");playLocalPhoneme(symbol,requestId);};
    player.onended=()=>{settled=true;if(activeAudio===player)activeAudio=null;};player.onerror=fallback;player.src=XDF_PHONEME_BASE+file;player.playbackRate=1;player.load();const started=player.play();if(started?.catch)started.catch(fallback);
  }
  const daysBetween = (a,b) => Math.floor((new Date(`${b}T00:00:00`)-new Date(`${a}T00:00:00`))/86400000);
  const plantProgress = (id=state.plant.selected) => {if(!state.plant.progress[id])state.plant.progress[id]={energy:70,xp:0,lastFed:""};return state.plant.progress[id];};
  const petProgress = (id=state.pets.selected) => {if(!state.pets.progress[id])state.pets.progress[id]={fullness:60,xp:0,lastFed:""};return state.pets.progress[id];};
  const carePlant = () => { const n=daysBetween(state.plant.lastDate,iso()); if(n>0){ const progress=plantProgress();progress.energy=Math.max(0,progress.energy-n*5);state.plant.lastDate=iso();save(); } };
  const activity = (amount=1) => { state.activity[iso()] = (state.activity[iso()]||0)+amount; };
  const reward = (amount,msg,food=0) => { state.suns += amount;state.foods+=food;activity();save();toast(`☀️ ${msg}，获得 ${amount} 个小太阳${food?`和 ${food} 份粮食`:""}`); };
  const activeTasks = () => tasks.filter(task=>task.id!=="review"||pastLearnedWords().length>0);
  const dailyComplete = () => activeTasks().filter(t=>state.dailyDone.includes(todayKey(t.id))).length;
  const completedUnits = () => COURSE_BOOKS.flatMap(b=>b.units).filter(u=>stages.every(s=>state.stageDone.includes(`${u.id}:${s.id}`))).length;
  const allWords = () => COURSE_BOOKS.flatMap(b=>b.units.flatMap(u=>u.core.map(w=>({...w,unitId:u.id,unitTitle:u.title}))));
  const pastLearnedWords = () => {
    const learned=allWords().filter(item=>{const key=`${item.unitId}:${item.word}`;return state.stageDone.includes(`${item.unitId}:words`)||state.mastered.includes(key)||state.weak.includes(key);}),unique=new Map();
    learned.forEach(item=>{const key=item.word.toLowerCase();if(!unique.has(key))unique.set(key,item);});
    return [...unique.values()];
  };

  function renderHeader(){
    const profile=USER_PROFILES.find(item=>item.id===activeUserId)||USER_PROFILES[0];
    $("activeProfileIcon").textContent=profile.icon;
    $("activeProfileName").textContent=profile.name;
    $("profileButton").style.setProperty("--profile-color",profile.color);
    $("topSuns").textContent=state.suns;
    $("topFoods").textContent=state.foods;
    $("topStreak").textContent=streakCount();
    $("testModeBadge").hidden=!TEST_MODE;
  }
  function profileSummary(profile){
    if(profile.id===activeUserId)return {steps:state.stageDone.length,words:state.mastered.length,plants:state.plant.owned.length,pets:state.pets.owned.length};
    try{
      const key=profileStoreKey(profile.id),legacy=profile.id===USER_PROFILES[0].id?localStorage.getItem(STORE):null;
      const raw=JSON.parse(localStorage.getItem(key)||legacy||"{}");
      return {steps:(raw.stageDone||[]).length,words:(raw.mastered||[]).length,plants:Math.max(1,raw.plant?.owned?.length||0),pets:(raw.pets?.owned||[]).length};
    }catch{return {steps:0,words:0,plants:1,pets:0};}
  }
  function renderProfileDialog(){
    $("profileGrid").innerHTML=USER_PROFILES.map(profile=>{const summary=profileSummary(profile),active=profile.id===activeUserId;return `<button class="profile-card ${active?"active":""}" data-profile-id="${profile.id}" style="--profile-color:${profile.color}"><span>${profile.icon}</span><div><small>${active?"正在使用":"独立学习档案"}</small><h3>${profile.name}</h3><p>${profile.motto}</p><div><em>📚 ${summary.steps}步</em><em>🔤 ${summary.words}词</em><em>🌱 ${summary.plants}</em><em>🐾 ${summary.pets}</em></div></div><b>${active?"✓ 当前身份":"切换 →"}</b></button>`;}).join("");
  }
  function openProfileDialog(){renderProfileDialog();const dialog=$("profileDialog");dialog.showModal?.();dialog.classList.add("open");}
  function closeProfileDialog(){const dialog=$("profileDialog");dialog.close?.();dialog.classList.remove("open");}
  function switchProfile(profileId){
    const nextId=validProfileId(profileId);if(nextId===activeUserId){closeProfileDialog();return;}
    save();activeUserId=nextId;localStorage.setItem(ACTIVE_PROFILE_STORE,activeUserId);state=load(activeUserId);
    selectedGrade=Number(state.bookId[1])||4;selectedTerm=state.bookId.endsWith("a")?"上册":"下册";outlineGrade=selectedGrade;outlineTerm=selectedTerm;beginnerTab="alphabet";paperGrade=selectedGrade;paperTerm=selectedTerm;paperUnitIndex=state.unitIndex;paperActiveId="";paperAnswers={};paperChecked=false;memoryFilter="current";memoryIndex=0;memoryFlipped=false;quizAnswers={};grammarAnswers={};grammarResult=null;diagnosticAnswers={};diagnosticPage=0;abilityListeningAnswers={};abilityListeningChecked=false;abilityPhonicsAnswers={};abilityPhonicsChecked=false;speakingRecordedKeys=new Set();
    carePlant();carePets();renderHeader();closeProfileDialog();route("home");toast(`已切换到${USER_PROFILES.find(item=>item.id===activeUserId).name}，学习记录互不混用`);
  }
  const installedAsApp = () => window.matchMedia?.("(display-mode: standalone)").matches || window.navigator.standalone===true;
  const mobileOrTablet = () => /android|iphone|ipad|ipod|mobile|tablet/i.test(navigator.userAgent) || (navigator.platform==="MacIntel"&&navigator.maxTouchPoints>1) || window.matchMedia?.("(pointer: coarse)").matches;
  function installInstructions(){
    const ios=/iphone|ipad|ipod/i.test(navigator.userAgent)||(navigator.platform==="MacIntel"&&navigator.maxTouchPoints>1),android=/android/i.test(navigator.userAgent);
    if(deferredInstallPrompt)return {hint:"当前浏览器支持一键添加。点击下方按钮确认即可。",steps:[["1","点击“立即添加到主屏幕”"],["2","在浏览器提示中选择“安装”或“添加”"],["3","回到主屏幕，点击向阳英语图标"]]};
    if(ios)return {hint:"苹果手机或平板需要通过 Safari 的共享菜单添加。",steps:[["1","请使用 Safari 打开当前网页"],["2","点击浏览器底部或顶部的“分享”图标 □↑"],["3","向下找到并点击“添加到主屏幕”"],["4","点击右上角“添加”完成"]]};
    if(android)return {hint:"如果没有出现一键安装按钮，请使用浏览器菜单手动添加。",steps:[["1","点击浏览器右上角的 ⋮ 菜单"],["2","选择“添加到主屏幕”或“安装应用”"],["3","确认后从主屏幕打开"]]};
    return {hint:"请使用浏览器菜单把网页创建为快捷应用。",steps:[["1","打开浏览器菜单"],["2","选择“安装应用”或“创建快捷方式”"],["3","从桌面图标快速打开"]]};
  }
  function openInstallDialog(){
    const info=installInstructions();$("installDeviceHint").textContent=info.hint;$("installSteps").innerHTML=info.steps.map(item=>`<article><span>${item[0]}</span><p>${item[1]}</p></article>`).join("");$("nativeInstallButton").hidden=!deferredInstallPrompt;
    const dialog=$("appInstallDialog");dialog.showModal?.();dialog.classList.add("open");
  }
  function closeInstallDialog(){const dialog=$("appInstallDialog");dialog.close?.();dialog.classList.remove("open");}
  async function requestAppInstall(){
    if(!deferredInstallPrompt){openInstallDialog();return;}
    deferredInstallPrompt.prompt();const choice=await deferredInstallPrompt.userChoice;deferredInstallPrompt=null;
    if(choice.outcome==="accepted"){$("installCard").hidden=true;closeInstallDialog();toast("已添加向阳英语，回到主屏幕即可看到图标");}else openInstallDialog();
  }
  function setupAppInstall(){
    const card=$("installCard");card.hidden=installedAsApp()||sessionStorage.getItem(`${STORE}:hide-install`)===iso()||!mobileOrTablet();
    window.addEventListener("beforeinstallprompt",event=>{event.preventDefault();deferredInstallPrompt=event;if(!installedAsApp())card.hidden=false;});
    window.addEventListener("appinstalled",()=>{deferredInstallPrompt=null;card.hidden=true;closeInstallDialog();toast("向阳英语已成功添加到主屏幕");});
  }
  function audioPackLabel(){const pack=audioPack();return pack?`${(pack.bytes/1048576).toFixed(1)} MB · ${pack.clips} 段发音`:"本地语音包";}
  function updateAudioPackCard(message,progress=-1,ready=false){
    const status=$("audioPackStatus"),bar=$("audioPackBar"),button=$("downloadAudioPack");if(!status||!bar||!button)return;
    status.textContent=message;bar.style.width=progress<0?"0%":`${Math.max(0,Math.min(100,progress))}%`;button.textContent=ready?"✓ 已下载，可离线播放":`下载离线语音包（${audioPackLabel().split(" · ")[0]}）`;button.disabled=ready;
    $("audioPackCard").classList.toggle("ready",ready);
  }
  async function downloadAudioPack(){
    const pack=audioPack(),parts=audioPackParts(pack),button=$("downloadAudioPack");if(!pack||!parts.length||!("caches" in window))return toast("当前浏览器不支持离线语音包，请使用最新版浏览器");
    updateAudioPackCard(`准备下载：${audioPackLabel()}`,1,false);button.disabled=true;
    try{
      const cache=await caches.open(AUDIO_PACK_CACHE);let receivedTotal=0;
      for(let partIndex=0;partIndex<parts.length;partIndex+=1){
        const part=parts[partIndex],response=await fetch(part.url,{cache:"no-store"});if(!response.ok)throw new Error(`audio-pack-${response.status}`);
        let blob;
        if(response.body?.getReader){
          const reader=response.body.getReader(),chunks=[];let received=0;
          while(true){const {done,value}=await reader.read();if(done)break;chunks.push(value);received+=value.length;updateAudioPackCard(`正在下载第 ${partIndex+1}/${parts.length} 包 · ${(receivedTotal+received)/1048576|0} / ${Math.ceil(pack.bytes/1048576)} MB`,(receivedTotal+received)/pack.bytes*100,false);button.disabled=true;}
          blob=new Blob(chunks,{type:"application/octet-stream"});
        }else blob=await response.blob();
        if(part.bytes&&blob.size<part.bytes*.98)throw new Error("audio-pack-incomplete");
        await cache.put(part.url,new Response(blob,{headers:{"Content-Type":"application/octet-stream","Content-Length":String(blob.size)}}));localAudioPartBlobs.set(part.url,blob);receivedTotal+=blob.size;
      }
      const phonemePack=window.PHONEM_AUDIO_PACK;if(phonemePack?.codec==="mp3"&&phonemePack.url){const response=await fetch(phonemePack.url,{cache:"no-store"});if(!response.ok)throw new Error(`phoneme-pack-${response.status}`);await cache.put(phonemePack.url,response.clone());phonemeAudioPackBlob=await response.blob();}
      localAudioPackReady=true;
      updateAudioPackCard(`自然人声包已保存在本机：${audioPackLabel()}。断网后也能播放。`,100,true);toast("自然人声离线包下载完成");
    }catch{button.disabled=false;updateAudioPackCard("下载未完成，请连接稳定的 Wi-Fi 后重试。",0,false);toast("语音包下载失败，请稍后重试");}
  }
  async function setupAudioPack(){
    const rawPack=window.LOCAL_AUDIO_PACK,pack=audioPack();
    if(!rawPack){updateAudioPackCard("语音包索引未加载，请刷新网页。",0,false);return;}
    if(!pack){updateAudioPackCard("检测到旧版语音包，请更新网页资源后重试。",0,false);return;}
    const parts=audioPackParts(pack);$("audioPackMeta").textContent=`国内自然语音 · ${audioPackLabel()} · 可断网播放`;
    try{const cache="caches" in window?await caches.open(AUDIO_PACK_CACHE):null,stored=cache?await Promise.all(parts.map(part=>cache.match(part.url))):[];localAudioPackReady=Boolean(stored.length&&stored.every(Boolean));if(localAudioPackReady)updateAudioPackCard(`自然人声离线包已保存在本机，共 ${parts.length} 个分包。`,100,true);else updateAudioPackCard("联网时直接播放自然语音；下载后可在断网时继续学习。",0,false);}catch{localAudioPackReady=false;updateAudioPackCard("联网时直接播放自然语音；下载后可在断网时继续学习。",0,false);}
  }
  function streakCount(){
    let count=0; const d=new Date();
    for(let i=0;i<365;i+=1){ const key=iso(d); if((state.activity[key]||0)>0 || state.signIns.includes(key)) count+=1; else if(i>0) break; d.setDate(d.getDate()-1); }
    return count;
  }
  function route(view){
    document.querySelectorAll(".view").forEach(v=>v.classList.toggle("active",v.id===`view-${view}`));
    document.querySelectorAll(".main-tabs button").forEach(b=>b.classList.toggle("active",b.dataset.view===view || (view==="unit"&&b.dataset.view==="courses")));
    if(view==="home") renderHome();
    if(view==="courses") renderCourses();
    if(view==="outline") renderOutline();
    if(view==="papers") renderPapers();
    if(view==="abilities") renderAbilities();
    if(view==="unit") renderUnit();
    if(view==="today") renderToday();
    if(view==="words") renderWords();
    if(view==="dictionary") renderDictionary();
    if(view==="beginner") renderBeginner();
    if(view==="grammar") renderGrammar();
    if(view==="market") renderMarket();
    if(view==="garden") renderGarden();
    if(view==="pets") renderPets();
    if(view==="report") renderReport();
    window.scrollTo({top:0,behavior:"smooth"});
  }

  function renderHome(){
    const book=bookNow(), unit=unitNow(), done=dailyComplete(),todayTasks=activeTasks();
    $("welcomeText").textContent=`当前：${book.label} · Unit ${unit.number} ${unit.title}。今天用20—30分钟完成一个小闭环。`;
    $("todayBar").style.width=`${done/todayTasks.length*100}%`; $("todayProgressText").textContent=`今日 ${done} / ${todayTasks.length} 项`;
    $("statLessons").textContent=state.stageDone.length; $("statWords").textContent=state.mastered.length;
    $("statAccuracy").textContent=state.quiz.total?`${Math.round(state.quiz.correct/state.quiz.total*100)}%`:"—"; $("statSuns").textContent=state.suns;
    const plant=plantState(),progress=plantProgress(); $("homePlant").textContent=plant.icon; $("plantName").textContent=plant.name; $("plantHint").textContent=`活力 ${progress.energy}/100 · 必须亲手浇灌才会成长`;
    $("homeTasks").innerHTML=todayTasks.slice(0,3).map(t=>{const done=state.dailyDone.includes(todayKey(t.id));return `<button class="preview-task ${done?"done":""}" data-open-stage="${t.stage}"><span>${done?"✓":t.icon}</span><div><b>${t.title}</b><small>${t.detail}</small></div><em>${done?"已完成":"去学习 →"}</em></button>`}).join("");
    const unitDone=stages.filter(s=>state.stageDone.includes(stageKey(s.id))).length;
    $("currentCourseCard").innerHTML=`<div class="course-progress-card"><span class="course-icon">${unit.icon}</span><div class="course-main"><small>${book.label} · Unit ${unit.number}</small><h3>${unit.title} <i>${unit.zh}</i></h3><p>${unit.goal}</p><div class="thin-bar"><span style="width:${unitDone/stages.length*100}%"></span></div><small>${unitDone}/${stages.length} 个学习环节已完成</small></div><button class="primary" data-open-stage="${nextStage().id}">继续</button></div>`;
    $("homeOutlineCard").innerHTML=`<div><span>🗺️</span><div><small>LEARNING MAP · 当前知识位置</small><h2>${book.label} → Unit ${unit.number} ${esc(unit.title)}</h2><p><b>本单元重点：</b>${esc(unit.goal)}　<b>必备词：</b>${uCorePreview(unit)}　<b>核心句：</b>${esc(unit.patterns[0]?.en||"")}</p></div></div><button class="soft" data-view="outline">查看总纲与全部单元 →</button>`;
    renderHomePet();
  }

  function nextStage(){ return stages.find(s=>!state.stageDone.includes(stageKey(s.id))) || stages.at(-1); }

  function renderCourses(){
    $("gradeSwitch").innerHTML=[3,4,5,6].map(g=>`<button class="${selectedGrade===g?"active":""}" data-grade="${g}">${g}年级</button>`).join("");
    $("termSwitch").innerHTML=["上册","下册"].map(t=>`<button class="${selectedTerm===t?"active":""}" data-term="${t}">${t}</button>`).join("");
    const book=COURSE_BOOKS.find(b=>b.grade===selectedGrade&&b.term===selectedTerm);
    const done=book.units.filter(u=>stages.every(s=>state.stageDone.includes(`${u.id}:${s.id}`))).length;
    $("bookSummary").innerHTML=`<div><span>${book.edition}</span><h2>${book.label}</h2><p>${book.units.length}个主题单元 · 每单元${stages.length}步 · 原创讲解与练习</p></div><div><b>${done}/${book.units.length}</b><small>完成单元</small></div>`;
    $("unitGrid").innerHTML=book.units.map(u=>{
      const stepDone=stages.filter(s=>state.stageDone.includes(`${u.id}:${s.id}`)).length;
      const current=state.bookId===book.id&&state.unitIndex===u.number-1;
      return `<button class="unit-card ${current?"current":""}" data-unit-book="${book.id}" data-unit-index="${u.number-1}"><span class="unit-icon">${u.icon}</span><span class="unit-no">UNIT ${String(u.number).padStart(2,"0")}</span><h3>${u.title}</h3><p>${u.zh} · ${u.goal}</p><div class="unit-materials"><span>3—5天</span><span>${u.core.length}词</span><span>8句式</span><span>20题练习</span></div><div class="thin-bar"><span style="width:${stepDone/stages.length*100}%"></span></div><small>${stepDone}/${stages.length}步完成 ${current?"· 正在学习":""}</small><strong class="unit-cta">${stepDone?"继续单元教材":"进入单元教材"} →</strong></button>`;
    }).join("");
  }

  function uCorePreview(unit,limit=5){return unit.core.slice(0,limit).map(item=>`<em>${esc(item.word)}</em>`).join("、");}
  function renderOutline(){
    const book=COURSE_BOOKS.find(item=>item.grade===outlineGrade&&item.term===outlineTerm)||COURSE_BOOKS[0],completed=book.units.filter(unit=>stages.every(stage=>state.stageDone.includes(`${unit.id}:${stage.id}`))).length;
    $("outlineOverview").innerHTML=`<div class="outline-root"><span>🌳</span><small>闽教版三至六年级</small><b>英语学习知识树</b><em>8册 · 52单元</em></div><div class="outline-trunk"></div><div class="outline-grade-branches">${[3,4,5,6].map(grade=>{const books=COURSE_BOOKS.filter(item=>item.grade===grade);return `<article class="${outlineGrade===grade?"active":""}"><button data-outline-grade="${grade}"><span>${grade}</span><b>${grade}年级</b><small>${books.reduce((sum,item)=>sum+item.units.length,0)}个单元</small></button><div>${books.map(item=>`<button class="${book.id===item.id?"active":""}" data-outline-book="${item.id}">${item.term}<small>${item.units.length}单元</small></button>`).join("")}</div></article>`;}).join("")}</div>`;
    $("outlineGradeSwitch").innerHTML=[3,4,5,6].map(grade=>`<button class="${outlineGrade===grade?"active":""}" data-outline-grade="${grade}">${grade}年级</button>`).join("");
    $("outlineTermSwitch").innerHTML=["上册","下册"].map(term=>`<button class="${outlineTerm===term?"active":""}" data-outline-term="${term}">${term}</button>`).join("");
    $("outlineBookHead").innerHTML=`<div><span>${esc(book.edition)}</span><h2>${esc(book.label)}知识分支</h2><p>从 Unit 1 依次向后学习；每个单元都完成“理解—词汇—句型—对话—阅读—练习”。</p></div><aside><b>${completed}/${book.units.length}</b><small>完整单元已完成</small></aside>`;
    $("outlineUnitMap").innerHTML=book.units.map((unit,index)=>{const done=stages.filter(stage=>state.stageDone.includes(`${unit.id}:${stage.id}`)).length;return `<article class="outline-unit-card ${done===stages.length?"done":""}"><header><span>${unit.icon}</span><div><small>UNIT ${String(unit.number).padStart(2,"0")} · ${done}/${stages.length}步</small><h2>${esc(unit.title)}</h2><p>${esc(unit.zh)}</p></div></header><section><b>🎯 学习目标</b><p>${esc(unit.goal)}</p></section><section><b>🔤 必备知识词</b><p class="outline-word-list">${uCorePreview(unit,6)}</p></section><section><b>🧩 重点句型</b>${unit.patterns.slice(0,2).map(pattern=>`<p class="outline-pattern"><button data-say="${esc(pattern.en)}">🔊</button><span>${esc(pattern.en)}</span><small>${esc(pattern.zh)}</small></p>`).join("")}</section><div class="outline-volume"><span>8个句式学习</span><span>3组情境对话</span><span>3篇分级阅读</span><span>20题分层练习</span></div><footer><button class="soft" data-outline-unit="${index}" data-outline-stage="overview">查看单元导学</button><button class="primary" data-outline-unit="${index}" data-outline-stage="${done?nextUnitStage(unit):"overview"}">${done?"继续学习":"进入本单元"} →</button></footer></article>`;}).join("");
    $("outlineUnitMap").querySelectorAll("[data-say]").forEach(button=>button.onclick=()=>speak(button.dataset.say));
  }
  function nextUnitStage(unit){return stages.find(stage=>!state.stageDone.includes(`${unit.id}:${stage.id}`))?.id||"practice";}

  function paperSelection(){
    const book=COURSE_BOOKS.find(item=>item.grade===paperGrade&&item.term===paperTerm)||COURSE_BOOKS[0];
    paperUnitIndex=Math.max(0,Math.min(paperUnitIndex,book.units.length-1));
    return {book,unit:book.units[paperUnitIndex]};
  }
  const paperHash=value=>[...String(value)].reduce((sum,char)=>((sum*33)+char.charCodeAt(0))>>>0,11);
  const paperShuffle=(items,seed)=>[...items].sort((a,b)=>paperHash(`${seed}:${JSON.stringify(a)}`)-paperHash(`${seed}:${JSON.stringify(b)}`));
  const paperUnique=items=>[...new Set(items.filter(Boolean).map(item=>String(item).trim()).filter(Boolean))];
  function paperOptions(answer,pool,seed){
    const alternatives=paperShuffle(paperUnique(pool).filter(item=>item!==answer),seed).slice(0,2);
    return paperShuffle([answer,...alternatives],`${seed}:options`);
  }
  const PAPER_CONFUSABLE_GROUPS=[
    ["right","light","night"],["read","red","ride"],["there","three","these"],["where","wear","were"],["here","hear","her"],["then","than","when"],["now","know","no"],["four","for","from"],["two","too","to"],["quiet","quite"],["house","horse"],["weather","whether"],["many","much"],["some","any"],["this","these","those"],["is","are","am"],["do","does","did"],["go","goes","went","going"],["have","has","had"],["make","makes","made","making"],["play","plays","played","playing"],["look","book","cook"],["school","cool"],["class","glass"],["lunch","launch"],["dinner","winner"],["early","every"],["high","higher","highest"],["small","smell"],["friend","friendly"]
  ];
  function paperEditDistance(left,right){
    const a=paperTextKey(left),b=paperTextKey(right),row=Array.from({length:b.length+1},(_,index)=>index);for(let i=1;i<=a.length;i+=1){let previous=row[0];row[0]=i;for(let j=1;j<=b.length;j+=1){const old=row[j];row[j]=Math.min(row[j]+1,row[j-1]+1,previous+(a[i-1]===b[j-1]?0:1));previous=old;}}return row[b.length];
  }
  function paperConfusableStrings(answer,pool,seed){
    const key=paperTextKey(answer),group=PAPER_CONFUSABLE_GROUPS.find(items=>items.includes(key))||[],unique=paperUnique([...group,...pool]).filter(item=>paperTextKey(item)!==key);
    return unique.sort((left,right)=>{const lKey=paperTextKey(left),rKey=paperTextKey(right),lGroup=group.includes(lKey)?0:1,rGroup=group.includes(rKey)?0:1;if(lGroup!==rGroup)return lGroup-rGroup;const lScore=paperEditDistance(key,lKey)+Math.abs(key.length-lKey.length)*.25-(key[0]===lKey[0]?1:0),rScore=paperEditDistance(key,rKey)+Math.abs(key.length-rKey.length)*.25-(key[0]===rKey[0]?1:0);return lScore-rScore||paperHash(`${seed}:${left}`)-paperHash(`${seed}:${right}`);});
  }
  function paperAdvancedEnglishOptions(answer,pool,seed){const alternatives=paperConfusableStrings(answer,pool,seed).slice(0,2);return paperShuffle([answer,...alternatives],`${seed}:advanced-options`);}
  function paperAdvancedMeaningOptions(word,answer,wordPool,meaningPool,seed){
    const similar=paperConfusableStrings(word,wordPool.map(item=>item.word),seed).map(candidate=>paperExactMeaning(candidate)).filter(Boolean),alternatives=paperUnique([...similar,...meaningPool]).filter(item=>item!==answer).slice(0,2);return paperShuffle([answer,...alternatives],`${seed}:advanced-meanings`);
  }
  function paperAdvancedSentenceOptions(answer,pool,seed){
    const answerTokens=new Set((answer.toLowerCase().match(/[a-z]+/g)||[])),similar=paperUnique(pool).filter(item=>item!==answer).sort((left,right)=>{const score=text=>{const tokens=text.toLowerCase().match(/[a-z]+/g)||[],overlap=tokens.filter(token=>answerTokens.has(token)).length;return overlap*10-Math.abs(tokens.length-answerTokens.size)-paperEditDistance(answer,text)*.05;};return score(right)-score(left)||paperHash(`${seed}:${left}`)-paperHash(`${seed}:${right}`);}).slice(0,2);return paperShuffle([answer,...similar],`${seed}:advanced-sentences`);
  }
  function paperPreviousUnits(book,unitIndex){
    const bookIndex=COURSE_BOOKS.findIndex(item=>item.id===book.id);
    return [...COURSE_BOOKS.slice(0,bookIndex).flatMap(item=>item.units),...book.units.slice(0,unitIndex)];
  }
  function paperSourceUnits(book,unitIndex,type){
    const current=book.units[unitIndex];
    if(type.id.startsWith("unit-"))return [current];
    const previous=paperPreviousUnits(book,unitIndex);
    if(type.id==="fujian-combo")return [...previous,current];
    return previous.length?previous:[current];
  }
  function paperQuestionPool(book,unitIndex,type){
    const units=paperSourceUnits(book,unitIndex,type),allCourseWords=COURSE_BOOKS.flatMap(item=>item.units.flatMap(unit=>unit.core)),allCoursePatterns=COURSE_BOOKS.flatMap(item=>item.units.flatMap(unit=>unit.patterns));
    const seed=`${book.id}:${unitIndex}:${type.id}`,words=paperShuffle(units.flatMap(unit=>unit.core.map(item=>({...item,origin:`Unit ${unit.number} ${unit.title}`}))),`${seed}:words`),patterns=paperShuffle(units.flatMap(unit=>unit.patterns.map(item=>({...item,origin:`Unit ${unit.number} ${unit.title}`}))),`${seed}:patterns`);
    const meanings=paperUnique([...words.map(item=>item.meaning),...allCourseWords.map(item=>item.meaning)]),spellings=paperUnique([...words.map(item=>item.word),...allCourseWords.map(item=>item.word)]),patternZh=paperUnique([...patterns.map(item=>item.zh),...allCoursePatterns.map(item=>item.zh)]),patternEn=paperUnique([...patterns.map(item=>item.en),...allCoursePatterns.map(item=>item.en)]),exampleEn=paperUnique([...words.map(item=>item.example),...allCourseWords.map(item=>item.example)]),questions=[];
    const advanced=type.id==="unit-advanced",wordAt=index=>words[index%words.length],patternAt=index=>patterns[index%patterns.length],meaningOptions=(item,tag)=>advanced?paperAdvancedMeaningOptions(item.word,item.meaning,allCourseWords,meanings,tag):paperOptions(item.meaning,meanings,tag),englishOptions=(answer,pool,tag)=>advanced?paperAdvancedEnglishOptions(answer,pool,tag):paperOptions(answer,pool,tag),sentenceOptions=(answer,pool,tag)=>advanced?paperAdvancedSentenceOptions(answer,pool,tag):paperOptions(answer,pool,tag),patternMeaningOptions=(item,tag)=>{if(!advanced)return paperOptions(item.zh,patternZh,tag);const similar=paperAdvancedSentenceOptions(item.en,patternEn,tag).map(sentence=>allCoursePatterns.find(pattern=>pattern.en===sentence)?.zh||paperExactMeaning(sentence)).filter(Boolean);return paperShuffle(paperUnique([item.zh,...similar]).slice(0,3),`${tag}:zh`);};
    for(let index=0;index<5;index+=1){const item=wordAt(index);questions.push({section:"第一部分　听力辨义",type:"Listen and choose",audio:item.word,q:"点击播放按钮，选择你听到的单词意思。",options:meaningOptions(item,`${seed}:listen:${index}`),answer:item.meaning,focusWord:item.word,focusMeaning:item.meaning,why:`你听到的是 ${item.word}，常见意思是“${item.meaning}”。知识来源：${item.origin}。`});}
    for(let index=0;index<5;index+=1){const item=wordAt(index+5);questions.push({section:"第二部分　词汇基础",type:"英译中",q:`“${item.word}”在本课程中的常见意思是？`,options:meaningOptions(item,`${seed}:meaning:${index}`),answer:item.meaning,focusWord:item.word,focusMeaning:item.meaning,why:`${item.word} 的常见意思是“${item.meaning}”。知识来源：${item.origin}。`});}
    for(let index=0;index<5;index+=1){const item=wordAt(index+10);questions.push({section:"第二部分　词汇基础",type:"中译英",q:`选择“${item.meaning}”对应的英文。`,options:englishOptions(item.word,spellings,`${seed}:spelling:${index}`),answer:item.word,focusWord:item.word,focusMeaning:item.meaning,why:`“${item.meaning}”对应 ${item.word}。拼写时要注意每个字母的顺序。`});}
    for(let index=0;index<6;index+=1){const item=wordAt(index+15),escaped=String(item.word).replace(/[.*+?^${}()|[\]\\]/g,"\\$&"),completeSentence=String(item.example||`I can say ${item.word}.`),blank=completeSentence.replace(new RegExp(escaped,"i"),"____");questions.push({section:"第三部分　句型运用",type:"句子填词",q:`选择合适的单词补全句子：${blank}`,options:englishOptions(item.word,spellings,`${seed}:fill:${index}`),answer:item.word,focusWord:item.word,focusMeaning:item.meaning,completeSentence,completeMeaning:item.exampleZh||"结合完整句子理解。",why:`完整句子：${completeSentence}${item.exampleZh?`；意思：${item.exampleZh}`:""}`});}
    for(let index=0;index<3;index+=1){const item=patternAt(index);questions.push({section:"第三部分　句型运用",type:"情境表达",q:`哪一句最适合表达“${item.zh}”？`,options:sentenceOptions(item.en,patternEn,`${seed}:expression:${index}`),answer:item.en,sourceSentence:item.en,targetZh:item.zh,why:`正确表达是：${item.en}。${item.rule||"注意句子结构和语序。"}`});}
    {const item=wordAt(20),answer=item.example||`I can say ${item.word}.`;questions.push({section:"第三部分　句型运用",type:"词语运用",q:`哪一个句子正确使用了单词“${item.word}”（${item.meaning}）？`,options:sentenceOptions(answer,exampleEn,`${seed}:usage`),answer,focusWord:item.word,focusMeaning:item.meaning,sourceSentence:answer,completeMeaning:item.exampleZh||"结合完整句子理解。",why:`正确例句：${answer}${item.exampleZh?`；意思：${item.exampleZh}`:""}`});}
    for(let index=0;index<3;index+=1){const item=patternAt(index+4);questions.push({section:"第四部分　综合理解",type:"句意理解",q:`“${item.en}”的意思是？`,options:patternMeaningOptions(item,`${seed}:sentence:${index}`),answer:item.zh,sourceSentence:item.en,targetZh:item.zh,why:`句子意思：${item.zh}。${item.rule||"先抓住句中的关键词，再理解整句。"}`});}
    for(let index=0;index<2;index+=1){const item=wordAt(index+21),sentence=item.example||`I can say ${item.word}.`;questions.push({section:"第四部分　综合理解",type:"语境理解",q:`在句子“${sentence}”中，${item.word} 最接近的意思是？`,options:meaningOptions(item,`${seed}:context:${index}`),answer:item.meaning,focusWord:item.word,focusMeaning:item.meaning,sourceSentence:sentence,completeMeaning:item.exampleZh||"结合完整句子理解。",why:`在这个句子中，${item.word} 表示“${item.meaning}”。${item.exampleZh?`整句可理解为：${item.exampleZh}`:""}`});}
    if(advanced)questions.forEach(item=>{item.difficultyTag="近形近义易错";item.trap=item.type==="Listen and choose"?"干扰项来自拼写或读音相近的词，必须先听清再回忆词义。":item.type==="英译中"||item.type==="中译英"?"三个选项在拼写、读音或词义类别上较接近，请逐字母比较。":item.type==="句子填词"?"不能只看单词眼熟，要同时检查词义、词形和固定搭配。":"相似句型只改动少量关键词或语序，需要理解完整句意。";item.why+=` 易错提醒：${item.trap}`;});
    return questions;
  }
  const paperScoreKey=(book,unit,typeId)=>`${unit.id}:${typeId}`;
  function renderPapers(){
    const {book,unit}=paperSelection(),passScore=18,completedTotal=Object.values(state.papers.scores).filter(score=>Number(score)>=passScore).length,scores=Object.values(state.papers.scores).map(Number).filter(Number.isFinite),average=scores.length?Math.round(scores.reduce((sum,value)=>sum+value,0)/scores.length/30*100):0,currentDone=PAPER_TYPES.filter(type=>Number(state.papers.scores[paperScoreKey(book,unit,type.id)]||0)>=passScore).length;
    $("paperDashboard").innerHTML=`<article><span>📚</span><div><b>52</b><small>课程单元</small></div></article><article><span>📝</span><div><b>312</b><small>完整试卷</small></div></article><article><span>✍️</span><div><b>9360</b><small>总练习题量</small></div></article><article><span>✅</span><div><b>${completedTotal}</b><small>本身份已通过</small></div></article><article><span>🎯</span><div><b>${scores.length?average+"%":"—"}</b><small>平均正确率</small></div></article>`;
    $("paperGradeSwitch").innerHTML=[3,4,5,6].map(grade=>`<button class="${paperGrade===grade?"active":""}" data-paper-grade="${grade}">${grade}年级</button>`).join("");
    $("paperTermSwitch").innerHTML=["上册","下册"].map(term=>`<button class="${paperTerm===term?"active":""}" data-paper-term="${term}">${term}</button>`).join("");
    $("paperUnitSwitch").innerHTML=book.units.map((item,index)=>`<button class="${paperUnitIndex===index?"active":""}" data-paper-unit="${index}"><span>${item.icon}</span>Unit ${item.number}<small>${esc(item.zh)}</small></button>`).join("");
    $("paperUnitSummary").innerHTML=`<div><span>${unit.icon}</span><div><small>${esc(book.label)} · UNIT ${unit.number}</small><h2>${esc(unit.title)} <i>${esc(unit.zh)}</i></h2><p>本单元共6卷、180题；累计卷只覆盖课程顺序中已经出现过的内容。</p></div></div><aside><b>${currentDone}/6</b><small>达到18/30即通过</small><div><span style="width:${currentDone/6*100}%"></span></div></aside>`;
    $("paperGrid").innerHTML=PAPER_TYPES.map(type=>{const key=paperScoreKey(book,unit,type.id),score=Number(state.papers.scores[key]||0),attempts=Number(state.papers.attempts[key]||0),passed=score>=passScore,historyCount=paperPreviousUnits(book,paperUnitIndex).length,scope=type.id.startsWith("review-")?`${historyCount||1}个历史单元`:type.id==="fujian-combo"?"5个公开来源":"当前单元";return `<article class="paper-card ${passed?"passed":""} ${type.id==="fujian-combo"?"public-combo":""} ${type.id==="unit-advanced"?"advanced-paper-card":""}"><div class="paper-card-top"><span>${type.icon}</span><div><small>${esc(type.kind)}</small><h3>${esc(type.title)}</h3></div><em>${esc(type.level)}</em></div><p>${esc(type.desc)}</p><div class="paper-card-facts"><span>30题</span><span>${type.minutes}分钟</span><span>${scope}</span>${type.id==="unit-advanced"?"<span class=\"advanced-fact\">近形词 · 近音词 · 易混词形</span>":""}</div>${attempts?`<div class="paper-best"><b>最高 ${score}/30</b><small>已作答 ${attempts} 次</small></div>`:`<div class="paper-best empty"><b>尚未作答</b><small>完成全部30题后交卷</small></div>`}<button class="${passed?"soft":"primary"}" data-paper-start="${type.id}">${passed?"再次练习":"开始答卷"} →</button></article>`;}).join("");
    const workspace=$("paperExamWorkspace");
    if(!paperActiveId){workspace.hidden=true;workspace.innerHTML="";return;}
    const type=PAPER_TYPES.find(item=>item.id===paperActiveId);if(!type){paperActiveId="";workspace.hidden=true;return;}
    workspace.hidden=false;renderPaperExam(book,unit,type);
  }
  function paperChoiceMeaningText(option){
    const exact=paperExactMeaning(option);if(exact)return exact;
    const tokens=String(option||"").match(/[A-Za-z]+(?:['’][A-Za-z]+)?/g)||[];
    return [...new Set(tokens.map(token=>`${token}=${paperTokenMeaning(token)}`))].join("，");
  }
  function paperWrongReason(item,option){
    const optionMeaning=paperChoiceMeaningText(option),meaningHint=optionMeaning?`“${option}”可理解为“${optionMeaning}”`:`“${option}”表达的是另一个意思`;
    if(item.type==="Listen and choose")return`音频中的词是 ${item.focusWord}（${item.focusMeaning}），而${meaningHint}，声音和词义不能对应。`;
    if(item.type==="英译中")return`题目中的 ${item.focusWord} 表示“${item.focusMeaning}”，而“${option}”不是这个单词在本课的意思。`;
    if(item.type==="中译英")return`${meaningHint}，不能表示题目要求的“${item.focusMeaning}”；正确单词是 ${item.focusWord}。`;
    if(item.type==="句子填词")return`${meaningHint}。把它填入句子后，词义或搭配与完整句子“${item.completeSentence}”不一致；本题需要 ${item.focusWord}（${item.focusMeaning}）。`;
    if(item.type==="情境表达")return`${meaningHint}，与题目要求表达的“${item.targetZh}”不一致。应比较整句意思和语序，不能只看某一个熟悉的词。`;
    if(item.type==="词语运用")return`${meaningHint}，但它不是题目中 ${item.focusWord}（${item.focusMeaning}）的正确示例句。`;
    if(item.type==="句意理解")return`原句“${item.sourceSentence}”的意思是“${item.targetZh}”，“${option}”与原句中的人物、动作或信息不一致。`;
    if(item.type==="语境理解")return`在“${item.sourceSentence}”这个具体句子里，${item.focusWord} 表示“${item.focusMeaning}”，不能选择“${option}”。同一个词需要结合语境判断。`;
    return`${meaningHint}，与题干要求不相符。`;
  }
  function renderPaperExam(book,unit,type){
    const questions=paperQuestionPool(book,paperUnitIndex,type),answered=Object.keys(paperAnswers).length,score=paperChecked?questions.filter((item,index)=>paperAnswers[index]===item.answer).length:0,key=paperScoreKey(book,unit,type.id),best=Number(state.papers.scores[key]||0),passed=score>=18,history=paperPreviousUnits(book,paperUnitIndex);
    const refs=type.id==="fujian-combo"?`<section class="paper-reference-box"><div><b>公开卷参考范围</b><p>参考福建学校公开卷的题型结构重新编写，题目内容仍严格匹配当前及过往课程，不复制第三方整卷。</p></div><div class="paper-reference-links">${PUBLIC_PAPER_REFERENCES.map(item=>`<a href="${esc(item.url)}" target="_blank" rel="noopener noreferrer"><span>${esc(item.area)}</span><b>${esc(item.school)}</b><small>${esc(item.label)} ↗</small></a>`).join("")}</div></section>`:"";
    const questionMarkup=(item,index)=>{const selected=paperAnswers[index],correct=selected===item.answer,questionGlossary=paperChecked?paperGlossaryMarkup(item.q,"题干中的英文词"):"",audioGlossary=paperChecked&&item.audio?paperGlossaryMarkup(item.audio,"听力原词"):"";return `<article class="paper-question ${paperChecked?(correct?"correct":"wrong"):""}"><div class="paper-question-title"><span>${index+1}</span><div><small>${esc(item.type)}${item.difficultyTag?`<em class="paper-trap-badge">${esc(item.difficultyTag)}</em>`:""}</small><h3>${paperChecked?paperAnnotatedTextMarkup(item.q):esc(item.q)}</h3>${item.audio?`<button class="paper-audio-button" data-paper-say="${esc(item.audio)}">▶ 播放听力</button>`:""}${questionGlossary}${audioGlossary}</div></div><div class="paper-options">${item.options.map(option=>{const isAnswer=option===item.answer,isSelected=selected===option,glossary=paperChecked?paperGlossaryMarkup(option,"选项中的英文词"):"",reason=paperChecked?(isAnswer?`这是正确答案。${item.why}`:paperWrongReason(item,option)):"";return `<div class="paper-option-review ${paperChecked?(isAnswer?"correct-option":"wrong-option"):""} ${paperChecked&&isSelected?"chosen-option":""}"><button class="${isSelected?"selected":""} ${paperChecked&&isAnswer?"answer":""}" data-paper-answer="${index}" data-paper-value="${esc(option)}" ${paperChecked?"disabled":""}><span>${paperChecked?paperAnnotatedTextMarkup(option):esc(option)}</span>${paperChecked?`<em>${isAnswer?"✓ 正确选项":isSelected?"✗ 你的选择":"不选"}</em>`:""}</button>${glossary}${paperChecked?`<p class="paper-choice-reason"><b>${isAnswer?"为什么正确":"为什么不选"}</b>${esc(reason)}</p>`:""}</div>`;}).join("")}</div>${paperChecked?`<div class="paper-explanation"><header><b>${correct?"✓ 本题回答正确":`✗ 本题回答错误 · 正确答案：${esc(item.answer)}`}</b><span>${correct?"继续说明自己为什么这样选":"先看正确原因，再比较自己的选项"}</span></header><section><b>正确答案为什么正确</b><p>${esc(item.why)}</p></section>${!correct?`<section class="selected-wrong-reason"><b>你选择的“${esc(selected)}”为什么错误</b><p>${esc(paperWrongReason(item,selected))}</p></section>`:""}<section><b>订正方法</b><p>${item.type.includes("听")||item.type==="Listen and choose"?"重新播放两遍：第一遍只辨认声音，第二遍说出英文和中文，再朗读正确词。":"先读题干，再逐个比较选项的中文意思；最后把正确答案放回完整句子朗读一遍。"}</p></section></div>`:""}</article>`;};
    const sections=[...new Set(questions.map(item=>item.section))].map(section=>{const indexed=questions.map((item,index)=>({item,index})).filter(entry=>entry.item.section===section);return `<section class="paper-question-section"><header><div><small>STANDARD PRIMARY ENGLISH PAPER</small><h3>${esc(section)}</h3></div><b>${indexed[0].index+1}—${indexed.at(-1).index+1}题</b></header><div class="paper-question-list">${indexed.map(entry=>questionMarkup(entry.item,entry.index)).join("")}</div></section>`;}).join("");
    $("paperExamWorkspace").innerHTML=`<header class="paper-exam-head"><button class="paper-exam-close" data-paper-close aria-label="关闭试卷">×</button><div><small>${esc(book.label)} · Unit ${unit.number} · ${esc(type.kind)}</small><h2>${type.icon} ${esc(type.title)}</h2><p>${type.id.startsWith("review-")?`知识范围：${history.length?`当前单元之前的${history.length}个单元`:`Unit 1 起点知识`}`:type.id==="fujian-combo"?`知识范围：当前及过往单元 · 福建公开卷题型结构`:`知识范围：${esc(unit.title)}（${esc(unit.zh)}）`} · 建议限时${type.minutes}分钟</p></div><aside><b>${paperChecked?`${score}/30`:`${answered}/30`}</b><small>${paperChecked?(passed?"已通过":"需要订正"):"已作答"}</small></aside></header>${refs}${sections}<footer class="paper-submit-row">${paperChecked?`<div><b>${passed?"🎉 本卷通过":"📌 还需继续巩固"}</b><p>本次 ${score}/30，历史最高 ${Math.max(best,score)}/30。${passed?"建议隔3天再做一次。":"请先阅读错题解析，再重新答卷。"}</p></div><button class="soft" data-paper-retry>重新答卷</button>`:`<div><b>答题进度 ${answered}/30</b><p>必须完成全部30题后才能交卷，避免漏题。</p></div><button class="primary" data-paper-submit ${answered<30?"disabled":""}>${answered<30?`还需完成 ${30-answered} 题`:"提交并查看解析"}</button>`}</footer>`;
  }
  function submitPaper(){
    const {book,unit}=paperSelection(),type=PAPER_TYPES.find(item=>item.id===paperActiveId),questions=type?paperQuestionPool(book,paperUnitIndex,type):[];if(!type||Object.keys(paperAnswers).length<questions.length)return toast("请先完成本卷全部30题");
    const key=paperScoreKey(book,unit,type.id),score=questions.filter((item,index)=>paperAnswers[index]===item.answer).length,previous=Number(state.papers.scores[key]||0),firstPass=previous<18&&score>=18;paperChecked=true;state.papers.scores[key]=Math.max(previous,score);state.papers.attempts[key]=Number(state.papers.attempts[key]||0)+1;
    if(firstPass)reward(2,`通过${type.title}`,1);else save();renderPapers();setTimeout(()=>$("paperExamWorkspace")?.scrollIntoView({behavior:"smooth",block:"start"}),30);
  }

  function lessonPlan(u){
    return [
      {number:1,title:"词汇启蒙课",time:"约20分钟",icon:"🔤",detail:`理解主题，点读并掌握前${Math.min(8,u.core.length)}个必备词`,stage:"words"},
      {number:2,title:"句型交流课",time:"约30分钟",icon:"🗣️",detail:"学习8个核心与迁移句式，完成3组共18句情境对话",stage:"patterns"},
      {number:3,title:"阅读运用课",time:"约35分钟",icon:"📖",detail:"完成3篇分级原创阅读、15个读后问题和20题分层练习",stage:"reading"}
    ];
  }

  function renderUnit(){
    const book=bookNow(), u=unitNow();
    $("unitHero").innerHTML=`<div class="unit-hero-icon">${u.icon}</div><div><span>完整单元教材 · ${book.label} · UNIT ${String(u.number).padStart(2,"0")}</span><h1>${u.title}</h1><h2>${u.zh}</h2><p>${u.goal}</p><div class="unit-hero-actions"><button data-open-stage="${nextStage().id}">▶ ${stages.find(s=>s.id===nextStage().id).name}</button><button data-action="print">🖨️ 打印学习单</button></div></div><div class="hero-count"><b>${stages.filter(s=>state.stageDone.includes(stageKey(s.id))).length}/${stages.length}</b><small>学习步骤</small></div>`;
    $("lessonTabs").innerHTML=stages.map(s=>`<button class="${state.stage===s.id?"active":""} ${state.stageDone.includes(stageKey(s.id))?"done":""}" data-stage="${s.id}"><span>${state.stageDone.includes(stageKey(s.id))?"✓":s.icon}</span>${s.name}</button>`).join("");
    renderStage();
  }

  function completeStage(stage=state.stage){
    const key=stageKey(stage); if(state.stageDone.includes(key)) return toast("这个学习步骤已经完成");
    state.stageDone.push(key); if(!state.dailyDone.includes(todayKey(stageTask(stage)))) state.dailyDone.push(todayKey(stageTask(stage)));
    reward(1,"完成一个学习步骤",1); renderUnit();
  }
  function stageTask(stage){ return ({overview:"understand",words:"vocab",patterns:"speak",dialogue:"read",reading:"read",practice:"quiz"})[stage]; }
  function doneButton(label="完成这一步"){ return `<div class="stage-finish"><p>做完后点一下，记录学习进度并领取小太阳。</p><button class="primary" id="completeStageBtn">${state.stageDone.includes(stageKey(state.stage))?"✓ 已完成":label+" +1 ☀️"}</button></div>`; }

  function renderStage(){
    const u=unitNow(), box=$("lessonContent");
    if(state.stage==="overview") box.innerHTML=`<div class="content-head"><span>单元教材导学</span><h2>这套教材怎样学习？</h2><p>本单元建议分3—5天完成。每次只学一个模块，第二天先复习5分钟。</p></div><div class="material-summary"><article><b>${u.core.length}</b><span>必备与拓展词</span></article><article><b>8</b><span>核心与迁移句式</span></article><article><b>3×6</b><span>情境对话句</span></article><article><b>3+20</b><span>分级阅读与练习</span></article></div><div class="textbook-plan">${lessonPlan(u).map(item=>`<button data-open-stage="${item.stage}"><span>${item.icon}</span><div><small>LESSON ${item.number} · ${item.time}</small><h3>${item.title}</h3><p>${item.detail}</p></div><em>开始学习 →</em></button>`).join("")}</div><h3 class="goal-title">学完本单元，我可以做到</h3><div class="objective-list"><article><b>我能听懂</b><p>在“${u.zh}”情境中听出关键词，判断人物在谈论什么。</p></article><article><b>我能开口</b><p>${u.goal}</p></article><article><b>我能读懂</b><p>读懂3篇由浅入深的原创材料，找到人物、地点、时间与主要信息。</p></article><article><b>我能写出</b><p>完成20题分层练习，并仿照重点句型独立写出5个句子。</p></article></div><div class="explain-card"><span>${u.icon}</span><div><h3>生活情境</h3><p>想一想：你在真实生活中什么时候会用到“${u.zh}”英语？先用中文说清楚，再尝试说出一个英文关键词。</p><strong>学习秘诀：理解意思 → 看例子 → 自己换词 → 离开提示再说一遍。</strong></div></div>${doneButton("我已经看懂学习路线")}`;
    if(state.stage==="words") renderWordStage(box,u);
    if(state.stage==="patterns") renderPatternStage(box,u);
    if(state.stage==="dialogue") renderDialogueStage(box,u);
    if(state.stage==="reading") renderReadingStage(box,u);
    if(state.stage==="practice") renderPracticeStage(box,u);
    const complete=$("completeStageBtn"); if(complete) complete.onclick=()=>completeStage();
  }

  function wordExample(w,index,u){
    const custom={hello:"Hello, I'm Ben.",friend:"She is my good friend.",family:"I love my family.",school:"Our school is beautiful.",teacher:"My teacher is kind.",healthy:"Fruit is healthy.",winter:"It is cold in winter.",doctor:"The doctor helps me.",future:"I will work hard in the future."};
    if(custom[w.word]) return custom[w.word];
    const source=[u.story,...u.patterns.map(p=>p.en)].find(line=>line.toLowerCase().includes(w.word.toLowerCase()));
    if(source){ const sentence=source.split(/(?<=[.!?])/).find(line=>line.toLowerCase().includes(w.word.toLowerCase())); if(sentence) return sentence.trim(); }
    const adjectives=["big","small","cute","warm","cold","hot","happy","sad","angry","tired","afraid","worried","proud","tall","short","strong","thin","quiet","clever","helpful","kind","healthy","unhealthy","cheap","expensive","comfortable","colorful","sunny","rainy","cloudy","windy","snowy"];
    if(adjectives.includes(w.word)) return `It is ${w.word}.`;
    const numbers=["one","two","three","four","five","six","seven","eight","nine","ten","eleven","twelve","thirteen","fourteen","fifteen","twenty","thirty","forty","fifty"];
    if(numbers.includes(w.word))return `I can count to ${w.word}.`;
    const weekdays=["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
    if(weekdays.includes(w.word))return `We have English on ${w.word}.`;
    const months=["January","February","March","April","May","June","July","August","September","October","November","December"];
    if(months.includes(w.word))return `My birthday is in ${w.word}.`;
    if(["spring","summer","autumn","winter"].includes(w.word))return `I like ${w.word}.`;
    if(["in","on","under","behind","near","beside"].includes(w.word))return `The book is ${w.word} the desk.`;
    if(["left","right"].includes(w.word))return `Turn ${w.word}, please.`;
    if(w.word==="straight")return "Go straight, please.";
    const past={played:"I played football yesterday.",watched:"I watched TV yesterday.",went:"I went there yesterday.",took:"I took a photo.",saw:"I saw a panda.",made:"I made a card.",happened:"Something happened yesterday.",woke:"I woke up early.",missed:"I missed the bus.",found:"I found my book.",cleaned:"We cleaned the room together."};
    if(past[w.word])return past[w.word];
    const verbs=["meet","wear","want","sing","dance","read","play","draw","swim","play chess","take photos","collect","visit","celebrate","get up","go to school","go to bed","walk","ride","run","exercise","watch TV","clean","buy","thank","teach","plan","call","speak","wait","stay","watch","turn","hide","find","paint","leave","enjoy","win","try","feel","jog","skip","stretch","fit","try on","sweep","mop","wash","cook","tidy","help","hear","rest","make","give","become","graduate","miss","remember","wish","keep in touch","carry"];
    if(verbs.includes(w.word))return `I can ${w.word}.`;
    return `We are learning about ${w.word}.`;
  }
  function seedNumber(text){let value=2166136261;for(const ch of text){value^=ch.charCodeAt(0);value=Math.imul(value,16777619);}return value>>>0;}
  function seededShuffle(items,seed){const result=[...items];let value=seedNumber(seed);for(let i=result.length-1;i>0;i--){value=(Math.imul(value,1664525)+1013904223)>>>0;const j=value%(i+1);[result[i],result[j]]=[result[j],result[i]];}return result;}
  function wordMeaning(word,u){
    const clean=word.toLowerCase().replace(/[’]/g,"'");
    const glossary=new Map(u.core.map(item=>[item.word.toLowerCase(),item.meaning]));
    if(glossary.has(clean))return glossary.get(clean);
    if(BASIC_MEANINGS[clean])return BASIC_MEANINGS[clean];
    const candidates=[];
    if(clean.endsWith("ies"))candidates.push(clean.slice(0,-3)+"y");
    if(clean.endsWith("es"))candidates.push(clean.slice(0,-2),clean.slice(0,-1));
    if(clean.endsWith("s"))candidates.push(clean.slice(0,-1));
    if(clean.endsWith("ied"))candidates.push(clean.slice(0,-3)+"y");
    if(clean.endsWith("ed"))candidates.push(clean.slice(0,-2),clean.slice(0,-1));
    if(clean.endsWith("ing"))candidates.push(clean.slice(0,-3),clean.slice(0,-3)+"e");
    for(const item of candidates){if(glossary.has(item))return `${glossary.get(item)}（词形变化）`;if(BASIC_MEANINGS[item])return `${BASIC_MEANINGS[item]}（词形变化）`;}
    return "结合整句理解；可先听发音，再查看本句中文";
  }
  function interactiveSentence(text,u){
    const tokens=text.match(/[A-Za-z]+(?:['’][A-Za-z]+)?|[^A-Za-z]+/g)||[];
    return `<div class="sentence-study"><div class="interactive-sentence">${tokens.map(token=>/^[A-Za-z]/.test(token)?`<button data-word-say="${esc(token)}" data-word-meaning="${esc(wordMeaning(token,u))}">${esc(token)}</button>`:esc(token)).join("")}</div><div class="word-help"><span>👆</span><p>点击句中任意单词，可单独听发音并查看中文意思。</p></div></div>`;
  }
  function bindSentenceWords(box){box.querySelectorAll("[data-word-say]").forEach(button=>button.onclick=()=>{speak(button.dataset.wordSay,.68);const help=button.closest(".sentence-study").querySelector(".word-help");help.innerHTML=`<span>🔊</span><p><b>${esc(button.dataset.wordSay)}</b><em>${esc(button.dataset.wordMeaning)}</em></p>`;button.closest(".interactive-sentence").querySelectorAll("button").forEach(item=>item.classList.toggle("active",item===button));});}
  function renderWordStage(box,u){
    const core=seededShuffle(u.core.slice(0,Math.min(8,u.core.length)),`${iso()}:${u.id}:core`),extra=seededShuffle(u.core.slice(8),`${iso()}:${u.id}:extra`),testPool=core.flatMap((word,index)=>wordSentenceStudies(word,index,u)),testItems=seededShuffle(testPool,`${iso()}:${u.id}:sentence-test`).slice(0,Math.min(20,testPool.length)),done=state.stageDone.includes(stageKey("words"));
    let testRecorded=done;
    box.innerHTML=`<div class="content-head"><span>第2步 · 单词本</span><h2>必备单词：在完整句式中理解和使用</h2><p>每个重要单词提供3个不同例句，并解释整句意思和单词作用。全部学完后再进入20题填词测试。</p></div><section id="wordLearningBlock"><div class="word-section-title"><h3>⭐ 本单元重要单词</h3><small>每词3句 + 句子意思 + 单词作用 + 逐词点读</small></div><div class="vocab-grid sentence-vocab-grid">${core.map((w,i)=>wordCard(w,i,u,"core")).join("")}</div>${extra.length?`<div class="word-section-title"><h3>🚀 拓展单词</h3><small>每个拓展词同样提供3个例句，先理解使用，不要求一次默写</small></div><div class="vocab-grid extra sentence-vocab-grid">${extra.map((w,i)=>wordCard(w,i+8,u,"extra")).join("")}</div>`:""}<div class="memory-method"><h3>四次回忆法</h3><ol><li>听单词，跟读2遍</li><li>读完旁边3个例句</li><li>理解整句意思和单词作用</li><li>遮住单词，口头补全句子</li></ol></div><button class="primary word-test-start" id="startWordTest">我已学完本单元单词，进入20题填词 →</button></section><section class="cloze-practice word-cloze-zone" id="wordClozeTest" hidden><div class="cloze-section-head"><div><h3>本单元单词填词测试</h3><p>单词和例句已经隐藏。请根据句意和中文提示，把学过的重要单词填回完整句子。</p></div><span>${testItems.length} 题</span></div><div class="cloze-question-list">${testItems.map((item,index)=>`<article class="cloze-question" data-word-cloze="${index}"><span>${index+1}</span><div><b>${esc(blankSentence(item.en,item.answer))}</b><p>${esc(item.zh)}</p><small>提示：${esc(item.word.meaning)} · ${esc(item.answer.charAt(0))}${"＿".repeat(Math.max(1,item.answer.length-1))}</small><input type="text" autocomplete="off" spellcheck="false" data-word-cloze-answer data-word="${esc(item.word.word)}" data-expected="${esc(item.answer)}" placeholder="填入本单元单词"><em></em></div><button type="button" data-say="${esc(blankSentence(item.en,item.answer).replace("________","blank"))}" aria-label="朗读填空句">🔊</button></article>`).join("")}</div><div class="cloze-actions"><button class="soft" id="backToWordLearning">返回复习单词与句式</button><button class="primary" id="checkWordCloze">提交并检查</button></div><div id="wordClozeResult"></div><div id="wordStageFinish" ${done?"":"hidden"}>${doneButton("我已完成单词与句式学习")}</div></section>`;
    box.querySelectorAll("[data-say]").forEach(b=>b.onclick=()=>speak(b.dataset.say));
    box.querySelectorAll("[data-toggle-word]").forEach(b=>b.onclick=()=>b.closest(".vocab-card").classList.toggle("revealed"));
    bindSentenceWords(box);
    $("startWordTest").onclick=()=>{$("wordLearningBlock").hidden=true;$("wordClozeTest").hidden=false;$("wordClozeTest").scrollIntoView({behavior:"smooth",block:"start"});setTimeout(()=>box.querySelector("[data-word-cloze-answer]")?.focus(),350);};
    $("backToWordLearning").onclick=()=>{$("wordClozeTest").hidden=true;$("wordLearningBlock").hidden=false;$("wordLearningBlock").scrollIntoView({behavior:"smooth",block:"start"});};
    $("checkWordCloze").onclick=()=>{let correct=0;box.querySelectorAll("[data-word-cloze-answer]").forEach(input=>{const row=input.closest(".cloze-question"),expected=input.dataset.expected,word=input.dataset.word,ok=answerNorm(input.value)===answerNorm(expected),key=`${u.id}:${word}`;row.classList.remove("correct","wrong");row.classList.add(ok?"correct":"wrong");row.querySelector("em").textContent=ok?"✓ 正确":input.value.trim()?`正确答案：${expected}`:`还没有填写，正确答案：${expected}`;if(ok){correct+=1;if(!state.mastered.includes(key))state.mastered.push(key);state.weak=state.weak.filter(item=>item!==key);}else if(!state.weak.includes(key))state.weak.push(key);});if(!testRecorded){state.quiz.correct+=correct;state.quiz.total+=testItems.length;testRecorded=true;}save();$("wordClozeResult").innerHTML=`<div class="quiz-result"><b>${correct}/${testItems.length}</b><p>${correct===testItems.length?"全部正确！你已经理解这些单词在句子中的用法。":"请读一遍正确句子，再修改错题并重新检查。"}</p></div>`;$("wordStageFinish").hidden=false;$("checkWordCloze").textContent="再次检查";const complete=$("completeStageBtn");if(complete)complete.onclick=()=>completeStage("words");};
  }
  function wordPracticeFrames(w,u){
    const word=w.word,lower=word.toLowerCase(),cap=word.charAt(0).toUpperCase()+word.slice(1),article=/^[aeiou]/i.test(word)?"an":"a";
    const weather=["sunny","rainy","cloudy","windy","snowy","hot","cold","warm","cool"],feelings=["happy","sad","angry","tired","afraid","worried","proud"],adjectives=["big","small","cute","colorful","tall","short","strong","thin","quiet","clever","helpful","kind","healthy","unhealthy","cheap","expensive","comfortable","beautiful","different","larger","higher","highest","late","busy","lucky","unusual","wonderful","funny","delicious","new","far","excited","thankful"],numbers=["one","two","three","four","five","six","seven","eight","nine","ten","eleven","twelve","thirteen","fourteen","fifteen","twenty","thirty","forty","fifty"],weekdays=["monday","tuesday","wednesday","thursday","friday","saturday","sunday"],months=["january","february","march","april","may","june","july","august","september","october","november","december"],seasons=["spring","summer","autumn","winter"],positions=["in","on","under","behind","near","beside"],verbs=["meet","wear","want","sing","dance","read","play","draw","swim","collect","visit","celebrate","walk","ride","run","exercise","clean","buy","thank","teach","plan","call","speak","wait","stay","watch","turn","hide","find","paint","leave","enjoy","win","try","jog","skip","stretch","fit","sweep","mop","wash","cook","tidy","help","hear","rest","make","give","graduate","miss","remember","wish","carry","count","decorate","begin","share","invite","travel"],uncountable=["rice","bread","milk","fish","water","sugar","salt","fruit","chicken","porridge","homework","weather","snow","rain","grass","space","peace","housework","laundry","medicine","love","friendship","energy"],abstract=["family","birthday","festival","time","hobby","week","price","size","change","trip","plan","weekend","vacation","outing","race","team","view","date","olympics","exercise","health","habit","future","dream","job","memory","farewell","tradition","universe"];
    if(weather.includes(lower))return[`It is ${word} today.`,`The weather is ${word}.`,`Tomorrow may be ${word}.`];
    if(feelings.includes(lower))return[`I feel ${word}.`,`She looks ${word} today.`,`Why are you ${word}?`];
    if(adjectives.includes(lower))return[`It is ${word}.`,`This looks ${word}.`,`The picture is ${word}.`];
    if(numbers.includes(lower))return[`I can count to ${word}.`,`The answer is ${word}.`,`Number ${word} is on the card.`];
    if(weekdays.includes(lower))return[`We have English on ${word}.`,`${cap} is a school day.`,`I play sports on ${word}.`];
    if(months.includes(lower))return[`My birthday is in ${word}.`,`${cap} is a month of the year.`,`We have a school activity in ${word}.`];
    if(seasons.includes(lower))return[`I like ${word}.`,`We have fun in ${word}.`,`${cap} is my favorite season.`];
    if(positions.includes(lower))return[`The book is ${word} the desk.`,`Put the bag ${word} the chair.`,`I found it ${word} the box.`];
    if(["left","right"].includes(lower))return[`Turn ${word}, please.`,`The shop is on the ${word}.`,`Look to your ${word}.`];
    if(lower==="straight")return["Go straight, please.","Walk straight to the gate.","The road goes straight ahead."];
    const past={played:["I played football yesterday.","We played together after school.","She played a fun game."],watched:["I watched TV yesterday.","We watched a film together.","She watched the game at home."],went:["I went there yesterday.","We went to the park.","She went home early."],took:["I took a photo.","We took a train yesterday.","She took her bag to school."],saw:["I saw a panda.","We saw two birds.","She saw her friend at school."],made:["I made a card.","We made a snowman.","She made breakfast for Mum."],happened:["Something happened yesterday.","What happened at school?","It happened in the morning."],woke:["I woke up early.","She woke at seven.","We woke to a sunny day."],missed:["I missed the bus.","She missed her friend.","We missed the first lesson."],found:["I found my book.","She found a small gift.","We found the right way."],cleaned:["We cleaned the room together.","I cleaned my desk.","She cleaned the window."],began:["The class began at eight.","It began to rain.","We began our lesson."]};
    if(past[lower])return past[lower];
    if(lower==="feel")return["I feel happy.","How do you feel?","We feel better today."];
    if(lower==="become")return["I want to become a teacher.","She will become a doctor.","Dreams can become real."];
    if(lower.includes(" ")&&/^(get|go|play|take|watch|fly|try|keep)/.test(lower))return[`I can ${word}.`,`We ${word} together.`,`Let's ${word}.`];
    if(verbs.includes(lower))return[`I can ${word}.`,`We ${word} together.`,`Please ${word} with me.`];
    if(uncountable.includes(lower))return[`I like ${word}.`,`We need some ${word}.`,`${cap} is useful in our life.`];
    if(abstract.includes(lower)||lower.includes(" "))return[`We are learning about ${word}.`,`${cap} is important in this unit.`,`I can talk about ${word}.`];
    if(lower.endsWith("s"))return[`I can see ${word}.`,`These ${word} are here.`,`We are learning about ${word}.`];
    return[`This is ${article} ${word}.`,`I can see ${article} ${word}.`,`The ${word} is here.`];
  }
  function sentenceChineseHint(en,w,u){
    const word=w.word,meaning=w.meaning;
    if(en===`It is ${word} today.`)return`今天是“${meaning}”的状态。`;
    if(en===`The weather is ${word}.`)return`天气是“${meaning}”的。`;
    if(en===`Tomorrow may be ${word}.`)return`明天可能会是“${meaning}”的天气。`;
    if(en===`I feel ${word}.`)return`我感觉“${meaning}”。`;
    if(en===`She looks ${word} today.`)return`她今天看起来很“${meaning}”。`;
    if(en===`Why are you ${word}?`)return`你为什么感到“${meaning}”？`;
    if(en===`It is ${word}.`)return`它是“${meaning}”的状态或特点。`;
    if(en===`This looks ${word}.`)return`这个看起来很“${meaning}”。`;
    if(en===`The picture is ${word}.`)return`这幅图是“${meaning}”的。`;
    if(en===`I can count to ${word}.`)return`我能数到“${meaning}”。`;
    if(en===`The answer is ${word}.`)return`答案是“${meaning}”。`;
    if(en===`Number ${word} is on the card.`)return`卡片上有数字“${meaning}”。`;
    if(en.includes(` on ${word}.`))return`这句话表示某件事安排在“${meaning}”。`;
    if(en.includes(` in ${word}.`))return`这句话表示某件事发生在“${meaning}”。`;
    if(en===`I like ${word}.`)return`我喜欢“${meaning}”。`;
    if(en===`We have fun in ${word}.`)return`我们在“${meaning}”过得很开心。`;
    if(en.includes(`${word} is my favorite season`))return`“${meaning}”是我最喜欢的季节。`;
    if(en===`The book is ${word} the desk.`)return`书在课桌的“${meaning}”位置。`;
    if(en===`Put the bag ${word} the chair.`)return`把书包放在椅子的“${meaning}”位置。`;
    if(en===`I found it ${word} the box.`)return`我在盒子的“${meaning}”位置找到了它。`;
    if(en===`Turn ${word}, please.`)return`请向“${meaning}”转。`;
    if(en===`I can ${word}.`)return`我会“${meaning}”。`;
    if(en===`We ${word} together.`)return`我们一起“${meaning}”。`;
    if(en===`Please ${word} with me.`)return`请和我一起“${meaning}”。`;
    if(en===`Let's ${word}.`)return`让我们一起“${meaning}”。`;
    if(en===`We need some ${word}.`)return`我们需要一些“${meaning}”。`;
    if(en===`${word.charAt(0).toUpperCase()+word.slice(1)} is useful in our life.`)return`“${meaning}”在生活中很有用。`;
    if(en===`We are learning about ${word}.`)return`我们正在学习关于“${meaning}”的内容。`;
    if(en===`I can talk about ${word}.`)return`我能谈论“${meaning}”。`;
    if(en.startsWith("This is "))return`这是一个（或一件）“${meaning}”。`;
    if(en.startsWith("I can see "))return`我能看到“${meaning}”。`;
    if(en===`The ${word} is here.`)return`这个“${meaning}”就在这里。`;
    if(en.startsWith("Please read the word"))return`请大声读出“${word}”这个词，它的意思是“${meaning}”。`;
    if(en.startsWith("Can you spell the word"))return`你能拼写“${word}”这个词吗？`;
    if(en.startsWith("I can use the word"))return`我能在本单元中使用“${word}（${meaning}）”。`;
    return`这句话表达“${u.zh}”情境中的一个完整信息，其中“${word}”表示“${meaning}”。`;
  }
  function wordRoleInfo(w,answer){
    const word=w.word.toLowerCase(),adjectives=["sunny","rainy","cloudy","windy","snowy","hot","cold","warm","cool","happy","sad","angry","tired","afraid","worried","proud","big","small","cute","colorful","tall","short","strong","thin","quiet","clever","helpful","kind","healthy","unhealthy","cheap","expensive","comfortable","beautiful","different","larger","higher","highest","late","busy","lucky","unusual","wonderful","funny","delicious","new","far","excited","thankful"],prepositions=["in","on","under","behind","near","beside"],numbers=["one","two","three","four","five","six","seven","eight","nine","ten","eleven","twelve","thirteen","fourteen","fifteen","twenty","thirty","forty","fifty","first","second","third","fourth","fifth","eighth","ninth","twelfth"],pronouns=["he","she","they","this","that","these","those"],timeWords=["monday","tuesday","wednesday","thursday","friday","saturday","sunday","january","february","march","april","may","june","july","august","september","october","november","december","today","tomorrow","yesterday","now","every day","after school","every"],adverbs=["finally","suddenly","then","often","usually","sometimes","early","together","later","outside","fast"],questions=["why","when","where","who","what","which","how many","how much","what time"],verbs=["meet","wear","want","sing","dance","read","play","draw","swim","collect","visit","celebrate","walk","ride","run","exercise","clean","buy","thank","teach","plan","call","speak","wait","stay","watch","turn","hide","find","paint","leave","enjoy","win","try","jog","skip","stretch","fit","sweep","mop","wash","cook","tidy","help","hear","rest","make","give","graduate","miss","remember","wish","carry","count","decorate","begin","share","invite","travel","feel","become","like","love","get","go","put","eat","drink","do","have","know","write","look","see","learn","use","need","show","give","take","work","live","say","tell","talk","played","watched","went","took","saw","made","happened","woke","missed","found","cleaned"];
    if(prepositions.includes(word))return{label:"介词作用",detail:"连接地点与事物，说明它们之间的位置关系。"};
    if(["left","right","straight"].includes(word))return{label:"方位词作用",detail:"说明移动方向或所在位置。"};
    if(numbers.includes(word))return{label:"数词作用",detail:"在句中表达数量、顺序或数字信息。"};
    if(pronouns.includes(word))return{label:"代词作用",detail:"代替人物名称，避免在句中重复说同一个人。"};
    if(timeWords.includes(word))return{label:"时间词作用",detail:"说明动作发生的日期、时间或频率。"};
    if(adverbs.includes(word))return{label:"副词作用",detail:"补充说明动作发生的时间、频率、方式或程度。"};
    if(questions.includes(word))return{label:"疑问词作用",detail:"放在问句中，用来询问人物、时间、原因、数量或其他信息。"};
    if(adjectives.includes(word))return{label:"形容词作用",detail:"描述人物、事物或天气的状态和特点。"};
    if(verbs.includes(word)||/ed$/.test(answer.toLowerCase()))return{label:word.includes(" ")?"动词短语作用":"动词作用",detail:`表达句子中的动作或状态；本句实际使用的词形是“${answer}”。`};
    if(word.includes(" "))return{label:"固定短语作用",detail:"作为一个整体表达特定的时间、事物或活动，使用时不要随意拆开。"};
    return{label:"名词作用",detail:"表示句子中谈到的人、事物、地点或概念。"};
  }
  function wordSentenceStudies(w,index,u){
    const items=[],seen=new Set(),add=(en,zh)=>{const answer=findWordForm(en,w.word);if(!answer||seen.has(en.toLowerCase()))return;seen.add(en.toLowerCase());items.push({word:w,en,zh:zh||sentenceChineseHint(en,w,u),answer,role:wordRoleInfo(w,answer)});};
    u.patterns.forEach(pattern=>add(pattern.en,pattern.zh));
    (u.story.match(/[^.!?]+[.!?]+|[^.!?]+$/g)||[]).forEach(sentence=>add(sentence.trim(),`情境理解：${u.zh}；句中“${w.word}”表示“${w.meaning}”。`));
    add(wordExample(w,index,u),`句中“${w.word}”表示“${w.meaning}”。请结合完整句子理解。`);
    wordPracticeFrames(w,u).forEach(en=>add(en,sentenceChineseHint(en,w,u)));
    [`Please read the word ${w.word} aloud.`,`Can you spell the word ${w.word}?`,`I can use the word ${w.word} in this unit.`].forEach(en=>add(en,sentenceChineseHint(en,w,u)));
    return items.slice(0,3);
  }
  function pluralizeWord(word){const irregular={child:"children",person:"people",man:"men",woman:"women",foot:"feet",tooth:"teeth",mouse:"mice",sheep:"sheep",fish:"fish"};if(irregular[word.toLowerCase()])return irregular[word.toLowerCase()];if(/[^aeiou]y$/i.test(word))return word.slice(0,-1)+"ies";if(/(s|x|z|ch|sh)$/i.test(word))return word+"es";if(/fe$/i.test(word))return word.slice(0,-2)+"ves";if(/f$/i.test(word))return word.slice(0,-1)+"ves";return word+"s";}
  function pluralizePhrase(phrase){const parts=phrase.split(" "),last=parts.pop();return[...parts,pluralizeWord(last)].join(" ");}
  function verbThirdPerson(phrase){const irregular={have:"has",go:"goes",do:"does",be:"is"},parts=phrase.split(" "),first=parts.shift(),third=irregular[first.toLowerCase()]||pluralizeWord(first);return[third,...parts].join(" ");}
  function wordProfile(w){
    const lower=w.word.toLowerCase(),override=WORD_PROFILE_OVERRIDES[lower],role=wordRoleInfo(w,w.word),uncountable=["rice","bread","milk","water","sugar","salt","homework","weather","snow","rain","grass","peace","housework","laundry","medicine","love","friendship","energy","porridge","chicken"],pluralOnly={shoes:"单数 shoe；复数 shoes",glasses:"通常说 a pair of glasses（一副眼镜）",trousers:"通常说 a pair of trousers（一条裤子）",clothes:"通常无单数 clothes；单件衣物用 an item of clothing",stairs:"单数 stair；复数 stairs",dishes:"单数 dish；复数 dishes",grandparents:"单数 grandparent；复数 grandparents"},properTime=["monday","tuesday","wednesday","thursday","friday","saturday","sunday","january","february","march","april","may","june","july","august","september","october","november","december","christmas","easter","thanksgiving"];
    let pos=override?.pos,forms=override?.forms;
    if(!pos){if(role.label.includes("形容词"))pos="形容词";else if(role.label.includes("介词"))pos="介词";else if(role.label.includes("数词"))pos="数词";else if(role.label.includes("代词"))pos="代词";else if(role.label.includes("时间词"))pos="时间名词 / 副词";else if(role.label.includes("副词"))pos="副词";else if(role.label.includes("疑问词"))pos="疑问词 / 疑问短语";else if(role.label.includes("动词短语"))pos="动词短语";else if(role.label.includes("动词"))pos="动词";else if(role.label.includes("固定短语"))pos="固定短语";else pos="名词";}
    if(!forms){if(pluralOnly[lower])forms=pluralOnly[lower];else if(properTime.includes(lower))forms="专有时间名称，通常不用复数";else if(pos.includes("时间名词")||pos.includes("副词")||pos.includes("疑问词")||pos.includes("代词")||pos.includes("介词")||pos.includes("数词")||pos.includes("固定短语"))forms="没有单复数变化";else if(uncountable.includes(lower))forms=`不可数名词，通常不用复数；用 some ${w.word} 表示一些`;else if(pos.includes("名词")){forms=`单数 ${w.word}；复数 ${pluralizePhrase(w.word)}`;}else if(pos.includes("动词")){forms=`无名词单复数；动词原形 ${w.word}；第三人称单数 ${verbThirdPerson(w.word)}`;}else if(pos.includes("形容词"))forms="形容词没有单复数变化";else forms="没有单复数变化";}
    const meanings=[w.meaning,...(WORD_COMMON_MEANINGS[lower]||[])].flatMap(value=>String(value).split(/[；;]/)).map(value=>value.trim()).filter(Boolean),unique=[];meanings.forEach(value=>{if(!unique.includes(value))unique.push(value);});
    return{pos,forms,meanings:unique.slice(0,6)};
  }
  function wordCard(w,i,u,type){const known=state.mastered.includes(`${u.id}:${w.word}`),sentences=wordSentenceStudies(w,i,u),profile=wordProfile(w);return `<article class="vocab-card sentence-word-card ${known?"known":""}"><button class="sound" data-say="${esc(w.word)}">🔊 单词</button><small>${type==="core"?"必备":"拓展"} ${i+1}</small><h3>${esc(w.word)}</h3><button class="meaning-cover" data-toggle-word>点击查看意思</button><p class="word-meaning">${esc(w.meaning)}</p><div class="word-profile"><div><b>词性</b><span>${esc(profile.pos)}</span></div><div><b>单复数 / 词形</b><span>${esc(profile.forms)}</span></div><div class="word-profile-meanings"><b>常见词意</b><span>${profile.meanings.map(meaning=>`<em>${esc(meaning)}</em>`).join("")}</span></div></div><div class="word-sentence-module"><div class="word-sentence-title"><em>句式学习</em><b>3个例句</b></div><div class="word-sentence-list">${sentences.map((sentence,index)=>`<section><div><span>例句 ${index+1}</span><button data-say="${esc(sentence.en)}">🔊 整句</button></div>${interactiveSentence(sentence.en,u)}<div class="sentence-explanation"><p><b>句子意思</b>${esc(sentence.zh)}</p><p><b>${esc(sentence.role.label)}</b><strong>${esc(w.word)}</strong>：${esc(sentence.role.detail)}</p></div></section>`).join("")}</div></div></article>`;}

  function expandedPatternItems(u){
    const items=[],seen=new Set(),add=item=>{const key=String(item.en||"").toLowerCase();if(!key||seen.has(key))return;seen.add(key);items.push(item);};
    u.patterns.forEach(pattern=>add({...pattern,kind:"核心句型",focus:"理解结构后替换关键词"}));
    u.core.slice(0,8).forEach((word,index)=>wordSentenceStudies(word,index,u).forEach(study=>add({en:study.en,zh:study.zh,rule:`${study.role.label}：${study.role.detail}`,kind:"词汇迁移句",focus:`重点观察 ${word.word} 在完整句中的位置和词形`})));
    return items.slice(0,8);
  }
  function renderPatternStage(box,u){
    const patterns=expandedPatternItems(u);
    box.innerHTML=`<div class="content-head"><span>第3步 · ${patterns.length}个完整句式</span><h2>重点句型：知道为什么，再学会替换</h2><p>本单元由核心句型延伸到词汇迁移句。每句都能整句点读、逐词点读，并说明使用重点。</p></div><div class="module-volume"><article><b>${u.patterns.length}</b><span>核心句型</span></article><article><b>${patterns.length-u.patterns.length}</b><span>迁移例句</span></article><article><b>${patterns.length*3}</b><span>建议跟读次数</span></article><article><b>1</b><span>独立表达任务</span></article></div><div class="pattern-list expanded-pattern-list">${patterns.map((p,i)=>`<article class="pattern-card"><div class="pattern-number">${i+1}</div><div><div class="pattern-kind">${esc(p.kind)} <span>${esc(p.focus||"")}</span></div><button class="line-sound" data-say="${esc(p.en)}">🔊 听完整句子</button>${interactiveSentence(p.en,u)}<p class="sentence-translation">${esc(p.zh)}</p><div class="rule"><b>为什么这样说？</b>${esc(p.rule)}</div><div class="try"><b>三遍学习法</b><span>第1遍听懂意思；第2遍逐词跟读；第3遍换成本单元其他词或自己的真实信息。</span></div></div></article>`).join("")}</div><div class="mistake-box"><h3>⚠️ 本单元检查清单</h3><ul><li>句子开头是否大写？结尾是否有问号或句号？</li><li>主语换成 he / she 后，动词是否需要变化？</li><li>能否不看提示，用其中两个句式表达自己的真实信息？</li></ul></div>${doneButton("我已会读并替换8个句式")}`;
    box.querySelectorAll("[data-say]").forEach(b=>b.onclick=()=>speak(b.dataset.say));
    bindSentenceWords(box);
  }

  function regexSafe(text){return String(text).replace(/[.*+?^${}()|[\]\\]/g,"\\$&");}
  function wordVariants(word){
    const value=word.toLowerCase(),forms=[value];if(value.includes(" "))return forms;
    forms.push(value+"s",value+"es",value+"ed",value+"ing");
    if(value.endsWith("e"))forms.push(value.slice(0,-1)+"ing",value+"d");
    if(value.endsWith("y")){forms.push(value.slice(0,-1)+"ies",value.slice(0,-1)+"ied");}
    return [...new Set(forms)].sort((a,b)=>b.length-a.length);
  }
  function findWordForm(text,word){for(const form of wordVariants(word)){const match=text.match(new RegExp(`(^|[^A-Za-z])(${regexSafe(form)})(?=$|[^A-Za-z])`,"i"));if(match)return match[2];}return"";}
  function blankSentence(sentence,answer){return sentence.replace(new RegExp(regexSafe(answer),"i"),"________");}
  function answerNorm(text){return String(text||"").trim().replace(/\s+/g," ").toLowerCase();}

  function dialogueLines(u){ const p=u.patterns; return [
    ["A",`Hi! Let's talk about ${u.title}.`],["B",p[0].en],["A",p[1]?.en||"That's interesting."],["B",p[2]?.en||"Let's learn together."],["A","Great! Can you say it again?"],["B","Sure. Let's practise together!"]
  ]; }
  function dialogueScenes(u){
    const p=u.patterns,w0=u.core[0],w1=u.core[1]||u.core[0];
    return [
      {title:"场景一 · 课本主题交流",tip:"先完整听一遍，再分角色朗读。",lines:dialogueLines(u)},
      {title:"场景二 · 同桌替换练习",tip:"把原句中的关键词换成本单元其他词。",lines:[["A","Can we practise this unit together?"],["B",p[0]?.en||"Yes, let's begin."],["A",p[1]?.en||"I understand."],["B",wordExample(w0,0,u)],["A","Please say one more sentence."],["B",wordExample(w1,1,u)]]},
      {title:"场景三 · 离开提示复述",tip:"用单词造句，并请同伴继续追问。",lines:[["A","Which key word do you remember?"],["B",`I remember ${w0.word}.`],["A",`Can you use ${w0.word} in a sentence?`],["B",wordExample(w0,0,u)],["A","Good. What is another key word?"],["B",`I also remember ${w1.word}.`]]}
    ];
  }
  function renderDialogueStage(box,u){
    const scenes=dialogueScenes(u);
    box.innerHTML=`<div class="content-head"><span>第4步 · 3个场景 · 18句对话</span><h2>原创情境对话：把句型真正说出来</h2><p>从跟读课本主题，到同桌替换，再到离开提示复述。每句话都支持整句和逐词点读。</p></div><div class="dialogue-scene-list">${scenes.map((scene,sceneIndex)=>`<section class="dialogue-scene"><header><span>${sceneIndex+1}</span><div><h3>${esc(scene.title)}</h3><p>${esc(scene.tip)}</p></div><button data-say="${esc(scene.lines.map(line=>line[1]).join(" "))}">🔊 听整组</button></header><div class="dialogue-card"><div class="scene-label">情境：两位同学围绕“${esc(u.zh)}”进行第${sceneIndex+1}轮练习</div>${scene.lines.map(([role,text])=>`<article class="dialogue-line role-${role.toLowerCase()}"><span>${role}</span><div>${interactiveSentence(text,u)}</div><button class="dialogue-sound" data-say="${esc(text)}" aria-label="播放完整句子">🔊 整句</button></article>`).join("")}</div></section>`).join("")}</div><div class="speaking-challenge"><h3>🎤 三步开口挑战</h3><p>①任选一组完整分角色朗读；②替换至少两个关键词；③合上提示，用自己的真实信息重新说4—6句。</p></div>${doneButton("我已完成3组角色朗读")}`;
    box.querySelectorAll("[data-say]").forEach(b=>b.onclick=()=>speak(b.dataset.say));
    bindSentenceWords(box);
  }

  function readingPassages(u){
    const examples=u.core.map((word,index)=>wordExample(word,index,u)),patternText=u.patterns.map(pattern=>pattern.en).join(" "),wordText=examples.slice(0,5).join(" "),transferText=[...u.patterns.map(pattern=>pattern.en),...examples.slice(5,9)].join(" ");
    const build=(level,title,text,focus)=>{const evidence=u.core.find(word=>findWordForm(text,word.word))?.word||(text.match(/[A-Za-z]+/)||["English"])[0];return {level,title,text,focus,questions:[
      ["What is the passage mainly about?",`It is mainly about ${u.title}.`],
      [`Find one key word about “${u.zh}”.`,`参考答案：${evidence}。也可以选择短文中其他本单元词。`],
      ["How many sentences can you find?",`这篇短文共有 ${(text.match(/[.!?]/g)||[]).length||1} 个完整句子。`],
      [`Which sentence contains “${evidence}”?`,`请在原文中找到并完整读出含有 ${evidence} 的句子。`],
      ["Can you say one true sentence about yourself?","开放题：使用本单元重点词或句型说一个与自己有关的真实句子。"]
    ]};};
    return [build("LEVEL 1","基础精读：主题小故事",u.story,"找人物、地点、时间和重复词"),build("LEVEL 2","词汇阅读：单词进入句子",wordText,"观察5个必备词在完整句中的作用"),build("LEVEL 3","迁移阅读：句型综合运用",transferText||patternText,"找出核心句型并尝试替换真实信息")];
  }
  function renderReadingStage(box,u){
    const passages=readingPassages(u);
    box.innerHTML=`<div class="content-head"><span>第5步 · 3篇分级阅读 · 15个读后问题</span><h2>原创阅读：从读懂短句到综合运用</h2><p>三篇材料由浅入深。不要逐字翻译，先找人物、地点、时间、关键词和重复句式。</p></div><div class="reading-level-list">${passages.map((passage,index)=>`<section class="reading-level"><header><span>${passage.level}</span><div><h3>${esc(passage.title)}</h3><p>${esc(passage.focus)}</p></div><em>${(passage.text.match(/[A-Za-z]+/g)||[]).length}词</em></header><article class="reading-sheet"><span>READING ${index+1} · ${u.title.toUpperCase()}</span><button data-say="${esc(passage.text)}">🔊 听全文</button><p class="english-reading">${esc(passage.text)}</p><details><summary>需要帮助？查看阅读线索</summary><p>先圈出本单元学过的词，再给每句话标上序号。中文提示只用于检查大意，不要求逐字对应。</p></details></article><div class="reading-questions"><h3>读后理解 · 5题</h3>${passage.questions.map((question,qIndex)=>`<details><summary>${qIndex+1}. ${esc(question[0])}</summary><p>${esc(question[1])}</p></details>`).join("")}</div></section>`).join("")}</div><div class="reading-method"><b>分级阅读三遍法</b><span>第一遍看大意；第二遍完成5个问题并圈证据；第三遍跟读全文。一天读1篇即可，不必一次完成。</span></div>${doneButton("我已完成3篇分级阅读")}`;
    box.querySelectorAll("[data-say]").forEach(button=>button.onclick=()=>speak(button.dataset.say));
  }

  function practiceOptions(answer,pool,seed){return seededShuffle([answer,...seededShuffle([...new Set(pool.filter(item=>item&&item!==answer))],seed).slice(0,2)],`${seed}:all`);}
  function quizItems(u){
    const words=seededShuffle(u.core,`${u.id}:practice-words`),meanings=u.core.map(item=>item.meaning),spellings=u.core.map(item=>item.word),patterns=expandedPatternItems(u),items=[];
    for(let i=0;i<5;i+=1){const word=words[i%words.length];items.push({level:"第一关 · 词汇辨义",q:`“${word.word}”在本单元中的常见意思是？`,opts:practiceOptions(word.meaning,meanings,`${u.id}:p1:${i}`),answer:word.meaning,word:word.word,why:`${word.word} 表示“${word.meaning}”。先读英文，再主动回忆中文意思。`});}
    for(let i=0;i<5;i+=1){const word=words[(i+5)%words.length];items.push({level:"第二关 · 中英转换",q:`选择“${word.meaning}”对应的英文单词或短语。`,opts:practiceOptions(word.word,spellings,`${u.id}:p2:${i}`),answer:word.word,word:word.word,why:`“${word.meaning}”对应 ${word.word}，注意字母顺序和短语中的空格。`});}
    for(let i=0;i<5;i+=1){const word=words[(i+10)%words.length],study=wordSentenceStudies(word,i,u)[i%3],answer=study?.answer||word.word,sentence=study?.en||wordExample(word,i,u);items.push({level:"第三关 · 句式填空",q:`补全句子：${blankSentence(sentence,answer)}`,opts:practiceOptions(answer,spellings,`${u.id}:p3:${i}`),answer,word:word.word,why:`完整句子是：${sentence} 其中 ${answer} 在句中表示“${word.meaning}”。`});}
    for(let i=0;i<5;i+=1){const pattern=patterns[i%patterns.length],pool=patterns.map(item=>item.en);items.push({level:"第四关 · 语境运用",q:`哪一句最适合表达“${pattern.zh}”？`,opts:practiceOptions(pattern.en,pool,`${u.id}:p4:${i}`),answer:pattern.en,word:u.core[i%u.core.length].word,why:`正确表达是：${pattern.en} ${pattern.rule}`});}
    return items;
  }
  function shuffle(a){const x=[...a];for(let i=x.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[x[i],x[j]]=[x[j],x[i]];}return x;}
  function renderPracticeStage(box,u){
    const items=quizItems(u);
    const levels=[...new Set(items.map(item=>item.level))];
    box.innerHTML=`<div class="content-head"><span>第6步 · 4个层级 · 20道题</span><h2>分层练习：从认得单词到能够独立运用</h2><p>依次完成词汇辨义、中英转换、句式填空和语境运用。提交后每题都会显示答案和原因。</p></div><div class="practice-road"><span><b>1</b>认意思</span><i>→</i><span><b>2</b>找英文</span><i>→</i><span><b>3</b>补句子</span><i>→</i><span><b>4</b>懂语境</span></div>${levels.map(level=>{const rows=items.map((item,index)=>({item,index})).filter(row=>row.item.level===level);return `<section class="practice-level-section"><h3 class="practice-level">${esc(level)} <small>5题</small></h3><div class="quiz-list">${rows.map(({item,index})=>`<article class="quiz-item" data-question="${index}"><b>${index+1}. ${esc(item.q)}</b><div>${item.opts.map(option=>`<button data-answer="${esc(option)}">${esc(option)}</button>`).join("")}</div><p></p></article>`).join("")}</div></section>`;}).join("")}<button class="primary submit-quiz" id="submitQuiz">提交20题并查看逐题解析</button><div id="quizResult"></div><h3 class="practice-level">完成选择题后，再做3项真实表达</h3><div class="ability-practice"><details><summary>1. 句型理解：翻译并朗读</summary><p><b>${esc(u.patterns[0].en)}</b><br>${esc(u.patterns[0].zh)}<br><small>朗读3遍，再替换两个关键词。</small></p></details><details><summary>2. 阅读证据：从三篇短文各找一句</summary><p>找出含有本单元关键词的3个句子，圈出证据词并大声读出来。</p></details><details><summary>3. 独立表达：说或写5句话</summary><p>至少使用3个必备词和2个重点句型，其中1句话必须介绍自己的真实情况。</p></details></div>${doneButton("我已完成本单元")}`;
    box.querySelectorAll(".quiz-item button").forEach(b=>b.onclick=()=>{const item=b.closest(".quiz-item");item.querySelectorAll("button").forEach(x=>x.classList.remove("selected"));b.classList.add("selected");quizAnswers[item.dataset.question]=b.dataset.answer;});
    $("submitQuiz").onclick=()=>{
      let correct=0; items.forEach((item,i)=>{const el=box.querySelector(`[data-question="${i}"]`), chosen=quizAnswers[i]; const ok=chosen===item.answer; if(ok)correct++; el.classList.remove("correct","wrong");el.classList.add(chosen?(ok?"correct":"wrong"):"wrong"); el.querySelector("p").innerHTML=chosen?(ok?`<b>✓ 回答正确</b>${esc(item.why)}`:`<b>正确答案：${esc(item.answer)}</b>${esc(item.why)}`):`<b>尚未作答，正确答案：${esc(item.answer)}</b>${esc(item.why)}`; const key=`${u.id}:${item.word}`; if(ok){if(!state.mastered.includes(key))state.mastered.push(key);state.weak=state.weak.filter(x=>x!==key);}else if(!state.weak.includes(key))state.weak.push(key);});
      state.quiz.correct+=correct;state.quiz.total+=items.length; if(!state.dailyDone.includes(todayKey("quiz")))state.dailyDone.push(todayKey("quiz")); reward(Math.max(1,Math.ceil(correct/4)),`完成20题分层练习，答对 ${correct} 题`,1); $("quizResult").innerHTML=`<div class="quiz-result"><b>${correct}/${items.length}</b><p>${correct===items.length?"全部正确！请隔3天再做一次，检查是否真正记牢。":correct>=16?"掌握良好。请重点朗读做错的句子，再完成真实表达。":correct>=12?"基础已经建立，请回到相应模块订正错题。":"建议先复习单词与句型，再重新完成20题。"}</p></div>`;
    };
  }

  function renderToday(){
    const u=unitNow(),done=dailyComplete(),todayTasks=activeTasks(); $("todayDate").textContent=new Intl.DateTimeFormat("zh-CN",{month:"long",day:"numeric",weekday:"long"}).format(new Date()); $("todayCourse").textContent=`${bookNow().label} · ${u.title}`; $("circleProgress").textContent=`${done}/${todayTasks.length}`; $("circleProgress").style.background=`conic-gradient(var(--green) 0 ${done/todayTasks.length*100}%,#e8efeb ${done/todayTasks.length*100}% 100%)`;
    $("dailyTasks").innerHTML=todayTasks.map((t,i)=>{const yes=state.dailyDone.includes(todayKey(t.id));const link=t.id==="zh2en"||t.id==="en2zh"?`data-open-dictation="${t.id}"`:t.id==="review"?"data-open-review":`data-daily-stage="${t.stage}"`;return `<button class="daily-task ${yes?"done":""}" ${link}><span>${yes?"✓":i+1}</span><i>${t.icon}</i><div><b>${t.title}</b><small>${t.detail}</small></div><em>${yes?"已完成":t.id==="review"?"+1☀️ +2🥣":"+1☀️ +1🥣"}</em></button>`}).join("");
    const claimed=state.bonuses.includes(`${iso()}:${unitKey()}`); $("claimDailyBonus").disabled=done<todayTasks.length||claimed; $("claimDailyBonus").textContent=claimed?"✓ 今日已领取":"领取全勤奖励"; $("bonusHint").textContent=done<todayTasks.length?`再完成 ${todayTasks.length-done} 项即可领取`:claimed?"明天继续保持":"现在可以领取 3☀️ + 2🥣";
    renderDailyPractice();
  }

  function dailyPracticeWords(mode){return seededShuffle(unitNow().core,`${iso()}:${unitKey()}:${mode}:independent`).slice(0,Math.min(5,unitNow().core.length));}
  function renderDailyPractice(){
    const zhDone=state.dailyDone.includes(todayKey("zh2en")),enDone=state.dailyDone.includes(todayKey("en2zh")),reviewDone=state.dailyDone.includes(todayKey("review")),learned=pastLearnedWords();
    $("dailyPracticeZone").innerHTML=`<article class="practice-launch ${zhDone?"done":""}"><span>✍️</span><small>独立窗口 A</small><h2>看中文，写英文</h2><p>窗口内只显示中文题目，不出现英文单词表，避免从旁边抄写。</p><button class="primary" data-open-dictation="zh2en">${zhDone?"再次练习":"开始英文默写"}</button></article><article class="practice-launch ${enDone?"done":""}"><span>🀄</span><small>独立窗口 B</small><h2>看英文，写中文</h2><p>窗口内只显示英文题目，不出现中文单词表，两种练习互不展示答案。</p><button class="primary" data-open-dictation="en2zh">${enDone?"再次练习":"开始中文释义"}</button></article><article class="practice-launch review-launch ${reviewDone?"done":""} ${learned.length?"":"locked"}"><span>🔁</span><small>历史巩固 · ${learned.length}个已学词可复习</small><h2>随机复习过往单词</h2><p>${learned.length?"只从已经完成过单词学习的单元抽题，绝不会提前出现未来课程单词。":"完成任意单元的“必备单词”学习后自动解锁。"}</p><button class="primary" data-open-review ${learned.length?"":"disabled"}>${reviewDone?"再次巩固":learned.length?"开始历史复习":"尚未解锁"}</button></article>`;
  }
  function openReview(){
    const words=seededShuffle(pastLearnedWords(),`${iso()}:past-review`).slice(0,5),dialog=$("practiceDialog");
    if(!words.length)return toast("先完成一个单元的必备单词学习，再来复习过往内容");
    $("practiceDialogContent").innerHTML=`<div class="dictation-window"><div class="dictation-head"><span>🔁</span><div><small>历史巩固 · 只抽取已学习词汇</small><h2 id="practiceDialogTitle">随机复习过往单词</h2><p>题目来自你真正打开并完成过的单词课，不包含未来单元。</p></div></div><div class="privacy-note">🧠 今日随机抽取 ${words.length} 个历史词，中英方向交替练习。</div><div class="dictation-list">${words.map((word,index)=>{const mode=index%2===0?"zh2en":"en2zh";return `<label><b>${index+1}. ${esc(mode==="zh2en"?word.meaning:word.word)}</b>${mode==="en2zh"?`<button type="button" data-say="${esc(word.word)}">🔊</button>`:""}<input type="text" autocomplete="off" spellcheck="false" data-review-answer data-mode="${mode}" data-unit-id="${esc(word.unitId)}" data-word="${esc(word.word)}" data-expected="${esc(mode==="zh2en"?word.word:word.meaning)}" placeholder="${mode==="zh2en"?"写英文":"写中文"}"><small></small></label>`;}).join("")}</div><button class="primary dictation-submit" id="checkPastReview">检查历史复习</button></div>`;
    $("practiceDialogContent").querySelectorAll("[data-say]").forEach(button=>button.onclick=()=>speak(button.dataset.say));
    $("checkPastReview").onclick=checkPastReview;
    if(dialog.showModal)dialog.showModal();else dialog.classList.add("open");
  }
  function checkPastReview(){
    const inputs=[...$("practiceDialogContent").querySelectorAll("[data-review-answer]")],clean=value=>String(value).trim().toLowerCase().replace(/[，。；、,.;]/g,"").replace(/\s+/g," ");let correct=0;
    inputs.forEach(input=>{const answer=clean(input.value),expected=clean(input.dataset.expected),choices=expected.split(/或|\/|；/).map(clean),ok=input.dataset.mode==="zh2en"?answer===expected:choices.some(item=>item===answer||item.includes(answer)&&answer.length>=2),label=input.closest("label");label.classList.toggle("correct",ok);label.classList.toggle("wrong",!ok);input.nextElementSibling.textContent=ok?"✓ 正确":`答案：${input.dataset.expected}`;if(ok)correct+=1;else{const key=`${input.dataset.unitId}:${input.dataset.word}`;if(!state.weak.includes(key))state.weak.push(key);}});
    if(correct===inputs.length){const key=todayKey("review"),first=!state.dailyDone.includes(key);if(first){state.dailyDone.push(key);reward(1,"完成历史词汇巩固",2);renderToday();}else toast("历史复习全部正确，今天已经领取过奖励");const button=$("checkPastReview");button.disabled=true;button.textContent="✓ 历史复习全部正确";}else{save();toast(`历史复习答对 ${correct}/${inputs.length}，订正后再检查`);}
  }
  function openDictation(mode){
    const words=dailyPracticeWords(mode),isEnglish=mode==="zh2en",dialog=$("practiceDialog");
    $("practiceDialogContent").innerHTML=`<div class="dictation-window"><div class="dictation-head"><span>${isEnglish?"✍️":"🀄"}</span><div><small>独立练习窗口 · 另一模块已完全隐藏</small><h2 id="practiceDialogTitle">${isEnglish?"看中文意思，写英文单词":"看英文单词，写中文意思"}</h2><p>${isEnglish?"题目顺序已经打乱；不看单词表独立拼写。":"先读出英文，再写出准确的中文意思。"}</p></div></div><div class="privacy-note">🔒 当前只显示这一种练习，关闭窗口后才能进入另一模块。</div><div class="dictation-list">${words.map((w,i)=>`<label><b>${i+1}. ${esc(isEnglish?w.meaning:w.word)}</b>${isEnglish?"":`<button type="button" data-say="${esc(w.word)}" aria-label="播放 ${esc(w.word)}">🔊</button>`}<input type="text" autocomplete="off" spellcheck="false" data-dictation="${mode}" data-word="${esc(w.word)}" data-expected="${esc(isEnglish?w.word:w.meaning)}" placeholder="${isEnglish?"请输入英文":"请输入中文"}"><small></small></label>`).join("")}</div><button class="primary dictation-submit" data-check-dictation="${mode}">${isEnglish?"检查英文拼写":"检查中文意思"}</button></div>`;
    $("practiceDialogContent").querySelectorAll("[data-say]").forEach(button=>button.onclick=()=>speak(button.dataset.say));
    $("practiceDialogContent").querySelector("[data-check-dictation]").onclick=button=>checkDictation(button.currentTarget.dataset.checkDictation);
    if(dialog.showModal)dialog.showModal();else dialog.classList.add("open");
    setTimeout(()=>$("practiceDialogContent").querySelector("input")?.focus(),80);
  }
  function checkDictation(mode){
    const inputs=[...$("practiceDialogContent").querySelectorAll(`[data-dictation="${mode}"]`)]; let correct=0;
    const clean=value=>String(value).trim().toLowerCase().replace(/[，。；、,.;]/g,"").replace(/\s+/g," ");
    inputs.forEach(input=>{const answer=clean(input.value),expected=clean(input.dataset.expected);const choices=expected.split(/或|\/|；/).map(clean);const ok=mode==="zh2en"?answer===expected:choices.some(item=>item===answer||item.includes(answer)&&answer.length>=2);input.closest("label").classList.toggle("correct",ok);input.closest("label").classList.toggle("wrong",!ok);input.nextElementSibling.textContent=ok?"✓ 正确":`答案：${input.dataset.expected}`;if(ok)correct+=1;else{const key=`${unitKey()}:${input.dataset.word}`;if(!state.weak.includes(key))state.weak.push(key);}});
    if(correct===inputs.length){const key=todayKey(mode),first=!state.dailyDone.includes(key);if(first){state.dailyDone.push(key);reward(1,mode==="zh2en"?"完成英文默写":"完成中文释义",1);renderToday();}else toast("全部正确，这一项今天已经完成过了");const submit=$("practiceDialogContent").querySelector("[data-check-dictation]");submit.disabled=true;submit.textContent="✓ 全部正确";}else{save();toast(`答对 ${correct}/${inputs.length}，请订正后再检查`);}
  }

  function wordPool(){
    const current=seededShuffle(unitNow().core,`${iso()}:${unitKey()}:wordbook`).map(w=>({...w,key:`${unitKey()}:${w.word}`}));
    if(memoryFilter==="weak") return allWords().filter(w=>state.weak.includes(`${w.unitId}:${w.word}`)).map(w=>({...w,key:`${w.unitId}:${w.word}`}));
    if(memoryFilter==="mastered") return allWords().filter(w=>state.mastered.includes(`${w.unitId}:${w.word}`)).map(w=>({...w,key:`${w.unitId}:${w.word}`}));
    return current;
  }
  function renderWords(){
    document.querySelectorAll("[data-word-filter]").forEach(b=>b.classList.toggle("active",b.dataset.wordFilter===memoryFilter)); const pool=wordPool(); memoryIndex=Math.min(memoryIndex,Math.max(0,pool.length-1));
    if(!pool.length){$("memoryCard").innerHTML=`<div class="empty"><span>🎉</span><h2>这里暂时没有单词</h2><p>${memoryFilter==="weak"?"完成小测后，答错的词会自动来到这里。":"先进入课程学习单词吧。"}</p></div>`;$("wordDots").innerHTML="";return;}
    const w=pool[memoryIndex]; $("memoryCard").className=`memory-card ${memoryFlipped?"flipped":""}`; $("memoryCard").innerHTML=`<div class="memory-inner" id="flipWord" role="button" tabindex="0"><div class="memory-front"><small>${memoryIndex+1} / ${pool.length}</small><button class="word-audio" data-memory-say aria-label="播放单词发音">🔊</button><h2>${esc(w.word)}</h2><p>先说出中文意思，再点击翻面</p></div><div class="memory-back"><small>答案与记忆钩子</small><h2>${esc(w.meaning)}</h2><p>${esc(w.exampleZh||"把这个词放进本单元情境中说一次。")}</p><b>再大声读：${esc(w.word)}</b></div></div>`; $("wordDots").innerHTML=pool.map((_,i)=>`<button class="${i===memoryIndex?"active":""}" data-word-index="${i}" aria-label="第${i+1}个单词"></button>`).join("");
    $("flipWord").onclick=(e)=>{if(e.target.closest("[data-memory-say]")){speak(w.word);return;}memoryFlipped=!memoryFlipped;renderWords();};
  }
  function uniqueDictionaryWords(items){
    const seen=new Map();
    items.forEach(item=>{const key=item.word.toLowerCase();if(!seen.has(key))seen.set(key,{word:item.word,meaning:item.meaning,level:item.level||"小学必备",key:item.key||""});});
    return [...seen.values()].sort((a,b)=>a.word.localeCompare(b.word,"en"));
  }
  function dictionaryWords(){
    if(dictionarySection==="gaokao")return uniqueDictionaryWords(window.GAOKAO_WORDS||[]);
    if(dictionarySection==="mine"){
      const selected=allWords().filter(item=>item.unitId===unitKey()||state.weak.includes(`${item.unitId}:${item.word}`)||state.mastered.includes(`${item.unitId}:${item.word}`)).map(item=>({...item,key:`${item.unitId}:${item.word}`,level:state.weak.includes(`${item.unitId}:${item.word}`)?"需要复习":state.mastered.includes(`${item.unitId}:${item.word}`)?"已经掌握":"本单元"}));
      return uniqueDictionaryWords(selected);
    }
    return uniqueDictionaryWords(allWords().map(item=>({...item,level:`${COURSE_BOOKS.find(book=>book.units.some(unit=>unit.id===item.unitId))?.grade||3}年级`})));
  }
  function renderDictionary(){
    const names={primary:"小学必备单词库",gaokao:"高考必备单词库",mine:"我的学习词库"},all=dictionaryWords(),letters=[...new Set(all.map(item=>item.word[0]?.toUpperCase()).filter(letter=>/[A-Z]/.test(letter)))];
    document.querySelectorAll("[data-dictionary-section]").forEach(button=>button.classList.toggle("active",button.dataset.dictionarySection===dictionarySection));
    $("dictionaryTitle").textContent=names[dictionarySection];
    $("dictionaryCount").textContent=`共 ${all.length} 个词`;
    $("dictionarySearch").value=dictionaryQuery;
    $("dictionaryLetters").innerHTML=`<button class="${dictionaryLetter==="all"?"active":""}" data-dictionary-letter="all">全部</button>${letters.map(letter=>`<button class="${dictionaryLetter===letter?"active":""}" data-dictionary-letter="${letter}">${letter}</button>`).join("")}`;
    const query=dictionaryQuery.trim().toLowerCase();
    const filtered=all.filter(item=>(dictionaryLetter==="all"||item.word[0].toUpperCase()===dictionaryLetter)&&(!query||item.word.toLowerCase().includes(query)||item.meaning.includes(dictionaryQuery.trim())));
    $("dictionaryGrid").innerHTML=filtered.length?filtered.slice(0,dictionaryLimit).map(item=>`<article class="dictionary-card"><button data-say="${esc(item.word)}" aria-label="播放 ${esc(item.word)}">🔊</button><div><h3>${esc(item.word)}</h3><p>${esc(item.meaning)}</p><small>${esc(item.level)}</small></div></article>`).join(""):`<div class="dictionary-empty"><span>🔎</span><h2>没有找到这个词</h2><p>请检查拼写，或切换到另一词库搜索。</p></div>`;
    $("dictionaryMore").hidden=filtered.length<=dictionaryLimit;
    $("dictionaryMore").textContent=`再显示 ${Math.max(0,Math.min(48,filtered.length-dictionaryLimit))} 个单词`;
    $("dictionaryGrid").querySelectorAll("[data-say]").forEach(button=>button.onclick=()=>speak(button.dataset.say));
  }
  function moveWord(known){ const pool=wordPool(); if(!pool.length)return; const w=pool[memoryIndex]; if(known){if(!state.mastered.includes(w.key))state.mastered.push(w.key);state.weak=state.weak.filter(x=>x!==w.key);toast("已记住：明天再回忆一次");}else{if(!state.weak.includes(w.key))state.weak.push(w.key);state.mastered=state.mastered.filter(x=>x!==w.key);toast("已加入复习清单，慢慢来");} activity();save();memoryIndex=(memoryIndex+1)%Math.max(1,pool.length);memoryFlipped=false;renderWords(); }

  const abilityReward=(key,amount,message,food=0)=>{if(state.abilities.rewarded.includes(key)){save();return false;}state.abilities.rewarded.push(key);reward(amount,message,food);return true;};
  const diagnosticResult=()=>{const result=state.abilities.diagnostic;return result&&Object.keys(result.answers||{}).length===DIAGNOSTIC_QUESTIONS.length?result:null;};
  const abilityHash=value=>[...String(value)].reduce((sum,char)=>((sum*31)+char.charCodeAt(0))>>>0,7);
  const abilityPrompts=()=>{
    const u=unitNow(),storySentences=String(u.story||"").match(/[^.!?]+[.!?]/g)||[];
    const words=u.core.map(item=>({type:"单词跟读",en:item.word,zh:item.meaning})),patterns=u.patterns.map(item=>({type:"重点句型",en:item.en.replace(/\s*—.*$/,"").trim(),zh:item.zh.replace(/\s*—.*$/,"").trim()})),stories=storySentences.slice(0,2).map(en=>({type:"故事跟读",en:en.trim(),zh:"本单元故事句：先理解大意，再模仿语音语调。"})),examples=u.core.map(item=>({type:"词汇运用",en:item.example,zh:item.exampleZh}));
    return [...words,...patterns,...stories,...examples].slice(0,15);
  };
  function abilityListeningItems(){
    const u=unitNow(),all=bookNow().units.flatMap(unit=>unit.core),allPatterns=bookNow().units.flatMap(unit=>unit.patterns),ordered=[...u.core].sort((a,b)=>abilityHash(`${activeUserId}:${unitKey()}:${a.word}`)-abilityHash(`${activeUserId}:${unitKey()}:${b.word}`));
    const wordItems=ordered.slice(0,Math.min(10,ordered.length)).map((item,index)=>{
      const meanings=[item.meaning];
      for(let step=1;meanings.length<3&&step<all.length;step+=1){const candidate=all[(abilityHash(item.word)+index+step*7)%all.length]?.meaning;if(candidate&&!meanings.includes(candidate))meanings.push(candidate);}
      meanings.sort((a,b)=>abilityHash(`${item.word}:${a}`)-abilityHash(`${item.word}:${b}`));
      return {kind:"听单词",audio:item.word,answer:item.meaning,reveal:item.word,options:meanings};
    });
    const sentenceItems=u.patterns.slice(0,3).map((item,index)=>{const options=[item.zh];for(let step=1;options.length<3&&step<allPatterns.length;step+=1){const candidate=allPatterns[(abilityHash(item.en)+index+step*5)%allPatterns.length]?.zh;if(candidate&&!options.includes(candidate))options.push(candidate);}options.sort((a,b)=>abilityHash(`${item.en}:${a}`)-abilityHash(`${item.en}:${b}`));return {kind:"听句子",audio:item.en,answer:item.zh,reveal:item.en,options};});
    const extraNeeded=Math.max(0,13-wordItems.length-sentenceItems.length),extraItems=u.core.slice(0,extraNeeded).map((item,index)=>{const answer=`${item.word}：${item.meaning}`,options=[answer];for(let step=1;options.length<3&&step<u.core.length;step+=1){const other=u.core[(index+step*3)%u.core.length],candidate=`${other.word}：${other.meaning}`;if(!options.includes(candidate))options.push(candidate);}options.sort((a,b)=>abilityHash(`${item.example}:${a}`)-abilityHash(`${item.example}:${b}`));return {kind:"听句辨词",audio:item.example,answer,reveal:item.example,options};});
    return [...wordItems,...sentenceItems,...extraItems];
  }
  function renderAbilitySummary(){
    const a=state.abilities,diagnostic=diagnosticResult(),phonics=a.phonicsCompleted.length,listening=a.listeningCompleted.length,speaking=a.speakingCompleted.length;
    $("abilitySummary").innerHTML=`<article class="ability-level-card"><span>${diagnostic?"🧭":"🌱"}</span><div><small>当前建议起点</small><b>${diagnostic?`${diagnostic.recommendedGrade}年级基础`:"尚未完成诊断"}</b><p>${diagnostic?`最近得分 ${diagnostic.score}/${DIAGNOSTIC_QUESTIONS.length} · ${esc(diagnostic.date)}`:"约8分钟，完成后会给出学习顺序建议。"}</p></div></article><article><b>${phonics}/${NATURAL_PHONICS_LESSONS.length}</b><small>拼读关卡</small></article><article><b>${listening}</b><small>听力单元</small></article><article><b>${speaking}</b><small>完成跟读</small></article>`;
  }
  function renderAbilities(){
    renderAbilitySummary();
    $("abilityTabs").innerHTML=ABILITY_TABS.map(item=>`<button class="${abilityTab===item.id?"active":""}" data-ability-tab="${item.id}"><span>${item.icon}</span><b>${item.name}</b><small>${item.tip}</small></button>`).join("");
    if(abilityTab==="diagnostic")renderDiagnostic();
    if(abilityTab==="natural-phonics")renderNaturalPhonics();
    if(abilityTab==="listening")renderAbilityListening();
    if(abilityTab==="speaking")renderAbilitySpeaking();
  }
  function renderDiagnostic(){
    const result=diagnosticResult();if(!result&&state.abilities.diagnostic){state.abilities.diagnostic=null;save();}const shownAnswers=result?.answers||diagnosticAnswers,answered=Object.keys(shownAnswers).length,pageSize=10,totalPages=Math.ceil(DIAGNOSTIC_QUESTIONS.length/pageSize),start=diagnosticPage*pageSize,pageItems=DIAGNOSTIC_QUESTIONS.slice(start,start+pageSize),pageAnswered=pageItems.filter((_,offset)=>Object.hasOwn(shownAnswers,start+offset)).length,pageReady=pageAnswered===pageItems.length;
    $("abilityWorkspace").innerHTML=`<header class="ability-module-head diagnostic-head"><div><span>🧭</span><small>START FROM THE RIGHT PLACE</small><h2>入学诊断：不是考试，是寻找起点</h2><p>共${DIAGNOSTIC_QUESTIONS.length}题，分3组完成，覆盖字母、词汇、句型、语法、语序和阅读。每完成10题可以休息一下。</p></div><aside><b>${result?`${result.score}/${DIAGNOSTIC_QUESTIONS.length}`:`${answered}/${DIAGNOSTIC_QUESTIONS.length}`}</b><small>${result?`建议${result.recommendedGrade}年级起步`:"已回答"}</small></aside></header><div class="diagnostic-section-bar"><div><b>第 ${diagnosticPage+1} 组</b><span>${diagnosticPage===0?"三年级基础":diagnosticPage===1?"四、五年级应用":"五、六年级综合"}</span></div><div>${Array.from({length:totalPages},(_,index)=>`<button class="${index===diagnosticPage?"active":""}" data-diagnostic-page="${index}">${index+1}</button>`).join("")}</div><small>本组 ${pageAnswered}/${pageItems.length} 题</small></div><div class="diagnostic-grid">${pageItems.map((item,offset)=>{const index=start+offset,selected=shownAnswers[index],checked=Boolean(result),correct=checked&&selected===item.answer;return `<article class="diagnostic-question ${checked?(correct?"correct":"wrong"):""}"><div><span>${index+1}</span><small>${item.area} · ${item.grade}年级梯度</small></div><h3>${esc(item.q)}</h3><div>${item.options.map(option=>`<button class="${selected===option?"selected":""} ${checked&&option===item.answer?"answer":""}" data-diagnostic-answer="${index}" data-answer-value="${esc(option)}" ${checked?"disabled":""}>${esc(option)}</button>`).join("")}</div>${checked?`<p><b>${correct?"✓ 回答正确":"正确答案："+esc(item.answer)}</b>${esc(item.why)}</p>`:""}</article>`}).join("")}</div><div class="ability-submit-row diagnostic-actions">${diagnosticPage>0?`<button class="soft" data-diagnostic-page="${diagnosticPage-1}">← 上一组</button>`:""}${!result&&diagnosticPage<totalPages-1?`<button class="primary" data-diagnostic-page="${diagnosticPage+1}" ${pageReady?"":"disabled"}>完成本组，进入下一组 →</button>`:""}${!result&&diagnosticPage===totalPages-1?`<button class="primary" data-diagnostic-submit ${answered<DIAGNOSTIC_QUESTIONS.length?"disabled":""}>${answered<DIAGNOSTIC_QUESTIONS.length?`全部还需完成 ${DIAGNOSTIC_QUESTIONS.length-answered} 题`:"查看完整诊断结果"}</button>`:""}${result&&diagnosticPage<totalPages-1?`<button class="primary" data-diagnostic-page="${diagnosticPage+1}">查看下一组解析 →</button>`:""}</div>${result?`<div class="ability-submit-row"><button class="soft" data-diagnostic-reset>重新诊断</button><button class="primary" data-ability-tab="natural-phonics">按建议开始自然拼读 →</button></div>${diagnosticAdvice(result)}`:""}`;
  }
  function diagnosticAdvice(result){
    const tips=result.recommendedGrade<=3?["先完成短元音和辅音组合","从三年级上册开始，每天1个小环节","听懂后再看文字，不要求一次全对"]:result.recommendedGrade===4?["完成自然拼读前4关","从四年级对应学期开始","每天加入5分钟听力辨词"]:result.recommendedGrade===5?["重点补静音e、元音组合和时态","从五年级对应学期开始","每周完成2次录音回听"]:["复习多音节和重读规律","可从六年级课程开始","加强整句听力、表达和阅读复述"];
    return `<section class="diagnostic-result"><span>🎯</span><div><small>个性化学习建议</small><h2>建议从 ${result.recommendedGrade} 年级基础开始</h2><p>这不是给孩子贴标签，而是让内容既不太难，也不无聊。</p><ul>${tips.map(tip=>`<li>${tip}</li>`).join("")}</ul></div></section>`;
  }
  function submitDiagnostic(){
    if(Object.keys(diagnosticAnswers).length<DIAGNOSTIC_QUESTIONS.length)return toast(`请先完成全部${DIAGNOSTIC_QUESTIONS.length}题`);
    const score=DIAGNOSTIC_QUESTIONS.filter((item,index)=>diagnosticAnswers[index]===item.answer).length,recommendedGrade=score<=7?3:score<=15?4:score<=23?5:6,first=!state.abilities.diagnostic;
    state.abilities.diagnostic={score,recommendedGrade,date:iso(),answers:{...diagnosticAnswers}};
    if(first)abilityReward("diagnostic",3,"完成入学诊断",1);else save();renderAbilities();
  }
  function renderNaturalPhonics(){
    const lesson=NATURAL_PHONICS_LESSONS.find(item=>item.id===abilityPhonicsLesson)||NATURAL_PHONICS_LESSONS[0],questions=[lesson.quiz,...(NATURAL_PHONICS_DRILLS[lesson.id]||[])],done=state.abilities.phonicsCompleted.includes(lesson.id),answered=Object.keys(abilityPhonicsAnswers).length,checked=abilityPhonicsChecked,score=questions.filter((item,index)=>abilityPhonicsAnswers[index]===item.answer).length,passed=checked&&score>=Math.ceil(questions.length*.75);
    $("abilityWorkspace").innerHTML=`<header class="ability-module-head phonics-head"><div><span>🔡</span><small>SEE · SOUND · BLEND</small><h2>自然拼读：每关8题，真正练会再过关</h2><p>6关共48题。先听示范、观察规律，再独立完成8题；答对至少6题才算通过，错题会逐题解释。</p></div><aside><b>${state.abilities.phonicsCompleted.length}/${NATURAL_PHONICS_LESSONS.length}</b><small>已闯关 · 共48题</small></aside></header><div class="phonics-level-nav">${NATURAL_PHONICS_LESSONS.map(item=>`<button class="${item.id===lesson.id?"active":""} ${state.abilities.phonicsCompleted.includes(item.id)?"done":""}" data-ability-phonics-lesson="${item.id}"><span>${state.abilities.phonicsCompleted.includes(item.id)?"✓":item.level}</span><b>${item.title}</b></button>`).join("")}</div><section class="phonics-lesson"><div class="phonics-rule-card"><small>${lesson.level} · 核心规律</small><h2>${esc(lesson.title)}</h2><p>${esc(lesson.rule)}</p><b>${esc(lesson.pattern)}</b></div><div class="phonics-example-row">${lesson.examples.map(word=>`<button data-say="${esc(word)}"><span>🔊</span><b>${esc(word)}</b><small>点听并跟读3遍</small></button>`).join("")}</div><div class="blend-road"><small>拼读示范</small>${lesson.blend.map((part,index)=>`<div><span>${index+1}</span><b>${esc(part)}</b></div>${index<lesson.blend.length-1?"<i>→</i>":""}`).join("")}</div><div class="phonics-practice-head"><div><small>本关强化练习</small><h3>8题闯关 · 达到6题正确才通过</h3></div><b>${checked?`${score}/${questions.length}`:`${answered}/${questions.length}`}</b></div><div class="phonics-question-list">${questions.map((item,index)=>{const selected=abilityPhonicsAnswers[index],correct=selected===item.answer;return `<article class="phonics-check ${checked?(correct?"correct":"wrong"):""}"><small>第 ${index+1} 题</small><h3>${esc(item.q)}</h3><div>${item.options.map(option=>`<button class="${selected===option?"selected":""} ${checked&&option===item.answer?"answer":""}" data-ability-phonics-answer="${esc(option)}" data-phonics-question="${index}" ${checked?"disabled":""}>${esc(option)}</button>`).join("")}</div>${checked?`<p><b>${correct?"✓ 回答正确":"正确答案："+esc(item.answer)}</b>${esc(item.why)}</p>`:""}</article>`}).join("")}</div><div class="ability-submit-row">${!checked?`<button class="primary" data-ability-phonics-submit ${answered<questions.length?"disabled":""}>${answered<questions.length?`还需完成 ${questions.length-answered} 题`:"提交本关答案"}</button>`:`<button class="soft" data-ability-phonics-retry>重新练习本关</button>${passed?`<button class="primary" data-ability-phonics-pass="${lesson.id}" ${done?"disabled":""}>${done?"✓ 本关已完成":`通过本关 ${score}/${questions.length} +2 ☀️`}</button>`:`<button class="primary" data-ability-phonics-retry>还差 ${Math.ceil(questions.length*.75)-score} 题，复习后再试</button>`}`}</div></section>`;
    $("abilityWorkspace").querySelectorAll("[data-say]").forEach(button=>button.onclick=()=>speak(button.dataset.say,.74));
  }
  function renderAbilityListening(){
    const items=abilityListeningItems(),key=unitKey(),completed=state.abilities.listeningCompleted.includes(key),wordCount=items.filter(item=>item.kind==="听单词").length,sentenceCount=items.length-wordCount;
    $("abilityWorkspace").innerHTML=`<header class="ability-module-head listening-head"><div><span>🎧</span><small>LISTEN BEFORE YOU LOOK</small><h2>本单元听力：单词辨义 + 整句理解</h2><p>${esc(bookNow().label)} · Unit ${unitNow().number} ${esc(unitNow().title)}。共${items.length}题：${wordCount}道听单词、${sentenceCount}道听句子。题序已打乱，建议每题听2遍。</p></div><aside><b>${completed?"✓":`${Object.keys(abilityListeningAnswers).length}/${items.length}`}</b><small>${completed?"本单元已完成":"已作答"}</small></aside></header><div class="listening-volume-note"><span>训练量</span><b>${items.length}题 / 单元</b><p>先完成单词辨音，再进入整句理解；做错后重新听，不靠看英文猜答案。</p></div><div class="listening-list">${items.map((item,index)=>{const selected=abilityListeningAnswers[index],checked=abilityListeningChecked,correct=selected===item.answer;return `<article class="listening-question ${checked?(correct?"correct":"wrong"):""}"><div><span>${index+1}</span><button data-listening-say="${esc(item.audio)}">▶ ${item.kind} · 第 ${index+1} 题</button><small>不要先看答案，建议播放2遍</small></div><div class="listening-options">${item.options.map(option=>`<button class="${selected===option?"selected":""} ${checked&&option===item.answer?"answer":""}" data-listening-answer="${index}" data-answer-value="${esc(option)}" ${checked?"disabled":""}>${esc(option)}</button>`).join("")}</div>${checked?`<p><b>${correct?"✓ 听对了":"正确答案："+esc(item.answer)}</b><span>听到的是 <strong>${esc(item.reveal)}</strong></span><button data-say="${esc(item.audio)}">🔊 再听一次</button></p>`:""}</article>`}).join("")}</div><div class="ability-submit-row">${abilityListeningChecked?`<button class="soft" data-listening-retry>重新练习全部${items.length}题</button><button class="primary" data-ability-tab="speaking">进入口语录音 →</button>`:`<button class="primary" data-listening-submit ${Object.keys(abilityListeningAnswers).length<items.length?"disabled":""}>${Object.keys(abilityListeningAnswers).length<items.length?`还需完成 ${items.length-Object.keys(abilityListeningAnswers).length} 题`:"检查全部听力答案"}</button>`}</div>`;
    $("abilityWorkspace").querySelectorAll("[data-listening-say],[data-say]").forEach(button=>button.onclick=()=>speak(button.dataset.listeningSay||button.dataset.say,.7));
  }
  function submitAbilityListening(){
    const items=abilityListeningItems();if(Object.keys(abilityListeningAnswers).length<items.length)return toast("请先听完并完成全部题目");abilityListeningChecked=true;
    const score=items.filter((item,index)=>abilityListeningAnswers[index]===item.answer).length,key=unitKey(),first=!state.abilities.listeningCompleted.includes(key);
    if(first){state.abilities.listeningCompleted.push(key);abilityReward(`listening:${key}`,2,`完成本单元听力 ${score}/${items.length}`,1);}else save();renderAbilities();
  }
  function renderAbilitySpeaking(){
    const prompts=abilityPrompts(),completed=state.abilities.speakingCompleted;
    $("abilityWorkspace").innerHTML=`<header class="ability-module-head speaking-head"><div><span>🎙️</span><small>LISTEN · RECORD · PLAY BACK</small><h2>本单元口语：15次真实开口训练</h2><p>从单词清晰度练到完整句子的节奏和语调。建议每天完成3—5项，分3天学完；每项必须录音回放后才能完成。</p></div><aside><b>${prompts.filter((_,index)=>completed.includes(`${unitKey()}:${index}`)).length}/${prompts.length}</b><small>项已完成</small></aside></header><div class="speaking-volume-note"><div><span>第1组</span><b>必备单词</b><small>读准每个音</small></div><i>→</i><div><span>第2组</span><b>重点句型</b><small>读顺整句话</small></div><i>→</i><div><span>第3组</span><b>故事与运用</b><small>模仿节奏语调</small></div></div><div class="speaking-guide"><span><b>1</b>听原音2遍</span><i>→</i><span><b>2</b>看句意理解</span><i>→</i><span><b>3</b>录音并回放</span><i>→</i><span><b>4</b>勾选完成</span></div><div class="speaking-list">${prompts.map((item,index)=>{const key=`${unitKey()}:${index}`,done=completed.includes(key),recorded=speakingRecordedKeys.has(key);return `<article><div class="speaking-number">${done?"✓":index+1}</div><div class="speaking-copy"><small class="speaking-kind">${esc(item.type)}</small><h3>${esc(item.en)}</h3><p>${esc(item.zh)}</p><div><button class="soft" data-say="${esc(item.en)}">🔊 听标准${item.type==="单词跟读"?"单词":"句"}</button><button class="record-button" data-speaking-record="${index}">● ${recorded?"再录一次":"开始录音"}</button><button class="primary" data-speaking-complete="${index}" ${done||!recorded?"disabled":""}>${done?"已完成":recorded?"完成这项":"录音后解锁"}</button></div><section class="recording-result" id="recordingResult${index}"><small>录音只在当前页面临时播放，不会上传或保存。</small></section></div></article>`}).join("")}</div><section class="speaking-self-check"><span>👂</span><div><h3>回听时只检查3件事</h3><p><b>声音：</b>每个关键词是否清楚？　<b>节奏：</b>有没有一个词一个词地断开？　<b>语调：</b>问句和陈述句是否有自然变化？</p></div></section>`;
    $("abilityWorkspace").querySelectorAll("[data-say]").forEach(button=>button.onclick=()=>speak(button.dataset.say,.74));
  }
  async function startSpeakingRecording(index,button){
    if(speakingRecorder?.state==="recording"){speakingRecorder.stop();return;}
    if(!navigator.mediaDevices?.getUserMedia||!window.MediaRecorder)return toast("当前浏览器不支持网页录音，请使用最新版微信、Chrome、Edge 或 Safari");
    try{
      speakingStream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true}});speakingChunks=[];
      const preferred=["audio/webm;codecs=opus","audio/mp4","audio/webm"].find(type=>MediaRecorder.isTypeSupported?.(type));speakingRecorder=new MediaRecorder(speakingStream,preferred?{mimeType:preferred}:undefined);
      button.textContent="■ 停止并回放";button.classList.add("recording");const result=$("recordingResult"+index);result.innerHTML="<b>正在录音……读完后点击“停止并回放”</b>";
      speakingRecorder.ondataavailable=event=>{if(event.data.size)speakingChunks.push(event.data);};
      speakingRecorder.onstop=()=>{const blob=new Blob(speakingChunks,{type:speakingRecorder.mimeType||"audio/webm"});if(speakingRecording)URL.revokeObjectURL(speakingRecording);speakingRecording=URL.createObjectURL(blob);speakingRecordedKeys.add(`${unitKey()}:${index}`);result.innerHTML=`<audio controls playsinline src="${speakingRecording}"></audio><small>先完整听一遍，再和“标准句”比较。录音不会上传。</small>`;button.textContent="● 再录一次";button.classList.remove("recording");const completeButton=$("abilityWorkspace")?.querySelector(`[data-speaking-complete="${index}"]`);if(completeButton){completeButton.disabled=false;completeButton.textContent="完成这句";}speakingStream?.getTracks().forEach(track=>track.stop());speakingStream=null;};
      speakingRecorder.start();
    }catch{toast("没有获得麦克风权限。请在浏览器地址栏的网站设置中允许麦克风。");}
  }
  function completeSpeaking(index){
    const key=`${unitKey()}:${index}`;if(state.abilities.speakingCompleted.includes(key))return;if(!speakingRecordedKeys.has(key))return toast("请先录音并回放，再完成这句");state.abilities.speakingCompleted.push(key);abilityReward(`speaking:${key}`,1,"完成一句口语回听");renderAbilities();
  }

  function renderBeginner(){
    const totalPhonemes=Object.values(PHONICS_GROUPS).reduce((sum,group)=>sum+group.items.length,0),letters=state.beginner.letters.length;
    $("beginnerProgress").innerHTML=`<article><span>🔠</span><div><b>${letters}/26</b><small>已认识字母</small></div><i><em style="width:${letters/26*100}%"></em></i></article><article><span>🧩</span><div><b>${state.abilities.phonicsCompleted.length}/6</b><small>自然拼读关卡</small></div><i><em style="width:${state.abilities.phonicsCompleted.length/6*100}%"></em></i></article><article><span>👄</span><div><b>${state.phonicsDone.length}/${totalPhonemes}</b><small>已完成音标</small></div><i><em style="width:${state.phonicsDone.length/totalPhonemes*100}%"></em></i></article><aside><b>推荐顺序</b><p>字母认识 → 字母与声音 → 自然拼读 → 音标辨音</p></aside>`;
    $("beginnerTabs").innerHTML=BEGINNER_TABS.map(item=>`<button class="${beginnerTab===item.id?"active":""}" data-beginner-tab="${item.id}"><span>${item.icon}</span><b>${item.name}</b><small>${item.tip}</small></button>`).join("");
    const host=$("beginnerWorkspace");
    if(beginnerTab==="alphabet"){
      host.innerHTML=`<header class="beginner-module-head"><div><small>STEP 1 · LOOK · LISTEN · SAY</small><h2>26个英文字母认识表</h2><p>先认大写和小写，再听字母名称和示例词。不要把“字母名称”和“字母在单词中的声音”混为一谈。</p></div><aside><b>${letters}/26</b><small>已认识</small></aside></header><div class="alphabet-guide"><span><b>1</b>看大小写</span><i>→</i><span><b>2</b>听字母名</span><i>→</i><span><b>3</b>听示例词</span><i>→</i><span><b>4</b>在空中写一遍</span></div><div class="alphabet-grid">${ALPHABET_LESSONS.map(item=>{const [upper,lower,ipa,word,zh,hint]=item,done=state.beginner.letters.includes(upper);return `<article class="alphabet-card ${done?"done":""}"><div class="alphabet-letter"><b>${upper}</b><span>${lower}</span></div><small>字母名称 ${ipa}</small><div class="alphabet-audio"><button data-say="${upper}">🔊 听字母名</button><button data-say="${word}">🎧 ${word}</button></div><p><b>${word}</b> · ${zh}</p><em>${hint}</em><button class="letter-known" data-letter-known="${upper}">${done?"✓ 已认识":"我认识了"}</button></article>`;}).join("")}</div><section class="beginner-checklist"><h3>字母启蒙5项检查</h3><div><span>能按顺序唱出 A—Z</span><span>看到大写能找到对应小写</span><span>听到字母名能指出字母</span><span>能写出自己姓名中的字母</span><span>知道字母名不等于单词里的发音</span></div></section>`;
    }
    if(beginnerTab==="sounds"){
      const vowels=ALPHABET_LESSONS.filter(item=>"AEIOU".includes(item[0])),groups=[
        ["会‘爆破’的声音","B /b/ · P /p/ · D /d/ · T /t/ · G /g/ · K /k/","手放在嘴前，感受短促气流；清辅音不振动，浊辅音喉咙振动。"],
        ["会‘摩擦’的声音","F /f/ · V /v/ · S /s/ · Z /z/ · H /h/","让气流从窄缝通过，声音可以稍微延长。"],
        ["鼻音和流音","M /m/ · N /n/ · L /l/ · R /r/","m、n 的气流经过鼻腔；l、r 要观察舌头位置。"],
        ["常见字母组合","sh /ʃ/ · ch /tʃ/ · th /θ/ /ð/ · wh /w/","两个字母有时合起来表示一个音，要作为整体观察。"]
      ];
      host.innerHTML=`<header class="beginner-module-head sound-head"><div><small>STEP 2 · LETTER NAME ≠ LETTER SOUND</small><h2>字母名称和常见发音</h2><p>字母 A 的名称是 /eɪ/，但在 apple 中常发 /æ/。先建立这个区别，之后学习拼读会容易很多。</p></div><aside><b>5+4</b><small>元音与辅音组</small></aside></header><section class="vowel-board"><div><small>五个元音字母</small><h3>A · E · I · O · U</h3><p>元音是音节的中心。同一个元音字母在不同单词中可能有不同发音。</p></div>${vowels.map(item=>`<article><b>${item[0]} ${item[1]}</b><span>${item[2]}</span><button data-say="${item[3]}">🔊 ${item[3]}</button><small>${item[5]}</small></article>`).join("")}</section><div class="sound-family-grid">${groups.map((group,index)=>`<article><span>${index+1}</span><h3>${group[0]}</h3><b>${group[1]}</b><p>${group[2]}</p></article>`).join("")}</div><section class="sound-practice"><h3>每天8分钟声音游戏</h3><ol><li>家长说一个字母名，孩子指出大小写。</li><li>播放一个示例词，孩子说出开头字母。</li><li>比较一组清浊音，如 /p/ 与 /b/，摸喉咙判断是否振动。</li><li>从家里找3件物品，说出它们英文首字母。</li></ol></section>`;
    }
    if(beginnerTab==="phonics"){
      host.innerHTML=`<header class="beginner-module-head phonics-start-head"><div><small>STEP 3 · SOUND → BLEND → WORD</small><h2>自然拼读起步路线</h2><p>自然拼读不是背规则表，而是把声音逐个滑读并合成单词。每关先看规律、听示范，再做8题闯关。</p></div><aside><b>${state.abilities.phonicsCompleted.length}/6</b><small>关已完成</small></aside></header><div class="phonics-path-cards">${NATURAL_PHONICS_LESSONS.map((lesson,index)=>`<article class="${state.abilities.phonicsCompleted.includes(lesson.id)?"done":""}"><span>${state.abilities.phonicsCompleted.includes(lesson.id)?"✓":index+1}</span><small>${lesson.level}</small><h3>${esc(lesson.title)}</h3><p>${esc(lesson.rule)}</p><b>${esc(lesson.pattern)}</b><div>${lesson.examples.map(word=>`<button data-say="${word}">🔊 ${word}</button>`).join("")}</div></article>`).join("")}</div><section class="phonics-start-action"><div><span>🧩</span><h3>进入足量闯关练习</h3><p>6关共48题，每关8题；答对至少6题才通过，错题逐题解释。</p></div><button class="primary" data-beginner-open-ability>打开自然拼读闯关 →</button></section>`;
    }
    if(beginnerTab==="ipa"){
      host.innerHTML=`<div class="phonics-intro"><article><span>1</span><div><b>音标不是字母</b><p>字母是单词的写法，音标表示实际听到的声音。同一个字母在不同单词中可能发不同音。</p></div></article><article><span>2</span><div><b>符号 / / 表示发音</b><p>如 sheep /ʃiːp/；符号 ː 表示长音，要比短音多保持一会儿。</p></div></article><article><span>3</span><div><b>听—看—模仿—对比</b><p>先听标准音素和示例词，看口型提示，跟读3遍，再比较相近音。</p></div></article></div><div class="phonics-groups" id="phonicsGroups"></div><div class="phonics-grid" id="phonicsGrid"></div><section class="panel minimal-panel"><div class="section-head"><div><span class="eyebrow">MINIMAL PAIRS</span><h2>最小对立词辨音</h2></div></div><p>两个单词通常只差一个音。先分别点读，再闭眼判断听到的是哪一个。</p><div class="minimal-grid" id="minimalGrid"></div></section><section class="panel phonics-method"><h2>每天5分钟发音训练</h2><div><span><b>第1分钟</b>听5个示例词</span><span><b>第2分钟</b>看口型慢读</span><span><b>第3分钟</b>正常速度跟读</span><span><b>第4分钟</b>对比相近音</span><span><b>第5分钟</b>离开提示读词</span></div></section>`;
      renderPhonics();
    }
    host.querySelectorAll("[data-say]").forEach(button=>button.onclick=()=>speak(button.dataset.say));
  }

  function renderPhonics(){
    const icons={short:"🟡",long:"🟢",diph:"🌈",stops:"💨",consonants:"👄",clusters:"🔗"},groups=Object.entries(PHONICS_GROUPS),total=groups.reduce((sum,[,item])=>sum+item.items.length,0),done=state.phonicsDone.length,group=PHONICS_GROUPS[phonicsGroup];
    $("phonicsGroups").innerHTML=`<div class="phonics-progress"><div><b>音标学习进度</b><span>${done} / ${total} 个音</span></div><i><em style="width:${Math.min(100,done/total*100)}%"></em></i></div><div class="phonics-group-buttons">${groups.map(([id,item])=>`<button class="${id===phonicsGroup?"active":""}" data-phonics-group="${id}">${icons[id]} ${item.name}<small>${item.items.length}个</small></button>`).join("")}</div>`;
    $("phonicsGrid").innerHTML=`<article class="phonics-tip"><span>${icons[phonicsGroup]}</span><div><small>本组学习目标</small><h2>${group.name}</h2><p>${group.tip}</p><p><b>发音已校正：</b>主按钮按<a href="https://www.xdf.cn/zhuanti/bd-phonetic-alphabet-card/index.html" target="_blank" rel="noopener noreferrer">新东方48音标卡</a>对照播放；“示范单词”播放完整单词。网络不可用时自动切换到本地音素包。</p></div></article>${group.items.map(item=>{const [symbol,word,ipa,tip,spelling]=item,key=`${phonicsGroup}:${symbol}`,finished=state.phonicsDone.includes(key);return `<article class="phoneme-card ${finished?"done":""}" data-phoneme-key="${esc(key)}"><div class="phoneme-top"><strong>${esc(symbol)}</strong><div><button data-say-phoneme="${esc(symbol)}" aria-label="播放标准音素 ${esc(symbol)}">🔊 标准音素</button><button data-say="${esc(word)}" aria-label="播放示例词 ${esc(word)}">🎧 示范单词</button></div></div><h3>${esc(word)} <small>${esc(ipa)}</small></h3><p><b>👄 发音方法：</b>${esc(tip)}</p><p><b>🔤 常见字母：</b>${esc(spelling)}</p><ol><li>听标准音素</li><li>听完整示范词</li><li>对照口型慢速跟读3遍</li></ol><button class="phoneme-done" data-finish-phoneme="${esc(key)}">${finished?"✓ 已学会":"我已听、看、读3遍 +1 ☀️"}</button></article>`}).join("")}`;
    $("minimalGrid").innerHTML=MINIMAL_PAIRS.map(([a,aIpa,b,bIpa])=>`<article><div><button data-say="${esc(a)}">🔊 ${esc(a)}</button><span>${esc(aIpa)}</span></div><b>VS</b><div><button data-say="${esc(b)}">🔊 ${esc(b)}</button><span>${esc(bIpa)}</span></div><p>先听两遍，再注意两个词中不同的音。</p></article>`).join("");
    document.querySelectorAll("[data-phonics-group]").forEach(button=>button.onclick=()=>{phonicsGroup=button.dataset.phonicsGroup;renderPhonics();});
    document.querySelectorAll("#view-beginner [data-say]").forEach(button=>button.onclick=()=>speak(button.dataset.say));
    document.querySelectorAll("#view-beginner [data-say-phoneme]").forEach(button=>button.onclick=()=>speakPhoneme(button.dataset.sayPhoneme));
    document.querySelectorAll("[data-finish-phoneme]").forEach(button=>button.onclick=()=>{const key=button.dataset.finishPhoneme;if(state.phonicsDone.includes(key)){toast("这个音标已经学过了，继续巩固吧");return;}state.phonicsDone.push(key);reward(1,"完成一个音标跟读");renderBeginner();});
  }

  function renderGrammar(){
    const topics=window.GRAMMAR_TOPICS||[];if(!topics.length)return;
    const topic=topics.find(item=>item.id===grammarTopicId)||topics[0];grammarTopicId=topic.id;
    const completed=state.grammar.completed||[],best=Number(state.grammar.quizBest?.[topic.id]||0),attempts=Number(state.grammar.attempts?.[topic.id]||0),passed=completed.includes(topic.id),result=grammarResult?.topicId===topic.id?grammarResult:null;
    $("grammarProgressText").textContent=completed.length+" / "+topics.length+" 个主题";
    $("grammarProgressBar").style.width=Math.min(100,completed.length/topics.length*100)+"%";
    $("grammarTopicNav").innerHTML=topics.map((item,index)=>"<button class=\""+(item.id===topic.id?"active ":"")+(completed.includes(item.id)?"done":"")+"\" data-grammar-topic=\""+item.id+"\"><span>"+(completed.includes(item.id)?"✓":item.icon)+"</span><div><small>主题 "+(index+1)+"</small><b>"+esc(item.title)+"</b><em>"+esc(item.subtitle)+"</em></div></button>").join("");
    const sectionHtml=topic.sections.map((section,index)=>"<article class=\"grammar-rule-card\"><div class=\"grammar-rule-number\">"+(index+1)+"</div><div class=\"grammar-rule-main\"><h3>"+esc(section.title)+"</h3><p class=\"grammar-rule-copy\">"+esc(section.rule)+"</p><div class=\"grammar-points\">"+section.points.map(point=>"<span>"+esc(point)+"</span>").join("")+"</div><div class=\"grammar-example-grid\">"+section.examples.map(example=>"<section><div><b>例句</b><button data-say=\""+esc(example.en)+"\">🔊 听句子</button></div><h4>"+esc(example.en)+"</h4><p>"+esc(example.zh)+"</p><small><strong>为什么：</strong>"+esc(example.why)+"</small></section>").join("")+"</div></div></article>").join("");
    const quizHtml=topic.quiz.map((item,index)=>{const selected=grammarAnswers[index],status=result?(result.answers[index]===item.answer?"correct":"wrong"):"";return "<article class=\"grammar-question "+status+"\" data-grammar-question=\""+index+"\"><div><span>"+(index+1)+"</span><h4>"+esc(item.q)+"</h4></div><div class=\"grammar-options\">"+item.options.map(option=>"<button class=\""+(selected===option?"selected ":"")+(result&&option===item.answer?"answer":"")+"\" data-grammar-option=\""+index+"\" data-grammar-value=\""+esc(option)+"\">"+esc(option)+"</button>").join("")+"</div>"+(result?"<p>"+(result.answers[index]===item.answer?"✓ 回答正确":"正确答案："+esc(item.answer))+"。"+esc(item.explain)+"</p>":"")+"</article>";}).join("");
    $("grammarClassroom").innerHTML="<header class=\"grammar-hero\"><div><span>"+topic.icon+"</span><small>GRAMMAR TOPIC</small><h2>"+esc(topic.title)+"</h2><p>"+esc(topic.intro)+"</p></div><aside><b>"+(passed?"✓ 已完成":best?"最好 "+best+"/"+topic.quiz.length:"尚未测试")+"</b><small>练习 "+attempts+" 次</small></aside></header><div class=\"grammar-learning-path\"><span><b>1</b>看规则</span><i>→</i><span><b>2</b>读例句</span><i>→</i><span><b>3</b>找原因</span><i>→</i><span><b>4</b>做检查</span></div><div class=\"grammar-section-list\">"+sectionHtml+"</div><section class=\"grammar-quiz\"><div class=\"grammar-quiz-head\"><div><span>CHECK YOURSELF</span><h3>课后理解检查</h3><p>先独立思考，再选择答案。达到60%即可完成本主题，错题会显示原因。</p></div><b>"+topic.quiz.length+"题</b></div><div class=\"grammar-question-list\">"+quizHtml+"</div><button class=\"primary grammar-submit\" id=\"submitGrammarQuiz\">"+(result?"修改答案后再次检查":"提交答案")+"</button>"+(result?"<div class=\"grammar-result "+(result.passed?"passed":"retry")+"\"><span>"+(result.passed?"🎉":"🌱")+"</span><div><b>"+result.score+" / "+topic.quiz.length+"</b><p>"+(result.passed?"已完成本主题！请大声读一遍做错的句子。":"还差一点。读完错题原因，再修改答案重新提交。")+"</p></div></div>":"")+"</section>";
    document.querySelectorAll("#view-grammar [data-say]").forEach(button=>button.onclick=()=>speak(button.dataset.say));
  }
  function submitGrammarQuiz(){
    const topic=(window.GRAMMAR_TOPICS||[]).find(item=>item.id===grammarTopicId);if(!topic)return;
    if(topic.quiz.some((_,index)=>!Object.hasOwn(grammarAnswers,index)))return toast("请先完成全部题目，再提交检查");
    const answers={...grammarAnswers},score=topic.quiz.filter((item,index)=>answers[index]===item.answer).length,passed=score/topic.quiz.length>=.6,firstPass=passed&&!state.grammar.completed.includes(topic.id);
    state.grammar.attempts[topic.id]=Number(state.grammar.attempts[topic.id]||0)+1;state.grammar.quizBest[topic.id]=Math.max(Number(state.grammar.quizBest[topic.id]||0),score);
    if(firstPass)state.grammar.completed.push(topic.id);grammarResult={topicId:topic.id,answers,score,passed};
    if(firstPass)reward(2,"完成一个语法主题",1);else save();renderGrammar();
  }

  function catalogPlant(id=state.plant.selected){return GROWTH_CATALOG.plants.find(item=>item.id===id)||GROWTH_CATALOG.plants[0];}
  function catalogPet(id=state.pets.selected){return GROWTH_CATALOG.pets.find(item=>item.id===id)||null;}
  function growthLevel(xp,thresholds){let level=0;thresholds.forEach((value,index)=>{if(xp>=value)level=index;});return level;}
  function animatedPetMarkup(pet,size="large",stage=0){
    const level=Math.max(0,Math.min(3,Number(stage)||0));
    return `<div class="animated-pet pet-${pet.id} size-${size} sprite-stage-${level}" data-animated-pet aria-label="会动的${esc(pet.name)}，${esc(pet.forms[level])}"><i class="pet-ground-shadow"></i><i class="pet-sprite" style="background-image:url('${esc(pet.image)}')"></i></div>`;
  }
  function renderHomePet(){
    const host=$("homePetFloat"),pet=catalogPet();
    if(!host)return;
    if(!pet||!state.pets.owned.includes(pet.id)){host.hidden=true;host.innerHTML="";return;}
    const progress=petProgress(),stage=growthLevel(progress.xp,pet.thresholds);
    host.hidden=false;
    host.innerHTML=`<div class="home-pet-title"><div><small>我的学习伙伴</small><b>${esc(pet.name)} · ${esc(pet.forms[stage])}</b></div><button data-view="pets" aria-label="打开动物伙伴页面">详情</button></div><div class="home-pet-playground">${animatedPetMarkup(pet,"home",stage)}<span class="pet-speech">${progress.fullness<25?"我有点饿啦！":"一起学习吧！"}</span></div><div class="pet-actions"><button data-pet-action="pat">🖐️ 摸摸</button><button data-pet-action="jump">⬆️ 跳跃</button><button data-pet-action="walk">🐾 散步</button><button data-pet-feed ${state.foods<2?"disabled":""}>🥣 喂食</button></div>`;
  }
  function playPetAction(action){
    const pets=document.querySelectorAll(".home-pet-float [data-animated-pet], .pet-stage [data-animated-pet]");
    if(!pets.length)return;
    clearTimeout(petActionTimer);
    pets.forEach(node=>{node.classList.remove("action-pat","action-jump","action-walk","action-happy");void node.offsetWidth;node.classList.add(`action-${action}`);});
    const messages={pat:"它开心地蹭了蹭你的手",jump:"它轻快地跳了起来",walk:"它在学习岛上散了一小圈步",happy:"吃饱啦！它高兴地向你打招呼"};
    if(messages[action])toast(messages[action]);
    petActionTimer=setTimeout(()=>pets.forEach(node=>node.classList.remove(`action-${action}`)),action==="walk"?2100:1400);
  }
  function plantState(){const plant=catalogPlant(),progress=plantProgress(),level=growthLevel(progress.xp,plant.thresholds);return{...plant,level:level+1,stage:level,icon:progress.energy<=0?"🥀":plant.stages[level],name:progress.energy<=0?`${plant.name}（休眠）`:plant.forms[level]};}
  function plantUpgradeState(id=state.plant.selected){
    const item=catalogPlant(id),data=plantProgress(id),level=growthLevel(data.xp,item.thresholds),current=item.thresholds[level],next=item.thresholds[level+1];
    const percent=next?Math.min(100,Math.max(0,(data.xp-current)/(next-current)*100)):100;
    return{item,data,level,current,next,percent,remain:next?Math.max(0,next-data.xp):0};
  }
  function renderGardenPlots(){
    const host=$("gardenPlots");if(!host)return;
    const ids=[state.plant.selected,...state.plant.owned.filter(id=>id!==state.plant.selected)].slice(0,6),slots=[];
    ids.forEach(id=>{const upgrade=plantUpgradeState(id),selected=id===state.plant.selected;slots.push(`<button class="garden-plot ${selected?"active":""}" data-select-plant="${id}" style="--plot-color:${upgrade.item.color}"><span class="plot-plant">${upgrade.data.energy<=0?"🥀":upgrade.item.stages[upgrade.level]}</span><b>${esc(upgrade.item.name)}</b><small>${esc(upgrade.item.forms[upgrade.level])}</small><div class="plot-progress"><i style="width:${upgrade.percent}%"></i></div><em>${upgrade.next?`距离升级 ${upgrade.remain}`:"终极形态"}</em></button>`);});
    while(slots.length<6)slots.push(`<button class="garden-plot empty" data-open-market="plants"><span>＋</span><b>空种植位</b><small>去图鉴解锁新伙伴</small></button>`);
    host.innerHTML=slots.join("");
  }
  function renderPlantAtlas(){
    const host=$("plantAtlas"),stats=$("plantAtlasStats");if(!host||!stats)return;
    const rarityOrder=["普通","进阶","稀有","史诗","传说","神话"],ownedCount=state.plant.owned.length,matureCount=state.plant.owned.filter(id=>{const item=catalogPlant(id);return plantProgress(id).xp>=item.thresholds.at(-1);}).length;
    stats.innerHTML=`<div><b>${ownedCount}/${GROWTH_CATALOG.plants.length}</b><small>已解锁</small></div><div><b>${matureCount}</b><small>终极形态</small></div><div><b>${state.suns}</b><small>小太阳</small></div>`;
    host.innerHTML=rarityOrder.map((rarity,rarityIndex)=>{const items=GROWTH_CATALOG.plants.filter(item=>item.rarity===rarity);if(!items.length)return"";const unlocked=items.filter(item=>state.plant.owned.includes(item.id)).length;return `<section class="atlas-group rarity-${rarityIndex}"><div class="atlas-group-title"><div><span>${rarityIndex+1}</span><h3>${esc(rarity)}品质</h3></div><small>${unlocked}/${items.length} 已解锁</small></div><div class="atlas-grid">${items.map(item=>{const owned=state.plant.owned.includes(item.id),selected=state.plant.selected===item.id,upgrade=owned?plantUpgradeState(item.id):null,mature=owned&&!upgrade.next;return `<article class="atlas-card ${owned?"unlocked":"locked"} ${selected?"selected":""} ${mature?"mature":""}" style="--atlas-color:${item.color}"><div class="atlas-plant"><span>${owned?item.stages[upgrade.level]:item.stages.at(-1)}</span>${owned?"":"<i>🔒</i>"}</div><div class="atlas-card-copy"><div><em>${esc(item.rarity)}</em><small>${esc(item.role||"学习型")}</small></div><h3>${esc(item.name)}</h3><p>${esc(item.description)}</p>${owned?`<div class="atlas-progress"><span style="width:${upgrade.percent}%"></span></div><small class="atlas-progress-copy">${upgrade.next?`${upgrade.data.xp}/${upgrade.next} · 还需 ${upgrade.remain} 成长值`:`${upgrade.data.xp} · 已达终极形态`}</small>`:`<small class="atlas-price">☀️ ${item.price||"初始赠送"}</small>`}</div><button class="${owned?"soft":"primary"}" ${owned?`data-select-plant="${item.id}"`:`data-buy-plant="${item.id}"`} ${selected||(!owned&&state.suns<item.price)?"disabled":""}>${selected?"✓ 正在照顾":owned?"放入主花园":item.price?`${item.price} ☀️ 解锁`:"初始赠送"}</button></article>`;}).join("")}</div></section>`;}).join("");
  }
  function renderGarden(){
    const plant=plantState(),progress=plantProgress(),signed=state.signIns.includes(iso()),upgrade=plantUpgradeState();
    $("gardenPlant").textContent=plant.icon;$("gardenPlant").style.setProperty("--plant-color",plant.color);$("gardenPlant").classList.toggle("ultimate",plant.stage===plant.stages.length-1&&progress.energy>0);$("gardenLevel").textContent=`Lv.${plant.level}`;$("gardenRarity").textContent=`${plant.rarity}植物 · ${catalogPlant().name}`;$("gardenPlantName").textContent=plant.name;$("energyText").textContent=`${progress.energy} / 100`;$("energyBar").style.width=`${progress.energy}%`;
    $("gardenMessage").textContent=progress.energy<=0?"植物已经休眠。学习不会自动唤醒它，请亲手浇灌恢复活力。":progress.energy<30?"植物有点没精神，需要你亲手浇灌；有足够小太阳就可以连续照顾。":"学习获得小太阳后，由你决定浇灌多少次，没有每日次数上限。";
    $("checkInBtn").disabled=signed;$("checkInBtn").textContent=signed?"✓ 今日已签到":"今日签到 +2 ☀️";$("feedBtn").disabled=state.suns<2;$("feedBtn").textContent="亲手浇灌 −2 ☀️";
    $("plantUpgradeText").textContent=upgrade.next?`${progress.xp} / ${upgrade.next}`:`${progress.xp} · 已满级`;$("plantUpgradeBar").style.width=`${upgrade.percent}%`;$("plantUpgradeHint").textContent=upgrade.next?`距离进化为“${upgrade.item.forms[upgrade.level+1]}”还需 ${upgrade.remain} 成长值。每次亲手浇灌增加 5 点。`:"已经达到终极形态，仍可继续浇灌保持活力。";
    $("growthRoad").innerHTML=catalogPlant().stages.map((icon,index)=>`<article class="${progress.xp>=catalogPlant().thresholds[index]?"unlocked":""}"><span>${icon}</span><b>${esc(catalogPlant().forms[index])}</b><small>${catalogPlant().thresholds[index]}成长值</small></article>`).join("");
    $("ownedPlantGrid").innerHTML=state.plant.owned.map(id=>{const item=catalogPlant(id),data=plantProgress(id),level=growthLevel(data.xp,item.thresholds),info=plantUpgradeState(id);return `<button class="owned-plant ${id===state.plant.selected?"active":""}" data-select-plant="${id}"><span>${data.energy<=0?"🥀":item.stages[level]}</span><div><b>${esc(item.name)}</b><small>${esc(item.forms[level])} · ${data.xp}成长值</small><i class="owned-progress"><u style="width:${info.percent}%"></u></i></div><em>${id===state.plant.selected?"正在照顾":"选择"}</em></button>`;}).join("");
    renderGardenPlots();renderPlantAtlas();
  }

  function renderMarket(){
    $("marketSuns").textContent=state.suns;$("marketFoods").textContent=state.foods;document.querySelectorAll("[data-market-tab]").forEach(button=>button.classList.toggle("active",button.dataset.marketTab===marketTab));
    if(marketTab==="plants"){$("marketNote").innerHTML=`<b>10种植物 · 越稀有越难兑换</b><span>兑换只是开始；有多少小太阳就能浇灌多少次，最高形态需要500成长值。</span>`;$("marketGrid").innerHTML=GROWTH_CATALOG.plants.map((item,index)=>{const owned=state.plant.owned.includes(item.id),selected=state.plant.selected===item.id;return `<article class="market-card rarity-${index}"><div class="market-preview" style="--accent:${item.color}"><span>${item.stages.at(-1)}</span><small>终极形态</small></div><div class="market-copy"><em>${esc(item.rarity)}</em><h2>${esc(item.name)}</h2><p>${esc(item.description)}</p><div class="form-road">${item.stages.map(icon=>`<span>${icon}</span>`).join("→")}</div></div><button class="${owned?"soft":"primary"}" ${owned?`data-select-plant="${item.id}"`:`data-buy-plant="${item.id}"`} ${selected?"disabled":""}>${selected?"✓ 正在照顾":owned?"选择这株植物":item.price?`${item.price} ☀️ 兑换`:"初始赠送"}</button></article>`;}).join("");}
    else{$("marketNote").innerHTML=`<b>3种动物 · 小猫、小狗、小乌龟</b><span>每种动物都有幼崽、少年、成年和完全成长4个真实成长形态。</span>`;$("marketGrid").innerHTML=GROWTH_CATALOG.pets.map((item,index)=>{const owned=state.pets.owned.includes(item.id),selected=state.pets.selected===item.id;return `<article class="market-card pet-product rarity-${index+1}"><div class="market-preview pet-market-preview" style="--accent:${item.color}">${animatedPetMarkup(item,"shop",3)}<small>${esc(item.species)} · 完全成长</small></div><div class="market-copy"><em>${esc(item.species)}</em><h2>${esc(item.name)}</h2><p>${esc(item.description)}</p><div class="pet-growth-preview">${item.forms.map((form,stage)=>`<div>${animatedPetMarkup(item,"road",stage)}<small>${esc(form)}</small></div>`).join("")}</div></div><button class="${owned?"soft":"primary"}" ${owned?`data-select-pet="${item.id}"`:`data-buy-pet="${item.id}"`} ${selected?"disabled":""}>${selected?"✓ 当前伙伴":owned?"选择这只动物":`${item.price} ☀️ 领养`}</button></article>`;}).join("");}
  }

  function carePets(){let changed=false;state.pets.owned.forEach(id=>{const progress=petProgress(id),last=progress.lastUpdate||iso(),days=daysBetween(last,iso());if(days>0){progress.fullness=Math.max(0,progress.fullness-days*4);progress.lastUpdate=iso();changed=true;}});if(changed)save();}
  function renderPets(){
    carePets();const pet=catalogPet();
    if(!pet){$("petCare").innerHTML=`<section class="panel pet-empty"><span>🐾</span><h2>还没有动物伙伴</h2><p>去成长商城选择小猫、小狗或小乌龟。领养后，任务获得的粮食就能派上用场。</p><button class="primary" data-open-market="animals">去动物领养区</button></section>`;$("ownedPetGrid").innerHTML="";return;}
    const progress=petProgress(),stage=growthLevel(progress.xp,pet.thresholds),next=pet.thresholds[stage+1];
    $("petCare").innerHTML=`<section class="pet-stage" style="--pet-color:${pet.color}">${animatedPetMarkup(pet,"large",stage)}<small>${esc(pet.species)} · 第${stage+1}成长阶段</small><h2>${esc(pet.forms[stage])}</h2><p>${progress.fullness<=0?"伙伴饿得没有精神了，请亲手投喂。":"它会呼吸、摇摆和跳跃，点下面的按钮与它互动吧。"}</p><div class="pet-actions care-actions"><button data-pet-action="pat">🖐️ 摸摸</button><button data-pet-action="jump">⬆️ 跳跃</button><button data-pet-action="walk">🐾 散步</button></div></section><section class="panel pet-stats"><div class="pet-wallet">🥣 粮食 <b>${state.foods}</b></div><div class="energy-row"><span>饱食度</span><b>${progress.fullness}/100</b></div><div class="energy-bar"><span style="width:${progress.fullness}%"></span></div><div class="energy-row"><span>成长值</span><b>${progress.xp}${next?` / ${next}`:" · 已达终极"}</b></div><div class="energy-bar pet-xp"><span style="width:${next?Math.min(100,progress.xp/next*100):100}%"></span></div><button class="primary" id="feedPetBtn" ${state.foods<2?"disabled":""}>亲手投喂 −2 🥣</button><small>每次 +6 成长值；没有每日次数上限，有多少粮食就能投喂多少次。终极形态需要420成长值。</small></section>`;
    $("feedPetBtn").onclick=feedPet;
    $("ownedPetGrid").innerHTML=state.pets.owned.map(id=>{const item=catalogPet(id),data=petProgress(id),level=growthLevel(data.xp,item.thresholds);return `<button class="owned-pet ${id===state.pets.selected?"active":""}" data-select-pet="${id}">${animatedPetMarkup(item,"mini",level)}<div><b>${esc(item.name)}</b><small>${esc(item.forms[level])} · ${data.xp}/420</small></div><em>${id===state.pets.selected?"当前伙伴":"选择"}</em></button>`;}).join("");
  }
  function feedPet(){const pet=catalogPet();if(!pet)return;if(state.foods<2)return toast("粮食不足，完成学习任务可以获得粮食");const progress=petProgress();state.foods-=2;progress.fullness=Math.min(100,progress.fullness+20);progress.xp+=6;progress.lastFed=iso();progress.lastUpdate=iso();save();renderHomePet();if($("view-pets").classList.contains("active"))renderPets();if($("view-market").classList.contains("active"))renderMarket();playPetAction("happy");}
  function buyPlant(id){const item=catalogPlant(id);if(state.plant.owned.includes(id))return selectPlant(id);if(state.suns<item.price)return toast(`还需要 ${item.price-state.suns} 个小太阳，坚持完成任务吧`);state.suns-=item.price;state.plant.owned.push(id);state.plant.selected=id;plantProgress(id);state.plant.lastDate=iso();save();toast(`成功解锁 ${item.name}，它已经进入学习守护花园`);if($("view-market").classList.contains("active"))renderMarket();if($("view-garden").classList.contains("active"))renderGarden();}
  function selectPlant(id){if(!state.plant.owned.includes(id))return;state.plant.selected=id;state.plant.lastDate=iso();plantProgress(id);save();toast(`已选择 ${catalogPlant(id).name}`);renderGarden();if(document.getElementById("view-market").classList.contains("active"))renderMarket();}
  function buyPet(id){const item=GROWTH_CATALOG.pets.find(pet=>pet.id===id);if(!item)return;if(state.pets.owned.includes(id))return selectPet(id);if(state.suns<item.price)return toast(`还需要 ${item.price-state.suns} 个小太阳才能领养`);state.suns-=item.price;state.pets.owned.push(id);state.pets.selected=id;state.pets.progress[id]={fullness:70,xp:0,lastFed:"",lastUpdate:iso()};save();toast(`成功领养 ${item.name}，记得用任务粮食亲手投喂`);renderMarket();}
  function selectPet(id){if(!state.pets.owned.includes(id))return;state.pets.selected=id;petProgress(id);save();toast(`已选择 ${catalogPet(id).name} 作为当前伙伴`);renderPets();renderHomePet();if(document.getElementById("view-market").classList.contains("active"))renderMarket();}

  function renderReport(){
    const accuracy=state.quiz.total?Math.round(state.quiz.correct/state.quiz.total*100):0,diagnostic=diagnosticResult(); $("reportCards").innerHTML=`<article><span>📚</span><b>${completedUnits()}</b><small>完成单元</small></article><article><span>🧩</span><b>${state.stageDone.length}</b><small>完成学习步骤</small></article><article><span>🔤</span><b>${state.mastered.length}</b><small>掌握单词</small></article><article><span>🎯</span><b>${accuracy||"—"}${accuracy?"%":""}</b><small>小测正确率</small></article><article><span>🧭</span><b>${diagnostic?diagnostic.recommendedGrade+"年级":"—"}</b><small>诊断建议起点</small></article><article><span>🔡</span><b>${state.abilities.phonicsCompleted.length}/${NATURAL_PHONICS_LESSONS.length}</b><small>拼读闯关</small></article><article><span>🥣</span><b>${state.foods}</b><small>粮食库存</small></article><article><span>🐾</span><b>${state.pets.owned.length}</b><small>动物伙伴</small></article>`;
    const days=[];for(let i=6;i>=0;i--){const d=new Date();d.setDate(d.getDate()-i);const key=iso(d);days.push({name:["日","一","二","三","四","五","六"][d.getDay()],count:state.activity[key]||0,today:i===0});} const max=Math.max(4,...days.map(d=>d.count)); $("weekChart").innerHTML=days.map(d=>`<div class="chart-day"><b>${d.count}</b><span style="height:${Math.max(8,d.count/max*120)}px"></span><small>${d.today?"今天":"周"+d.name}</small></div>`).join("");
    const advice=[]; if(!diagnostic)advice.push("先完成一次入学诊断，找到不太难也不太简单的学习起点。");else if(state.abilities.phonicsCompleted.length<NATURAL_PHONICS_LESSONS.length)advice.push(`诊断建议从${diagnostic.recommendedGrade}年级基础开始；自然拼读已完成 ${state.abilities.phonicsCompleted.length}/${NATURAL_PHONICS_LESSONS.length} 关，可每次练1关。`);if(state.weak.length)advice.push(`本周有 ${state.weak.length} 个词需要复习。每天只挑5个做“看中文说英文”，不要罚抄。`); else advice.push("目前没有积累错词。完成一次单元小测后，系统会给出更准确的复习建议。"); if(streakCount()<3)advice.push("先把目标定为连续3天，每天20分钟；形成节奏比一次学一小时更重要。"); else advice.push(`已经连续学习 ${streakCount()} 天。请多肯定孩子的坚持，不只看分数。`); advice.push("家长可以做听众：请孩子用本单元句型介绍一件真实的事，听懂后追问一个简单问题。"); $("parentAdvice").innerHTML=advice.map((a,i)=>`<article><span>${i+1}</span><p>${a}</p></article>`).join("");
  }

  document.addEventListener("click",e=>{
    const view=e.target.closest("[data-view]"); if(view){route(view.dataset.view);return;}
    const profileChoice=e.target.closest("[data-profile-id]");if(profileChoice){switchProfile(profileChoice.dataset.profileId);return;}
    const outlineGradeButton=e.target.closest("[data-outline-grade]");if(outlineGradeButton){outlineGrade=Number(outlineGradeButton.dataset.outlineGrade);outlineTerm="上册";renderOutline();return;}
    const outlineTermButton=e.target.closest("[data-outline-term]");if(outlineTermButton){outlineTerm=outlineTermButton.dataset.outlineTerm;renderOutline();return;}
    const outlineBookButton=e.target.closest("[data-outline-book]");if(outlineBookButton){const book=COURSE_BOOKS.find(item=>item.id===outlineBookButton.dataset.outlineBook);if(book){outlineGrade=book.grade;outlineTerm=book.term;renderOutline();}return;}
    const outlineUnitButton=e.target.closest("[data-outline-unit]");if(outlineUnitButton){const book=COURSE_BOOKS.find(item=>item.grade===outlineGrade&&item.term===outlineTerm);if(!book)return;state.bookId=book.id;state.unitIndex=Number(outlineUnitButton.dataset.outlineUnit);state.stage=outlineUnitButton.dataset.outlineStage||"overview";selectedGrade=book.grade;selectedTerm=book.term;save();quizAnswers={};route("unit");return;}
    const beginnerTabButton=e.target.closest("[data-beginner-tab]");if(beginnerTabButton){beginnerTab=beginnerTabButton.dataset.beginnerTab;renderBeginner();return;}
    const letterKnown=e.target.closest("[data-letter-known]");if(letterKnown){const letter=letterKnown.dataset.letterKnown;if(!state.beginner.letters.includes(letter)){state.beginner.letters.push(letter);save();}renderBeginner();return;}
    const beginnerAbility=e.target.closest("[data-beginner-open-ability]");if(beginnerAbility){abilityTab="natural-phonics";renderAbilities();route("abilities");return;}
    const paperGradeButton=e.target.closest("[data-paper-grade]");if(paperGradeButton){paperGrade=Number(paperGradeButton.dataset.paperGrade);paperUnitIndex=0;paperActiveId="";paperAnswers={};paperChecked=false;renderPapers();return;}
    const paperTermButton=e.target.closest("[data-paper-term]");if(paperTermButton){paperTerm=paperTermButton.dataset.paperTerm;paperUnitIndex=0;paperActiveId="";paperAnswers={};paperChecked=false;renderPapers();return;}
    const paperUnitButton=e.target.closest("[data-paper-unit]");if(paperUnitButton){paperUnitIndex=Number(paperUnitButton.dataset.paperUnit);paperActiveId="";paperAnswers={};paperChecked=false;renderPapers();return;}
    const paperStart=e.target.closest("[data-paper-start]");if(paperStart){paperActiveId=paperStart.dataset.paperStart;paperAnswers={};paperChecked=false;renderPapers();setTimeout(()=>$("paperExamWorkspace")?.scrollIntoView({behavior:"smooth",block:"start"}),30);return;}
    const paperSay=e.target.closest("[data-paper-say]");if(paperSay){speak(paperSay.dataset.paperSay);return;}
    const paperAnswer=e.target.closest("[data-paper-answer]");if(paperAnswer&&!paperChecked){paperAnswers[Number(paperAnswer.dataset.paperAnswer)]=paperAnswer.dataset.paperValue;renderPapers();return;}
    const paperSubmit=e.target.closest("[data-paper-submit]");if(paperSubmit){submitPaper();return;}
    const paperRetry=e.target.closest("[data-paper-retry]");if(paperRetry){paperAnswers={};paperChecked=false;renderPapers();setTimeout(()=>$("paperExamWorkspace")?.scrollIntoView({behavior:"smooth",block:"start"}),30);return;}
    const paperClose=e.target.closest("[data-paper-close]");if(paperClose){paperActiveId="";paperAnswers={};paperChecked=false;renderPapers();return;}
    const abilityTabButton=e.target.closest("[data-ability-tab]");if(abilityTabButton){abilityTab=abilityTabButton.dataset.abilityTab;renderAbilities();return;}
    const diagnosticAnswer=e.target.closest("[data-diagnostic-answer]");if(diagnosticAnswer&&!state.abilities.diagnostic){diagnosticAnswers[Number(diagnosticAnswer.dataset.diagnosticAnswer)]=diagnosticAnswer.dataset.answerValue;renderAbilities();return;}
    const diagnosticPageButton=e.target.closest("[data-diagnostic-page]");if(diagnosticPageButton){diagnosticPage=Number(diagnosticPageButton.dataset.diagnosticPage);renderAbilities();return;}
    const diagnosticSubmit=e.target.closest("[data-diagnostic-submit]");if(diagnosticSubmit){submitDiagnostic();return;}
    const diagnosticReset=e.target.closest("[data-diagnostic-reset]");if(diagnosticReset){diagnosticAnswers={};diagnosticPage=0;state.abilities.diagnostic=null;save();renderAbilities();return;}
    const phonicsLesson=e.target.closest("[data-ability-phonics-lesson]");if(phonicsLesson){abilityPhonicsLesson=phonicsLesson.dataset.abilityPhonicsLesson;abilityPhonicsAnswers={};abilityPhonicsChecked=false;renderAbilities();return;}
    const phonicsAnswer=e.target.closest("[data-ability-phonics-answer]");if(phonicsAnswer&&!abilityPhonicsChecked){abilityPhonicsAnswers[Number(phonicsAnswer.dataset.phonicsQuestion)]=phonicsAnswer.dataset.abilityPhonicsAnswer;renderAbilities();return;}
    const phonicsSubmit=e.target.closest("[data-ability-phonics-submit]");if(phonicsSubmit){const lesson=NATURAL_PHONICS_LESSONS.find(item=>item.id===abilityPhonicsLesson),count=1+(NATURAL_PHONICS_DRILLS[lesson?.id]||[]).length;if(Object.keys(abilityPhonicsAnswers).length<count)return toast("请先完成本关全部8题");abilityPhonicsChecked=true;renderAbilities();return;}
    const phonicsRetry=e.target.closest("[data-ability-phonics-retry]");if(phonicsRetry){abilityPhonicsAnswers={};abilityPhonicsChecked=false;renderAbilities();return;}
    const phonicsPass=e.target.closest("[data-ability-phonics-pass]");if(phonicsPass){const key=phonicsPass.dataset.abilityPhonicsPass;if(!state.abilities.phonicsCompleted.includes(key)){state.abilities.phonicsCompleted.push(key);abilityReward(`natural-phonics:${key}`,2,"完成一个自然拼读关卡");}renderAbilities();return;}
    const listeningAnswer=e.target.closest("[data-listening-answer]");if(listeningAnswer&&!abilityListeningChecked){abilityListeningAnswers[Number(listeningAnswer.dataset.listeningAnswer)]=listeningAnswer.dataset.answerValue;renderAbilities();return;}
    const listeningSubmit=e.target.closest("[data-listening-submit]");if(listeningSubmit){submitAbilityListening();return;}
    const listeningRetry=e.target.closest("[data-listening-retry]");if(listeningRetry){abilityListeningAnswers={};abilityListeningChecked=false;renderAbilities();return;}
    const speakingRecord=e.target.closest("[data-speaking-record]");if(speakingRecord){startSpeakingRecording(Number(speakingRecord.dataset.speakingRecord),speakingRecord);return;}
    const speakingComplete=e.target.closest("[data-speaking-complete]");if(speakingComplete){completeSpeaking(Number(speakingComplete.dataset.speakingComplete));return;}
    const grammarTopic=e.target.closest("[data-grammar-topic]");if(grammarTopic){grammarTopicId=grammarTopic.dataset.grammarTopic;grammarAnswers={};grammarResult=null;renderGrammar();return;}
    const grammarOption=e.target.closest("[data-grammar-option]");if(grammarOption){grammarAnswers[Number(grammarOption.dataset.grammarOption)]=grammarOption.dataset.grammarValue;grammarResult=null;renderGrammar();return;}
    const grammarSubmit=e.target.closest("#submitGrammarQuiz");if(grammarSubmit){submitGrammarQuiz();return;}
    const action=e.target.closest("[data-action]"); if(action?.dataset.action==="print"){window.print();return;}
    const grade=e.target.closest("[data-grade]"); if(grade){selectedGrade=Number(grade.dataset.grade);renderCourses();return;}
    const term=e.target.closest("[data-term]"); if(term){selectedTerm=term.dataset.term;renderCourses();return;}
    const unit=e.target.closest("[data-unit-book]"); if(unit){state.bookId=unit.dataset.unitBook;state.unitIndex=Number(unit.dataset.unitIndex);state.stage="overview";selectedGrade=bookNow().grade;selectedTerm=bookNow().term;save();quizAnswers={};route("unit");return;}
    const stage=e.target.closest("[data-stage]"); if(stage){state.stage=stage.dataset.stage;save();quizAnswers={};renderUnit();return;}
    const open=e.target.closest("[data-open-stage],[data-daily-stage]"); if(open){state.stage=open.dataset.openStage||open.dataset.dailyStage;save();route("unit");return;}
    const dictation=e.target.closest("[data-open-dictation]"); if(dictation){openDictation(dictation.dataset.openDictation);return;}
    const review=e.target.closest("[data-open-review]"); if(review){openReview();return;}
    const openMarket=e.target.closest("[data-open-market]"); if(openMarket){marketTab=openMarket.dataset.openMarket;route("market");return;}
    const market=e.target.closest("[data-market-tab]"); if(market){marketTab=market.dataset.marketTab;renderMarket();return;}
    const buyPlantButton=e.target.closest("[data-buy-plant]"); if(buyPlantButton){buyPlant(buyPlantButton.dataset.buyPlant);return;}
    const selectPlantButton=e.target.closest("[data-select-plant]"); if(selectPlantButton){selectPlant(selectPlantButton.dataset.selectPlant);return;}
    const buyPetButton=e.target.closest("[data-buy-pet]"); if(buyPetButton){buyPet(buyPetButton.dataset.buyPet);return;}
    const selectPetButton=e.target.closest("[data-select-pet]"); if(selectPetButton){selectPet(selectPetButton.dataset.selectPet);return;}
    const petAction=e.target.closest("[data-pet-action]"); if(petAction){playPetAction(petAction.dataset.petAction);return;}
    const petFeed=e.target.closest("[data-pet-feed]"); if(petFeed){feedPet();return;}
    const dictionaryTab=e.target.closest("[data-dictionary-section]"); if(dictionaryTab){dictionarySection=dictionaryTab.dataset.dictionarySection;dictionaryLetter="all";dictionaryQuery="";dictionaryLimit=48;renderDictionary();return;}
    const dictionaryLetterButton=e.target.closest("[data-dictionary-letter]"); if(dictionaryLetterButton){dictionaryLetter=dictionaryLetterButton.dataset.dictionaryLetter;dictionaryLimit=48;renderDictionary();return;}
    const filter=e.target.closest("[data-word-filter]"); if(filter){memoryFilter=filter.dataset.wordFilter;memoryIndex=0;memoryFlipped=false;renderWords();return;}
    const dot=e.target.closest("[data-word-index]"); if(dot){memoryIndex=Number(dot.dataset.wordIndex);memoryFlipped=false;renderWords();}
  });
  $("profileButton").onclick=openProfileDialog;
  $("closeProfileDialog").onclick=closeProfileDialog;
  $("profileDialog").addEventListener("click",event=>{if(event.target===$("profileDialog"))closeProfileDialog();});
  $("installAppButton").onclick=requestAppInstall;
  $("nativeInstallButton").onclick=requestAppInstall;
  $("closeInstallDialog").onclick=closeInstallDialog;
  $("appInstallDialog").addEventListener("click",event=>{if(event.target===$("appInstallDialog"))closeInstallDialog();});
  $("dismissInstallCard").onclick=()=>{sessionStorage.setItem(`${STORE}:hide-install`,iso());$("installCard").hidden=true;};
  $("downloadAudioPack").onclick=downloadAudioPack;
  $("continueBtn").onclick=()=>{state.stage=nextStage().id;save();route("unit");};
  $("dictionarySearch").addEventListener("input",event=>{dictionaryQuery=event.target.value;dictionaryLetter="all";dictionaryLimit=48;renderDictionary();$("dictionarySearch").focus();});
  $("dictionaryMore").onclick=()=>{dictionaryLimit+=48;renderDictionary();};
  $("closePracticeDialog").onclick=()=>{$("practiceDialog").close?.();$("practiceDialog").classList.remove("open");};
  $("practiceDialog").addEventListener("click",event=>{if(event.target===$("practiceDialog"))$("closePracticeDialog").click();});
  $("wordKnow").onclick=()=>moveWord(true); $("wordAgain").onclick=()=>moveWord(false);
  $("claimDailyBonus").onclick=()=>{const key=`${iso()}:${unitKey()}`,todayTasks=activeTasks();if(dailyComplete()<todayTasks.length||state.bonuses.includes(key))return;state.bonuses.push(key);reward(3,"完成今日全部任务",2);renderToday();};
  $("checkInBtn").onclick=()=>{if(state.signIns.includes(iso()))return;state.signIns.push(iso());reward(2,"今日签到成功");renderGarden();};
  $("feedBtn").onclick=()=>{const progress=plantProgress();if(state.suns<2)return toast("小太阳不足，先完成学习任务吧");state.suns-=2;progress.energy=Math.min(100,progress.energy+20);progress.xp+=5;progress.lastFed=iso();save();toast("💧 浇灌成功，植物成长值 +5；小太阳充足时可以继续浇灌");renderGarden();};

  carePlant();carePets();renderHeader();renderHome();setupAppInstall();setupAudioPack();
  if("serviceWorker" in navigator) window.addEventListener("load",()=>navigator.serviceWorker.register("service-worker.js?v=34",{updateViaCache:"none"}).then(reg=>reg.update()).catch(()=>{}));
})();
