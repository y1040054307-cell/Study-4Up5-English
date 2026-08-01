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
      {id:"cat_british",species:"小猫",breed:"英国短毛猫",price:120,icon:"🐱",color:"#8095aa",stages:["🐾","🐱","😺","👑😺✨"],forms:["奶萌幼崽","圆脸小猫","稳重成猫","蓝晶猫王"],description:"圆脸安静，喜欢陪你一起复习。"},
      {id:"cat_orange",species:"小猫",breed:"中华橘猫",price:70,icon:"🐈",color:"#e79a43",stages:["🐾","🐈","😸","☀️👑😸"],forms:["橘色幼崽","活力小橘","阳光成猫","太阳橘猫王"],description:"亲人活泼，是常见又温暖的伙伴。"},
      {id:"cat_ragdoll",species:"小猫",breed:"布偶猫",price:220,icon:"🐱",color:"#9b8dd0",stages:["🐾","🐱","😻","🌌👑😻"],forms:["云朵幼崽","温柔小猫","优雅成猫","星河布偶女王"],description:"温柔优雅，终极形态拥有星河披风。"},
      {id:"dog_golden",species:"小狗",breed:"金毛寻回犬",price:180,icon:"🐕",color:"#d89a45",stages:["🐾","🐶","🐕","🏅👑🐕✨"],forms:["金色幼崽","热情小狗","可靠金毛","荣耀守护犬王"],description:"友善可靠，会认真守护学习成果。"},
      {id:"dog_corgi",species:"小狗",breed:"威尔士柯基犬",price:140,icon:"🐕",color:"#d8773f",stages:["🐾","🐶","🐕","🌈👑🐶"],forms:["短腿幼崽","快乐柯基","勇气成犬","彩虹柯基骑士"],description:"短腿却很有勇气，陪你跑完长期任务。"},
      {id:"dog_shiba",species:"小狗",breed:"柴犬",price:260,icon:"🐕",color:"#b66b3d",stages:["🐾","🐶","🐕","🔥👑🐕"],forms:["柴柴幼崽","机灵小柴","沉稳成犬","赤焰柴犬将军"],description:"独立机灵，终极形态是赤焰守护将军。"},
      {id:"turtle_pond",species:"小乌龟",breed:"中华草龟",price:90,icon:"🐢",color:"#668660",stages:["🥚","🐢","🐢🌿","🌿👑🐢"],forms:["温暖龟蛋","小草龟","沉稳成龟","青木玄武守卫"],description:"成长缓慢而稳定，最适合象征长期坚持。"},
      {id:"turtle_slider",species:"小乌龟",breed:"巴西红耳龟",price:130,icon:"🐢",color:"#6b9b63",stages:["🥚","🐢","🐢💧","🌊👑🐢"],forms:["水纹龟蛋","红耳幼龟","活力成龟","碧海红耳领主"],description:"常见活泼，喜欢清水和规律的照顾。"},
      {id:"turtle_box",species:"小乌龟",breed:"黄缘闭壳龟",price:300,icon:"🐢",color:"#9b7a38",stages:["🥚","🐢","🐢⭐","🌌👑🐢"],forms:["金纹龟蛋","黄缘幼龟","星甲成龟","星甲玄武神兽"],description:"稀有稳重，终极星甲需要漫长陪伴。"}
    ].map(item => ({...item, thresholds:[0, 60, 180, 420]}))
  };
})();
