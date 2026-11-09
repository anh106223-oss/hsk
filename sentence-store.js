// ========================================================
// SENTENCE DATABASE ENGINE (INDEXEDDB - CHỨA 20.000+ CÂU)
// ========================================================

const DB_NAME = "HSK_Sentences_DB";
const DB_VERSION = 1;
const STORE_NAME = "sentences";

class SentenceStore {
  constructor() {
    this.db = null;
  }

  // Khởi tạo Database ngầm IndexedDB
  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: "id", autoIncrement: true });
          store.createIndex("level", "level", { unique: false });
        }
      };

      request.onsuccess = (e) => {
        this.db = e.target.result;
        resolve(this.db);
      };

      request.onerror = (err) => reject(err);
    });
  }

  // Lưu hàng loạt câu vào IndexedDB
  async saveBatch(sentences) {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);

      sentences.forEach((s) => store.put(s));

      tx.oncomplete = () => resolve(true);
      tx.onerror = (err) => reject(err);
    });
  }

  // Đếm tổng số câu hiện có trong kho
  async count(level = 'ALL') {
    if (!this.db) await this.init();
    return new Promise((resolve) => {
      const tx = this.db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);

      if (level === 'ALL') {
        const req = store.count();
        req.onsuccess = () => resolve(req.result);
      } else {
        const idx = store.index("level");
        const req = idx.count(Number(level));
        req.onsuccess = () => resolve(req.result);
      }
    });
  }

  // Lấy ngẫu nhiên câu hỏi theo cấp độ HSK
  async getRandomSentence(level = 'ALL') {
    if (!this.db) await this.init();
    return new Promise((resolve) => {
      const tx = this.db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);

      let req;
      if (level === 'ALL') {
        req = store.getAll();
      } else {
        const idx = store.index("level");
        req = idx.getAll(Number(level));
      }

      req.onsuccess = () => {
        const list = req.result;
        if (!list || list.length === 0) {
          resolve(null);
        } else {
          const randItem = list[Math.floor(Math.random() * list.length)];
          resolve(randItem);
        }
      };
    });
  }
}

const sentenceDB = new SentenceStore();

// Tải gói 20.000 câu từ CDN / GitHub theo HSK
async function syncOnlineSentences(hskLevel = 'ALL') {
  const statusElem = document.getElementById("practice-sync-status");
  if (statusElem) statusElem.innerText = "Đang tải dữ liệu câu từ máy chủ...";

  // Link endpoint CDN chứa các gói dữ liệu câu
  // Có thể trỏ đến kho raw JSON trên GitHub của bạn hoặc Tatoeba corpus
  const url = `https://raw.githubusercontent.com/manh-nguyen/hsk-sentence-corpus/main/data_hsk_${hskLevel.toLowerCase()}.json`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Chưa kết nối được file dữ liệu");
    const data = await res.json(); // Mảng 5.000 - 20.000 câu

    await sentenceDB.saveBatch(data);
    const total = await sentenceDB.count(hskLevel);

    if (statusElem) statusElem.innerText = `Đã nạp ${total} câu (HSK ${hskLevel})!`;
  } catch (err) {
    console.warn("Dùng bộ sinh câu tự động dự phòng: ", err);
    // Nếu chưa tạo file trực tuyến, tự động sinh 1.000 câu đa dạng từ ngữ pháp
    generateMockSentences();
  }
}

// Bộ tạo câu phong phú offline dự phòng khi chưa tải online
function generateMockSentences() {
  const templates = [
    { zh: "我想买一个[NOUN]。", vi: "Tôi muốn mua một cái [NOUN]." },
    { zh: "他的[NOUN]比我的好。", vi: "[NOUN] của anh ấy tốt hơn của tôi." },
    { zh: "请大家按照[NOUN]的要求去做。", vi: "Xin mọi người làm theo yêu cầu của [NOUN]." },
    { zh: "虽然很忙，但他还是决定去[VERB]。", vi: "Tuy rất bận, nhưng anh ấy vẫn quyết định đi [VERB]." }
  ];

  const mockList = [];
  GLOBAL_VOCABULARY.forEach((word, idx) => {
    templates.forEach((tpl, tIdx) => {
      const sentenceZh = tpl.zh.replace("[NOUN]", word.char).replace("[VERB]", word.char);
      const sentenceVi = tpl.vi.replace("[NOUN]", word.meaning).replace("[VERB]", word.meaning);
      mockList.push({
        id: `${word.char}_${idx}_${tIdx}`,
        zh: sentenceZh,
        vi: sentenceVi,
        level: word.level || 4,
        tokens: [sentenceZh.slice(0, 2), word.char, sentenceZh.slice(2).replace(word.char, "")]
      });
    });
  });

  sentenceDB.saveBatch(mockList).then(() => {
    console.log(`Đã nạp kho câu dự phòng: ${mockList.length} câu.`);
  });
}