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
  const defaultState = { bookId:"g4a", unitIndex:0, stage:"overview", suns:0, foods:0, mastered:[], weak:[], phonicsDone:[], stageDone:[], dailyDone:[], bonuses:[], signIns:[], activity:{}, quiz:{correct:0,total:0}, beginner:{letters:[]}, grammar:{completed:[],quizBest:{},attempts:{}}, abilities:{diagnostic:null,phonicsCompleted:[],listeningCompleted:[],speakingCompleted:[],rewarded:[]}, papers:{scores:{},attempts:{}}, bridge:{week:1,done:[],rewarded:[],abilityBest:0}, plant:{selected:"sunflower",owned:["sunflower"],progress:{sunflower:{energy:70,xp:0,lastFed:""}},lastDate:iso()}, pets:{selected:"",owned:[],progress:{}} };
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
    const rawBridge=raw.bridge||{},bridge={...defaultState.bridge,...rawBridge,done:[...(rawBridge.done||[])],rewarded:[...(rawBridge.rewarded||[])]};
    return {...defaultState,...raw,suns:TEST_MODE?TEST_BALANCE:persistedEconomy.suns,foods:TEST_MODE?TEST_BALANCE:persistedEconomy.foods,plant,pets,quiz:{...defaultState.quiz,...(raw.quiz||{})},beginner,grammar,abilities,papers,bridge};
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
  let bridgeAbilityAnswers = {};
  let bridgeAbilityChecked = false;
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
  const BRIDGE_WEEKS = [
    {week:1,phase:"基础校准",title:"词汇诊断与拼读补漏",goal:"找出真正不会的词，建立音—形—义联系。",output:"完成六年级词汇初测，建立个人错词清单。",days:["检测60个小学高频词，标出不确定词","复习短元音、长元音和常见字母组合","近形词辨析：right/light、read/red、there/three","完成六年级重点词卡20个并口头造句","周测30题并整理本周10个错词"]},
    {week:2,phase:"基础校准",title:"冠词、名词与代词",goal:"分清 a/an/the、可数与不可数、单复数及代词指代。",output:"能解释每个限定词和代词为什么这样使用。",days:["学习a、an、the和零冠词的使用场景","整理可数名词复数规则与不规则复数","练习some/any、many/much和数量表达","代词主格、宾格、物主代词对比练习","完成专项20题和5句订正"]},
    {week:3,phase:"基础校准",title:"小学核心时态总复习",goal:"看时间标志词判断一般现在、现在进行、一般过去和一般将来。",output:"制作四时态对比表，能写8个正确句子。",days:["一般现在时与第三人称单数","现在进行时：be + doing","一般过去时与20个不规则动词","一般将来时：will / be going to","四时态混合25题与错因归类"]},
    {week:4,phase:"专项突破",title:"动词词形与主谓一致",goal:"不靠感觉，依据主语和句型选择正确动词。",output:"掌握can后原形、三单、过去式、动名词的选择。",days:["主语是I/you/we/they时的动词","he/she/it与第三人称单数","情态动词can/must/should后用原形","like doing、want to do等常见搭配","易错词形综合30题"]},
    {week:5,phase:"专项突破",title:"介词和固定搭配",goal:"掌握时间、地点、方向介词以及高频动词搭配。",output:"能在完整句子中正确选择介词和固定短语。",days:["in/on/at时间介词对比","方位介词与路线表达","for/from/with/by的常见用法","take photos、go swimming等固定搭配","介词与搭配综合20题"]},
    {week:6,phase:"专项突破",title:"形容词、副词与比较",goal:"理解修饰对象，正确使用原级、比较级和最高级。",output:"能比较人物、动物、地点并说明依据。",days:["形容词修饰名词，副词修饰动作","规则比较级和最高级变化","big/bigger、good/better等易错变化","as...as与than句型","完成比较表达15句和20题"]},
    {week:7,phase:"专项突破",title:"句子结构与正确语序",goal:"建立主语—谓语—宾语框架，解决问句和连词成句。",output:"能独立还原陈述句、一般疑问句和特殊疑问句。",days:["找句子主干：谁做什么","be动词、助动词和情态动词问句","特殊疑问词+一般疑问句语序","频率副词和时间地点的位置","连词成句与改错25题"]},
    {week:8,phase:"专项突破",title:"连接词与初中衔接从句",goal:"用and、but、because、so、if、when连接完整信息。",output:"能读懂并写出包含原因、转折和条件的长句。",days:["and/but/or连接并列信息","because与so表达原因结果","if和when引导的时间条件信息","who/where等从句入门与陈述语序","长句拆分、翻译和合并20题"]},
    {week:9,phase:"综合运用",title:"阅读理解：定位证据",goal:"先看问题，再从原文找人物、时间、地点和动作证据。",output:"完成3篇分级阅读并给每题圈出证据句。",days:["标题和首句预测文章主题","人物与代词指代定位","时间顺序和事件排序","根据上下文猜生词","限时完成3篇阅读15题"]},
    {week:10,phase:"综合运用",title:"完形与语境选词",goal:"同时检查词义、词形、搭配和上下文逻辑。",output:"形成“四步选词法”，不再只凭眼熟选择。",days:["先通读再判断词性","上下句中的时间和代词线索","近义词、近形词和固定搭配辨析","把答案放回全文检查逻辑","完成2篇完形和20道语境题"]},
    {week:11,phase:"综合运用",title:"写作与口语表达",goal:"从正确的5句话扩展到结构清楚的60—80词短文。",output:"完成自我介绍、计划、经历三类短文和口头复述。",days:["五句法：人物、时间、地点、事情、感受","用first/then/finally组织顺序","一般过去与一般将来写作对比","检查大小写、标点、拼写和时态","完成1篇限时写作并录音复述"]},
    {week:12,phase:"模拟冲刺",title:"综合模拟与错题回炉",goal:"完成限时模拟，按错误类型回到对应模块补漏。",output:"完成2套综合卷，形成个人小升初最后复习清单。",days:["模拟卷A：限时完成并标记犹豫题","按词汇/语法/阅读/写作统计失分","回到对应课程重做错题","模拟卷B：同类题再次检测","整理最终20词、10句型和5条语法提醒"]}
  ];
  const BRIDGE_KNOWLEDGE = [
    ["词汇拼读","六年级重点词、近形近音词、不规则动词、固定搭配","单词本 · 词典库"],
    ["名词与限定词","a/an/the、可数不可数、单复数、some/any、many/much","语法课堂"],
    ["代词","主格、宾格、形容词性物主代词、指示代词、疑问代词","语法课堂"],
    ["动词与时态","一般现在、现在进行、一般过去、一般将来、主谓一致","语法课堂 · 能力中心"],
    ["介词与搭配","时间地点介词、方向表达、动词短语与常用搭配","课程 · 每日任务"],
    ["形容词与副词","修饰关系、比较级、最高级、频率和程度","语法课堂"],
    ["句子与从句","陈述句、疑问句、语序、连接词、简单从句","语法课堂 · 课程"],
    ["综合运用","听力抓关键词、阅读证据、完形语境、60—80词写作","能力中心 · 真题考卷"]
  ];
  const BRIDGE_ABILITY_TAB={id:"bridge-check",icon:"🎓",name:"小升初综合",tip:"20题衔接检测"};
  const BRIDGE_ABILITY_QUESTIONS=[
    {area:"近形词",q:"Please turn ____ at the crossing.",options:["right","light","night"],answer:"right",why:"turn right 表示向右转；light是灯或轻的，night是夜晚。"},
    {area:"冠词",q:"Amy wants to be ____ English teacher.",options:["a","an","the"],answer:"an",why:"English以元音音素开头，表示一位英语老师用an。"},
    {area:"名词",q:"There are three ____ in the box.",options:["knife","knifes","knives"],answer:"knives",why:"knife的复数通常把fe变为ves。"},
    {area:"数量词",q:"How ____ milk do you need?",options:["many","much","often"],answer:"much",why:"milk是不可数名词，询问数量用how much。"},
    {area:"代词",q:"This book is not mine. It is ____.",options:["her","hers","she"],answer:"hers",why:"空格后没有名词，要用名词性物主代词hers。"},
    {area:"一般现在时",q:"My father ____ to work by bus every day.",options:["go","goes","went"],answer:"goes",why:"every day提示一般现在时，主语my father是第三人称单数。"},
    {area:"现在进行时",q:"Listen! The children ____ an English song.",options:["sing","sang","are singing"],answer:"are singing",why:"Listen提示动作正在发生，使用be + doing。"},
    {area:"一般过去时",q:"We ____ a science museum yesterday.",options:["visit","visited","will visit"],answer:"visited",why:"yesterday提示一般过去时，visit变为visited。"},
    {area:"一般将来时",q:"I ____ my grandparents next Sunday.",options:["visit","visited","will visit"],answer:"will visit",why:"next Sunday提示将来，使用will + 动词原形。"},
    {area:"动词搭配",q:"Would you like ____ with us?",options:["come","to come","coming"],answer:"to come",why:"would like to do是固定结构。"},
    {area:"介词",q:"The sports meeting is ____ Friday afternoon.",options:["in","on","at"],answer:"on",why:"具体到星期几的上午、下午或晚上，使用on。"},
    {area:"比较级",q:"This river is ____ than that one.",options:["long","longer","longest"],answer:"longer",why:"than是比较级的重要标志。"},
    {area:"副词",q:"Tom runs very ____.",options:["fast","fastly","faster"],answer:"fast",why:"fast本身既可作形容词也可作副词，不加ly。"},
    {area:"主谓一致",q:"Neither Lily nor her friends ____ late.",options:["is","are","am"],answer:"are",why:"neither...nor采用就近原则，friends是复数。"},
    {area:"特殊疑问句",q:"____ did you go last weekend? — I went to Xiamen.",options:["What","Where","When"],answer:"Where",why:"回答是地点Xiamen，因此用Where询问。"},
    {area:"语序",q:"选择正确的句子。",options:["Can you tell me where the library is?","Can you tell me where is the library?","Where the library is?"],answer:"Can you tell me where the library is?",why:"间接问句中使用陈述语序where + 主语 + be动词。"},
    {area:"连接词",q:"I stayed at home ____ it was raining heavily.",options:["because","but","or"],answer:"because",why:"后半句说明待在家的原因。"},
    {area:"阅读",q:"Ben missed the bus, so he walked to school. Ben为什么步行？",options:["他错过了公交车","他喜欢运动","学校很近"],answer:"他错过了公交车",why:"missed the bus是步行上学的直接原因。"},
    {area:"语境",q:"The box is too ____ for me to carry. I need help.",options:["heavy","hungry","healthy"],answer:"heavy",why:"需要别人帮忙搬箱子，说明箱子太重。"},
    {area:"写作",q:"写过去的旅行经历，最合适的开头是？",options:["Last Sunday, I went to Fuzhou with my family.","Next Sunday, I will go to Fuzhou.","I go to Fuzhou every day."],answer:"Last Sunday, I went to Fuzhou with my family.",why:"题目要求过去经历，应有过去时间和过去式went。"}
  ];
  const BEGINNER_TABS = [
    {id:"alphabet",icon:"🔠",name:"字母认识表",tip:"26个大小写字母"},
    {id:"sounds",icon:"👂",name:"字母与声音",tip:"分清名称和常见音"},
    {id:"phonics",icon:"🧩",name:"自然拼读起步",tip:"从声音拼成单词"},
    {id:"ipa",icon:"👄",name:"音标课堂",tip:"48个标准音素"}
  ];
  const ALPHABET_LESSONS = [
    ["A","a","/eɪ/","apple","苹果","a 在 apple 中常发 /æ/"],["B","b","/biː/","book","书","b 常发 /b/"],["C","c","/siː/","cat","猫","c 在 cat 中发 /k/"],["D","d","/diː/","dog","狗","d 常发 /d/"],["E","e","/iː/","egg","鸡蛋","e 在 egg 中常发 /e/"],["F","f","/ef/","fish","鱼","f 常发 /f/"],["G","g","/dʒiː/","girl","女孩","g 在 girl 中发 /g/"],["H","h","/eɪtʃ/","hand","手","h 常发 /h/"],["I","i","/aɪ/","ink","墨水","i 在 ink 中常发 /ɪ/"],["J","j","/dʒeɪ/","juice","果汁","j 常发 /dʒ/"],["K","k","/keɪ/","kite","风筝","k 常发 /k/"],["L","l","/el/","lion","狮子","l 常发 /l/"],["M","m","/em/","milk","牛奶","m 常发 /m/"],["N","n","/en/","nose","鼻子","n 常发 /n/"],["O","o","/əʊ/","orange","橙子","o 在 orange 中常发 /ɒ/"],["P","p","/piː/","pen","钢笔","p 常发 /p/"],["Q","q","/kjuː/","queen","女王","qu 常发 /kw/"],["R","r","/ɑː/","red","红色","r 常发 /r/"],["S","s","/es/","sun","太阳","s 常发 /s/"],["T","t","/tiː/","tiger","老虎","t 常发 /t/"],["U","u","/juː/","umbrella","雨伞","u …54614 tokens truncated…}">${animatedPetMarkup(item,"mini",level)}<div><b>${esc(item.name)}</b><small>${esc(item.forms[level])} · ${data.xp}/420</small></div><em>${id===state.pets.selected?"当前伙伴":"选择"}</em></button>`;}).join("");
  }
  function feedPet(){const pet=catalogPet();if(!pet)return;if(state.foods<2)return toast("粮食不足，完成学习任务可以获得粮食");const progress=petProgress();state.foods-=2;progress.fullness=Math.min(100,progress.fullness+20);progress.xp+=6;progress.lastFed=iso();progress.lastUpdate=iso();save();renderHomePet();if($("view-pets").classList.contains("active"))renderPets();if($("view-market").classList.contains("active"))renderMarket();playPetAction("happy");}
  function buyPlant(id){const item=catalogPlant(id);if(state.plant.owned.includes(id))return selectPlant(id);if(state.suns<item.price)return toast(`还需要 ${item.price-state.suns} 个小太阳，坚持完成任务吧`);state.suns-=item.price;state.plant.owned.push(id);state.plant.selected=id;plantProgress(id);state.plant.lastDate=iso();save();toast(`成功解锁 ${item.name}，它已经进入学习守护花园`);if($("view-market").classList.contains("active"))renderMarket();if($("view-garden").classList.contains("active"))renderGarden();}
  function selectPlant(id){if(!state.plant.owned.includes(id))return;state.plant.selected=id;state.plant.lastDate=iso();plantProgress(id);save();toast(`已选择 ${catalogPlant(id).name}`);renderGarden();if(document.getElementById("view-market").classList.contains("active"))renderMarket();}
  function buyPet(id){const item=GROWTH_CATALOG.pets.find(pet=>pet.id===id);if(!item)return;if(state.pets.owned.includes(id))return selectPet(id);if(state.suns<item.price)return toast(`还需要 ${item.price-state.suns} 个小太阳才能领养`);state.suns-=item.price;state.pets.owned.push(id);state.pets.selected=id;state.pets.progress[id]={fullness:70,xp:0,lastFed:"",lastUpdate:iso()};save();toast(`成功领养 ${item.name}，记得用任务粮食亲手投喂`);renderMarket();}
  function selectPet(id){if(!state.pets.owned.includes(id))return;state.pets.selected=id;petProgress(id);save();toast(`已选择 ${catalogPet(id).name} 作为当前伙伴`);renderPets();renderHomePet();if(document.getElementById("view-market").classList.contains("active"))renderMarket();}

  function renderReport(){
    const accuracy=state.quiz.total?Math.round(state.quiz.correct/state.quiz.total*100):0,diagnostic=diagnosticResult();renderBridgeBanner("reportBridgeBanner",bookNow().grade===6,"成长日报"); $("reportCards").innerHTML=`<article><span>📚</span><b>${completedUnits()}</b><small>完成单元</small></article><article><span>🧩</span><b>${state.stageDone.length}</b><small>完成学习步骤</small></article><article><span>🔤</span><b>${state.mastered.length}</b><small>掌握单词</small></article><article><span>🎯</span><b>${accuracy||"—"}${accuracy?"%":""}</b><small>小测正确率</small></article><article><span>🧭</span><b>${diagnostic?diagnostic.recommendedGrade+"年级":"—"}</b><small>诊断建议起点</small></article><article><span>🔡</span><b>${state.abilities.phonicsCompleted.length}/${NATURAL_PHONICS_LESSONS.length}</b><small>拼读闯关</small></article><article><span>🎓</span><b>${bridgeDoneCount()}/60</b><small>小升初强化</small></article><article><span>🐾</span><b>${state.pets.owned.length}</b><small>动物伙伴</small></article>`;
    const days=[];for(let i=6;i>=0;i--){const d=new Date();d.setDate(d.getDate()-i);const key=iso(d);days.push({name:["日","一","二","三","四","五","六"][d.getDay()],count:state.activity[key]||0,today:i===0});} const max=Math.max(4,...days.map(d=>d.count)); $("weekChart").innerHTML=days.map(d=>`<div class="chart-day"><b>${d.count}</b><span style="height:${Math.max(8,d.count/max*120)}px"></span><small>${d.today?"今天":"周"+d.name}</small></div>`).join("");
    const advice=[];if(bookNow().grade===6)advice.push(`小升初强化已完成 ${bridgeDoneCount()}/60 项，当前第${state.bridge.week}周；请先保证每周5项全部订正，再进入下一周。`); if(!diagnostic)advice.push("先完成一次入学诊断，找到不太难也不太简单的学习起点。");else if(state.abilities.phonicsCompleted.length<NATURAL_PHONICS_LESSONS.length)advice.push(`诊断建议从${diagnostic.recommendedGrade}年级基础开始；自然拼读已完成 ${state.abilities.phonicsCompleted.length}/${NATURAL_PHONICS_LESSONS.length} 关，可每次练1关。`);if(state.weak.length)advice.push(`本周有 ${state.weak.length} 个词需要复习。每天只挑5个做“看中文说英文”，不要罚抄。`); else advice.push("目前没有积累错词。完成一次单元小测后，系统会给出更准确的复习建议。"); if(streakCount()<3)advice.push("先把目标定为连续3天，每天20分钟；形成节奏比一次学一小时更重要。"); else advice.push(`已经连续学习 ${streakCount()} 天。请多肯定孩子的坚持，不只看分数。`); advice.push("家长可以做听众：请孩子用本单元句型介绍一件真实的事，听懂后追问一个简单问题。"); $("parentAdvice").innerHTML=advice.map((a,i)=>`<article><span>${i+1}</span><p>${a}</p></article>`).join("");
  }

  document.addEventListener("click",e=>{
    const view=e.target.closest("[data-view]"); if(view){route(view.dataset.view);return;}
    const profileChoice=e.target.closest("[data-profile-id]");if(profileChoice){switchProfile(profileChoice.dataset.profileId);return;}
    const bridgeWeekButton=e.target.closest("[data-bridge-week]");if(bridgeWeekButton){state.bridge.week=Number(bridgeWeekButton.dataset.bridgeWeek);save();renderBridge();return;}
    const bridgeTaskButton=e.target.closest("[data-bridge-task]");if(bridgeTaskButton){const key=bridgeTaskButton.dataset.bridgeTask,week=Number(key.match(/^w(\d+):/)?.[1]||0);if(state.bridge.rewarded.includes(week))return toast("本周奖励已经领取，完成记录已锁定");const done=state.bridge.done.includes(key);state.bridge.done=done?state.bridge.done.filter(item=>item!==key):[...state.bridge.done,key];if(!done)activity();save();if($("view-bridge").classList.contains("active"))renderBridge();if($("view-today").classList.contains("active"))renderToday();return;}
    const bridgeClaim=e.target.closest("[data-bridge-claim]");if(bridgeClaim){const week=Number(bridgeClaim.dataset.bridgeClaim),complete=BRIDGE_WEEKS[week-1].days.every((_,index)=>state.bridge.done.includes(bridgeTaskKey(week,index)));if(!complete)return toast("请先完成本周5项强化任务");if(state.bridge.rewarded.includes(week))return toast("本周奖励已经领取");state.bridge.rewarded.push(week);state.bridge.week=Math.min(12,week+1);reward(3,`完成小升初强化第${week}周`,2);renderBridge();return;}
    const bridgeOpen=e.target.closest("[data-bridge-open]");if(bridgeOpen){openBridgeModule(bridgeOpen.dataset.bridgeOpen);return;}
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
    const bridgeAbilityAnswer=e.target.closest("[data-bridge-ability-answer]");if(bridgeAbilityAnswer&&!bridgeAbilityChecked){bridgeAbilityAnswers[Number(bridgeAbilityAnswer.dataset.bridgeAbilityAnswer)]=bridgeAbilityAnswer.dataset.answerValue;renderAbilities();return;}
    const bridgeAbilitySubmit=e.target.closest("[data-bridge-ability-submit]");if(bridgeAbilitySubmit){submitBridgeAbility();return;}
    const bridgeAbilityRetry=e.target.closest("[data-bridge-ability-retry]");if(bridgeAbilityRetry){bridgeAbilityAnswers={};bridgeAbilityChecked=false;renderAbilities();return;}
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
  if("serviceWorker" in navigator) window.addEventListener("load",()=>navigator.serviceWorker.register("service-worker.js?v=35",{updateViaCache:"none"}).then(reg=>reg.update()).catch(()=>{}));
})();

