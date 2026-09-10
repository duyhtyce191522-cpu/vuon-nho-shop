import { useState, useEffect, useMemo, useRef } from "react";
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Pencil,
  X,
  Search,
  ClipboardList,
  Settings,
  Check,
  Sprout,
  Store,
  Lock,
  Leaf,
  Sun,
  Droplets,
  ChevronRight,
  Package,
  Truck,
  CircleCheck,
  CircleX,
  Clock,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// ============================================================
// DESIGN SYSTEM
// ============================================================

const C = {
  bg: "#f7f4ee",
  bgGrad: "linear-gradient(170deg, #f7f4ee 0%, #eef3e8 50%, #f2ede4 100%)",
  surface: "#ffffff",
  surfaceGlass: "rgba(255,255,255,0.72)",
  ink: "#1e2a1e",
  inkSoft: "#5a6b55",
  inkMuted: "#8a9685",
  forest: "#1a3a2a",
  forestMid: "#2a5a3a",
  forestLight: "#3a7a4a",
  moss: "#6b9b4e",
  mossLight: "#e2edda",
  mossPale: "#f0f5ec",
  amber: "#e8a838",
  amberLight: "#fdf3e0",
  clay: "#c45a3c",
  clayLight: "#fce8e2",
  water: "#4a9bb5",
  waterLight: "#e4f3f7",
  line: "#ddd8c8",
  lineSoft: "#eae6d8",
  shadow: "0 4px 20px rgba(26,58,42,0.08)",
  shadowHover: "0 12px 32px rgba(26,58,42,0.14)",
  shadowFloat: "0 20px 60px rgba(26,58,42,0.12)",
};

const FONT_D = "'Playfair Display', Georgia, serif";
const FONT_B = "'Inter', system-ui, sans-serif";

// ============================================================
// CSS ANIMATIONS (injected via <style> tag)
// ============================================================

const ANIMATIONS_CSS = `
/* ---- FLOATING LEAVES BACKGROUND ---- */
@keyframes floatLeaf1 {
  0% { transform: translate(0, 0) rotate(0deg); opacity: 0; }
  10% { opacity: 0.6; }
  90% { opacity: 0.6; }
  100% { transform: translate(-120px, 100vh) rotate(360deg); opacity: 0; }
}
@keyframes floatLeaf2 {
  0% { transform: translate(0, 0) rotate(0deg); opacity: 0; }
  10% { opacity: 0.4; }
  90% { opacity: 0.4; }
  100% { transform: translate(80px, 100vh) rotate(-270deg); opacity: 0; }
}
@keyframes floatLeaf3 {
  0% { transform: translate(0, 0) rotate(45deg); opacity: 0; }
  10% { opacity: 0.5; }
  90% { opacity: 0.5; }
  100% { transform: translate(-60px, 100vh) rotate(405deg); opacity: 0; }
}

.leaf-particle {
  position: fixed;
  pointer-events: none;
  z-index: 0;
  font-size: 16px;
  top: -30px;
}
.leaf-particle:nth-child(1) { left: 10%; animation: floatLeaf1 18s linear infinite; animation-delay: 0s; }
.leaf-particle:nth-child(2) { left: 30%; animation: floatLeaf2 22s linear infinite; animation-delay: 4s; font-size: 12px; }
.leaf-particle:nth-child(3) { left: 55%; animation: floatLeaf3 20s linear infinite; animation-delay: 8s; font-size: 14px; }
.leaf-particle:nth-child(4) { left: 75%; animation: floatLeaf1 25s linear infinite; animation-delay: 12s; font-size: 10px; }
.leaf-particle:nth-child(5) { left: 90%; animation: floatLeaf2 19s linear infinite; animation-delay: 2s; font-size: 13px; }

/* ---- FADE & SLIDE ANIMATIONS ---- */
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes fadeSlideUp {
  from { opacity: 0; transform: translateY(24px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes fadeSlideDown {
  from { opacity: 0; transform: translateY(-16px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes fadeSlideLeft {
  from { opacity: 0; transform: translateX(30px); }
  to { opacity: 1; transform: translateX(0); }
}
@keyframes fadeSlideRight {
  from { opacity: 0; transform: translateX(-30px); }
  to { opacity: 1; transform: translateX(0); }
}
@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.92); }
  to { opacity: 1; transform: scale(1); }
}

/* ---- CARD ANIMATIONS ---- */
.product-card {
  animation: fadeSlideUp 0.5s ease-out both;
  transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.35s ease;
}
.product-card:hover {
  transform: translateY(-6px) scale(1.01);
  box-shadow: 0 16px 40px rgba(26,58,42,0.13);
}
.product-card:nth-child(1) { animation-delay: 0.05s; }
.product-card:nth-child(2) { animation-delay: 0.1s; }
.product-card:nth-child(3) { animation-delay: 0.15s; }
.product-card:nth-child(4) { animation-delay: 0.2s; }
.product-card:nth-child(5) { animation-delay: 0.25s; }
.product-card:nth-child(6) { animation-delay: 0.3s; }
.product-card:nth-child(7) { animation-delay: 0.35s; }
.product-card:nth-child(8) { animation-delay: 0.4s; }

/* ---- ICON FLOAT ---- */
@keyframes gentleFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}
.icon-float { animation: gentleFloat 3s ease-in-out infinite; }
.icon-float:nth-child(2) { animation-delay: 0.4s; }

/* ---- BUTTON EFFECTS ---- */
.btn-nature {
  position: relative;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
}
.btn-nature::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(120deg, transparent 30%, rgba(255,255,255,0.2) 50%, transparent 70%);
  transform: translateX(-100%);
  transition: transform 0.6s ease;
}
.btn-nature:hover::after {
  transform: translateX(100%);
}
.btn-nature:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(26,58,42,0.2);
}
.btn-nature:active {
  transform: translateY(0) scale(0.98);
}

/* ---- CART DRAWER ---- */
@keyframes drawerSlideIn {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}
@keyframes backdropFadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
.cart-drawer {
  animation: drawerSlideIn 0.4s cubic-bezier(0.22, 1, 0.36, 1);
}
.cart-backdrop {
  animation: backdropFadeIn 0.3s ease;
}

/* ---- CART ITEM ---- */
.cart-item {
  animation: fadeSlideLeft 0.35s ease-out both;
  transition: all 0.3s ease;
}
.cart-item:nth-child(1) { animation-delay: 0.05s; }
.cart-item:nth-child(2) { animation-delay: 0.1s; }
.cart-item:nth-child(3) { animation-delay: 0.15s; }
.cart-item:nth-child(4) { animation-delay: 0.2s; }
.cart-item:nth-child(5) { animation-delay: 0.25s; }

/* ---- TOAST ---- */
@keyframes toastSlideUp {
  from { opacity: 0; transform: translate(-50%, 20px); }
  to { opacity: 1; transform: translate(-50%, 0); }
}
@keyframes toastSlideDown {
  from { opacity: 1; transform: translate(-50%, 0); }
  to { opacity: 0; transform: translate(-50%, 20px); }
}
.toast-enter { animation: toastSlideUp 0.4s cubic-bezier(0.22, 1, 0.36, 1); }

/* ---- MODAL ---- */
@keyframes modalScaleIn {
  from { opacity: 0; transform: scale(0.9) translateY(10px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}
.modal-content { animation: modalScaleIn 0.35s cubic-bezier(0.22, 1, 0.36, 1); }

/* ---- LOADING ---- */
@keyframes growSprout {
  0% { transform: scale(0.6) rotate(-10deg); opacity: 0.3; }
  50% { transform: scale(1.1) rotate(5deg); opacity: 1; }
  100% { transform: scale(0.6) rotate(-10deg); opacity: 0.3; }
}
@keyframes breathe {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}

/* ---- NAV BUTTON ---- */
.nav-btn {
  position: relative;
  transition: all 0.3s ease;
}
.nav-btn::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 0;
  height: 2px;
  background: ${C.moss};
  transition: all 0.3s ease;
  transform: translateX(-50%);
  border-radius: 1px;
}
.nav-btn:hover::after, .nav-btn.active::after {
  width: 70%;
}
.nav-btn:hover {
  color: ${C.forest} !important;
}

/* ---- SEARCH ---- */
.search-box {
  transition: all 0.3s ease;
}
.search-box:focus-within {
  box-shadow: 0 0 0 3px rgba(107,155,78,0.2);
  border-color: ${C.moss} !important;
}
.search-box input:focus {
  outline: none;
}

/* ---- CATEGORY PILLS ---- */
.cat-pill {
  transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
}
.cat-pill:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(26,58,42,0.1);
}

/* ---- ORDER CARD ---- */
.order-card {
  animation: fadeSlideUp 0.4s ease-out both;
  transition: all 0.3s ease;
}
.order-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 28px rgba(26,58,42,0.1);
}
.order-card:nth-child(1) { animation-delay: 0.05s; }
.order-card:nth-child(2) { animation-delay: 0.1s; }
.order-card:nth-child(3) { animation-delay: 0.15s; }
.order-card:nth-child(4) { animation-delay: 0.2s; }

/* ---- ADMIN TABLE ROW ---- */
.admin-row {
  animation: fadeIn 0.3s ease both;
  transition: background 0.2s ease;
}
.admin-row:hover {
  background: ${C.mossPale} !important;
}
.admin-row:nth-child(1) { animation-delay: 0.03s; }
.admin-row:nth-child(2) { animation-delay: 0.06s; }
.admin-row:nth-child(3) { animation-delay: 0.09s; }
.admin-row:nth-child(4) { animation-delay: 0.12s; }

/* ---- ICON BUTTONS ---- */
.icon-btn {
  transition: all 0.25s ease;
  border-radius: 8px;
  padding: 6px;
}
.icon-btn:hover {
  background: ${C.mossLight};
  transform: scale(1.1);
}
.icon-btn.danger:hover {
  background: ${C.clayLight};
  color: ${C.clay};
}

/* ---- PULSE BADGE ---- */
@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.08); }
}
.pulse { animation: pulse 2s ease-in-out infinite; }

/* ---- HERO DECORATION ---- */
@keyframes heroLeafDrift {
  0%, 100% { transform: rotate(0deg) translateY(0); }
  25% { transform: rotate(5deg) translateY(-8px); }
  75% { transform: rotate(-3deg) translateY(4px); }
}
.hero-leaf { animation: heroLeafDrift 6s ease-in-out infinite; }

/* ---- QTY BUTTON ---- */
.qty-btn {
  transition: all 0.2s ease;
}
.qty-btn:hover {
  background: ${C.mossLight} !important;
  border-color: ${C.moss} !important;
  transform: scale(1.1);
}
.qty-btn:active {
  transform: scale(0.95);
}

/* ---- FIELD INPUT ---- */
.field-input {
  transition: all 0.3s ease;
}
.field-input:focus {
  outline: none;
  border-color: ${C.moss} !important;
  box-shadow: 0 0 0 3px rgba(107,155,78,0.15);
}

/* ---- STATUS SELECT ---- */
.status-select {
  transition: all 0.2s ease;
}
.status-select:focus {
  outline: none;
  border-color: ${C.moss};
  box-shadow: 0 0 0 3px rgba(107,155,78,0.15);
}

/* ---- SHAKE ---- */
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-6px); }
  40% { transform: translateX(6px); }
  60% { transform: translateX(-4px); }
  80% { transform: translateX(4px); }
}
.shake { animation: shake 0.5s ease; }

/* ---- SCROLLBAR ---- */
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: ${C.line}; border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: ${C.inkMuted}; }
`;

