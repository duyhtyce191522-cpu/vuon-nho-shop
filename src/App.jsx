import { useState, useEffect, useMemo } from "react";
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
  RefreshCw,
} from "lucide-react";

/* =========================================================
   CONFIG
========================================================= */

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const COLORS = {
  bg: "#F5F1E6",
  surface: "#FFFFFF",
  ink: "#23291F",
  inkSoft: "#5B6355",
  forest: "#2F3E2E",
  forestDark: "#212B20",
  moss: "#7C8F5A",
  mossLight: "#E7EBDC",
  clay: "#B5654A",
  clayLight: "#F3E2DB",
  line: "#DEDBC8",
};

const FONT_DISPLAY = "'Fraunces', Georgia, serif";
const FONT_BODY = "'Inter', system-ui, sans-serif";

/* =========================================================
   PRODUCTS FALLBACK
========================================================= */

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

/* =========================================================
   HELPERS
========================================================= */

function formatVND(value) {
  return Number(value || 0).toLocaleString("vi-VN") + "đ";
}

function uid() {
  return (
    Date.now().toString(36) +
    Math.random().toString(36).slice(2, 7)
  );
}

/* =========================================================
   VALIDATION
========================================================= */

function isValidUsername(value) { return /^[\p{L}]+$/u.test(value); }
function isValidPhone(value) { return /^0\d{9}$/.test(value); }
function isValidAddress(value) { return /^[\p{L}\p{N}\s]+$/u.test(value); }
function isValidPassword(value) { return value.length >= 7; }
function isValidFullName(value) { return /^[\p{L}\s]+$/u.test(value); }

/* =========================================================
   APP
========================================================= */

function App() {
  const [view, setView] = useState("shop");

  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [myOrderIds, setMyOrderIds] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem("my-order-ids") || "[]"
      );
    } catch {
      return [];
    }
  });

  const [cart, setCart] = useState({});
  const [cartOpen, setCartOpen] = useState(false);

  const [search, setSearch] = useState("");
  const [cat, setCat] = useState("Tất cả");

  const [checkoutStep, setCheckoutStep] = useState("cart");

  const [buyer, setBuyer] = useState({
    name: "",
    phone: "",
    address: "",
  });

  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("vn-user") || "null"); } catch { return null; }
  });
  const [showUserLogin, setShowUserLogin] = useState(false);
  const [loginMode, setLoginMode] = useState("login");
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [registerFullName, setRegisterFullName] = useState("");
  const [registerUsername, setRegisterUsername] = useState("");
  const [registerPhone, setRegisterPhone] = useState("");
  const [registerAddress, setRegisterAddress] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const [adminAuthed, setAdminAuthed] = useState(false);
  const [pwInput, setPwInput] = useState("");
  const [pwError, setPwError] = useState(false);

  const [editingProduct, setEditingProduct] = useState(null);
  const [showForm, setShowForm] = useState(false);

  /* =======================================================
     TOAST
  ======================================================= */

  function showToast(message) {
    setToast(message);

    setTimeout(() => {
      setToast(null);
    }, 2500);
  }

  /* =======================================================
     USER LOGIN / REGISTER
  ======================================================= */

  async function handleUserLogin() {
    const username = loginUsername.trim();
    if (!username) return setLoginError("Vui lòng nhập tên đăng nhập");
    if (!isValidUsername(username)) return setLoginError("Tên đăng nhập chỉ được chứa chữ cái, không có số, khoảng trắng, ký tự đặc biệt hoặc emoji");
    if (!isValidPassword(loginPassword)) return setLoginError("Mật khẩu phải có ít nhất 7 ký tự");
    try {
      const response = await fetch(`${API_URL}/api/users/login`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username, password: loginPassword }) });
      const data = await response.json().catch(() => null);
      if (!response.ok || !data?.success) return setLoginError(data?.message || "Đăng nhập thất bại");
      setUser(data.user);
      localStorage.setItem("vn-user", JSON.stringify(data.user));

      setShowUserLogin(false);
      setLoginUsername("");
      setLoginPassword("");
      setLoginError("");

      if (data.user.role === "admin") {
        setAdminAuthed(true);
        setView("admin");
        showToast("Đăng nhập quản trị thành công");
      } else {
        setAdminAuthed(false);
        setView("shop");
        showToast("Đăng nhập thành công");
      }
    } catch (error) { console.error("User login error:", error); setLoginError("Không thể kết nối đến server"); }
  }

  async function handleUserRegister() {
    const fullName = registerFullName.trim();
    const username = registerUsername.trim();
    const phone = registerPhone.trim();
    const address = registerAddress.trim();
    if (!fullName || !username || !phone || !address || !registerPassword || !registerConfirmPassword) return setLoginError("Vui lòng nhập đầy đủ thông tin đăng ký");
    if (!isValidFullName(fullName)) return setLoginError("Họ tên chỉ được chứa chữ cái và khoảng trắng");
    if (!isValidUsername(username)) return setLoginError("Tên đăng ký chỉ được chứa chữ cái, không có số, khoảng trắng, ký tự đặc biệt hoặc emoji");
    if (!isValidPhone(phone)) return setLoginError("Số điện thoại phải đúng 10 chữ số và bắt đầu bằng 0");
    if (!isValidAddress(address)) return setLoginError("Địa chỉ chỉ được chứa chữ cái, số và khoảng trắng");
    if (!isValidPassword(registerPassword)) return setLoginError("Mật khẩu phải có ít nhất 7 ký tự");
    if (registerPassword !== registerConfirmPassword) return setLoginError("Mật khẩu xác nhận không khớp");
    try {
      const response = await fetch(`${API_URL}/api/users`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username, password: registerPassword, full_name: fullName, phone, address }) });
      const data = await response.json().catch(() => null);
      if (!response.ok || !data?.success) return setLoginError(data?.message || "Đăng ký thất bại");
      setLoginMode("login"); setLoginUsername(username); setLoginPassword("");
      setRegisterFullName(""); setRegisterUsername(""); setRegisterPhone(""); setRegisterAddress(""); setRegisterPassword(""); setRegisterConfirmPassword(""); setLoginError("");
      showToast("Đăng ký thành công, hãy đăng nhập");
    } catch (error) { console.error("User register error:", error); setLoginError("Không thể kết nối đến server"); }
  }

  function logoutUser() {
    setUser(null);
    setAdminAuthed(false);
    setView("shop");
    localStorage.removeItem("vn-user");
    showToast("Đã đăng xuất");
  }

  /* =======================================================
     LOAD PRODUCTS
  ======================================================= */

  async function loadProducts() {
    try {
      const response = await fetch(
        `${API_URL}/api/products`
      );

      if (!response.ok) {
        throw new Error("Không thể tải sản phẩm");
      }

      const data = await response.json();

      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Load products error:", error);

      /*
       * Nếu backend chưa chạy thì vẫn hiện sản phẩm demo.
       */
      setProducts(SEED_PRODUCTS);

      showToast(
        "Không kết nối được backend, đang dùng dữ liệu demo"
      );
    }
  }

  /* =======================================================
     LOAD ORDERS
  ======================================================= */

  async function loadOrders() {
    try {
      const response = await fetch(
        `${API_URL}/api/orders`
      );

      if (!response.ok) {
        throw new Error("Không thể tải đơn hàng");
      }

      const data = await response.json();

      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Load orders error:", error);

      setOrders([]);
    }
  }

  /* =======================================================
     INITIAL LOAD
  ======================================================= */

  useEffect(() => {
    async function loadData() {
      setLoading(true);

      await Promise.all([
        loadProducts(),
        loadOrders(),
      ]);

      setLoading(false);
    }

    loadData();
  }, []);

  /* =======================================================
     SAVE MY ORDER IDS
  ======================================================= */

  function saveMyOrderIds(next) {
    setMyOrderIds(next);

    try {
      localStorage.setItem(
        "my-order-ids",
        JSON.stringify(next)
      );
    } catch (error) {
      console.error(
        "Không thể lưu mã đơn:",
        error
      );
    }
  }

  /* =======================================================
     CART
  ======================================================= */

  const cartItems = useMemo(() => {
    return Object.entries(cart)
      .filter(([, qty]) => qty > 0)
      .map(([id, qty]) => {
        const product = products.find(
          (item) => String(item.id) === String(id)
        );

        if (!product) {
          return null;
        }

        return {
          ...product,
          price: Number(product.price),
          stock: Number(product.stock),
          qty,
        };
      })
      .filter(Boolean);
  }, [cart, products]);

  const cartTotal = cartItems.reduce(
    (sum, item) =>
      sum + Number(item.price) * Number(item.qty),
    0
  );

  const cartCount = cartItems.reduce(
    (sum, item) => sum + item.qty,
    0
  );

  /* =======================================================
     ADD TO CART
  ======================================================= */

  function addToCart(id) {
    const product = products.find(
      (item) => String(item.id) === String(id)
    );

    if (!product) {
      showToast("Không tìm thấy sản phẩm");
      return;
    }

    const currentQty = cart[id] || 0;

    if (currentQty >= Number(product.stock)) {
      showToast("Không thể thêm quá số lượng tồn kho");
      return;
    }

    setCart((current) => ({
      ...current,
      [id]: (current[id] || 0) + 1,
    }));

    showToast("Đã thêm vào giỏ");
  }

  /* =======================================================
     CHANGE QUANTITY
  ======================================================= */

  function changeQty(id, delta) {
    const product = products.find(
      (item) => String(item.id) === String(id)
    );

    if (!product) {
      return;
    }

    setCart((current) => {
      const currentQty = current[id] || 0;

      const nextQty = Math.max(
        0,
        currentQty + delta
      );

      if (
        delta > 0 &&
        nextQty > Number(product.stock)
      ) {
        showToast("Đã đạt số lượng tồn kho");
        return current;
      }

      const next = {
        ...current,
        [id]: nextQty,
      };

      if (next[id] === 0) {
        delete next[id];
      }

      return next;
    });
  }

  /* =======================================================
     REMOVE CART ITEM
  ======================================================= */

  function removeFromCart(id) {
    setCart((current) => {
      const next = {
        ...current,
      };

      delete next[id];

      return next;
    });
  }

  /* =======================================================
     PLACE ORDER
  ======================================================= */

  async function placeOrder() {
    if (
      !buyer.name.trim() ||
      !buyer.phone.trim() ||
      !buyer.address.trim()
    ) {
      showToast("Vui lòng điền đủ thông tin");
      return;
    }

    if (cartItems.length === 0) {
      showToast("Giỏ hàng đang trống");
      return;
    }

    /*
     * Kiểm tra lại tồn kho trước khi gửi đơn.
     */
    for (const item of cartItems) {
      if (item.qty > Number(item.stock)) {
        showToast(
          `${item.name} không đủ số lượng`
        );
        return;
      }
    }

    const order = {
      items: cartItems.map((item) => ({
        productId: item.id,
        name: item.name,
        price: Number(item.price),
        qty: Number(item.qty),
      })),

      total: cartTotal,

      buyer: {
        name: buyer.name.trim(),
        phone: buyer.phone.trim(),
        address: buyer.address.trim(),
      },
    };

    try {
      showToast("Đang tạo đơn hàng...");

      const response = await fetch(
        `${API_URL}/api/orders`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(order),
        }
      );

      const data = await response
        .json()
        .catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Không thể tạo đơn hàng"
        );
      }

      /*
       * Backend trả về đơn hàng đã lưu MySQL.
       */
      const savedOrder = data;

      setOrders((current) => [
        savedOrder,
        ...current,
      ]);

      const nextIds = [
        savedOrder.id,
        ...myOrderIds,
      ];

      saveMyOrderIds(nextIds);

      setCart({});

      setCheckoutStep("done");

      /*
       * Reload products để lấy tồn kho mới nhất
       * nếu backend có cập nhật stock.
       */
      await loadProducts();

      showToast("Đặt hàng thành công");
    } catch (error) {
      console.error(
        "Place order error:",
        error
      );

      showToast(
        error.message ||
          "Đặt hàng thất bại"
      );
    }
  }

  /* =======================================================
     RESET CHECKOUT
  ======================================================= */

  function resetCheckout() {
    setCheckoutStep("cart");
    setCartOpen(false);

    setBuyer({
      name: "",
      phone: "",
      address: "",
    });
  }
