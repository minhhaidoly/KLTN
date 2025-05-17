import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TextField, Button, Paper, Typography, Box, Alert,
  Drawer, List, ListItem, ListItemText 
} from '@mui/material';
import axios from 'axios';
import './Dashboard.css'; // Import Dashboard CSS for consistent styling
import logo from './logo.png';

function Upload() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user')) || {};
  const [batchName, setBatchName] = useState('');
  const [decision, setDecision] = useState('');
  const [excelFile, setExcelFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleFileChange = (e) => {
    setExcelFile(e.target.files[0]);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (user.role !== 'Quản trị viên') {
      setMessage({ type: 'error', text: 'Chỉ quản trị viên mới có quyền này!' });
      return;
    }

    if (!batchName || !decision || !excelFile) {
      setMessage({ type: 'error', text: 'Vui lòng điền đầy đủ thông tin!' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    const formData = new FormData();
    formData.append('batchName', batchName);
    formData.append('decision', decision);
    formData.append('excelFile', excelFile);

    try {
      const response = await axios.post('http://localhost:5000/admin/upload-students', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true,
      });
      setMessage({ type: 'success', text: response.data.message });
      setBatchName('');
      setDecision('');
      setExcelFile(null);
      // Reset file input
      document.getElementById('excel-file-input').value = '';
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Lỗi: Không thể tải lên file. Vui lòng thử lại sau.',
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

  // Hiển thị nội dung form upload
  const renderUploadForm = () => {
    // Nếu người dùng không phải là admin, hiển thị thông báo
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
          {message.text && (
            <Alert severity={message.type} sx={{ my: 2 }}>
              {message.text}
            </Alert>
          )}
          <form onSubmit={handleUpload}>
            <TextField
              label="Tên đợt (ví dụ: đợt 1/2025, 4/2024...)"
              value={batchName}
              onChange={(e) => setBatchName(e.target.value)}
              fullWidth
              margin="normal"
              required
              helperText="Nhập tên đợt học viên"
            />
            <TextField
              label="Quyết định"
              value={decision}
              onChange={(e) => setDecision(e.target.value)}
              fullWidth
              margin="normal"
              required
              multiline
              rows={4}
              helperText="Nhập quyết định (ví dụ: Quyết định số 123/QĐĐHCN ngày 3/10/2025...)"
            />
            <Box sx={{ my: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                File Excel danh sách học viên *
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
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
            <ListItemText primary="Dashboard" />
          </ListItem>
          <ListItem button onClick={() => navigate('/profile')}>
            <ListItemText primary="Account" />
          </ListItem>
          <ListItem button onClick={() => navigate('/batches')}>
            <ListItemText primary="Danh sách học viên" />
          </ListItem>
          {user.role === 'Quản trị viên' && (
            <ListItem button onClick={() => navigate('/upload')}>
              <ListItemText primary="Tải lên danh sách" />
            </ListItem>
          )}
          <ListItem button onClick={() => navigate('/calendar')}>
            <ListItemText primary="Calendar" />
          </ListItem>
          <ListItem button onClick={() => navigate('/settings')}>
            <ListItemText primary="Setting" />
          </ListItem>
          <ListItem button onClick={() => navigate('/help')}>
            <ListItemText primary="Help" />
          </ListItem>
          <ListItem button onClick={() => navigate('/about')}>
            <ListItemText primary="Introduction" />
          </ListItem>
          <ListItem button onClick={() => navigate('/contact')}>
            <ListItemText primary="Contact" />
          </ListItem>
          <ListItem button onClick={handleLogout}>
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