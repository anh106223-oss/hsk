// ========================================================
// PRACTICE ENGINE - 4 BÀI TẬP THÔNG MINH 100% TIẾNG VIỆT
// ========================================================

let currentPracticeLevel = 'ALL';
let currentPracticeMode = 'listen_word';
let practiceScore = 0;
let practiceStreak = 0;
let currentQuestion = null;
let selectedSentenceTokens = [];

function initPracticeArena() {
  if (!currentQuestion) {
    generateNewQuestion();
  }
}

function setPracticeLevel(lvl) {
  currentPracticeLevel = lvl;
  document.querySelectorAll(".sub-lvl-btn").forEach(b => b.classList.remove("active"));
  const btn = document.getElementById(lvl === 'ALL' ? "plvl-all" : `plvl-${lvl}`);
  if (btn) btn.classList.add("active");
  generateNewQuestion();
}

function setPracticeMode(mode) {
  currentPracticeMode = mode;
  document.querySelectorAll(".sub-tab-btn").forEach(b => b.classList.remove("active-sub"));
  const btn = document.getElementById(`sub-${mode}`);
  if (btn) btn.classList.add("active-sub");
  generateNewQuestion();
}

function getPracticeVocabPool() {
  const all = (window.GLOBAL_VOCABULARY || []).filter(w => 
    w.meaning && !w.meaning.includes("Từ HSK")
  );

  if (all.length === 0) return window.GLOBAL_VOCABULARY || [];
  if (currentPracticeLevel === 'ALL') return all;

  const filtered = all.filter(w => Number(w.level) === Number(currentPracticeLevel));
  return filtered.length >= 4 ? filtered : all;
}

function playPracticeAudio(text, isSlow = false) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance();
  utter.lang = 'zh-CN';
  if (isSlow) {
    utter.rate = 0.35;
    utter.text = text.split("").join(" ");
  } else {
    utter.rate = 0.9;
    utter.text = text;
  }
  window.speechSynthesis.speak(utter);
}

// Phân cụm câu tự nhiên
function segmentSentence(sentence) {
  const clean = sentence.replace(/[。？！，、\s]/g, "");
  if (typeof Intl !== "undefined" && Intl.Segmenter) {
    try {
      const segmenter = new Intl.Segmenter('zh', { granularity: 'word' });
      const segments = Array.from(segmenter.segment(clean)).map(s => s.segment);
      if (segments.length >= 3) return segments;
    } catch (e) {}
  }
  const chunks = [];
  for (let i = 0; i < clean.length; i += 2) {
    chunks.push(clean.slice(i, i + 2));
  }
  return chunks;
}

function generateNewQuestion() {
  const pool = getPracticeVocabPool();
  const feedback = document.getElementById("practice-feedback");
  const nextBtn = document.getElementById("btn-next-question");
  if (feedback) feedback.className = "hidden";
  if (nextBtn) nextBtn.classList.add("hidden");
  selectedSentenceTokens = [];

  // 1. GHÉP THÀNH CÂU
  if (currentPracticeMode === 'build_sentence') {
    let list = window.GLOBAL_SENTENCES || [];
    if (currentPracticeLevel !== 'ALL') {
      const match = list.filter(s => Number(s.level) === Number(currentPracticeLevel));
      if (match.length > 0) list = match;
    }
    const target = list[Math.floor(Math.random() * list.length)];
    const tokenList = segmentSentence(target.zh);
    const shuffled = [...tokenList].sort(() => Math.random() - 0.5);

    currentQuestion = {
      type: 'sentence',
      targetSentence: target.zh,
      meaningVi: target.vi,
      tokens: shuffled
    };
    renderExerciseUI();
    return;
  }

  // 2, 3, 4. CÁC BÀI TẬP VỀ TỪ VỰNG
  if (pool.length === 0) return;
  const correct = pool[Math.floor(Math.random() * pool.length)];

  const others = pool
    .filter(w => w.char !== correct.char && w.meaning !== correct.meaning)
    .sort(() => Math.random() - 0.5);

  const distractors = others.slice(0, 3);
  const options = [...distractors, correct].sort(() => Math.random() - 0.5);

  const matchedSentence = (window.GLOBAL_SENTENCES || []).find(s => s.zh.includes(correct.char));
  const sentenceZh = matchedSentence ? matchedSentence.zh : `请问这个“${correct.char}”是什么意思？`;
  const sentenceVi = matchedSentence ? matchedSentence.vi : `Xin hỏi từ "${correct.char}" này có nghĩa là gì?`;

  currentQuestion = {
    type: 'word',
    target: correct,
    options: options,
    sentenceZh: sentenceZh,
    sentenceVi: sentenceVi
  };

  renderExerciseUI();
}