/* =======================================================
   UPDATE ORDER STATUS
======================================================= */

async function updateOrderStatus(id, status) {
  try {
    console.log("=================================");
    console.log("UPDATE ORDER");
    console.log("Order ID:", id);
    console.log("New status:", JSON.stringify(status));

    const response = await fetch(
      `${API_URL}/api/orders/${id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: status,
        }),
      }
    );

    const data = await response.json().catch(() => null);

    console.log("Response status:", response.status);
    console.log("Backend response:", data);

    if (!response.ok) {
      throw new Error(
        data?.message || "Không thể cập nhật đơn hàng"
      );
    }

    setOrders((current) =>
      current.map((order) =>
        String(order.id) === String(id)
          ? {
              ...order,
              status: data.status,
              updatedAt: data.updatedAt,
            }
          : order
      )
    );

    showToast("Đã cập nhật trạng thái");

    console.log("Update successfully");
    console.log("=================================");

  } catch (error) {
    console.error(
      "Update order error:",
      error
    );

    showToast(
      error.message ||
        "Cập nhật thất bại"
    );
  }
}

  /* =======================================================
     DELETE ORDER
  ======================================================= */

  async function deleteOrder(orderId) {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa đơn hàng ${orderId}?`)) return;
    try {
      const response = await fetch(`${API_URL}/api/orders/${orderId}`, { method: "DELETE" });
      const data = await response.json().catch(() => null);
      if (!response.ok || !data?.success) throw new Error(data?.message || "Không thể xóa đơn hàng");
      setOrders((current) => current.filter((order) => String(order.id) !== String(orderId)));
      saveMyOrderIds(myOrderIds.filter((id) => String(id) !== String(orderId)));
      showToast("Xóa đơn hàng thành công");
    } catch (error) { console.error("Delete order error:", error); showToast(error.message || "Không thể xóa đơn hàng"); }
  }

  /* =======================================================
     DELETE PRODUCT
  ======================================================= */

  async function deleteProduct(id) {
    const confirmDelete = window.confirm(
      "Bạn có chắc muốn xóa sản phẩm này?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/products/${id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response
        .json()
        .catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Không thể xóa sản phẩm"
        );
      }

      setProducts((current) =>
        current.filter(
          (product) =>
            String(product.id) !==
            String(id)
        )
      );

      /*
       * Nếu sản phẩm đang nằm trong giỏ
       * thì xóa luôn khỏi giỏ.
       */
      setCart((current) => {
        const next = {
          ...current,
        };

        delete next[id];

        return next;
      });

      showToast("Đã xóa sản phẩm");
    } catch (error) {
      console.error(
        "Delete product error:",
        error
      );

      showToast(
        error.message ||
          "Xóa sản phẩm thất bại"
      );
    }
  }

  /* =======================================================
     ADD / UPDATE PRODUCT
  ======================================================= */

  async function upsertProduct(product) {
    try {
      let response;

      if (editingProduct) {
        response = await fetch(
          `${API_URL}/api/products/${product.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name: product.name,
              desc: product.desc,
              price: Number(product.price),
              category: product.category,
              stock: Number(product.stock),
              icon: product.icon,
            }),
          }
        );
      } else {
        response = await fetch(
          `${API_URL}/api/products`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              id: uid(),
              name: product.name,
              desc: product.desc,
              price: Number(product.price),
              category: product.category,
              stock: Number(product.stock),
              icon: product.icon,
            }),
          }
        );
      }

      const data = await response
        .json()
        .catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Không thể lưu sản phẩm"
        );
      }

      /*
       * Backend có thể trả về sản phẩm vừa lưu.
       * Sau đó reload lại danh sách để chắc chắn
       * frontend đồng bộ với MySQL.
       */
      await loadProducts();

      setShowForm(false);
      setEditingProduct(null);

      showToast(
        editingProduct
          ? "Đã cập nhật sản phẩm"
          : "Đã thêm sản phẩm"
      );
    } catch (error) {
      console.error(
        "Save product error:",
        error
      );

      showToast(
        error.message ||
          "Lưu sản phẩm thất bại"
      );
    }
  }

  /* =======================================================
     FILTER
  ======================================================= */

  const filteredProducts =
    products.filter((product) => {
      const matchCategory =
        cat === "Tất cả" ||
        product.category === cat;

      const matchSearch =
        String(product.name || "")
          .toLowerCase()
          .includes(
            search.toLowerCase()
          );

      return (
        matchCategory &&
        matchSearch
      );
    });

  /* =======================================================
     MY ORDERS
  ======================================================= */

  const myOrders = orders.filter(
    (order) =>
      myOrderIds.some(
        (id) =>
          String(id) ===
          String(order.id)
      )
  );

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <>
        <style>
          {`
            @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Inter:wght@400;500;600;700&display=swap');

            * {
              box-sizing: border-box;
            }

            body {
              margin: 0;
            }
          `}
        </style>

        <div
          style={{
            background: COLORS.bg,
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            gap: "12px",
            fontFamily: FONT_BODY,
            color: COLORS.inkSoft,
          }}
        >
          <Sprout
            size={32}
            color={COLORS.forest}
          />

          <div>
            Đang tải cửa hàng...
          </div>
        </div>
      </>
    );
  }

  /* =======================================================
     MAIN
  ======================================================= */

  return (
    <div
      style={{
        background: COLORS.bg,
        minHeight: "100vh",
        fontFamily: FONT_BODY,
        color: COLORS.ink,
        position: "relative",
      }}
    >
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Inter:wght@400;500;600;700&display=swap');

          * {
            box-sizing: border-box;
          }

          html,
          body,
          #root {
            margin: 0;
            min-height: 100%;
          }

          body {
            background: ${COLORS.bg};
          }

          button,
          input,
          textarea,
          select {
            font-family: inherit;
          }

          button {
            transition:
              opacity 0.15s ease,
              transform 0.15s ease;
          }

          button:hover:not(:disabled) {
            opacity: 0.88;
          }

          button:active:not(:disabled) {
            transform: scale(0.98);
          }

          .vn-shop {
            min-height: calc(100vh - 76px);
            background:
              radial-gradient(circle at 10% 8%, rgba(124,143,90,0.13), transparent 24%),
              radial-gradient(circle at 92% 16%, rgba(181,101,74,0.10), transparent 22%),
              ${COLORS.bg};
            overflow: hidden;
          }

          .vn-hero {
            max-width: 1180px;
            margin: 0 auto;
            padding: 62px 28px 54px;
            display: grid;
            grid-template-columns: 0.95fr 1.05fr;
            align-items: center;
            gap: 50px;
          }

          .vn-hero-copy { position: relative; z-index: 2; }

          .vn-pill {
            display: inline-flex;
            align-items: center;
            gap: 7px;
            padding: 8px 13px;
            border: 1px solid rgba(47,62,46,0.12);
            background: rgba(255,255,255,0.72);
            border-radius: 999px;
            color: ${COLORS.forest};
            font-size: 12px;
            font-weight: 700;
            box-shadow: 0 8px 30px rgba(47,62,46,0.06);
          }

          .vn-hero h1 {
            margin: 20px 0 15px;
            max-width: 650px;
            color: ${COLORS.forestDark};
            font-family: ${FONT_DISPLAY};
            font-size: clamp(48px, 6vw, 76px);
            line-height: 0.98;
            letter-spacing: -0.045em;
            font-weight: 600;
          }

          .vn-hero h1 span { color: ${COLORS.clay}; font-style: italic; }

          .vn-hero-copy > p {
            max-width: 560px;
            margin: 0;
            color: ${COLORS.inkSoft};
            font-size: 16px;
            line-height: 1.8;
          }

          .vn-hero-actions {
            display: flex;
            align-items: center;
            gap: 18px;
            margin-top: 28px;
            flex-wrap: wrap;
          }

          .vn-primary-btn {
            border: none;
            border-radius: 13px;
            background: ${COLORS.forest};
            color: white;
            padding: 13px 18px;
            display: inline-flex;
            align-items: center;
            gap: 16px;
            font-size: 14px;
            font-weight: 700;
            cursor: pointer;
            box-shadow: 0 12px 26px rgba(47,62,46,0.18);
          }

          .vn-primary-btn span { font-size: 19px; line-height: 1; }

          .vn-mini-note {
            color: ${COLORS.inkSoft};
            font-size: 12px;
            font-weight: 600;
            display: inline-flex;
            align-items: center;
            gap: 8px;
          }

          .vn-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: ${COLORS.moss};
            box-shadow: 0 0 0 5px ${COLORS.mossLight};
          }

          .vn-hero-art {
            position: relative;
            min-height: 470px;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .vn-art-card {
            position: relative;
            width: min(470px, 84%);
            aspect-ratio: 0.86;
            overflow: hidden;
            border-radius: 38% 62% 48% 52% / 30% 32% 68% 70%;
            transform: rotate(2deg);
            box-shadow: 0 35px 80px rgba(35,41,31,0.18);
            border: 10px solid rgba(255,255,255,0.78);
            background: ${COLORS.mossLight};
            z-index: 2;
          }

          .vn-art-card img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
          }

          .vn-art-card::after {
            content: "";
            position: absolute;
            inset: 0;
            background: linear-gradient(180deg, transparent 52%, rgba(33,43,32,0.62));
          }

          .vn-art-label {
            position: absolute;
            left: 26px;
            right: 26px;
            bottom: 24px;
            z-index: 3;
            display: flex;
            align-items: center;
            justify-content: space-between;
            color: white;
            font-size: 12px;
            font-weight: 700;
          }

          .vn-art-label span {
            opacity: 0.65;
            font-family: ${FONT_DISPLAY};
            font-size: 19px;
          }

          .vn-art-orbit {
            position: absolute;
            border: 1px solid rgba(47,62,46,0.12);
            border-radius: 50%;
          }

          .vn-orbit-1 { width: 390px; height: 390px; }
          .vn-orbit-2 { width: 500px; height: 500px; border-style: dashed; }

          .vn-floating-card {
            position: absolute;
            z-index: 5;
            display: flex;
            align-items: center;
            gap: 11px;
            padding: 12px 14px;
            border-radius: 15px;
            background: rgba(255,255,255,0.88);
            backdrop-filter: blur(12px);
            border: 1px solid rgba(255,255,255,0.95);
            box-shadow: 0 18px 40px rgba(35,41,31,0.12);
          }

          .vn-floating-card strong,
          .vn-floating-card small { display: block; }

          .vn-floating-card strong { color: ${COLORS.forestDark}; font-size: 12px; }
          .vn-floating-card small { color: ${COLORS.inkSoft}; margin-top: 3px; font-size: 10px; }

          .vn-float-top { top: 58px; right: 5%; }
          .vn-float-bottom { left: 3%; bottom: 52px; }

          .vn-float-icon {
            width: 34px;
            height: 34px;
            display: grid;
            place-items: center;
            border-radius: 11px;
            background: ${COLORS.mossLight};
            font-size: 17px;
          }

          .vn-section-head {
            max-width: 1180px;
            margin: 0 auto;
            padding: 12px 28px 26px;
            display: flex;
            justify-content: space-between;
            align-items: end;
            gap: 20px;
          }

          .vn-eyebrow {
            color: ${COLORS.moss};
            font-size: 10px;
            font-weight: 800;
            letter-spacing: 0.18em;
          }

          .vn-section-head h2,
          .vn-bottom-banner h2 {
            margin: 8px 0 5px;
            color: ${COLORS.forest};
            font-family: ${FONT_DISPLAY};
            font-size: 34px;
            line-height: 1.05;
            font-weight: 600;
          }

          .vn-section-head p,
          .vn-bottom-banner p {
            margin: 0;
            color: ${COLORS.inkSoft};
            font-size: 13px;
            line-height: 1.6;
          }

          .vn-stat-box {
            min-width: 110px;
            padding: 14px 17px;
            border-radius: 16px;
            background: ${COLORS.surface};
            border: 1px solid ${COLORS.line};
            text-align: right;
          }

          .vn-stat-box span {
            display: block;
            color: ${COLORS.forest};
            font-family: ${FONT_DISPLAY};
            font-size: 28px;
            line-height: 1;
          }

          .vn-stat-box small { color: ${COLORS.inkSoft}; font-size: 10px; }

          .vn-toolbar {
            max-width: 1180px;
            margin: 0 auto 26px;
            padding: 0 28px;
            display: flex;
            gap: 13px;
            align-items: center;
            justify-content: space-between;
            flex-wrap: wrap;
          }

          .vn-search {
            min-width: 260px;
            flex: 1 1 310px;
            display: flex;
            align-items: center;
            gap: 10px;
            background: ${COLORS.surface};
            border: 1px solid ${COLORS.line};
            border-radius: 14px;
            padding: 11px 13px;
            box-shadow: 0 8px 25px rgba(35,41,31,0.04);
          }

          .vn-search > svg { color: ${COLORS.inkSoft}; flex: 0 0 auto; }

          .vn-search input {
            width: 100%;
            border: none;
            outline: none;
            background: transparent;
            color: ${COLORS.ink};
            font-size: 13px;
          }

          .vn-clear-search {
            border: none;
            background: transparent;
            color: ${COLORS.inkSoft};
            cursor: pointer;
            display: grid;
            place-items: center;
          }

          .vn-categories { display: flex; gap: 7px; flex-wrap: wrap; }

          .vn-categories button {
            border: 1px solid ${COLORS.line};
            background: rgba(255,255,255,0.7);
            color: ${COLORS.inkSoft};
            border-radius: 999px;
            padding: 8px 13px;
            font-size: 11px;
            font-weight: 600;
            cursor: pointer;
          }

          .vn-categories button.active {
            background: ${COLORS.forest};
            color: white;
            border-color: ${COLORS.forest};
            box-shadow: 0 7px 18px rgba(47,62,46,0.16);
          }

          .vn-product-grid {
            max-width: 1180px;
            margin: 0 auto;
            padding: 0 28px;
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 18px;
          }

          .vn-product-card {
            position: relative;
            overflow: hidden;
            border: 1px solid ${COLORS.line};
            border-radius: 23px;
            background: ${COLORS.surface};
            box-shadow: 0 12px 30px rgba(35,41,31,0.055);
            transition: transform 0.22s ease, box-shadow 0.22s ease;
          }

          .vn-product-card:hover {
            transform: translateY(-6px);
            box-shadow: 0 22px 45px rgba(35,41,31,0.11);
          }

          .vn-product-image {
            position: relative;
            height: 265px;
            overflow: hidden;
            background: ${COLORS.mossLight};
          }

          .vn-product-image img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
            transition: transform 0.5s ease;
          }

          .vn-product-card:hover .vn-product-image img { transform: scale(1.06); }

          .vn-product-image::after {
            content: "";
            position: absolute;
            inset: 0;
            background: linear-gradient(180deg, rgba(0,0,0,0.05), transparent 50%, rgba(33,43,32,0.23));
            pointer-events: none;
          }

          .vn-product-badge {
            position: absolute;
            z-index: 2;
            top: 13px;
            left: 13px;
            padding: 6px 9px;
            border-radius: 999px;
            background: rgba(255,255,255,0.88);
            backdrop-filter: blur(8px);
            color: ${COLORS.forest};
            font-size: 9px;
            font-weight: 800;
          }

          .vn-product-number {
            position: absolute;
            z-index: 2;
            right: 14px;
            top: 13px;
            color: white;
            font-family: ${FONT_DISPLAY};
            font-size: 18px;
            opacity: 0.9;
          }

          .vn-product-body { padding: 17px; }

          .vn-product-topline {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 8px;
          }

          .vn-product-category {
            color: ${COLORS.moss};
            font-size: 9px;
            font-weight: 800;
            letter-spacing: 0.1em;
            text-transform: uppercase;
          }

          .vn-stock { color: ${COLORS.inkSoft}; font-size: 10px; }
          .vn-stock.out { color: ${COLORS.clay}; font-weight: 700; }

          .vn-product-body h3 {
            margin: 8px 0 6px;
            color: ${COLORS.ink};
            font-family: ${FONT_DISPLAY};
            font-size: 21px;
            line-height: 1.1;
          }

          .vn-product-body p {
            min-height: 44px;
            margin: 0;
            color: ${COLORS.inkSoft};
            font-size: 12px;
            line-height: 1.55;
          }

          .vn-product-footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 10px;
            margin-top: 16px;
          }

          .vn-product-footer strong { color: ${COLORS.forest}; font-size: 16px; }

          .vn-add-btn {
            border: none;
            border-radius: 11px;
            background: ${COLORS.forest};
            color: white;
            padding: 9px 11px;
            display: inline-flex;
            align-items: center;
            gap: 5px;
            font-size: 11px;
            font-weight: 700;
            cursor: pointer;
          }

          .vn-add-btn:disabled {
            background: ${COLORS.line};
            color: ${COLORS.inkSoft};
            cursor: not-allowed;
          }

          .vn-empty {
            max-width: 600px;
            margin: 30px auto 70px;
            padding: 50px 25px;
            text-align: center;
            border: 1px dashed ${COLORS.line};
            border-radius: 25px;
            background: rgba(255,255,255,0.55);
          }

          .vn-empty-icon { font-size: 42px; }

          .vn-empty h3 {
            margin: 12px 0 5px;
            color: ${COLORS.forest};
            font-family: ${FONT_DISPLAY};
            font-size: 25px;
          }

          .vn-empty p {
            color: ${COLORS.inkSoft};
            font-size: 13px;
            margin: 0 0 18px;
          }

          .vn-bottom-banner {
            max-width: 1124px;
            margin: 70px auto 0;
            padding: 0 28px 70px;
            display: grid;
            grid-template-columns: 0.85fr 1.15fr;
            align-items: center;
            gap: 36px;
          }

          .vn-bottom-art {
            height: 230px;
            overflow: hidden;
            border-radius: 27px 27px 27px 70px;
            transform: rotate(-1.5deg);
            box-shadow: 0 20px 45px rgba(35,41,31,0.10);
          }

          .vn-bottom-art img { width: 100%; height: 100%; object-fit: cover; }

          @media (max-width: 900px) {
            .vn-hero { grid-template-columns: 1fr; padding-top: 40px; }
            .vn-hero-copy { text-align: center; }
            .vn-hero-copy > p { margin-left: auto; margin-right: auto; }
            .vn-hero-actions { justify-content: center; }
            .vn-hero-art { min-height: 400px; }
            .vn-product-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
            .vn-bottom-banner { grid-template-columns: 1fr; }
          }

          @media (max-width: 620px) {
            .vn-hero { padding: 32px 18px 30px; }
            .vn-hero h1 { font-size: 48px; }
            .vn-hero-art { min-height: 330px; }
            .vn-art-card { width: 78%; }
            .vn-orbit-1 { width: 270px; height: 270px; }
            .vn-orbit-2 { width: 340px; height: 340px; }
            .vn-float-top { right: 0; top: 12px; }
            .vn-float-bottom { left: 0; bottom: 10px; }
            .vn-section-head, .vn-toolbar { padding-left: 18px; padding-right: 18px; }
            .vn-section-head h2 { font-size: 29px; }
            .vn-stat-box { display: none; }
            .vn-product-grid { grid-template-columns: 1fr; padding: 0 18px; }
            .vn-product-image { height: 280px; }
            .vn-bottom-banner { padding-left: 18px; padding-right: 18px; }
          }
        `}
      </style>

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header
        style={{
          borderBottom: `1px solid ${COLORS.line}`,
          background: COLORS.surface,
          position: "sticky",
          top: 0,
          zIndex: 20,
        }}
      >
        <div
          style={{
            maxWidth: "1180px",
            margin: "0 auto",
            padding: "16px 28px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
            flexWrap: "wrap",
          }}
        >
          {/* LOGO */}

          <button
            onClick={() =>
              setView("shop")
            }
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              border: "none",
              background: "transparent",
              cursor: "pointer",
              padding: 0,
            }}
          >
            <Sprout
              size={22}
              color={COLORS.forest}
            />

            <span
              style={{
                fontFamily: FONT_DISPLAY,
                fontSize: "22px",
                fontWeight: 600,
                color: COLORS.forest,
              }}
            >
              Vườn Nhỏ của Yến Duy
            </span>
          </button>

          {/* NAV */}

          <nav
            style={{
              display: "flex",
              gap: "4px",
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <NavButton
              active={view === "shop"}
              onClick={() =>
                setView("shop")
              }
              icon={<Store size={16} />}
              label="Cửa hàng"
            />

            <NavButton
              active={view === "orders"}
              onClick={() =>
                setView("orders")
              }
              icon={
                <ClipboardList size={16} />
              }
              label="Đơn của tôi"
            />

            <button
              onClick={() => { setLoginError(""); setLoginMode("login"); setShowUserLogin(true); }}
              style={{ display: "flex", alignItems: "center", gap: "6px", background: "transparent", color: COLORS.inkSoft, border: `1px solid ${COLORS.line}`, borderRadius: "8px", padding: "9px 12px", cursor: "pointer", fontSize: "14px", fontWeight: 500 }}
            >
              <Lock size={16} />
              {user ? user.username : "Đăng nhập"}
            </button>

            <button
              onClick={() => {
                setCartOpen(true);
                setCheckoutStep("cart");
              }}
              style={{
                position: "relative",
                marginLeft: "8px",
                background: COLORS.forest,
                color: "white",
                border: "none",
                borderRadius: "8px",
                padding: "9px 14px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: 500,
              }}
            >
              <ShoppingCart size={16} />

              Giỏ hàng

              {cartCount > 0 && (
                <span
                  style={{
                    background: COLORS.clay,
                    color: "white",
                    borderRadius: "999px",
                    fontSize: "11px",
                    padding: "1px 6px",
                    marginLeft: "2px",
                  }}
                >
                  {cartCount}
                </span>
              )}
            </button>
          </nav>
        </div>
      </header>

      {/* =====================================================
          SHOP
      ===================================================== */}

      {view === "shop" && (
        <ShopView
          products={filteredProducts}
          allCount={products.length}
          search={search}
          setSearch={setSearch}
          cat={cat}
          setCat={setCat}
          onAdd={addToCart}
        />
      )}

      {/* =====================================================
          ORDERS
      ===================================================== */}

      {view === "orders" && (
        <OrdersMineView
          orders={myOrders}
          onBrowse={() =>
            setView("shop")
          }
        />
      )}

 {/* =====================================================
    ADMIN
===================================================== */}

{view === "admin" && (
  <AdminView
    authed={adminAuthed}
    pwInput={pwInput}
    setPwInput={setPwInput}
    pwError={pwError}

    onLogin={async () => {
      try {
        const response = await fetch(`${API_URL}/api/admin/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: "admin",
            password: pwInput,
          }),
        });

        const data = await response.json();

        if (response.ok && data.success) {
          setAdminAuthed(true);
          setPwError(false);
          showToast("Đăng nhập thành công");
        } else {
          setPwError(true);
        }
      } catch (error) {
        console.error("Admin login error:", error);
        setPwError(true);
      }
    }}

    products={products}
    orders={orders}
    onDelete={deleteProduct}

    onEdit={(product) => {
      setEditingProduct(product);
      setShowForm(true);
    }}

    onAddNew={() => {
      setEditingProduct(null);
      setShowForm(true);
    }}

    onStatusChange={updateOrderStatus}
    onDeleteOrder={deleteOrder}
  />
)}

{/* =====================================================
    PRODUCT FORM
===================================================== */}

      {showUserLogin && (
        <UserLoginModal
          mode={loginMode}
          setMode={(mode) => { setLoginMode(mode); setLoginError(""); }}
          user={user}
          username={loginUsername}
          password={loginPassword}
          fullName={registerFullName}
          registerUsername={registerUsername}
          phone={registerPhone}
          address={registerAddress}
          registerPassword={registerPassword}
          confirmPassword={registerConfirmPassword}
          error={loginError}
          setUsername={setLoginUsername}
          setPassword={setLoginPassword}
          setFullName={setRegisterFullName}
          setRegisterUsername={setRegisterUsername}
          setPhone={setRegisterPhone}
          setAddress={setRegisterAddress}
          setRegisterPassword={setRegisterPassword}
          setConfirmPassword={setRegisterConfirmPassword}
          onLogin={handleUserLogin}
          onRegister={handleUserRegister}
          onLogout={logoutUser}
          onClose={() => { setShowUserLogin(false); setLoginError(""); }}
        />
      )}

      {showForm && (
        <ProductFormModal
          initial={editingProduct}
          onCancel={() => {
            setShowForm(false);
            setEditingProduct(null);
          }}
          onSave={upsertProduct}
        />
      )}

      {/* =====================================================
          CART
      ===================================================== */}

      {cartOpen && (
        <CartDrawer
          step={checkoutStep}
          items={cartItems}
          total={cartTotal}
          buyer={buyer}
          setBuyer={setBuyer}
          onClose={() => {
            setCartOpen(false);

            if (
              checkoutStep ===
              "done"
            ) {
              resetCheckout();
            }
          }}
          onChangeQty={changeQty}
          onRemove={removeFromCart}
          onCheckout={() =>
            setCheckoutStep("form")
          }
          onBackToCart={() =>
            setCheckoutStep("cart")
          }
          onPlaceOrder={placeOrder}
          onDone={resetCheckout}
        />
      )}

      {/* =====================================================
          TOAST
      ===================================================== */}

      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: "24px",
            left: "50%",
            transform:
              "translateX(-50%)",
            background:
              COLORS.forestDark,
            color: "white",
            padding: "11px 18px",
            borderRadius: "8px",
            fontSize: "14px",
            boxShadow:
              "0 6px 20px rgba(0,0,0,0.2)",
            zIndex: 100,
            maxWidth: "90vw",
            textAlign: "center",
          }}
        >
          {toast}
        </div>
      )}
    </div>
  );
}

/* =========================================================
   NAV BUTTON
========================================================= */

function UserLoginModal({ mode, setMode, user, username, password, fullName, registerUsername, phone, address, registerPassword, confirmPassword, error, setUsername, setPassword, setFullName, setRegisterUsername, setPhone, setAddress, setRegisterPassword, setConfirmPassword, onLogin, onRegister, onLogout, onClose }) {
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", background: "rgba(35,41,31,0.55)", backdropFilter: "blur(4px)" }}>
      <div onClick={(e) => e.stopPropagation()} style={{ position: "relative", width: "440px", maxWidth: "100%", maxHeight: "90vh", overflowY: "auto", background: COLORS.surface, borderRadius: "18px", padding: "26px", boxShadow: "0 20px 60px rgba(0,0,0,0.25)", fontFamily: FONT_BODY }}>
        <button onClick={onClose} style={{ position: "absolute", top: "14px", right: "14px", border: "none", background: "transparent", color: COLORS.inkSoft, cursor: "pointer" }}><X size={20} /></button>
        {user ? <div style={{ textAlign: "center" }}><Sprout size={34} color={COLORS.forest} /><h2 style={{ fontFamily: FONT_DISPLAY, color: COLORS.forest, margin: "10px 0 6px" }}>Xin chào, {user.full_name || user.username}</h2><p style={{ color: COLORS.inkSoft, fontSize: "14px", margin: "0 0 20px" }}>Tài khoản: {user.username}</p><button onClick={onLogout} style={{ width: "100%", background: COLORS.clay, color: "white", border: "none", borderRadius: "9px", padding: "11px", cursor: "pointer", fontWeight: 600 }}>Đăng xuất</button></div> : <>
          <div style={{ textAlign: "center", marginBottom: "18px" }}><Sprout size={30} color={COLORS.forest} /><h2 style={{ fontFamily: FONT_DISPLAY, color: COLORS.forest, margin: "8px 0 5px", fontSize: "24px" }}>Đăng Nhập Tài Khoản</h2><p style={{ margin: 0, color: COLORS.inkSoft, fontSize: "13px" }}>Chào mừng bạn quay lại với Vườn Nhỏ</p></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", background: COLORS.mossLight, padding: "5px", borderRadius: "10px", marginBottom: "18px" }}><button onClick={() => setMode("login")} style={{ border: "none", borderRadius: "7px", padding: "9px", cursor: "pointer", background: mode === "login" ? COLORS.surface : "transparent", color: COLORS.forest, fontWeight: 600 }}>Đăng nhập</button><button onClick={() => setMode("register")} style={{ border: "none", borderRadius: "7px", padding: "9px", cursor: "pointer", background: mode === "register" ? COLORS.surface : "transparent", color: COLORS.forest, fontWeight: 600 }}>Đăng ký</button></div>
          {error && <div style={{ background: COLORS.clayLight, color: COLORS.clay, borderRadius: "8px", padding: "10px 12px", marginBottom: "12px", fontSize: "13px", lineHeight: 1.45 }}>{error}</div>}
          {mode === "login" ? <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}><LoginField label="Tên đăng nhập" value={username} placeholder="Ví dụ: nguyenvana" onChange={(v) => setUsername(v.replace(/[^\p{L}]/gu, ""))} /><LoginField label="Mật khẩu" value={password} type="password" placeholder="Tối thiểu 7 ký tự" onChange={setPassword} /><button onClick={onLogin} style={{ width: "100%", background: COLORS.forest, color: "white", border: "none", borderRadius: "9px", padding: "12px", cursor: "pointer", fontWeight: 600 }}>Đăng nhập</button></div> : <div style={{ display: "flex", flexDirection: "column", gap: "11px" }}>
            <LoginField label="Họ và tên" value={fullName} placeholder="Nguyễn Văn A" onChange={(v) => setFullName(v.replace(/[^\p{L}\s]/gu, ""))} />
            <LoginField label="Tên đăng ký" value={registerUsername} placeholder="Chỉ dùng chữ cái" onChange={(v) => setRegisterUsername(v.replace(/[^\p{L}]/gu, ""))} />
            <LoginField label="Số điện thoại" value={phone} type="tel" placeholder="10 chữ số, ví dụ 0901234567" maxLength={10} onChange={(v) => setPhone(v.replace(/\D/g, "").slice(0, 10))} />
            <LoginField label="Địa chỉ" value={address} placeholder="Ví dụ: 123 Nguyen Trai Can Tho" onChange={(v) => setAddress(v.replace(/[^\p{L}\p{N}\s]/gu, ""))} />
            <LoginField label="Mật khẩu" value={registerPassword} type="password" placeholder="Tối thiểu 7 ký tự" onChange={setRegisterPassword} />
            <LoginField label="Nhập lại mật khẩu" value={confirmPassword} type="password" placeholder="Nhập lại mật khẩu" onChange={setConfirmPassword} />
            <button onClick={onRegister} style={{ width: "100%", background: COLORS.forest, color: "white", border: "none", borderRadius: "9px", padding: "12px", cursor: "pointer", fontWeight: 600 }}>Tạo tài khoản</button>
            <div style={{ background: COLORS.mossLight, borderRadius: "9px", padding: "10px 12px", fontSize: "12px", color: COLORS.inkSoft, lineHeight: 1.5 }}>• Tên đăng ký: chỉ chữ cái, không số/ký tự đặc biệt/emoji.<br />• Số điện thoại: đúng 10 số, bắt đầu bằng 0.<br />• Địa chỉ: chữ, số và khoảng trắng.<br />• Mật khẩu: từ 7 ký tự trở lên.</div>
          </div>}
        </>}
      </div>
    </div>
  );
}

function LoginField({ label, value, onChange, placeholder, type = "text", maxLength }) {
  return <label style={{ display: "flex", flexDirection: "column", gap: "5px", color: COLORS.inkSoft, fontSize: "13px" }}>{label}<input type={type} value={value} maxLength={maxLength} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} style={{ width: "100%", border: `1px solid ${COLORS.line}`, borderRadius: "8px", padding: "10px 11px", fontSize: "14px", color: COLORS.ink, outline: "none", fontFamily: FONT_BODY }} /></label>;
}

function NavButton({
  active,
  onClick,
  icon,
  label,
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "6px",
        background: active
          ? COLORS.mossLight
          : "transparent",
        color: active
          ? COLORS.forest
          : COLORS.inkSoft,
        border: "none",
        borderRadius: "8px",
        padding: "9px 12px",
        fontSize: "14px",
        fontWeight: 500,
        cursor: "pointer",
      }}
    >
      {icon}
      {label}
    </button>
  );
}


const PLANT_IMAGES = [
  "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=1000&q=85",
  "https://images.unsplash.com/photo-1497250681960-ef046c08a56e?auto=format&fit=crop&w=1000&q=85",
  "https://images.unsplash.com/photo-1512428813834-c702c7702b78?auto=format&fit=crop&w=1000&q=85",
  "https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?auto=format&fit=crop&w=1000&q=85",
];

function getProductImage(product, index = 0) {
  if (product?.image) return product.image;
  return PLANT_IMAGES[index % PLANT_IMAGES.length];
}

/* =========================================================
   SHOP VIEW
========================================================= */

function ShopView({
  products,
  allCount,
  search,
  setSearch,
  cat,
  setCat,
  onAdd,
}) {
  const featured = products.slice(0, 3);

  return (
    <div className="vn-shop">
      <section className="vn-hero">
        <div className="vn-hero-copy">
          <div className="vn-pill">
            <Sprout size={15} />
            Vườn xanh · Giao cây tận nơi
          </div>

          <h1>
            Mang một chút
            <span> xanh </span>
            vào góc nhỏ.
          </h1>

          <p>
            Cây được chọn lọc kỹ, chậu có gu và những món nhỏ
            giúp căn phòng trở nên dịu dàng hơn mỗi ngày.
          </p>

          <div className="vn-hero-actions">
            <button
              className="vn-primary-btn"
              onClick={() =>
                document.getElementById("vn-product-grid")?.scrollIntoView({
                  behavior: "smooth",
                  block: "start",
                })
              }
            >
              Khám phá cây
              <span>→</span>
            </button>

            <div className="vn-mini-note">
              <span className="vn-dot" />
              {allCount} sản phẩm đang có sẵn
            </div>
          </div>
        </div>

        <div className="vn-hero-art">
          <div className="vn-art-orbit vn-orbit-1" />
          <div className="vn-art-orbit vn-orbit-2" />

          <div className="vn-art-card">
            <img
              src={getProductImage(featured[0], 0)}
              alt="Cây xanh nổi bật"
              onError={(e) => {
                e.currentTarget.src = PLANT_IMAGES[0];
              }}
            />
            <div className="vn-art-label">
              <span>01</span>
              Góc xanh hôm nay
            </div>
          </div>

          <div className="vn-floating-card vn-float-top">
            <span className="vn-float-icon">☀️</span>
            <div>
              <strong>Nắng nhẹ</strong>
              <small>Hợp phòng sáng</small>
            </div>
          </div>

          <div className="vn-floating-card vn-float-bottom">
            <span className="vn-float-icon">♡</span>
            <div>
              <strong>Chọn cây có gu</strong>
              <small>Đẹp · dễ chăm · bền</small>
            </div>
          </div>
        </div>
      </section>

      <section className="vn-section-head">
        <div>
          <span className="vn-eyebrow">CURATED COLLECTION</span>
          <h2>Cây xinh cho từng khoảng nhỏ</h2>
          <p>{allCount} lựa chọn được sắp xếp để bạn tìm cây thật nhanh.</p>
        </div>

        <div className="vn-stat-box">
          <span>{allCount}</span>
          <small>mẫu đang bán</small>
        </div>
      </section>

      <section className="vn-toolbar">
        <div className="vn-search">
          <Search size={18} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm cây, chậu, phụ kiện..."
          />
          {search && (
            <button
              className="vn-clear-search"
              onClick={() => setSearch("")}
              aria-label="Xóa tìm kiếm"
            >
              <X size={15} />
            </button>
          )}
        </div>

        <div className="vn-categories">
          {CATS.map((category) => (
            <button
              key={category}
              className={cat === category ? "active" : ""}
              onClick={() => setCat(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </section>

      {products.length === 0 ? (
        <div className="vn-empty">
          <div className="vn-empty-icon">🌿</div>
          <h3>Chưa tìm thấy cây phù hợp</h3>
          <p>Thử đổi từ khóa hoặc chọn “Tất cả”.</p>
          <button
            className="vn-primary-btn"
            onClick={() => {
              setSearch("");
              setCat("Tất cả");
            }}
          >
            Xem tất cả
          </button>
        </div>
      ) : (
        <div id="vn-product-grid" className="vn-product-grid">
          {products.map((product, index) => {
            const stock = Number(product.stock ?? product.quantity ?? 0);
            const image = getProductImage(product, index);

            return (
              <article className="vn-product-card" key={product.id}>
                <div className="vn-product-image">
                  <img
                    src={image}
                    alt={product.name}
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.src = PLANT_IMAGES[index % PLANT_IMAGES.length];
                    }}
                  />

                  <div className="vn-product-badge">{product.category}</div>
                  <div className="vn-product-number">
                    {String(index + 1).padStart(2, "0")}
                  </div>
                </div>

                <div className="vn-product-body">
                  <div className="vn-product-topline">
                    <span className="vn-product-category">
                      {product.category}
                    </span>
                    <span className={stock > 0 ? "vn-stock" : "vn-stock out"}>
                      {stock > 0 ? `Còn ${stock}` : "Hết hàng"}
                    </span>
                  </div>

                  <h3>{product.name}</h3>

                  <p>
                    {product.desc ||
                      "Một lựa chọn xanh xinh xắn cho không gian của bạn."}
                  </p>

                  <div className="vn-product-footer">
                    <strong>{formatVND(product.price)}</strong>

                    <button
                      className="vn-add-btn"
                      disabled={stock <= 0}
                      onClick={() => onAdd(product.id)}
                    >
                      <Plus size={17} />
                      {stock <= 0 ? "Hết hàng" : "Thêm giỏ"}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <section className="vn-bottom-banner">
        <div className="vn-bottom-art">
          <img
            src={getProductImage(featured[1], 1)}
            alt="Cây trang trí"
            onError={(e) => {
              e.currentTarget.src = PLANT_IMAGES[1];
            }}
          />
        </div>

        <div>
          <span className="vn-eyebrow">A LITTLE GREEN</span>
          <h2>Không cần nhà thật lớn để có một khu vườn thật đẹp.</h2>
          <p>
            Chọn một chậu cây nhỏ, đặt cạnh cửa sổ và để căn phòng tự kể
            câu chuyện của mình.
          </p>
        </div>
      </section>
    </div>
  );
}

/* =========================================================
   CART DRAWER
========================================================= */
function CartDrawer({
  step,
  items,
  total,
  buyer,
  setBuyer,
  onClose,
  onChangeQty,
  onRemove,
  onCheckout,
  onBackToCart,
  onPlaceOrder,
  onDone,
}) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        display: "flex",
        justifyContent:
          "flex-end",
      }}
    >
      {/* OVERLAY */}

      <div
        onClick={onClose}
        style={{
          position: "absolute",
          inset: 0,
          background:
            "rgba(0,0,0,0.35)",
        }}
      />

      {/* DRAWER */}

      <div
        style={{
          position: "relative",
          width: "390px",
          maxWidth: "92vw",
          background:
            COLORS.surface,
          height: "100%",
          display: "flex",
          flexDirection:
            "column",
          fontFamily: FONT_BODY,
          boxShadow:
            "-8px 0 24px rgba(0,0,0,0.1)",
        }}
      >
        {/* HEADER */}

        <div
          style={{
            padding: "18px",
            borderBottom: `1px solid ${COLORS.line}`,
            display: "flex",
            alignItems:
              "center",
            justifyContent:
              "space-between",
          }}
        >
          <h2
            style={{
              fontFamily:
                FONT_DISPLAY,
              fontSize: "19px",
              margin: 0,
              color:
                COLORS.forest,
            }}
          >
            {step === "cart" &&
              "Giỏ hàng"}

            {step === "form" &&
              "Thông tin giao hàng"}

            {step === "done" &&
              "Đặt hàng thành công"}
          </h2>

          <button
            onClick={onClose}
            style={{
              background:
                "none",
              border: "none",
              cursor:
                "pointer",
              color:
                COLORS.inkSoft,
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* CONTENT */}

        <div
          style={{
            flex: 1,
            overflowY:
              "auto",
            padding: "18px",
          }}
        >
          {/* CART */}

          {step === "cart" &&
            (items.length === 0 ? (
              <div
                style={{
                  textAlign:
                    "center",
                  padding:
                    "40px 0",
                  color:
                    COLORS.inkSoft,
                }}
              >
                <ShoppingCart
                  size={40}
                  color={
                    COLORS.moss
                  }
                  style={{
                    marginBottom:
                      "10px",
                  }}
                />

                <p
                  style={{
                    margin: 0,
                    fontSize:
                      "14px",
                  }}
                >
                  Giỏ hàng
                  đang trống.
                </p>
              </div>
            ) : (
              <div
                style={{
                  display:
                    "flex",
                  flexDirection:
                    "column",
                  gap: "14px",
                }}
              >
                {items.map(
                  (item) => (
                    <div
                      key={
                        item.id
                      }
                      style={{
                        display:
                          "flex",
                        gap: "10px",
                        alignItems:
                          "center",
                      }}
                    >
                      <div
                        style={{
                          fontSize:
                            "28px",
                          width:
                            "38px",
                          textAlign:
                            "center",
                        }}
                      >
                        {item.icon ||
                          "🌿"}
                      </div>

                      <div
                        style={{
                          flex: 1,
                          minWidth: 0,
                        }}
                      >
                        <div
                          style={{
                            fontSize:
                              "14px",
                            fontWeight:
                              500,
                          }}
                        >
                          {item.name}
                        </div>

                        <div
                          style={{
                            fontSize:
                              "13px",
                            color:
                              COLORS.inkSoft,
                          }}
                        >
                          {formatVND(
                            item.price
                          )}
                        </div>
                      </div>

                      <div
                        style={{
                          display:
                            "flex",
                          alignItems:
                            "center",
                          gap: "6px",
                        }}
                      >
                        <button
                          onClick={() =>
                            onChangeQty(
                              item.id,
                              -1
                            )
                          }
                          style={
                            qtyBtnStyle
                          }
                        >
                          <Minus
                            size={
                              13
                            }
                          />
                        </button>

                        <span
                          style={{
                            fontSize:
                              "13px",
                            width:
                              "16px",
                            textAlign:
                              "center",
                          }}
                        >
                          {item.qty}
                        </span>

                        <button
                          onClick={() =>
                            onChangeQty(
                              item.id,
                              1
                            )
                          }
                          style={
                            qtyBtnStyle
                          }
                        >
                          <Plus
                            size={
                              13
                            }
                          />
                        </button>
                      </div>

                      <button
                        onClick={() =>
                          onRemove(
                            item.id
                          )
                        }
                        style={{
                          background:
                            "none",
                          border:
                            "none",
                          cursor:
                            "pointer",
                          color:
                            COLORS.clay,
                        }}
                      >
                        <Trash2
                          size={
                            15
                          }
                        />
                      </button>
                    </div>
                  )
                )}
              </div>
            ))}

          {/* FORM */}

          {step === "form" && (
            <div
              style={{
                display:
                  "flex",
                flexDirection:
                  "column",
                gap: "12px",
              }}
            >
              <Field
                label="Họ tên"
                value={
                  buyer.name
                }
                onChange={(
                  value
                ) =>
                  setBuyer({
                    ...buyer,
                    name: value,
                  })
                }
              />

              <Field
                label="Số điện thoại"
                value={
                  buyer.phone
                }
                onChange={(
                  value
                ) =>
                  setBuyer({
                    ...buyer,
                    phone: value,
                  })
                }
              />

              <Field
                label="Địa chỉ giao hàng"
                value={
                  buyer.address
                }
                onChange={(
                  value
                ) =>
                  setBuyer({
                    ...buyer,
                    address:
                      value,
                  })
                }
                multiline
              />
            </div>
          )}

          {/* DONE */}

          {step === "done" && (
            <div
              style={{
                textAlign:
                  "center",
                padding:
                  "30px 0",
              }}
            >
              <div
                style={{
                  width: "58px",
                  height:
                    "58px",
                  borderRadius:
                    "50%",
                  background:
                    COLORS.mossLight,
                  display:
                    "flex",
                  alignItems:
                    "center",
                  justifyContent:
                    "center",
                  margin:
                    "0 auto 14px",
                }}
              >
                <Check
                  size={28}
                  color={
                    COLORS.forest
                  }
                />
              </div>

              <h3
                style={{
                  fontFamily:
                    FONT_DISPLAY,
                  color:
                    COLORS.forest,
                  margin:
                    "0 0 8px",
                }}
              >
                Đặt hàng thành công
              </h3>

              <p
                style={{
                  fontSize:
                    "14px",
                  color:
                    COLORS.inkSoft,
                  lineHeight:
                    1.6,
                  margin: 0,
                }}
              >
                Cảm ơn bạn!
                <br />
                Đơn hàng đã
                được ghi nhận.
                <br />
                Bạn có thể
                xem đơn tại
                "Đơn của tôi".
              </p>
            </div>
          )}
        </div>

        {/* FOOTER */}

        {step !== "done" && (
          <div
            style={{
              padding: "18px",
              borderTop: `1px solid ${COLORS.line}`,
            }}
          >
            <div
              style={{
                display:
                  "flex",
                justifyContent:
                  "space-between",
                marginBottom:
                  "12px",
                fontSize:
                  "15px",
                fontWeight:
                  600,
              }}
            >
              <span>
                Tổng cộng
              </span>

              <span
                style={{
                  color:
                    COLORS.forest,
                }}
              >
                {formatVND(
                  total
                )}
              </span>
            </div>

            {step === "cart" ? (
              <button
                disabled={
                  items.length ===
                  0
                }
                onClick={
                  onCheckout
                }
                style={{
                  width:
                    "100%",
                  background:
                    items.length ===
                    0
                      ? COLORS.line
                      : COLORS.forest,
                  color:
                    items.length ===
                    0
                      ? COLORS.inkSoft
                      : "white",
                  border:
                    "none",
                  borderRadius:
                    "8px",
                  padding:
                    "12px",
                  fontSize:
                    "14px",
                  fontWeight:
                    600,
                  cursor:
                    items.length ===
                    0
                      ? "not-allowed"
                      : "pointer",
                }}
              >
                Tiến hành đặt hàng
              </button>
            ) : (
              <div
                style={{
                  display:
                    "flex",
                  gap: "8px",
                }}
              >
                <button
                  onClick={
                    onBackToCart
                  }
                  style={{
                    flex: 1,
                    background:
                      COLORS.surface,
                    border: `1px solid ${COLORS.line}`,
                    borderRadius:
                      "8px",
                    padding:
                      "12px",
                    fontSize:
                      "14px",
                    cursor:
                      "pointer",
                  }}
                >
                  Quay lại
                </button>

                <button
                  onClick={
                    onPlaceOrder
                  }
                  style={{
                    flex: 2,
                    background:
                      COLORS.forest,
                    color:
                      "white",
                    border:
                      "none",
                    borderRadius:
                      "8px",
                    padding:
                      "12px",
                    fontSize:
                      "14px",
                    fontWeight:
                      600,
                    cursor:
                      "pointer",
                  }}
                >
                  Xác nhận đặt hàng
                </button>
              </div>
            )}
          </div>
        )}

        {/* DONE FOOTER */}

        {step === "done" && (
          <div
            style={{
              padding: "18px",
              borderTop: `1px solid ${COLORS.line}`,
            }}
          >
            <button
              onClick={onDone}
              style={{
                width: "100%",
                background:
                  COLORS.forest,
                color: "white",
                border: "none",
                borderRadius:
                  "8px",
                padding: "12px",
                fontSize:
                  "14px",
                fontWeight: 600,
                cursor:
                  "pointer",
              }}
            >
              Đóng
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* =========================================================
   QUANTITY BUTTON
========================================================= */

const qtyBtnStyle = {
  width: "22px",
  height: "22px",
  borderRadius: "6px",
  border: `1px solid ${COLORS.line}`,
  background: COLORS.surface,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
};

/* =========================================================
   FIELD
========================================================= */

function Field({
  label,
  value,
  onChange,
  multiline,
}) {
  return (
    <label
      style={{
        display: "flex",
        flexDirection:
          "column",
        gap: "5px",
        fontSize: "13px",
        color:
          COLORS.inkSoft,
      }}
    >
      {label}

      {multiline ? (
        <textarea
          value={value}
          onChange={(e) =>
            onChange(
              e.target.value
            )
          }
          rows={3}
          style={{
            border: `1px solid ${COLORS.line}`,
            borderRadius:
              "8px",
            padding: "9px",
            fontSize:
              "14px",
            fontFamily:
              FONT_BODY,
            resize:
              "vertical",
            color:
              COLORS.ink,
            outline:
              "none",
          }}
        />
      ) : (
        <input
          value={value}
          onChange={(e) =>
            onChange(
              e.target.value
            )
          }
          style={{
            border: `1px solid ${COLORS.line}`,
            borderRadius:
              "8px",
            padding: "9px",
            fontSize:
              "14px",
            fontFamily:
              FONT_BODY,
            color:
              COLORS.ink,
            outline:
              "none",
          }}
        />
      )}
    </label>
  );
}

/* =========================================================
   MY ORDERS
========================================================= */

function OrdersMineView({
  orders,
  onBrowse,
}) {
  return (
    <div
      style={{
        maxWidth: "700px",
        margin: "0 auto",
        padding:
          "36px 20px 60px",
      }}
    >
      <h1
        style={{
          fontFamily:
            FONT_DISPLAY,
          fontSize: "26px",
          color:
            COLORS.forest,
          margin:
            "0 0 18px",
        }}
      >
        Đơn hàng của tôi
      </h1>

      {orders.length === 0 ? (
        <div
          style={{
            textAlign:
              "center",
            padding:
              "50px 0",
            color:
              COLORS.inkSoft,
          }}
        >
          <p
            style={{
              marginBottom:
                "14px",
            }}
          >
            Bạn chưa đặt
            đơn hàng nào.
          </p>

          <button
            onClick={onBrowse}
            style={{
              background:
                COLORS.forest,
              color: "white",
              border: "none",
              borderRadius:
                "8px",
              padding:
                "10px 18px",
              cursor:
                "pointer",
              fontSize:
                "14px",
            }}
          >
            Xem cửa hàng
          </button>
        </div>
      ) : (
        <div
          style={{
            display:
              "flex",
            flexDirection:
              "column",
            gap: "14px",
          }}
        >
          {orders.map(
            (order) => (
              <div
                key={
                  order.id
                }
                style={{
                  background:
                    COLORS.surface,
                  border: `1px solid ${COLORS.line}`,
                  borderRadius:
                    "10px",
                  padding:
                    "16px",
                }}
              >
                <div
                  style={{
                    display:
                      "flex",
                    justifyContent:
                      "space-between",
                    marginBottom:
                      "8px",
                    fontSize:
                      "13px",
                    color:
                      COLORS.inkSoft,
                    gap: "10px",
                    flexWrap:
                      "wrap",
                  }}
                >
                  <span>
                    Mã đơn:{" "}
                    {order.id}
                  </span>

                  <span
                    style={{
                      color:
                        COLORS.moss,
                      fontWeight:
                        600,
                    }}
                  >
                    {
                      order.status
                    }
                  </span>
                </div>

                <div
                  style={{
                    display:
                      "flex",
                    flexDirection:
                      "column",
                    gap: "4px",
                  }}
                >
                  {(order.items ||
                    []).map(
                    (
                      item,
                      index
                    ) => (
                      <div
                        key={`${item.productId}-${index}`}
                        style={{
                          display:
                            "flex",
                          justifyContent:
                            "space-between",
                          fontSize:
                            "14px",
                          gap: "10px",
                        }}
                      >
                        <span>
                          {
                            item.name
                          }{" "}
                          ×{" "}
                          {
                            item.qty
                          }
                        </span>

                        <span>
                          {formatVND(
                            Number(
                              item.price
                            ) *
                              Number(
                                item.qty
                              )
                          )}
                        </span>
                      </div>
                    )
                  )}
                </div>

                <div
                  style={{
                    borderTop: `1px solid ${COLORS.line}`,
                    marginTop:
                      "8px",
                    paddingTop:
                      "8px",
                    display:
                      "flex",
                    justifyContent:
                      "space-between",
                    fontWeight:
                      700,
                    fontSize:
                      "14px",
                  }}
                >
                  <span>
                    Tổng
                  </span>

                  <span
                    style={{
                      color:
                        COLORS.forest,
                    }}
                  >
                    {formatVND(
                      order.total
                    )}
                  </span>
                </div>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}

/* =========================================================
   ADMIN
========================================================= */

function AdminView({
  authed,
  pwInput,
  setPwInput,
  pwError,
  onLogin,
  products,
  orders,
  onDelete,
  onEdit,
  onAddNew,
  onStatusChange,
  onDeleteOrder,
}) {
  if (!authed) {
    return (
      <div
        style={{
          maxWidth: "360px",
          margin: "80px auto",
          padding: "0 20px",
          textAlign:
            "center",
        }}
      >
        <Lock
          size={28}
          color={
            COLORS.forest
          }
          style={{
            marginBottom:
              "10px",
          }}
        />

        <h2
          style={{
            fontFamily:
              FONT_DISPLAY,
            fontSize: "20px",
            color:
              COLORS.forest,
            margin:
              "0 0 6px",
          }}
        >
          Đăng nhập quản trị
        </h2>

        <p
          style={{
            fontSize: "13px",
            color:
              COLORS.inkSoft,
            marginBottom:
              "16px",
          }}
        >
         
        </p>

        <input
          type="password"
          value={pwInput}
          onChange={(e) =>
            setPwInput(
              e.target.value
            )
          }
          onKeyDown={(e) => {
            if (
              e.key ===
              "Enter"
            ) {
              onLogin();
            }
          }}
          placeholder="Mật khẩu"
          style={{
            width: "100%",
            border: `1px solid ${
              pwError
                ? COLORS.clay
                : COLORS.line
            }`,
            borderRadius:
              "8px",
            padding:
              "10px 12px",
            fontSize:
              "14px",
            marginBottom:
              "10px",
            fontFamily:
              FONT_BODY,
            outline:
              "none",
          }}
        />

        {pwError && (
          <p
            style={{
              color:
                COLORS.clay,
              fontSize:
                "12px",
              marginBottom:
                "10px",
            }}
          >
            Sai mật khẩu,
            thử lại.
          </p>
        )}

        <button
          onClick={onLogin}
          style={{
            width: "100%",
            background:
              COLORS.forest,
            color: "white",
            border: "none",
            borderRadius:
              "8px",
            padding:
              "11px",
            cursor:
              "pointer",
            fontSize:
              "14px",
            fontWeight:
              600,
          }}
        >
          Đăng nhập
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        maxWidth: "1000px",
        margin: "0 auto",
        padding:
          "36px 20px 60px",
      }}
    >
      {/* HEADER */}

      <div
        style={{
          display:
            "flex",
          justifyContent:
            "space-between",
          alignItems:
            "center",
          marginBottom:
            "20px",
          gap: "10px",
          flexWrap:
            "wrap",
        }}
      >
        <div>
          <h1
            style={{
              fontFamily:
                FONT_DISPLAY,
              fontSize:
                "26px",
              color:
                COLORS.forest,
              margin: 0,
            }}
          >
            Quản trị cửa hàng
          </h1>

          <p
            style={{
              margin:
                "5px 0 0",
              color:
                COLORS.inkSoft,
              fontSize:
                "13px",
            }}
          >
            Quản lý sản phẩm
            và đơn hàng
          </p>
        </div>

        <button
          onClick={onAddNew}
          style={{
            background:
              COLORS.forest,
            color: "white",
            border: "none",
            borderRadius:
              "8px",
            padding:
              "9px 14px",
            display:
              "flex",
            alignItems:
              "center",
            gap: "6px",
            cursor:
              "pointer",
            fontSize:
              "13px",
          }}
        >
          <Plus size={15} />
          Thêm sản phẩm
        </button>
      </div>

      {/* PRODUCTS */}

      <div
        style={{
          background:
            COLORS.surface,
          border: `1px solid ${COLORS.line}`,
          borderRadius:
            "10px",
          overflowX:
            "auto",
          marginBottom:
            "40px",
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse:
              "collapse",
            fontSize:
              "13px",
            minWidth:
              "650px",
          }}
        >
          <thead>
            <tr
              style={{
                background:
                  COLORS.mossLight,
                textAlign:
                  "left",
              }}
            >
              <th
                style={
                  thStyle
                }
              />

              <th
                style={
                  thStyle
                }
              >
                Tên
              </th>

              <th
                style={
                  thStyle
                }
              >
                Danh mục
              </th>

              <th
                style={
                  thStyle
                }
              >
                Giá
              </th>

              <th
                style={
                  thStyle
                }
              >
                Tồn kho
              </th>

              <th
                style={
                  thStyle
                }
              />
            </tr>
          </thead>

          <tbody>
            {products.map(
              (product) => (
                <tr
                  key={
                    product.id
                  }
                  style={{
                    borderTop: `1px solid ${COLORS.line}`,
                  }}
                >
                  <td
                    style={{
                      ...tdStyle,
                      fontSize:
                        "20px",
                    }}
                  >
                    {product.icon ||
                      "🌿"}
                  </td>

                  <td
                    style={
                      tdStyle
                    }
                  >
                    {
                      product.name
                    }
                  </td>

                  <td
                    style={
                      tdStyle
                    }
                  >
                    {
                      product.category
                    }
                  </td>

                  <td
                    style={
                      tdStyle
                    }
                  >
                    {formatVND(
                      product.price
                    )}
                  </td>

                  <td
                    style={
                      tdStyle
                    }
                  >
                    {
                      product.stock
                    }
                  </td>

                  <td
                    style={{
                      ...tdStyle,
                      display:
                        "flex",
                      gap: "8px",
                    }}
                  >
                    <button
                      onClick={() =>
                        onEdit(
                          product
                        )
                      }
                      style={
                        iconBtnStyle
                      }
                      title="Sửa"
                    >
                      <Pencil
                        size={
                          14
                        }
                      />
                    </button>

                    <button
                      onClick={() =>
                        onDelete(
                          product.id
                        )
                      }
                      style={{
                        ...iconBtnStyle,
                        color:
                          COLORS.clay,
                      }}
                      title="Xóa"
                    >
                      <Trash2
                        size={
                          14
                        }
                      />
                    </button>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>

      {/* ORDERS */}

      <h2
        style={{
          fontFamily:
            FONT_DISPLAY,
          fontSize:
            "22px",
          color:
            COLORS.forest,
          margin:
            "0 0 14px",
        }}
      >
        Đơn hàng (
        {orders.length})
      </h2>

      {orders.length === 0 ? (
        <div
          style={{
            background:
              COLORS.surface,
            border: `1px solid ${COLORS.line}`,
            borderRadius:
              "10px",
            padding:
              "30px",
            textAlign:
              "center",
            color:
              COLORS.inkSoft,
            fontSize:
              "14px",
          }}
        >
          Chưa có đơn
          hàng nào.
        </div>
      ) : (
        <div
          style={{
            display:
              "flex",
            flexDirection:
              "column",
            gap: "12px",
          }}
        >
          {orders.map(
            (order) => (
              <div
                key={
                  order.id
                }
                style={{
                  background:
                    COLORS.surface,
                  border: `1px solid ${COLORS.line}`,
                  borderRadius:
                    "10px",
                  padding:
                    "14px",
                }}
              >
                {/* BUYER + STATUS */}

                <div
                  style={{
                    display:
                      "flex",
                    justifyContent:
                      "space-between",
                    flexWrap:
                      "wrap",
                    gap: "8px",
                    marginBottom:
                      "8px",
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize:
                          "14px",
                        fontWeight:
                          600,
                      }}
                    >
                      {order.buyer
                        ?.name ||
                        "Không có tên"}{" "}
                      ·{" "}
                      {order.buyer
                        ?.phone ||
                        "Không có SĐT"}
                    </div>

                    <div
                      style={{
                        fontSize:
                          "12px",
                        color:
                          COLORS.inkSoft,
                        marginTop:
                          "3px",
                      }}
                    >
                      {order.buyer
                        ?.address ||
                        "Không có địa chỉ"}
                    </div>
                  </div>

<select
    value={order.status}
    onChange={(e) =>
        onStatusChange(
            order.id,
            e.target.value
        )
    }
>
    <option value="Chờ xử lý">
        Chờ xử lý
    </option>

    <option value="Đang chuẩn bị">
        Đang chuẩn bị
    </option>

    <option value="Đang giao">
        Đang giao
    </option>

    <option value="Đã giao">
        Đã giao
    </option>

    <option value="Đã hủy">
        Đã hủy
    </option>
</select>
                </div>

                {/* ITEMS */}

                <div
                  style={{
                    fontSize:
                      "13px",
                    color:
                      COLORS.inkSoft,
                    lineHeight:
                      1.6,
                  }}
                >
                  {(order.items ||
                    []).map(
                    (
                      item,
                      index
                    ) => (
                      <div
                        key={`${item.productId}-${index}`}
                      >
                        {item.name}{" "}
                        ×{" "}
                        {
                          item.qty
                        }
                      </div>
                    )
                  )}
                </div>

                {/* TOTAL */}

                <div
                  style={{
                    borderTop: `1px solid ${COLORS.line}`,
                    marginTop:
                      "8px",
                    paddingTop:
                      "8px",
                    display:
                      "flex",
                    justifyContent:
                      "space-between",
                    fontWeight:
                      700,
                    fontSize:
                      "13px",
                  }}
                >
                  <span>
                    Tổng đơn
                  </span>

                  <span
                    style={{
                      color:
                        COLORS.forest,
                    }}
                  >
                    {formatVND(
                      order.total
                    )}
                  </span>
                </div>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}

/* =========================================================
   ADMIN TABLE STYLES
========================================================= */

const thStyle = {
  padding: "10px 12px",
  fontWeight: 600,
  color: COLORS.forest,
};

const tdStyle = {
  padding: "10px 12px",
  verticalAlign: "middle",
};

const iconBtnStyle = {
  background: "none",
  border: "none",
  cursor: "pointer",
  color: COLORS.inkSoft,
  padding: "2px",
};

/* =========================================================
   PRODUCT FORM
========================================================= */

function ProductFormModal({
  initial,
  onCancel,
  onSave,
}) {
  const [form, setForm] =
    useState(() => {
      if (initial) {
        return {
          ...initial,
          desc:
            initial.desc ||
            initial.description ||
            "",
          price:
            initial.price ??
            "",
          stock:
            initial.stock ??
            "",
          icon:
            initial.icon ||
            "🌿",
        };
      }

      return {
        name: "",
        desc: "",
        price: "",
        category: CATS[1],
        stock: "",
        icon: "🌿",
      };
    });

  function setField(
    key,
    value
  ) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function handleSubmit() {
    if (!form.name.trim()) {
      alert(
        "Vui lòng nhập tên sản phẩm"
      );
      return;
    }

    if (
      form.price === "" ||
      Number(form.price) < 0
    ) {
      alert(
        "Vui lòng nhập giá hợp lệ"
      );
      return;
    }

    if (
      form.stock === "" ||
      Number(form.stock) < 0
    ) {
      alert(
        "Vui lòng nhập tồn kho"
      );
      return;
    }

    onSave({
      ...form,
      price: Number(
        form.price
      ),
      stock: Number(
        form.stock
      ),
      desc:
        form.desc || "",
      icon:
        form.icon || "🌿",
    });
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 60,
        display: "flex",
        alignItems:
          "center",
        justifyContent:
          "center",
        fontFamily:
          FONT_BODY,
      }}
    >
      {/* OVERLAY */}

      <div
        onClick={onCancel}
        style={{
          position:
            "absolute",
          inset: 0,
          background:
            "rgba(0,0,0,0.4)",
        }}
      />

      {/* MODAL */}

      <div
        style={{
          position:
            "relative",
          background:
            COLORS.surface,
          borderRadius:
            "12px",
          padding: "24px",
          width: "420px",
          maxWidth:
            "90vw",
          maxHeight:
            "85vh",
          overflowY:
            "auto",
          boxShadow:
            "0 20px 60px rgba(0,0,0,0.2)",
        }}
      >
        <div
          style={{
            display:
              "flex",
            justifyContent:
              "space-between",
            alignItems:
              "center",
            marginBottom:
              "16px",
          }}
        >
          <h3
            style={{
              fontFamily:
                FONT_DISPLAY,
              fontSize:
                "19px",
              color:
                COLORS.forest,
              margin: 0,
            }}
          >
            {initial
              ? "Sửa sản phẩm"
              : "Thêm sản phẩm mới"}
          </h3>

          <button
            onClick={
              onCancel
            }
            style={{
              background:
                "none",
              border: "none",
              cursor:
                "pointer",
              color:
                COLORS.inkSoft,
            }}
          >
            <X size={18} />
          </button>
        </div>

        <div
          style={{
            display:
              "flex",
            flexDirection:
              "column",
            gap: "12px",
          }}
        >
          <Field
            label="Tên sản phẩm"
            value={
              form.name
            }
            onChange={(
              value
            ) =>
              setField(
                "name",
                value
              )
            }
          />

          <Field
            label="Mô tả"
            value={
              form.desc
            }
            onChange={(
              value
            ) =>
              setField(
                "desc",
                value
              )
            }
            multiline
          />

          <div
            style={{
              display:
                "flex",
              gap: "10px",
            }}
          >
            <div
              style={{
                flex: 1,
              }}
            >
              <Field
                label="Giá (đ)"
                value={
                  form.price
                }
                onChange={(
                  value
                ) =>
                  setField(
                    "price",
                    value.replace(
                      /\D/g,
                      ""
                    )
                  )
                }
              />
            </div>

            <div
              style={{
                flex: 1,
              }}
            >
              <Field
                label="Tồn kho"
                value={
                  form.stock
                }
                onChange={(
                  value
                ) =>
                  setField(
                    "stock",
                    value.replace(
                      /\D/g,
                      ""
                    )
                  )
                }
              />
            </div>
          </div>

          <label
            style={{
              display:
                "flex",
              flexDirection:
                "column",
              gap: "5px",
              fontSize:
                "13px",
              color:
                COLORS.inkSoft,
            }}
          >
            Danh mục

            <select
              value={
                form.category
              }
              onChange={(e) =>
                setField(
                  "category",
                  e.target.value
                )
              }
              style={{
                border: `1px solid ${COLORS.line}`,
                borderRadius:
                  "8px",
                padding:
                  "9px",
                fontSize:
                  "14px",
                outline:
                  "none",
                background:
                  COLORS.surface,
              }}
            >
              {CATS.filter(
                (category) =>
                  category !==
                  "Tất cả"
              ).map(
                (
                  category
                ) => (
                  <option
                    key={
                      category
                    }
                    value={
                      category
                    }
                  >
                    {category}
                  </option>
                )
              )}
            </select>
          </label>

          <Field
            label="Icon (emoji)"
            value={
              form.icon
            }
            onChange={(
              value
            ) =>
              setField(
                "icon",
                value
              )
            }
          />

          <button
            onClick={
              handleSubmit
            }
            style={{
              marginTop:
                "6px",
              background:
                COLORS.forest,
              color:
                "white",
              border:
                "none",
              borderRadius:
                "8px",
              padding:
                "11px",
              cursor:
                "pointer",
              fontWeight:
                600,
              fontSize:
                "14px",
            }}
          >
            {initial
              ? "Lưu thay đổi"
              : "Thêm sản phẩm"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;