// ============================================================
// SEED PRODUCTS
// ============================================================

const SEED_PRODUCTS = [
  {
    id: "p1",
    name: "Trầu bà Nam Mỹ",
    desc: "Lá xẻ to bản, hợp góc phòng khách nhiều nắng gián tiếp.",
    price: 185000,
    category: "Cây lớn",
    stock: 8,
    icon: "🌿",
  },
  {
    id: "p2",
    name: "Sen đá Ngọc Lan",
    desc: "Nhỏ gọn, dễ sống, tưới 1 lần/tuần.",
    price: 45000,
    category: "Sen đá",
    stock: 24,
    icon: "🌵",
  },
  {
    id: "p3",
    name: "Lưỡi hổ vàng",
    desc: "Lọc không khí tốt, chịu bóng râm, hợp phòng ngủ.",
    price: 95000,
    category: "Cây lớn",
    stock: 15,
    icon: "🪴",
  },
  {
    id: "p4",
    name: "Xương rồng tai thỏ",
    desc: "Hình dáng đáng yêu, hợp bàn làm việc.",
    price: 39000,
    category: "Sen đá",
    stock: 30,
    icon: "🌵",
  },
  {
    id: "p5",
    name: "Trầu bà lá phượng",
    desc: "Dáng leo mềm mại, hợp treo giá hoặc kệ cao.",
    price: 68000,
    category: "Cây leo",
    stock: 12,
    icon: "🌱",
  },
  {
    id: "p6",
    name: "Chậu gốm nung tay",
    desc: "Chậu đất nung thủ công, đường kính 14cm, có lỗ thoát nước.",
    price: 55000,
    category: "Chậu & phụ kiện",
    stock: 20,
    icon: "🏺",
  },
];

const CATS = [
  "Tất cả",
  "Cây lớn",
  "Cây leo",
  "Sen đá",
  "Chậu & phụ kiện",
];

// ============================================================
// HELPERS
// ============================================================

function formatVND(n) {
  return Number(n || 0).toLocaleString("vi-VN") + "đ";
}

function getStorage(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    if (value === null) return fallback;
    return JSON.parse(value);
  } catch (error) {
    console.error("Storage error:", error);
    return fallback;
  }
}

function setStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error("Storage save error:", error);
  }
}

const STATUS_MAP = {
  "Chờ xử lý": { color: C.amber, bg: C.amberLight, icon: Clock },
  "Đang giao": { color: C.water, bg: C.waterLight, icon: Truck },
  "Hoàn tất": { color: C.moss, bg: C.mossLight, icon: CircleCheck },
  "Đã giao": { color: C.moss, bg: C.mossLight, icon: CircleCheck },
  "Đã huỷ": { color: C.clay, bg: C.clayLight, icon: CircleX },
  "Đã hủy": { color: C.clay, bg: C.clayLight, icon: CircleX },
};

function getStatusStyle(status) {
  return STATUS_MAP[status] || { color: C.inkSoft, bg: C.lineSoft, icon: Package };
}

// ============================================================
// MAIN APP
// ============================================================