function renderExerciseUI() {
  const arena = document.getElementById("practice-arena");
  if (!arena || !currentQuestion) return;
  arena.innerHTML = "";

  // 1. GHÉP CÂU
  if (currentPracticeMode === 'build_sentence') {
    arena.innerHTML = `
      <div class="w-full max-w-xl flex flex-col items-center space-y-5">
        <div class="text-center">
          <span class="text-xs uppercase font-mono tracking-wider text-red-400 font-bold">Sắp xếp các cụm từ theo đúng ngữ pháp:</span>
          <p class="text-base text-slate-200 font-semibold mt-1.5 px-4 py-2 bg-slate-900/90 rounded-xl border border-slate-800">
            "${currentQuestion.meaningVi}"
          </p>
        </div>

        <div id="sentence-drop-zone" class="w-full min-h-[70px] p-3 rounded-2xl bg-slate-950/90 border-2 border-dashed border-slate-700 flex flex-wrap gap-2 items-center justify-center">
          <span id="drop-placeholder" class="text-xs text-slate-500">Nhấp chọn các từ bên dưới để xếp vào đây</span>
        </div>

        <div id="sentence-token-pool" class="flex flex-wrap gap-2.5 justify-center mt-2"></div>

        <button onclick="submitSentenceAnswer()" class="px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-red-600/30">
          <i class="fa-solid fa-check mr-1.5"></i>Kiểm Tra Đáp Án
        </button>
      </div>
    `;

    const poolElem = document.getElementById("sentence-token-pool");
    currentQuestion.tokens.forEach((tk, idx) => {
      const btn = document.createElement("button");
      btn.id = `token-btn-${idx}`;
      btn.className = "px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white font-['Noto_Serif_SC'] text-base rounded-xl transition shadow active:scale-95";
      btn.innerText = tk;
      btn.onclick = () => selectToken(tk, idx);
      poolElem.appendChild(btn);
    });
    return;
  }

  // 2. NGHE CHỌN TỪ
  if (currentPracticeMode === 'listen_word') {
    arena.innerHTML = `
      <div class="flex flex-col items-center space-y-6 w-full max-w-lg">
        <div class="flex items-center gap-3">
          <button onclick="playPracticeAudio('${currentQuestion.target.char}', false)" class="w-16 h-16 rounded-2xl bg-red-600/20 border-2 border-red-500 text-red-400 hover:scale-105 flex items-center justify-center text-2xl shadow-lg transition">
            <i class="fa-solid fa-volume-high"></i>
          </button>
          <button onclick="playPracticeAudio('${currentQuestion.target.char}', true)" class="w-12 h-12 rounded-2xl bg-blue-600/20 border-2 border-blue-500 text-blue-400 hover:scale-105 flex items-center justify-center text-lg shadow-lg transition">
            <i class="fa-solid fa-gauge"></i>
          </button>
        </div>
        <p class="text-xs text-slate-400">Nghe phát âm và chọn chữ Hán chính xác:</p>

        <div class="grid grid-cols-2 gap-3 w-full">
          ${currentQuestion.options.map(opt => `
            <button onclick="checkWordAnswer('${opt.char}', this)" class="p-4 rounded-2xl bg-slate-800/80 hover:bg-slate-750 border border-slate-700 text-center transition group">
              <span class="block text-2xl font-bold font-['Noto_Serif_SC'] text-white group-hover:text-amber-400">${opt.char}</span>
              <span class="text-xs text-slate-400 font-mono mt-1 block">${opt.pinyin}</span>
            </button>
          `).join('')}
        </div>
      </div>
    `;
    setTimeout(() => playPracticeAudio(currentQuestion.target.char), 250);
    return;
  }

  // 3. TRẮC NGHIỆM NGHĨA
  if (currentPracticeMode === 'read_meaning') {
    arena.innerHTML = `
      <div class="flex flex-col items-center space-y-5 w-full max-w-lg">
        <div class="text-center">
          <h2 class="text-5xl font-extrabold font-['Noto_Serif_SC'] text-white mb-1 tracking-wider">${currentQuestion.target.char}</h2>
          <span class="text-lg font-mono text-amber-400 font-bold">${currentQuestion.target.pinyin}</span>
        </div>
        <p class="text-xs text-slate-400">Chọn nghĩa tiếng Việt chính xác nhất:</p>

        <div class="grid grid-cols-1 gap-2.5 w-full">
          ${currentQuestion.options.map(opt => `
            <button onclick="checkWordAnswer('${opt.char}', this)" class="p-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-left text-sm font-medium text-slate-200 transition hover:border-red-500">
              ${opt.meaning}
            </button>
          `).join('')}
        </div>
      </div>
    `;
    return;
  }

  // 4. NGHE ĐIỀN TỪ
  if (currentPracticeMode === 'listen_fill') {
    const maskedSentence = currentQuestion.sentenceZh.replace(currentQuestion.target.char, "【 ______ 】");
    arena.innerHTML = `
      <div class="flex flex-col items-center space-y-5 w-full max-w-lg text-center">
        <div class="flex items-center gap-2">
          <button onclick="playPracticeAudio('${currentQuestion.sentenceZh}', false)" class="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-red-400 rounded-xl text-xs font-bold flex items-center gap-2 transition">
            <i class="fa-solid fa-volume-high"></i> Nghe câu
          </button>
          <button onclick="playPracticeAudio('${currentQuestion.sentenceZh}', true)" class="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-blue-400 rounded-xl text-xs font-bold flex items-center gap-2 transition">
            <i class="fa-solid fa-gauge"></i> Đọc chậm
          </button>
        </div>
        <p class="text-xl font-['Noto_Serif_SC'] text-white font-semibold leading-relaxed tracking-wide">${maskedSentence}</p>
        <p class="text-xs text-slate-400 italic font-sans">${currentQuestion.sentenceVi}</p>

        <div class="grid grid-cols-2 gap-3 w-full pt-2">
          ${currentQuestion.options.map(opt => `
            <button onclick="checkWordAnswer('${opt.char}', this)" class="p-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-center transition">
              <span class="text-xl font-bold font-['Noto_Serif_SC'] text-white">${opt.char}</span>
              <span class="text-xs text-amber-400 font-mono block mt-0.5">${opt.pinyin}</span>
            </button>
          `).join('')}
        </div>
      </div>
    `;
    setTimeout(() => playPracticeAudio(currentQuestion.sentenceZh), 250);
  }
}

