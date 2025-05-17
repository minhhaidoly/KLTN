// import express from 'express';
// import mongoose from 'mongoose';
// import bcrypt from 'bcryptjs';
// import cors from 'cors';
// import cookieParser from 'cookie-parser';
// import jwt from 'jsonwebtoken';
// import dotenv from 'dotenv';
// dotenv.config();

// const app = express();
// const port = 5000;

// // Kết nối với MongoDB
// mongoose
//   .connect('mongodb://localhost:27017/uet_portal', {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   })
//   .then(() => console.log('Connected to MongoDB'))
//   .catch((err) => console.error('MongoDB connection error:', err));

// // Middleware
// app.use(cors({
//   origin: 'http://localhost:3000', // Chỉ cho phép frontend của bạn
//   credentials: true, // Cho phép gửi cookie
// }));
// app.use(express.json());
// app.use(cookieParser());

// // Định nghĩa schema và model cho người dùng
// const userSchema = new mongoose.Schema({
//   username: { type: String, required: true, unique: true },
//   password: { type: String, required: true },
//   role: { type: String, required: true },
// });

// const User = mongoose.model('User', userSchema);

// // Hàm tạo JWT token
// async function issueAuthToken(user) {
//   const payload = {
//     _id: user._id,
//     username: user.username,
//   };
//   const secret = process.env.JWT_SECRET || 'your_jwt_secret'; // Đặt secret trong biến môi trường
//   const options = {
//     expiresIn: '1h',
//   };
//   const token = jwt.sign(payload, secret, options);
//   return token;
// }

// // Hàm đặt cookie
// // function issueAuthTokenCookie(res, token) {
// //   const cookieOptions = {
// //     httpOnly: true,
// //     maxAge: 1000 * 60 * 60, // 1 hour
// //     sameSite: 'strict',
// //     secure: true,
// //   };
// //   res.cookie('auth_token', token, cookieOptions);
// // }
// function issueAuthTokenCookie(res, token) {
//   const cookieOptions = {
//     httpOnly: true,
//     maxAge: 1000 * 60 * 60, // 1 hour
//     sameSite: 'strict',
//     secure: process.env.NODE_ENV === 'production', // Chỉ bật secure trong production
//   };
//   res.cookie('auth_token', token, cookieOptions);
// }

// // API đăng ký
// app.post('/register', async (req, res) => {
//   const { username, password, role } = req.body;
//   try {
//     // Kiểm tra xem username đã tồn tại chưa
//     const existingUser = await User.findOne({ username });
//     if (existingUser) {
//       return res.status(400).json({ message: 'Tên đăng nhập đã tồn tại' });
//     }

//     // Mã hóa mật khẩu
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // Tạo người dùng mới
//     const user = new User({
//       username,
//       password: hashedPassword,
//       role,
//     });

//     // Lưu vào MongoDB
//     await user.save();

//     res.status(201).json({ message: 'Đăng ký thành công', user: { username, role } });
//   } catch (error) {
//     res.status(500).json({ message: 'Lỗi server', error: error.message });
//   }
// });

// // API đăng nhập
// app.post('/login', async (req, res) => {
//   const { username, password } = req.body;
//   try {
//     // Tìm người dùng trong MongoDB
//     const user = await User.findOne({ username });
//     if (!user) {
//       return res.status(401).json({ message: 'Tên đăng nhập không tồn tại' });
//     }

//     // Kiểm tra mật khẩu
//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       return res.status(401).json({ message: 'Mật khẩu không đúng' });
//     }

//     // Tạo token và đặt cookie
//     const authToken = await issueAuthToken(user);
//     issueAuthTokenCookie(res, authToken);

//     res.status(200).json({
//       message: 'Đăng nhập thành công',
//       user: { username: user.username, role: user.role },
//     });
//   } catch (error) {
//     res.status(500).json({ message: 'Lỗi server', error: error.message });
//   }
// });

// // Khởi động server
// app.listen(port, () => {
//   console.log(`Server running on port ${port}`);
// });

import express from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import multer from 'multer'; // Thêm để xử lý file upload
import exceljs from 'exceljs'; // Thêm để đọc file Excel
import fs from 'fs'; // Để xử lý file

dotenv.config();
const app = express();
const port = 5000; // Fixed: Added equals sign

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
  origin: 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// Định nghĩa schema và model cho người dùng
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true, enum: ['Sinh viên', 'Giảng viên', 'Quản trị viên'] }
});

const User = mongoose.model('User', userSchema);

