/* 成长商城数据：植物价格逐级提高，动物成长按长期手动投喂设计。 */
(() => {
  "use strict";
  const thresholds = [0, 40, 120, 260, 500];
  window.GROWTH_CATALOG = {
    plants: [
      {id:"sunflower",name:"向阳花",rarity:"普通",price:0,color:"#f2b93f",stages:["🌱","🌿","🌻","🌻✨","☀️🌳✨"],forms:["破土小芽","向阳绿苗","灿烂向阳花","金光花王","太阳圣树"],description:"陪伴每位新同学开始第一段坚持。"},
      {id:"clover",name:"幸运四叶草",rarity:"进阶",price:30,color:"#55ad62",stages:["🌱","☘️","🍀","🍀✨","🌈🍀✨"],forms:["幸运种子","三叶幼苗","四叶精灵","幸运花环","彩虹幸运王冠"],description:"叶片会随着坚持逐渐聚成幸运光环。"},
      {id:"cactus",name:"沙漠守护者",rarity:"进阶",price:60,color:"#47a873",stages:["🌱","🌵","🌵🌼","🌵✨","🏜️👑🌵"],forms:["沙粒嫩芽","小仙人掌","沙漠开花","荧光守卫","沙漠王座"],description:"坚韧的沙漠伙伴，象征不怕困难。"},
      {id:"tulip",name:"彩虹郁金香",rarity:"稀有",price:100,color:"#ef718f",stages:["🌱","🌷","🌷🌷","🌷✨","🌈🌷👑"],forms:["郁金香芽","初绽花朵","缤纷花束","水晶花冠","彩虹花皇"],description:"每次照顾都会让花冠更加绚丽。"},
      {id:"sakura",name:"樱花心愿树",rarity:"稀有",price:160,color:"#ef9fbd",stages:["🌱","🌿","🌸","🌸🌳","🌸🌳✨"],forms:["心愿种子","樱叶幼树","初樱盛开","粉云樱树","星雨心愿神树"],description:"终极形态会落下闪耀的心愿花雨。"},
      {id:"lotus",name:"水晶莲花",rarity:"史诗",price:240,color:"#68bcd2",stages:["💧","🌱","🪷","💎🪷","🌊💎🪷✨"],forms:["清澈水滴","莲心嫩芽","静水莲花","水晶圣莲","星海水晶莲座"],description:"从一滴清水成长为照亮湖面的圣莲。"},
      {id:"aurora",name:"极光藤蔓",rarity:"史诗",price:360,color:"#7c78df",stages:["🌱","🌿","🪻","🌌🌿","🌌🪻✨"],forms:["夜色种子","星点藤芽","极光花簇","天幕藤桥","永夜极光王庭"],description:"稀有藤蔓会在终极形态展开极光天幕。"},
      {id:"star_tree",name:"星愿神树",rarity:"传说",price:520,color:"#725bd1",stages:["✨","🌱✨","🌳⭐","🌳🌌","🌌🌳👑"],forms:["星尘核心","星芽","许愿树","银河古树","星愿宇宙神树"],description:"收集学习星光，最终点亮整片银河。"},
      {id:"dragon_flower",name:"龙焰圣花",rarity:"传说",price:750,color:"#e45b43",stages:["🔥","🌱🔥","🌺🔥","🐉🌺","🐉🔥🌺👑"],forms:["龙焰火种","赤焰幼芽","烈焰圣花","龙魂觉醒","九天龙焰花皇"],description:"只有长期坚持者才能唤醒沉睡的龙魂。"},
      {id:"world_tree",name:"宇宙世界树",rarity:"神话",price:1000,color:"#e3b446",stages:["🌟","🌱🌟","🌳✨","🌍🌳","🌌🌍🌳👑✨"],forms:["宇宙星核","创世嫩芽","星辉巨树","世界守护树","宇宙创世终极神树"],description:"商城最高荣誉，终极形态连接星辰与世界。"}
    ].map(item => ({...item, thresholds})),
    pets: [
      {id:"cat",species:"小猫",name:"橘色小猫",price:80,icon:"🐱",color:"#e79a43",image:"assets/cat-growth.webp",stages:["幼崽","少年","成年","完全成长"],forms:["奶萌小猫","活力小猫","阳光成猫","威风大猫"],description:"从小小橘猫逐渐长成蓬松、可靠的学习伙伴。"},
      {id:"dog",species:"小狗",name:"金色小狗",price:120,icon:"🐶",color:"#d89a45",image:"assets/dog-growth.webp",stages:["幼崽","少年","成年","完全成长"],forms:["奶萌小狗","活力小狗","可靠成犬","威风大狗"],description:"从圆滚滚的小狗逐渐长成强壮、友善的陪伴者。"},
      {id:"turtle",species:"小乌龟",name:"绿色小乌龟",price:100,icon:"🐢",color:"#78a85b",image:"assets/turtle-growth.webp",stages:["幼崽","少年","成年","完全成长"],forms:["破壳幼龟","好奇小龟","沉稳成龟","威严大龟"],description:"从刚破壳的小乌龟，慢慢成长为沉稳强大的长期伙伴。"}
    ].map(item => ({...item, thresholds:[0, 60, 180, 420]}))
  };
})();
