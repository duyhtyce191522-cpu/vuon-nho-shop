import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Check,
  ClipboardList,
  Leaf,
  LockKeyhole,
  Minus,
  PackageCheck,
  Pencil,
  Plus,
  Settings2,
  ShoppingBag,
  ShoppingCart,
  Sprout,
  Trash2,
  X,
} from "lucide-react";

import GardenShop from './components/GardenShop';
import ProductArt from './components/ProductArt';
import AuthModal from './components/AuthModal';
import { LogIn, LogOut, User, UserPlus } from "lucide-react";
import { normalizeName } from './lib/productVisual';
import { authenticateUser } from './lib/userDatabase';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
const CATEGORIES = ["Tất cả", "Cây lớn", "Cây leo", "Sen đá", "Chậu & phụ kiện"];
const SEED_PRODUCTS = [
  { id: "p1", name: "Trầu bà Nam Mỹ", desc: "Mỗi sớm mai, bé Monstera lại háo hức xòe chiếc lá to bản đón nắng sớm. Ước mơ lớn nhất của bé là biến góc phòng bạn thành một khu rừng nhiệt đới ngập tràn tiếng cười.", price: 185000, category: "Cây lớn", stock: 8, icon: "🌿" },
  { id: "p2", name: "Sen đá Ngọc Lan", desc: "Chiếc búp nhỏ kiên cường khẽ cuộn mình e ấp, chỉ cần một ngụm nước mỗi tuần là đủ vui vẻ tỏa hương sắc dịu dàng bên bàn làm việc của bạn.", price: 45000, category: "Sen đá", stock: 24, icon: "🌵" },
  { id: "p3", name: "Lưỡi hổ vàng", desc: "Chàng dũng sĩ khoác áo sọc vàng luôn đứng gác âm thầm góc phòng, lọc sạch bụi bẩn suốt đêm để trao cho bạn một giấc ngủ thật an yên.", price: 95000, category: "Cây lớn", stock: 15, icon: "🪴" },
  { id: "p4", name: "Xương rồng tai thỏ", desc: "Hai chiếc tai thỏ xanh mướt lúc nào cũng vểnh lên nghe ngóng. Nhiệm vụ tối cao của bé là nhắc bạn uống nước đúng giờ và thư giãn sau giờ chạy deadline.", price: 39000, category: "Sen đá", stock: 30, icon: "🌵" },
  { id: "p5", name: "Trầu bà lá phượng", desc: "Nàng thơ tóc dài buông lơi mềm mại bên kệ sách, khẽ đung đưa theo từng cơn gió thoảng và lắng nghe tiếng lật sách thì thầm mỗi chiều mưa.", price: 68000, category: "Cây leo", stock: 12, icon: "🌱" },
  { id: "p6", name: "Chậu gốm nung tay", desc: "Món quà nung ấm từ đất mẹ với đôi má hồng mộc mạc, luôn mở rộng vòng tay để ủ ấm bộ rễ và nâng niu từng mầm xanh nhỏ bé lớn khôn.", price: 55000, category: "Chậu & phụ kiện", stock: 20, icon: "🏺" },
];

const formatVND = (value) => `${Number(value || 0).toLocaleString("vi-VN")}đ`;
const uid = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;

