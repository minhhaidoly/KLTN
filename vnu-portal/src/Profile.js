import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Typography, Box, Paper, CircularProgress, Alert,
    Drawer, List, ListItem, ListItemText, Card, CardContent
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


function Profile() {
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const user = JSON.parse(localStorage.getItem('user')) || {};
    const navigate = useNavigate();

    useEffect(() => {
        if (user.role === 'Sinh viên') {
            fetchStudentProfile();
        } else {
            // Nếu không phải sinh viên, hiển thị thông tin cơ bản
            setProfileData({
                username: user.username,
                role: user.role
            });
            setLoading(false);
        }
    }, []);

    const fetchStudentProfile = async () => {
        try {
            const response = await axios.get('http://localhost:5000/student/profile', {
                withCredentials: true,
            });
            setProfileData(response.data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching profile:', err);
            setError('Không thể tải thông tin cá nhân. Vui lòng thử lại sau.');
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        document.cookie = 'auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        navigate('/');
    };

    const renderProfileContent = () => {
        if (loading) {
            return (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
                    <CircularProgress />
                </Box>
            );
        }

        if (error) {
            return (
                <Box sx={{ p: 3 }}>
                    <Alert severity="error">{error}</Alert>
                </Box>
            );
        }

        if (user.role === 'Sinh viên') {
            return (
                <Box sx={{ p: 3 }}>
                    <Typography variant="h4" gutterBottom>
                        Thông tin cá nhân
                    </Typography>
                    <Card sx={{ maxWidth: 600, mt: 3 }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom color="primary">
                                Thông tin sinh viên
                            </Typography>
                            <Box sx={{ mt: 2 }}>
                                <Typography variant="body1" sx={{ mb: 1 }}>
                                    <strong>Mã học viên:</strong> {profileData?.studentId || 'N/A'}
                                </Typography>
                                <Typography variant="body1" sx={{ mb: 1 }}>
                                    <strong>Họ và tên:</strong> {profileData?.fullName || 'N/A'}
                                </Typography>
                                <Typography variant="body1" sx={{ mb: 1 }}>
                                    <strong>Ngành học:</strong> {profileData?.major || 'N/A'}
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Box>
            );
        } else {
            return (
                <Box sx={{ p: 3 }}>
                    <Typography variant="h4" gutterBottom>
                        Thông tin tài khoản
                    </Typography>
                    <Card sx={{ maxWidth: 600, mt: 3 }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom color="primary">
                                Thông tin người dùng
                            </Typography>
                            <Box sx={{ mt: 2 }}>
                                <Typography variant="body1" sx={{ mb: 1 }}>
                                    <strong>Tên đăng nhập:</strong> {user.username}
                                </Typography>
                                <Typography variant="body1" sx={{ mb: 1 }}>
                                    <strong>Vai trò:</strong> {user.role}
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Box>
            );
        }
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
                {renderProfileContent()}
            </div>
        </div>
    );
}

export default Profile;