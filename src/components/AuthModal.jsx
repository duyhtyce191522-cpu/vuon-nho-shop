import { useState, useEffect, useMemo } from "react";
import { X, LogIn, UserPlus, Eye, EyeOff, Check, AlertCircle, ShieldCheck, Lock, Sparkles } from "lucide-react";
import { authenticateUser, registerUser, validatePasswordRules } from "../lib/userDatabase";

export default function AuthModal({ isOpen, initialTab = "login", onClose, onLoginSuccess, apiUrl }) {
  const [tab, setTab] = useState(initialTab || "login");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [regForm, setRegForm] = useState({
    fullName: "",
    username: "",
    phone: "",
    address: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (isOpen) {
      setTab(initialTab || "login");
      setError("");
      setSuccessMsg("");
      setShowPassword(false);
      setShowRegPassword(false);
      setShowRegConfirmPassword(false);
    }
  }, [isOpen, initialTab]);

  const fillUsername = (name) => {
    setError("");
    setLoginForm((prev) => ({ ...prev, username: name, password: "" }));
  };

  // Kiểm tra thời gian thực các tiêu chuẩn mật khẩu đăng ký
  const passCriteria = useMemo(() => {
    const p = regForm.password || "";
    return {
      hasLength: p.length >= 6,
      hasLetter: /[a-zA-Z]/.test(p),
      hasNumber: /[0-9]/.test(p),
      hasSpecial: /[^a-zA-Z0-9\s]/.test(p),
    };
  }, [regForm.password]);

  if (!isOpen) return null;

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    const username = loginForm.username.trim();
    const password = loginForm.password;

    if (!username || !password) {
      setError("Vui lòng nhập đầy đủ Tên đăng nhập và Mật khẩu.");
      return;
    }

    setLoading(true);
    try {
      // Đối chiếu trực tiếp với database người dùng (và API nếu có)
      const authResult = await authenticateUser(username, password, apiUrl);

      if (!authResult.success) {
        setError(authResult.error || "Tài khoản hoặc mật khẩu không chính xác!");
        return;
      }

      // Đăng nhập thành công
      const user = authResult.user;
      const isAdmin = user.role === "admin";
      setSuccessMsg(isAdmin ? "Đăng nhập quyền Admin thành công!" : "Đăng nhập thành công!");

      setTimeout(() => {
        onLoginSuccess(user, authResult.token);
        onClose();
      }, 400);
    } catch (err) {
      setError(err.message || "Đăng nhập thất bại. Vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    const fullName = regForm.fullName.trim();
    const username = regForm.username.trim().toLowerCase().replace(/\s+/g, "");
    const phone = regForm.phone.trim();
    const address = regForm.address.trim();
    const password = regForm.password;
    const confirmPassword = regForm.confirmPassword;

    if (!fullName || !username || !password) {
      setError("Vui lòng điền đủ Họ tên, Tên đăng nhập và Mật khẩu.");
      return;
    }

    // Kiểm tra quy tắc mật khẩu: >= 6 ký tự, có chữ, có số, có ký tự đặc biệt
    const passCheck = validatePasswordRules(password);
    if (!passCheck.isValid) {
      setError(passCheck.message);
      return;
    }

    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận chưa trùng khớp. Vui lòng nhập lại!");
      return;
    }

    setLoading(true);
    try {
      // Lưu vào database
      const regResult = await registerUser(
        { fullName, username, phone, address, password },
        apiUrl
      );

      if (!regResult.success) {
        setError(regResult.message || "Đăng ký không thành công!");
        return;
      }

      // Yêu cầu: Sau khi đăng ký thành công, lưu vào database, chuyển về màn hình đăng nhập
      // Điền sẵn tên đăng nhập đã đăng ký và yêu cầu nhập mật khẩu để đăng nhập lại
      setLoginForm({
        username: username,
        password: "",
      });

      // Reset form đăng ký
      setRegForm({
        fullName: "",
        username: "",
        phone: "",
        address: "",
        password: "",
        confirmPassword: "",
      });

      // Chuyển sang tab Đăng nhập
      setTab("login");
      setSuccessMsg(`Đăng ký tài khoản "${username}" thành công! Vui lòng nhập mật khẩu để đăng nhập.`);
    } catch (err) {
      setError(err.message || "Có lỗi xảy ra khi tạo tài khoản!");
    } finally {
      setLoading(false);
    }
  };

  const isMatch = regForm.confirmPassword.length > 0 && regForm.password === regForm.confirmPassword;
  const isMismatch = regForm.confirmPassword.length > 0 && regForm.password !== regForm.confirmPassword;

  return (
    <div className="modal-layer">
      <button className="drawer-backdrop" onClick={onClose} aria-label="Đóng" />
      <div className="product-modal auth-modal-box">
        <div className="modal-heading" style={{ marginBottom: "16px" }}>
          <div>
            <div className="eyebrow"><span /> Vườn Nhỏ Studio</div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "24px", color: "var(--deep)", margin: "4px 0 0" }}>
              {tab === "login" ? "Chào mừng trở lại" : "Trở thành thành viên"}
            </h2>
          </div>
          <button aria-label="Đóng cửa sổ" className="close-button" onClick={onClose}>
            <X size={19} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="auth-tab-bar">
          <button
            type="button"
            className={`auth-tab-btn ${tab === "login" ? "is-active" : ""}`}
            onClick={() => { setTab("login"); setError(""); setSuccessMsg(""); }}
          >
            <LogIn size={15} />
            <span>Đăng nhập</span>
          </button>
          <button
            type="button"
            className={`auth-tab-btn ${tab === "register" ? "is-active" : ""}`}
            onClick={() => { setTab("register"); setError(""); setSuccessMsg(""); }}
          >
            <UserPlus size={15} />
            <span>Tạo tài khoản</span>
          </button>
        </div>

        {error && (
          <div className="auth-error-banner">
            <AlertCircle size={15} />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="auth-success-banner">
            <Check size={15} />
            <span>{successMsg}</span>
          </div>
        )}

        {tab === "login" ? (
          <form onSubmit={handleLogin} className="form-stack">
            <label className="form-field">
              <span>Tên đăng nhập</span>
              <input
                type="text"
                value={loginForm.username}
                onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                placeholder="Nhập tên đăng nhập của bạn..."
                required
                autoFocus={tab === "login"}
              />
            </label>

            <label className="form-field">
              <span>Mật khẩu</span>
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  placeholder="Nhập mật khẩu..."
                  style={{ width: "100%", paddingRight: "40px" }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: "10px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--muted)",
                    padding: "4px",
                  }}
                  aria-label={showPassword ? "Ẩn" : "Hiện"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </label>

            <button type="submit" disabled={loading} className="primary-button full-button" style={{ marginTop: "8px" }}>
              {loading ? "Đang xác thực..." : <><LogIn size={16} /> Đăng nhập ngay</>}
            </button>

            <div style={{ textAlign: "center", fontSize: "12px", color: "var(--muted)", marginTop: "8px" }}>
              Chưa có tài khoản?{" "}
              <button
                type="button"
                onClick={() => { setTab("register"); setError(""); setSuccessMsg(""); }}
                style={{ background: "none", border: "none", color: "var(--forest)", fontWeight: 700, cursor: "pointer", textDecoration: "underline" }}
              >
                Đăng ký ngay
              </button>
            </div>

           
          </form>
        ) : (
          <form onSubmit={handleRegister} className="form-stack">
            <label className="form-field">
              <span>Họ và tên <b style={{ color: "var(--clay)" }}>*</b></span>
              <input
                type="text"
                value={regForm.fullName}
                onChange={(e) => setRegForm({ ...regForm, fullName: e.target.value })}
                placeholder="Ví dụ: Nguyễn Văn An"
                required
              />
            </label>

            <div className="form-row">
              <label className="form-field">
                <span>Tên đăng nhập <b style={{ color: "var(--clay)" }}>*</b></span>
                <input
                  type="text"
                  value={regForm.username}
                  onChange={(e) => setRegForm({ ...regForm, username: e.target.value.toLowerCase().replace(/\s+/g, "") })}
                  placeholder="Ví dụ: vanan99"
                  required
                />
              </label>

              <label className="form-field">
                <span>Số điện thoại</span>
                <input
                  type="tel"
                  value={regForm.phone}
                  onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })}
                  placeholder="09xx xxx xxx"
                />
              </label>
            </div>

            <label className="form-field">
              <span>Địa chỉ nhận cây (mặc định)</span>
              <input
                type="text"
                value={regForm.address}
                onChange={(e) => setRegForm({ ...regForm, address: e.target.value })}
                placeholder="Số nhà, đường, phường, quận..."
              />
            </label>

            <div className="form-row">
              <label className="form-field">
                <span>Mật khẩu <b style={{ color: "var(--clay)" }}>*</b></span>
                <div style={{ position: "relative" }}>
                  <input
                    type={showRegPassword ? "text" : "password"}
                    value={regForm.password}
                    onChange={(e) => setRegForm({ ...regForm, password: e.target.value })}
                    placeholder="Mật khẩu bảo mật"
                    style={{ width: "100%", paddingRight: "40px" }}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    style={{
                      position: "absolute",
                      right: "10px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "var(--muted)",
                      padding: "4px",
                    }}
                    aria-label={showRegPassword ? "Ẩn" : "Hiện"}
                  >
                    {showRegPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </label>

              <label className="form-field">
                <span>Nhập lại mật khẩu <b style={{ color: "var(--clay)" }}>*</b></span>
                <div style={{ position: "relative" }}>
                  <input
                    type={showRegConfirmPassword ? "text" : "password"}
                    value={regForm.confirmPassword}
                    onChange={(e) => setRegForm({ ...regForm, confirmPassword: e.target.value })}
                    placeholder="Khớp với mật khẩu"
                    style={{ width: "100%", paddingRight: "40px" }}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                    style={{
                      position: "absolute",
                      right: "10px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "var(--muted)",
                      padding: "4px",
                    }}
                    aria-label={showRegConfirmPassword ? "Ẩn" : "Hiện"}
                  >
                    {showRegConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </label>
            </div>

            {/* Checklist yêu cầu mật khẩu */}
            <div className="auth-password-criteria">
              <div className="criteria-title">
                <Lock size={12} /> Yêu cầu mật khẩu (tối thiểu 6 ký tự, gồm chữ, số và ký tự):
              </div>
              <div className="criteria-grid">
                <span className={`criteria-item ${passCriteria.hasLength ? "is-valid" : ""}`}>
                  {passCriteria.hasLength ? "✓" : "○"} Tối thiểu 6 ký tự
                </span>
                <span className={`criteria-item ${passCriteria.hasLetter ? "is-valid" : ""}`}>
                  {passCriteria.hasLetter ? "✓" : "○"} Chứa chữ cái
                </span>
                <span className={`criteria-item ${passCriteria.hasNumber ? "is-valid" : ""}`}>
                  {passCriteria.hasNumber ? "✓" : "○"} Chứa chữ số
                </span>
                <span className={`criteria-item ${passCriteria.hasSpecial ? "is-valid" : ""}`}>
                  {passCriteria.hasSpecial ? "✓" : "○"} Ký tự đặc biệt (!@#$)
                </span>
              </div>
            </div>

            {isMismatch && <div style={{ fontSize: "11.5px", color: "var(--clay)", marginTop: "-2px" }}>✗ Mật khẩu xác nhận chưa trùng khớp</div>}
            {isMatch && <div style={{ fontSize: "11.5px", color: "var(--forest)", marginTop: "-2px" }}>✓ Mật khẩu xác nhận trùng khớp</div>}

            <button type="submit" disabled={loading} className="primary-button full-button" style={{ marginTop: "8px" }}>
              {loading ? "Đang khởi tạo tài khoản..." : <><UserPlus size={16} /> Tạo tài khoản thành viên</>}
            </button>

            <div style={{ textAlign: "center", fontSize: "12px", color: "var(--muted)", marginTop: "8px" }}>
              Đã có tài khoản?{" "}
              <button
                type="button"
                onClick={() => { setTab("login"); setError(""); setSuccessMsg(""); }}
                style={{ background: "none", border: "none", color: "var(--forest)", fontWeight: 700, cursor: "pointer", textDecoration: "underline" }}
              >
                Đăng nhập ngay
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
