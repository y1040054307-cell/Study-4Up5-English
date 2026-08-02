import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";

const root = path.resolve(import.meta.dirname, "..");
const windowsExe = path.join(root, "tools", "espeak-ng", "eSpeak NG", "espeak-ng.exe");
const espeak = process.env.ESPEAK_BIN || (fs.existsSync(windowsExe) ? windowsExe : "espeak-ng");
const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "sunny-audio-"));
const mode = process.argv.includes("--all") ? "all" : "phonemes";

const PHONEMES = {
  "/ɪ/":"I", "/e/":"E", "/æ/":"a", "/ʌ/":"V", "/ɒ/":"0", "/ʊ/":"U", "/ə/":"@",
  "/iː/":"i:", "/ɑː/":"A:", "/ɔː/":"O:", "/uː/":"u:", "/ɜː/":"3:",
  "/eɪ/":"eI", "/aɪ/":"aI", "/ɔɪ/":"OI", "/əʊ/":"oU", "/aʊ/":"aU", "/ɪə/":"I@", "/eə/":"E@", "/ʊə/":"U@",
  "/p/":"p", "/b/":"b", "/t/":"t", "/d/":"d", "/k/":"k", "/g/":"g", "/f/":"f", "/v/":"v",
  "/θ/":"T", "/ð/":"D", "/s/":"s", "/z/":"z", "/ʃ/":"S", "/ʒ/":"Z", "/h/":"h", "/tʃ/":"tS", "/dʒ/":"dZ",
  "/m/":"m", "/n/":"n", "/ŋ/":"N", "/l/":"l", "/r/":"r", "/j/":"j", "/w/":"w",
  "/tr/":"tr", "/dr/":"dr", "/ts/":"ts", "/dz/":"dz"
};

function wavData(file) {
  const wav = fs.readFileSync(file);
  if (wav.toString("ascii", 0, 4) !== "RIFF" || wav.toString("ascii", 8, 12) !== "WAVE") throw new Error("Invalid WAV");
  let offset = 12, format = null, data = null;
  while (offset + 8 <= wav.length) {
    const id = wav.toString("ascii", offset, offset + 4), size = wav.readUInt32LE(offset + 4), start = offset + 8;
    if (id === "fmt ") format = { codec:wav.readUInt16LE(start), channels:wav.readUInt16LE(start+2), rate:wav.readUInt32LE(start+4), bits:wav.readUInt16LE(start+14) };
    if (id === "data") data = wav.subarray(start, start + size);
    offset = start + size + (size & 1);
  }
  if (!format || !data || format.codec !== 1 || format.channels !== 1 || format.bits !== 16) throw new Error("Unsupported WAV format");
  return { ...format, data };
}

function resample16(wav, targetRate) {
  const sourceLength = wav.data.length / 2, targetLength = Math.max(1, Math.round(sourceLength * targetRate / wav.rate));
  const output = Buffer.allocUnsafe(targetLength * 2);
  for (let i = 0; i < targetLength; i++) {
    const sourcePosition = i * (sourceLength - 1) / Math.max(1, targetLength - 1), left = Math.floor(sourcePosition), right = Math.min(sourceLength - 1, left + 1), mix = sourcePosition - left;
    const sample = Math.round(wav.data.readInt16LE(left * 2) * (1 - mix) + wav.data.readInt16LE(right * 2) * mix);
    output.writeInt16LE(sample, i * 2);
  }
  return output;
}

function toUnsigned8(pcm16) {
  const output = Buffer.allocUnsafe(pcm16.length / 2);
  for (let i = 0; i < output.length; i++) output[i] = Math.max(0, Math.min(255, Math.round(pcm16.readInt16LE(i * 2) / 256 + 128)));
  return output;
}

function synthesize(text, index, speed = 128) {
  const output = path.join(tempDir, `${index}.wav`);
  const args = ["-v", "en-gb", "-s", String(speed), "-p", "50", "-a", "175", "-w", output, text];
  const env = { ...process.env };
  if (process.platform === "win32") env.ESPEAK_DATA_PATH = path.dirname(windowsExe);
  const result = spawnSync(espeak, args, { env, encoding:"utf8" });
  if (result.status !== 0 || !fs.existsSync(output)) throw new Error(`eSpeak failed for ${text}: ${result.stderr || result.stdout}`);
  return wavData(output);
}

function writePhonemes() {
  const chunks = [], entries = {}; let offset = 0, index = 0;
  for (const [symbol, code] of Object.entries(PHONEMES)) {
    const pcm = resample16(synthesize(`[[${code}]]`, index++, 105), 16000);
    entries[symbol] = [offset, pcm.length]; chunks.push(pcm); offset += pcm.length;
  }
  fs.mkdirSync(path.join(root, "assets"), { recursive:true });
  fs.writeFileSync(path.join(root, "assets", "phoneme-pack.bin"), Buffer.concat(chunks));
  fs.writeFileSync(path.join(root, "phoneme-audio.js"), `window.PHONEM_AUDIO_PACK=${JSON.stringify({version:24,url:"assets/phoneme-pack.bin?v=24",sampleRate:16000,bits:16,bytes:offset,clips:Object.keys(entries).length,engine:"eSpeak NG 1.52 · en-GB · phoneme input",entries})};\n`);
  console.log(`phonemes: ${Object.keys(entries).length}, bytes: ${offset}`);
}

function writeCoursePack() {
  const items = JSON.parse(fs.readFileSync(path.join(root, "tools", "audio-list.json"), "utf8")).filter(item => item.category !== "phoneme");
  const chunks = [], entries = {}; let offset = 0;
  items.forEach((item, index) => {
    const speed = item.category === "word" || item.category === "dictionary" ? 118 : item.category === "story" ? 122 : 132;
    const pcm = toUnsigned8(resample16(synthesize(item.text, index + 1000, speed), 8000));
    entries[item.key] = [offset, pcm.length]; chunks.push(pcm); offset += pcm.length;
    if ((index + 1) % 200 === 0) console.log(`${index + 1}/${items.length}`);
  });
  fs.writeFileSync(path.join(root, "assets", "audio-pack.bin"), Buffer.concat(chunks));
  fs.writeFileSync(path.join(root, "audio-index.js"), `window.LOCAL_AUDIO_PACK=${JSON.stringify({version:24,url:"assets/audio-pack.bin?v=24",sampleRate:8000,bits:8,bytes:offset,clips:items.length,engine:"eSpeak NG 1.52 · en-GB",entries})};\n`);
  console.log(`course clips: ${items.length}, bytes: ${offset}`);
}

try {
  writePhonemes();
  if (mode === "all") writeCoursePack();
} finally {
  fs.rmSync(tempDir, { recursive:true, force:true });
}
