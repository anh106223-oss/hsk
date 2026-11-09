// =========================================================================
// ULTRA AI ACOUSTIC ENGINE - CAO ĐỘ THỜI GIAN THỰC & CHẤM THANH ĐIỆU
// =========================================================================

class ToneAcousticAI {
  constructor() {
    this.audioCtx = null;
    this.analyser = null;
    this.micStream = null;
    this.pitchBuffer = [];
    this.isTracking = false;
    this.canvasCtx = null;
    this.lastProcessTime = 0;
  }

  async start(stream, canvasId = "pitch-canvas") {
    try {
      this.micStream = stream;
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioContextClass();

      if (this.audioCtx.state === 'suspended') {
        await this.audioCtx.resume();
      }

      this.analyser = this.audioCtx.createAnalyser();
      this.analyser.fftSize = 2048;

      const source = this.audioCtx.createMediaStreamSource(stream);
      source.connect(this.analyser);

      const canvas = document.getElementById(canvasId);
      if (canvas) {
        this.canvasCtx = canvas.getContext("2d");
      }

      this.pitchBuffer = [];
      this.isTracking = true;
      this.lastProcessTime = performance.now();
      this.trackPitchLoop();
    } catch (e) {
      console.warn("Không thể khởi động AudioContext: ", e);
    }
  }

  stop() {
    this.isTracking = false;
    if (this.audioCtx && this.audioCtx.state !== 'closed') {
      this.audioCtx.close().catch(() => {});
    }
  }

  trackPitchLoop() {
    if (!this.isTracking) return;

    const now = performance.now();
    // Giới hạn tần suất xử lý (30ms/lần) để CPU luôn mát, không bao giờ bị đơ web
    if (now - this.lastProcessTime >= 30) {
      this.lastProcessTime = now;
      const buffer = new Float32Array(this.analyser.fftSize);
      this.analyser.getFloatTimeDomainData(buffer);

      const f0 = this.getPitchFast(buffer, this.audioCtx.sampleRate);
      if (f0 && f0.freq >= 75 && f0.freq <= 450 && f0.clarity > 0.6) {
        this.pitchBuffer.push({
          freq: f0.freq,
          time: now,
          clarity: f0.clarity
        });
      }
      this.drawPitchWave();
    }

    requestAnimationFrame(() => this.trackPitchLoop());
  }

  // Thuật toán Autocorrelation + Parabolic tối ưu cho giọng người
  getPitchFast(buf, sampleRate) {
    const SIZE = buf.length;
    let rms = 0;
    for (let i = 0; i < SIZE; i++) rms += buf[i] * buf[i];
    rms = Math.sqrt(rms / SIZE);

    if (rms < 0.015) return null; // Lọc tạp âm môi trường

    const minTau = Math.floor(sampleRate / 450); // ~75Hz - 450Hz
    const maxTau = Math.floor(sampleRate / 75);
    const windowSize = 1024;

    let maxVal = -1;
    let bestTau = -1;
    const acf = new Float32Array(maxTau + 2);

    for (let tau = minTau; tau <= maxTau; tau++) {
      let sum = 0;
      for (let i = 0; i < windowSize; i++) {
        sum += buf[i] * buf[i + tau];
      }
      acf[tau] = sum;
      if (sum > maxVal) {
        maxVal = sum;
        bestTau = tau;
      }
    }

    if (bestTau <= minTau || bestTau >= maxTau) return null;

    // Nội suy Parabolic
    const y0 = acf[bestTau - 1] || 0;
    const y1 = acf[bestTau];
    const y2 = acf[bestTau + 1] || 0;
    const denom = 2 * (2 * y1 - y0 - y2);
    const delta = denom !== 0 ? (y2 - y0) / denom : 0;
    const preciseTau = bestTau + delta;

    const clarity = maxVal / (acf[minTau] || maxVal);
    return { freq: sampleRate / preciseTau, clarity: Math.min(1, clarity) };
  }

