import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Button, Typography, Paper, CircularProgress, Alert, Drawer, List, ListItem, ListItemText, TextField
} from '@mui/material';
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

function UploadLecturers() {
  const [excelFile, setExcelFile] = useState(null);
  const [faculty, setFaculty] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user')) || {};

  const handleFileChange = (e) => setExcelFile(e.target.files[0]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!faculty.trim()) {
      setMessage({ type: 'error', text: 'Vui lòng nhập Khoa/Ngành' });
      return;
    }
    if (!excelFile) {
      setMessage({ type: 'error', text: 'Vui lòng chọn file Excel' });
      return;
    }
    const formData = new FormData();
    formData.append('faculty', faculty.trim());
    formData.append('excelFile', excelFile);
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/admin/upload-lecturers', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });
      const data = await response.json();
      if (response.ok) {
        setMessage({ type: 'success', text: data.message });
      } else {
        setMessage({ type: 'error', text: data.message });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Lỗi khi tải lên file' });
    }
    setLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    document.cookie = 'auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/';
    navigate('/');
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
        <Box sx={{ p: 3 }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Tải lên danh sách Giảng viên
            </Typography>
            <form onSubmit={handleUpload}>
              <TextField
                label="Khoa/Ngành"
                value={faculty}
                onChange={e => setFaculty(e.target.value)}
                fullWidth
                required
                sx={{ mb: 2 }}
              />
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                style={{ marginBottom: '1rem' }}
              />
              <Button
                variant="contained"
                type="submit"
                disabled={loading}
                sx={{ mt: 2 }}
              >
                {loading ? <CircularProgress size={24} /> : 'Tải lên'}
              </Button>
            </form>
            {message.text && (
              <Alert severity={message.type} sx={{ mt: 2 }}>
                {message.text}
              </Alert>
            )}
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                File Excel phải gồm các cột: STT, Họ và tên, Email, Bộ môn/Phòng thí nghiệm, Chức vụ.
              </Typography>
            </Box>
          </Paper>
        </Box>
      </div>
    </div>
  );
}

export default UploadLecturers;