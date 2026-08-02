import fs from "node:fs";
import vm from "node:vm";

const loadPack = (file, globalName) => {
  const context = { window:{} };
  vm.runInNewContext(fs.readFileSync(file, "utf8"), context);
  return context.window[globalName];
};

const isSupportedAudio = buffer => buffer.length >= 12 && (
  buffer.subarray(0, 3).toString("ascii") === "ID3" ||
  (buffer[0] === 0xff && (buffer[1] & 0xe0) === 0xe0) ||
  (buffer.subarray(0, 4).toString("ascii") === "RIFF" && buffer.subarray(8, 12).toString("ascii") === "WAVE")
);

const stripQuery = url => url.split("?", 1)[0];
const course = loadPack("audio-index.js", "LOCAL_AUDIO_PACK");
const phonemes = loadPack("phoneme-audio.js", "PHONEM_AUDIO_PACK");

if (course?.codec !== "mp3" || !Array.isArray(course.parts) || !course.parts.length) {
  throw new Error("Course audio index is not a multipart MP3 pack");
}
if (phonemes?.codec !== "mp3" || !phonemes.url) {
  throw new Error("Phoneme audio index is not an MP3 pack");
}

const partBuffers = course.parts.map(part => {
  const file = stripQuery(part.url);
  const buffer = fs.readFileSync(file);
  if (buffer.length !== part.bytes) throw new Error(`Part size mismatch: ${file}`);
  return buffer;
});
const entries = Object.values(course.entries);
for (const [partIndex, start, length] of entries) {
  const buffer = partBuffers[partIndex];
  if (!buffer || start < 0 || length <= 0 || start + length > buffer.length) {
    throw new Error(`Invalid course audio entry: ${partIndex},${start},${length}`);
  }
  if (!isSupportedAudio(buffer.subarray(start, start + Math.min(length, 16)))) {
    throw new Error(`Course entry is not supported audio: ${partIndex},${start},${length}`);
  }
}

const phonemeBuffer = fs.readFileSync(stripQuery(phonemes.url));
if (phonemeBuffer.length !== phonemes.bytes) throw new Error("Phoneme pack size mismatch");
for (const [start, length] of Object.values(phonemes.entries)) {
  if (start < 0 || length <= 0 || start + length > phonemeBuffer.length) {
    throw new Error(`Invalid phoneme audio entry: ${start},${length}`);
  }
  if (!isSupportedAudio(phonemeBuffer.subarray(start, start + Math.min(length, 16)))) {
    throw new Error(`Phoneme entry is not supported audio: ${start},${length}`);
  }
}

const totalBytes = partBuffers.reduce((sum, buffer) => sum + buffer.length, 0);
const report = {
  version:course.version,
  courseClips:course.clips,
  courseEntries:entries.length,
  courseParts:course.parts.length,
  courseBytes:totalBytes,
  phonemeClips:phonemes.clips,
  phonemeEntries:Object.keys(phonemes.entries).length,
  phonemeBytes:phonemeBuffer.length
};
if (course.clips !== entries.length || course.bytes !== totalBytes) throw new Error(JSON.stringify(report));
if (phonemes.clips !== report.phonemeEntries) throw new Error(JSON.stringify(report));
console.log(JSON.stringify(report, null, 2));
