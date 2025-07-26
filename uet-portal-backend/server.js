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

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true, enum: ['Sinh viên', 'Giảng viên', 'Quản trị viên', 'Chủ nhiệm bộ môn'] },
  managedMajor: { type: String }, // ngành mà CNBM quản lý
  // Thông tin chung cho tất cả user
  userInfo: {
    fullName: String,
    email: String,
    // Thêm các trường khác nếu cần
  },
  // Thông tin riêng cho sinh viên
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
    enum: ['pending', 'approved', 'rejected', 'waiting_head_approval', 'approved_by_head'],
    default: 'pending'
  },
  supervisorComments: { type: String },
  submittedAt: { type: Date, default: Date.now },
  reviewedAt: { type: Date },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  headId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // CNBM quản lý
  headComments: { type: String }
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

    // CHỈNH SỬA: Trả về thông tin phù hợp theo role
        let responseData = {
            message: 'Đăng nhập thành công',
            user: {
                username: user.username,
                role: user.role,
            }
        };

        // Thêm thông tin cụ thể theo role
        if (user.role === 'Sinh viên') {
            responseData.user.studentInfo = user.studentInfo || null;
        } else if (user.role === 'Chủ nhiệm bộ môn') {
            responseData.user.userInfo = user.userInfo || null;
            responseData.user.managedMajor = user.managedMajor || null;
        }

        res.status(200).json(responseData);
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