export default function PlantShop() {
  const [view, setView] = useState("shop");
  const [products, setProducts] = useState(null);
  const [orders, setOrders] = useState([]);
  const [myOrderIds, setMyOrderIds] = useState(() => getStorage("my-order-ids", []));
  const [cart, setCart] = useState({});
  const [cartOpen, setCartOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState("Tất cả");
  const [checkoutStep, setCheckoutStep] = useState("cart");
  const [buyer, setBuyer] = useState({ name: "", phone: "", address: "" });
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [adminAuthed, setAdminAuthed] = useState(false);
  const [pwInput, setPwInput] = useState("");
  const [pwError, setPwError] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [cartBounce, setCartBounce] = useState(false);

  // ============================================================
  // TOAST
  // ============================================================

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  }

  // ============================================================
  // LOAD DATA FROM BACKEND
  // ============================================================

  useEffect(() => {
    async function loadData() {
      try {
        const productResponse = await fetch(`${API_URL}/api/products`);
        if (!productResponse.ok) throw new Error("Không thể lấy sản phẩm từ Backend");
        const productData = await productResponse.json();
        setProducts(productData);

        const orderResponse = await fetch(`${API_URL}/api/orders`);
        if (!orderResponse.ok) throw new Error("Không thể lấy đơn hàng từ Backend");
        const orderData = await orderResponse.json();
        setOrders(orderData);
      } catch (error) {
        console.error("Load data error:", error);
        setProducts(SEED_PRODUCTS);
        setOrders([]);
        showToast("Không kết nối được Backend");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // ============================================================
  // CART LOGIC
  // ============================================================

  const cartItems = useMemo(() => {
    if (!products) return [];
    return Object.entries(cart)
      .filter(([, qty]) => qty > 0)
      .map(([id, qty]) => {
        const product = products.find((p) => String(p.id) === String(id));
        if (!product) return null;
        return { ...product, qty };
      })
      .filter(Boolean);
  }, [cart, products]);

  const cartTotal = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);
  const cartCount = cartItems.reduce((sum, item) => sum + item.qty, 0);

  function addToCart(id) {
    const product = products?.find((p) => String(p.id) === String(id));
    if (!product) return;
    if (product.stock <= 0) { showToast("Sản phẩm đã hết hàng"); return; }
    setCart((current) => {
      const currentQty = current[id] || 0;
      if (currentQty >= product.stock) { showToast("Đã đạt số lượng tồn kho"); return current; }
      return { ...current, [id]: currentQty + 1 };
    });
    setCartBounce(true);
    setTimeout(() => setCartBounce(false), 500);
    showToast("Đã thêm vào giỏ 🌿");
  }

  function changeQty(id, delta) {
    const product = products?.find((p) => String(p.id) === String(id));
    setCart((current) => {
      const currentQty = current[id] || 0;
      let newQty = currentQty + delta;
      if (newQty < 0) newQty = 0;
      if (product && newQty > product.stock) { newQty = product.stock; showToast("Không đủ số lượng trong kho"); }
      const next = { ...current };
      if (newQty === 0) delete next[id]; else next[id] = newQty;
      return next;
    });
  }

  function removeFromCart(id) {
    setCart((current) => { const next = { ...current }; delete next[id]; return next; });
  }

  // ============================================================
  // ORDER - CREATE
  // ============================================================

  async function placeOrder() {
    if (!buyer.name.trim() || !buyer.phone.trim() || !buyer.address.trim()) { showToast("Vui lòng điền đủ thông tin"); return; }
    if (cartItems.length === 0) { showToast("Giỏ hàng đang trống"); return; }

    const order = {
      items: cartItems.map((item) => ({ productId: item.id, name: item.name, price: item.price, qty: item.qty })),
      total: cartTotal,
      buyer: { name: buyer.name.trim(), phone: buyer.phone.trim(), address: buyer.address.trim() },
    };

    try {
      const response = await fetch(`${API_URL}/api/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(order),
      });
      if (!response.ok) { const errorData = await response.json().catch(() => ({})); throw new Error(errorData.message || "Không thể tạo đơn hàng"); }
      const savedOrder = await response.json();
      const nextMyOrderIds = [savedOrder.id, ...(myOrderIds || [])];
      setMyOrderIds(nextMyOrderIds);
      setStorage("my-order-ids", nextMyOrderIds);
      setOrders((current) => [savedOrder, ...(current || [])]);
      setCart({});
      setCheckoutStep("done");
      showToast("Đặt hàng thành công 🎉");
    } catch (error) {
      console.error("Order error:", error);
      showToast(error.message || "Đặt hàng thất bại");
    }
  }

  function resetCheckout() {
    setCheckoutStep("cart");
    setCartOpen(false);
    setBuyer({ name: "", phone: "", address: "" });
  }

  // ============================================================
  // ORDER - UPDATE STATUS
  // ============================================================

  async function updateOrderStatus(id, status) {
    try {
      const response = await fetch(`${API_URL}/api/orders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) { const errorData = await response.json().catch(() => ({})); throw new Error(errorData.message || "Không thể cập nhật trạng thái đơn hàng"); }
      const updatedOrder = await response.json();
      setOrders((current) => (current || []).map((order) => String(order.id) === String(updatedOrder.id) ? updatedOrder : order));
      showToast("Đã cập nhật trạng thái đơn hàng");
    } catch (error) {
      console.error("Update order error:", error);
      showToast(error.message || "Cập nhật trạng thái thất bại");
    }
  }

  // ============================================================
  // PRODUCT CRUD
  // ============================================================

  async function deleteProduct(id) {
    if (!window.confirm("Bạn có chắc muốn xóa sản phẩm này không?")) return;
    try {
      const response = await fetch(`${API_URL}/api/products/${id}`, { method: "DELETE" });
      if (!response.ok) { const errorData = await response.json().catch(() => ({})); throw new Error(errorData.message || "Không thể xóa sản phẩm"); }
      setProducts((current) => (current || []).filter((product) => String(product.id) !== String(id)));
      setCart((current) => { const next = { ...current }; delete next[id]; return next; });
      showToast("Đã xóa sản phẩm");
    } catch (error) {
      console.error("Delete product error:", error);
      showToast(error.message || "Xóa sản phẩm thất bại");
    }
  }

  async function upsertProduct(product) {
    try {
      const isEditing = Boolean(product.id);
      const url = isEditing ? `${API_URL}/api/products/${product.id}` : `${API_URL}/api/products`;
      const method = isEditing ? "PUT" : "POST";
      const productData = {
        name: product.name.trim(),
        desc: product.desc ? product.desc.trim() : "",
        price: Number(product.price) || 0,
        category: product.category,
        stock: Number(product.stock) || 0,
        icon: product.icon || "🌱",
      };
      const response = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(productData) });
      if (!response.ok) { const errorData = await response.json().catch(() => ({})); throw new Error(errorData.message || "Không thể lưu sản phẩm"); }
      const savedProduct = await response.json();
      setProducts((current) => {
        if (isEditing) return (current || []).map((item) => String(item.id) === String(savedProduct.id) ? savedProduct : item);
        return [...(current || []), savedProduct];
      });
      setEditingProduct(null);
      setShowForm(false);
      showToast(isEditing ? "Đã cập nhật sản phẩm" : "Đã thêm sản phẩm");
    } catch (error) {
      console.error("Save product error:", error);
      showToast(error.message || "Lưu sản phẩm thất bại");
    }
  }

  // ============================================================
  // FILTERS
  // ============================================================

  const filtered = (products || []).filter((product) => {
    const matchCat = cat === "Tất cả" || product.category === cat;
    const matchSearch = product.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const myOrders = (orders || []).filter((order) => myOrderIds.some((id) => String(id) === String(order.id)));

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div style={{
        background: C.bgGrad,
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: FONT_B,
        color: C.inkSoft,
        gap: "16px",
      }}>
        <div style={{ animation: "growSprout 2s ease-in-out infinite" }}>
          <Sprout size={48} color={C.moss} />
        </div>
        <span style={{ animation: "breathe 2s ease-in-out infinite", fontSize: "15px", fontWeight: 500 }}>
          Đang nảy mầm...
        </span>
      </div>
    );
  }

  // ============================================================
  // MAIN UI
  // ============================================================

  return (
    <div style={{ background: C.bgGrad, minHeight: "100vh", fontFamily: FONT_B, color: C.ink, position: "relative" }}>
      <style>{ANIMATIONS_CSS}</style>

      {/* Floating Leaf Particles */}
      <div aria-hidden="true">
        <span className="leaf-particle">🍃</span>
        <span className="leaf-particle">🌿</span>
        <span className="leaf-particle">🍂</span>
        <span className="leaf-particle">🍃</span>
        <span className="leaf-particle">🌱</span>
      </div>

      {/* HEADER */}
      <header style={{
        position: "sticky",
        top: 0,
        zIndex: 40,
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        background: C.surfaceGlass,
        borderBottom: `1px solid ${C.lineSoft}`,
        animation: "fadeSlideDown 0.5s ease-out",
      }}>
        <div style={{
          maxWidth: "1080px",
          margin: "0 auto",
          padding: "14px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
          flexWrap: "wrap",
        }}>
          <div
            style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}
            onClick={() => setView("shop")}
          >
            <div className="hero-leaf" style={{ display: "flex" }}>
              <Leaf size={24} color={C.moss} strokeWidth={2.2} />
            </div>
            <span style={{
              fontFamily: FONT_D,
              fontSize: "22px",
              fontWeight: 700,
              color: C.forest,
              letterSpacing: "-0.3px",
            }}>
              Vườn Nhỏ
            </span>
            <span style={{ fontSize: "13px", color: C.inkMuted, fontWeight: 400, marginLeft: "-4px" }}>
              của Yến Duy
            </span>
          </div>

          <nav style={{ display: "flex", gap: "2px", alignItems: "center", flexWrap: "wrap" }}>
            <NavButton active={view === "shop"} onClick={() => setView("shop")} icon={<Store size={16} />} label="Cửa hàng" />
            <NavButton active={view === "orders"} onClick={() => setView("orders")} icon={<ClipboardList size={16} />} label="Đơn của tôi" />
            <NavButton active={view === "admin"} onClick={() => setView("admin")} icon={<Settings size={16} />} label="Quản trị" />

            <button
              onClick={() => setCartOpen(true)}
              className="btn-nature"
              style={{
                marginLeft: "8px",
                background: `linear-gradient(135deg, ${C.forest} 0%, ${C.forestMid} 100%)`,
                color: "white",
                border: "none",
                borderRadius: "12px",
                padding: "10px 16px",
                display: "flex",
                alignItems: "center",
                gap: "7px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: 500,
                transform: cartBounce ? "scale(1.15)" : "scale(1)",
                transition: "transform 0.3s cubic-bezier(0.22, 1, 0.36, 1)",
              }}
            >
              <ShoppingCart size={16} />
              Giỏ hàng
              {cartCount > 0 && (
                <span className="pulse" style={{
                  background: C.amber,
                  color: C.forest,
                  borderRadius: "999px",
                  fontSize: "11px",
                  fontWeight: 700,
                  padding: "2px 7px",
                  marginLeft: "2px",
                  minWidth: "18px",
                  textAlign: "center",
                }}>
                  {cartCount}
                </span>
              )}
            </button>
          </nav>
        </div>
      </header>

      {/* VIEWS */}
      {view === "shop" && <ShopView products={filtered} allCount={(products || []).length} search={search} setSearch={setSearch} cat={cat} setCat={setCat} onAdd={addToCart} />}
      {view === "orders" && <OrdersMineView orders={myOrders} onBrowse={() => setView("shop")} />}
      {view === "admin" && (
        <AdminView
          authed={adminAuthed} pwInput={pwInput} setPwInput={setPwInput} pwError={pwError}
          onLogin={() => { if (pwInput === "admin123") { setAdminAuthed(true); setPwError(false); showToast("Đăng nhập thành công"); } else { setPwError(true); } }}
          products={products || []} orders={orders || []}
          onDelete={deleteProduct}
          onEdit={(product) => { setEditingProduct(product); setShowForm(true); }}
          onAddNew={() => { setEditingProduct(null); setShowForm(true); }}
          onStatusChange={updateOrderStatus}
        />
      )}

      {/* PRODUCT FORM MODAL */}
      {showForm && <ProductFormModal initial={editingProduct} onCancel={() => { setShowForm(false); setEditingProduct(null); }} onSave={upsertProduct} />}

      {/* CART DRAWER */}
      {cartOpen && (
        <CartDrawer
          step={checkoutStep} items={cartItems} total={cartTotal} buyer={buyer} setBuyer={setBuyer}
          onClose={() => { setCartOpen(false); if (checkoutStep === "done") resetCheckout(); }}
          onChangeQty={changeQty} onRemove={removeFromCart}
          onCheckout={() => setCheckoutStep("form")}
          onBackToCart={() => setCheckoutStep("cart")}
          onPlaceOrder={placeOrder} onDone={resetCheckout}
        />
      )}

      {/* TOAST */}
      {toast && (
        <div className="toast-enter" style={{
          position: "fixed",
          bottom: "28px",
          left: "50%",
          transform: "translateX(-50%)",
          background: C.forest,
          backdropFilter: "blur(12px)",
          color: "white",
          padding: "12px 22px",
          borderRadius: "14px",
          fontSize: "14px",
          fontWeight: 500,
          boxShadow: "0 8px 30px rgba(0,0,0,0.2)",
          zIndex: 100,
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}>
          <Sprout size={16} />
          {toast}
        </div>
      )}
    </div>
  );
}

// ============================================================
// NAV BUTTON
// ============================================================

function NavButton({ active, onClick, icon, label }) {
  return (
    <button
      onClick={onClick}
      className={`nav-btn ${active ? "active" : ""}`}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "6px",
        background: active ? C.mossLight : "transparent",
        color: active ? C.forest : C.inkSoft,
        border: "none",
        borderRadius: "10px",
        padding: "9px 14px",
        fontSize: "14px",
        fontWeight: active ? 600 : 500,
        cursor: "pointer",
      }}
    >
      {icon}
      {label}
    </button>
  );
}

