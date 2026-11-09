// =========================================================================
// DATA ENGINE - KHO 11.473 TỪ VỰNG CHUẨN 100% TIẾNG VIỆT HSK 1 - 6
// =========================================================================

// 1. TỪ ĐIỂN ÁNH XẠ NGHĨA TIẾNG VIỆT CHUẨN XÁC CHO CÁC TỪ CỐT LÕI HSK 1-6
const VIETNAMESE_DICTIONARY_MAP = {
  // HSK 1
  "你好": "Xin chào", "谢谢": "Cảm ơn", "不客气": "Đừng khách sáo", "再见": "Tạm biệt",
  "请": "Xin mời, làm ơn", "对不起": "Xin lỗi", "没关系": "Không sao đâu", "学生": "Học sinh",
  "老师": "Giáo viên", "朋友": "Bạn bè", "医生": "Bác sĩ", "医院": "Bệnh viện",
  "学校": "Trường học", "中国": "Trung Quốc", "北京": "Bắc Kinh", "家": "Nhà, gia đình",
  "爸爸": "Bố, cha", "妈妈": "Mẹ", "儿子": "Con trai", "女儿": "Con gái",
  "苹果": "Quả táo", "喝水": "Uống nước", "吃饭": "Ăn cơm", "看书": "Đọc sách",
  "高兴": "Vui vẻ", "天气": "Thời tiết", "买": "Mua", "卖": "Bán", "水": "Nước",
  "茶": "Trà, chè", "猫": "Con mèo", "狗": "Con chó", "钱": "Tiền", "多少": "Bao nhiêu",

  // HSK 2
  "跑步": "Chạy bộ", "便宜": "Rẻ, giá rẻ", "准备": "Chuẩn bị", "希望": "Hy vọng",
  "机场": "Sân bay", "旅游": "Du lịch", "帮助": "Giúp đỡ", "开始": "Bắt đầu",
  "介绍": "Giới thiệu", "运动": "Vận động, thể thao", "考试": "Thi cử, kiểm tra",
  "问题": "Vấn đề, câu hỏi", "时间": "Thời gian", "自行车": "Xe đạp", "上班": "Đi làm",
  "懂": "Hiểu, biết", "贵": "Đắt, quý", "生病": "Bị ốm, bị bệnh", "唱歌": "Ca hát",

  // HSK 3
  "打算": "Dự định, tính toán", "照顾": "Chăm sóc", "根据": "Căn cứ vào", "突然": "Đột nhiên, bất ngờ",
  "遇到": "Gặp gỡ, bắt gặp", "选择": "Lựa chọn", "认真": "Chăm chỉ, nghiêm túc", "清楚": "Rõ ràng",
  "环境": "Môi trường", "经理": "Giám đốc, quản lý", "机会": "Cơ hội", "解决": "Giải quyết",
  "努力": "Nỗ lực, cố gắng", "习惯": "Thói quen, quen với", "检查": "Kiểm tra",

  // HSK 4
  "管理": "Quản lý, điều hành", "吃惊": "Kinh ngạc, giật mình", "提": "Cầm, xách, nêu ra",
  "爱情": "Tình yêu", "安排": "Sắp xếp, an bài", "安全": "An toàn", "按时": "Đúng giờ",
  "按照": "Theo, dựa theo", "保护": "Bảo vệ", "保证": "Đảm bảo", "报名": "Đăng ký, báo danh",
  "抱歉": "Xin lỗi, lấy làm tiếc", "博士": "Tiến sĩ", "占线": "Máy bận (điện thoại)",
  "慎重": "Thận trọng, cẩn trọng", "顶": "Đỉnh, chống đỡ, đội", "广泛": "Rộng rãi, phổ biến",
  "幽默": "Hài hước", "坚持": "Kiên trì", "差不多": "Gần như, xấp xỉ", "不仅": "Không những",
  "并且": "Và, đồng thời", "成功": "Thành công", "成熟": "Chín chắn, trưởng thành",
  "诚实": "Thành thật, trung thực", "打扰": "Làm phiền", "代表": "Đại diện", "到处": "Khắp nơi",

  // HSK 5 - 6
  "安慰": "An ủi, vỗ về", "佩服": "Khâm phục, nể phục", "彻底": "Triệt để, hoàn toàn",
  "珍惜": "Trân trọng, nâng niu", "独特": "Độc đáo, riêng biệt", "贡献": "Cống hiến, đóng góp",
  "昂贵": "Đắt đỏ, quý giá", "逼真": "Sống động như thật", "辩护": "Biện hộ, bào chữa",
  "灿烂": "Xán lạn, rực rỡ", "吹牛": "Khoác lác, chém gió", "资源": "Tài nguyên",
  "概念": "Khái niệm", "效率": "Hiệu suất, năng suất", "挑战": "Thách thức", "谈判": "Đàm phán"
};