function checkWordAnswer(selectedChar, btnElem) {
  const isCorrect = selectedChar === currentQuestion.target.char;
  const feedback = document.getElementById("practice-feedback");
  const nextBtn = document.getElementById("btn-next-question");

  if (isCorrect) {
    practiceScore += 10;
    practiceStreak += 1;
    btnElem.classList.add("!bg-emerald-600", "!border-emerald-500", "!text-white");
    feedback.className = "p-3 rounded-xl bg-emerald-950/90 border border-emerald-600 text-emerald-300 text-xs font-semibold text-center";
    feedback.innerHTML = `🎉 Chính xác! <strong>${currentQuestion.target.char}</strong> [${currentQuestion.target.pinyin}]: ${currentQuestion.target.meaning}`;
    playPracticeAudio(currentQuestion.target.char);
  } else {
    practiceStreak = 0;
    btnElem.classList.add("!bg-red-600", "!border-red-500", "!text-white");
    feedback.className = "p-3 rounded-xl bg-red-950/90 border border-red-600 text-red-300 text-xs font-semibold text-center";
    feedback.innerHTML = `❌ Chưa đúng! Đáp án đúng: <strong>${currentQuestion.target.char}</strong> [${currentQuestion.target.pinyin}] – ${currentQuestion.target.meaning}`;
  }

  updateScoreUI();
  feedback.classList.remove("hidden");
  nextBtn.classList.remove("hidden");
  btnElem.parentElement.querySelectorAll("button").forEach(b => b.disabled = true);
}