function App() {
  const [view, setView] = useState("shop");
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [cart, setCart] = useState({});
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState("cart");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Tất cả");
  const [buyer, setBuyer] = useState({ name: "", phone: "", address: "" });
  const [myOrderIds, setMyOrderIds] = useState(() => {
    try { return JSON.parse(localStorage.getItem("my-order-ids") || "[]"); } catch { return []; }
  });
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null);
  // User Authentication State
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem("vuon-nho-user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState("login");

  const [adminAuthed, setAdminAuthed] = useState(() => {
    try {
      const saved = localStorage.getItem("vuon-nho-user");
      const user = saved ? JSON.parse(saved) : null;
      return user?.role === "admin";
    } catch {
      return false;
    }
  });

  function handleLoginSuccess(user, token) {
    setCurrentUser(user);
    try {
      localStorage.setItem("vuon-nho-user", JSON.stringify(user));
      if (token) localStorage.setItem("vuon-nho-token", token);
    } catch {}

    if (user.role === "admin") {
      setAdminAuthed(true);
      setView("admin"); // Chuyển hướng trực tiếp vào trang quản trị của Admin
      notify("Chào mừng Quản trị viên " + (user.full_name || user.username) + " đến với Studio Quản trị! 🛡️");
    } else {
      setAdminAuthed(false);
      setView("shop"); // Chuyển hướng trực tiếp vào trang cửa hàng của Khách
      notify("Chào mừng " + (user.full_name || user.username) + " đến với Vườn Nhỏ! 🌱");
    }

    if (user.full_name || user.phone || user.address) {
      setBuyer((prev) => ({
        name: user.full_name || user.username || prev.name,
        phone: user.phone || prev.phone,
        address: user.address || prev.address,
      }));
    }
  }

  function handleLogout() {
    setCurrentUser(null);
    setAdminAuthed(false);
    try {
      localStorage.removeItem("vuon-nho-user");
      localStorage.removeItem("vuon-nho-token");
    } catch {}
    if (view === "admin") setView("shop");
    notify("Đã đăng xuất tài khoản");
  }
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showProductForm, setShowProductForm] = useState(false);

  const notify = (message) => {
    setToast(message);
    window.clearTimeout(window.__vuonNhoToast);
    window.__vuonNhoToast = window.setTimeout(() => setToast(""), 2800);
  };

  async function loadProducts() {
    try {
      const response = await fetch(`${API_URL}/api/products`);
      if (!response.ok) throw new Error("products");
      const data = await response.json();
      setProducts(Array.isArray(data) ? data : SEED_PRODUCTS);
    } catch {
      setProducts(SEED_PRODUCTS);
      notify("Đang xem những sản phẩm mẫu của Vườn Nhỏ");
    }
  }

  async function loadOrders() {
    try {
      const response = await fetch(`${API_URL}/api/orders`);
      if (!response.ok) throw new Error("orders");
      const data = await response.json();
      const list = Array.isArray(data) ? data : [];
      setOrders(list);
      try { localStorage.setItem("vuon-nho-orders-cache", JSON.stringify(list)); } catch {}
    } catch {
      try {
        const cached = JSON.parse(localStorage.getItem("vuon-nho-orders-cache") || "[]");
        setOrders(Array.isArray(cached) ? cached : []);
      } catch {
        setOrders([]);
      }
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      Promise.all([loadProducts(), loadOrders()]).finally(() => setLoading(false));
    }, 0);
    return () => window.clearTimeout(timer);
    // These loaders intentionally run once when the storefront mounts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cartItems = useMemo(() => Object.entries(cart).map(([id, qty]) => {
    const product = products.find((item) => String(item.id) === String(id));
    return product ? { ...product, price: Number(product.price), stock: Number(product.stock), qty } : null;
  }).filter(Boolean), [cart, products]);
  const cartCount = cartItems.reduce((sum, item) => sum + item.qty, 0);
  const cartTotal = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);
  const filteredProducts = products.filter((product) => (
    (category === "Tất cả" || product.category === category) && normalizeName(product.name).includes(normalizeName(search))
  ));
  const myOrders = orders.filter((order) => myOrderIds.some((id) => String(id) === String(order.id)));

  function saveOrderIds(ids) {
    setMyOrderIds(ids);
    localStorage.setItem("my-order-ids", JSON.stringify(ids));
  }
  function addToCart(id) {
    const product = products.find((item) => String(item.id) === String(id));
    if (!product) return false;
    if ((cart[id] || 0) >= Number(product.stock)) { notify("Số lượng trong kho đã đạt tối đa"); return false; }
    setCart((current) => ({ ...current, [id]: (current[id] || 0) + 1 }));
    notify("Đã thêm vào giỏ hàng");
    return true;
  }
  function changeQty(id, delta) {
    const product = products.find((item) => String(item.id) === String(id));
    if (!product) return;
    setCart((current) => {
      const nextQty = Math.max(0, (current[id] || 0) + delta);
      if (delta > 0 && nextQty > Number(product.stock)) { notify("Đã đạt số lượng tồn kho"); return current; }
      const next = { ...current, [id]: nextQty };
      if (!nextQty) delete next[id];
      return next;
    });
  }
  function removeFromCart(id) {
    setCart((current) => { const next = { ...current }; delete next[id]; return next; });
  }
  async function placeOrder() {
    if (!buyer.name.trim() || !buyer.phone.trim() || !buyer.address.trim()) return notify("Bạn điền đủ thông tin nhận cây nhé");
    if (!cartItems.length) return notify("Giỏ hàng đang trống");
    const order = { id: Date.now(), userId: currentUser?.id || null, status: "Chờ xử lý", createdAt: new Date().toISOString(), items: cartItems.map((item) => ({ productId: item.id, name: item.name, price: item.price, qty: item.qty })), total: cartTotal, buyer: { name: buyer.name.trim(), phone: buyer.phone.trim(), address: buyer.address.trim() } };
    try {
      const response = await fetch(`${API_URL}/api/orders`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(order) });
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.message || "Không thể tạo đơn hàng");
      const newOrder = data || order;
      setOrders((current) => {
        const next = [newOrder, ...current];
        try { localStorage.setItem("vuon-nho-orders-cache", JSON.stringify(next)); } catch {}
        return next;
      });
      saveOrderIds([newOrder.id, ...myOrderIds]);
      setCart({});
      setCheckoutStep("done");
      await loadProducts();
      notify("Đơn hàng đã được gửi đến Vườn Nhỏ");
    } catch {
      const newOrder = order;
      setOrders((current) => {
        const next = [newOrder, ...current];
        try { localStorage.setItem("vuon-nho-orders-cache", JSON.stringify(next)); } catch {}
        return next;
      });
      saveOrderIds([newOrder.id, ...myOrderIds]);
      setCart({});
      setCheckoutStep("done");
      notify("Đơn hàng đã được gửi đến Vườn Nhỏ");
    }
  }
  function resetCheckout() { setCartOpen(false); setCheckoutStep("cart"); setBuyer({ name: "", phone: "", address: "" }); }
  async function loginAdmin() {
    try {
      let authed = false;
      const response = await fetch(`${API_URL}/api/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: "admin", password }),
      }).catch(() => null);

      if (response && response.ok) {
        const data = await response.json();
        if (data.success) authed = true;
      }

      if (!authed) {
        const check = await authenticateUser("admin", password);
        if (check.success && check.user.role === "admin") {
          authed = true;
          setCurrentUser(check.user);
          try {
            localStorage.setItem("vuon-nho-user", JSON.stringify(check.user));
          } catch {}
        }
      }

      if (!authed) throw new Error("Sai mật khẩu");
      setAdminAuthed(true);
      setPasswordError(false);
      notify("Chào mừng bạn trở lại Studio Quản trị! 🛡️");
    } catch {
      setPasswordError(true);
    }
  }
  async function deleteProduct(id) {
    if (!window.confirm("Bạn có chắc muốn xóa sản phẩm này?")) return;
    try {
      const response = await fetch(`${API_URL}/api/products/${id}`, { method: "DELETE" });
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.message || "Không thể xóa sản phẩm");
      setProducts((current) => current.filter((product) => String(product.id) !== String(id))); removeFromCart(id); notify("Đã xóa sản phẩm");
    } catch (error) { notify(error.message || "Xóa sản phẩm thất bại"); }
  }
  async function saveProduct(product) {
    const isEditing = Boolean(editingProduct); const url = isEditing ? `${API_URL}/api/products/${product.id}` : `${API_URL}/api/products`;
    try {
      const response = await fetch(url, { method: isEditing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...product, id: product.id || uid(), price: Number(product.price), stock: Number(product.stock) }) });
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.message || "Không thể lưu sản phẩm");
      await loadProducts(); setShowProductForm(false); setEditingProduct(null); notify(isEditing ? "Đã cập nhật sản phẩm" : "Đã thêm sản phẩm mới");
    } catch (error) { notify(error.message || "Lưu sản phẩm thất bại"); }
  }
  async function updateOrderStatus(id, status) {
    try {
      const response = await fetch(`${API_URL}/api/orders/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.message || "Không thể cập nhật đơn hàng");
      setOrders((current) => {
        const next = current.map((order) => String(order.id) === String(id) ? { ...order, ...data, status } : order);
        try { localStorage.setItem("vuon-nho-orders-cache", JSON.stringify(next)); } catch {}
        return next;
      });
      notify(`Đã cập nhật trạng thái đơn sang "${status}"`);
    } catch {
      setOrders((current) => {
        const next = current.map((order) => String(order.id) === String(id) ? { ...order, status } : order);
        try { localStorage.setItem("vuon-nho-orders-cache", JSON.stringify(next)); } catch {}
        return next;
      });
      notify(`Đã cập nhật trạng thái đơn sang "${status}"`);
    }
  }

  function deleteCancelledOrders() {
    const cancelledOrders = orders.filter((order) => (order.status || "").trim().toLowerCase() === "đã hủy");
    if (cancelledOrders.length === 0) {
      notify("Không có đơn hàng đã hủy nào để xóa");
      return;
    }
    const cancelledIds = cancelledOrders.map((o) => String(o.id));
    setConfirmDelete({
      title: `Xác nhận xóa ${cancelledOrders.length} đơn đã hủy?`,
      message: `Bạn có chắc chắn muốn xóa vĩnh viễn ${cancelledOrders.length} đơn hàng đã hủy này không? Dữ liệu đã xóa sẽ không thể phục hồi.`,
      onConfirm: async () => {
        try {
          await Promise.allSettled(
            cancelledIds.map((id) =>
              fetch(`${API_URL}/api/orders/${id}`, { method: "DELETE" }).catch(() => null)
            )
          );
        } catch {}

        const remainingOrders = orders.filter((order) => !cancelledIds.includes(String(order.id)));
        setOrders(remainingOrders);
        try {
          localStorage.setItem("vuon-nho-orders-cache", JSON.stringify(remainingOrders));
        } catch {}

        const remainingMyOrderIds = myOrderIds.filter((id) => !cancelledIds.includes(String(id)));
        saveOrderIds(remainingMyOrderIds);
        notify(`Đã xóa thành công ${cancelledOrders.length} đơn hàng đã hủy! 🗑️`);
      },
    });
  }

  function deleteOrder(id) {
    const order = orders.find((o) => String(o.id) === String(id));
    const label = order ? `đơn hàng #${String(order.id).slice(-6)}` : "đơn hàng này";
    setConfirmDelete({
      title: `Xác nhận xóa ${label}?`,
      message: `Bạn có chắc chắn muốn xóa vĩnh viễn ${label} không? Dữ liệu đã xóa sẽ không thể phục hồi.`,
      onConfirm: async () => {
        try {
          await fetch(`${API_URL}/api/orders/${id}`, { method: "DELETE" }).catch(() => null);
        } catch {}

        const remainingOrders = orders.filter((o) => String(o.id) !== String(id));
        setOrders(remainingOrders);
        try {
          localStorage.setItem("vuon-nho-orders-cache", JSON.stringify(remainingOrders));
        } catch {}

        const remainingMyOrderIds = myOrderIds.filter((myId) => String(myId) !== String(id));
        saveOrderIds(remainingMyOrderIds);
        notify(`Đã xóa ${label} thành công! 🗑️`);
      },
    });
  }

  if (loading) return <LoadingScreen />;
  return <div className="app-shell nature-shell" id="top">
    <div className="announcement"><Leaf size={14} /> Chào bạn đến với Vườn Nhỏ · Một góc xanh, một ngày an yên</div>
    <header className="site-header"><div className="header-inner">
      <button className="brand" onClick={() => setView("shop")} aria-label="Về trang cửa hàng"><span className="brand-mark"><Sprout size={21} strokeWidth={2.2} /></span><span><strong>Vườn Nhỏ</strong><small>plant studio · by Yến Duy</small></span></button>
      <nav className="main-nav">
        <NavButton active={view === "shop"} onClick={() => setView("shop")} icon={<ShoppingBag size={16} />} label="Cửa hàng" />
        <NavButton active={view === "orders"} onClick={() => setView("orders")} icon={<ClipboardList size={16} />} label="Đơn của tôi" />
        {currentUser?.role === "admin" && (
          <NavButton active={view === "admin"} onClick={() => setView("admin")} icon={<Settings2 size={16} />} label="Quản trị" />
        )}
      </nav>
      <div className="header-actions">
        {currentUser ? (
          <div className="auth-user-badge">
            <span className="auth-avatar">{currentUser.role === "admin" ? "🛡️" : "🌱"}</span>
            <span className="auth-name" title={currentUser.full_name || currentUser.username}>
              {currentUser.full_name || currentUser.username}
            </span>
            {currentUser.role === "admin" && <span className="auth-role-tag">Admin</span>}
            <button type="button" className="auth-logout-btn" onClick={handleLogout} title="Đăng xuất">
              <LogOut size={13} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            className="auth-btn-login"
            onClick={() => { setAuthModalTab("login"); setAuthModalOpen(true); }}
          >
            <LogIn size={15} />
            <span>Đăng nhập</span>
          </button>
        )}

        <button aria-label={`Giỏ hàng (${cartCount} sản phẩm)`} className="cart-button" onClick={() => { setCartOpen(true); setCheckoutStep("cart"); }}>
          <ShoppingCart size={18} /><span className="cart-text">Giỏ hàng</span>{cartCount > 0 && <b>{cartCount}</b>}
        </button>
      </div>
    </div></header>
    {view === "shop" && <GardenShop products={filteredProducts} allCount={products.length} search={search} setSearch={setSearch} category={category} setCategory={setCategory} onAdd={addToCart} />}
    {view === "orders" && <OrdersView orders={myOrders} onBrowse={() => setView("shop")} />}
    {view === "admin" && currentUser?.role === "admin" && (
      <AdminView
        authed={adminAuthed}
        password={password}
        setPassword={setPassword}
        passwordError={passwordError}
        onLogin={loginAdmin}
        products={products}
        orders={orders}
        onDelete={deleteProduct}
        onEdit={(product) => { setEditingProduct(product); setShowProductForm(true); }}
        onAdd={() => { setEditingProduct(null); setShowProductForm(true); }}
        onStatusChange={updateOrderStatus}
        onDeleteOrder={deleteOrder}
        onDeleteCancelledOrders={deleteCancelledOrders}
      />
    )}
    {showProductForm && <ProductForm initial={editingProduct} onCancel={() => { setShowProductForm(false); setEditingProduct(null); }} onSave={saveProduct} />}
    {cartOpen && <CartDrawer step={checkoutStep} items={cartItems} total={cartTotal} buyer={buyer} setBuyer={setBuyer} onClose={() => checkoutStep === "done" ? resetCheckout() : setCartOpen(false)} onChangeQty={changeQty} onRemove={removeFromCart} onCheckout={() => setCheckoutStep("form")} onBack={() => setCheckoutStep("cart")} onPlaceOrder={placeOrder} onDone={resetCheckout} />}
    <AuthModal
      isOpen={authModalOpen}
      initialTab={authModalTab}
      onClose={() => setAuthModalOpen(false)}
      onLoginSuccess={handleLoginSuccess}
      apiUrl={API_URL}
    />
    {confirmDelete && (
      <div className="modal-layer confirm-modal-layer">
        <button className="drawer-backdrop" onClick={() => setConfirmDelete(null)} aria-label="Đóng" />
        <div className="confirm-delete-modal">
          <div className="confirm-delete-icon"><Trash2 size={26} /></div>
          <h3>{confirmDelete.title}</h3>
          <p>{confirmDelete.message}</p>
          <div className="confirm-delete-actions">
            <button type="button" className="confirm-btn-cancel" onClick={() => setConfirmDelete(null)}>Giữ lại</button>
            <button
              type="button"
              className="confirm-btn-delete"
              onClick={() => {
                confirmDelete.onConfirm();
                setConfirmDelete(null);
              }}
            >
              Xác nhận xóa
            </button>
          </div>
        </div>
      </div>
    )}
    {toast && <div className="toast" role="status" aria-live="polite"><Check size={16} /> {toast}</div>}
  </div>;
}