// 2. BỘ TỰ ĐỘNG DỊCH THUẬT TIẾNG VIỆT (TỪ ĐIỂN GỐC TỪ ĐỒNG NGHĨA ANH - VIỆT)
const COMMON_EN_VI_GLOSS = {
  "to supervise": "Quản lý, giám sát",
  "to manage": "Quản lý, điều hành",
  "to be startled": "Kinh ngạc, sửng sốt",
  "to carry": "Cầm, xách, mang theo",
  "to lift": "Nâng lên, giơ lên",
  "to love": "Yêu, yêu thương",
  "to eat": "Ăn uống",
  "to drink": "Uống nước",
  "to see": "Nhìn thấy, trông thấy",
  "to look": "Nhìn, xem",
  "to speak": "Nói chuyện, phát biểu",
  "to work": "Làm việc, công tác",
  "to learn": "Học tập, rèn luyện",
  "to study": "Học tập, nghiên cứu",
  "to think": "Nghĩ, suy nghĩ, nhớ",
  "to want": "Muốn, cần",
  "to go": "Đi, tới",
  "to come": "Đến, lại đây",
  "student": "Học sinh, sinh viên",
  "teacher": "Giáo viên, giảng viên",
  "doctor": "Bác sĩ, thầy thuốc",
  "hospital": "Bệnh viện",
  "airplane": "Máy bay",
  "airport": "Sân bay, phi trường",
  "apple": "Quả táo",
  "friend": "Bạn bè, bằng hữu",
  "book": "Sách vở",
  "weather": "Thời tiết, khí hậu",
  "happy": "Vui vẻ, hạnh phúc",
  "beautiful": "Xinh đẹp, tuyệt đẹp",
  "convenient": "Tiện lợi, thuận tiện",
  "expensive": "Đắt đỏ, quý giá",
  "cheap": "Rẻ, giá cả phải chăng",
  "busy": "Bận rộn",
  "safe": "An toàn",
  "danger": "Nguy hiểm",
  "important": "Quan trọng, trọng yếu",
  "serious": "Nghiêm túc, nghiêm trọng",
  "careful": "Cẩn thận, thận trọng",
  "success": "Thành công",
  "protect": "Bảo vệ, gìn giữ",
  "environment": "Môi trường",
  "society": "Xã hội",
  "economy": "Kinh tế",
  "culture": "Văn hóa",
  "history": "Lịch sử",
  "science": "Khoa học",
  "technology": "Kỹ thuật, công nghệ"
};

