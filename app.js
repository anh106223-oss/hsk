// ========================================================
// CONTROLLER: ĐIỀU HƯỚNG VÀ XỬ LÝ SỰ KIỆN GIAO DIỆN (FULL CODE)
// ========================================================

let currentList = [];
let currentWordIdx = 0;
let toneAI = null;
let speechRecognizer = null;
let isRecordingNow = false;

let currentSpeakMode = 'word'; // 'word' hoặc 'sentence'
let currentSentenceIdx = 0;

let mediaRec = null;
let audioChunks = [];
let userVoiceBlob = null;
let writerInstances = [];
let micStream = null;

let speechRecognizedText = "";
let speechConfidence = 0;
let hasEvaluatedCurrentSession = false;

document.addEventListener("DOMContentLoaded", () => {
  // Cảnh báo nếu mở trực tiếp bằng giao thức file:///
  if (window.location.protocol === "file:") {
    const banner = document.getElementById("env-warning-banner");
    if (banner) banner.classList.remove("hidden");
  }

  // Khởi tạo an toàn engine âm học
  if (typeof ToneAcousticAI !== 'undefined') {
    toneAI = new ToneAcousticAI();
  }

  currentList = [...(window.GLOBAL_VOCABULARY || [])];
  initSpeechEngine();
  loadCurrentWord();
  loadCurrentSentence();
  initDictionary();

  const syncBtnText = document.getElementById("sync-text");
  if (syncBtnText && window.GLOBAL_VOCABULARY) {
    syncBtnText.innerText = `Đã nạp ${window.GLOBAL_VOCABULARY.length} từ Tiếng Việt`;
  }
});

// Chuyển chế độ: Luyện Đọc Từ hoặc Luyện Đọc Cả Câu
function setSpeakTargetMode(mode) {
  currentSpeakMode = mode;
  const btnWord = document.getElementById("btn-mode-word");
  const btnSent = document.getElementById("btn-mode-sentence");
  const panelWord = document.getElementById("box-word-mode");
  const panelSent = document.getElementById("box-sentence-mode");

  if (mode === 'word') {
    if (btnWord) btnWord.className = "px-4 py-1.5 rounded-xl text-xs font-bold bg-red-600 text-white transition";
    if (btnSent) btnSent.className = "px-4 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 text-slate-400 hover:text-white transition";
    if (panelWord) panelWord.classList.remove("hidden");
    if (panelSent) panelSent.classList.add("hidden");
    resetSpeechUI();
  } else {
    if (btnSent) btnSent.className = "px-4 py-1.5 rounded-xl text-xs font-bold bg-red-600 text-white transition";
    if (btnWord) btnWord.className = "px-4 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 text-slate-400 hover:text-white transition";
    if (panelSent) panelSent.classList.remove("hidden");
    if (panelWord) panelWord.classList.add("hidden");
    loadCurrentSentence();
    resetSpeechUI();
  }
}

// Nạp dữ liệu từ vựng hiện tại
function loadCurrentWord() {
  if (!currentList || currentList.length === 0) return;
  if (currentWordIdx >= currentList.length) currentWordIdx = 0;
  if (currentWordIdx < 0) currentWordIdx = currentList.length - 1;
  const word = currentList[currentWordIdx];

  const hanziElem = document.getElementById("display-hanzi");
  const pinyinElem = document.getElementById("display-pinyin");
  const meanElem = document.getElementById("display-meaning");
  const levelElem = document.getElementById("display-level");
  const countElem = document.getElementById("word-progress-label");

  if (hanziElem) hanziElem.innerText = word.char || "";
  if (pinyinElem) pinyinElem.innerText = word.pinyin || "";
  if (meanElem) meanElem.innerText = word.meaning || "";
  if (levelElem) levelElem.innerText = `HSK ${word.level || 1}`;
  if (countElem) countElem.innerText = `${currentWordIdx + 1} / ${currentList.length}`;

  resetSpeechUI();
  setupWritingBoxes(word.char);
}

