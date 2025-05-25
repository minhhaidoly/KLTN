// import React from 'react';
// import { useNavigate } from 'react-router-dom';
// import './Dashboard.css';
// import { Drawer, List, ListItem, ListItemText, Box, Typography, Paper } from '@mui/material';
// import logo from './logo.png';

// function Dashboard() {
//   const navigate = useNavigate();
//   const user = JSON.parse(localStorage.getItem('user')) || {};

//   const handleLogout = () => {
//     localStorage.removeItem('user');
//     document.cookie = 'auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
//     navigate('/');
//   };

//   return (
//     <div className="dashboard">
//       <Drawer variant="permanent" anchor="left">
//         <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 2 }}>
//           <img src={logo} alt="Logo" style={{ width: '80px', height: '80px', objectFit: 'contain' }} />
//         </Box>
//         <List>
//           <ListItem button onClick={() => navigate('/dashboard')}>
//             <ListItemText primary="Dashboard" />
//           </ListItem>
//           <ListItem button onClick={() => navigate('/profile')}>
//             <ListItemText primary="Account" />
//           </ListItem>
//           {user.role === 'Quản trị viên' && (
//                       <ListItem button onClick={() => navigate('/batches')}>
//                       <ListItemText primary="Danh sách học viên" />
//                     </ListItem>
//                   )}
//           {user.role === 'Quản trị viên' && (
//             <ListItem button onClick={() => navigate('/upload')}>
//               <ListItemText primary="Tải lên danh sách" />
//             </ListItem>
//           )}
//           <ListItem button onClick={() => navigate('/calendar')}>
//             <ListItemText primary="Calendar" />
//           </ListItem>
//           <ListItem button onClick={() => navigate('/settings')}>
//             <ListItemText primary="Setting" />
//           </ListItem>
//           <ListItem button onClick={() => navigate('/help')}>
//             <ListItemText primary="Help" />
//           </ListItem>
//           <ListItem button onClick={() => navigate('/about')}>
//             <ListItemText primary="Introduction" />
//           </ListItem>
//           <ListItem button onClick={() => navigate('/contact')}>
//             <ListItemText primary="Contact" />
//           </ListItem>
//           <ListItem button onClick={handleLogout}>
//             <ListItemText primary="Logout" />
//           </ListItem>
//         </List>
//       </Drawer>

//       <div className="dashboard-content">
//         <Paper sx={{ p: 3, mb: 3 }}>
//           <Typography variant="h4" gutterBottom>
//             Hello {user.username || 'Khách'}
//           </Typography>
//           <Typography variant="subtitle1">
//             Role: {user.role || 'Không xác định'}
//           </Typography>
//         </Paper>

//         <Box sx={{ mb: 3 }}>
//           <Typography variant="h5" gutterBottom>
//             Chào mừng bạn đến với hệ thống quản lý học viên
//           </Typography>
//           <Typography variant="body1">
//             Thông báo mới nhất: 
//           </Typography>
//         </Box>

//         {user.role === 'Quản trị viên' && (
//           <Paper sx={{ p: 3, mb: 3, bgcolor: '#f5f8ff' }}>
//             <Typography variant="h6" gutterBottom>
//               Chức năng quản trị viên
//             </Typography>
//             <Typography variant="body1" paragraph>
//              Trang chủ
//             </Typography>
//             <Typography variant="body2">
//               Hehe
//             </Typography>
//           </Paper>
//         )}

//         {user.role === 'Sinh viên' && (
//           <Paper sx={{ p: 3, bgcolor: '#f5fff8' }}>
//             <Typography variant="h6" gutterBottom>
//               Thông tin học viên
//             </Typography>
//             <Typography variant="body1">
//               Trang chủ
//             </Typography>
//           </Paper>
//         )}
//       </div>
//     </div>
//   );
// }

// export default Dashboard;

import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';
import { Drawer, List, ListItem, ListItemText, Box, Typography, Paper } from '@mui/material';
import logo from './logo.png';

function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user')) || {};

  const handleLogout = () => {
    localStorage.removeItem('user');
    document.cookie = 'auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
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
            <ListItemText primary="Dashboard" />
          </ListItem>
          <ListItem button onClick={() => navigate('/profile')}>
            <ListItemText primary="Account" />
          </ListItem>
          {(user.role === 'Quản trị viên' || user.role === 'Giảng viên') && (
            <ListItem button onClick={() => navigate('/batches')}>
              <ListItemText primary="Danh sách học viên" />
            </ListItem>
          )}
          {user.role === 'Quản trị viên' && (
            <>
              <ListItem button onClick={() => navigate('/upload')}>
                <ListItemText primary="Tải lên danh sách" />
              </ListItem>
              <ListItem button onClick={() => navigate('/topic-proposals')}>
                <ListItemText primary="Đề tài chưa được phê duyệt" />
              </ListItem>
            </>
          )}
          {user.role === 'Sinh viên' && (
            <ListItem button onClick={() => navigate('/propose-topic')}>
              <ListItemText primary="Đề xuất đề cương" />
            </ListItem>
          )}
          {user.role === 'Giảng viên' && (
            <ListItem button onClick={() => navigate('/topics')}>
              <ListItemText primary="Đề xuất từ học viên" />
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
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h4" gutterBottom>
            Hello {user.username || 'Khách'}
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
              Chức năng quản trị viên
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
              Chức năng giảng viên
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
              Thông tin học viên
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