function selectToken(token, index) {
  selectedSentenceTokens.push({ token, index });
  const srcBtn = document.getElementById(`token-btn-${index}`);
  if (srcBtn) srcBtn.classList.add("opacity-20", "pointer-events-none");
  renderDropZone();
}

function removeSelectedToken(idxInSelected) {
  const removed = selectedSentenceTokens.splice(idxInSelected, 1)[0];
  const srcBtn = document.getElementById(`token-btn-${removed.index}`);
  if (srcBtn) srcBtn.classList.remove("opacity-20", "pointer-events-none");
  renderDropZone();
}

function renderDropZone() {
  const zone = document.getElementById("sentence-drop-zone");
  if (!zone) return;
  zone.innerHTML = "";

  if (selectedSentenceTokens.length === 0) {
    zone.innerHTML = `<span id="drop-placeholder" class="text-xs text-slate-500">Nhấp chọn các từ bên dưới để xếp vào đây</span>`;
    return;
  }

  selectedSentenceTokens.forEach((item, idx) => {
    const chip = document.createElement("span");
    chip.className = "px-3 py-1.5 rounded-lg bg-red-600/30 border border-red-500/60 text-white font-['Noto_Serif_SC'] text-base cursor-pointer hover:bg-red-600/50 transition";
    chip.innerText = item.token;
    chip.onclick = () => removeSelectedToken(idx);
    zone.appendChild(chip);
  });
}

function submitSentenceAnswer() {
  const clean = str => str.replace(/[。？！，、\s]/g, "");
  const userStr = clean(selectedSentenceTokens.map(t => t.token).join(""));
  const targetStr = clean(currentQuestion.targetSentence);

  const feedback = document.getElementById("practice-feedback");
  const nextBtn = document.getElementById("btn-next-question");

  if (userStr === targetStr) {
    practiceScore += 15;
    practiceStreak += 1;
    feedback.className = "p-3 rounded-xl bg-emerald-950/90 border border-emerald-600 text-emerald-300 text-xs font-semibold text-center";
    feedback.innerHTML = `🎉 Rất xuất sắc! Câu đúng: <strong>${currentQuestion.targetSentence}</strong>`;
    playPracticeAudio(currentQuestion.targetSentence);
  } else {
    practiceStreak = 0;
    feedback.className = "p-3 rounded-xl bg-red-950/90 border border-red-600 text-red-300 text-xs font-semibold text-center";
    feedback.innerHTML = `❌ Chưa đúng. Thứ tự chuẩn là: <strong>${currentQuestion.targetSentence}</strong>`;
  }

  updateScoreUI();
  feedback.classList.remove("hidden");
  nextBtn.classList.remove("hidden");
}

function updateScoreUI() {
  const streakElem = document.getElementById("practice-streak");
  const scoreElem = document.getElementById("practice-score");
  if (streakElem) streakElem.innerText = practiceStreak;
  if (scoreElem) scoreElem.innerText = practiceScore;
}

// Gán toàn bộ hàm ra window để HTML luôn gọi được
window.initPracticeArena = initPracticeArena;
window.setPracticeLevel = setPracticeLevel;
window.setPracticeMode = setPracticeMode;
window.generateNewQuestion = generateNewQuestion;
window.checkWordAnswer = checkWordAnswer;
window.selectToken = selectToken;
window.removeSelectedToken = removeSelectedToken;
window.submitSentenceAnswer = submitSentenceAnswer;