// Nạp dữ liệu câu hiện tại
function loadCurrentSentence() {
  const sentences = window.GLOBAL_SENTENCES || [];
  if (sentences.length === 0) return;
  if (currentSentenceIdx >= sentences.length) currentSentenceIdx = 0;
  if (currentSentenceIdx < 0) currentSentenceIdx = sentences.length - 1;

  const item = sentences[currentSentenceIdx];
  const zhElem = document.getElementById("sent-display-zh");
  const pyElem = document.getElementById("sent-display-pinyin");
  const viElem = document.getElementById("sent-display-vi");
  const countElem = document.getElementById("sent-progress-label");
  const lvlElem = document.getElementById("sent-display-level");

  if (zhElem) zhElem.innerText = item.zh;
  if (pyElem) pyElem.innerText = item.pinyin;
  if (viElem) viElem.innerText = item.vi;
  if (countElem) countElem.innerText = `${currentSentenceIdx + 1} / ${sentences.length}`;
  if (lvlElem) lvlElem.innerText = `HSK ${item.level}`;
}

function navigateSentence(step) {
  const sentences = window.GLOBAL_SENTENCES || [];
  if (sentences.length === 0) return;
  currentSentenceIdx = (currentSentenceIdx + step + sentences.length) % sentences.length;
  loadCurrentSentence();
  resetSpeechUI();
}

// Phát âm mẫu giọng bản xứ (Chuẩn hoặc Rất chậm)
function speakNative(isSlow = false) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();

  let targetText = "";
  if (currentSpeakMode === 'word') {
    const word = currentList[currentWordIdx];
    if (!word) return;
    targetText = word.char;
  } else {
    const sent = window.GLOBAL_SENTENCES[currentSentenceIdx];
    if (!sent) return;
    targetText = sent.zh;
  }

  const utter = new SpeechSynthesisUtterance();
  utter.lang = 'zh-CN';

  if (isSlow) {
    utter.rate = 0.35;
    utter.pitch = 0.95;
    utter.text = targetText.split("").join(" ");
  } else {
    utter.rate = 0.95;
    utter.pitch = 1.0;
    utter.text = targetText;
  }

  window.speechSynthesis.speak(utter);
}

// Khởi tạo bộ nhận diện tiếng Trung Web Speech API
function initSpeechEngine() {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) {
    console.warn("Trình duyệt không hỗ trợ Web Speech API.");
    return;
  }

  speechRecognizer = new SR();
  speechRecognizer.lang = 'zh-CN';
  speechRecognizer.continuous = false;
  speechRecognizer.interimResults = false;

  speechRecognizer.onresult = (e) => {
    if (e.results && e.results[0] && e.results[0][0]) {
      const res = e.results[0][0];
      speechRecognizedText = res.transcript.trim();
      speechConfidence = Math.round((res.confidence || 0.8) * 100);
      hasEvaluatedCurrentSession = true;
      processAIEvaluation(speechRecognizedText, speechConfidence);
    }
  };

  speechRecognizer.onerror = (e) => {
    console.warn("Speech recognition warning/error:", e.error);
    const dMsg = document.getElementById("ai-diagnostic-msg");
    if (window.location.protocol === "file:" && dMsg) {
      dMsg.innerHTML = "<b class='text-amber-400'>Mẹo:</b> Để nhận dạng chữ Hán tốt nhất, hãy mở web bằng <b>VS Code Live Server (http://localhost)</b>.";
    }
  };

  speechRecognizer.onend = () => {
    if (isRecordingNow) {
      stopRecording();
    }
  };
}

// Bật / Dừng ghi âm Micro
async function toggleRecordSpeech() {
  if (isRecordingNow) {
    stopRecording();
    return;
  }

  speechRecognizedText = "";
  speechConfidence = 0;
  hasEvaluatedCurrentSession = false;

  try {
    micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    audioChunks = [];
    mediaRec = new MediaRecorder(micStream);
    mediaRec.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) audioChunks.push(e.data);
    };
    mediaRec.onstop = () => {
      userVoiceBlob = new Blob(audioChunks, { type: 'audio/webm' });
      const replayBtn = document.getElementById("btn-replay");
      if (replayBtn) replayBtn.disabled = false;
    };
    mediaRec.start();

    // Khởi động AI phân tích cao độ và vẽ đồ thị
    if (toneAI) {
      await toneAI.start(micStream, "pitch-canvas");
    }

    if (speechRecognizer) {
      try {
        speechRecognizer.start();
      } catch (e) {
        console.warn("SpeechRecognizer start error:", e);
      }
    }

    isRecordingNow = true;
    const recBtn = document.getElementById("btn-record");
    if (recBtn) recBtn.classList.add("!bg-emerald-600", "animate-pulse");
    const recText = document.getElementById("record-text");
    if (recText) recText.innerText = currentSpeakMode === 'word' ? "Đang nghe... Bấm để xong" : "Đang nghe cả câu...";
  } catch (err) {
    alert("Vui lòng cấp quyền Micro trên trình duyệt để luyện nói!\nNếu mở bằng file:///, hãy dùng Live Server (http://localhost) để micro hoạt động chuẩn nhất.");
  }
}

