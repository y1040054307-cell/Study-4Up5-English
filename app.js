(() => {
  "use strict";

  const STORE = "sunny-english-longterm-v3";
  const iso = (date = new Date()) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`;
  const defaultState = { bookId:"g4a", unitIndex:0, stage:"overview", suns:0, mastered:[], weak:[], phonicsDone:[], stageDone:[], dailyDone:[], bonuses:[], signIns:[], activity:{}, quiz:{correct:0,total:0}, plant:{energy:70,xp:0,lastDate:iso()} };
  const load = () => { try { return { ...defaultState, ...JSON.parse(localStorage.getItem(STORE)||"{}"), plant:{...defaultState.plant,...(JSON.parse(localStorage.getItem(STORE)||"{}").plant||{})}, quiz:{...defaultState.quiz,...(JSON.parse(localStorage.getItem(STORE)||"{}").quiz||{})} }; } catch { return structuredClone(defaultState); } };
  let state = load();
  let selectedGrade = Number(state.bookId[1]) || 4;
  let selectedTerm = state.bookId.endsWith("a") ? "上册" : "下册";
  let memoryFilter = "current";
  let memoryIndex = 0;
  let memoryFlipped = false;
  let phonicsGroup = "short";
  let dictionarySection = "primary";
  let dictionaryLetter = "all";
  let dictionaryLimit = 48;
  let dictionaryQuery = "";
  let quizAnswers = {};
  let toastTimer;

  const $ = (id) => document.getElementById(id);
  const esc = (v) => String(v).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;");
  const bookNow = () => COURSE_BOOKS.find(b => b.id === state.bookId) || COURSE_BOOKS[2];
  const unitNow = () => bookNow().units[state.unitIndex] || bookNow().units[0];
  const unitKey = () => unitNow().id;
  const todayKey = (task) => `${iso()}:${unitKey()}:${task}`;
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
    {id:"quiz",icon:"🎯",title:"完成5分钟小测",detail:"错题不是失败，会自动进入复习清单",stage:"practice"},
    {id:"zh2en",icon:"✍️",title:"看中文写英文",detail:"完成本单元5个词的英文默写，注意拼写",stage:"words"},
    {id:"en2zh",icon:"🀄",title:"看英文写中文",detail:"写出5个英文单词的准确中文意思",stage:"words"}
  ];

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
  const PHONEME_VOICE={"/ɪ/":"ih","/e/":"eh","/æ/":"aah","/ʌ/":"uh","/ɒ/":"aw","/ʊ/":"uuh","/ə/":"uh","/iː/":"eee","/ɑː/":"ahh","/ɔː/":"aw","/uː/":"ooo","/ɜː/":"err","/eɪ/":"ay","/aɪ/":"eye","/ɔɪ/":"oy","/əʊ/":"oh","/aʊ/":"ow","/ɪə/":"ear","/eə/":"air","/ʊə/":"oor","/p/":"puh","/b/":"buh","/t/":"tuh","/d/":"duh","/k/":"kuh","/g/":"guh","/f/":"fff","/v/":"vvv","/θ/":"thh","/ð/":"thuh","/s/":"sss","/z/":"zzz","/ʃ/":"shh","/ʒ/":"zhh","/h/":"hhh","/tʃ/":"ch","/dʒ/":"juh","/m/":"mmm","/n/":"nnn","/ŋ/":"ng","/l/":"lll","/r/":"rrr","/j/":"yuh","/w/":"wuh"};

  const save = () => { localStorage.setItem(STORE, JSON.stringify(state)); renderHeader(); };
  const toast = (msg) => { const el=$("toast"); el.textContent=msg; el.classList.add("show"); clearTimeout(toastTimer); toastTimer=setTimeout(()=>el.classList.remove("show"),2200); };
  const speak = (text,rate=.78) => { if (!("speechSynthesis" in window)) return toast("当前浏览器不支持语音"); speechSynthesis.cancel(); const u=new SpeechSynthesisUtterance(text); u.lang="en-US"; u.rate=rate; speechSynthesis.speak(u); };
  const speakPhoneme = (symbol) => speak(PHONEME_VOICE[symbol]||symbol,.48);
  const daysBetween = (a,b) => Math.floor((new Date(`${b}T00:00:00`)-new Date(`${a}T00:00:00`))/86400000);
  const carePlant = () => { const n=daysBetween(state.plant.lastDate,iso()); if(n>0){ state.plant.energy=Math.max(0,state.plant.energy-n*6); state.plant.lastDate=iso(); save(); } };
  const activity = (amount=1) => { state.activity[iso()] = (state.activity[iso()]||0)+amount; };
  const reward = (amount,msg) => { state.suns += amount; state.plant.xp += amount; state.plant.energy=Math.min(100,state.plant.energy+amount); activity(); save(); toast(`☀️ ${msg}，获得 ${amount} 个小太阳`); };
  const dailyComplete = () => tasks.filter(t=>state.dailyDone.includes(todayKey(t.id))).length;
  const completedUnits = () => COURSE_BOOKS.flatMap(b=>b.units).filter(u=>stages.every(s=>state.stageDone.includes(`${u.id}:${s.id}`))).length;
  const allWords = () => COURSE_BOOKS.flatMap(b=>b.units.flatMap(u=>u.core.map(w=>({...w,unitId:u.id,unitTitle:u.title}))));

  function renderHeader(){
    $("topSuns").textContent=state.suns;
    $("topStreak").textContent=streakCount();
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
    if(view==="unit") renderUnit();
    if(view==="today") renderToday();
    if(view==="words") renderWords();
    if(view==="dictionary") renderDictionary();
    if(view==="phonics") renderPhonics();
    if(view==="garden") renderGarden();
    if(view==="report") renderReport();
    window.scrollTo({top:0,behavior:"smooth"});
  }

  function renderHome(){
    const book=bookNow(), unit=unitNow(), done=dailyComplete();
    $("welcomeText").textContent=`当前：${book.label} · Unit ${unit.number} ${unit.title}。今天用20—30分钟完成一个小闭环。`;
    $("todayBar").style.width=`${done/tasks.length*100}%`; $("todayProgressText").textContent=`今日 ${done} / ${tasks.length} 项`;
    $("statLessons").textContent=state.stageDone.length; $("statWords").textContent=state.mastered.length;
    $("statAccuracy").textContent=state.quiz.total?`${Math.round(state.quiz.correct/state.quiz.total*100)}%`:"—"; $("statSuns").textContent=state.suns;
    const plant=plantState(); $("homePlant").textContent=plant.icon; $("plantName").textContent=plant.name; $("plantHint").textContent=`活力 ${state.plant.energy}/100 · 累计成长值 ${state.plant.xp}`;
    $("homeTasks").innerHTML=tasks.slice(0,3).map(t=>{const done=state.dailyDone.includes(todayKey(t.id));return `<button class="preview-task ${done?"done":""}" data-open-stage="${t.stage}"><span>${done?"✓":t.icon}</span><div><b>${t.title}</b><small>${t.detail}</small></div><em>${done?"已完成":"去学习 →"}</em></button>`}).join("");
    const unitDone=stages.filter(s=>state.stageDone.includes(stageKey(s.id))).length;
    $("currentCourseCard").innerHTML=`<div class="course-progress-card"><span class="course-icon">${unit.icon}</span><div class="course-main"><small>${book.label} · Unit ${unit.number}</small><h3>${unit.title} <i>${unit.zh}</i></h3><p>${unit.goal}</p><div class="thin-bar"><span style="width:${unitDone/6*100}%"></span></div><small>${unitDone}/6 个学习环节已完成</small></div><button class="primary" data-open-stage="${nextStage().id}">继续</button></div>`;
  }

  function nextStage(){ return stages.find(s=>!state.stageDone.includes(stageKey(s.id))) || stages[5]; }

  function renderCourses(){
    $("gradeSwitch").innerHTML=[3,4,5,6].map(g=>`<button class="${selectedGrade===g?"active":""}" data-grade="${g}">${g}年级</button>`).join("");
    $("termSwitch").innerHTML=["上册","下册"].map(t=>`<button class="${selectedTerm===t?"active":""}" data-term="${t}">${t}</button>`).join("");
    const book=COURSE_BOOKS.find(b=>b.grade===selectedGrade&&b.term===selectedTerm);
    const done=book.units.filter(u=>stages.every(s=>state.stageDone.includes(`${u.id}:${s.id}`))).length;
    $("bookSummary").innerHTML=`<div><span>${book.edition}</span><h2>${book.label}</h2><p>${book.units.length}个主题单元 · 每单元6步 · 原创讲解与练习</p></div><div><b>${done}/${book.units.length}</b><small>完成单元</small></div>`;
    $("unitGrid").innerHTML=book.units.map(u=>{
      const stepDone=stages.filter(s=>state.stageDone.includes(`${u.id}:${s.id}`)).length;
      const current=state.bookId===book.id&&state.unitIndex===u.number-1;
      return `<button class="unit-card ${current?"current":""}" data-unit-book="${book.id}" data-unit-index="${u.number-1}"><span class="unit-icon">${u.icon}</span><span class="unit-no">UNIT ${String(u.number).padStart(2,"0")}</span><h3>${u.title}</h3><p>${u.zh} · ${u.goal}</p><div class="unit-materials"><span>3课时</span><span>${u.core.length}词</span><span>${u.patterns.length}句型</span><span>阅读+练习</span></div><div class="thin-bar"><span style="width:${stepDone/6*100}%"></span></div><small>${stepDone}/6步完成 ${current?"· 正在学习":""}</small><strong class="unit-cta">${stepDone?"继续单元教材":"进入单元教材"} →</strong></button>`;
    }).join("");
  }

  function lessonPlan(u){
    return [
      {number:1,title:"词汇启蒙课",time:"约20分钟",icon:"🔤",detail:`理解主题，点读并掌握前${Math.min(8,u.core.length)}个必备词`,stage:"words"},
      {number:2,title:"句型交流课",time:"约20分钟",icon:"🗣️",detail:`学会${u.patterns.length}个重点句型，完成角色对话`,stage:"patterns"},
      {number:3,title:"阅读运用课",time:"约25分钟",icon:"📖",detail:"朗读原创短文，完成理解题、单元小测与表达任务",stage:"reading"}
    ];
  }

  function renderUnit(){
    const book=bookNow(), u=unitNow();
    $("unitHero").innerHTML=`<div class="unit-hero-icon">${u.icon}</div><div><span>完整单元教材 · ${book.label} · UNIT ${String(u.number).padStart(2,"0")}</span><h1>${u.title}</h1><h2>${u.zh}</h2><p>${u.goal}</p><div class="unit-hero-actions"><button data-open-stage="${nextStage().id}">▶ ${stages.find(s=>s.id===nextStage().id).name}</button><button data-action="print">🖨️ 打印学习单</button></div></div><div class="hero-count"><b>${stages.filter(s=>state.stageDone.includes(stageKey(s.id))).length}/6</b><small>学习步骤</small></div>`;
    $("lessonTabs").innerHTML=stages.map(s=>`<button class="${state.stage===s.id?"active":""} ${state.stageDone.includes(stageKey(s.id))?"done":""}" data-stage="${s.id}"><span>${state.stageDone.includes(stageKey(s.id))?"✓":s.icon}</span>${s.name}</button>`).join("");
    renderStage();
  }

  function completeStage(stage=state.stage){
    const key=stageKey(stage); if(state.stageDone.includes(key)) return toast("这个学习步骤已经完成");
    state.stageDone.push(key); if(!state.dailyDone.includes(todayKey(stageTask(stage)))) state.dailyDone.push(todayKey(stageTask(stage)));
    reward(1,"完成一个学习步骤"); renderUnit();
  }
  function stageTask(stage){ return ({overview:"understand",words:"vocab",patterns:"speak",dialogue:"read",reading:"read",practice:"quiz"})[stage]; }
  function doneButton(label="完成这一步"){ return `<div class="stage-finish"><p>做完后点一下，记录学习进度并领取小太阳。</p><button class="primary" id="completeStageBtn">${state.stageDone.includes(stageKey(state.stage))?"✓ 已完成":label+" +1 ☀️"}</button></div>`; }

  function renderStage(){
    const u=unitNow(), box=$("lessonContent");
    if(state.stage==="overview") box.innerHTML=`<div class="content-head"><span>单元教材导学</span><h2>这套教材怎样学习？</h2><p>本单元分成3课时，不需要一次学完。每完成一课，第二天先复习5分钟。</p></div><div class="material-summary"><article><b>${u.core.length}</b><span>必备与拓展词</span></article><article><b>${u.patterns.length}</b><span>重点句型</span></article><article><b>1</b><span>原创情境对话</span></article><article><b>1+5</b><span>阅读与小测</span></article></div><div class="textbook-plan">${lessonPlan(u).map(item=>`<button data-open-stage="${item.stage}"><span>${item.icon}</span><div><small>LESSON ${item.number} · ${item.time}</small><h3>${item.title}</h3><p>${item.detail}</p></div><em>开始学习 →</em></button>`).join("")}</div><h3 class="goal-title">学完本单元，我可以做到</h3><div class="objective-list"><article><b>我能听懂</b><p>在“${u.zh}”情境中听出关键词，判断人物在谈论什么。</p></article><article><b>我能开口</b><p>${u.goal}</p></article><article><b>我能读懂</b><p>读一段3—5句的原创短文，找到人物、地点或主要信息。</p></article><article><b>我能写出</b><p>仿照重点句型替换关键词，独立写2—3个句子。</p></article></div><div class="explain-card"><span>${u.icon}</span><div><h3>生活情境</h3><p>想一想：你在真实生活中什么时候会用到“${u.zh}”英语？先用中文说清楚，再尝试说出一个英文关键词。</p><strong>学习秘诀：理解意思 → 看例子 → 自己换词 → 离开提示再说一遍。</strong></div></div>${doneButton("我已经看懂学习路线")}`;
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
    return `Can you use “${w.word}” in a sentence about ${u.title}?`;
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
    const core=seededShuffle(u.core.slice(0,Math.min(8,u.core.length)),`${iso()}:${u.id}:core`), extra=seededShuffle(u.core.slice(8),`${iso()}:${u.id}:extra`);
    box.innerHTML=`<div class="content-head"><span>第2步</span><h2>必备单词：会认、会读、懂意思、能放进句子</h2><p>点击卡片听发音。先看图景和中文，再遮住中文主动回忆。</p></div><div class="word-section-title"><h3>⭐ 必备单词</h3><small>本单元必须熟练掌握</small></div><div class="vocab-grid">${core.map((w,i)=>wordCard(w,i,u,"core")).join("")}</div>${extra.length?`<div class="word-section-title"><h3>🚀 拓展单词</h3><small>先会听懂和使用，不要求一次默写</small></div><div class="vocab-grid extra">${extra.map((w,i)=>wordCard(w,i+8,u,"extra")).join("")}</div>`:""}<div class="memory-method"><h3>四次回忆法</h3><ol><li>看英文，说中文</li><li>看中文，说英文</li><li>听发音，拼出单词</li><li>不看提示，说完整例句</li></ol></div>${doneButton("我已完成单词学习")}`;
    box.querySelectorAll("[data-say]").forEach(b=>b.onclick=()=>speak(b.dataset.say));
    box.querySelectorAll("[data-toggle-word]").forEach(b=>b.onclick=()=>b.closest(".vocab-card").classList.toggle("revealed"));
  }
  function wordCard(w,i,u,type){ const known=state.mastered.includes(`${u.id}:${w.word}`); return `<article class="vocab-card ${known?"known":""}"><button class="sound" data-say="${esc(w.word)}">🔊</button><small>${type==="core"?"必备":"拓展"} ${i+1}</small><h3>${esc(w.word)}</h3><button class="meaning-cover" data-toggle-word>点击查看意思</button><p class="word-meaning">${esc(w.meaning)}</p><div class="word-example"><b>${esc(wordExample(w,i,u))}</b><span>${esc(w.exampleZh)}</span></div></article>`; }

  function renderPatternStage(box,u){
    box.innerHTML=`<div class="content-head"><span>第3步</span><h2>重点句型：知道为什么，再学会替换</h2><p>先听完整句子；遇到不会的词，直接点击该单词听发音、看意思。</p></div><div class="pattern-list">${u.patterns.map((p,i)=>`<article class="pattern-card"><div class="pattern-number">${i+1}</div><div><button class="line-sound" data-say="${esc(p.en)}">🔊 听完整句子</button>${interactiveSentence(p.en,u)}<p class="sentence-translation">${esc(p.zh)}</p><div class="rule"><b>为什么这样说？</b>${esc(p.rule)}</div><div class="try"><b>替换练习</b><span>先读原句3遍，再把关键词换成本单元另一个词。最后合上提示说一遍。</span></div></div></article>`).join("")}</div><div class="mistake-box"><h3>⚠️ 本单元检查清单</h3><ul><li>句子开头是否大写？结尾是否有问号或句号？</li><li>he / she 作主语时，动词是否需要变化？</li><li>时间、日期、星期前的介词是否用对？只检查本句真正出现的规则。</li></ul></div>${doneButton("我已会读并替换")}`;
    box.querySelectorAll("[data-say]").forEach(b=>b.onclick=()=>speak(b.dataset.say));
    bindSentenceWords(box);
  }

  function dialogueLines(u){ const p=u.patterns; return [
    ["A",`Hi! Let's talk about ${u.title}.`],["B",p[0].en],["A",p[1]?.en||"That's interesting."],["B",p[2]?.en||"Let's learn together."],["A","Great! Can you say it again?"],["B","Sure. Let's practise together!"]
  ]; }
  function renderDialogueStage(box,u){
    const lines=dialogueLines(u);
    box.innerHTML=`<div class="content-head"><span>第4步</span><h2>原创情境对话：把句型真正说出来</h2><p>第一遍听完整句，第二遍逐词点读，第三遍分别扮演A和B。</p></div><div class="dialogue-card"><div class="scene-label">情境：两位同学在练习“${u.zh}”</div>${lines.map(([role,text])=>`<article class="dialogue-line role-${role.toLowerCase()}"><span>${role}</span><div>${interactiveSentence(text,u)}</div><button class="dialogue-sound" data-say="${esc(text)}" aria-label="播放完整句子">🔊 整句</button></article>`).join("")}</div><div class="speaking-challenge"><h3>🎤 开口挑战</h3><p>把对话中的一个关键词换成自己的真实信息，再完整说一遍。能让家长听懂意思，就算过关。</p></div>${doneButton("我已完成角色朗读")}`;
    box.querySelectorAll("[data-say]").forEach(b=>b.onclick=()=>speak(b.dataset.say));
    bindSentenceWords(box);
  }

  function renderReadingStage(box,u){
    const q1=`What is the passage mainly about?`, q2=`Find one word about “${u.zh}”.`, q3="Can you say one true sentence about yourself?";
    box.innerHTML=`<div class="content-head"><span>第5步</span><h2>原创阅读：先猜，再找证据</h2><p>不要逐字翻译。先找人物、地点、时间和重复出现的词。</p></div><article class="reading-sheet"><span>READING · ${u.title.toUpperCase()}</span><button data-say="${esc(u.story)}">🔊 听全文</button><h3>${u.zh}小故事</h3><p class="english-reading">${esc(u.story)}</p><details><summary>需要帮助？查看中文理解线索</summary><p>这篇短文围绕“${u.zh}”展开。先圈出熟悉的单词，再判断人物做了什么。中文只用于检查理解，不要求逐字对应。</p></details></article><div class="reading-questions"><h3>读后思考</h3>${[[q1,`It is mainly about ${u.title}.`],[q2,`参考答案：${u.core[0].word}。其他符合主题的词也可以。`],[q3,"开放题：用本单元任一重点句型说一个真实句子。"]].map((q,i)=>`<details><summary>${i+1}. ${esc(q[0])}</summary><p>${esc(q[1])}</p></details>`).join("")}</div><div class="reading-method"><b>阅读三遍法</b><span>第一遍看大意；第二遍圈证据；第三遍大声朗读。遇到生词先猜，不要立刻查。</span></div>${doneButton("我已完成阅读")}`;
    box.querySelector("[data-say]").onclick=()=>speak(u.story);
  }

  function quizItems(u){
    const words=seededShuffle(u.core,`${iso()}:${u.id}:quiz`).slice(0,5);
    return words.map((w,i)=>{
      const wrong=seededShuffle(u.core.filter(x=>x.word!==w.word),`${iso()}:${u.id}:${w.word}:wrong`).slice(0,2).map(x=>x.meaning);
      return {q:`“${w.word}” 的意思是？`,opts:shuffle([w.meaning,...wrong]),answer:w.meaning,word:w.word};
    });
  }
  function shuffle(a){const x=[...a];for(let i=x.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[x[i],x[j]]=[x[j],x[i]];}return x;}
  function renderPracticeStage(box,u){
    const items=quizItems(u);
    box.innerHTML=`<div class="content-head"><span>第6步</span><h2>分层练习：从记单词到真正会运用</h2><p>先完成基础小测，再做句型、阅读和表达任务。错词会自动进入复习清单。</p></div><h3 class="practice-level">第一关 · 基础词汇</h3><div class="quiz-list">${items.map((item,i)=>`<article class="quiz-item" data-question="${i}"><b>${i+1}. ${esc(item.q)}</b><div>${item.opts.map(o=>`<button data-answer="${esc(o)}">${esc(o)}</button>`).join("")}</div><p></p></article>`).join("")}</div><button class="primary submit-quiz" id="submitQuiz">提交并查看结果</button><div id="quizResult"></div><h3 class="practice-level">第二关 · 理解与表达</h3><div class="ability-practice"><details><summary>1. 句型理解：翻译并朗读</summary><p><b>${esc(u.patterns[0].en)}</b><br>${esc(u.patterns[0].zh)}<br><small>朗读3遍，再替换一个关键词。</small></p></details><details><summary>2. 阅读理解：短文主要讲什么？</summary><p>主要围绕“${esc(u.zh)}”展开。请从短文中圈出两个能证明答案的词。</p></details><details><summary>3. 独立表达：说或写3句话</summary><p>第1句使用本单元必备词，第2句使用重点句型，第3句说自己的真实情况。完成后读给家长听。</p></details></div>${doneButton("我已完成本单元")}`;
    box.querySelectorAll(".quiz-item button").forEach(b=>b.onclick=()=>{const item=b.closest(".quiz-item");item.querySelectorAll("button").forEach(x=>x.classList.remove("selected"));b.classList.add("selected");quizAnswers[item.dataset.question]=b.dataset.answer;});
    $("submitQuiz").onclick=()=>{
      let correct=0; items.forEach((item,i)=>{const el=box.querySelector(`[data-question="${i}"]`), chosen=quizAnswers[i]; const ok=chosen===item.answer; if(ok)correct++; el.classList.add(chosen?(ok?"correct":"wrong"):"wrong"); el.querySelector("p").textContent=chosen?(ok?"回答正确！":"正确答案："+item.answer):"还没有作答，正确答案："+item.answer; const key=`${u.id}:${item.word}`; if(ok){if(!state.mastered.includes(key))state.mastered.push(key);state.weak=state.weak.filter(x=>x!==key);}else if(!state.weak.includes(key))state.weak.push(key);});
      state.quiz.correct+=correct;state.quiz.total+=items.length; if(!state.dailyDone.includes(todayKey("quiz")))state.dailyDone.push(todayKey("quiz")); reward(Math.max(1,correct),`答对 ${correct}/${items.length} 题`); $("quizResult").innerHTML=`<div class="quiz-result"><b>${correct}/${items.length}</b><p>${correct===items.length?"全部正确！明天还要再回忆一次。":correct>=3?"基本掌握，去单词本复习错词。":"先别急，回到必备单词再听读一遍。"}</p></div>`;
    };
  }

  function renderToday(){
    const u=unitNow(),done=dailyComplete(); $("todayDate").textContent=new Intl.DateTimeFormat("zh-CN",{month:"long",day:"numeric",weekday:"long"}).format(new Date()); $("todayCourse").textContent=`${bookNow().label} · ${u.title}`; $("circleProgress").textContent=`${done}/${tasks.length}`; $("circleProgress").style.background=`conic-gradient(var(--green) 0 ${done/tasks.length*100}%,#e8efeb ${done/tasks.length*100}% 100%)`;
    $("dailyTasks").innerHTML=tasks.map((t,i)=>{const yes=state.dailyDone.includes(todayKey(t.id));const link=t.id==="zh2en"||t.id==="en2zh"?`data-open-dictation="${t.id}"`:`data-daily-stage="${t.stage}"`;return `<button class="daily-task ${yes?"done":""}" ${link}><span>${yes?"✓":i+1}</span><i>${t.icon}</i><div><b>${t.title}</b><small>${t.detail}</small></div><em>${yes?"已完成":"+1 ☀️"}</em></button>`}).join("");
    const claimed=state.bonuses.includes(`${iso()}:${unitKey()}`); $("claimDailyBonus").disabled=done<tasks.length||claimed; $("claimDailyBonus").textContent=claimed?"✓ 今日已领取":"领取全勤奖励"; $("bonusHint").textContent=done<tasks.length?`再完成 ${tasks.length-done} 项即可领取`:claimed?"明天继续保持":"现在可以领取3个小太阳";
    renderDailyPractice();
  }

  function dailyPracticeWords(mode){return seededShuffle(unitNow().core,`${iso()}:${unitKey()}:${mode}:independent`).slice(0,Math.min(5,unitNow().core.length));}
  function renderDailyPractice(){
    const zhDone=state.dailyDone.includes(todayKey("zh2en")),enDone=state.dailyDone.includes(todayKey("en2zh"));
    $("dailyPracticeZone").innerHTML=`<article class="practice-launch ${zhDone?"done":""}"><span>✍️</span><small>独立窗口 A</small><h2>看中文，写英文</h2><p>窗口内只显示中文题目，不出现英文单词表，避免从旁边抄写。</p><button class="primary" data-open-dictation="zh2en">${zhDone?"再次练习":"开始英文默写"}</button></article><article class="practice-launch ${enDone?"done":""}"><span>🀄</span><small>独立窗口 B</small><h2>看英文，写中文</h2><p>窗口内只显示英文题目，不出现中文单词表，两种练习互不展示答案。</p><button class="primary" data-open-dictation="en2zh">${enDone?"再次练习":"开始中文释义"}</button></article>`;
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
    if(correct===inputs.length){const key=todayKey(mode),first=!state.dailyDone.includes(key);if(first){state.dailyDone.push(key);reward(1,mode==="zh2en"?"完成英文默写":"完成中文释义");renderToday();}else toast("全部正确，这一项今天已经完成过了");const submit=$("practiceDialogContent").querySelector("[data-check-dictation]");submit.disabled=true;submit.textContent="✓ 全部正确";}else{save();toast(`答对 ${correct}/${inputs.length}，请订正后再检查`);}
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

  function renderPhonics(){
    const icons={short:"🟡",long:"🟢",diph:"🌈",stops:"💨",consonants:"👄"},groups=Object.entries(PHONICS_GROUPS),total=groups.reduce((sum,[,item])=>sum+item.items.length,0),done=state.phonicsDone.length,group=PHONICS_GROUPS[phonicsGroup];
    $("phonicsGroups").innerHTML=`<div class="phonics-progress"><div><b>音标学习进度</b><span>${done} / ${total} 个音</span></div><i><em style="width:${Math.min(100,done/total*100)}%"></em></i></div><div class="phonics-group-buttons">${groups.map(([id,item])=>`<button class="${id===phonicsGroup?"active":""}" data-phonics-group="${id}">${icons[id]} ${item.name}<small>${item.items.length}个</small></button>`).join("")}</div>`;
    $("phonicsGrid").innerHTML=`<article class="phonics-tip"><span>${icons[phonicsGroup]}</span><div><small>本组学习目标</small><h2>${group.name}</h2><p>${group.tip}</p></div></article>${group.items.map(item=>{const [symbol,word,ipa,tip,spelling]=item,key=`${phonicsGroup}:${symbol}`,finished=state.phonicsDone.includes(key);return `<article class="phoneme-card ${finished?"done":""}" data-phoneme-key="${esc(key)}"><div class="phoneme-top"><strong>${esc(symbol)}</strong><div><button data-say-phoneme="${esc(symbol)}" aria-label="单独播放音标 ${esc(symbol)}">🔊 单独听音</button><button data-say="${esc(word)}" aria-label="播放示例词 ${esc(word)}">🎧 听示范词</button></div></div><h3>${esc(word)} <small>${esc(ipa)}</small></h3><p><b>👄 发音方法：</b>${esc(tip)}</p><p><b>🔤 常见字母：</b>${esc(spelling)}</p><ol><li>单独听音</li><li>听示范词</li><li>慢速跟读3遍</li></ol><button class="phoneme-done" data-finish-phoneme="${esc(key)}">${finished?"✓ 已学会":"我已听、看、读3遍 +1 ☀️"}</button></article>`}).join("")}`;
    $("minimalGrid").innerHTML=MINIMAL_PAIRS.map(([a,aIpa,b,bIpa])=>`<article><div><button data-say="${esc(a)}">🔊 ${esc(a)}</button><span>${esc(aIpa)}</span></div><b>VS</b><div><button data-say="${esc(b)}">🔊 ${esc(b)}</button><span>${esc(bIpa)}</span></div><p>先听两遍，再注意两个词中不同的音。</p></article>`).join("");
    document.querySelectorAll("[data-phonics-group]").forEach(button=>button.onclick=()=>{phonicsGroup=button.dataset.phonicsGroup;renderPhonics();});
    document.querySelectorAll("#view-phonics [data-say]").forEach(button=>button.onclick=()=>speak(button.dataset.say));
    document.querySelectorAll("#view-phonics [data-say-phoneme]").forEach(button=>button.onclick=()=>speakPhoneme(button.dataset.sayPhoneme));
    document.querySelectorAll("[data-finish-phoneme]").forEach(button=>button.onclick=()=>{const key=button.dataset.finishPhoneme;if(state.phonicsDone.includes(key)){toast("这个音标已经学过了，继续巩固吧");return;}state.phonicsDone.push(key);reward(1,"完成一个音标跟读");renderPhonics();});
  }

  function plantState(){ const xp=state.plant.xp; if(state.plant.energy<=0)return{icon:"🥀",name:"枯萎休眠的小植物",level:1}; if(state.plant.energy<=20)return{icon:"🥀",name:"需要关心的小植物",level:1}; if(xp<15)return{icon:"🌱",name:"英语小芽",level:1}; if(xp<40)return{icon:"🌿",name:"勇气绿苗",level:2}; if(xp<80)return{icon:"🌻",name:"向阳花",level:3}; if(xp<150)return{icon:"🌳",name:"知识树",level:4}; return{icon:"🌳✨",name:"智慧大树",level:5}; }
  function renderGarden(){ const p=plantState(); $("gardenPlant").textContent=p.icon;$("gardenLevel").textContent=`Lv.${p.level}`;$("gardenPlantName").textContent=p.name;$("energyText").textContent=`${state.plant.energy} / 100`;$("energyBar").style.width=`${state.plant.energy}%`;$("gardenMessage").textContent=state.plant.energy<=0?"它因为很久没有获得小太阳而枯萎休眠了。现在完成一个学习任务，就能重新唤醒它。":state.plant.energy<30?"植物有点没精神，完成一个小任务就能恢复活力。":"它正在因为你的坚持而成长。偶尔漏学没关系，回来继续就好。"; const signed=state.signIns.includes(iso());$("checkInBtn").disabled=signed;$("checkInBtn").textContent=signed?"✓ 今日已签到":"今日签到 +2 ☀️";$("feedBtn").disabled=state.suns<3||state.plant.energy>=100;
    const levels=[{icon:"🌱",name:"英语小芽",xp:0},{icon:"🌿",name:"勇气绿苗",xp:15},{icon:"🌻",name:"向阳花",xp:40},{icon:"🌳",name:"知识树",xp:80},{icon:"🌳✨",name:"智慧大树",xp:150}]; $("growthRoad").innerHTML=levels.map(l=>`<article class="${state.plant.xp>=l.xp?"unlocked":""}"><span>${l.icon}</span><b>${l.name}</b><small>${l.xp}成长值</small></article>`).join("");
  }

  function renderReport(){
    const accuracy=state.quiz.total?Math.round(state.quiz.correct/state.quiz.total*100):0; $("reportCards").innerHTML=`<article><span>📚</span><b>${completedUnits()}</b><small>完成单元</small></article><article><span>🧩</span><b>${state.stageDone.length}</b><small>完成学习步骤</small></article><article><span>🔤</span><b>${state.mastered.length}</b><small>掌握单词</small></article><article><span>🎯</span><b>${accuracy||"—"}${accuracy?"%":""}</b><small>小测正确率</small></article>`;
    const days=[];for(let i=6;i>=0;i--){const d=new Date();d.setDate(d.getDate()-i);const key=iso(d);days.push({name:["日","一","二","三","四","五","六"][d.getDay()],count:state.activity[key]||0,today:i===0});} const max=Math.max(4,...days.map(d=>d.count)); $("weekChart").innerHTML=days.map(d=>`<div class="chart-day"><b>${d.count}</b><span style="height:${Math.max(8,d.count/max*120)}px"></span><small>${d.today?"今天":"周"+d.name}</small></div>`).join("");
    const advice=[]; if(state.weak.length)advice.push(`本周有 ${state.weak.length} 个词需要复习。每天只挑5个做“看中文说英文”，不要罚抄。`); else advice.push("目前没有积累错词。完成一次单元小测后，系统会给出更准确的复习建议。"); if(streakCount()<3)advice.push("先把目标定为连续3天，每天20分钟；形成节奏比一次学一小时更重要。"); else advice.push(`已经连续学习 ${streakCount()} 天。请多肯定孩子的坚持，不只看分数。`); advice.push("家长可以做听众：请孩子用本单元句型介绍一件真实的事，听懂后追问一个简单问题。"); $("parentAdvice").innerHTML=advice.map((a,i)=>`<article><span>${i+1}</span><p>${a}</p></article>`).join("");
  }

  document.addEventListener("click",e=>{
    const view=e.target.closest("[data-view]"); if(view){route(view.dataset.view);return;}
    const action=e.target.closest("[data-action]"); if(action?.dataset.action==="print"){window.print();return;}
    const grade=e.target.closest("[data-grade]"); if(grade){selectedGrade=Number(grade.dataset.grade);renderCourses();return;}
    const term=e.target.closest("[data-term]"); if(term){selectedTerm=term.dataset.term;renderCourses();return;}
    const unit=e.target.closest("[data-unit-book]"); if(unit){state.bookId=unit.dataset.unitBook;state.unitIndex=Number(unit.dataset.unitIndex);state.stage="overview";selectedGrade=bookNow().grade;selectedTerm=bookNow().term;save();quizAnswers={};route("unit");return;}
    const stage=e.target.closest("[data-stage]"); if(stage){state.stage=stage.dataset.stage;save();quizAnswers={};renderUnit();return;}
    const open=e.target.closest("[data-open-stage],[data-daily-stage]"); if(open){state.stage=open.dataset.openStage||open.dataset.dailyStage;save();route("unit");return;}
    const dictation=e.target.closest("[data-open-dictation]"); if(dictation){openDictation(dictation.dataset.openDictation);return;}
    const dictionaryTab=e.target.closest("[data-dictionary-section]"); if(dictionaryTab){dictionarySection=dictionaryTab.dataset.dictionarySection;dictionaryLetter="all";dictionaryQuery="";dictionaryLimit=48;renderDictionary();return;}
    const dictionaryLetterButton=e.target.closest("[data-dictionary-letter]"); if(dictionaryLetterButton){dictionaryLetter=dictionaryLetterButton.dataset.dictionaryLetter;dictionaryLimit=48;renderDictionary();return;}
    const filter=e.target.closest("[data-word-filter]"); if(filter){memoryFilter=filter.dataset.wordFilter;memoryIndex=0;memoryFlipped=false;renderWords();return;}
    const dot=e.target.closest("[data-word-index]"); if(dot){memoryIndex=Number(dot.dataset.wordIndex);memoryFlipped=false;renderWords();}
  });
  $("continueBtn").onclick=()=>{state.stage=nextStage().id;save();route("unit");};
  $("dictionarySearch").addEventListener("input",event=>{dictionaryQuery=event.target.value;dictionaryLetter="all";dictionaryLimit=48;renderDictionary();$("dictionarySearch").focus();});
  $("dictionaryMore").onclick=()=>{dictionaryLimit+=48;renderDictionary();};
  $("closePracticeDialog").onclick=()=>{$("practiceDialog").close?.();$("practiceDialog").classList.remove("open");};
  $("practiceDialog").addEventListener("click",event=>{if(event.target===$("practiceDialog"))$("closePracticeDialog").click();});
  $("wordKnow").onclick=()=>moveWord(true); $("wordAgain").onclick=()=>moveWord(false);
  $("claimDailyBonus").onclick=()=>{const key=`${iso()}:${unitKey()}`;if(dailyComplete()<tasks.length||state.bonuses.includes(key))return;state.bonuses.push(key);reward(3,"完成今日全部任务");renderToday();};
  $("checkInBtn").onclick=()=>{if(state.signIns.includes(iso()))return;state.signIns.push(iso());reward(2,"今日签到成功");renderGarden();};
  $("feedBtn").onclick=()=>{if(state.suns<3)return toast("小太阳不够，先完成学习任务吧");state.suns-=3;state.plant.energy=Math.min(100,state.plant.energy+18);state.plant.xp+=2;save();toast("植物恢复了活力");renderGarden();};

  carePlant(); renderHeader(); renderHome();
  if("serviceWorker" in navigator) window.addEventListener("load",()=>navigator.serviceWorker.register("service-worker.js?v=7",{updateViaCache:"none"}).then(reg=>reg.update()).catch(()=>{}));
})();
