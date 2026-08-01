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
  const defaultState = { bookId:"g4a", unitIndex:0, stage:"overview", suns:0, foods:0, mastered:[], weak:[], phonicsDone:[], stageDone:[], dailyDone:[], bonuses:[], signIns:[], activity:{}, quiz:{correct:0,total:0}, grammar:{completed:[],quizBest:{},attempts:{}}, plant:{selected:"sunflower",owned:["sunflower"],progress:{sunflower:{energy:70,xp:0,lastFed:""}},lastDate:iso()}, pets:{selected:"",owned:[],progress:{}} };
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
    const rawGrammar=raw.grammar||{},grammar={...defaultState.grammar,...rawGrammar,completed:[...(rawGrammar.completed||[])],quizBest:{...(rawGrammar.quizBest||{})},attempts:{...(rawGrammar.attempts||{})}};
    return {...defaultState,...raw,suns:TEST_MODE?TEST_BALANCE:persistedEconomy.suns,foods:TEST_MODE?TEST_BALANCE:persistedEconomy.foods,plant,pets,quiz:{...defaultState.quiz,...(raw.quiz||{})},grammar};
  } catch { persistedEconomy={suns:0,foods:0};const fresh=structuredClone(defaultState);fresh.suns=TEST_MODE?TEST_BALANCE:0;fresh.foods=TEST_MODE?TEST_BALANCE:0;return fresh; } };
  let state = load(activeUserId);
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
  let marketTab = "plants";
  let quizAnswers = {};
  let grammarTopicId = (window.GRAMMAR_TOPICS||[])[0]?.id || "articles";
  let grammarAnswers = {};
  let grammarResult = null;
  let toastTimer;
  let petActionTimer;
  let deferredInstallPrompt = null;

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
    {id:"quiz",icon:"🎯",title:"完成5分钟小测",detail:"错题不是失败，会自动进入复习清单",stage:"practice"},
    {id:"zh2en",icon:"✍️",title:"看中文写英文",detail:"完成本单元5个词的英文默写，注意拼写",stage:"words"},
    {id:"en2zh",icon:"🀄",title:"看英文写中文",detail:"写出5个英文单词的准确中文意思",stage:"words"},
    {id:"review",icon:"🔁",title:"复习过往单词",detail:"只从已经学过的单元中随机抽取，不提前出现未来词汇",stage:"review"}
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
  const WORD_COMMON_MEANINGS={
    light:["灯；灯光","光线","轻的","浅色的","点燃"],in:["在……里面","进入；在内","在家；在场","流行的"],right:["右边","正确的","权利","恰好"],left:["左边","离开了","剩下的"],fine:["很好","健康的","精细的","罚款"],kind:["亲切的；善良的","种类"],well:["好；很好地","健康的","井"],watch:["观看","手表","留意；看守"],play:["玩；参加运动","演奏","戏剧","播放"],call:["打电话","呼叫；称呼","叫声"],change:["零钱","改变；变化","更换"],fit:["合身","适合","健康的"],mean:["意思是","意味着","吝啬的；刻薄的"],orange:["橙色","橙子"],fish:["鱼；鱼肉","捕鱼"],water:["水","给……浇水"],work:["工作","起作用","作品"],rest:["休息","其余部分"],plan:["计划","平面图"],trip:["旅行","绊倒"],train:["火车","训练"],book:["书","预订"],class:["班级","课程","等级；种类"],school:["学校","学派；学校全体师生"],read:["阅读","读懂；显示"],run:["跑步","经营","运行"],draw:["画画","拉；拖","平局"],wear:["穿；戴","磨损"],meet:["遇见；会面","满足；符合"],please:["请","使高兴；使满意"],name:["名字","命名"],friend:["朋友","支持者"],family:["家庭；家人","家族"],love:["爱；喜爱","热爱的人或事"],like:["喜欢","像；如同"],day:["一天","白天","时期"],color:["颜色","给……涂色"],cold:["寒冷的","感冒","冷淡的"],warm:["温暖的","热情的","使暖和"],party:["聚会","政党","一方；团体"],gift:["礼物","天赋"],time:["时间","次数","为……计时"],homework:["家庭作业","准备工作"],clean:["干净的","打扫","完全地"],flower:["花","开花"],visit:["拜访；参观","访问；逗留"],stay:["停留","保持","住宿"],message:["留言；消息","要旨"],busy:["忙碌的","占线的","热闹的"],number:["数字；号码","数量","编号"],short:["矮的；短的","缺少的","短裤（shorts）"],strong:["强壮的","强烈的","擅长的"],hard:["努力地","困难的","坚硬的"],star:["星星","明星","主演"],present:["礼物","现在","出席的","展示"],card:["卡片","纸牌","证件"],spring:["春天-�׭-�G����ƭy�rEach(button=>button.classList.toggle("active",button.dataset.marketTab===marketTab));
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
    const accuracy=state.quiz.total?Math.round(state.quiz.correct/state.quiz.total*100):0; $("reportCards").innerHTML=`<article><span>📚</span><b>${completedUnits()}</b><small>完成单元</small></article><article><span>🧩</span><b>${state.stageDone.length}</b><small>完成学习步骤</small></article><article><span>🔤</span><b>${state.mastered.length}</b><small>掌握单词</small></article><article><span>🎯</span><b>${accuracy||"—"}${accuracy?"%":""}</b><small>小测正确率</small></article><article><span>🥣</span><b>${state.foods}</b><small>粮食库存</small></article><article><span>🐾</span><b>${state.pets.owned.length}</b><small>动物伙伴</small></article>`;
    const days=[];for(let i=6;i>=0;i--){const d=new Date();d.setDate(d.getDate()-i);const key=iso(d);days.push({name:["日","一","二","三","四","五","六"][d.getDay()],count:state.activity[key]||0,today:i===0});} const max=Math.max(4,...days.map(d=>d.count)); $("weekChart").innerHTML=days.map(d=>`<div class="chart-day"><b>${d.count}</b><span style="height:${Math.max(8,d.count/max*120)}px"></span><small>${d.today?"今天":"周"+d.name}</small></div>`).join("");
    const advice=[]; if(state.weak.length)advice.push(`本周有 ${state.weak.length} 个词需要复习。每天只挑5个做“看中文说英文”，不要罚抄。`); else advice.push("目前没有积累错词。完成一次单元小测后，系统会给出更准确的复习建议。"); if(streakCount()<3)advice.push("先把目标定为连续3天，每天20分钟；形成节奏比一次学一小时更重要。"); else advice.push(`已经连续学习 ${streakCount()} 天。请多肯定孩子的坚持，不只看分数。`); advice.push("家长可以做听众：请孩子用本单元句型介绍一件真实的事，听懂后追问一个简单问题。"); $("parentAdvice").innerHTML=advice.map((a,i)=>`<article><span>${i+1}</span><p>${a}</p></article>`).join("");
  }

  document.addEventListener("click",e=>{
    const view=e.target.closest("[data-view]"); if(view){route(view.dataset.view);return;}
    const profileChoice=e.target.closest("[data-profile-id]");if(profileChoice){switchProfile(profileChoice.dataset.profileId);return;}
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
  $("continueBtn").onclick=()=>{state.stage=nextStage().id;save();route("unit");};
  $("dictionarySearch").addEventListener("input",event=>{dictionaryQuery=event.target.value;dictionaryLetter="all";dictionaryLimit=48;renderDictionary();$("dictionarySearch").focus();});
  $("dictionaryMore").onclick=()=>{dictionaryLimit+=48;renderDictionary();};
  $("closePracticeDialog").onclick=()=>{$("practiceDialog").close?.();$("practiceDialog").classList.remove("open");};
  $("practiceDialog").addEventListener("click",event=>{if(event.target===$("practiceDialog"))$("closePracticeDialog").click();});
  $("wordKnow").onclick=()=>moveWord(true); $("wordAgain").onclick=()=>moveWord(false);
  $("claimDailyBonus").onclick=()=>{const key=`${iso()}:${unitKey()}`,todayTasks=activeTasks();if(dailyComplete()<todayTasks.length||state.bonuses.includes(key))return;state.bonuses.push(key);reward(3,"完成今日全部任务",2);renderToday();};
  $("checkInBtn").onclick=()=>{if(state.signIns.includes(iso()))return;state.signIns.push(iso());reward(2,"今日签到成功");renderGarden();};
  $("feedBtn").onclick=()=>{const progress=plantProgress();if(state.suns<2)return toast("小太阳不足，先完成学习任务吧");state.suns-=2;progress.energy=Math.min(100,progress.energy+20);progress.xp+=5;progress.lastFed=iso();save();toast("💧 浇灌成功，植物成长值 +5；小太阳充足时可以继续浇灌");renderGarden();};

  carePlant();carePets();renderHeader();renderHome();setupAppInstall();
  if("serviceWorker" in navigator) window.addEventListener("load",()=>navigator.serviceWorker.register("service-worker.js?v=18",{updateViaCache:"none"}).then(reg=>reg.update()).catch(()=>{}));
})();