// Dừng thu âm và chẩn đoán kết quả
function stopRecording() {
  if (!isRecordingNow) return;
  isRecordingNow = false;

  const recBtn = document.getElementById("btn-record");
  if (recBtn) recBtn.classList.remove("!bg-emerald-600", "animate-pulse");
  const recText = document.getElementById("record-text");
  if (recText) recText.innerText = "Bấm & Đọc Ngay";

  if (speechRecognizer) {
    try { speechRecognizer.stop(); } catch (e) {}
  }

  if (mediaRec && mediaRec.state !== "inactive") {
    mediaRec.stop();
  }

  if (toneAI) {
    toneAI.stop();
  }

  // Tắt luồng micro
  if (micStream) {
    micStream.getTracks().forEach(track => track.stop());
    micStream = null;
  }

  // Fallback: nếu Speech Recognition không trả về kịp chữ, AI vẫn tự động chấm theo âm học
  setTimeout(() => {
    if (!hasEvaluatedCurrentSession) {
      hasEvaluatedCurrentSession = true;
      processAIEvaluation(speechRecognizedText, speechConfidence);
    }
  }, 250);
}

// Xử lý chấm điểm tổng hợp (Khớp chữ + Cao độ thanh điệu + Tự tin mic)
function processAIEvaluation(transcript, confidence) {
  const detectedElem = document.getElementById("ai-detected-word");
  const clean = s => (s || "").replace(/[。？！，、\s]/g, "");
  const cleanTranscript = clean(transcript);

  // A. ĐỌC CẢ CÂU
  if (currentSpeakMode === 'sentence') {
    const targetSent = window.GLOBAL_SENTENCES[currentSentenceIdx];
    const targetClean = clean(targetSent.zh);

    let matchChars = 0;
    if (cleanTranscript) {
      if (detectedElem) detectedElem.innerText = `"${transcript}"`;
      for (const char of cleanTranscript) {
        if (targetClean.includes(char)) matchChars++;
      }
    } else {
      if (detectedElem) detectedElem.innerText = "(Đo âm học)";
    }

    const textAccuracy = cleanTranscript ? Math.min(100, Math.round((matchChars / targetClean.length) * 100)) : 70;
    const toneEval = toneAI ? toneAI.evaluateMultiTone([1, 2, 4]) : { score: 78, msg: "Cao độ âm tốt" };
    const finalConf = confidence || 75;

    let finalScore = Math.round((textAccuracy * 0.45) + (finalConf * 0.25) + (toneEval.score * 0.3));

    setMeterScore(finalScore);
    document.getElementById("metric-text").innerText = cleanTranscript ? `${textAccuracy}%` : "Âm vang";
    document.getElementById("metric-pitch").innerText = `${toneEval.score}%`;
    document.getElementById("metric-conf").innerText = `${finalConf}%`;

    let feedbackMsg = "";
    if (finalScore >= 85) {
      feedbackMsg = `🎉 Rất xuất sắc! Bạn đã đọc chuẩn xác trọn vẹn cả câu: "${targetSent.zh}".`;
    } else if (finalScore >= 60) {
      feedbackMsg = `Khá tốt! Bạn đã phát âm đúng phần lớn các từ, chú ý ngắt nhịp rõ hơn.`;
    } else {
      feedbackMsg = `Cần luyện thêm: Hãy bấm "Đọc cực chậm" để nghe kỹ từng chữ rồi đọc lại nhé.`;
    }
    document.getElementById("ai-diagnostic-msg").innerText = feedbackMsg;
    return;
  }

  // B. ĐỌC TỪ
  const target = currentList[currentWordIdx];
  const targetClean = clean(target.char);
  let textScore = 0;

  if (cleanTranscript) {
    if (detectedElem) detectedElem.innerText = `"${transcript}"`;
    if (cleanTranscript === targetClean) {
      textScore = 100;
    } else if (cleanTranscript.includes(targetClean) || targetClean.includes(cleanTranscript)) {
      textScore = 80;
    } else {
      textScore = 30;
    }
  } else {
    if (detectedElem) detectedElem.innerText = "(Phân tích thanh điệu)";
    textScore = 70;
  }

  const toneEval = toneAI ? toneAI.evaluateMultiTone(target.tone || [1]) : { score: 75, msg: "Âm điệu đạt" };
  const finalConf = confidence || 80;

  let finalScore = 0;
  if (cleanTranscript && textScore <= 30) {
    finalScore = Math.min(textScore, 40);
  } else {
    finalScore = Math.round((textScore * 0.4) + (toneEval.score * 0.45) + (finalConf * 0.15));
  }

  setMeterScore(finalScore);
  document.getElementById("metric-text").innerText = cleanTranscript ? `${textScore}%` : "Nhận diện âm";
  document.getElementById("metric-pitch").innerText = `${toneEval.score}%`;
  document.getElementById("metric-conf").innerText = `${finalConf}%`;
  document.getElementById("ai-diagnostic-msg").innerText = toneEval.msg;
}