function LoadingScreen() { return <div className="loading-screen"><span className="loading-leaf"><Sprout size={28} /></span><p>Đang chăm chút khu vườn...</p></div>; }
function NavButton({ active, onClick, icon, label }) { return <button className={`nav-button ${active ? "is-active" : ""}`} onClick={onClick}>{icon}{label}</button>; }

function CartDrawer({ step, items, total, buyer, setBuyer, onClose, onChangeQty, onRemove, onCheckout, onBack, onPlaceOrder, onDone }) {
  return <div className="drawer-layer"><button className="drawer-backdrop" onClick={onClose} aria-label="Đóng giỏ hàng" /><aside className="cart-drawer"><div className="drawer-header"><div><span className="eyebrow"><span /> Vườn Nhỏ</span><h2>{step === "done" ? "Cảm ơn bạn nhé" : step === "form" ? "Thông tin nhận cây" : "Giỏ hàng của bạn"}</h2></div><button aria-label="Đóng cửa sổ" className="close-button" onClick={onClose}><X size={19} /></button></div>{step === "done" ? <div className="success-view"><div className="success-icon"><Check size={30} /></div><h3>Đơn hàng đã được ghi nhận</h3><p>Vườn Nhỏ sẽ gọi cho bạn sớm để xác nhận và chuẩn bị những mầm xanh thật xinh.</p><button className="primary-button full-button" onClick={onDone}>Tiếp tục chọn cây <ArrowRight size={17} /></button></div> : step === "form" ? <CheckoutForm buyer={buyer} setBuyer={setBuyer} onBack={onBack} onPlaceOrder={onPlaceOrder} total={total} /> : <><div className="drawer-content">{items.length ? items.map((item) => <CartItem key={item.id} item={item} onChangeQty={onChangeQty} onRemove={onRemove} />) : <div className="cart-empty"><span>🪴</span><h3>Giỏ hàng đang nghỉ ngơi</h3><p>Thêm một mầm xanh để bắt đầu nhé.</p></div>}</div>{items.length > 0 && <div className="drawer-footer"><div className="total-row"><span>Tạm tính</span><strong>{formatVND(total)}</strong></div><p className="shipping-note"><Leaf size={14} /> Phí vận chuyển sẽ được xác nhận khi gọi đơn</p><button className="primary-button full-button" onClick={onCheckout}>Tiến hành đặt cây <ArrowRight size={17} /></button></div>}</>}</aside></div>;
}
function CartItem({ item, onChangeQty, onRemove }) { return <div className="cart-item"><div className="cart-item-art">{<ProductArt product={item} />}</div><div className="cart-item-main"><div className="cart-item-top"><div><b>{item.name}</b><small>{formatVND(item.price)}</small></div><button aria-label={`Bỏ ${item.name} khỏi giỏ`} className="remove-button" onClick={() => onRemove(item.id)}><Trash2 size={15} /></button></div><div className="quantity-control"><button aria-label={`Giảm số lượng ${item.name}`} onClick={() => onChangeQty(item.id, -1)}><Minus size={14} /></button><span>{item.qty}</span><button aria-label={`Tăng số lượng ${item.name}`} onClick={() => onChangeQty(item.id, 1)}><Plus size={14} /></button></div></div></div>; }
function CheckoutForm({ buyer, setBuyer, onBack, onPlaceOrder, total }) { const update = (key, value) => setBuyer((current) => ({ ...current, [key]: value })); return <div className="checkout-content"><button className="back-link" onClick={onBack}>← Quay lại giỏ hàng</button><p className="checkout-intro">Để cây đến đúng nơi, bạn để lại vài thông tin nhỏ nhé.</p><div className="form-stack"><FormField label="Tên của bạn" value={buyer.name} placeholder="Nguyễn Yến Duy" onChange={(value) => update("name", value)} /><FormField label="Số điện thoại" value={buyer.phone} placeholder="09xx xxx xxx" onChange={(value) => update("phone", value)} /><FormField label="Địa chỉ nhận cây" value={buyer.address} placeholder="Số nhà, đường, phường / xã..." onChange={(value) => update("address", value)} multiline /></div><div className="checkout-total"><span>Tổng tạm tính</span><strong>{formatVND(total)}</strong></div><button className="primary-button full-button" onClick={onPlaceOrder}>Gửi đơn hàng <ArrowRight size={17} /></button></div>; }
function FormField({ label, value, placeholder, onChange, multiline = false }) { return <label className="form-field"><span>{label}</span>{multiline ? <textarea value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} rows="3" /> : <input value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} />}</label>; }

