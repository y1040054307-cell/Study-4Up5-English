import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const version = 28;
const maxPartBytes = 20 * 1024 * 1024;
const concurrency = 4;
const courseDir = path.join(root, "assets", "audio");

const XDF_PHONEMES = {
  "/iː/":"496fa8c5b185e9d155d7.mp3", "/ɪ/":"9eeb45ac15980f053465.mp3", "/e/":"51f575eab8eb20b5fbf7.mp3", "/æ/":"0d692636a009ea99b9f9.mp3",
  "/ɜː/":"2b2c11bd1dcf81f786f0.mp3", "/ə/":"04c02a21344cc0750a68.mp3", "/ʌ/":"1c0775f0ef22273a7e85.mp3", "/uː/":"45f67d333cfcb525cd4f.mp3",
  "/ʊ/":"ef8b714cea50701066b8.mp3", "/ɔː/":"bdd75c97619e90b5035d.mp3", "/ɒ/":"9bf1a8bbcfc0c68ee326.mp3", "/ɑː/":"db4b962669f0c8e54737.mp3",
  "/eɪ/":"28dc047b815750a6c5ee.mp3", "/aɪ/":"a83bc6c3a61e526de4ba.mp3", "/ɔɪ/":"c037f2e2fa30fc2711b8.mp3", "/aʊ/":"8088e9346a7f75cb9b3c.mp3",
  "/əʊ/":"eae06d0db4f09c8f142c.mp3", "/ɪə/":"6ff61b12d4e985c668ac.mp3", "/eə/":"f4eac5545f36dce272b8.mp3", "/ʊə/":"1c01bd93c34338ca2081.mp3",
  "/p/":"de1d50e7127182f7704d.mp3", "/t/":"5df0fde0b4fd99cee219.mp3", "/k/":"2d9c9b3d1ecdf33d659a.mp3", "/f/":"a4209e9d9fd9709a1e76.mp3",
  "/s/":"9b0599891bade0c04c46.mp3", "/ʃ/":"c4a898ad851940132475.mp3", "/θ/":"d994b922bc7ec82646ff.mp3", "/h/":"fc7ee36388f605e0a8c6.mp3",
  "/tʃ/":"a8bd1716350ce6be0735.mp3", "/tr/":"4fad2aa8319f96b7034c.mp3", "/ts/":"b854e5495600f691d169.mp3", "/b/":"f80e74ce936868ba6237.mp3",
  "/d/":"9a351a93fddb04c95162.mp3", "/g/":"9f1f33f7bd448e4b2262.mp3", "/v/":"1ee6a0a833eb5f5c40b4.mp3", "/z/":"21d839e770c9a38de14a.mp3",
  "/ʒ/":"69df71ab3487efcb6bfa.mp3", "/ð/":"ab9c619dfb987add2069.mp3", "/r/":"b6c52369def91ab36852.mp3", "/dʒ/":"70e57979284156031990.mp3",
  "/dr/":"f981507e87b07895a224.mp3", "/dz/":"a9879c494d9159bdd679.mp3", "/m/":"01ef4567a1aa014ae30a.mp3", "/n/":"7f9f8679b25155de6b47.mp3",
  "/ŋ/":"9f10d5b95482af1e9815.mp3", "/l/":"a4c2272a2e766194a4a1.mp3", "/j/":"fe61e7decb7acb2e0d8b.mp3", "/w/":"4e6d33cbf2ba6dfb91b7.mp3"
};
const XDF_BASE = "https://www.xdf.cn/zhuanti/bd-phonetic-alphabet-card/";

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
const cleanText = text => String(text || "").replace(/[“”]/g, '"').replace(/[’]/g, "'").replace(/[^A-Za-z0-9' -]/g, " ").replace(/\s+/g, " ").trim();
const isWordCategory = category => category === "word" || category === "dictionary" || category === "phonics";

function providers(item) {
  const text = cleanText(item.text);
  const encoded = encodeURIComponent(text);
  const youdao = { name:"有道词典自然语音", url:`https://dict.youdao.com/dictvoice?audio=${encoded}&type=2`, referer:"https://dict.youdao.com/" };
  const baidu = { name:"百度翻译自然语音", url:`https://fanyi.baidu.com/gettts?lan=en&text=${encoded}&spd=3&source=web`, referer:"https://fanyi.baidu.com/" };
  return isWordCategory(item.category) ? [youdao, baidu] : [baidu, youdao];
}

function looksLikeAudio(buffer, contentType = "") {
  if (buffer.length < 500) return false;
  if (/audio|mpeg|mp3/i.test(contentType)) return true;
  return buffer.subarray(0, 3).toString("ascii") === "ID3" || (buffer[0] === 0xff && (buffer[1] & 0xe0) === 0xe0);
}

async function fetchBuffer(source, attempts = 3) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 20000);
    try {
      const response = await fetch(source.url, { redirect:"follow", signal:controller.signal, headers:{ "User-Agent":`Mozilla/5.0 SunnyEnglish/${version}`, Referer:source.referer, Accept:"audio/mpeg,audio/*;q=0.9,*/*;q=0.2" } });
      const buffer = Buffer.from(await response.arrayBuffer());
      if (!response.ok || !looksLikeAudio(buffer, response.headers.get("content-type") || "")) throw new Error(`${response.status} ${response.headers.get("content-type") || "unknown"} ${buffer.length}B`);
      return buffer;
    } catch (error) {
      lastError = error;
      if (attempt < attempts) await wait(350 * attempt);
    } finally { clearTimeout(timer); }
  }
  throw lastError;
}