  drawPitchWave() {
    if (!this.canvasCtx) return;
    const ctx = this.canvasCtx;
    const w = ctx.canvas.width;
    const h = ctx.canvas.height;

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "#020617";
    ctx.fillRect(0, 0, w, h);

    // Vẽ lưới ngũ độ
    ctx.strokeStyle = "#1e293b";
    ctx.lineWidth = 1;
    for (let i = 1; i <= 4; i++) {
      const y = (h / 5) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    if (this.pitchBuffer.length < 2) return;

    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.beginPath();

    const maxPts = 60;
    const slice = this.pitchBuffer.slice(-maxPts);
    const minF = 80, maxF = 360;

    slice.forEach((p, idx) => {
      const x = (idx / (maxPts - 1)) * w;
      const normalizedF = Math.max(0, Math.min(1, (p.freq - minF) / (maxF - minF)));
      const y = h - normalizedF * (h - 16) - 8;
      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
  }

  // Tương thích cả 2 cách gọi hàm
  evaluateTone(targetTones) {
    return this.evaluateMultiTone(targetTones);
  }

  evaluateMultiTone(targetTones = [1]) {
    if (!this.pitchBuffer || this.pitchBuffer.length < 5) {
      return {
        score: 45,
        msg: "Âm quá ngắn hoặc micro chưa nhận rõ tiếng. Bạn hãy phát âm to và dài hơn một chút."
      };
    }

    const raw = this.pitchBuffer.map(p => p.freq);
    const startIdx = Math.floor(raw.length * 0.1);
    const endIdx = Math.max(startIdx + 4, Math.floor(raw.length * 0.9));
    const validPts = raw.slice(startIdx, endIdx);

    const tones = Array.isArray(targetTones) ? targetTones : [Number(targetTones) || 1];
    const segSize = Math.max(2, Math.floor(validPts.length / tones.length));

    let totalScore = 0;
    const feedback = [];

    tones.forEach((tone, idx) => {
      const chunk = validPts.slice(idx * segSize, (idx + 1) * segSize);
      const res = this.evalChunk(chunk, tone);
      totalScore += res.score;
      feedback.push(`Âm #${idx + 1}: ${res.msg}`);
    });

    return {
      score: Math.round(totalScore / tones.length),
      msg: feedback.join(" | ")
    };
  }

  evalChunk(pts, targetTone) {
    if (!pts || pts.length < 2) return { score: 65, msg: "Âm ngắn" };

    const len = pts.length;
    const avgStart = pts.slice(0, Math.ceil(len * 0.35)).reduce((a, b) => a + b, 0) / Math.ceil(len * 0.35);
    const avgEnd = pts.slice(Math.floor(len * 0.65)).reduce((a, b) => a + b, 0) / (len - Math.floor(len * 0.65));
    const overallAvg = pts.reduce((a, b) => a + b, 0) / len;
    const delta = avgEnd - avgStart;

    const variance = pts.reduce((a, b) => a + Math.pow(b - overallAvg, 2), 0) / len;
    const stdDev = Math.sqrt(variance);

    switch (Number(targetTone)) {
      case 1: // Thanh 1: Ngang, cao đều (55)
        if (stdDev < 18 && Math.abs(delta) < 20) return { score: 98, msg: "Rất chuẩn: Cao độ ngân phẳng và đều!" };
        if (stdDev < 26) return { score: 78, msg: "Khá tốt: Giữ giọng ngang đều hơn." };
        return { score: 45, msg: "Chưa đúng: Giọng bị lên/xuống dốc, cần giữ ngang nốt." };

      case 2: // Thanh 2: Vuốt từ dưới lên cao (35)
        if (delta > 18) return { score: 96, msg: "Rất chuẩn: Giọng vuốt lên cao rõ rệt!" };
        if (delta > 8) return { score: 78, msg: "Tốt: Hãy vuốt cao hơn nữa." };
        return { score: 45, msg: "Chưa đúng: Cần vuốt giọng từ trầm lên bổng." };

      case 3: // Thanh 3: Trầm sâu (214)
        if (Math.min(...pts) < overallAvg - 6 || avgEnd < avgStart - 8) {
          return { score: 95, msg: "Rất chuẩn: Đã hạ sâu được cuống họng!" };
        }
        return { score: 50, msg: "Chưa đúng: Giọng chưa đủ độ trầm sâu." };

      case 4: // Thanh 4: Rơi dốc dứt khoát (51)
        if (delta < -18) return { score: 98, msg: "Rất chuẩn: Hạ giọng dứt khoát và mạnh mẽ!" };
        if (delta < -8) return { score: 75, msg: "Tốt: Cần ngắt âm nhanh và dứt khoát hơn." };
        return { score: 42, msg: "Chưa đúng: Không được đọc ngang, phải hạ giọng thật nhanh." };

      default:
        return { score: 85, msg: "Thanh nhẹ đạt yêu cầu." };
    }
  }
}

window.ToneAcousticAI = ToneAcousticAI;