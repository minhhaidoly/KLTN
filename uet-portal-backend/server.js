// import express from 'express';
// import mongoose from 'mongoose';
// import bcrypt from 'bcryptjs';
// import cors from 'cors';
// import cookieParser from 'cookie-parser';
// import jwt from 'jsonwebtoken';
// import dotenv from 'dotenv';
// import multer from 'multer';
// import exceljs from 'exceljs';
// import fs from 'fs';

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
//   origin: 'http://localhost:3000',
//   credentials: true,
// }));
// app.use(express.json());
// app.use(cookieParser());

// // Định nghĩa schema và model cho người dùng
// const userSchema = new mongoose.Schema({
//   username: { type: String, required: true, unique: true },
//   password: { type: String, required: true },
//   role: { type: String, required: true, enum: ['Sinh viên', 'Giảng viên', 'Quản trị viên'] },
//   // Thêm thông tin cho sinh viên
//   studentInfo: {
//     studentId: String,
//     fullName: String,
//     birthDate: Date,
//     major: String,
//   }
// });

// const User = mongoose.model('User', userSchema);

// // Schema cho danh sách học viên
// const studentBatchSchema = new mongoose.Schema({
//   batchName: { type: String, required: true },
//   decision: { type: String, required: true },
//   students: [
//     {
//       studentId: String,
//       fullName: String,
//       birthDate: Date,
//       major: String,
//     },
//   ],
//   uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
//   uploadDate: { type: Date, default: Date.now },
// });

// const StudentBatch = mongoose.model('StudentBatch', studentBatchSchema);

// // Hàm tạo JWT token
// async function issueAuthToken(user) {
//   const payload = {
//     _id: user._id,
//     username: user.username,
//     role: user.role,
//   };
//   const secret = process.env.JWT_SECRET || 'your_jwt_secret';
//   const options = {
//     expiresIn: '1h',
//   };
//   return jwt.sign(payload, secret, options);
// }

// // Hàm đặt cookie
// function issueAuthTokenCookie(res, token) {
//   const cookieOptions = {
//     httpOnly: true,
//     maxAge: 1000 * 60 * 60,
//     sameSite: 'strict',
//     secure: process.env.NODE_ENV === 'production',
//   };
//   res.cookie('auth_token', token, cookieOptions);
// }

// // Middleware để xác thực JWT
// const authenticateJWT = (req, res, next) => {
//   const token = req.cookies.auth_token;
//   if (!token) {
//     return res.status(401).json({ message: 'Không tìm thấy token xác thực' });
//   }
//   const secret = process.env.JWT_SECRET || 'your_jwt_secret';

//   try {
//     const decoded = jwt.verify(token, secret);
//     req.user = decoded;
//     next();
//   } catch (error) {
//     return res.status(403).json({ message: 'Token không hợp lệ hoặc đã hết hạn' });
//   }
// };

// // API đăng ký
// app.post('/register', async (req, res) => {
//   const { username, password, role } = req.body;
//   try {
//     const existingUser = await User.findOne({ username });
//     if (existingUser) {
//       return res.status(400).json({ message: 'Tên đăng nhập đã tồn tại' });
//     }
//     const hashedPassword = await bcrypt.hash(password, 10);
//     const user = new User({ username, password: hashedPassword, role });
//     await user.save();
//     res.status(201).json({ message: 'Đăng ký thành công', user: { username, role } });
//   } catch (error) {
//     res.status(500).json({ message: 'Lỗi server', error: error.message });
//   }
// });

// // API đăng nhập
// app.post('/login', async (req, res) => {
//   const { username, password, role } = req.body;
//   try {
//     const user = await User.findOne({ username });
//     if (!user) {
//       return res.status(401).json({ message: 'Tên đăng nhập không tồn tại' });
//     }
//     const isMatch = await bcrypt.compare(password, user.password);

//     if (!isMatch) {
//       return res.status(401).json({ message: 'Mật khẩu không đúng' });
//     }

//     // Kiểm tra vai trò
//     if (user.role !== role) {
//       return res.status(401).json({ message: 'Vai trò không khớp' });
//     }