function OrdersView({ orders, onBrowse }) { return <main className="inner-page"><div className="page-intro"><div className="eyebrow"><span /> Nhật ký khu vườn</div><h1>Những đơn cây của bạn</h1><p>Theo dõi hành trình những người bạn xanh đang tìm đường về nhà.</p></div>{orders.length ? <div className="orders-list">{orders.map((order) => <OrderCard key={order.id} order={order} />)}</div> : <div className="large-empty"><div className="empty-illustration">🌱</div><h2>Khu vườn đơn hàng còn trống</h2><p>Bạn chưa có đơn nào. Một mầm xanh đang chờ bạn chọn đấy.</p><button className="primary-button" onClick={onBrowse}>Đi dạo trong vườn <ArrowRight size={17} /></button></div>}</main>; }
function OrderCard({ order, admin = false, onStatusChange, onDeleteOrder }) {
  const status = order.status || "Chờ xử lý";
  const isCancelled = (status || "").trim().toLowerCase() === "đã hủy";
  return (
    <article className={`order-card ${admin ? "admin-order-card" : ""} ${isCancelled ? "order-card-cancelled" : ""}`}>
      <div className="order-top">
        <div>
          <span className="order-label">ĐƠN HÀNG #{String(order.id).slice(-6)}</span>
          <h3>{order.buyer?.name || "Khách hàng"}</h3>
          <p>{order.buyer?.phone || "—"} · {order.buyer?.address || "Chưa có địa chỉ"}</p>
        </div>
        {admin ? (
          <div className="admin-order-controls">
            <select
              value={status}
              className={`order-status-select ${isCancelled ? "is-cancelled" : ""}`}
              onChange={(event) => onStatusChange(order.id, event.target.value)}
            >
              <option>Chờ xử lý</option>
              <option>Đang chuẩn bị</option>
              <option>Đang giao</option>
              <option>Đã giao</option>
              <option>Đã hủy</option>
            </select>
            {isCancelled && onDeleteOrder && (
              <button
                type="button"
                className="order-single-delete-btn"
                onClick={() => onDeleteOrder(order.id)}
                title="Xóa vĩnh viễn đơn đã hủy này"
                aria-label={`Xóa đơn hàng #${String(order.id).slice(-6)}`}
              >
                <Trash2 size={15} />
              </button>
            )}
          </div>
        ) : (
          <span className={`status-pill ${isCancelled ? "status-pill-cancelled" : ""}`}>
            <span />{status}
          </span>
        )}
      </div>
      <div className="order-items">
        {(order.items || []).map((item, index) => (
          <div key={`${item.productId}-${index}`}>
            <span>{item.name} × {item.qty}</span>
            <b>{formatVND(item.price * item.qty)}</b>
          </div>
        ))}
      </div>
      <div className="order-total">
        <span>Tổng đơn</span>
        <strong>{formatVND(order.total)}</strong>
      </div>
    </article>
  );
}

