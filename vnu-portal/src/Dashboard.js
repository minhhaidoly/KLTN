// import React from 'react';
// import { useNavigate } from 'react-router-dom';
// import './Dashboard.css';
// import { Drawer, List, ListItem, ListItemText, Box } from "@mui/material";
// import logo from './logo.png'; 

// function Dashboard() {
//   const navigate = useNavigate();
//   const user = JSON.parse(localStorage.getItem('user')); // Lấy thông tin người dùng từ localStorage

//   const handleLogout = () => {
//     localStorage.removeItem('user'); // Xóa thông tin người dùng
//     navigate('/'); // Quay lại trang đăng nhập
//   };

//   // return (
//   //   <div className="dashboard">
//   //     <h1>Xin chào, {user ? user.username : 'Khách'}</h1>
//   //     <p>Vai trò: {user ? user.role : 'Không xác định'}</p>
//   //     <button onClick={handleLogout}>Đăng xuất</button>
//   //   </div>
//   // );
//   return (
//     <div className="dashboard">
//       <Drawer variant="permanent" anchor="left">
//       <Box
//         sx={{
//           display: 'flex',
//           justifyContent: 'center',
//           alignItems: 'center',
//           p: 2,
//         }}
//       >
//         <img
//           src={logo}
//           alt="Logo"
//           style={{ width: '80px', height: '80px', objectFit: 'contain' }}
//         />
//       </Box>
//         <List>
//           <ListItem button onClick={() => navigate('/dashboard')}>
//             <ListItemText primary="Dashboard" />
//           </ListItem>
//           <ListItem button onClick={() => navigate('/profile')}>
//             <ListItemText primary="Account" />
//           </ListItem>
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
//         <h1>Trang chủ của {user ? user.username : 'Khách'}</h1>
//         <p> {user ? user.role : 'Không xác định'}</p>
//       </div>
//     </div>
//   );
//   // return (
//   //   <div className="flex min-h-screen">
//   //     {/* Sidebar */}
//   //     <aside className="w-64 bg-gray-800 text-white p-4">
//   //       <h2 className="text-xl font-bold mb-4">Menu</h2>
//   //       {/* <ul>
//   //         <li className="mb-2 hover:bg-gray-700 p-2 rounded">Dashboard</li>
//   //         <li className="mb-2 hover:bg-gray-700 p-2 rounded">Users</li>
//   //         <li className="mb-2 hover:bg-gray-700 p-2 rounded">Settings</li>
//   //       </ul> */}
//   //       <Drawer variant="permanent" anchor="left">
//   //         <List>
//   //           <ListItem button onClick={() => navigate('/dashboard')}>
//   //             <ListItemText primary="Trang chủ" />
//   //           </ListItem>
//   //           <ListItem button onClick={() => navigate('/profile')}>
//   //             <ListItemText primary="Thông tin cá nhân" />
//   //           </ListItem>
//   //           <ListItem button onClick={handleLogout}>
//   //             <ListItemText primary="Đăng xuất" />
//   //           </ListItem>
//   //         </List>
//   //         </Drawer>
//   //     </aside>

//   //     {/* Main content */}
//   //     <main className="flex-1 p-6 bg-gray-100">
//   //       <h1 className="text-2xl font-bold mb-4">Nội dung chính</h1>
//   //       <p>Đây là phần nội dung của trang web.</p>
//   //     </main>
//   //   </div>
//   // );
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
          <img src={logo} alt="Logo" style={{ width: '80px', height: '80px', objectFit: 'contain' }} />
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
             Trang chủ
            </Typography>
            <Typography variant="body2">
              Hehe
            </Typography>
          </Paper>
        )}
        
        {user.role === 'Sinh viên' && (
          <Paper sx={{ p: 3, bgcolor: '#f5fff8' }}>
            <Typography variant="h6" gutterBottom>
              Thông tin học viên
            </Typography>
            <Typography variant="body1">
              Trang chủ
            </Typography>
          </Paper>
        )}
      </div>
    </div>
  );
}

export default Dashboard;