//     const authToken = await issueAuthToken(user);
//     issueAuthTokenCookie(res, authToken);
//     res.status(200).json({
//       message: 'Đăng nhập thành công',
//       user: { 
//         username: user.username, 
//         role: user.role,
//         studentInfo: user.studentInfo || null
//       },
//     });
//   } catch (error) {
//     res.status(500).json({ message: 'Lỗi server', error: error.message });
//   }
// });

// // Cấu hình multer để xử lý file upload
// const storage = multer.diskStorage({
//   destination: './uploads/',
//   filename: (req, file, cb) => {
//     cb(null, `${Date.now()}_${file.originalname}`);
//   },
// });

// const upload = multer({ storage });

// // API cho Admin nhập danh sách học viên và tự động tạo tài khoản
// app.post('/admin/upload-students', authenticateJWT, upload.single('excelFile'), async (req, res) => {
//   // Verify admin role
//   if (req.user.role !== 'Quản trị viên') {
//     return res.status(403).json({ message: 'Không có quyền truy cập' });
//   }

//   const { batchName, decision } = req.body;
//   const file = req.file;

//   if (!batchName || !decision || !file) {
//     return res.status(400).json({ message: 'Thiếu thông tin hoặc file' });
//   }

//   try {
//     const workbook = new exceljs.Workbook();
//     await workbook.xlsx.readFile(file.path);
//     const worksheet = workbook.getWorksheet(1);
//     const students = [];
//     const createdAccounts = [];

//     worksheet.eachRow(async (row, rowNumber) => {
//       if (rowNumber > 1) { // Bỏ qua header row
//         const studentData = {
//           studentId: row.getCell(1).value?.toString(),
//           fullName: row.getCell(2).value?.toString(),
//           birthDate: row.getCell(3).value,
//           major: row.getCell(4).value?.toString(),
//         };
        
//         students.push(studentData);

//         // Tạo tài khoản cho sinh viên
//         try {
//           const existingUser = await User.findOne({ username: studentData.studentId });
//           if (!existingUser) {
//             const hashedPassword = await bcrypt.hash('123', 10);
//             const newUser = new User({
//               username: studentData.studentId,
//               password: hashedPassword,
//               role: 'Sinh viên',
//               studentInfo: {
//                 studentId: studentData.studentId,
//                 fullName: studentData.fullName,
//                 birthDate: studentData.birthDate,
//                 major: studentData.major,
//               }
//             });
//             await newUser.save();
//             createdAccounts.push(studentData.studentId);
//           }
//         } catch (userError) {
//           console.error(`Error creating account for ${studentData.studentId}:`, userError);
//         }
//       }
//     });

//     // Wait for all user creation operations
//     await new Promise(resolve => setTimeout(resolve, 1000));

//     const batch = new StudentBatch({
//       batchName,
//       decision,
//       students,
//       uploadedBy: req.user._id,
//     });

//     await batch.save();

//     // Clean up the uploaded file
//     fs.unlink(file.path, (err) => {
//       if (err) console.error('Lỗi xóa file:', err);
//     });

//     res.status(201).json({ 
//       message: 'Tải lên danh sách học viên thành công', 
//       batch,
//       createdAccounts: createdAccounts.length,
//       accountsCreated: createdAccounts
//     });
//   } catch (error) {
//     res.status(500).json({ message: 'Lỗi server', error: error.message });
//   }
// });

// // API cho học viên xem danh sách (chỉ admin và giảng viên)
// app.get('/students/batches', authenticateJWT, async (req, res) => {
//   try {
//     // Chỉ admin và giảng viên mới xem được danh sách đầy đủ
//     if (req.user.role !== 'Quản trị viên' && req.user.role !== 'Giảng viên') {
//       return res.status(403).json({ message: 'Không có quyền truy cập' });
//     }

//     const { search } = req.query;
//     let batches = await StudentBatch.find();

