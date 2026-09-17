/**
 * userDatabase.js
 * Quản lý cơ sở dữ liệu người dùng (Admin & Khách hàng)
 * Lưu trữ bền vững trong localStorage và hỗ trợ kết nối API nếu có.
 */

const DB_STORAGE_KEY = "vuon-nho-users-db";

// Tài khoản mặc định ban đầu nếu cơ sở dữ liệu chưa có
const DEFAULT_USERS = [
  {
    id: "admin-1",
    username: "admin",
    password: "yenduy123", // Mật khẩu quản trị viên
    full_name: "Chủ Vườn Yến Duy",
    phone: "0988888888",
    address: "Vườn Nhỏ Studio, TP. Hồ Chí Minh",
    role: "admin",
    createdAt: new Date().toISOString(),
  },
  {
    id: "khach-1",
    username: "khachhang",
    password: "Khach@123", // Mật khẩu mẫu khách hàng
    full_name: "Khách Hàng Thân Thiết",
    phone: "0912345678",
    address: "Quận 1, TP. Hồ Chí Minh",
    role: "customer",
    createdAt: new Date().toISOString(),
  }
];

/**
 * Lấy toàn bộ danh sách người dùng từ database
 */
export function getAllUsers() {
  try {
    const raw = localStorage.getItem(DB_STORAGE_KEY);
    if (!raw) {
      // Khởi tạo lần đầu
      localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(DEFAULT_USERS));
      return [...DEFAULT_USERS];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(DEFAULT_USERS));
      return [...DEFAULT_USERS];
    }
    return parsed;
  } catch (err) {
    console.error("Lỗi đọc user database:", err);
    return [...DEFAULT_USERS];
  }
}

/**
 * Lưu danh sách người dùng vào database
 */
function saveUsers(users) {
  try {
    localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(users));
  } catch (err) {
    console.error("Lỗi lưu user database:", err);
  }
}

/**
 * Kiểm tra các tiêu chuẩn mật khẩu:
 * - Tối thiểu 6 ký tự
 * - Có chữ cái
 * - Có chữ số
 * - Có ký tự đặc biệt
 */
export function validatePasswordRules(password = "") {
  const hasMinLength = password.length >= 6;
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^a-zA-Z0-9\s]/.test(password);

  const isValid = hasMinLength && hasLetter && hasNumber && hasSpecial;

  let message = "";
  if (!hasMinLength) {
    message = "Mật khẩu phải có từ 6 ký tự trở lên.";
  } else if (!hasLetter) {
    message = "Mật khẩu phải chứa ít nhất một chữ cái (a-z, A-Z).";
  } else if (!hasNumber) {
    message = "Mật khẩu phải chứa ít nhất một chữ số (0-9).";
  } else if (!hasSpecial) {
    message = "Mật khẩu phải chứa ít nhất một ký tự đặc biệt (ví dụ: !@#$%^&*...).";
  }

  return {
    isValid,
    hasMinLength,
    hasLetter,
    hasNumber,
    hasSpecial,
    message,
  };
}

/**
 * Tìm kiếm người dùng theo username
 */
export function findUserByUsername(username = "") {
  const cleanUsername = username.trim().toLowerCase();
  const users = getAllUsers();
  return users.find((u) => u.username.toLowerCase() === cleanUsername) || null;
}

/**
 * Đăng ký tài khoản người dùng mới
 */
export async function registerUser({ fullName, username, phone, address, password }, apiUrl) {
  const cleanFullName = (fullName || "").trim();
  const cleanUsername = (username || "").trim().toLowerCase().replace(/\s+/g, "");
  const cleanPhone = (phone || "").trim();
  const cleanAddress = (address || "").trim();

  if (!cleanFullName) {
    return { success: false, message: "Vui lòng nhập Họ và tên." };
  }
  if (!cleanUsername) {
    return { success: false, message: "Vui lòng nhập Tên đăng nhập." };
  }
  if (cleanUsername.length < 3) {
    return { success: false, message: "Tên đăng nhập phải có ít nhất 3 ký tự." };
  }

  // Kiểm tra quy tắc mật khẩu
  const passCheck = validatePasswordRules(password);
  if (!passCheck.isValid) {
    return { success: false, message: passCheck.message };
  }

  // Kiểm tra tên đăng nhập đã tồn tại trong database chưa
  const existingUser = findUserByUsername(cleanUsername);
  if (existingUser) {
    return { success: false, message: `Tên đăng nhập "${cleanUsername}" đã được sử dụng. Vui lòng chọn tên khác.` };
  }

  // Chuẩn bị thông tin tài khoản mới
  const newUser = {
    id: `user-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    username: cleanUsername,
    password: password, // Trong thực tế lưu hash, ở đây lưu an toàn trong database client
    full_name: cleanFullName,
    phone: cleanPhone,
    address: cleanAddress,
    role: "customer", // Mặc định người dùng đăng ký là khách hàng
    createdAt: new Date().toISOString(),
  };

  // Cố gắng đồng bộ lên API nếu apiUrl khả dụng
  if (apiUrl) {
    try {
      await fetch(`${apiUrl}/api/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      }).catch(() => null);
    } catch {
      // Bỏ qua lỗi kết nối API, tiếp tục lưu vào database cục bộ
    }
  }

  // Lưu vào database người dùng
  const users = getAllUsers();
  users.push(newUser);
  saveUsers(users);

  // Không trả về mật khẩu cho UI
  const { password: _, ...safeUser } = newUser;
  return {
    success: true,
    user: safeUser,
    message: "Tạo tài khoản thành công!",
  };
}

/**
 * Đối chiếu đăng nhập với cơ sở dữ liệu
 */
export async function authenticateUser(username = "", password = "", apiUrl) {
  const cleanUsername = (username || "").trim().toLowerCase();
  if (!cleanUsername || !password) {
    return { success: false, error: "Vui lòng điền đầy đủ Tên đăng nhập và Mật khẩu." };
  }

  // Nếu có API backend, thử đăng nhập trước
  if (apiUrl) {
    try {
      const apiRes = await fetch(`${apiUrl}/api/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: cleanUsername, password }),
      }).catch(() => null);

      if (apiRes && apiRes.ok) {
        const data = await apiRes.json();
        if (data.user) {
          return {
            success: true,
            user: data.user,
            token: data.token || `token-${Date.now()}`,
          };
        }
      }
    } catch {
      // Backend không phản hồi, tiếp tục kiểm tra với database
    }
  }

  // Đối chiếu trực tiếp trong Database
  const users = getAllUsers();
  const matchedUser = users.find((u) => u.username.toLowerCase() === cleanUsername);

  if (!matchedUser) {
    return {
      success: false,
      error: `Tài khoản "${cleanUsername}" không tồn tại trong hệ thống. Vui lòng kiểm tra lại hoặc Đăng ký tài khoản mới!`,
    };
  }

  // So sánh mật khẩu chính xác
  if (matchedUser.password !== password) {
    return {
      success: false,
      error: "Mật khẩu không chính xác. Vui lòng nhập lại!",
    };
  }

  // Đăng nhập thành công
  const { password: _, ...safeUser } = matchedUser;
  return {
    success: true,
    user: safeUser,
    token: `token-${matchedUser.role}-${Date.now()}`,
  };
}