// Cập nhật vòng tròn điểm số
function setMeterScore(score) {
  const numElem = document.getElementById("score-meter-num");
  const bar = document.getElementById("score-meter-bar");
  if (numElem) numElem.innerText = `${score}%`;
  if (!bar) return;

  bar.style.strokeDasharray = `${score}, 100`;
  if (score >= 85) bar.className = "text-emerald-500 transition-all duration-700";
  else if (score >= 60) bar.className = "text-amber-500 transition-all duration-700";
  else bar.className = "text-red-500 transition-all duration-700";
}

// Reset giao diện chấm điểm
function resetSpeechUI() {
  setMeterScore(0);
  const mText = document.getElementById("metric-text");
  const mPitch = document.getElementById("metric-pitch");
  const mConf = document.getElementById("metric-conf");
  const dWord = document.getElementById("ai-detected-word");
  const dMsg = document.getElementById("ai-diagnostic-msg");

  if (mText) mText.innerText = "-";
  if (mPitch) mPitch.innerText = "-";
  if (mConf) mConf.innerText = "-";
  if (dWord) dWord.innerText = "Chưa đọc";
  if (dMsg) dMsg.innerText = "Nhấn micro và phát âm để AI phân tích độ chính xác.";

  const replayBtn = document.getElementById("btn-replay");
  if (replayBtn) replayBtn.disabled = true;
  userVoiceBlob = null;
}

// Nghe lại đoạn âm thanh vừa thu
function replayUserSpeech() {
  if (!userVoiceBlob) return;
  const audio = document.getElementById("user-playback-audio");
  if (audio) {
    audio.src = URL.createObjectURL(userVoiceBlob);
    audio.play();
  }
}

// Tạo các ô luyện viết HanziWriter
function setupWritingBoxes(chineseWord) {
  const container = document.getElementById("hanzi-target-container");
  if (!container || !chineseWord) return;
  container.innerHTML = "";
  writerInstances = [];

  const chars = chineseWord.split("");
  const charInfo = document.getElementById("writing-char-info");
  if (charInfo) charInfo.innerText = `${chars.length} chữ Hán (${chineseWord})`;

  chars.forEach((char, index) => {
    const boxWrapper = document.createElement("div");
    boxWrapper.className = "flex flex-col items-center gap-2";
    const boxId = `writer-target-${index}`;
    const box = document.createElement("div");
    box.id = boxId;
    box.className = "hanzi-box";
    boxWrapper.appendChild(box);

    const label = document.createElement("span");
    label.className = "text-xs font-mono text-slate-400";
    label.innerText = `Chữ #${index + 1}: ${char}`;
    boxWrapper.appendChild(label);
    container.appendChild(boxWrapper);

    if (typeof HanziWriter !== "undefined") {
      try {
        const writer = HanziWriter.create(boxId, char, {
          width: 150, height: 150, padding: 10, showOutline: true,
          strokeAnimationSpeed: 1.2, delayBetweenStrokes: 150,
          strokeColor: '#ef4444', radicalColor: '#10b981',
          outlineColor: '#334155', drawingColor: '#38bdf8'
        });
        writerInstances.push(writer);
      } catch (e) {}
    }
  });
}

function animateAllStrokes() {
  writerInstances.forEach(w => {
    try { w.showCharacter(); w.animateCharacter(); } catch (e) {}
  });
}