function AdminView({
  authed,
  password,
  setPassword,
  passwordError,
  onLogin,
  products,
  orders,
  onDelete,
  onEdit,
  onAdd,
  onStatusChange,
  onDeleteOrder,
  onDeleteCancelledOrders,
}) {
  if (!authed) return <main className="admin-login-page"><div className="login-card"><div className="login-icon"><LockKeyhole size={24} /></div><div className="eyebrow"><span /> Góc riêng của chủ vườn</div><h1>Chào mừng trở lại</h1><p>Đăng nhập để chăm sóc sản phẩm và những đơn cây đang chờ được gửi đi.</p><label className="form-field"><span>Mật khẩu quản trị</span><input type="password" value={password} onChange={(event) => setPassword(event.target.value)} onKeyDown={(event) => event.key === "Enter" && onLogin()} placeholder="Nhập mật khẩu" /></label>{passwordError && <div className="field-error">Mật khẩu chưa đúng, thử lại nhé.</div>}<button className="primary-button full-button" onClick={onLogin}>Mở bảng quản trị <ArrowRight size={17} /></button></div></main>;
  const totalValue = products.reduce((sum, product) => sum + Number(product.price) * Number(product.stock), 0);
  const cancelledOrders = orders.filter((order) => (order.status || "").trim().toLowerCase() === "đã hủy");
  const cancelledCount = cancelledOrders.length;

  return (
    <main className="admin-page">
      <div className="admin-heading">
        <div>
          <div className="eyebrow"><span /> Studio quản trị</div>
          <h1>Bảng chăm sóc khu vườn</h1>
          <p>Mọi thứ bạn cần để giữ Vườn Nhỏ luôn tươi tốt.</p>
        </div>
        <button className="primary-button" onClick={onAdd}>
          <Plus size={17} /> Thêm sản phẩm
        </button>
      </div>
      <div className="dashboard-stats">
        <StatCard label="Sản phẩm đang bán" value={products.length} suffix="mặt hàng" icon={<Sprout size={19} />} />
        <StatCard label="Đơn cần xử lý" value={orders.filter((order) => (order.status || "Chờ xử lý") === "Chờ xử lý").length} suffix="đơn hàng" icon={<ClipboardList size={19} />} />
        <StatCard label="Giá trị tồn kho" value={formatVND(totalValue)} suffix="tổng giá trị" icon={<PackageCheck size={19} />} />
      </div>
      <section className="admin-section">
        <div className="admin-section-head">
          <div>
            <span className="section-kicker">KHO CÂY</span>
            <h2>Danh sách sản phẩm</h2>
          </div>
          <span className="muted-count">{products.length} sản phẩm</span>
        </div>
        <div className="product-table">
          {products.map((product) => (
            <div className="product-row" key={product.id}>
              <div className="table-product-icon">{<ProductArt product={product} />}</div>
              <div className="table-product-name"><b>{product.name}</b><span>{product.category}</span></div>
              <span className="table-stock">{product.stock} trong kho</span>
              <strong>{formatVND(product.price)}</strong>
              <div className="row-actions">
                <button onClick={() => onEdit(product)} aria-label={`Sửa ${product.name}`}><Pencil size={16} /></button>
                <button onClick={() => onDelete(product.id)} aria-label={`Xóa ${product.name}`}><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
        </div>
      </section>
      <section className="admin-section">
        <div className="admin-section-head">
          <div>
            <span className="section-kicker">ĐƠN HÀNG GẦN ĐÂY</span>
            <h2>Cùng cây về nhà</h2>
          </div>
          <div className="admin-section-actions">
            <span className="muted-count">{orders.length} đơn</span>
            <button
              type="button"
              className={`delete-cancelled-btn ${cancelledCount > 0 ? "is-active" : ""}`}
              onClick={onDeleteCancelledOrders}
              disabled={cancelledCount === 0}
              title={cancelledCount > 0 ? `Xóa vĩnh viễn ${cancelledCount} đơn hàng đã hủy` : "Không có đơn hàng đã hủy nào"}
            >
              <Trash2 size={15} />
              <span>Xóa các đơn đã hủy {cancelledCount > 0 ? `(${cancelledCount})` : ""}</span>
            </button>
          </div>
        </div>
        <div className="admin-orders">
          {orders.length ? (
            orders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                admin
                onStatusChange={onStatusChange}
                onDeleteOrder={onDeleteOrder}
              />
            ))
          ) : (
            <div className="small-empty">Chưa có đơn hàng nào.</div>
          )}
        </div>
      </section>
    </main>
  );
}
function StatCard({ label, value, suffix, icon }) { return <div className="stat-card"><span className="stat-icon">{icon}</span><span className="stat-label">{label}</span><strong>{value}</strong><small>{suffix}</small></div>; }

function ProductForm({ initial, onCancel, onSave }) {
  const [form, setForm] = useState(() => initial ? { ...initial, desc: initial.desc || initial.description || "" } : { name: "", desc: "", price: "", category: "Cây lớn", stock: "", icon: "🌿" });
  const setField = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  function submit() { if (!form.name.trim() || form.price === "" || form.stock === "") return window.alert("Vui lòng nhập đủ tên, giá và tồn kho."); onSave({ ...form, name: form.name.trim(), price: Number(form.price), stock: Number(form.stock), icon: form.icon || "🌿" }); }
  return <div className="modal-layer"><button className="drawer-backdrop" onClick={onCancel} aria-label="Đóng" /><div className="product-modal"><div className="modal-heading"><div><span className="section-kicker">KHO CÂY</span><h2>{initial ? "Chỉnh sửa sản phẩm" : "Thêm mầm xanh mới"}</h2></div><button aria-label="Đóng cửa sổ" className="close-button" onClick={onCancel}><X size={19} /></button></div><div className="form-stack"><FormField label="Tên sản phẩm" value={form.name} placeholder="Ví dụ: Monstera deliciosa" onChange={(value) => setField("name", value)} /><FormField label="Mô tả ngắn" value={form.desc} placeholder="Điều gì làm sản phẩm này đặc biệt?" onChange={(value) => setField("desc", value)} multiline /><div className="form-row"><FormField label="Giá (đ)" value={form.price} placeholder="185000" onChange={(value) => setField("price", value.replace(/\D/g, ""))} /><FormField label="Tồn kho" value={form.stock} placeholder="10" onChange={(value) => setField("stock", value.replace(/\D/g, ""))} /></div><label className="form-field"><span>Danh mục</span><select value={form.category} onChange={(event) => setField("category", event.target.value)}>{CATEGORIES.filter((item) => item !== "Tất cả").map((item) => <option key={item}>{item}</option>)}</select></label><FormField label="Emoji minh họa" value={form.icon} placeholder="🌿" onChange={(value) => setField("icon", value)} /></div><button className="primary-button full-button" onClick={submit}>{initial ? "Lưu thay đổi" : "Thêm sản phẩm"} <Check size={17} /></button></div></div>;
}

export default App;
