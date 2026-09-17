/**
 * plantStories.js
 * Kho tàng những câu chuyện nhỏ vui vẻ, dễ thương và tính cách của từng người bạn cây
 */

export const PLANT_STORIES = {
  "Trầu bà Nam Mỹ": {
    tag: "Bé Monstera Xòe Lá ☀️",
    mood: "Hào hứng · Yêu ánh nắng",
    story: "Mỗi sớm mai, bé Monstera lại háo hức xòe chiếc lá to bản đón nắng sớm. Ước mơ lớn nhất của bé là biến góc phòng bạn thành một khu rừng nhiệt đới tí hon ngập tràn tiếng cười.",
    voice: "Chào bạn! Hôm nay bạn mỉm cười chưa? Cùng lớn lên nhé ~ 🌱",
    reaction: "Bé Monstera vừa vẫy lá chào bạn đấy! 🌿",
    sparkle: "🍃",
  },
  "Sen đá Ngọc Lan": {
    tag: "Búp Sen Ngoan Ngoãn 💧",
    mood: "Bình yên · Dễ chịu",
    story: "Chiếc búp nhỏ kiên cường khẽ cuộn mình e ấp, chỉ cần một ngụm nước mỗi tuần là đủ vui vẻ tỏa hương sắc dịu dàng bên bàn làm việc của bạn.",
    voice: "Tớ không đòi hỏi nhiều đâu, chỉ lặng lẽ ngắm bạn làm việc thôi 💚",
    reaction: "Bé Sen đá khẽ chớp mắt cười với bạn! ✨",
    sparkle: "💧",
  },
  "Lưỡi hổ vàng": {
    tag: "Dũng Sĩ Gác Đêm 🛡️",
    mood: "Dũng cảm · Lọc khí",
    story: "Chàng dũng sĩ khoác áo sọc vàng luôn đứng gác âm thầm góc phòng, lọc sạch bụi bẩn suốt đêm để trao cho bạn một giấc ngủ thật an yên.",
    voice: "Cứ yên tâm ngủ ngon nhé, bầu không khí để tớ canh gác! 🌙",
    reaction: "Dũng sĩ Lưỡi Hổ giơ lá chào nghiêm túc! 🪴",
    sparkle: "✨",
  },
  "Xương rồng tai thỏ": {
    tag: "Bé Thỏ Vểnh Tai 🐰",
    mood: "Tinh nghịch · Nhắc uống nước",
    story: "Hai chiếc tai thỏ xanh mướt lúc nào cũng vểnh lên nghe ngóng. Nhiệm vụ tối cao của bé là nhắc bạn uống nước đúng giờ và thư giãn sau giờ chạy deadline.",
    voice: "Bạn ơi nhớ uống nước nha! Tớ không cần nhiều nước nhưng bạn thì có! 💧",
    reaction: "Bé Thỏ lắc tai tinh nghịch chào bạn! 🐰",
    sparkle: "🌸",
  },
  "Trầu bà lá phượng": {
    tag: "Nàng Thơ Giá Sách 🌿",
    mood: "Dịu dàng · Mộng mơ",
    story: "Nàng thơ tóc dài buông lơi mềm mại bên kệ sách, khẽ đung đưa theo từng cơn gió thoảng và lắng nghe tiếng lật sách thì thầm mỗi chiều mưa.",
    voice: "Đọc xong một trang sách, nhớ liếc nhìn tớ một giây nhé 📖",
    reaction: "Nàng thơ khẽ đung đưa dải lá xanh mềm mại! 🌱",
    sparkle: "🍃",
  },
  "Chậu gốm nung tay": {
    tag: "Bác Chậu Ấm Áp 🏺",
    mood: "Ấm áp · Che chở rễ",
    story: "Món quà nung ấm từ đất mẹ với đôi má hồng mộc mạc, luôn mở rộng vòng tay để ủ ấm bộ rễ và nâng niu từng mầm xanh nhỏ bé lớn khôn.",
    voice: "Tớ ôm rễ ấm áp lắm, cứ yên tâm gửi gắm các bé cây cho tớ nhé! 🪴",
    reaction: "Bác Chậu nở nụ cười rạng rỡ che chở cho cây! 🏺",
    sparkle: "💖",
  },
};

export function getProductStory(product) {
  if (!product) return null;
  const name = product.name || "";
  for (const [key, val] of Object.entries(PLANT_STORIES)) {
    if (name.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(name.toLowerCase())) {
      return val;
    }
  }
  return {
    tag: "Mầm Xanh Nhỏ Bé 🌱",
    mood: "Vui tươi · An yên",
    story: product.desc || product.description || "Một mầm xanh nhỏ mang theo lời chúc bình an và năng lượng tươi mới đến góc phòng của bạn.",
    voice: "Một chiếc mầm nhỏ sẵn sàng cùng bạn lớn lên mỗi ngày thật vui! 💚",
    reaction: "Bé cây khẽ đung đưa đón chào bạn! ✨",
    sparkle: "🌱",
  };
}
