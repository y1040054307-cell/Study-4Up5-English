(() => {
  "use strict";

  const STORE = "sunny-english-longterm-v3";
  const iso = (date = new Date()) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`;
  const defaultState = { bookId:"g4a", unitIndex:0, stage:"overview", suns:0, mastered:[], weak:[], stageDone:[], dailyDone:[], bonuses:[], signIns:[], activity:{}, quiz:{correct:0,total:0}, plant:{energy:70,xp:0,lastDate:iso()} };
  const load = () => { try { return { ...defaultState, ...JSON.parse(localStorage.getItem(STORE)||"{}"), plant:{...defaultState.plant,...(JSON.parse(localStorage.getItem(STORE)||"{}").plant||{})}, quiz:{...defaultState.quiz,...(JSON.parse(localStorage.getItem(STORE)||"{}").quiz||{})} }; } catch { return structuredClone(defaultState); } };
  let state = load();
  let selectedGrade = Number(state.bookId[1]) || 4;
  let selectedTerm = state.bookId.endsWith("a") ? "上册" : "下册";
  let memoryFilter = "current";
  let memoryIndex = 0;
  let memoryFlipped = false;
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
    {id:"quiz",icon:"🎯",title:"完成5分钟小测",detail:"错题不是失败，会自动进入复习清单",stage:"practice"}
  ];

  const save = () => { localStorage.setItem(STORE, JSON.stringify(state)); renderHeader(); };
  const toast = (msg) => { const el=$("toast"); el.textContent=msg; el.classList.add("show"); clearTimeout(toastTimer); toastTimer=setTimeout(()=>el.classList.remove("show"),2200); };
  const speak = (text) => { if (!("speechSynthesis" in window)) return toast("当前浏览器不支持语音"); speechSynthesis.cancel(); const u=new SpeechSynthesisUtterance(text); u.lang="en-US"; u.rate=.78; speechSynthesis.speak(u); };
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
    if(view==="garden") renderGarden();
    if(view==="report") renderReport();
    window.scrollTo({top:0,behavior:"smooth"});
  }

  function renderHome(){
    const book=bookNow(), unit=unitNow(), done=dailyComplete();
    $("welcomeText").textContent=`当前：${book.label} · Unit ${unit.number} ${unit.title}。今天用20—30分钟完成一个小闭环。`;
    $("todayBar").style.width=`${done/5*100}%`; $("todayProgressText").textContent=`今日 ${done} / 5 项`;
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
      return `<button class="unit-card ${current?"current":""}" data-unit-book="${book.id}" data-unit-index="${u.number-1}"><span class="unit-icon">${u.icon}</span><span class="unit-no">UNIT ${String(u.number).padStart(2,"0")}</span><h3>${u.title}</h3><p>${u.zh} · ${u.goal}</p><div class="thin-bar"><span style="width:${stepDone/6*100}%"></span></div><small>${stepDone}/6步完成 ${current?"· 正在学习":""}</small></button>`;
    }).join("");
  }

  function renderUnit(){
    const book=bookNow(), u=unitNow();
    $("unitHero").innerHTML=`<div class="unit-hero-icon">${u.icon}</div><div><span>${book.label} · UNIT ${String(u.number).padStart(2,"0")}</span><h1>${u.title}</h1><h2>${u.zh}</h2><p>${u.goal}</p></div><div class="hero-count"><b>${stages.filter(s=>state.stageDone.includes(stageKey(s.id))).length}/6</b><small>学习步骤</small></div>`;
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
    if(state.stage==="overview") box.innerHTML=`<div class="content-head"><span>第1步</span><h2>先理解：这一单元到底学什么？</h2><p>不要急着背。先把语言和生活场景连起来。</p></div><div class="objective-list"><article><b>我能听懂</b><p>在“${u.zh}”情境中听出关键词，判断人物在谈论什么。</p></article><article><b>我能开口</b><p>${u.goal}</p></article><article><b>我能读懂</b><p>读一段3—5句的原创短文，找到人物、地点或主要信息。</p></article><article><b>我能写出</b><p>仿照重点句型替换关键词，独立写2—3个句子。</p></article></div><div class="explain-card"><span>${u.icon}</span><div><h3>生活情境</h3><p>想一想：你在真实生活中什么时候会用到“${u.zh}”英语？先用中文说清楚，再尝试说出一个英文关键词。</p><strong>学习秘诀：理解意思 → 看例子 → 自己换词 → 离开提示再说一遍。</strong></div></div>${doneButton()}`;
    if(state.stage==="words") renderWordStage(box,u);
    if(state.stage==="patterns") renderPatternStage(box,u);
    if(state.stage==="dialogue") renderDialogueStage(box,u);
    if(state.stage==="reading") renderReadingStage(box,u);
    if(state.stage==="practice") renderPracticeStage(box,u);
    const complete=$("completeStageBtn"); if(complete) complete.onclick=()=>completeStage();
  }

  function wordExample(w,index,u){
    const custom={hello:"Hello, I'm Ben.",friend:"She is my good friend.",family:"I love my family.",school:"Our school is beautiful.",teacher:"My teacher is kind.",healthy:"Fruit is healthy.",winter:"It is cold in winter.",doctor:"The doctor helps me.",future:"I will work hard in the future."};
    return custom[w.word] || (index%2===0?`I know the word “${w.word}”.`:`We use “${w.word}” when we talk about ${u.title}.`);
  }
  function renderWordStage(box,u){
    const core=u.core.slice(0,Math.min(8,u.core.length)), extra=u.core.slice(8);
    box.innerHTML=`<div class="content-head"><span>第2步</span><h2>必备单词：会认、会读、懂意思、能放进句子</h2><p>点击卡片听发音。先看图景和中文，再遮住中文主动回忆。</p></div><div class="word-section-title"><h3>⭐ 必备单词</h3><small>本单元必须熟练掌握</small></div><div class="vocab-grid">${core.map((w,i)=>wordCard(w,i,u,"core")).join("")}</div>${extra.length?`<div class="word-section-title"><h3>🚀 拓展单词</h3><small>先会听懂和使用，不要求一次默写</small></div><div class="vocab-grid extra">${extra.map((w,i)=>wordCard(w,i+8,u,"extra")).join("")}</div>`:""}<div class="memory-method"><h3>四次回忆法</h3><ol><li>看英文，说中文</li><li>看中文，说英文</li><li>听发音，拼出单词</li><li>不看提示，说完整例句</li></ol></div>${doneButton("我已完成单词学习")}`;
    box.querySelectorAll("[data-say]").forEach(b=>b.onclick=()=>speak(b.dataset.say));
    box.querySelectorAll("[data-toggle-word]").forEach(b=>b.onclick=()=>b.closest(".vocab-card").classList.toggle("revealed"));
  }
  function wordCard(w,i,u,type){ const known=state.mastered.includes(`${u.id}:${w.word}`); return `<article class="vocab-card ${known?"known":""}"><button class="sound" data-say="${esc(w.word)}">🔊</button><small>${type==="core"?"必备":"拓展"} ${i+1}</small><h3>${esc(w.word)}</h3><button class="meaning-cover" data-toggle-word>点击查看意思</button><p class="word-meaning">${esc(w.meaning)}</p><div class="word-example"><b>${esc(wordExample(w,i,u))}</b><span>${esc(w.exampleZh)}</span></div></article>`; }

  function renderPatternStage(box,u){
    box.innerHTML=`<div class="content-head"><span>第3步</span><h2>重点句型：知道为什么，再学会替换</h2><p>每个句型按“原句—规则—换词—自己说”学习。</p></div><div class="pattern-list">${u.patterns.map((p,i)=>`<article class="pattern-card"><div class="pattern-number">${i+1}</div><div><button class="line-sound" data-say="${esc(p.en)}">🔊 听句子</button><h3>${esc(p.en)}</h3><p>${esc(p.zh)}</p><div class="rule"><b>为什么这样说？</b>${esc(p.rule)}</div><div class="try"><b>替换练习</b><span>先读原句3遍，再把带颜色的关键词换成本单元另一个词。最后合上提示说一遍。</span></div></div></article>`).join("")}</div><div class="mistake-box"><h3>⚠️ 本单元检查清单</h3><ul><li>句子开头是否大写？结尾是否有问号或句号？</li><li>he / she 作主语时，动词是否需要变化？</li><li>时间、日期、星期前的介词是否用对？只检查本句真正出现的规则。</li></ul></div>${doneButton("我已会读并替换")}`;
    box.querySelectorAll("[data-say]").forEach(b=>b.onclick=()=>speak(b.dataset.say));
  }

  function dialogueLines(u){ const p=u.patterns; return [
    ["A",`Hi! Let's talk about ${u.title}.`],["B",p[0].en],["A",p[1]?.en||"That's interesting."],["B",p[2]?.en||"Let's learn together."],["A","Great! Can you say it again?"],["B","Sure. Let's practise together!"]
  ]; }
  function renderDialogueStage(box,u){
    const lines=dialogueLines(u);
    box.innerHTML=`<div class="content-head"><span>第4步</span><h2>原创情境对话：把句型真正说出来</h2><p>第一遍听，第二遍跟读，第三遍分别扮演A和B。</p></div><div class="dialogue-card"><div class="scene-label">情境：两位同学在练习“${u.zh}”</div>${lines.map(([role,text])=>`<button class="dialogue-line role-${role.toLowerCase()}" data-say="${esc(text)}"><span>${role}</span><p>${esc(text)}</p><em>🔊</em></button>`).join("")}</div><div class="speaking-challenge"><h3>🎤 开口挑战</h3><p>把对话中的一个关键词换成自己的真实信息，再完整说一遍。能让家长听懂意思，就算过关。</p></div>${doneButton("我已完成角色朗读")}`;
    box.querySelectorAll("[data-say]").forEach(b=>b.onclick=()=>speak(b.dataset.say));
  }

  function renderReadingStage(box,u){
    const q1=`What is the passage mainly about?`, q2=`Find one word about “${u.zh}”.`, q3="Can you say one true sentence about yourself?";
    box.innerHTML=`<div class="content-head"><span>第5步</span><h2>原创阅读：先猜，再找证据</h2><p>不要逐字翻译。先找人物、地点、时间和重复出现的词。</p></div><article class="reading-sheet"><span>READING · ${u.title.toUpperCase()}</span><button data-say="${esc(u.story)}">🔊 听全文</button><h3>${u.zh}小故事</h3><p class="english-reading">${esc(u.story)}</p><details><summary>需要帮助？查看中文理解线索</summary><p>这篇短文围绕“${u.zh}”展开。先圈出熟悉的单词，再判断人物做了什么。中文只用于检查理解，不要求逐字对应。</p></details></article><div class="reading-questions"><h3>读后思考</h3>${[[q1,`It is mainly about ${u.title}.`],[q2,`参考答案：${u.core[0].word}。其他符合主题的词也可以。`],[q3,"开放题：用本单元任一重点句型说一个真实句子。"]].map((q,i)=>`<details><summary>${i+1}. ${esc(q[0])}</summary><p>${esc(q[1])}</p></details>`).join("")}</div><div class="reading-method"><b>阅读三遍法</b><span>第一遍看大意；第二遍圈证据；第三遍大声朗读。遇到生词先猜，不要立刻查。</span></div>${doneButton("我已完成阅读")}`;
    box.querySelector("[data-say]").onclick=()=>speak(u.story);
  }

  function quizItems(u){
    const words=u.core.slice(0,5);
    return words.map((w,i)=>{
      const wrong=u.core.filter(x=>x.word!==w.word).slice((i+1)%3,(i+1)%3+2).map(x=>x.meaning);
      return {q:`“${w.word}” 的意思是？`,opts:shuffle([w.meaning,...wrong]),answer:w.meaning,word:w.word};
    });
  }
  function shuffle(a){const x=[...a];for(let i=x.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[x[i],x[j]]=[x[j],x[i]];}return x;}
  function renderPracticeStage(box,u){
    const items=quizItems(u);
    box.innerHTML=`<div class="content-head"><span>第6步</span><h2>分层练习：用小测找到没记牢的地方</h2><p>先自己回答，再看反馈。错题会进入“需要复习”。</p></div><div class="quiz-list">${items.map((item,i)=>`<article class="quiz-item" data-question="${i}"><b>${i+1}. ${esc(item.q)}</b><div>${item.opts.map(o=>`<button data-answer="${esc(o)}">${esc(o)}</button>`).join("")}</div><p></p></article>`).join("")}</div><button class="primary submit-quiz" id="submitQuiz">提交并查看结果</button><div id="quizResult"></div>${doneButton("我已完成本单元")}`;
    box.querySelectorAll(".quiz-item button").forEach(b=>b.onclick=()=>{const item=b.closest(".quiz-item");item.querySelectorAll("button").forEach(x=>x.classList.remove("selected"));b.classList.add("selected");quizAnswers[item.dataset.question]=b.dataset.answer;});
    $("submitQuiz").onclick=()=>{
      let correct=0; items.forEach((item,i)=>{const el=box.querySelector(`[data-question="${i}"]`), chosen=quizAnswers[i]; const ok=chosen===item.answer; if(ok)correct++; el.classList.add(chosen?(ok?"correct":"wrong"):"wrong"); el.querySelector("p").textContent=chosen?(ok?"回答正确！":"正确答案："+item.answer):"还没有作答，正确答案："+item.answer; const key=`${u.id}:${item.word}`; if(ok){if(!state.mastered.includes(key))state.mastered.push(key);state.weak=state.weak.filter(x=>x!==key);}else if(!state.weak.includes(key))state.weak.push(key);});
      state.quiz.correct+=correct;state.quiz.total+=items.length; if(!state.dailyDone.includes(todayKey("quiz")))state.dailyDone.push(todayKey("quiz")); reward(Math.max(1,correct),`答对 ${correct}/${items.length} 题`); $("quizResult").innerHTML=`<div class="quiz-result"><b>${correct}/${items.length}</b><p>${correct===items.length?"全部正确！明天还要再回忆一次。":correct>=3?"基本掌握，去单词本复习错词。":"先别急，回到必备单词再听读一遍。"}</p></div>`;
    };
  }

  function renderToday(){
    const u=unitNow(),done=dailyComplete(); $("todayDate").textContent=new Intl.DateTimeFormat("zh-CN",{month:"long",day:"numeric",weekday:"long"}).format(new Date()); $("todayCourse").textContent=`${bookNow().label} · ${u.title}`; $("circleProgress").textContent=`${done}/5`;
    $("dailyTasks").innerHTML=tasks.map((t,i)=>{const yes=state.dailyDone.includes(todayKey(t.id));return `<button class="daily-task ${yes?"done":""}" data-daily-stage="${t.stage}"><span>${yes?"✓":i+1}</span><i>${t.icon}</i><div><b>${t.title}</b><small>${t.detail}</small></div><em>${yes?"已完成":"+1 ☀️"}</em></button>`}).join("");
    const claimed=state.bonuses.includes(`${iso()}:${unitKey()}`); $("claimDailyBonus").disabled=done<5||claimed; $("claimDailyBonus").textContent=claimed?"✓ 今日已领取":"领取全勤奖励"; $("bonusHint").textContent=done<5?`再完成 ${5-done} 项即可领取`:claimed?"明天继续保持":"现在可以领取3个小太阳";
  }

  function wordPool(){
    const current=unitNow().core.map(w=>({...w,key:`${unitKey()}:${w.word}`}));
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
  function moveWord(known){ const pool=wordPool(); if(!pool.length)return; const w=pool[memoryIndex]; if(known){if(!state.mastered.includes(w.key))state.mastered.push(w.key);state.weak=state.weak.filter(x=>x!==w.key);toast("已记住：明天再回忆一次");}else{if(!state.weak.includes(w.key))state.weak.push(w.key);state.mastered=state.mastered.filter(x=>x!==w.key);toast("已加入复习清单，慢慢来");} activity();save();memoryIndex=(memoryIndex+1)%Math.max(1,pool.length);memoryFlipped=false;renderWords(); }

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
    const grade=e.target.closest("[data-grade]"); if(grade){selectedGrade=Number(grade.dataset.grade);renderCourses();return;}
    const term=e.target.closest("[data-term]"); if(term){selectedTerm=term.dataset.term;renderCourses();return;}
    const unit=e.target.closest("[data-unit-book]"); if(unit){state.bookId=unit.dataset.unitBook;state.unitIndex=Number(unit.dataset.unitIndex);state.stage="overview";selectedGrade=bookNow().grade;selectedTerm=bookNow().term;save();quizAnswers={};route("unit");return;}
    const stage=e.target.closest("[data-stage]"); if(stage){state.stage=stage.dataset.stage;save();quizAnswers={};renderUnit();return;}
    const open=e.target.closest("[data-open-stage],[data-daily-stage]"); if(open){state.stage=open.dataset.openStage||open.dataset.dailyStage;save();route("unit");return;}
    const filter=e.target.closest("[data-word-filter]"); if(filter){memoryFilter=filter.dataset.wordFilter;memoryIndex=0;memoryFlipped=false;renderWords();return;}
    const dot=e.target.closest("[data-word-index]"); if(dot){memoryIndex=Number(dot.dataset.wordIndex);memoryFlipped=false;renderWords();}
  });
  $("continueBtn").onclick=()=>{state.stage=nextStage().id;save();route("unit");};
  $("wordKnow").onclick=()=>moveWord(true); $("wordAgain").onclick=()=>moveWord(false);
  $("claimDailyBonus").onclick=()=>{const key=`${iso()}:${unitKey()}`;if(dailyComplete()<5||state.bonuses.includes(key))return;state.bonuses.push(key);reward(3,"完成今日全部任务");renderToday();};
  $("checkInBtn").onclick=()=>{if(state.signIns.includes(iso()))return;state.signIns.push(iso());reward(2,"今日签到成功");renderGarden();};
  $("feedBtn").onclick=()=>{if(state.suns<3)return toast("小太阳不够，先完成学习任务吧");state.suns-=3;state.plant.energy=Math.min(100,state.plant.energy+18);state.plant.xp+=2;save();toast("植物恢复了活力");renderGarden();};

  carePlant(); renderHeader(); renderHome();
  if("serviceWorker" in navigator) window.addEventListener("load",()=>navigator.serviceWorker.register("service-worker.js").catch(()=>{}));
})();
