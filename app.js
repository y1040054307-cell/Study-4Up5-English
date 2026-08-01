(() => {
  "use strict";

  const STORAGE_KEY = "sunny-english-island-2026-v1";
  const today = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const defaultState = {
    completedDays: [],
    learnedWords: [],
    weakWords: [],
    quizBest: {},
    stars: 0,
    suns: 0,
    signIns: [],
    rewards: {},
    sound: true,
    currentLesson: 0,
    plant: { energy: 70, xp: 0, feeds: 0, lastDecayDate: today() }
  };

  const loadState = () => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      return saved
        ? {
            ...defaultState,
            ...saved,
            plant: { ...defaultState.plant, ...(saved.plant || {}) },
            rewards: saved.rewards || {},
            quizBest: saved.quizBest || {}
          }
        : structuredClone(defaultState);
    } catch {
      return structuredClone(defaultState);
    }
  };

  let state = loadState();
  let cardLessonIndex = state.currentLesson || 0;
  let cardIndex = 0;
  let quizLessonIndex = state.currentLesson || 0;
  let quizQuestions = [];
  let quizPosition = 0;
  let quizScore = 0;
  let toastTimer;

  const saveState = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    renderAllStats();
  };

  const daysBetween = (from, to) => {
    const start = new Date(`${from}T00:00:00`);
    const end = new Date(`${to}T00:00:00`);
    return Math.max(0, Math.floor((end - start) / 86400000));
  };

  const applyPlantDecay = () => {
    const elapsed = daysBetween(state.plant.lastDecayDate, today());
    if (elapsed > 0) {
      state.plant.energy = Math.max(0, state.plant.energy - elapsed * 10);
      state.plant.lastDecayDate = today();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  };

  const $ = (id) => document.getElementById(id);
  const escapeHtml = (value) =>
    String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");

  const shuffle = (items) => {
    const list = [...items];
    for (let i = list.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [list[i], list[j]] = [list[j], list[i]];
    }
    return list;
  };

  const showToast = (message) => {
    const toast = $("toast");
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2400);
  };

  const markActivity = () => {
    state.plant.lastActivityDate = today();
  };

  const claimReward = (key, amount, message) => {
    if (state.rewards[key]) return false;
    state.rewards[key] = true;
    state.suns += amount;
    markActivity();
    saveState();
    showToast(`☀️ ${message}，获得 ${amount} 个小太阳`);
    return true;
  };

  const speak = (text, rate = 0.84) => {
    if (!state.sound || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = rate;
    const voices = window.speechSynthesis.getVoices();
    const englishVoice = voices.find((voice) => voice.lang.startsWith("en"));
    if (englishVoice) utterance.voice = englishVoice;
    window.speechSynthesis.speak(utterance);
  };

  const firstIncompleteLesson = () => {
    const index = LESSONS.findIndex((lesson) => !state.completedDays.includes(lesson.day));
    return index === -1 ? 14 : index;
  };

  const routeTo = (route) => {
    const pageName = route === "learn" ? "learn" : route;
    document.querySelectorAll(".page").forEach((page) => {
      page.classList.toggle("active", page.dataset.page === pageName);
    });
    document.querySelectorAll(".bottom-nav button").forEach((button) => {
      const activeRoute = route === "learn" ? "plan" : route;
      button.classList.toggle("active", button.dataset.route === activeRoute);
    });
    if (route === "plan") renderPlan();
    if (route === "cards") renderFlashcard();
    if (route === "quiz") resetQuizView();
    if (route === "growth") renderPlant();
    window.scrollTo({ top: 0, behavior: "smooth" });
    $("app").focus({ preventScroll: true });
  };

  const populateSelectors = () => {
    const options = LESSONS.map(
      (lesson) => `<option value="${lesson.day - 1}">第${lesson.day}天 · ${escapeHtml(lesson.title)}</option>`
    ).join("");
    $("cardDaySelect").innerHTML = options;
    $("quizDaySelect").innerHTML = options;
    $("cardDaySelect").value = String(cardLessonIndex);
    $("quizDaySelect").value = String(quizLessonIndex);
  };

  const renderPlan = () => {
    $("planGrid").innerHTML = LESSONS.map((lesson) => {
      const complete = state.completedDays.includes(lesson.day);
      return `
        <button class="day-card ${complete ? "completed" : ""}" type="button" data-lesson="${lesson.day - 1}" data-icon="${lesson.icon}">
          <span class="day-top"><span class="day-number">DAY ${String(lesson.day).padStart(2, "0")}</span><span class="complete-mark">✓</span></span>
          <h3>${escapeHtml(lesson.title)}</h3>
          <p>${escapeHtml(lesson.focus)}</p>
          <span class="phase-tag ${lesson.phaseKey}">${escapeHtml(lesson.phase)}</span>
        </button>`;
    }).join("");
    document.querySelectorAll("[data-lesson]").forEach((button) => {
      button.addEventListener("click", () => openLesson(Number(button.dataset.lesson)));
    });
  };

  const openLesson = (index) => {
    state.currentLesson = index;
    cardLessonIndex = index;
    quizLessonIndex = index;
    saveState();
    renderLesson(index);
    routeTo("learn");
  };

  const renderLesson = (index) => {
    const lesson = LESSONS[index];
    $("lessonPhase").textContent = lesson.phase;
    $("lessonDay").textContent = `DAY ${String(lesson.day).padStart(2, "0")}`;
    $("lessonTitle").textContent = lesson.title;
    $("lessonFocus").textContent = lesson.focus;
    $("lessonWords").innerHTML = lesson.words.map((word, wordIndex) => `
      <button class="word-tile" type="button" data-word-index="${wordIndex}">
        <span class="speaker">🔊</span><span class="word-emoji">${word.emoji}</span>
        <strong>${escapeHtml(word.word)}</strong><span class="meaning">${escapeHtml(word.meaning)}</span>
        <p class="tile-example">${escapeHtml(word.example)}<br>${escapeHtml(word.exampleZh)}</p>
      </button>`).join("");
    $("sentenceList").innerHTML = lesson.sentences.map((sentence) => `
      <div class="sentence-item"><strong>${escapeHtml(sentence.en)}</strong><span>${escapeHtml(sentence.zh)}</span></div>`
    ).join("");
    document.querySelectorAll(".word-tile").forEach((tile) => {
      tile.addEventListener("click", () => {
        tile.classList.toggle("revealed");
        speak(lesson.words[Number(tile.dataset.wordIndex)].word);
      });
    });
  };

  const renderFlashcard = () => {
    const lesson = LESSONS[cardLessonIndex];
    const word = lesson.words[cardIndex];
    $("flashcard").classList.remove("flipped");
    $("cardCounter").textContent = `${cardIndex + 1} / ${lesson.words.length}`;
    $("cardEmoji").textContent = word.emoji;
    $("cardWord").textContent = word.word;
    $("cardMeaning").textContent = word.meaning;
    $("cardExample").textContent = word.example;
    $("cardExampleZh").textContent = word.exampleZh;
  };

  const moveCard = (direction) => {
    const count = LESSONS[cardLessonIndex].words.length;
    cardIndex = (cardIndex + direction + count) % count;
    renderFlashcard();
  };

  const rememberCurrentWord = () => {
    const word = LESSONS[cardLessonIndex].words[cardIndex].word;
    if (!state.learnedWords.includes(word)) state.learnedWords.push(word);
    state.weakWords = state.weakWords.filter((item) => item !== word);
    const rewarded = claimReward(`word:${word.toLowerCase()}`, 1, `记住了 ${word}`);
    if (!rewarded) {
      saveState();
      showToast(`太棒了，${word} 已经记住`);
    }
    setTimeout(() => moveCard(1), 350);
  };

  const reviewCurrentWord = () => {
    const word = LESSONS[cardLessonIndex].words[cardIndex].word;
    if (!state.weakWords.includes(word)) state.weakWords.push(word);
    saveState();
    showToast(`${word} 已加入复习清单`);
    moveCard(1);
  };

  const resetQuizView = () => {
    $("quizStart").classList.remove("hidden");
    $("quizPlay").classList.add("hidden");
    $("quizResult").classList.add("hidden");
    $("quizDaySelect").value = String(quizLessonIndex);
  };

  const startQuiz = () => {
    quizLessonIndex = Number($("quizDaySelect").value);
    quizQuestions = shuffle(LESSONS[quizLessonIndex].words);
    quizPosition = 0;
    quizScore = 0;
    $("quizStart").classList.add("hidden");
    $("quizResult").classList.add("hidden");
    $("quizPlay").classList.remove("hidden");
    renderQuizQuestion();
  };

  const renderQuizQuestion = () => {
    const question = quizQuestions[quizPosition];
    $("quizCount").textContent = `第 ${quizPosition + 1} / ${quizQuestions.length} 题`;
    $("quizProgressBar").style.width = `${((quizPosition + 1) / quizQuestions.length) * 100}%`;
    $("quizMeaning").textContent = question.meaning;
    $("quizFeedback").textContent = "";
    const distractors = shuffle(
      ALL_WORDS.filter((item) => item.word !== question.word).map((item) => item.word)
    ).filter((word, index, array) => array.indexOf(word) === index).slice(0, 3);
    const options = shuffle([question.word, ...distractors]);
    $("quizOptions").innerHTML = options
      .map((word) => `<button class="quiz-option" type="button" data-answer="${escapeHtml(word)}">${escapeHtml(word)}</button>`)
      .join("");
    document.querySelectorAll(".quiz-option").forEach((button) => {
      button.addEventListener("click", () => answerQuiz(button, question));
    });
  };

  const answerQuiz = (button, question) => {
    const correct = button.dataset.answer === question.word;
    document.querySelectorAll(".quiz-option").forEach((option) => {
      option.disabled = true;
      if (option.dataset.answer === question.word) option.classList.add("correct");
    });
    if (correct) {
      quizScore += 1;
      button.classList.add("correct");
      $("quizFeedback").textContent = "答对了！继续保持 ☀️";
      if (!state.learnedWords.includes(question.word)) state.learnedWords.push(question.word);
    } else {
      button.classList.add("wrong");
      $("quizFeedback").textContent = `正确答案是 ${question.word}`;
      if (!state.weakWords.includes(question.word)) state.weakWords.push(question.word);
    }
    speak(question.word);
    setTimeout(() => {
      quizPosition += 1;
      if (quizPosition < quizQuestions.length) renderQuizQuestion();
      else finishQuiz();
    }, 950);
  };

  const finishQuiz = () => {
    $("quizPlay").classList.add("hidden");
    $("quizResult").classList.remove("hidden");
    const lesson = LESSONS[quizLessonIndex];
    const previousBest = Number(state.quizBest[lesson.day] || 0);
    if (quizScore > previousBest) {
      state.stars += quizScore - previousBest;
      state.quizBest[lesson.day] = quizScore;
    }
    $("resultEmoji").textContent = quizScore === 5 ? "🏆" : quizScore >= 3 ? "🌟" : "🌱";
    $("resultTitle").textContent = quizScore === 5 ? "全对，太棒了！" : "闯关完成！";
    $("resultScore").textContent = `你答对了 ${quizScore} / 5 题`;
    $("resultStars").textContent = `${"★".repeat(quizScore)}${"☆".repeat(5 - quizScore)}`;
    const rewarded = claimReward(`quiz:${lesson.day}`, 2, `完成第${lesson.day}天闯关`);
    if (!rewarded) saveState();
  };

  const finishCurrentDay = () => {
    const lesson = LESSONS[quizLessonIndex];
    if (!state.completedDays.includes(lesson.day)) state.completedDays.push(lesson.day);
    const rewarded = claimReward(`complete:${lesson.day}`, 3, `完成第${lesson.day}天学习`);
    if (!rewarded) {
      saveState();
      showToast(`第${lesson.day}天已经完成`);
    }
    routeTo("growth");
  };

  const plantStage = () => {
    if (state.plant.energy <= 0) return { name: "枯萎休眠", emoji: "🥀", level: 0, next: 15 };
    const stages = [
      { xp: 0, name: "勇气种子", emoji: "🌰", level: 1, next: 15 },
      { xp: 15, name: "英语小芽", emoji: "🌱", level: 2, next: 45 },
      { xp: 45, name: "活力幼苗", emoji: "🌿", level: 3, next: 90 },
      { xp: 90, name: "知识盆栽", emoji: "🪴", level: 4, next: 150 },
      { xp: 150, name: "阳光花朵", emoji: "🌻", level: 5, next: 240 },
      { xp: 240, name: "智慧大树", emoji: "🌳", level: 6, next: 300 }
    ];
    return [...stages].reverse().find((item) => state.plant.xp >= item.xp);
  };

  const plantMessage = () => {
    if (state.plant.energy <= 0) return "植物已经枯萎休眠，完成任务并喂养就能重新唤醒。";
    if (state.plant.energy < 30) return "叶子有些打蔫，它正在等待你回来学习和喂养。";
    if (state.plant.energy < 60) return "状态一般，再喂一个小太阳会更有精神。";
    if (state.plant.energy < 90) return "今天精神不错，学习会让它更有活力。";
    return "活力满满！它正在努力长成更强大的植物。";
  };

  const renderPlant = () => {
    const stage = plantStage();
    const emoji = state.plant.energy < 25 && state.plant.energy > 0 ? "🍂" : stage.emoji;
    $("homePlant").textContent = emoji;
    $("growthPlant").textContent = emoji;
    $("homePlantName").textContent = stage.name;
    $("plantStageName").textContent = `${stage.name} · 第${stage.level}阶段`;
    $("homePlantMessage").textContent = plantMessage();
    $("plantStatusText").textContent = plantMessage();
    $("homeEnergyBar").style.width = `${state.plant.energy}%`;
    $("homeEnergyText").textContent = `活力 ${state.plant.energy} / 100`;
    $("growthEnergyBar").style.width = `${state.plant.energy}%`;
    $("growthEnergyText").textContent = state.plant.energy;
    const previousThreshold = stage.level <= 1 ? 0 : [0, 0, 15, 45, 90, 150, 240][stage.level];
    const xpRange = Math.max(1, stage.next - previousThreshold);
    const xpProgress = Math.min(100, ((state.plant.xp - previousThreshold) / xpRange) * 100);
    $("growthXpBar").style.width = `${Math.max(0, xpProgress)}%`;
    $("growthXpText").textContent = state.plant.xp;
    $("sunBalanceTop").textContent = state.suns;
    $("sunBalanceGrowth").textContent = state.suns;
    $("feedCount").textContent = state.plant.feeds;
    const signedIn = state.signIns.includes(today());
    $("checkInButton").disabled = signedIn;
    $("checkInButton").textContent = signedIn ? "✓ 今日已签到" : "☀️ 今日签到 +2";
  };

  const feedPlant = () => {
    if (state.suns < 3) {
      showToast("小太阳不足，先签到或完成学习任务吧");
      return;
    }
    state.suns -= 3;
    state.plant.energy = Math.min(100, state.plant.energy + 25);
    state.plant.xp += 15;
    state.plant.feeds += 1;
    state.plant.lastDecayDate = today();
    markActivity();
    saveState();
    renderPlant();
    showToast("🌱 喂养成功，植物更有活力了");
  };

  const checkIn = () => {
    if (state.signIns.includes(today())) {
      showToast("今天已经签到，继续完成学习任务吧");
      return;
    }
    state.signIns.push(today());
    claimReward(`checkin:${today()}`, 2, "今日签到成功");
    renderPlant();
  };

  const renderAllStats = () => {
    const next = firstIncompleteLesson();
    const lesson = LESSONS[next];
    const completed = state.completedDays.length;
    $("heroDay").textContent = `DAY ${String(lesson.day).padStart(2, "0")}`;
    $("heroTitle").textContent = lesson.title;
    $("heroFocus").textContent = lesson.focus;
    $("heroProgressBar").style.width = `${(completed / 15) * 100}%`;
    $("heroProgressText").textContent = `${completed} / 15 天完成`;
    $("knownWordsStat").textContent = state.learnedWords.length;
    $("starsStat").textContent = state.stars;
    $("daysStat").textContent = completed;
    $("growthDays").innerHTML = `${completed}<small>/15</small>`;
    $("growthStars").innerHTML = `${state.stars}<small>★</small>`;
    $("growthWords").innerHTML = `${state.learnedWords.length}<small>个</small>`;
    $("growthDaysBar").style.width = `${(completed / 15) * 100}%`;
    $("weakCount").textContent = `${state.weakWords.length}个`;
    $("weakList").innerHTML = state.weakWords.length
      ? state.weakWords.map((word) => `<button class="weak-chip" type="button" data-weak-word="${escapeHtml(word)}">🔊 ${escapeHtml(word)}</button>`).join("")
      : '<div class="empty-state">这里暂时没有单词。答错或选择“再复习”的单词会出现在这里。</div>';
    document.querySelectorAll("[data-weak-word]").forEach((button) => {
      button.addEventListener("click", () => speak(button.dataset.weakWord));
    });
    $("sunBalanceTop").textContent = state.suns;
    renderPlant();
  };

  const resetProgress = () => {
    const confirmed = window.confirm("确定要清空所有学习记录、小太阳和植物成长吗？此操作不能撤销。");
    if (!confirmed) return;
    state = structuredClone(defaultState);
    state.plant.lastDecayDate = today();
    saveState();
    renderPlan();
    renderFlashcard();
    showToast("学习记录已经重置");
  };

  const bindEvents = () => {
    document.querySelectorAll("[data-route]").forEach((element) => {
      element.addEventListener("click", (event) => {
        event.preventDefault();
        routeTo(element.dataset.route);
      });
    });
    $("continueButton").addEventListener("click", () => openLesson(firstIncompleteLesson()));
    $("soundToggle").addEventListener("click", () => {
      state.sound = !state.sound;
      $("soundToggle").setAttribute("aria-pressed", String(state.sound));
      $("soundToggle").innerHTML = state.sound ? "<span>🔊</span><span>发音开启</span>" : "<span>🔇</span><span>发音关闭</span>";
      saveState();
    });
    $("speakSentences").addEventListener("click", () => {
      speak(LESSONS[state.currentLesson].sentences.map((sentence) => sentence.en).join(" "), 0.78);
    });
    $("lessonQuizButton").addEventListener("click", () => {
      quizLessonIndex = state.currentLesson;
      $("quizDaySelect").value = String(quizLessonIndex);
      routeTo("quiz");
      startQuiz();
    });
    $("cardDaySelect").addEventListener("change", (event) => {
      cardLessonIndex = Number(event.target.value);
      cardIndex = 0;
      renderFlashcard();
    });
    $("flashcard").addEventListener("click", () => $("flashcard").classList.toggle("flipped"));
    $("prevCard").addEventListener("click", () => moveCard(-1));
    $("nextCard").addEventListener("click", () => moveCard(1));
    $("cardSpeak").addEventListener("click", () => speak(LESSONS[cardLessonIndex].words[cardIndex].word));
    $("cardKnow").addEventListener("click", rememberCurrentWord);
    $("cardAgain").addEventListener("click", reviewCurrentWord);
    $("startQuizButton").addEventListener("click", startQuiz);
    $("retryQuiz").addEventListener("click", startQuiz);
    $("finishDay").addEventListener("click", finishCurrentDay);
    $("checkInButton").addEventListener("click", checkIn);
    $("homeFeedButton").addEventListener("click", feedPlant);
    $("growthFeedButton").addEventListener("click", feedPlant);
    $("resetProgress").addEventListener("click", resetProgress);
  };

  applyPlantDecay();
  populateSelectors();
  bindEvents();
  renderLesson(state.currentLesson);
  renderPlan();
  renderFlashcard();
  renderAllStats();
  routeTo("home");

  if ("serviceWorker" in navigator && location.protocol !== "file:") {
    navigator.serviceWorker.register("service-worker.js").catch(() => {});
  }
})();
