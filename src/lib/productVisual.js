export function normalizeName(value = '') {
  return String(value).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd');
}

// Specific names take precedence over old or mismatched emoji from the API.
const rules = [
  [/luoi ho|snake plant|sansevieria/, 'snake', 'Lưỡi hổ', '🪴'],
  [/sen da|succulent|echeveria/, 'succulent', 'Sen đá', '🪷'],
  [/tai tho|bunny ear|opuntia/, 'bunny', 'Xương rồng tai thỏ', '🌵'],
  [/xuong rong|cactus|opuntia/, 'cactus', 'Xương rồng', '🌵'],
  [/la phuong|pothos|cay leo|la tim/, 'vine', 'Cây leo', '🌿'],
  [/trau ba|monstera|pothos|philodendron/, 'monstera', 'Trầu bà', '🌿'],
  [/binh sua|baby bottle/, 'emoji', 'Bình sữa', '🍼'],
  [/ca phe|coffee|\bly\b|\bcoc\b|\bmug\b/, 'emoji', 'Ly', '☕'],
  [/con rong|dragon/, 'emoji', 'Rồng', '🐉'],
  [/kumathong|kuman thong|bup be|doll/, 'emoji', 'Búp bê', '🪆'],
  [/chau|gom|terracotta|planter|\bpot\b/, 'pot', 'Chậu gốm', '🏺'],
  [/hoa|flower/, 'flower', 'Hoa', '🌼'],
  [/binh tuoi|watering/, 'emoji', 'Bình tưới', '🚿'],
  [/hat giong|seed/, 'emoji', 'Hạt giống', '🌱'],
  [/phan bon|dat trong|soil/, 'emoji', 'Vật tư trồng cây', '🌱'],
];

export function getProductVisual(product = {}) {
  const match = rules.find(([pattern]) => pattern.test(normalizeName(product.name)));
  if (match) return { type: match[1], label: match[2], emoji: match[3] };
  if (product.icon && product.icon !== '🌿') return { type: 'emoji', label: product.name || 'Sản phẩm', emoji: product.icon };
  const category = normalizeName(product.category);
  if (category.includes('sen da')) return { type: 'succulent', label: 'Sen đá', emoji: '🪷' };
  if (category.includes('cay leo')) return { type: 'vine', label: 'Cây leo', emoji: '🌿' };
  if (category.includes('cay')) return { type: 'monstera', label: 'Cây xanh', emoji: '🪴' };
  return { type: 'emoji', label: product.name || 'Sản phẩm', emoji: product.icon || '📦' };
}