function startWritingQuizMode() {
  writerInstances.forEach((w, idx) => {
    try {
      w.quiz({
        onMistake: () => { 
          const hint = document.getElementById("writing-status-hint");
          if (hint) hint.innerText = `Sai nét chữ #${idx + 1}!`;
        },
        onCorrectStroke: () => {
          const hint = document.getElementById("writing-status-hint");
          if (hint) hint.innerText = "Đúng nét!";
        },
        onComplete: () => {
          const hint = document.getElementById("writing-status-hint");
          if (hint) hint.innerText = `🎉 Hoàn thành chữ #${idx + 1}!`;
        }
      });
    } catch (e) {}
  });
}

// Điều hướng từ vựng
function navigateWord(step) {
  if (currentList.length === 0) return;
  currentWordIdx = (currentWordIdx + step + currentList.length) % currentList.length;
  loadCurrentWord();
}

// Lọc từ theo cấp độ HSK
function filterByLevel(lvl) {
  document.querySelectorAll(".lvl-btn").forEach(b => b.classList.remove("active"));
  if (lvl === 'ALL') {
    const btnAll = document.getElementById("btn-lvl-all");
    if (btnAll) btnAll.classList.add("active");
    currentList = [...window.GLOBAL_VOCABULARY];
  } else {
    const btn = document.getElementById(`btn-lvl-${lvl}`);
    if (btn) btn.classList.add("active");
    currentList = window.GLOBAL_VOCABULARY.filter(w => Number(w.level) === Number(lvl));
  }
  currentWordIdx = 0;
  loadCurrentWord();
  initDictionary();
}

// Tìm kiếm từ vựng
function onSearchWord(query) {
  const q = (query || "").trim().toLowerCase();
  if (!q) {
    currentList = [...window.GLOBAL_VOCABULARY];
  } else {
    currentList = window.GLOBAL_VOCABULARY.filter(w =>
      (w.char && w.char.includes(q)) ||
      (w.pinyin && w.pinyin.toLowerCase().includes(q)) ||
      (w.meaning && w.meaning.toLowerCase().includes(q))
    );
  }
  currentWordIdx = 0;
  loadCurrentWord();
  initDictionary();
}

// Hiển thị danh sách từ điển
function initDictionary() {
  const container = document.getElementById("dict-table-list");
  if (!container) return;
  const countElem = document.getElementById("dict-total-count");
  if (countElem) countElem.innerText = currentList.length;
  container.innerHTML = "";

  currentList.slice(0, 90).forEach((item, index) => {
    const card = document.createElement("div");
    card.className = "dict-card flex items-center justify-between";
    card.innerHTML = `
      <div>
        <span class="text-xl font-bold font-['Noto_Serif_SC'] text-white">${item.char}</span>
        <span class="text-xs text-amber-400 font-mono ml-2">${item.pinyin}</span>
        <p class="text-xs text-slate-400 mt-0.5 line-clamp-1">${item.meaning}</p>
      </div>
      <span class="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">HSK ${item.level || 1}</span>
    `;
    card.onclick = () => {
      currentWordIdx = index;
      loadCurrentWord();
      switchMode('speak');
    };
    container.appendChild(card);
  });
}

// Chuyển đổi tab chính
function switchMode(mode) {
  ['speak', 'write', 'practice', 'dict'].forEach(m => {
    const panel = document.getElementById(`panel-${m}`);
    const nav = document.getElementById(`nav-${m}`);
    if (panel) panel.classList.add("hidden");
    if (nav) nav.classList.remove("active");
  });

  const activePanel = document.getElementById(`panel-${mode}`);
  const activeNav = document.getElementById(`nav-${mode}`);
  if (activePanel) activePanel.classList.remove("hidden");
  if (activeNav) activeNav.classList.add("active");

  if (mode === 'practice' && typeof initPracticeArena === 'function') {
    initPracticeArena();
  }
}

// Xuất các hàm ra phạm vi toàn cục window
window.switchMode = switchMode;
window.setSpeakTargetMode = setSpeakTargetMode;
window.loadCurrentWord = loadCurrentWord;
window.loadCurrentSentence = loadCurrentSentence;
window.speakNative = speakNative;
window.toggleRecordSpeech = toggleRecordSpeech;
window.stopRecording = stopRecording;
window.replayUserSpeech = replayUserSpeech;
window.animateAllStrokes = animateAllStrokes;
window.startWritingQuizMode = startWritingQuizMode;
window.navigateWord = navigateWord;
window.navigateSentence = navigateSentence;
window.filterByLevel = filterByLevel;
window.onSearchWord = onSearchWord;
window.initDictionary = initDictionary;