//     // Nếu có tìm kiếm, lọc kết quả
//     if (search) {
//       batches = batches.map(batch => ({
//         ...batch.toObject(),
//         students: batch.students.filter(student => 
//           student.studentId?.toLowerCase().includes(search.toLowerCase()) ||
//           student.fullName?.toLowerCase().includes(search.toLowerCase()) ||
//           student.major?.toLowerCase().includes(search.toLowerCase())
//         )
//       })).filter(batch => batch.students.length > 0);
//     }

//     res.status(200).json(batches);
//   } catch (error) {
//     res.status(500).json({ message: 'Lỗi server', error: error.message });
//   }
// });

// // API cho sinh viên xem thông tin cá nhân
// app.get('/student/profile', authenticateJWT, async (req, res) => {
//   try {
//     if (req.user.role !== 'Sinh viên') {
//       return res.status(403).json({ message: 'Chỉ sinh viên mới có quyền truy cập' });
//     }

//     const user = await User.findById(req.user._id);
//     if (!user || !user.studentInfo) {
//       return res.status(404).json({ message: 'Không tìm thấy thông tin sinh viên' });
//     }

//     res.status(200).json({
//       studentId: user.studentInfo.studentId,
//       fullName: user.studentInfo.fullName,
//       major: user.studentInfo.major,
//       // Không trả về ngày sinh vì yêu cầu chỉ cần 3 thông tin
//     });
//   } catch (error) {
//     res.status(500).json({ message: 'Lỗi server', error: error.message });
//   }
// });

// // API kiểm tra xác thực
// app.get('/auth/check', authenticateJWT, (req, res) => {
//   res.status(200).json({
//     authenticated: true,
//     user: {
//       username: req.user.username,
//       role: req.user.role
//     }
//   });
// });

// // API đăng xuất
// app.post('/logout', (req, res) => {
//   res.clearCookie('auth_token');
//   res.status(200).json({ message: 'Đăng xuất thành công' });
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
import multer from 'multer';
import exceljs from 'exceljs';
import fs from 'fs';

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
  origin: 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// Định nghĩa schema và model cho người dùng
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true, enum: ['Sinh viên', 'Giảng viên', 'Quản trị viên'] },
  // Thêm thông tin cho sinh viên
  studentInfo: {
    studentId: String,
    fullName: String,
    birthDate: Date,
    major: String,
  }
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