async function fetchCourseClip(item) {
  const errors = [];
  for (const source of providers(item)) {
    try { return { buffer:await fetchBuffer(source), source:source.name }; }
    catch (error) { errors.push(`${source.name}: ${error.message}`); }
  }
  throw new Error(errors.join(" | "));
}

function resetOutputDirectory() {
  fs.mkdirSync(courseDir, { recursive:true });
  for (const name of fs.readdirSync(courseDir)) if (/^audio-pack-\d+\.bin$/.test(name)) fs.rmSync(path.join(courseDir, name), { force:true });
}

function writeCourseParts(items, clips) {
  resetOutputDirectory();
  const entries = {}, parts = [];let partChunks = [], partBytes = 0, totalBytes = 0, clipCount = 0;
  const flush = () => {
    if (!partChunks.length) return;
    const index = parts.length, filename = `audio-pack-${String(index).padStart(2, "0")}.bin`, file = path.join(courseDir, filename);
    fs.writeFileSync(file, Buffer.concat(partChunks));
    parts.push({ url:`assets/audio/${filename}?v=${version}`, bytes:partBytes });
    totalBytes += partBytes;partChunks = [];partBytes = 0;
  };
  items.forEach((item, index) => {
    const clip = clips[index];if (!clip) return;
    if (partBytes && partBytes + clip.buffer.length > maxPartBytes) flush();
    entries[item.key] = [parts.length, partBytes, clip.buffer.length];
    partChunks.push(clip.buffer);partBytes += clip.buffer.length;clipCount += 1;
  });
  flush();
  const index = { version, codec:"mp3", bytes:totalBytes, clips:clipCount, parts, sources:"国内自然语音：有道（单词优先）· 百度（句子优先）", entries };
  fs.writeFileSync(path.join(root, "audio-index.js"), `window.LOCAL_AUDIO_PACK=${JSON.stringify(index)};\n`);
  return index;
}

async function writePhonemePack() {
  const chunks = [], entries = {};let offset = 0;
  for (const [symbol, filename] of Object.entries(XDF_PHONEMES)) {
    const buffer = await fetchBuffer({ url:XDF_BASE + filename, referer:XDF_BASE }, 3);
    entries[symbol] = [offset, buffer.length];chunks.push(buffer);offset += buffer.length;
    await wait(60);
  }
  const url = `assets/audio/phoneme-natural-pack.bin?v=${version}`;
  fs.mkdirSync(courseDir, { recursive:true });
  fs.writeFileSync(path.join(courseDir, "phoneme-natural-pack.bin"), Buffer.concat(chunks));
  fs.writeFileSync(path.join(root, "phoneme-audio.js"), `window.PHONEM_AUDIO_PACK=${JSON.stringify({version,codec:"mp3",url,bytes:offset,clips:Object.keys(entries).length,source:"新东方48音标示范音",sourcePage:"https://www.xdf.cn/zhuanti/bd-phonetic-alphabet-card/index.html",entries})};\n`);
  console.log(`phonemes: ${Object.keys(entries).length}, ${(offset / 1048576).toFixed(1)} MB`);
}

async function main() {
  const allItems = JSON.parse(fs.readFileSync(path.join(root, "tools", "audio-list.json"), "utf8"));
  const items = allItems.filter(item => item.category !== "phoneme"), clips = new Array(items.length), failures = [];
  let next = 0, finished = 0;
  async function worker() {
    while (true) {
      const index = next++;if (index >= items.length) return;
      try { clips[index] = await fetchCourseClip(items[index]); }
      catch (error) { failures.push({ key:items[index].key, category:items[index].category, error:error.message }); }
      finished += 1;
      if (finished % 100 === 0 || finished === items.length) console.log(`${finished}/${items.length}, missing ${failures.length}`);
      await wait(80);
    }
  }
  await Promise.all(Array.from({ length:concurrency }, () => worker()));
  const pack = writeCourseParts(items, clips);
  await writePhonemePack();
  if (failures.length) {
    fs.writeFileSync(path.join(courseDir, "missing-audio.json"), `${JSON.stringify(failures, null, 2)}\n`);
    console.warn(`Missing ${failures.length} clips. Online and device voice remain available for those entries.`);
  } else fs.rmSync(path.join(courseDir, "missing-audio.json"), { force:true });
  if (failures.length > Math.max(25, Math.floor(items.length * 0.02))) throw new Error(`Too many missing natural clips: ${failures.length}/${items.length}`);
  console.log(`course: ${pack.clips}/${items.length} clips, ${pack.parts.length} parts, ${(pack.bytes / 1048576).toFixed(1)} MB`);
}

await main();
