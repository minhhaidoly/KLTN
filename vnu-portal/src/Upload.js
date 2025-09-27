import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TextField, Button, Paper, Typography, Box, Alert,
  Drawer, List, ListItem, ListItemText
} from '@mui/material';
import axios from 'axios';
import './Dashboard.css';
import logo from './logo.png';
import HelpIcon from '@mui/icons-material/Help';
import InfoIcon from '@mui/icons-material/Info';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ContactMailIcon from '@mui/icons-material/ContactMail';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import AssignmentIcon from '@mui/icons-material/Assignment';
import GroupIcon from '@mui/icons-material/Group';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import SettingsIcon from '@mui/icons-material/Settings';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';


function Upload() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user')) || {};
  const [excelFile, setExcelFile] = useState(null);
  const [year, setYear] = useState(new Date().getFullYear());
  const [batchOptions, setBatchOptions] = useState([]);
  const [batchNumber, setBatchNumber] = useState('');
  const [yearOptions, setYearOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [decision, setDecision] = useState('');

  useEffect(() => {
    // Tạo danh sách năm từ năm hiện tại đến năm+20
    const now = new Date().getFullYear();
    setYearOptions(Array.from({ length: 20 }, (_, i) => now + i));
  }, []);

  useEffect(() => {
    // Khi chọn năm, gọi API lấy danh sách các đợt đã tồn tại
    async function fetchBatchNames() {
      try {
        const res = await fetch(`http://localhost:5000/admin/batch-names?year=${year}`, { credentials: 'include' });
        const data = await res.json();
        // Lấy các số thứ tự đã tồn tại
        const existedNumbers = data.map(name => {
          const match = name.match(/^Đợt (\d+)\/\d{4}$/);
          return match ? parseInt(match[1], 10) : null;
        }).filter(Boolean);
        // Tạo option từ 1-20, loại bỏ số đã tồn tại
        const options = Array.from({ length: 20 }, (_, i) => i + 1).filter(num => !existedNumbers.includes(num));
        setBatchOptions(options);
        setBatchNumber(options[0] || '');
      } catch (e) {
        setBatchOptions([]);
      }
    }
    fetchBatchNames();
  }, [year]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!excelFile || !batchNumber || !year) {
      setMessage({ type: 'error', text: 'Vui lòng chọn đầy đủ thông tin.' });
      return;
    }
    const batchName = `Đợt ${batchNumber}/${year}`;
    setLoading(true);
    setMessage({ type: '', text: '' });

    const formData = new FormData();
    formData.append('batchName', batchName);
    formData.append('excelFile', excelFile);

    try {
      const response = await axios.post('http://localhost:5000/admin/upload-students', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true,
      });

      setMessage({
        type: 'success',
        text: `${response.data.message}. Đã tạo ${response.data.createdAccounts} tài khoản cho học viên.`
      });
      setBatchNumber('');
      setYear(new Date().getFullYear());
      setExcelFile(null);
      document.getElementById('excel-file-input').value = '';
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Lỗi: Không thể tải lên file. Vui lòng thử lại sau.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    document.cookie = 'auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    navigate('/');
  };

  const handleFileChange = (e) => {
    setExcelFile(e.target.files[0]);
  };

  const renderUploadForm = () => {
    if (user.role !== 'Quản trị viên') {
      return (
        <Box sx={{ p: 3 }}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h5" color="error">
              Chỉ Quản trị viên mới có quyền truy cập chức năng này!
            </Typography>
          </Paper>
        </Box>
      );
    }

    return (
      <Box sx={{ p: 3 }}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h4" gutterBottom>
            Tải lên danh sách học viên
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Hệ thống sẽ tự động tạo tài khoản cho các học viên với mật khẩu mặc định là "123"
          </Typography>
          {message.text && (
            <Alert severity={message.type} sx={{ my: 2 }}>
              {message.text}
            </Alert>
          )}
          <form onSubmit={handleUpload}>
            <label>Chọn năm:</label>
            <select value={year} onChange={e => setYear(Number(e.target.value))}>
              {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <label>Chọn số thứ tự đợt:</label>
            <select value={batchNumber} onChange={e => setBatchNumber(e.target.value)}>
              {batchOptions.map(num => <option key={num} value={num}>{num}</option>)}
            </select>
            <TextField
              label="Quyết định"
              value={decision}
              onChange={(e) => setDecision(e.target.value)}
              fullWidth
              margin="normal"
              required
              multiline
              rows={4}
              helperText="Nhập quyết định (ví dụ: Quyết định số 123/QĐĐHCN ngày 30/12/2024)"
            />
            <Box sx={{ my: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                File Excel danh sách học viên *
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                File Excel phải có các cột: mã học viên, họ và tên, ngày tháng năm sinh, ngành học
              </Typography>
              <input
                id="excel-file-input"
                type="file"
                accept=".xlsx, .xls"
                onChange={handleFileChange}
                required
                style={{ marginTop: '8px' }}
              />
            </Box>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              style={{ marginTop: 20 }}
              disabled={loading}
            >
              {loading ? 'Đang tải lên...' : 'Tải lên'}
            </Button>
          </form>
        </Paper>
      </Box>
    );
  };

  return (
    <div className="dashboard">
      <Drawer variant="permanent" anchor="left">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 2 }}>
          <img
            src={logo}
            alt="Logo"
            style={{ width: '80px', height: '80px', objectFit: 'contain', cursor: 'pointer' }}
            onClick={() => navigate('/dashboard')}
          />
        </Box>
        <List>
          <ListItem button onClick={() => navigate('/dashboard')}>
            <DashboardIcon sx={{ mr: 1 }} />
            <ListItemText primary="Dashboard" />
          </ListItem>
          <ListItem button onClick={() => navigate('/profile')}>
            <AccountCircleIcon sx={{ mr: 1 }} />
            <ListItemText primary="Account" />
          </ListItem>
          {(user.role === 'Quản trị viên' || user.role === 'Giảng viên' || user.role === 'Chủ nhiệm bộ môn') && (
            <ListItem button onClick={() => navigate('/batches')}>
              <GroupIcon sx={{ mr: 1 }} />
              <ListItemText primary="Danh sách học viên" />
            </ListItem>
          )}
          {user.role === 'Quản trị viên' && (
            <>
              <ListItem button onClick={() => navigate('/upload')}>
                <UploadFileIcon sx={{ mr: 1 }} />
                <ListItemText primary="Tải lên danh sách" />
              </ListItem>
              <ListItem button onClick={() => navigate('/upload-heads')}>
                <UploadFileIcon sx={{ mr: 1 }} />
                <ListItemText primary="Tải lên CNBM" />
              </ListItem>
              <ListItem button onClick={() => navigate('/upload-lecturers')}>
                <UploadFileIcon sx={{ mr: 1 }} />
                <ListItemText primary="Tải lên danh sách giảng viên" />
              </ListItem>
              <ListItem button onClick={() => navigate('/topic-proposals')}>
                <AssignmentIcon sx={{ mr: 1 }} />
                <ListItemText primary="Đề tài chưa được phê duyệt" />
              </ListItem>
            </>
          )}
          {user.role === 'Sinh viên' && (
            <>
              <ListItem button onClick={() => navigate('/propose-topic')}>
                <AssignmentIcon sx={{ mr: 1 }} />
                <ListItemText primary="Đề xuất đề cương" />
              </ListItem>
              <ListItem button onClick={() => navigate('/faculties-info')}>
                <InfoIcon sx={{ mr: 1 }} />
                <ListItemText primary="Thông tin" />
              </ListItem>
            </>
          )}
          {user.role === 'Giảng viên' && (
            <ListItem button onClick={() => navigate('/topics')}>
              <AssignmentIcon sx={{ mr: 1 }} />
              <ListItemText primary="Đề xuất từ học viên" />
            </ListItem>
          )}
          {user.role === 'Chủ nhiệm bộ môn' && (
            <ListItem button onClick={() => navigate('/head/topics')}>
              <AssignmentIcon sx={{ mr: 1 }} />
              <ListItemText primary="Đề tài chờ phê duyệt" />
            </ListItem>
          )}
          {user.role === 'Chủ nhiệm bộ môn' && (
            <ListItem button onClick={() => navigate('/head/statistics')}>
              <GroupIcon sx={{ mr: 1 }} />
              <ListItemText primary="Thống kê học viên" />
            </ListItem>
          )}
          <ListItem button onClick={() => navigate('/calendar')}>
            <CalendarMonthIcon sx={{ mr: 1 }} />
            <ListItemText primary="Calendar" />
          </ListItem>
          <ListItem button onClick={() => navigate('/settings')}>
            <SettingsIcon sx={{ mr: 1 }} />
            <ListItemText primary="Setting" />
          </ListItem>
          <ListItem button onClick={() => navigate('/help')}>
            <HelpIcon sx={{ mr: 1 }} />
            <ListItemText primary="Help" />
          </ListItem>
          <ListItem button onClick={() => navigate('/about')}>
            <InfoIcon sx={{ mr: 1 }} />
            <ListItemText primary="Introduction" />
          </ListItem>
          <ListItem button onClick={() => navigate('/contact')}>
            <ContactMailIcon sx={{ mr: 1 }} />
            <ListItemText primary="Contact" />
          </ListItem>
          <ListItem button onClick={handleLogout}>
            <ExitToAppIcon sx={{ mr: 1 }} />
            <ListItemText primary="Logout" />
          </ListItem>
        </List>
      </Drawer>
      <div className="dashboard-content">
        {renderUploadForm()}
      </div>
    </div>
  );
}

export default Upload;