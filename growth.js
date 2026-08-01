/* 成长商城数据：植物价格逐级提高，动物成长按长期手动投喂设计。 */
(() => {
  "use strict";
  const thresholds = [0, 40, 120, 260, 500];
  window.GROWTH_CATALOG = {
    plants: [
      {id:"sunflower",name:"晨光铃兰",rarity:"普通",role:"采光型",price:0,color:"#f2b93f",stages:["🌱","🌿","🌼","🌼✨","🌞🌼✨"],forms:["晨光种子","铃兰幼苗","采光花朵","晨曦花冠","太阳铃兰守卫"],description:"收集清晨光点，帮学习花园保持明亮和专注。"},
      {id:"clover",name:"幸运豆荚",rarity:"进阶",role:"鼓励型",price:30,color:"#55ad62",stages:["🌱","🌿","🫛","🫛✨","🌈🫛✨"],forms:["幸运小豆","卷叶豆苗","笑脸豆荚","连心豆塔","彩虹豆荚队长"],description:"会弹出鼓励豆，让遇到难题的小伙伴重新振作。"},
      {id:"cactus",name:"盾叶仙掌",rarity:"进阶",role:"防护型",price:60,color:"#47a873",stages:["🌱","🌵","🛡️🌵","🌵✨","🛡️🌵👑"],forms:["厚叶种子","小盾仙掌","双叶护卫","荧光盾卫","翡翠盾叶队长"],description:"展开厚实叶盾，挡住走神、拖延和粗心小怪。"},
      {id:"tulip",name:"音符喇叭花",rarity:"稀有",role:"音波型",price:100,color:"#ef718f",stages:["🌱","🌷","🎵🌷","🎶🌷","🌈🎺🌷"],forms:["音符花籽","小喇叭芽","清音花朵","和声花束","彩虹旋律花王"],description:"吹出清脆音符，提醒小主人认真听读和大胆开口。"},
      {id:"sakura",name:"泡泡樱树",rarity:"稀有",role:"安抚型",price:160,color:"#ef9fbd",stages:["🌱","🌿","🌸","🫧🌸🌳","🫧🌸🌳✨"],forms:["泡泡种子","粉叶幼树","初樱泡泡","云朵樱树","梦境泡泡樱王"],description:"释放柔软泡泡，把焦躁情绪变成安静的学习节奏。"},
      {id:"lotus",name:"涟漪莲卫",rarity:"史诗",role:"净化型",price:240,color:"#68bcd2",stages:["💧","🌱","🪷","💎🪷","🌊💎🪷✨"],forms:["清澈水滴","莲心嫩芽","涟漪莲花","水晶莲卫","星海涟漪守护者"],description:"荡开清澈涟漪，帮助复习错词并整理混乱的记忆。"},
      {id:"aurora",name:"极光藤哨",rarity:"史诗",role:"控场型",price:360,color:"#7c78df",stages:["🌱","🌿","🪻","🌌🌿","🌌🪻✨"],forms:["夜色藤籽","星点藤芽","极光花哨","天幕藤桥","永夜极光指挥官"],description:"挥动极光藤条，把四处乱跑的注意力重新聚拢。"},
      {id:"star_tree",name:"星果抛抛树",rarity:"传说",role:"远投型",price:520,color:"#725bd1",stages:["✨","🌱✨","🌳⭐","🌳🌌","🌌🌳👑"],forms:["星果核心","抛抛星芽","星果小树","银河抛抛树","星雨抛抛统领"],description:"把记忆星果抛向远方，让学过的知识隔天再次出现。"},
      {id:"dragon_flower",name:"赤焰龙花",rarity:"传说",role:"爆发型",price:750,color:"#e45b43",stages:["🔥","🌱🔥","🌺🔥","🐉🌺","🐉🔥🌺👑"],forms:["赤焰火种","龙纹幼芽","烈焰龙花","龙翼花卫","九天赤焰花将"],description:"困难来临时燃起勇气火焰，陪孩子完成高难度挑战。"},
      {id:"world_tree",name:"彩虹知识古树",rarity:"神话",role:"全能型",price:1000,color:"#e3b446",stages:["🌟","🌱🌟","🌳✨","🌍🌳","🌈🌍🌳👑✨"],forms:["知识星核","彩虹嫩芽","智慧巨树","花园守护古树","彩虹知识终极古树"],description:"长期坚持者的最高荣誉，连接词汇、句型、阅读和表达。"}
    ].map(item => ({...item, thresholds})),
    pets: [
      {id:"cat",species:"小猫",name:"橘色小猫",price:80,icon:"🐱",color:"#e79a43",image:"assets/cat-growth.webp",stages:["幼崽","少年","成年","完全成长"],forms:["奶萌小猫","活力小猫","阳光成猫","威风大猫"],description:"从小小橘猫逐渐长成蓬松、可靠的学习伙伴。"},
      {id:"dog",species:"小狗",name:"金色小狗",price:120,icon:"🐶",color:"#d89a45",image:"assets/dog-growth.webp",stages:["幼崽","少年","成年","完全成长"],forms:["奶萌小狗","活力小狗","可靠成犬","威风大狗"],description:"从圆滚滚的小狗逐渐长成强壮、友善的陪伴者。"},
      {id:"turtle",species:"小乌龟",name:"绿色小乌龟",price:100,icon:"🐢",color:"#78a85b",image:"assets/turtle-growth.webp",stages:["幼崽","少年","成年","完全成长"],forms:["破壳幼龟","好奇小龟","沉稳成龟","威严大龟"],description:"从刚破壳的小乌龟，慢慢成长为沉稳强大的长期伙伴。"}
    ].map(item => ({...item, thresholds:[0, 60, 180, 420]}))
  };
})();