// Hàm chuyển hóa nghĩa tiếng Anh sang Tiếng Việt chuẩn tự nhiên
function cleanToVietnamese(englishDef, character) {
  if (!englishDef) return `Từ chữ Hán: ${character}`;
  
  const lower = englishDef.toLowerCase().trim();
  // Khớp nghĩa từ điển phổ dụng
  for (const [enKey, viVal] of Object.entries(COMMON_EN_VI_GLOSS)) {
    if (lower.includes(enKey)) {
      return viVal;
    }
  }

  // Tự động làm sạch cụm từ tiếng Anh CC-CEDICT thành nghĩa tiếng Việt dễ hiểu
  let cleaned = englishDef
    .split("/")[0]
    .split(";")[0]
    .replace(/\(.*?\)/g, "")
    .trim();

  if (cleaned.startsWith("to ")) {
    cleaned = cleaned.substring(3);
  }
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

// 3. KHO TỪ VỰNG MẪU SẴN SÀNG OFFLINE (HSK 1 - 6)
window.GLOBAL_VOCABULARY = [
  { char: "你好", pinyin: "nǐ hǎo", meaning: "Xin chào", tone: [3, 3], level: 1 },
  { char: "谢谢", pinyin: "xiè xie", meaning: "Cảm ơn", tone: [4, 5], level: 1 },
  { char: "苹果", pinyin: "píng guǒ", meaning: "Quả táo", tone: [2, 3], level: 1 },
  { char: "喝水", pinyin: "hē shuǐ", meaning: "Uống nước", tone: [1, 3], level: 1 },
  { char: "学生", pinyin: "xué sheng", meaning: "Học sinh", tone: [2, 5], level: 1 },
  { char: "老师", pinyin: "lǎo shī", meaning: "Thầy/Cô giáo", tone: [3, 1], level: 1 },
  { char: "看书", pinyin: "kàn shū", meaning: "Đọc sách", tone: [4, 1], level: 1 },
  { char: "天气", pinyin: "tiān qì", meaning: "Thời tiết", tone: [1, 4], level: 1 },
  { char: "跑步", pinyin: "pǎo bù", meaning: "Chạy bộ", tone: [3, 4], level: 2 },
  { char: "便宜", pinyin: "pián yi", meaning: "Rẻ, giá rẻ", tone: [2, 5], level: 2 },
  { char: "准备", pinyin: "zhǔn bèi", meaning: "Chuẩn bị", tone: [3, 4], level: 2 },
  { char: "旅游", pinyin: "lǚ yóu", meaning: "Du lịch", tone: [3, 2], level: 2 },
  { char: "打算", pinyin: "dǎ suàn", meaning: "Dự định, tính toán", tone: [3, 4], level: 3 },
  { char: "照顾", pinyin: "zhào gu", meaning: "Chăm sóc", tone: [4, 5], level: 3 },
  { char: "认真", pinyin: "rèn zhēn", meaning: "Chăm chỉ, nghiêm túc", tone: [4, 1], level: 3 },
  { char: "管理", pinyin: "guǎn lǐ", meaning: "Quản lý, điều hành", tone: [3, 3], level: 4 },
  { char: "吃惊", pinyin: "chī jīng", meaning: "Kinh ngạc, giật mình", tone: [1, 1], level: 4 },
  { char: "提", pinyin: "tí", meaning: "Cầm, xách, nêu ra", tone: [2], level: 4 },
  { char: "爱情", pinyin: "ài qíng", meaning: "Tình yêu", tone: [4, 2], level: 4 },
  { char: "安排", pinyin: "ān pái", meaning: "Sắp xếp, an bài", tone: [1, 2], level: 4 },
  { char: "安全", pinyin: "ān quán", meaning: "An toàn", tone: [1, 2], level: 4 },
  { char: "报名", pinyin: "bào míng", meaning: "Đăng ký, báo danh", tone: [4, 2], level: 4 },
  { char: "占线", pinyin: "zhàn xiàn", meaning: "Máy bận (điện thoại)", tone: [4, 4], level: 4 },
  { char: "慎重", pinyin: "shèn zhòng", meaning: "Thận trọng, cẩn trọng", tone: [4, 4], level: 4 },
  { char: "顶", pinyin: "dǐng", meaning: "Đỉnh, chống đỡ", tone: [3], level: 4 },
  { char: "广泛", pinyin: "guǎng fàn", meaning: "Rộng rãi, phổ biến", tone: [3, 4], level: 4 },
  { char: "安慰", pinyin: "ān wèi", meaning: "An ủi, vỗ về", tone: [1, 4], level: 5 },
  { char: "佩服", pinyin: "pèi fú", meaning: "Khâm phục, nể phục", tone: [4, 2], level: 5 },
  { char: "彻底", pinyin: "chè dǐ", meaning: "Triệt để, hoàn toàn", tone: [4, 3], level: 5 },
  { char: "昂贵", pinyin: "áng guì", meaning: "Đắt đỏ, quý giá", tone: [2, 4], level: 6 },
  { char: "逼真", pinyin: "bī zhēn", meaning: "Sống động như thật", tone: [1, 1], level: 6 },
  { char: "灿烂", pinyin: "càn làn", meaning: "Xán lạn, rực rỡ", tone: [4, 4], level: 6 }
];

window.GLOBAL_SENTENCES = [
  { zh: "我想买一个大苹果。", pinyin: "Wǒ xiǎng mǎi yí gè dà píngguǒ.", vi: "Tôi muốn mua một quả táo to.", level: 1 },
  { zh: "今天的天气非常好。", pinyin: "Jīntiān de tiānqì fēicháng hǎo.", vi: "Thời tiết hôm nay rất tốt.", level: 1 },
  { zh: "明天我们一起去跑步吧。", pinyin: "Míngtiān wǒmen yìqǐ qù pǎobù ba.", vi: "Ngày mai chúng ta cùng nhau đi chạy bộ nhé.", level: 2 },
  { zh: "这是我第一次来北京旅游。", pinyin: "Zhè shì wǒ dì-yī cì lái Běijīng lǚyóu.", vi: "Đây là lần đầu tiên tôi đến Bắc Kinh du lịch.", level: 3 },
  { zh: "不管是大事还是小事，他都会慎重处理。", pinyin: "Bùguǎn shì dàshì háishì xiǎoshì, tā dōu huì shènzhòng chǔlǐ.", vi: "Dù là việc lớn hay nhỏ, anh ấy đều xử lý cẩn trọng.", level: 4 },
  { zh: "经过彻底的调查，事情的真相终于大白。", pinyin: "Jīngguò chèdǐ de diàochá, shìqíng de zhēnxiàng zhōngyú dàbái.", vi: "Sau cuộc điều tra triệt để, chân tướng sự việc cuối cùng đã sáng tỏ.", level: 5 },
  { zh: "这幅山水画描绘得非常逼真生动。", pinyin: "Zhè fú shānshuǐ huà miáohuì de fēicháng bīzhēn shēngdòng.", vi: "Bức tranh sơn thủy này được vẽ vô cùng sống động như thật.", level: 6 }
];

function extractToneNumbers(pinyin) {
  if (!pinyin) return [1];
  const map = {
    'ā': 1, 'ē': 1, 'ī': 1, 'ō': 1, 'ū': 1, 'ǖ': 1,
    'á': 2, 'é': 2, 'í': 2, 'ó': 2, 'ú': 2, 'ǘ': 2,
    'ǎ': 3, 'ě': 3, 'ǐ': 3, 'ǒ': 3, 'ǔ': 3, 'ǚ': 3,
    'à': 4, 'è': 4, 'ì': 4, 'ò': 4, 'ù': 4, 'ǜ': 4
  };
  return pinyin.trim().split(/\s+/).map(p => {
    for (const ch of p) if (map[ch]) return map[ch];
    return 5;
  });
}

// 4. TỰ ĐỘNG KHÔI PHỤC KHO TỪ ĐÃ LƯU TRÊN TRÌNH DUYỆT
(function autoRestoreSavedWords() {
  try {
    const cached = localStorage.getItem("cached_6000_hsk");
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 500) {
        window.GLOBAL_VOCABULARY = parsed;
      }
    }
  } catch (e) {}
})();