// Schema cho đề tài
const topicProposalSchema = new mongoose.Schema({
  studentId: { type: String, required: true },
  studentName: { type: String, required: true },
  topicTitle: { type: String, required: true },
  content: { type: String, required: true },
  primarySupervisor: { type: String, required: true },
  secondarySupervisor: { type: String },
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected'], 
    default: 'pending' 
  },
  supervisorComments: { type: String },
  submittedAt: { type: Date, default: Date.now },
  reviewedAt: { type: Date },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

const TopicProposal = mongoose.model('TopicProposal', topicProposalSchema);

// Hàm tạo JWT token
async function issueAuthToken(user) {
  const payload = {
    _id: user._id,
    username: user.username,
    role: user.role,
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
    maxAge: 1000 * 60 * 60,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
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
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword, role });
    await user.save();
    res.status(201).json({ message: 'Đăng ký thành công', user: { username, role } });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// API đăng nhập
app.post('/login', async (req, res) => {
  const { username, password, role } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: 'Tên đăng nhập không tồn tại' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Mật khẩu không đúng' });
    }
    // Kiểm tra vai trò
    if (user.role !== role) {
      return res.status(401).json({ message: 'Vai trò không khớp' });
    }
    const authToken = await issueAuthToken(user);
    issueAuthTokenCookie(res, authToken);
    res.status(200).json({
      message: 'Đăng nhập thành công',
      user: {
        username: user.username,
        role: user.role,
        studentInfo: user.studentInfo || null
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// Cấu hình multer để xử lý file upload
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}_${file.originalname}`);
  },
});

const upload = multer({ storage });

// API cho Admin nhập danh sách học viên và tự động tạo tài khoản
app.post('/admin/upload-students', authenticateJWT, upload.single('excelFile'), async (req, res) => {
  // Verify admin role
  if (req.user.role !== 'Quản trị viên') {
    return res.status(403).json({ message: 'Không có quyền truy cập' });
  }
  const { batchName, decision } = req.body;
  const file = req.file;
  if (!batchName || !decision || !file) {
    return res.status(400).json({ message: 'Thiếu thông tin hoặc file' });
  }
  try {
    const workbook = new exceljs.Workbook();
    await workbook.xlsx.readFile(file.path);
    const worksheet = workbook.getWorksheet(1);
    const students = [];
    const createdAccounts = [];
    worksheet.eachRow(async (row, rowNumber) => {
      if (rowNumber > 1) { // Bỏ qua header row
        const studentData = {
          studentId: row.getCell(1).value?.toString(),
          fullName: row.getCell(2).value?.toString(),
          birthDate: row.getCell(3).value,
          major: row.getCell(4).value?.toString(),
        };
        students.push(studentData);
        // Tạo tài khoản cho sinh viên
        try {
          const existingUser = await User.findOne({ username: studentData.studentId });
          if (!existingUser) {
            const hashedPassword = await bcrypt.hash('123', 10);
            const newUser = new User({
              username: studentData.studentId,
              password: hashedPassword,
              role: 'Sinh viên',
              studentInfo: {
                studentId: studentData.studentId,
                fullName: studentData.fullName,
                birthDate: studentData.birthDate,
                major: studentData.major,
              }
            });
            await newUser.save();
            createdAccounts.push(studentData.studentId);
          }
        } catch (userError) {
          console.error(`Error creating account for ${studentData.studentId}:`, userError);
        }
      }
    });
    // Wait for all user creation operations
    await new Promise(resolve => setTimeout(resolve, 1000));
    const batch = new StudentBatch({
      batchName,
      decision,
      students,
      uploadedBy: req.user._id,
    });
    await batch.save();
    // Clean up the uploaded file
    fs.unlink(file.path, (err) => {
      if (err) console.error('Lỗi xóa file:', err);
    });
    res.status(201).json({
      message: 'Tải lên danh sách học viên thành công',
      batch,
      createdAccounts: createdAccounts.length,
      accountsCreated: createdAccounts
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// API cho học viên xem danh sách (chỉ admin và giảng viên)
app.get('/students/batches', authenticateJWT, async (req, res) => {
  try {
    // Chỉ admin và giảng viên mới xem được danh sách đầy đủ
    if (req.user.role !== 'Quản trị viên' && req.user.role !== 'Giảng viên') {
      return res.status(403).json({ message: 'Không có quyền truy cập' });
    }
    const { studentId, fullName, birthDate, major } = req.query;
    let batches = await StudentBatch.find();
    
    // Nếu có tìm kiếm, lọc kết quả
    if (studentId || fullName || birthDate || major) {
      batches = batches.map(batch => ({
        ...batch.toObject(),
        students: batch.students.filter(student => {
          let matches = true;
          if (studentId && !student.studentId?.toLowerCase().includes(studentId.toLowerCase())) {
            matches = false;
          }
          if (fullName && !student.fullName?.toLowerCase().includes(fullName.toLowerCase())) {
            matches = false;
          }
          if (major && !student.major?.toLowerCase().includes(major.toLowerCase())) {
            matches = false;
          }
          if (birthDate) {
            const studentBirthDate = new Date(student.birthDate);
            const searchDate = new Date(birthDate);
            if (studentBirthDate.toDateString() !== searchDate.toDateString()) {
              matches = false;
            }
          }
          return matches;
        })
      })).filter(batch => batch.students.length > 0);
    }
    res.status(200).json(batches);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// API cho sinh viên xem thông tin cá nhân
app.get('/student/profile', authenticateJWT, async (req, res) => {
  try {
    if (req.user.role !== 'Sinh viên') {
      return res.status(403).json({ message: 'Chỉ sinh viên mới có quyền truy cập' });
    }
    const user = await User.findById(req.user._id);
    if (!user || !user.studentInfo) {
      return res.status(404).json({ message: 'Không tìm thấy thông tin sinh viên' });
    }
    res.status(200).json({
      studentId: user.studentInfo.studentId,
      fullName: user.studentInfo.fullName,
      major: user.studentInfo.major,
      // Không trả về ngày sinh vì yêu cầu chỉ cần 3 thông tin
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// API lấy danh sách giảng viên (cho autocomplete)
app.get('/supervisors', authenticateJWT, async (req, res) => {
  try {
    const supervisors = await User.find({ role: 'Giảng viên' }).select('username studentInfo.fullName');
    const supervisorList = supervisors.map(supervisor => ({
      username: supervisor.username,
      fullName: supervisor.studentInfo?.fullName || supervisor.username
    }));
    res.status(200).json(supervisorList);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// API sinh viên đề xuất đề tài
app.post('/student/propose-topic', authenticateJWT, async (req, res) => {
  try {
    if (req.user.role !== 'Sinh viên') {
      return res.status(403).json({ message: 'Chỉ sinh viên mới có quyền đề xuất đề tài' });
    }
    
    const { topicTitle, content, primarySupervisor, secondarySupervisor } = req.body;
    
    if (!topicTitle || !content || !primarySupervisor) {
      return res.status(400).json({ message: 'Thiếu thông tin bắt buộc' });
    }
    
    const user = await User.findById(req.user._id);
    
    const proposal = new TopicProposal({
      studentId: user.studentInfo?.studentId || user.username,
      studentName: user.studentInfo?.fullName || user.username,
      topicTitle,
      content,
      primarySupervisor,
      secondarySupervisor
    });
    
    await proposal.save();
    
    res.status(201).json({
      message: 'Đề xuất đề tài thành công',
      proposal: {
        id: proposal._id,
        topicTitle: proposal.topicTitle,
        status: proposal.status
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// API giảng viên xem đề xuất đề tài của sinh viên
app.get('/supervisor/topic-proposals', authenticateJWT, async (req, res) => {
  try {
    if (req.user.role !== 'Giảng viên') {
      return res.status(403).json({ message: 'Chỉ giảng viên mới có quyền truy cập' });
    }
    
    const proposals = await TopicProposal.find({
      $or: [
        { primarySupervisor: req.user.username },
        { secondarySupervisor: req.user.username }
      ]
    }).sort({ submittedAt: -1 });
    
    res.status(200).json(proposals);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// API giảng viên phê duyệt/từ chối đề tài
app.put('/supervisor/review-topic/:id', authenticateJWT, async (req, res) => {
  try {
    if (req.user.role !== 'Giảng viên') {
      return res.status(403).json({ message: 'Chỉ giảng viên mới có quyền phê duyệt' });
    }
    
    const { status, comments, topicTitle, content } = req.body;
    const proposalId = req.params.id;
    
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Trạng thái không hợp lệ' });
    }
    
    const proposal = await TopicProposal.findById(proposalId);
    if (!proposal) {
      return res.status(404).json({ message: 'Không tìm thấy đề xuất' });
    }
    
    // Kiểm tra quyền
    if (proposal.primarySupervisor !== req.user.username && proposal.secondarySupervisor !== req.user.username) {
      return res.status(403).json({ message: 'Bạn không có quyền phê duyệt đề xuất này' });
    }
    
    proposal.status = status;
    proposal.supervisorComments = comments;
    proposal.reviewedAt = new Date();
    proposal.reviewedBy = req.user._id;
    
    // Nếu giảng viên chỉnh sửa đề tài
    if (topicTitle) proposal.topicTitle = topicTitle;
    if (content) proposal.content = content;
    
    await proposal.save();
    
    res.status(200).json({
      message: `Đề tài đã được ${status === 'approved' ? 'phê duyệt' : 'từ chối'}`,
      proposal
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// API admin xem tất cả đề tài
app.get('/admin/topic-proposals', authenticateJWT, async (req, res) => {
  try {
    if (req.user.role !== 'Quản trị viên') {
      return res.status(403).json({ message: 'Chỉ quản trị viên mới có quyền truy cập' });
    }
    
    const { status } = req.query;
    let filter = {};
    if (status) {
      filter.status = status;
    }
    
    const proposals = await TopicProposal.find(filter)
      .populate('reviewedBy', 'username')
      .sort({ submittedAt: -1 });
    
    res.status(200).json(proposals);
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