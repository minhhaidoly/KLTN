import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';
import { Drawer, List, ListItem, ListItemText, Box, Typography, Paper, IconButton } from '@mui/material';
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
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user')) || {};
  const [drawerOpen, setDrawerOpen] = useState(true);

  const handleLogout = () => {
    localStorage.removeItem('user');
    document.cookie = 'auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    navigate('/');
  };

  // Chiều rộng Drawer
  const drawerWidth = 260;
  // Chiều rộng nút (1/6 Drawer)
  const buttonWidth = drawerWidth / 6;

  // const drawerWidth = 240;
  const collapsedWidth = 60;

  return (
    <div className="dashboard">
      {/* Nút nhỏ ở góc trái dưới cùng, luôn hiển thị */}
      <Box
        sx={{
          position: 'fixed',
          left: 0,
          bottom: 24,
          width: drawerWidth,
          pointerEvents: 'none',
          zIndex: 2000,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            pointerEvents: 'auto',
          }}
        >
          <IconButton
            onClick={() => setDrawerOpen(!drawerOpen)}
            size="small"
            sx={{
              width: buttonWidth,
              height: 36,
              bgcolor: 'white',
              border: '1px solid #e0e0e0',
              boxShadow: 1,
              transition: 'left 0.2s',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            {drawerOpen ? <ChevronLeftIcon /> : <ChevronRightIcon />}
          </IconButton>
        </Box>
      </Box>

      <Drawer
        variant="persistent"
        anchor="left"
        open={drawerOpen}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            transition: 'width 0.2s',
          },
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 2 }}>
          <img
            src={logo}
            alt="Logo"
            style={{ width: '80px', height: '80px', objectFit: 'contain', cursor: 'pointer' }}
            onClick={() => navigate('/dashboard')}
          />
        </Box>
        <List sx={{ flexGrow: 1 }}>
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
              <ListItem button onClick={() => navigate('/faculties-info')}>
                <InfoIcon sx={{ mr: 1 }} />
                <ListItemText primary="Thông tin" />
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
              <ListItem button onClick={() => navigate('/notifications')}>
                <InfoIcon sx={{ mr: 1 }} />
                <ListItemText primary="Thông báo" />
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

      <div
        className="dashboard-content"
        style={{
          marginLeft: drawerOpen ? drawerWidth : 0,
          transition: 'margin-left 0.2s'
        }}
      >
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h4" gutterBottom>
            Hello {user.userInfo?.fullName || user.studentInfo?.fullName || user.username || 'Khách'}
          </Typography>
          <Typography variant="subtitle1">
            Role: {user.role || 'Không xác định'}
          </Typography>
        </Paper>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" gutterBottom>
            Chào mừng bạn đến với hệ thống quản lý học viên
          </Typography>
          <Typography variant="body1">
            Thông báo mới nhất:
          </Typography>
        </Box>

        {user.role === 'Quản trị viên' && (
          <Paper sx={{ p: 3, mb: 3, bgcolor: '#f5f8ff' }}>
            <Typography variant="h6" gutterBottom>
              (Note sau xóa:) Chức năng quản trị viên
            </Typography>
            <Typography variant="body1" paragraph>
              - Tải lên danh sách học viên từ file Excel
            </Typography>
            <Typography variant="body1" paragraph>
              - Xem và tìm kiếm danh sách học viên
            </Typography>
            <Typography variant="body2">
              Hệ thống sẽ tự động tạo tài khoản cho các học viên khi tải lên danh sách
            </Typography>
          </Paper>
        )}

        {user.role === 'Giảng viên' && (
          <Paper sx={{ p: 3, mb: 3, bgcolor: '#fff8f5' }}>
            <Typography variant="h6" gutterBottom>
              (Note sau xóa:) Chức năng giảng viên
            </Typography>
            <Typography variant="body1" paragraph>
              - Xem và tìm kiếm danh sách học viên
            </Typography>
            <Typography variant="body2">
              Bạn có thể xem thông tin của tất cả học viên trong hệ thống
            </Typography>
          </Paper>
        )}

        {user.role === 'Sinh viên' && (
          <Paper sx={{ p: 3, bgcolor: '#f5fff8' }}>
            <Typography variant="h6" gutterBottom>
              (Note sau xóa:) Thông tin học viên
            </Typography>
            <Typography variant="body1" paragraph>
              - Xem thông tin cá nhân trong mục "Account"
            </Typography>
            <Typography variant="body2">
              Bạn có thể xem mã học viên, họ tên và ngành học của mình
            </Typography>
          </Paper>
        )}
      </div>
    </div>
  );
}

export default Dashboard;