// ============================================================
// SHOP VIEW
// ============================================================

function ShopView({ products, allCount, search, setSearch, cat, setCat, onAdd }) {
  return (
    <div style={{ maxWidth: "1080px", margin: "0 auto", padding: "0 20px 60px" }}>

      {/* HERO */}
      <div style={{
        textAlign: "center",
        padding: "52px 20px 40px",
        position: "relative",
        animation: "fadeSlideUp 0.6s ease-out",
      }}>
        {/* Decorative circles */}
        <div style={{
          position: "absolute",
          top: "20px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "200px",
          height: "200px",
          borderRadius: "50%",
          background: `radial-gradient(circle, ${C.mossLight} 0%, transparent 70%)`,
          opacity: 0.5,
          pointerEvents: "none",
        }} />

        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", justifyContent: "center", gap: "12px", marginBottom: "18px" }}>
            <span className="icon-float" style={{ fontSize: "28px" }}>🌿</span>
            <span className="icon-float" style={{ fontSize: "36px" }}>🪴</span>
            <span className="icon-float" style={{ fontSize: "28px" }}>🌱</span>
          </div>

          <h1 style={{
            fontFamily: FONT_D,
            fontSize: "clamp(28px, 5vw, 40px)",
            fontWeight: 700,
            color: C.forest,
            margin: 0,
            lineHeight: 1.2,
            letterSpacing: "-0.5px",
          }}>
            Cây xanh cho góc nhỏ
            <br />
            <span style={{ color: C.moss }}>của bạn</span>
          </h1>

          <p style={{
            color: C.inkSoft,
            marginTop: "14px",
            fontSize: "15px",
            maxWidth: "420px",
            marginLeft: "auto",
            marginRight: "auto",
            lineHeight: 1.6,
          }}>
            <span style={{ fontWeight: 600, color: C.forest }}>{allCount} loại cây và chậu</span> đang có sẵn
            <br />
            Chọn lọc tỉ mỉ · Giao tận nơi trong ngày
          </p>

          <div style={{
            display: "flex",
            justifyContent: "center",
            gap: "24px",
            marginTop: "20px",
            color: C.inkMuted,
            fontSize: "13px",
          }}>
            <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Sun size={14} color={C.amber} /> Cây khoẻ mạnh
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Droplets size={14} color={C.water} /> Hướng dẫn chăm sóc
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Truck size={14} color={C.moss} /> Giao nhanh
            </span>
          </div>
        </div>
      </div>

      {/* SEARCH + FILTERS */}
      <div style={{
        display: "flex",
        gap: "12px",
        alignItems: "center",
        marginBottom: "24px",
        flexWrap: "wrap",
        animation: "fadeSlideUp 0.5s ease-out 0.1s both",
      }}>
        <div className="search-box" style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          background: C.surface,
          border: `1.5px solid ${C.line}`,
          borderRadius: "12px",
          padding: "10px 14px",
          flex: "1 1 240px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
        }}>
          <Search size={17} color={C.inkMuted} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm tên cây, chậu..."
            style={{
              border: "none",
              outline: "none",
              fontSize: "14px",
              flex: 1,
              background: "transparent",
              fontFamily: FONT_B,
              color: C.ink,
            }}
          />
        </div>

        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          {CATS.map((c) => (
            <button
              key={c}
              className="cat-pill"
              onClick={() => setCat(c)}
              style={{
                border: `1.5px solid ${cat === c ? C.forest : C.line}`,
                background: cat === c ? C.forest : C.surface,
                color: cat === c ? "white" : C.inkSoft,
                borderRadius: "999px",
                padding: "8px 16px",
                fontSize: "13px",
                fontWeight: cat === c ? 600 : 500,
                cursor: "pointer",
              }}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* PRODUCTS GRID */}
      {products.length === 0 ? (
        <div style={{
          padding: "70px 0",
          textAlign: "center",
          color: C.inkSoft,
          animation: "fadeIn 0.5s ease",
        }}>
          <Leaf size={40} color={C.line} style={{ marginBottom: "12px" }} />
          <p>Không tìm thấy sản phẩm phù hợp.</p>
        </div>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
          gap: "20px",
        }}>
          {products.map((p) => (
            <div key={p.id} className="product-card" style={{
              background: C.surface,
              border: `1px solid ${C.lineSoft}`,
              borderRadius: "16px",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              boxShadow: C.shadow,
            }}>
              {/* Card Icon Area */}
              <div style={{
                background: `linear-gradient(145deg, ${C.mossPale} 0%, ${C.mossLight} 100%)`,
                height: "130px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "52px",
                position: "relative",
                overflow: "hidden",
              }}>
                {/* Decorative corner leaf */}
                <div style={{
                  position: "absolute",
                  top: "-8px",
                  right: "-8px",
                  fontSize: "24px",
                  opacity: 0.15,
                  transform: "rotate(45deg)",
                }}>🌿</div>
                <span className="icon-float">{p.icon}</span>

                {/* Out of stock overlay */}
                {p.stock === 0 && (
                  <div style={{
                    position: "absolute",
                    inset: 0,
                    background: "rgba(255,255,255,0.7)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}>
                    <span className="pulse" style={{
                      background: C.clay,
                      color: "white",
                      padding: "6px 14px",
                      borderRadius: "8px",
                      fontSize: "12px",
                      fontWeight: 700,
                    }}>
                      Hết hàng
                    </span>
                  </div>
                )}
              </div>

              {/* Card Content */}
              <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "6px", flex: 1 }}>
                <span style={{ fontSize: "11px", color: C.moss, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  {p.category}
                </span>

                <h3 style={{
                  fontFamily: FONT_D,
                  fontSize: "17px",
                  margin: 0,
                  color: C.ink,
                  fontWeight: 600,
                  lineHeight: 1.3,
                }}>
                  {p.name}
                </h3>

                <p style={{ fontSize: "13px", color: C.inkSoft, margin: 0, lineHeight: 1.5, flex: 1 }}>
                  {p.desc}
                </p>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "8px" }}>
                  <span style={{ fontWeight: 700, color: C.forest, fontSize: "16px", fontFamily: FONT_D }}>
                    {formatVND(p.price)}
                  </span>
                  {p.stock > 0 && (
                    <span style={{ fontSize: "12px", color: C.inkMuted, display: "flex", alignItems: "center", gap: "4px" }}>
                      <Package size={12} /> Còn {p.stock}
                    </span>
                  )}
                </div>

                <button
                  className="btn-nature"
                  onClick={() => onAdd(p.id)}
                  disabled={p.stock === 0}
                  style={{
                    marginTop: "8px",
                    background: p.stock === 0 ? C.line : `linear-gradient(135deg, ${C.forest} 0%, ${C.forestMid} 100%)`,
                    color: p.stock === 0 ? C.inkMuted : "white",
                    border: "none",
                    borderRadius: "10px",
                    padding: "10px",
                    fontSize: "13px",
                    fontWeight: 600,
                    cursor: p.stock === 0 ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                  }}
                >
                  {p.stock === 0 ? "Hết hàng" : <><Plus size={15} /> Thêm vào giỏ</>}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================
// CART DRAWER
// ============================================================

function CartDrawer({ step, items, total, buyer, setBuyer, onClose, onChangeQty, onRemove, onCheckout, onBackToCart, onPlaceOrder, onDone }) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", justifyContent: "flex-end" }}>
      <div className="cart-backdrop" onClick={onClose} style={{
        position: "absolute",
        inset: 0,
        background: "rgba(26,58,42,0.3)",
        backdropFilter: "blur(4px)",
      }} />

      <div className="cart-drawer" style={{
        position: "relative",
        width: "400px",
        maxWidth: "94vw",
        background: C.surface,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        fontFamily: FONT_B,
        boxShadow: "-12px 0 40px rgba(26,58,42,0.1)",
      }}>
        {/* Header */}
        <div style={{
          padding: "20px",
          borderBottom: `1px solid ${C.lineSoft}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}>
          <h2 style={{ fontFamily: FONT_D, fontSize: "20px", margin: 0, color: C.forest, fontWeight: 700, display: "flex", alignItems: "center", gap: "8px" }}>
            {step === "cart" && <><ShoppingCart size={20} /> Giỏ hàng</>}
            {step === "form" && <><Truck size={20} /> Thông tin giao hàng</>}
            {step === "done" && <><CircleCheck size={20} /> Đặt hàng thành công</>}
          </h2>
          <button onClick={onClose} className="icon-btn" style={{ background: "none", border: "none", cursor: "pointer", color: C.inkSoft }}>
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>

          {/* CART STEP */}
          {step === "cart" && (items.length === 0 ? (
            <div style={{ textAlign: "center", padding: "50px 0", animation: "fadeIn 0.4s ease" }}>
              <div className="icon-float" style={{ fontSize: "48px", marginBottom: "14px" }}>🛒</div>
              <p style={{ color: C.inkSoft, fontSize: "14px" }}>Giỏ hàng đang trống</p>
              <p style={{ color: C.inkMuted, fontSize: "13px", marginTop: "4px" }}>Hãy chọn vài cây xanh nào!</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {items.map((item) => (
                <div key={item.id} className="cart-item" style={{
                  display: "flex",
                  gap: "12px",
                  alignItems: "center",
                  background: C.mossPale,
                  borderRadius: "12px",
                  padding: "12px",
                }}>
                  <div style={{ fontSize: "30px", width: "44px", height: "44px", display: "flex", alignItems: "center", justifyContent: "center", background: C.mossLight, borderRadius: "10px" }}>
                    {item.icon}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "14px", fontWeight: 600, color: C.ink }}>{item.name}</div>
                    <div style={{ fontSize: "13px", color: C.moss, fontWeight: 500 }}>{formatVND(item.price)}</div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <button className="qty-btn" onClick={() => onChangeQty(item.id, -1)} style={{
                      width: "26px", height: "26px", borderRadius: "8px",
                      border: `1.5px solid ${C.line}`, background: C.surface,
                      display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
                    }}>
                      <Minus size={13} />
                    </button>
                    <span style={{ fontSize: "14px", width: "20px", textAlign: "center", fontWeight: 600 }}>{item.qty}</span>
                    <button className="qty-btn" onClick={() => onChangeQty(item.id, 1)} style={{
                      width: "26px", height: "26px", borderRadius: "8px",
                      border: `1.5px solid ${C.line}`, background: C.surface,
                      display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
                    }}>
                      <Plus size={13} />
                    </button>
                  </div>

                  <button className="icon-btn danger" onClick={() => onRemove(item.id)} style={{ background: "none", border: "none", cursor: "pointer", color: C.inkMuted }}>
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          ))}

          {/* FORM STEP */}
          {step === "form" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "14px", animation: "fadeSlideLeft 0.4s ease-out" }}>
              <Field label="Họ tên" value={buyer.name} onChange={(value) => setBuyer({ ...buyer, name: value })} />
              <Field label="Số điện thoại" value={buyer.phone} onChange={(value) => setBuyer({ ...buyer, phone: value })} />
              <Field label="Địa chỉ giao hàng" value={buyer.address} onChange={(value) => setBuyer({ ...buyer, address: value })} multiline />
            </div>
          )}

          {/* DONE STEP */}
          {step === "done" && (
            <div style={{ textAlign: "center", padding: "40px 0", animation: "scaleIn 0.5s ease-out" }}>
              <div style={{
                width: "64px", height: "64px", borderRadius: "50%",
                background: `linear-gradient(135deg, ${C.mossLight} 0%, ${C.mossPale} 100%)`,
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 18px",
                boxShadow: `0 0 0 8px ${C.mossPale}`,
              }}>
                <Check size={32} color={C.forest} strokeWidth={2.5} />
              </div>
              <h3 style={{ fontFamily: FONT_D, fontSize: "20px", color: C.forest, margin: "0 0 8px" }}>Cảm ơn bạn!</h3>
              <p style={{ fontSize: "14px", color: C.inkSoft, lineHeight: 1.6 }}>
                Đơn hàng đã được ghi nhận.
                <br />
                Xem lại tại mục <strong>"Đơn của tôi"</strong>.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        {step !== "done" && (
          <div style={{ padding: "20px", borderTop: `1px solid ${C.lineSoft}`, background: C.mossPale }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "14px", fontSize: "15px", fontWeight: 600 }}>
              <span>Tổng cộng</span>
              <span style={{ color: C.forest, fontFamily: FONT_D, fontSize: "18px" }}>{formatVND(total)}</span>
            </div>

            {step === "cart" ? (
              <button className="btn-nature" disabled={items.length === 0} onClick={onCheckout} style={{
                width: "100%",
                background: items.length === 0 ? C.line : `linear-gradient(135deg, ${C.forest} 0%, ${C.forestMid} 100%)`,
                color: items.length === 0 ? C.inkMuted : "white",
                border: "none", borderRadius: "12px", padding: "14px", fontSize: "14px", fontWeight: 600,
                cursor: items.length === 0 ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
              }}>
                Tiến hành đặt hàng <ChevronRight size={16} />
              </button>
            ) : (
              <div style={{ display: "flex", gap: "8px" }}>
                <button onClick={onBackToCart} className="btn-nature" style={{
                  flex: 1, background: C.surface, border: `1.5px solid ${C.line}`,
                  borderRadius: "12px", padding: "14px", fontSize: "14px", cursor: "pointer", fontWeight: 500,
                }}>
                  Quay lại
                </button>
                <button onClick={onPlaceOrder} className="btn-nature" style={{
                  flex: 2, background: `linear-gradient(135deg, ${C.forest} 0%, ${C.forestMid} 100%)`,
                  color: "white", border: "none", borderRadius: "12px", padding: "14px",
                  fontSize: "14px", fontWeight: 600, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
                }}>
                  <Check size={16} /> Xác nhận đặt hàng
                </button>
              </div>
            )}
          </div>
        )}

        {step === "done" && (
          <div style={{ padding: "20px", borderTop: `1px solid ${C.lineSoft}` }}>
            <button onClick={onDone} className="btn-nature" style={{
              width: "100%",
              background: `linear-gradient(135deg, ${C.forest} 0%, ${C.forestMid} 100%)`,
              color: "white", border: "none", borderRadius: "12px", padding: "14px",
              fontSize: "14px", fontWeight: 600, cursor: "pointer",
            }}>
              Tiếp tục mua sắm 🌿
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// FIELD
// ============================================================

function Field({ label, value, onChange, multiline }) {
  const Tag = multiline ? "textarea" : "input";
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "13px", color: C.inkSoft, fontWeight: 500 }}>
      {label}
      <Tag
        className="field-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={multiline ? 3 : undefined}
        style={{
          border: `1.5px solid ${C.line}`,
          borderRadius: "10px",
          padding: "11px 13px",
          fontSize: "14px",
          fontFamily: FONT_B,
          resize: multiline ? "vertical" : undefined,
          color: C.ink,
          background: C.surface,
        }}
      />
    </label>
  );
}

// ============================================================
// MY ORDERS
// ============================================================

function OrdersMineView({ orders, onBrowse }) {
  return (
    <div style={{ maxWidth: "720px", margin: "0 auto", padding: "40px 20px 60px" }}>
      <h1 style={{
        fontFamily: FONT_D, fontSize: "28px", color: C.forest, marginBottom: "6px",
        fontWeight: 700, animation: "fadeSlideUp 0.5s ease-out",
      }}>
        Đơn hàng của tôi
      </h1>
      <p style={{ color: C.inkMuted, fontSize: "14px", marginBottom: "24px", animation: "fadeSlideUp 0.5s ease-out 0.05s both" }}>
        Theo dõi tình trạng đơn hàng của bạn
      </p>

      {orders.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: C.inkSoft, animation: "fadeIn 0.5s ease" }}>
          <div className="icon-float" style={{ fontSize: "48px", marginBottom: "14px" }}>📦</div>
          <p style={{ marginBottom: "16px", fontSize: "15px" }}>Bạn chưa đặt đơn hàng nào.</p>
          <button onClick={onBrowse} className="btn-nature" style={{
            background: `linear-gradient(135deg, ${C.forest} 0%, ${C.forestMid} 100%)`,
            color: "white", border: "none", borderRadius: "12px", padding: "12px 22px",
            cursor: "pointer", fontSize: "14px", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: "6px",
          }}>
            <Store size={16} /> Xem cửa hàng
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {orders.map((order) => {
            const st = getStatusStyle(order.status);
            const StatusIcon = st.icon;
            return (
              <div key={order.id} className="order-card" style={{
                background: C.surface,
                border: `1px solid ${C.lineSoft}`,
                borderRadius: "14px",
                padding: "18px",
                boxShadow: C.shadow,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px", alignItems: "center" }}>
                  <span style={{ fontSize: "12px", color: C.inkMuted }}>Mã đơn: {order.id}</span>
                  <span style={{
                    background: st.bg, color: st.color,
                    padding: "4px 12px", borderRadius: "999px",
                    fontSize: "12px", fontWeight: 600,
                    display: "flex", alignItems: "center", gap: "5px",
                  }}>
                    <StatusIcon size={13} /> {order.status}
                  </span>
                </div>

                {(order.items || []).map((item, index) => (
                  <div key={`${order.id}-${item.productId}-${index}`} style={{
                    display: "flex", justifyContent: "space-between", fontSize: "14px", padding: "4px 0",
                  }}>
                    <span style={{ color: C.ink }}>{item.name} × {item.qty}</span>
                    <span style={{ color: C.inkSoft, fontWeight: 500 }}>{formatVND(item.price * item.qty)}</span>
                  </div>
                ))}

                <div style={{
                  borderTop: `1px solid ${C.lineSoft}`, marginTop: "10px", paddingTop: "10px",
                  display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: "15px",
                }}>
                  <span>Tổng</span>
                  <span style={{ color: C.forest, fontFamily: FONT_D }}>{formatVND(order.total)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ============================================================
// ADMIN
// ============================================================

function AdminView({ authed, pwInput, setPwInput, pwError, onLogin, products, orders, onDelete, onEdit, onAddNew, onStatusChange }) {

  // LOGIN SCREEN
  if (!authed) {
    return (
      <div style={{
        maxWidth: "380px", margin: "80px auto", padding: "0 20px", textAlign: "center",
        animation: "fadeSlideUp 0.5s ease-out",
      }}>
        <div style={{
          width: "64px", height: "64px", borderRadius: "50%",
          background: `linear-gradient(135deg, ${C.mossLight} 0%, ${C.mossPale} 100%)`,
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 16px",
          boxShadow: `0 0 0 8px ${C.mossPale}`,
        }}>
          <Lock size={28} color={C.forest} />
        </div>

        <h2 style={{ fontFamily: FONT_D, fontSize: "22px", color: C.forest, marginBottom: "6px", fontWeight: 700 }}>
          Đăng nhập quản trị
        </h2>
        <p style={{ fontSize: "13px", color: C.inkMuted, marginBottom: "20px" }}>
          Mật khẩu demo: <code style={{ background: C.mossPale, padding: "2px 8px", borderRadius: "4px", fontSize: "12px", color: C.forest }}>admin123</code>
        </p>

        <input
          type="password"
          value={pwInput}
          onChange={(e) => setPwInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") onLogin(); }}
          placeholder="Mật khẩu"
          className={`field-input ${pwError ? "shake" : ""}`}
          style={{
            width: "100%",
            border: `1.5px solid ${pwError ? C.clay : C.line}`,
            borderRadius: "12px", padding: "12px 14px",
            fontSize: "14px", marginBottom: "10px", fontFamily: FONT_B, color: C.ink,
          }}
        />

        {pwError && (
          <p style={{ color: C.clay, fontSize: "12px", marginBottom: "10px", animation: "fadeIn 0.3s ease" }}>
            Sai mật khẩu, thử lại.
          </p>
        )}

        <button onClick={onLogin} className="btn-nature" style={{
          width: "100%",
          background: `linear-gradient(135deg, ${C.forest} 0%, ${C.forestMid} 100%)`,
          color: "white", border: "none", borderRadius: "12px", padding: "13px",
          cursor: "pointer", fontSize: "14px", fontWeight: 600,
        }}>
          Đăng nhập
        </button>
      </div>
    );
  }

  // DASHBOARD
  return (
    <div style={{ maxWidth: "1080px", margin: "0 auto", padding: "36px 20px 60px" }}>

      {/* HEADER */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        marginBottom: "24px", gap: "12px", flexWrap: "wrap",
        animation: "fadeSlideUp 0.5s ease-out",
      }}>
        <div>
          <h1 style={{ fontFamily: FONT_D, fontSize: "28px", color: C.forest, margin: 0, fontWeight: 700 }}>
            Quản lý sản phẩm
          </h1>
          <p style={{ color: C.inkMuted, fontSize: "14px", marginTop: "4px" }}>
            {products.length} sản phẩm · {orders.length} đơn hàng
          </p>
        </div>

        <button onClick={onAddNew} className="btn-nature" style={{
          background: `linear-gradient(135deg, ${C.forest} 0%, ${C.forestMid} 100%)`,
          color: "white", border: "none", borderRadius: "12px", padding: "10px 16px",
          display: "flex", alignItems: "center", gap: "7px", cursor: "pointer", fontSize: "13px", fontWeight: 600,
        }}>
          <Plus size={16} /> Thêm sản phẩm
        </button>
      </div>

      {/* PRODUCT TABLE */}
      <div style={{
        background: C.surface,
        border: `1px solid ${C.lineSoft}`,
        borderRadius: "14px",
        overflow: "auto",
        marginBottom: "40px",
        boxShadow: C.shadow,
        animation: "fadeSlideUp 0.5s ease-out 0.1s both",
      }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", minWidth: "700px" }}>
          <thead>
            <tr style={{ background: C.mossPale, textAlign: "left" }}>
              <th style={thStyle}></th>
              <th style={thStyle}>Tên</th>
              <th style={thStyle}>Danh mục</th>
              <th style={thStyle}>Giá</th>
              <th style={thStyle}>Tồn kho</th>
              <th style={thStyle}></th>
            </tr>
          </thead>
          <tbody>
            {(products || []).map((product) => (
              <tr key={product.id} className="admin-row" style={{ borderTop: `1px solid ${C.lineSoft}` }}>
                <td style={{ ...tdStyle, fontSize: "22px" }}>{product.icon}</td>
                <td style={{ ...tdStyle, fontWeight: 600, color: C.ink }}>{product.name}</td>
                <td style={tdStyle}>
                  <span style={{ background: C.mossLight, color: C.forest, padding: "3px 10px", borderRadius: "999px", fontSize: "12px", fontWeight: 500 }}>
                    {product.category}
                  </span>
                </td>
                <td style={{ ...tdStyle, fontFamily: FONT_D, fontWeight: 600, color: C.forest }}>{formatVND(product.price)}</td>
                <td style={tdStyle}>
                  <span style={{
                    color: product.stock > 0 ? C.ink : C.clay,
                    fontWeight: product.stock === 0 ? 600 : 400,
                  }}>
                    {product.stock}
                  </span>
                </td>
                <td style={{ ...tdStyle, display: "flex", gap: "4px" }}>
                  <button onClick={() => onEdit(product)} className="icon-btn" style={{ background: "none", border: "none", cursor: "pointer", color: C.inkSoft }} title="Sửa">
                    <Pencil size={15} />
                  </button>
                  <button onClick={() => onDelete(product.id)} className="icon-btn danger" style={{ background: "none", border: "none", cursor: "pointer", color: C.inkMuted }} title="Xóa">
                    <Trash2 size={15} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ORDERS SECTION */}
      <h2 style={{
        fontFamily: FONT_D, fontSize: "24px", color: C.forest,
        marginBottom: "16px", fontWeight: 700,
        animation: "fadeSlideUp 0.5s ease-out 0.2s both",
      }}>
        Đơn hàng ({orders.length})
      </h2>

      {orders.length === 0 ? (
        <p style={{ color: C.inkSoft, fontSize: "14px" }}>Chưa có đơn hàng nào.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {orders.map((order) => {
            const st = getStatusStyle(order.status);
            const StatusIcon = st.icon;
            return (
              <div key={order.id} className="order-card" style={{
                background: C.surface,
                border: `1px solid ${C.lineSoft}`,
                borderRadius: "14px",
                padding: "16px",
                boxShadow: C.shadow,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "10px", marginBottom: "8px" }}>
                  <div>
                    <div style={{ fontSize: "14px", fontWeight: 600, display: "flex", alignItems: "center", gap: "6px" }}>
                      {order.buyer?.name} · {order.buyer?.phone}
                    </div>
                    <div style={{ fontSize: "12px", color: C.inkMuted, marginTop: "2px" }}>
                      {order.buyer?.address}
                    </div>
                  </div>
                  <select
                    className="status-select"
                    value={order.status}
                    onChange={(e) => onStatusChange(order.id, e.target.value)}
                    style={{
                      border: `1.5px solid ${st.color}30`,
                      borderRadius: "10px",
                      padding: "6px 10px",
                      fontSize: "12px",
                      fontWeight: 600,
                      height: "fit-content",
                      background: st.bg,
                      color: st.color,
                      cursor: "pointer",
                    }}
                  >
                    <option>Chờ xử lý</option>
                    <option>Đang giao</option>
                    <option>Hoàn tất</option>
                    <option>Đã huỷ</option>
                  </select>
                </div>

                <div style={{ fontSize: "13px", color: C.inkSoft }}>
                  {(order.items || []).map((item) => `${item.name} ×${item.qty}`).join(", ")}
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "8px" }}>
                  <span style={{ fontWeight: 700, color: C.forest, fontSize: "14px", fontFamily: FONT_D }}>{formatVND(order.total)}</span>
                  <span style={{ fontSize: "11px", color: C.inkMuted }}>
                    Mã: {order.id} {order.createdAt ? ` · ${new Date(order.createdAt).toLocaleString("vi-VN")}` : ""}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ============================================================
// TABLE STYLES
// ============================================================

const thStyle = { padding: "12px 14px", fontWeight: 600, color: C.forest, fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px" };
const tdStyle = { padding: "12px 14px", verticalAlign: "middle" };

// ============================================================
// PRODUCT FORM MODAL
// ============================================================

function ProductFormModal({ initial, onCancel, onSave }) {
  const [form, setForm] = useState(
    initial || { name: "", desc: "", price: "", category: CATS[1], stock: "", icon: "🌿" }
  );

  function set(key, value) { setForm((current) => ({ ...current, [key]: value })); }

  function handleSubmit() {
    if (!form.name.trim()) { alert("Vui lòng nhập tên sản phẩm"); return; }
    if (form.price === "" || Number(form.price) < 0) { alert("Vui lòng nhập giá sản phẩm"); return; }
    if (form.stock === "" || Number(form.stock) < 0) { alert("Vui lòng nhập tồn kho"); return; }
    onSave({ ...form, price: Number(form.price), stock: Number(form.stock), icon: form.icon || "🌱" });
  }

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 60,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: FONT_B,
    }}>
      <div className="cart-backdrop" onClick={onCancel} style={{
        position: "absolute", inset: 0, background: "rgba(26,58,42,0.3)", backdropFilter: "blur(4px)",
      }} />

      <div className="modal-content" style={{
        position: "relative",
        background: C.surface,
        borderRadius: "18px",
        padding: "28px",
        width: "440px",
        maxWidth: "92vw",
        maxHeight: "85vh",
        overflowY: "auto",
        boxShadow: C.shadowFloat,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h3 style={{ fontFamily: FONT_D, fontSize: "20px", color: C.forest, margin: 0, fontWeight: 700 }}>
            {initial ? "Sửa sản phẩm" : "Thêm sản phẩm mới"}
          </h3>
          <button onClick={onCancel} className="icon-btn" style={{ background: "none", border: "none", cursor: "pointer" }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <Field label="Tên sản phẩm" value={form.name} onChange={(value) => set("name", value)} />
          <Field label="Mô tả" value={form.desc} onChange={(value) => set("desc", value)} multiline />

          <div style={{ display: "flex", gap: "12px" }}>
            <div style={{ flex: 1 }}>
              <Field label="Giá (đ)" value={form.price} onChange={(value) => set("price", value.replace(/\D/g, ""))} />
            </div>
            <div style={{ flex: 1 }}>
              <Field label="Tồn kho" value={form.stock} onChange={(value) => set("stock", value.replace(/\D/g, ""))} />
            </div>
          </div>

          <label style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "13px", color: C.inkSoft, fontWeight: 500 }}>
            Danh mục
            <select
              className="field-input"
              value={form.category}
              onChange={(e) => set("category", e.target.value)}
              style={{
                border: `1.5px solid ${C.line}`, borderRadius: "10px", padding: "11px 13px",
                fontSize: "14px", background: C.surface, color: C.ink, cursor: "pointer",
              }}
            >
              {CATS.filter((c) => c !== "Tất cả").map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </label>

          <Field label="Icon (emoji)" value={form.icon} onChange={(value) => set("icon", value)} />

          <button onClick={handleSubmit} className="btn-nature" style={{
            marginTop: "6px",
            background: `linear-gradient(135deg, ${C.forest} 0%, ${C.forestMid} 100%)`,
            color: "white", border: "none", borderRadius: "12px", padding: "13px",
            cursor: "pointer", fontWeight: 600, fontSize: "14px",
            display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
          }}>
            {initial ? <><Check size={16} /> Lưu thay đổi</> : <><Plus size={16} /> Thêm sản phẩm</>}
          </button>
        </div>
      </div>
    </div>
  );
}