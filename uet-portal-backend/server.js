import express from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const port = 5000;

// Kết nối với MongoDB
mongoose
  .connect('mongodb://localhost:27017/uet_portal', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Middleware
app.use(cors({
  origin: 'http://localhost:3000', // Chỉ cho phép frontend của bạn
  credentials: true, // Cho phép gửi cookie
}));
app.use(express.json());
app.use(cookieParser());

// Định nghĩa schema và model cho người dùng
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true },
});

const User = mongoose.model('User', userSchema);

// Hàm tạo JWT token
async function issueAuthToken(user) {
  const payload = {
    _id: user._id,
    username: user.username,
  };
  const secret = process.env.JWT_SECRET || 'your_jwt_secret'; // Đặt secret trong biến môi trường
  const options = {
    expiresIn: '1h',
  };
  const token = jwt.sign(payload, secret, options);
  return token;
}

// Hàm đặt cookie
// function issueAuthTokenCookie(res, token) {
//   const cookieOptions = {
//     httpOnly: true,
//     maxAge: 1000 * 60 * 60, // 1 hour
//     sameSite: 'strict',
//     secure: true,
//   };
//   res.cookie('auth_token', token, cookieOptions);
// }
function issueAuthTokenCookie(res, token) {
  const cookieOptions = {
    httpOnly: true,
    maxAge: 1000 * 60 * 60, // 1 hour
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production', // Chỉ bật secure trong production
  };
  res.cookie('auth_token', token, cookieOptions);
}

// API đăng ký
app.post('/register', async (req, res) => {
  const { username, password, role } = req.body;
  try {
    // Kiểm tra xem username đã tồn tại chưa
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Tên đăng nhập đã tồn tại' });
    }

    // Mã hóa mật khẩu
    const hashedPassword = await bcrypt.hash(password, 10);

    // Tạo người dùng mới
    const user = new User({
      username,
      password: hashedPassword,
      role,
    });

    // Lưu vào MongoDB
    await user.save();

    res.status(201).json({ message: 'Đăng ký thành công', user: { username, role } });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// API đăng nhập
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    // Tìm người dùng trong MongoDB
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: 'Tên đăng nhập không tồn tại' });
    }

    // Kiểm tra mật khẩu
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Mật khẩu không đúng' });
    }

    // Tạo token và đặt cookie
    const authToken = await issueAuthToken(user);
    issueAuthTokenCookie(res, authToken);

    res.status(200).json({
      message: 'Đăng nhập thành công',
      user: { username: user.username, role: user.role },
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// Khởi động server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});