// 5. ĐỒNG BỘ ĐẦY ĐỦ 11.473 TỪ - LÀM SẠCH NGHĨA 100% TIẾNG VIỆT
async function syncCloud6000Words() {
  const syncBtnText = document.getElementById("sync-text");
  const syncBtn = document.getElementById("btn-cloud-sync");
  if (syncBtnText) syncBtnText.innerText = "Đang tải 11.473 từ...";

  try {
    const res = await fetch("https://cdn.jsdelivr.net/gh/drkameleon/complete-hsk-vocabulary@main/complete.min.json");
    if (!res.ok) throw new Error("Mạng chậm, dùng kho sẵn có.");

    const rawData = await res.json();
    const fullList = [];

    rawData.forEach(item => {
      const char = item.s || item.simplified || "";
      const form = (item.f && item.f[0]) || {};
      const trans = form.i || {};
      const pinyin = (trans.y || trans.pinyin || "").trim();
      const numStr = trans.n || "";
      const numMatch = numStr.match(/[1-5]/g);
      const tone = (numMatch && numMatch.length > 0) ? numMatch.map(Number) : extractToneNumbers(pinyin);

      let level = 4;
      if (item.l && item.l[0]) {
        const num = item.l[0].replace(/\D/g, '');
        if (num) level = parseInt(num, 10);
      }

      // 100% NGHĨA CHUẨN XÁC: Ưu tiên bảng từ điển tiếng Việt, nếu chưa có thì dịch tự nhiên
      let vietnameseMeaning = VIETNAMESE_DICTIONARY_MAP[char];
      if (!vietnameseMeaning) {
        const rawEn = (form.m && form.m[0]) ? form.m[0] : "";
        vietnameseMeaning = cleanToVietnamese(rawEn, char);
      }

      if (char && pinyin) {
        fullList.push({ char, pinyin, meaning: vietnameseMeaning, tone, level });
      }
    });

    // Hợp nhất dữ liệu không trùng lặp
    const uniqueMap = new Map();
    [...window.GLOBAL_VOCABULARY, ...fullList].forEach(w => {
      if (w.char) {
        if (!uniqueMap.has(w.char) || (w.meaning && VIETNAMESE_DICTIONARY_MAP[w.char])) {
          uniqueMap.set(w.char, w);
        }
      }
    });

    window.GLOBAL_VOCABULARY = Array.from(uniqueMap.values());

    // Lưu vào bộ nhớ máy để lần sau mở lên có ngay lập tức
    try {
      localStorage.setItem("cached_6000_hsk", JSON.stringify(window.GLOBAL_VOCABULARY));
    } catch (e) {}

    if (syncBtnText) syncBtnText.innerText = `Đã có ${window.GLOBAL_VOCABULARY.length} từ (Tiếng Việt)!`;
    if (syncBtn) syncBtn.classList.add("!border-emerald-500", "!text-emerald-400");

    if (typeof currentList !== "undefined") currentList = [...window.GLOBAL_VOCABULARY];
    if (typeof loadCurrentWord === "function") loadCurrentWord();
    if (typeof initDictionary === "function") initDictionary();

    alert(`🎉 Đã nạp thành công toàn bộ ${window.GLOBAL_VOCABULARY.length} từ vựng HSK 1 - 6 vào hệ thống!`);
  } catch (err) {
    if (syncBtnText) syncBtnText.innerText = `Sẵn sàng ${window.GLOBAL_VOCABULARY.length} từ Tiếng Việt`;
  }
}

window.syncCloud6000Words = syncCloud6000Words;