// Schema cho danh sách học viên
const studentBatchSchema = new mongoose.Schema({
  batchName: { type: String, required: true },
  decision: { type: String, required: true },
  students: [
    {
      studentId: String,
      fullName: String,
      birthDate: Date,
      major: String,
    },
  ],
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  uploadDate: { type: Date, default: Date.now },
});

const StudentBatch = mongoose.model('StudentBatch', studentBatchSchema);

// Hàm tạo JWT token
async function issueAuthToken(user) {
  const payload = {
    _id: user._id,
    username: user.username,
    role: user.role, // Thêm role vào token
  };
  const secret = process.env.JWT_SECRET || 'your_jwt_secret';
  const options = {
    expiresIn: '1h',
  };
  return jwt.sign(payload, secret, options);
}

// Hàm đặt cookie
function issueAuthTokenCookie(res, token) {
  const cookieOptions = {
    httpOnly: true,
    maxAge: 1000 * 60 * 60, // Fixed: Added multiplication symbols
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production', // Fixed: Added equals sign
  };
  res.cookie('auth_token', token, cookieOptions);
}

// Middleware để xác thực JWT
const authenticateJWT = (req, res, next) => {
  const token = req.cookies.auth_token;
  
  if (!token) {
    return res.status(401).json({ message: 'Không tìm thấy token xác thực' });
  }

  const secret = process.env.JWT_SECRET || 'your_jwt_secret';
  
  try {
    const decoded = jwt.verify(token, secret);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Token không hợp lệ hoặc đã hết hạn' });
  }
};

// API đăng ký
app.post('/register', async (req, res) => {
  const { username, password, role } = req.body;
  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Tên đăng nhập đã tồn tại' });
    }
    const hashedPassword = await bcrypt.hash(password, 10); // Fixed: Added closing parenthesis
    const user = new User({ username, password: hashedPassword, role });

    await user.save();
    res.status(201).json({ message: 'Đăng ký thành công', user: { username, role } });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// API đăng nhập
app.post('/login', async (req, res) => {
  const { username, password, role } = req.body; // Thêm role
  try {
    const user = await User.findOne({ username });
    if (!user) { // Fixed: Added exclamation mark
      return res.status(401).json({ message: 'Tên đăng nhập không tồn tại' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) { // Fixed: Added exclamation mark
      return res.status(401).json({ message: 'Mật khẩu không đúng' });
    }
    // Kiểm tra vai trò
    if (user.role !== role) { // Fixed: Changed ! to !==
      return res.status(401).json({ message: 'Vai trò không khớp' });
    }
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

// Cấu hình multer để xử lý file upload
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}${file.originalname}`);
  },
});
const upload = multer({ storage });

// API cho Admin nhập danh sách học viên
app.post('/admin/upload-students', authenticateJWT, upload.single('excelFile'), async (req, res) => {
  // Verify admin role
  if (req.user.role !== 'Quản trị viên') {
    return res.status(403).json({ message: 'Không có quyền truy cập' });
  }

  const { batchName, decision } = req.body;
  const file = req.file;
  
  if (!batchName || !decision || !file) { // Fixed: Added exclamation mark
    return res.status(400).json({ message: 'Thiếu thông tin hoặc file' });
  }
  
  try {
    const workbook = new exceljs.Workbook();
    await workbook.xlsx.readFile(file.path);
    const worksheet = workbook.getWorksheet(1);
    const students = [];
    
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) { // Fixed: Changed to greater than symbol
        students.push({
          studentId: row.getCell(1).value,
          fullName: row.getCell(2).value,
          birthDate: row.getCell(3).value,
          major: row.getCell(4).value,
        });
      }
    });
    
    const batch = new StudentBatch({
      batchName,
      decision,
      students,
      uploadedBy: req.user._id, // Use the authenticated user's ID
    });
    
    await batch.save();
    
    // Clean up the uploaded file
    fs.unlink(file.path, (err) => {
      if (err) console.error('Lỗi xóa file:', err);
    });
    
    res.status(201).json({ message: 'Tải lên danh sách học viên thành công', batch });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// API cho học viên xem danh sách
app.get('/students/batches', authenticateJWT, async (req, res) => {
  try {
    const batches = await StudentBatch.find();
    res.status(200).json(batches);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// API kiểm tra xác thực
app.get('/auth/check', authenticateJWT, (req, res) => {
  res.status(200).json({ 
    authenticated: true, 
    user: { 
      username: req.user.username, 
      role: req.user.role 
    } 
  });
});

// API đăng xuất
app.post('/logout', (req, res) => {
  res.clearCookie('auth_token');
  res.status(200).json({ message: 'Đăng xuất thành công' });
});

// Khởi động server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});