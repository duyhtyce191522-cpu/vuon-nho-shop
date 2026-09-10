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
} from "lucide-react";

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

    if (value === null) {
      return fallback;
    }

    return JSON.parse(value);
  } catch (error) {
    console.error("Storage error:", error);
    return fallback;
  }
}

function setStorage(key, value) {
  try {
    localStorage.setItem(
      key,
      JSON.stringify(value)
    );
  } catch (error) {
    console.error(
      "Storage save error:",
      error
    );
  }
}

// ============================================================
// MAIN APP
// ============================================================

export default function PlantShop() {
  const [view, setView] = useState("shop");

  const [products, setProducts] = useState(null);

  // Orders lấy từ Backend
  const [orders, setOrders] = useState([]);

  // Chỉ lưu ID đơn hàng của khách
  const [myOrderIds, setMyOrderIds] = useState(() =>
    getStorage("my-order-ids", [])
  );

  const [cart, setCart] = useState({});
  const [cartOpen, setCartOpen] = useState(false);

  const [search, setSearch] = useState("");
  const [cat, setCat] = useState("Tất cả");

  const [checkoutStep, setCheckoutStep] =
    useState("cart");

  const [buyer, setBuyer] = useState({
    name: "",
    phone: "",
    address: "",
  });

  const [loading, setLoading] =
    useState(true);

  const [toast, setToast] = useState(null);

  const [adminAuthed, setAdminAuthed] =
    useState(false);

  const [pwInput, setPwInput] =
    useState("");

  const [pwError, setPwError] =
    useState(false);

  const [editingProduct, setEditingProduct] =
    useState(null);

  const [showForm, setShowForm] =
    useState(false);

  // ============================================================
  // TOAST
  // ============================================================

  function showToast(msg) {
    setToast(msg);

    setTimeout(() => {
      setToast(null);
    }, 2200);
  }

  // ============================================================
  // LOAD DATA FROM BACKEND
  // ============================================================

  useEffect(() => {
    async function loadData() {
      try {
        // --------------------------------------------------------
        // LOAD PRODUCTS
        // --------------------------------------------------------

        const productResponse =
          await fetch(
            `${API_URL}/api/products`
          );

        if (!productResponse.ok) {
          throw new Error(
            "Không thể lấy sản phẩm từ Backend"
          );
        }

        const productData =
          await productResponse.json();

        setProducts(productData);

        // --------------------------------------------------------
        // LOAD ORDERS
        // --------------------------------------------------------

        const orderResponse =
          await fetch(
            `${API_URL}/api/orders`
          );

        if (!orderResponse.ok) {
          throw new Error(
            "Không thể lấy đơn hàng từ Backend"
          );
        }

        const orderData =
          await orderResponse.json();

        setOrders(orderData);
      } catch (error) {
        console.error(
          "Load data error:",
          error
        );

        // Nếu Backend không hoạt động
        // thì sản phẩm dùng dữ liệu mẫu
        setProducts(SEED_PRODUCTS);

        // Orders không dùng localStorage nữa
        setOrders([]);

        showToast(
          "Không kết nối được Backend"
        );
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // ============================================================
  // CART
  // ============================================================

  const cartItems = useMemo(() => {
    if (!products) {
      return [];
    }

    return Object.entries(cart)
      .filter(([, qty]) => qty > 0)
      .map(([id, qty]) => {
        const product =
          products.find(
            (p) =>
              String(p.id) ===
              String(id)
          );

        if (!product) {
          return null;
        }

        return {
          ...product,
          qty,
        };
      })
      .filter(Boolean);
  }, [cart, products]);

  const cartTotal = cartItems.reduce(
    (sum, item) =>
      sum + item.price * item.qty,
    0
  );

  const cartCount = cartItems.reduce(
    (sum, item) =>
      sum + item.qty,
    0
  );

  // ============================================================
  // ADD TO CART
  // ============================================================

  function addToCart(id) {
    const product =
      products?.find(
        (p) =>
          String(p.id) ===
          String(id)
      );

    if (!product) {
      return;
    }

    if (product.stock <= 0) {
      showToast(
        "Sản phẩm đã hết hàng"
      );
      return;
    }

    setCart((current) => {
      const currentQty =
        current[id] || 0;

      if (
        currentQty >=
        product.stock
      ) {
        showToast(
          "Đã đạt số lượng tồn kho"
        );

        return current;
      }

      return {
        ...current,
        [id]: currentQty + 1,
      };
    });

    showToast(
      "Đã thêm vào giỏ"
    );
  }

  // ============================================================
  // CHANGE QUANTITY
  // ============================================================

  function changeQty(id, delta) {
    const product =
      products?.find(
        (p) =>
          String(p.id) ===
          String(id)
      );

    setCart((current) => {
      const currentQty =
        current[id] || 0;

      let newQty =
        currentQty + delta;

      if (newQty < 0) {
        newQty = 0;
      }

      if (
        product &&
        newQty > product.stock
      ) {
        newQty = product.stock;

        showToast(
          "Không đủ số lượng trong kho"
        );
      }

      const next = {
        ...current,
      };

      if (newQty === 0) {
        delete next[id];
      } else {
        next[id] = newQty;
      }

      return next;
    });
  }

  // ============================================================
  // REMOVE FROM CART
  // ============================================================

  function removeFromCart(id) {
    setCart((current) => {
      const next = {
        ...current,
      };

      delete next[id];

      return next;
    });
  }

  // ============================================================
  // ORDER - CREATE
  // ============================================================

  async function placeOrder() {
    if (
      !buyer.name.trim() ||
      !buyer.phone.trim() ||
      !buyer.address.trim()
    ) {
      showToast(
        "Vui lòng điền đủ thông tin"
      );
      return;
    }

    if (cartItems.length === 0) {
      showToast(
        "Giỏ hàng đang trống"
      );
      return;
    }

    const order = {
      items: cartItems.map(
        (item) => ({
          productId: item.id,
          name: item.name,
          price: item.price,
          qty: item.qty,
        })
      ),

      total: cartTotal,

      buyer: {
        name: buyer.name.trim(),
        phone: buyer.phone.trim(),
        address:
          buyer.address.trim(),
      },
    };

    try {
      const response =
        await fetch(
          `${API_URL}/api/orders`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify(
              order
            ),
          }
        );

      if (!response.ok) {
        const errorData =
          await response
            .json()
            .catch(() => ({}));

        throw new Error(
          errorData.message ||
            "Không thể tạo đơn hàng"
        );
      }

      const savedOrder =
        await response.json();

      // --------------------------------------------------------
      // SAVE MY ORDER ID
      // --------------------------------------------------------

      const nextMyOrderIds = [
        savedOrder.id,
        ...(myOrderIds || []),
      ];

      setMyOrderIds(
        nextMyOrderIds
      );

      setStorage(
        "my-order-ids",
        nextMyOrderIds
      );

      // --------------------------------------------------------
      // UPDATE FRONTEND ORDERS
      // --------------------------------------------------------

      setOrders((current) => [
        savedOrder,
        ...(current || []),
      ]);

      // --------------------------------------------------------
      // CLEAR CART
      // --------------------------------------------------------

      setCart({});

      // --------------------------------------------------------
      // DONE
      // --------------------------------------------------------

      setCheckoutStep(
        "done"
      );

      showToast(
        "Đặt hàng thành công"
      );
    } catch (error) {
      console.error(
        "Order error:",
        error
      );

      showToast(
        error.message ||
          "Đặt hàng thất bại"
      );
    }
  }

  // ============================================================
  // RESET CHECKOUT
  // ============================================================

  function resetCheckout() {
    setCheckoutStep("cart");

    setCartOpen(false);

    setBuyer({
      name: "",
      phone: "",
      address: "",
    });
  }

  // ============================================================
  // ORDER - UPDATE STATUS
  // ============================================================

  async function updateOrderStatus(
    id,
    status
  ) {
    try {
      const response =
        await fetch(
          `${API_URL}/api/orders/${id}`,
          {
            method: "PUT",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              status,
            }),
          }
        );

      if (!response.ok) {
        const errorData =
          await response
            .json()
            .catch(() => ({}));

        throw new Error(
          errorData.message ||
            "Không thể cập nhật trạng thái đơn hàng"
        );
      }

      const updatedOrder =
        await response.json();

      setOrders((current) =>
        (current || []).map(
          (order) =>
            String(order.id) ===
            String(
              updatedOrder.id
            )
              ? updatedOrder
              : order
        )
      );

      showToast(
        "Đã cập nhật trạng thái đơn hàng"
      );
    } catch (error) {
      console.error(
        "Update order error:",
        error
      );

      showToast(
        error.message ||
          "Cập nhật trạng thái thất bại"
      );
    }
  }

  // ============================================================
  // PRODUCT CRUD - DELETE
  // ============================================================

  async function deleteProduct(id) {
    const confirmed =
      window.confirm(
        "Bạn có chắc muốn xóa sản phẩm này không?"
      );

    if (!confirmed) {
      return;
    }

    try {
      const response =
        await fetch(
          `${API_URL}/api/products/${id}`,
          {
            method: "DELETE",
          }
        );

      if (!response.ok) {
        const errorData =
          await response
            .json()
            .catch(() => ({}));

        throw new Error(
          errorData.message ||
            "Không thể xóa sản phẩm"
        );
      }

      setProducts((current) =>
        (current || []).filter(
          (product) =>
            String(product.id) !==
            String(id)
        )
      );

      // Xóa sản phẩm khỏi giỏ
      setCart((current) => {
        const next = {
          ...current,
        };

        delete next[id];

        return next;
      });

      showToast(
        "Đã xóa sản phẩm"
      );
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

  // ============================================================
  // PRODUCT CRUD - CREATE / UPDATE
  // ============================================================

  async function upsertProduct(
    product
  ) {
    try {
      const isEditing =
        Boolean(product.id);

      const url = isEditing
        ? `${API_URL}/api/products/${product.id}`
        : `${API_URL}/api/products`;

      const method = isEditing
        ? "PUT"
        : "POST";

      const productData = {
        name:
          product.name.trim(),

        desc: product.desc
          ? product.desc.trim()
          : "",

        price:
          Number(product.price) ||
          0,

        category:
          product.category,

        stock:
          Number(product.stock) ||
          0,

        icon:
          product.icon || "🌱",
      };

      const response =
        await fetch(url, {
          method,

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify(
            productData
          ),
        });

      if (!response.ok) {
        const errorData =
          await response
            .json()
            .catch(() => ({}));

        throw new Error(
          errorData.message ||
            "Không thể lưu sản phẩm"
        );
      }

      const savedProduct =
        await response.json();

      setProducts((current) => {
        if (isEditing) {
          return (
            current || []
          ).map(
            (item) =>
              String(item.id) ===
              String(
                savedProduct.id
              )
                ? savedProduct
                : item
          );
        }

        return [
          ...(current || []),
          savedProduct,
        ];
      });

      setEditingProduct(null);
      setShowForm(false);

      showToast(
        isEditing
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

  // ============================================================
  // FILTER PRODUCTS
  // ============================================================

  const filtered =
    (products || []).filter(
      (product) => {
        const matchCat =
          cat === "Tất cả" ||
          product.category ===
            cat;

        const matchSearch =
          product.name
            .toLowerCase()
            .includes(
              search.toLowerCase()
            );

        return (
          matchCat &&
          matchSearch
        );
      }
    );

  // ============================================================
  // MY ORDERS
  // ============================================================

  const myOrders =
    (orders || []).filter(
      (order) =>
        myOrderIds.some(
          (id) =>
            String(id) ===
            String(order.id)
        )
    );

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div
        style={{
          background:
            COLORS.bg,
          minHeight: "100vh",
          display: "flex",
          alignItems:
            "center",
          justifyContent:
            "center",
          fontFamily:
            FONT_BODY,
          color:
            COLORS.inkSoft,
        }}
      >
        Đang tải cửa hàng...
      </div>
    );
  }

  // ============================================================
  // MAIN UI
  // ============================================================

  return (
    <div
      style={{
        background:
          COLORS.bg,
        minHeight: "100vh",
        fontFamily:
          FONT_BODY,
        color: COLORS.ink,
        position:
          "relative",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Inter:wght@400;500;600;700&display=swap');

        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
        }

        button,
        input,
        textarea,
        select {
          font-family: inherit;
        }
      `}</style>

      {/* ========================================================
          HEADER
      ======================================================== */}

      <header
        style={{
          borderBottom:
            `1px solid ${COLORS.line}`,
          background:
            COLORS.surface,
        }}
      >
        <div
          style={{
            maxWidth:
              "1000px",
            margin:
              "0 auto",
            padding:
              "18px 20px",
            display:
              "flex",
            alignItems:
              "center",
            justifyContent:
              "space-between",
            gap: "12px",
            flexWrap:
              "wrap",
          }}
        >
          <div
            style={{
              display:
                "flex",
              alignItems:
                "center",
              gap: "10px",
            }}
          >
            <Sprout
              size={22}
              color={
                COLORS.forest
              }
            />

            <span
              style={{
                fontFamily:
                  FONT_DISPLAY,
                fontSize:
                  "22px",
                fontWeight:
                  600,
                color:
                  COLORS.forest,
              }}
            >
              Vườn Nhỏ
            </span>
          </div>

          <nav
            style={{
              display:
                "flex",
              gap: "4px",
              alignItems:
                "center",
              flexWrap:
                "wrap",
            }}
          >
            <NavButton
              active={
                view ===
                "shop"
              }
              onClick={() =>
                setView(
                  "shop"
                )
              }
              icon={
                <Store
                  size={16}
                />
              }
              label="Cửa hàng"
            />

            <NavButton
              active={
                view ===
                "orders"
              }
              onClick={() =>
                setView(
                  "orders"
                )
              }
              icon={
                <ClipboardList
                  size={16}
                />
              }
              label="Đơn của tôi"
            />

            <NavButton
              active={
                view ===
                "admin"
              }
              onClick={() =>
                setView(
                  "admin"
                )
              }
              icon={
                <Settings
                  size={16}
                />
              }
              label="Quản trị"
            />

            <button
              onClick={() =>
                setCartOpen(
                  true
                )
              }
              style={{
                position:
                  "relative",
                marginLeft:
                  "8px",
                background:
                  COLORS.forest,
                color:
                  "white",
                border:
                  "none",
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
                  "14px",
                fontWeight:
                  500,
              }}
            >
              <ShoppingCart
                size={16}
              />

              Giỏ hàng

              {cartCount >
                0 && (
                <span
                  style={{
                    background:
                      COLORS.clay,
                    color:
                      "white",
                    borderRadius:
                      "999px",
                    fontSize:
                      "11px",
                    padding:
                      "1px 6px",
                    marginLeft:
                      "2px",
                  }}
                >
                  {cartCount}
                </span>
              )}
            </button>
          </nav>
        </div>
      </header>

      {/* ========================================================
          SHOP
      ======================================================== */}

      {view ===
        "shop" && (
        <ShopView
          products={
            filtered
          }
          allCount={
            (
              products ||
              []
            ).length
          }
          search={
            search
          }
          setSearch={
            setSearch
          }
          cat={cat}
          setCat={setCat}
          onAdd={
            addToCart
          }
        />
      )}

      {/* ========================================================
          ORDERS
      ======================================================== */}

      {view ===
        "orders" && (
        <OrdersMineView
          orders={
            myOrders
          }
          onBrowse={() =>
            setView(
              "shop"
            )
          }
        />
      )}

      {/* ========================================================
          ADMIN
      ======================================================== */}

      {view ===
        "admin" && (
        <AdminView
          authed={
            adminAuthed
          }
          pwInput={
            pwInput
          }
          setPwInput={
            setPwInput
          }
          pwError={
            pwError
          }
          onLogin={() => {
            if (
              pwInput ===
              "admin123"
            ) {
              setAdminAuthed(
                true
              );

              setPwError(
                false
              );

              showToast(
                "Đăng nhập thành công"
              );
            } else {
              setPwError(
                true
              );
            }
          }}
          products={
            products || []
          }
          orders={
            orders || []
          }
          onDelete={
            deleteProduct
          }
          onEdit={(
            product
          ) => {
            setEditingProduct(
              product
            );

            setShowForm(
              true
            );
          }}
          onAddNew={() => {
            setEditingProduct(
              null
            );

            setShowForm(
              true
            );
          }}
          onStatusChange={
            updateOrderStatus
          }
        />
      )}

      {/* ========================================================
          PRODUCT FORM
      ======================================================== */}

      {showForm && (
        <ProductFormModal
          initial={
            editingProduct
          }
          onCancel={() => {
            setShowForm(
              false
            );

            setEditingProduct(
              null
            );
          }}
          onSave={
            upsertProduct
          }
        />
      )}

      {/* ========================================================
          CART
      ======================================================== */}

      {cartOpen && (
        <CartDrawer
          step={
            checkoutStep
          }
          items={
            cartItems
          }
          total={
            cartTotal
          }
          buyer={
            buyer
          }
          setBuyer={
            setBuyer
          }
          onClose={() => {
            setCartOpen(
              false
            );

            if (
              checkoutStep ===
              "done"
            ) {
              resetCheckout();
            }
          }}
          onChangeQty={
            changeQty
          }
          onRemove={
            removeFromCart
          }
          onCheckout={() =>
            setCheckoutStep(
              "form"
            )
          }
          onBackToCart={() =>
            setCheckoutStep(
              "cart"
            )
          }
          onPlaceOrder={
            placeOrder
          }
          onDone={
            resetCheckout
          }
        />
      )}

      {/* ========================================================
          TOAST
      ======================================================== */}

      {toast && (
        <div
          style={{
            position:
              "fixed",
            bottom:
              "24px",
            left:
              "50%",
            transform:
              "translateX(-50%)",
            background:
              COLORS.forestDark,
            color:
              "white",
            padding:
              "10px 18px",
            borderRadius:
              "8px",
            fontSize:
              "14px",
            boxShadow:
              "0 6px 20px rgba(0,0,0,0.2)",
            zIndex:
              100,
          }}
        >
          {toast}
        </div>
      )}
    </div>
  );
}

// ============================================================
// NAV BUTTON
// ============================================================

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
        display:
          "flex",
        alignItems:
          "center",
        gap: "6px",
        background:
          active
            ? COLORS.mossLight
            : "transparent",
        color:
          active
            ? COLORS.forest
            : COLORS.inkSoft,
        border:
          "none",
        borderRadius:
          "8px",
        padding:
          "9px 12px",
        fontSize:
          "14px",
        fontWeight:
          500,
        cursor:
          "pointer",
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

function ShopView({
  products,
  allCount,
  search,
  setSearch,
  cat,
  setCat,
  onAdd,
}) {
  return (
    <div
      style={{
        maxWidth:
          "1000px",
        margin:
          "0 auto",
        padding:
          "36px 20px 60px",
      }}
    >
      <div
        style={{
          marginBottom:
            "28px",
          textAlign:
            "center",
        }}
      >
        <h1
          style={{
            fontFamily:
              FONT_DISPLAY,
            fontSize:
              "34px",
            fontWeight:
              600,
            color:
              COLORS.forest,
            margin:
              0,
            lineHeight:
              1.15,
          }}
        >
          Cây xanh cho góc nhỏ của bạn
        </h1>

        <p
          style={{
            color:
              COLORS.inkSoft,
            marginTop:
              "8px",
            fontSize:
              "15px",
            maxWidth:
              "480px",
            marginLeft:
              "auto",
            marginRight:
              "auto",
          }}
        >
          {allCount} loại cây và chậu đang
          có sẵn, chọn lọc và giao tận nơi
          trong ngày.
        </p>
      </div>

      <div
        style={{
          display:
            "flex",
          gap: "12px",
          alignItems:
            "center",
          marginBottom:
            "22px",
          flexWrap:
            "wrap",
        }}
      >
        <div
          style={{
            display:
              "flex",
            alignItems:
              "center",
            gap: "8px",
            background:
              COLORS.surface,
            border:
              `1px solid ${COLORS.line}`,
            borderRadius:
              "8px",
            padding:
              "8px 12px",
            flex:
              "1 1 220px",
          }}
        >
          <Search
            size={16}
            color={
              COLORS.inkSoft
            }
          />

          <input
            value={
              search
            }
            onChange={(
              e
            ) =>
              setSearch(
                e.target
                  .value
              )
            }
            placeholder="Tìm tên cây..."
            style={{
              border:
                "none",
              outline:
                "none",
              fontSize:
                "14px",
              flex: 1,
              background:
                "transparent",
              fontFamily:
                FONT_BODY,
            }}
          />
        </div>

        <div
          style={{
            display:
              "flex",
            gap: "6px",
            flexWrap:
              "wrap",
          }}
        >
          {CATS.map(
            (c) => (
              <button
                key={c}
                onClick={() =>
                  setCat(
                    c
                  )
                }
                style={{
                  border:
                    `1px solid ${
                      cat === c
                        ? COLORS.forest
                        : COLORS.line
                    }`,
                  background:
                    cat === c
                      ? COLORS.forest
                      : COLORS.surface,
                  color:
                    cat === c
                      ? "white"
                      : COLORS.inkSoft,
                  borderRadius:
                    "999px",
                  padding:
                    "7px 14px",
                  fontSize:
                    "13px",
                  cursor:
                    "pointer",
                }}
              >
                {c}
              </button>
            )
          )}
        </div>
      </div>

      {products.length ===
      0 ? (
        <div
          style={{
            padding:
              "60px 0",
            textAlign:
              "center",
            color:
              COLORS.inkSoft,
          }}
        >
          Không tìm thấy sản phẩm phù hợp.
        </div>
      ) : (
        <div
          style={{
            display:
              "grid",
            gridTemplateColumns:
              "repeat(auto-fill, minmax(220px, 1fr))",
            gap:
              "18px",
          }}
        >
          {products.map(
            (p) => (
              <div
                key={
                  p.id
                }
                style={{
                  background:
                    COLORS.surface,
                  border:
                    `1px solid ${COLORS.line}`,
                  borderRadius:
                    "12px",
                  overflow:
                    "hidden",
                  display:
                    "flex",
                  flexDirection:
                    "column",
                }}
              >
                <div
                  style={{
                    background:
                      COLORS.mossLight,
                    height:
                      "120px",
                    display:
                      "flex",
                    alignItems:
                      "center",
                    justifyContent:
                      "center",
                    fontSize:
                      "48px",
                  }}
                >
                  {p.icon}
                </div>

                <div
                  style={{
                    padding:
                      "14px",
                    display:
                      "flex",
                    flexDirection:
                      "column",
                    gap:
                      "6px",
                    flex: 1,
                  }}
                >
                  <span
                    style={{
                      fontSize:
                        "11px",
                      color:
                        COLORS.moss,
                      fontWeight:
                        600,
                    }}
                  >
                    {p.category}
                  </span>

                  <h3
                    style={{
                      fontFamily:
                        FONT_DISPLAY,
                      fontSize:
                        "17px",
                      margin:
                        0,
                      color:
                        COLORS.ink,
                      fontWeight:
                        600,
                    }}
                  >
                    {p.name}
                  </h3>

                  <p
                    style={{
                      fontSize:
                        "13px",
                      color:
                        COLORS.inkSoft,
                      margin:
                        0,
                      lineHeight:
                        1.4,
                      flex: 1,
                    }}
                  >
                    {p.desc}
                  </p>

                  <div
                    style={{
                      display:
                        "flex",
                      alignItems:
                        "center",
                      justifyContent:
                        "space-between",
                      marginTop:
                        "8px",
                    }}
                  >
                    <span
                      style={{
                        fontWeight:
                          700,
                        color:
                          COLORS.forest,
                        fontSize:
                          "15px",
                      }}
                    >
                      {formatVND(
                        p.price
                      )}
                    </span>

                    <span
                      style={{
                        fontSize:
                          "12px",
                        color:
                          p.stock >
                          0
                            ? COLORS.inkSoft
                            : COLORS.clay,
                      }}
                    >
                      {p.stock >
                      0
                        ? `Còn ${p.stock}`
                        : "Hết hàng"}
                    </span>
                  </div>

                  <button
                    onClick={() =>
                      onAdd(
                        p.id
                      )
                    }
                    disabled={
                      p.stock ===
                      0
                    }
                    style={{
                      marginTop:
                        "6px",
                      background:
                        p.stock ===
                        0
                          ? COLORS.line
                          : COLORS.forest,
                      color:
                        p.stock ===
                        0
                          ? COLORS.inkSoft
                          : "white",
                      border:
                        "none",
                      borderRadius:
                        "8px",
                      padding:
                        "9px",
                      fontSize:
                        "13px",
                      fontWeight:
                        500,
                      cursor:
                        p.stock ===
                        0
                          ? "not-allowed"
                          : "pointer",
                    }}
                  >
                    Thêm vào giỏ
                  </button>
                </div>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================
// CART DRAWER
// ============================================================

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
        position:
          "fixed",
        inset: 0,
        zIndex: 50,
        display:
          "flex",
        justifyContent:
          "flex-end",
      }}
    >
      <div
        onClick={
          onClose
        }
        style={{
          position:
            "absolute",
          inset: 0,
          background:
            "rgba(0,0,0,0.35)",
        }}
      />

      <div
        style={{
          position:
            "relative",
          width:
            "380px",
          maxWidth:
            "92vw",
          background:
            COLORS.surface,
          height:
            "100%",
          display:
            "flex",
          flexDirection:
            "column",
          fontFamily:
            FONT_BODY,
          boxShadow:
            "-8px 0 24px rgba(0,0,0,0.1)",
        }}
      >
        <div
          style={{
            padding:
              "18px",
            borderBottom:
              `1px solid ${COLORS.line}`,
            display:
              "flex",
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
              fontSize:
                "19px",
              margin:
                0,
              color:
                COLORS.forest,
            }}
          >
            {step ===
              "cart" &&
              "Giỏ hàng"}

            {step ===
              "form" &&
              "Thông tin giao hàng"}

            {step ===
              "done" &&
              "Đặt hàng thành công"}
          </h2>

          <button
            onClick={
              onClose
            }
            style={{
              background:
                "none",
              border:
                "none",
              cursor:
                "pointer",
              color:
                COLORS.inkSoft,
            }}
          >
            <X size={20} />
          </button>
        </div>

        <div
          style={{
            flex: 1,
            overflowY:
              "auto",
            padding:
              "18px",
          }}
        >
          {step ===
            "cart" &&
            (items.length ===
            0 ? (
              <p
                style={{
                  color:
                    COLORS.inkSoft,
                  fontSize:
                    "14px",
                }}
              >
                Giỏ hàng đang trống.
              </p>
            ) : (
              <div
                style={{
                  display:
                    "flex",
                  flexDirection:
                    "column",
                  gap:
                    "14px",
                }}
              >
                {items.map(
                  (
                    item
                  ) => (
                    <div
                      key={
                        item.id
                      }
                      style={{
                        display:
                          "flex",
                        gap:
                          "10px",
                        alignItems:
                          "center",
                      }}
                    >
                      <div
                        style={{
                          fontSize:
                            "28px",
                        }}
                      >
                        {
                          item.icon
                        }
                      </div>

                      <div
                        style={{
                          flex: 1,
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
                          {
                            item.name
                          }
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
                          gap:
                            "6px",
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
                          {
                            item.qty
                          }
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

          {step ===
            "form" && (
            <div
              style={{
                display:
                  "flex",
                flexDirection:
                  "column",
                gap:
                  "12px",
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

          {step ===
            "done" && (
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
                  width:
                    "52px",
                  height:
                    "52px",
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
                  size={
                    26
                  }
                  color={
                    COLORS.forest
                  }
                />
              </div>

              <p
                style={{
                  fontSize:
                    "14px",
                  color:
                    COLORS.inkSoft,
                }}
              >
                Cảm ơn bạn! Đơn hàng đã
                được ghi nhận.
                <br />
                Xem lại tại mục "Đơn của
                tôi".
              </p>
            </div>
          )}
        </div>

        {step !==
          "done" && (
          <div
            style={{
              padding:
                "18px",
              borderTop:
                `1px solid ${COLORS.line}`,
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

            {step ===
            "cart" ? (
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
                  gap:
                    "8px",
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
                    border:
                      `1px solid ${COLORS.line}`,
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

        {step ===
          "done" && (
          <div
            style={{
              padding:
                "18px",
              borderTop:
                `1px solid ${COLORS.line}`,
            }}
          >
            <button
              onClick={
                onDone
              }
              style={{
                width:
                  "100%",
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
              Đóng
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

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

// ============================================================
// FIELD
// ============================================================

function Field({
  label,
  value,
  onChange,
  multiline,
}) {
  return (
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
      {label}

      {multiline ? (
        <textarea
          value={
            value
          }
          onChange={(e) =>
            onChange(
              e.target.value
            )
          }
          rows={3}
          style={{
            border:
              `1px solid ${COLORS.line}`,
            borderRadius:
              "8px",
            padding:
              "9px",
            fontSize:
              "14px",
            fontFamily:
              FONT_BODY,
            resize:
              "vertical",
            color:
              COLORS.ink,
          }}
        />
      ) : (
        <input
          value={
            value
          }
          onChange={(e) =>
            onChange(
              e.target.value
            )
          }
          style={{
            border:
              `1px solid ${COLORS.line}`,
            borderRadius:
              "8px",
            padding:
              "9px",
            fontSize:
              "14px",
            fontFamily:
              FONT_BODY,
            color:
              COLORS.ink,
          }}
        />
      )}
    </label>
  );
}

// ============================================================
// MY ORDERS
// ============================================================

function OrdersMineView({
  orders,
  onBrowse,
}) {
  return (
    <div
      style={{
        maxWidth:
          "700px",
        margin:
          "0 auto",
        padding:
          "36px 20px 60px",
      }}
    >
      <h1
        style={{
          fontFamily:
            FONT_DISPLAY,
          fontSize:
            "26px",
          color:
            COLORS.forest,
          marginBottom:
            "18px",
        }}
      >
        Đơn hàng của tôi
      </h1>

      {orders.length ===
      0 ? (
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
            Bạn chưa đặt đơn hàng nào
            trong phiên này.
          </p>

          <button
            onClick={
              onBrowse
            }
            style={{
              background:
                COLORS.forest,
              color:
                "white",
              border:
                "none",
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
            gap:
              "14px",
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
                  border:
                    `1px solid ${COLORS.line}`,
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
                  }}
                >
                  <span>
                    Mã đơn:{" "}
                    {
                      order.id
                    }
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

                {(
                  order.items ||
                  []
                ).map(
                  (
                    item,
                    index
                  ) => (
                    <div
                      key={`${order.id}-${item.productId}-${index}`}
                      style={{
                        display:
                          "flex",
                        justifyContent:
                          "space-between",
                        fontSize:
                          "14px",
                        padding:
                          "3px 0",
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
                          item.price *
                            item.qty
                        )}
                      </span>
                    </div>
                  )
                )}

                <div
                  style={{
                    borderTop:
                      `1px solid ${COLORS.line}`,
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

// ============================================================
// ADMIN
// ============================================================

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
}) {
  // ============================================================
  // ADMIN LOGIN
  // ============================================================

  if (!authed) {
    return (
      <div
        style={{
          maxWidth:
            "360px",
          margin:
            "80px auto",
          padding:
            "0 20px",
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
            fontSize:
              "20px",
            color:
              COLORS.forest,
            marginBottom:
              "6px",
          }}
        >
          Đăng nhập quản trị
        </h2>

        <p
          style={{
            fontSize:
              "13px",
            color:
              COLORS.inkSoft,
            marginBottom:
              "16px",
          }}
        >
          Mật khẩu demo: admin123
        </p>

        <input
          type="password"
          value={
            pwInput
          }
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
            width:
              "100%",
            border:
              `1px solid ${
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
            Sai mật khẩu, thử lại.
          </p>
        )}

        <button
          onClick={
            onLogin
          }
          style={{
            width:
              "100%",
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

  // ============================================================
  // ADMIN DASHBOARD
  // ============================================================

  return (
    <div
      style={{
        maxWidth:
          "1000px",
        margin:
          "0 auto",
        padding:
          "36px 20px 60px",
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
            "20px",
          gap:
            "12px",
          flexWrap:
            "wrap",
        }}
      >
        <h1
          style={{
            fontFamily:
              FONT_DISPLAY,
            fontSize:
              "26px",
            color:
              COLORS.forest,
            margin:
              0,
          }}
        >
          Quản lý sản phẩm
        </h1>

        <button
          onClick={
            onAddNew
          }
          style={{
            background:
              COLORS.forest,
            color:
              "white",
            border:
              "none",
            borderRadius:
              "8px",
            padding:
              "9px 14px",
            display:
              "flex",
            alignItems:
              "center",
            gap:
              "6px",
            cursor:
              "pointer",
            fontSize:
              "13px",
          }}
        >
          <Plus
            size={15}
          />

          Thêm sản phẩm
        </button>
      </div>

      {/* ======================================================
          PRODUCT TABLE
      ====================================================== */}

      <div
        style={{
          background:
            COLORS.surface,
          border:
            `1px solid ${COLORS.line}`,
          borderRadius:
            "10px",
          overflow:
            "auto",
          marginBottom:
            "40px",
        }}
      >
        <table
          style={{
            width:
              "100%",
            borderCollapse:
              "collapse",
            fontSize:
              "13px",
            minWidth:
              "700px",
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
              ></th>

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
              ></th>
            </tr>
          </thead>

          <tbody>
            {(
              products ||
              []
            ).map(
              (
                product
              ) => (
                <tr
                  key={
                    product.id
                  }
                  style={{
                    borderTop:
                      `1px solid ${COLORS.line}`,
                  }}
                >
                  <td
                    style={{
                      ...tdStyle,
                      fontSize:
                        "20px",
                    }}
                  >
                    {
                      product.icon
                    }
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
                      gap:
                        "8px",
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

      {/* ======================================================
          ORDERS
      ====================================================== */}

      <h2
        style={{
          fontFamily:
            FONT_DISPLAY,
          fontSize:
            "22px",
          color:
            COLORS.forest,
          marginBottom:
            "14px",
        }}
      >
        Đơn hàng (
        {orders.length}
        )
      </h2>

      {orders.length ===
      0 ? (
        <p
          style={{
            color:
              COLORS.inkSoft,
            fontSize:
              "14px",
          }}
        >
          Chưa có đơn hàng nào.
        </p>
      ) : (
        <div
          style={{
            display:
              "flex",
            flexDirection:
              "column",
            gap:
              "12px",
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
                  border:
                    `1px solid ${COLORS.line}`,
                  borderRadius:
                    "10px",
                  padding:
                    "14px",
                }}
              >
                <div
                  style={{
                    display:
                      "flex",
                    justifyContent:
                      "space-between",
                    flexWrap:
                      "wrap",
                    gap:
                      "8px",
                    marginBottom:
                      "6px",
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
                      {
                        order.buyer
                          ?.name
                      }{" "}
                      ·{" "}
                      {
                        order.buyer
                          ?.phone
                      }
                    </div>

                    <div
                      style={{
                        fontSize:
                          "12px",
                        color:
                          COLORS.inkSoft,
                      }}
                    >
                      {
                        order.buyer
                          ?.address
                      }
                    </div>
                  </div>

                  <select
                    value={
                      order.status
                    }
                    onChange={(
                      e
                    ) =>
                      onStatusChange(
                        order.id,
                        e.target
                          .value
                      )
                    }
                    style={{
                      border:
                        `1px solid ${COLORS.line}`,
                      borderRadius:
                        "6px",
                      padding:
                        "5px 8px",
                      fontSize:
                        "12px",
                      height:
                        "fit-content",
                    }}
                  >
                    <option>
                      Chờ xử lý
                    </option>

                    <option>
                      Đang giao
                    </option>

                    <option>
                      Hoàn tất
                    </option>

                    <option>
                      Đã huỷ
                    </option>
                  </select>
                </div>

                <div
                  style={{
                    fontSize:
                      "13px",
                    color:
                      COLORS.inkSoft,
                  }}
                >
                  {(
                    order.items ||
                    []
                  )
                    .map(
                      (
                        item
                      ) =>
                        `${item.name} ×${item.qty}`
                    )
                    .join(
                      ", "
                    )}
                </div>

                <div
                  style={{
                    fontWeight:
                      700,
                    color:
                      COLORS.forest,
                    fontSize:
                      "13px",
                    marginTop:
                      "4px",
                  }}
                >
                  {formatVND(
                    order.total
                  )}
                </div>

                <div
                  style={{
                    fontSize:
                      "11px",
                    color:
                      COLORS.inkSoft,
                    marginTop:
                      "6px",
                  }}
                >
                  Mã đơn:{" "}
                  {
                    order.id
                  }
                  {" · "}
                  {order.createdAt
                    ? new Date(
                        order.createdAt
                      ).toLocaleString(
                        "vi-VN"
                      )
                    : ""}
                </div>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================
// TABLE STYLES
// ============================================================

const thStyle = {
  padding:
    "10px 12px",
  fontWeight:
    600,
  color:
    COLORS.forest,
};

const tdStyle = {
  padding:
    "10px 12px",
  verticalAlign:
    "middle",
};

const iconBtnStyle = {
  background:
    "none",
  border:
    "none",
  cursor:
    "pointer",
  color:
    COLORS.inkSoft,
  padding:
    "2px",
};

// ============================================================
// PRODUCT FORM
// ============================================================

function ProductFormModal({
  initial,
  onCancel,
  onSave,
}) {
  const [form, setForm] =
    useState(
      initial || {
        name: "",
        desc: "",
        price: "",
        category:
          CATS[1],
        stock: "",
        icon: "🌿",
      }
    );

  function set(
    key,
    value
  ) {
    setForm(
      (current) => ({
        ...current,
        [key]:
          value,
      })
    );
  }

  function handleSubmit() {
    if (
      !form.name.trim()
    ) {
      alert(
        "Vui lòng nhập tên sản phẩm"
      );
      return;
    }

    if (
      form.price ===
        "" ||
      Number(
        form.price
      ) < 0
    ) {
      alert(
        "Vui lòng nhập giá sản phẩm"
      );
      return;
    }

    if (
      form.stock ===
        "" ||
      Number(
        form.stock
      ) < 0
    ) {
      alert(
        "Vui lòng nhập tồn kho"
      );
      return;
    }

    onSave({
      ...form,

      price:
        Number(
          form.price
        ),

      stock:
        Number(
          form.stock
        ),

      icon:
        form.icon ||
        "🌱",
    });
  }

  return (
    <div
      style={{
        position:
          "fixed",
        inset: 0,
        zIndex: 60,
        display:
          "flex",
        alignItems:
          "center",
        justifyContent:
          "center",
        fontFamily:
          FONT_BODY,
      }}
    >
      <div
        onClick={
          onCancel
        }
        style={{
          position:
            "absolute",
          inset: 0,
          background:
            "rgba(0,0,0,0.4)",
        }}
      />

      <div
        style={{
          position:
            "relative",
          background:
            COLORS.surface,
          borderRadius:
            "12px",
          padding:
            "24px",
          width:
            "420px",
          maxWidth:
            "90vw",
          maxHeight:
            "85vh",
          overflowY:
            "auto",
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
              margin:
                0,
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
              border:
                "none",
              cursor:
                "pointer",
            }}
          >
            <X
              size={
                18
              }
            />
          </button>
        </div>

        <div
          style={{
            display:
              "flex",
            flexDirection:
              "column",
            gap:
              "12px",
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
              set(
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
              set(
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
              gap:
                "10px",
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
                  set(
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
                  set(
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
              gap:
                "5px",
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
              onChange={(
                e
              ) =>
                set(
                  "category",
                  e.target
                    .value
                )
              }
              style={{
                border:
                  `1px solid ${COLORS.line}`,
                borderRadius:
                  "8px",
                padding:
                  "9px",
                fontSize:
                  "14px",
              }}
            >
              {CATS.filter(
                (c) =>
                  c !==
                  "Tất cả"
              ).map(
                (c) => (
                  <option
                    key={
                      c
                    }
                    value={
                      c
                    }
                  >
                    {c}
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
              set(
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