app.post('/admin/upload-heads', authenticateJWT, upload.single('excelFile'), async (req, res) => {
    if (req.user.role !== 'Quản trị viên') {
        return res.status(403).json({ message: 'Không có quyền truy cập' });
    }

    const file = req.file;
    if (!file) {
        return res.status(400).json({ message: 'Thiếu file' });
    }

    try {
        const workbook = new exceljs.Workbook();
        await workbook.xlsx.readFile(file.path);
        const worksheet = workbook.getWorksheet(1);

        const createdHeads = [];
        const errors = [];
        const headsData = [];

        // CHỈNH SỬA: Cải thiện cách đọc dữ liệu từ Excel
        worksheet.eachRow((row, rowNumber) => {
            if (rowNumber > 1) { // Bỏ qua header row
                // SỬA LỖI: Lấy giá trị cell một cách an toàn
                const stt = getCellValue(row.getCell(1));
                const fullName = getCellValue(row.getCell(2));
                const email = getCellValue(row.getCell(3));
                const managedMajor = getCellValue(row.getCell(4));

                console.log(`Hàng ${rowNumber}:`, { stt, fullName, email, managedMajor }); // Debug log

                // Kiểm tra đầy đủ thông tin và email hợp lệ
                if (stt && fullName && email && managedMajor && 
                    email.includes('@') && email.includes('.')) {
                    headsData.push({
                        stt: stt.trim(),
                        fullName: fullName.trim(),
                        email: email.trim().toLowerCase(), // Chuyển về lowercase để tránh lỗi
                        managedMajor: managedMajor.trim()
                    });
                } else {
                    console.log(`Bỏ qua hàng ${rowNumber}: thiếu thông tin hoặc email không hợp lệ`);
                    errors.push(`Hàng ${rowNumber}: Thiếu thông tin (STT: ${stt}, Tên: ${fullName}, Email: ${email}, Khoa: ${managedMajor})`);
                }
            }
        });

        console.log('Dữ liệu đã đọc:', headsData); // Debug log

        // Xử lý từng CNBM một cách tuần tự
        for (const headData of headsData) {
            try {
                // Kiểm tra xem email đã tồn tại chưa
                const existingUser = await User.findOne({ username: headData.email });
                
                if (!existingUser) {
                    // Kiểm tra xem ngành này đã có CNBM chưa
                    const existingHead = await User.findOne({
                        role: 'Chủ nhiệm bộ môn',
                        managedMajor: headData.managedMajor
                    });

                    if (!existingHead) {
                        const hashedPassword = await bcrypt.hash('123', 10);
                        
                        const newUser = new User({
                            username: headData.email, // Đảm bảo username là email
                            password: hashedPassword,
                            role: 'Chủ nhiệm bộ môn',
                            userInfo: {
                                fullName: headData.fullName,
                                email: headData.email
                            },
                            managedMajor: headData.managedMajor
                        });

                        await newUser.save();
                        console.log(`Đã tạo tài khoản cho: ${headData.email}`); // Debug log
                        
                        createdHeads.push({
                            email: headData.email,
                            fullName: headData.fullName,
                            managedMajor: headData.managedMajor
                        });
                    } else {
                        errors.push(`Ngành ${headData.managedMajor} đã có CNBM: ${existingHead.userInfo?.fullName || existingHead.username}`);
                    }
                } else {
                    errors.push(`Email đã tồn tại: ${headData.email}`);
                }
            } catch (userError) {
                console.error(`Error creating head for ${headData.email}:`, userError);
                errors.push(`Lỗi tạo tài khoản cho ${headData.email}: ${userError.message}`);
            }
        }

        // Clean up the uploaded file
        fs.unlink(file.path, (err) => {
            if (err) console.error('Lỗi xóa file:', err);
        });

        res.status(201).json({
            message: 'Tải lên danh sách Chủ nhiệm bộ môn hoàn tất',
            success: {
                total: createdHeads.length,
                accounts: createdHeads
            },
            errors: errors.length > 0 ? errors : undefined,
            totalProcessed: headsData.length
        });
    } catch (error) {
        console.error('Upload heads error:', error);
        // Clean up file nếu có lỗi
        if (file && file.path) {
            fs.unlink(file.path, (err) => {
                if (err) console.error('Lỗi xóa file:', err);
            });
        }
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
});

function getCellValue(cell) {
    if (!cell || cell.value === null || cell.value === undefined) {
        return '';
    }
    
    // Xử lý các kiểu dữ liệu khác nhau
    if (typeof cell.value === 'object') {
        // Nếu là object, có thể là date hoặc formula
        if (cell.value.result !== undefined) {
            return cell.value.result.toString();
        } else if (cell.value.text !== undefined) {
            return cell.value.text.toString();
        } else {
            return cell.value.toString();
        }
    }
    
    return cell.value.toString();
}

app.get('/students/batches', authenticateJWT, async (req, res) => {
  try {
    let allowedToView = false;
    let majorFilter = null;

    // Kiểm tra quyền truy cập
    if (req.user.role === 'Quản trị viên' || req.user.role === 'Giảng viên') {
      allowedToView = true;
    } else if (req.user.role === 'Chủ nhiệm bộ môn') {
      allowedToView = true;
      // CNBM chỉ được xem sinh viên thuộc ngành mình quản lý
      const head = await User.findById(req.user._id);
      majorFilter = head.managedMajor;
    }

    if (!allowedToView) {
      return res.status(403).json({ message: 'Không có quyền truy cập' });
    }

    const { studentId, fullName, birthDate, major } = req.query;
    let batches = await StudentBatch.find();

    // Lọc theo ngành nếu là CNBM
    if (majorFilter) {
      batches = batches.map(batch => ({
        ...batch.toObject(),
        students: batch.students.filter(student =>
          student.major === majorFilter
        )
      })).filter(batch => batch.students.length > 0);
    }

    // Áp dụng các bộ lọc tìm kiếm
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

// API lấy danh sách CNBM (cho admin quản lý)
app.get('/admin/heads', authenticateJWT, async (req, res) => {
  try {
    if (req.user.role !== 'Quản trị viên') {
      return res.status(403).json({ message: 'Chỉ admin mới có quyền truy cập' });
    }

    const heads = await User.find({ role: 'Chủ nhiệm bộ môn' })
      .select('username userInfo.fullName managedMajor createdAt')
      .sort({ createdAt: -1 });

    const headsList = heads.map(head => ({
      id: head._id,
      email: head.username,
      fullName: head.userInfo?.fullName || 'Chưa có tên',
      managedMajor: head.managedMajor,
      createdAt: head.createdAt
    }));

    res.status(200).json({
      message: 'Lấy danh sách CNBM thành công',
      total: headsList.length,
      heads: headsList
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// API xóa CNBM (cho admin)
app.delete('/admin/heads/:id', authenticateJWT, async (req, res) => {
  try {
    if (req.user.role !== 'Quản trị viên') {
      return res.status(403).json({ message: 'Chỉ admin mới có quyền xóa' });
    }

    const headId = req.params.id;
    const head = await User.findById(headId);

    if (!head || head.role !== 'Chủ nhiệm bộ môn') {
      return res.status(404).json({ message: 'Không tìm thấy Chủ nhiệm bộ môn' });
    }

    await User.findByIdAndDelete(headId);

    res.status(200).json({
      message: `Đã xóa Chủ nhiệm bộ môn ${head.userInfo?.fullName || head.username}`,
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// API cập nhật thông tin CNBM
app.put('/admin/heads/:id', authenticateJWT, async (req, res) => {
  try {
    if (req.user.role !== 'Quản trị viên') {
      return res.status(403).json({ message: 'Chỉ admin mới có quyền cập nhật' });
    }

    const headId = req.params.id;
    const { fullName, managedMajor } = req.body;

    const head = await User.findById(headId);
    if (!head || head.role !== 'Chủ nhiệm bộ môn') {
      return res.status(404).json({ message: 'Không tìm thấy Chủ nhiệm bộ môn' });
    }

    // Cập nhật thông tin
    if (fullName) {
      head.userInfo = head.userInfo || {};
      head.userInfo.fullName = fullName;
    }

    if (managedMajor) {
      // Kiểm tra xem ngành này đã có CNBM chưa
      const existingHead = await User.findOne({
        role: 'Chủ nhiệm bộ môn',
        managedMajor: managedMajor,
        _id: { $ne: headId }
      });

      if (existingHead) {
        return res.status(400).json({
          message: `Ngành "${managedMajor}" đã có Chủ nhiệm bộ môn khác`,
        });
      }

      head.managedMajor = managedMajor;
    }

    await head.save();

    res.status(200).json({
      message: 'Cập nhật thông tin CNBM thành công',
      head: {
        id: head._id,
        email: head.username,
        fullName: head.userInfo?.fullName,
        managedMajor: head.managedMajor
      }
    });
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

// API giảng viên phê duyệt/từ chối đề tài (da cập nhật API giảng viên phê duyệt/từ chối đề tài để hỗ trợ bổ sung giảng viên đồng hướng dẫn)
app.put('/supervisor/review-topic/:id', authenticateJWT, async (req, res) => {
  try {
    if (req.user.role !== 'Giảng viên') {
      return res.status(403).json({ message: 'Chỉ giảng viên mới có quyền phê duyệt' });
    }

    const { status, comments, topicTitle, content, secondarySupervisor } = req.body;
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

    // Cập nhật thông tin
    proposal.status = status;
    proposal.supervisorComments = comments;
    proposal.reviewedAt = new Date();
    proposal.reviewedBy = req.user._id;

    // Cập nhật thông tin đề tài nếu có chỉnh sửa
    if (topicTitle) proposal.topicTitle = topicTitle;
    if (content) proposal.content = content;
    if (secondarySupervisor !== undefined) proposal.secondarySupervisor = secondarySupervisor;

    // Nếu phê duyệt, tìm CNBM quản lý ngành của sinh viên
    if (status === 'approved') {
      const studentUser = await User.findOne({ 'studentInfo.studentId': proposal.studentId });
      if (studentUser && studentUser.studentInfo && studentUser.studentInfo.major) {
        const head = await User.findOne({ role: 'Chủ nhiệm bộ môn', managedMajor: studentUser.studentInfo.major });
        if (head) {
          proposal.status = 'waiting_head_approval';
          proposal.headId = head._id;
        }
      }
    }

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

// Nếu sửa code chỉ được sửa từ dòng này
     

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

// API CNBM xem các đề tài chờ duyệt
app.get('/head/topic-proposals', authenticateJWT, async (req, res) => {
  if (req.user.role !== 'Chủ nhiệm bộ môn') {
    return res.status(403).json({ message: 'Chỉ CNBM mới có quyền truy cập' });
  }
  const proposals = await TopicProposal.find({ headId: req.user._id, status: 'waiting_head_approval' });
  res.status(200).json(proposals);
});

// API CNBM duyệt hoặc trả lại đề tài
app.put('/head/review-topic/:id', authenticateJWT, async (req, res) => {
  if (req.user.role !== 'Chủ nhiệm bộ môn') {
    return res.status(403).json({ message: 'Chỉ CNBM mới có quyền duyệt' });
  }
  const { status, comments } = req.body;
  if (!['approved_by_head', 'returned'].includes(status)) {
    return res.status(400).json({ message: 'Trạng thái không hợp lệ' });
  }
  const proposal = await TopicProposal.findById(req.params.id);
  if (!proposal || !proposal.headId.equals(req.user._id)) {
    return res.status(404).json({ message: 'Không tìm thấy đề xuất' });
  }
  if (status === 'approved_by_head') {
    proposal.status = 'approved_by_head';
    proposal.headComments = comments;
    await proposal.save();
    res.status(200).json({ message: 'Đề tài đã được CNBM phê duyệt', proposal });
  } else {
    // Trả lại: xóa đề tài khỏi DB
    await proposal.deleteOne();
    res.status(200).json({ message: 'Đề tài đã bị trả lại và xóa khỏi hệ thống' });
  }
});

// API đổi mật khẩu
app.post('/change-password', authenticateJWT, async (req, res) => {
  try {
    const { oldPassword, newPassword, confirmPassword } = req.body;
    if (!oldPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin.' });
    }
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'Mật khẩu mới và xác nhận không khớp.' });
    }
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng.' });
    }
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Mật khẩu cũ không đúng.' });
    }
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.status(200).json({ message: 'Đổi mật khẩu thành công.' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});
// API lấy danh sách tất cả giảng viên (cho autocomplete khi bổ sung giảng viên đồng hướng dẫn)
app.get('/lecturers', authenticateJWT, async (req, res) => {
  try {
    const lecturers = await User.find({ role: 'Giảng viên' }).select('username userInfo.fullName');
    const lecturerList = lecturers.map(lecturer => ({
      username: lecturer.username,
      fullName: lecturer.userInfo?.fullName || lecturer.username
    }));
    res.status(200).json(lecturerList);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// API CNBM xem thống kê học viên và đề tài thuộc ngành quản lý
app.get('/head/students-statistics', authenticateJWT, async (req, res) => {
  try {
    if (req.user.role !== 'Chủ nhiệm bộ môn') {
      return res.status(403).json({ message: 'Chỉ CNBM mới có quyền truy cập' });
    }

    // Lấy thông tin CNBM
    const head = await User.findById(req.user._id);
    if (!head || !head.managedMajor) {
      return res.status(404).json({ message: 'Không tìm thấy thông tin ngành quản lý' });
    }

    // Lấy danh sách học viên thuộc ngành
    const students = await User.find({ 
      role: 'Sinh viên',
      'studentInfo.major': head.managedMajor 
    }).select('studentInfo');

    // Lấy danh sách đề tài của các học viên thuộc ngành
    const studentIds = students.map(student => student.studentInfo?.studentId).filter(Boolean);
    const topics = await TopicProposal.find({ 
      studentId: { $in: studentIds } 
    }).sort({ submittedAt: -1 });

    // Tạo map để ghép thông tin
    const topicsByStudent = {};
    topics.forEach(topic => {
      if (!topicsByStudent[topic.studentId]) {
        topicsByStudent[topic.studentId] = [];
      }
      topicsByStudent[topic.studentId].push(topic);
    });

    // Tạo danh sách kết quả
    const result = students.map(student => ({
      studentId: student.studentInfo?.studentId,
      fullName: student.studentInfo?.fullName,
      major: student.studentInfo?.major,
      topics: topicsByStudent[student.studentInfo?.studentId] || []
    }));

    // Thống kê tổng quan
    const statistics = {
      totalStudents: students.length,
      studentsWithTopics: result.filter(s => s.topics.length > 0).length,
      totalTopics: topics.length,
      topicsByStatus: {
        pending: topics.filter(t => t.status === 'pending').length,
        approved: topics.filter(t => t.status === 'approved').length,
        rejected: topics.filter(t => t.status === 'rejected').length,
        waiting_head_approval: topics.filter(t => t.status === 'waiting_head_approval').length,
        approved_by_head: topics.filter(t => t.status === 'approved_by_head').length
      }
    };

    res.status(200).json({
      major: head.managedMajor,
      statistics,
      students: result
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// Khởi động server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// API cho Admin nhập danh sách giảng viên
app.post('/admin/upload-lecturers', authenticateJWT, upload.single('excelFile'), async (req, res) => {
  if (req.user.role !== 'Quản trị viên') {
    return res.status(403).json({ message: 'Không có quyền truy cập' });
  }

  const { faculty } = req.body;
  const file = req.file;
  if (!faculty || !file) {
    return res.status(400).json({ message: 'Thiếu thông tin hoặc file' });
  }

  try {
    const workbook = new exceljs.Workbook();
    await workbook.xlsx.readFile(file.path);
    const worksheet = workbook.getWorksheet(1);

    const lecturers = [];
    const createdAccounts = [];
    const errors = [];

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) {
        const stt = row.getCell(1).value?.toString()?.trim();
        const fullName = row.getCell(2).value?.toString()?.trim();
        const email = row.getCell(3).value?.toString()?.trim().toLowerCase();
        const department = row.getCell(4).value?.toString()?.trim() || '';
        const position = row.getCell(5).value?.toString()?.trim() || '';

        // Bỏ qua nếu thiếu email hoặc họ tên
        if (!email || !fullName) {
          errors.push(`Hàng ${rowNumber}: Thiếu email hoặc họ tên`);
          return;
        }

        lecturers.push({ stt, fullName, email, department, position });
      }
    });

    for (const lecturer of lecturers) {
      try {
        const existingUser = await User.findOne({ username: lecturer.email });
        if (!existingUser) {
          const hashedPassword = await bcrypt.hash('123', 10);
          const newUser = new User({
            username: lecturer.email,
            password: hashedPassword,
            role: 'Giảng viên',
            userInfo: {
              fullName: lecturer.fullName,
              email: lecturer.email,
              department: lecturer.department,
              position: lecturer.position,
              faculty: faculty
            }
          });
          await newUser.save();
          createdAccounts.push(lecturer.email);
        }
      } catch (userError) {
        errors.push(`Lỗi tạo tài khoản cho ${lecturer.email}: ${userError.message}`);
      }
    }

    fs.unlink(file.path, (err) => {
      if (err) console.error('Lỗi xóa file:', err);
    });

    res.status(201).json({
      message: `Đã tải lên ${createdAccounts.length} giảng viên cho khoa "${faculty}"`,
      createdAccounts,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    if (file && file.path) {
      fs.unlink(file.path, (err) => {
        if (err) console.error('Lỗi xóa file:', err);
      });
    }
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// API lấy danh sách các khoa/ngành (từ giảng viên và CNBM)
app.get('/faculties', authenticateJWT, async (req, res) => {
  try {
    // Lấy tất cả faculty từ user là Giảng viên và CNBM
    const lecturers = await User.find({ role: { $in: ['Giảng viên', 'Chủ nhiệm bộ môn'] } }).select('userInfo.faculty');
    const faculties = [...new Set(lecturers.map(l => l.userInfo?.faculty).filter(Boolean))];
    res.status(200).json(faculties);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// API lấy danh sách giảng viên và CNBM theo khoa/ngành
app.get('/faculty/:facultyName/members', authenticateJWT, async (req, res) => {
  try {
    const facultyName = req.params.facultyName;
    // Lấy giảng viên
    const lecturers = await User.find({
      role: 'Giảng viên',
      'userInfo.faculty': facultyName
    }).select('userInfo.fullName userInfo.email userInfo.department userInfo.position');
    // Lấy CNBM
    const heads = await User.find({
      role: 'Chủ nhiệm bộ môn',
      'userInfo.faculty': facultyName
    }).select('userInfo.fullName userInfo.email managedMajor');
    // Gộp kết quả
    const result = [
      ...lecturers.map((l, idx) => ({
        stt: idx + 1,
        fullName: l.userInfo.fullName,
        email: l.userInfo.email,
        department: l.userInfo.department,
        position: l.userInfo.position || '',
        role: 'Giảng viên'
      })),
      ...heads.map((h, idx) => ({
        stt: lecturers.length + idx + 1,
        fullName: h.userInfo.fullName,
        email: h.userInfo.email,
        department: h.managedMajor,
        position: 'Chủ nhiệm bộ môn',
        role: 'Chủ nhiệm bộ môn'
      }))
    ];
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});