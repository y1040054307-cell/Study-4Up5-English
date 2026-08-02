import {readFile} from "node:fs/promises";
import vm from "node:vm";

const root=new URL("../",import.meta.url);
const context={window:{},console};
vm.createContext(context);
for(const file of ["curriculum.js","quality-g3a.js","dictionary.js","growth.js","grammar.js","bridge-content.js"]){
  vm.runInContext(await readFile(new URL(file,root),"utf8"),context,{filename:file});
}

const books=context.window.COURSE_BOOKS||[],topics=context.window.GRAMMAR_TOPICS||[],errors=[];
const units=books.flatMap(book=>book.units.map(unit=>({book,unit})));
if(books.length!==8)errors.push(`课程册数应为8，实际为${books.length}`);
if(units.length!==52)errors.push(`单元总数应为52，实际为${units.length}`);
books.forEach(book=>{
  if(!book.version?.status||!book.version?.note)errors.push(`${book.id} 缺少教材版本状态或说明`);
  book.units.forEach((unit,index)=>{
    if(!unit.id)errors.push(`${book.id} Unit ${index+1} 缺少唯一ID`);
    if(!Array.isArray(unit.core)||unit.core.length<8)errors.push(`${unit.id||book.id} 单词少于8个`);
    if(!Array.isArray(unit.patterns)||unit.patterns.length<3)errors.push(`${unit.id||book.id} 核心句型少于3个`);
    if(!unit.story||String(unit.story).split(/\s+/).length<10)errors.push(`${unit.id||book.id} 原创主题短文过短`);
    unit.core?.forEach(word=>{if(!word.word||!word.meaning)errors.push(`${unit.id} 存在空白词条`);});
    unit.patterns?.forEach(pattern=>{if(!pattern.en||!pattern.zh||!pattern.rule)errors.push(`${unit.id} 存在不完整句型`);});
  });
});
const ids=units.map(item=>item.unit.id),duplicates=ids.filter((id,index)=>ids.indexOf(id)!==index);
if(duplicates.length)errors.push(`单元ID重复：${[...new Set(duplicates)].join("、")}`);
const quality=context.window.QUALITY_G3A_CONTENT||{},qualityIds=["g3a-u1","g3a-u2","g3a-u3","g3a-u4"];
qualityIds.forEach(id=>{
  const item=quality[id];
  if(!item){errors.push(`${id} 缺少精品示范内容`);return;}
  if(item.dialogues?.length!==3||item.dialogues.some(scene=>scene.lines?.length!==6))errors.push(`${id} 应有3组、每组6句人工对话`);
  if(item.readings?.length!==3||item.readings.some(reading=>reading.questions?.length!==5))errors.push(`${id} 应有3篇、每篇5问人工阅读`);
  if(item.practice?.length!==20)errors.push(`${id} 人工练习应为20题`);
  item.practice?.forEach((question,index)=>{
    if(!question.opts?.includes(question.answer))errors.push(`${id} 第${index+1}题答案不在选项中`);
    if(!question.why)errors.push(`${id} 第${index+1}题缺少解析`);
  });
});
if(topics.length!==8)errors.push(`语法主题应为8，实际为${topics.length}`);
topics.forEach(topic=>topic.quiz?.forEach((question,index)=>{
  if(!question.options?.includes(question.answer))errors.push(`${topic.id} 第${index+1}题答案不在选项中`);
  if(!question.explain)errors.push(`${topic.id} 第${index+1}题缺少解析`);
}));

if(errors.length)throw new Error(`内容校验失败（${errors.length}项）\n- ${errors.join("\n- ")}`);
console.log(`内容校验通过：${books.length}册、${units.length}单元、${topics.length}个语法主题、${qualityIds.length}个精品示范单元。`);
