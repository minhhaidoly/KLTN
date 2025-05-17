// import React, { useState } from 'react';
// import { useNavigate, Link } from 'react-router-dom'; // Thêm Link
// import './Login.css';

// function Login() {
//   const [username, setUsername] = useState('');
//   const [password, setPassword] = useState('');
//   const [role, setRole] = useState('Sinh viên');
//   const navigate = useNavigate();

//   const handleLogin = async (e) => {
//     e.preventDefault();
//     try {
//       const response = await fetch('http://localhost:5000/login', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ username, password }),
//       });
//       const data = await response.json();
//       if (response.ok) {
//         const user = { username: data.user.username, role: data.user.role };
//         localStorage.setItem('user', JSON.stringify(user));
//         navigate('/dashboard');
//       } else {
//         alert(data.message);
//       }
//     } catch (error) {
//       alert('Lỗi: ' + error.message);
//     }
//   };

//   return (
//     <div className="App">
//       <div className="login-container">
//         <i className="fas fa-lock" style={{ fontSize: '40px', color: '#1e90ff', marginBottom: '20px' }}></i>
//         <h1>Đăng nhập</h1>
//         <p>UET Portal</p>
//         <p>VNU University of Engineering and Technology</p>

//         <form onSubmit={handleLogin}>
//           <div className="input-group">
//             <label>Tên đăng nhập *</label>
//             <input
//               type="text"
//               value={username}
//               onChange={(e) => setUsername(e.target.value)}
//               required
//             />
//           </div>

//           <div className="input-group">
//             <label>Mật khẩu *</label>
//             <input
//               type="password"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               required
//             />
//           </div>

//           <div className="input-group">
//             <label>Vai trò</label>
//             <select value={role} onChange={(e) => setRole(e.target.value)}>
//               <option value="Sinh viên">Sinh viên</option>
//               <option value="Giảng viên">Giảng viên</option>
//               <option value="Quản trị viên">Quản trị viên</option>
//             </select>
//           </div>

//           <button type="submit">ĐĂNG NHẬP</button>
//         </form>
//         <p style={{ marginTop: '10px' }}>
//           Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
//         </p>
//       </div>
//     </div>
//   );
// }

// export default Login;
// import React, { useState } from 'react';
// import { useNavigate, Link } from 'react-router-dom';
// import './Login.css';

// function Login({ setIsAuthenticated }) {
//   const [username, setUsername] = useState('');
//   const [password, setPassword] = useState('');
//   const [role, setRole] = useState('Sinh viên');
//   const navigate = useNavigate();

//   const handleLogin = async (e) => {
//     e.preventDefault();
//     try {
//       const response = await fetch('http://localhost:5000/login', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ username, password }),
//         credentials: 'include', // Thêm để gửi cookie
//       });
//       const data = await response.json();
//       if (response.ok) {
//         const user = { username: data.user.username, role: data.user.role };
//         localStorage.setItem('user', JSON.stringify(user));
//         setIsAuthenticated(true); // Cập nhật trạng thái đăng nhập
//         navigate('/dashboard');
//       } else {
//         alert(data.message);
//       }
//     } catch (error) {
//       alert('Lỗi: ' + error.message);
//     }
//   };

//   return (
//     <div className="App">
//       <div className="login-container">
//         <i className="fas fa-lock" style={{ fontSize: '40px', color: '#1e90ff', marginBottom: '20px' }}></i>
//         <h1>Đăng nhập</h1>
//         <p>UET Portal</p>
//         <p>VNU University of Engineering and Technology</p>

//         <form onSubmit={handleLogin}>
//           <div className="input-group">
//             <label>Tên đăng nhập *</label>
//             <input
//               type="text"
//               value={username}
//               onChange={(e) => setUsername(e.target.value)}
//               required
//             />
//           </div>

//           <div className="input-group">
//             <label>Mật khẩu *</label>
//             <input
//               type="password"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               required
//             />
//           </div>

//           <div className="input-group">
//             <label>Vai trò</label>
//             <select value={role} onChange={(e) => setRole(e.target.value)}>
//               <option value="Học viên">Học viên</option>
//               <option value="Giảng viên">Giảng viên</option>
//               <option value="Quản trị viên">Quản trị viên</option>
//             </select>
//           </div>

//           <button type="submit">ĐĂNG NHẬP</button>
//         </form>
//         <p style={{ marginTop: '10px' }}>
//           Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
//         </p>
//       </div>
//     </div>
//   );
// }

// export default Login;

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Login.css';

function Login({ setIsAuthenticated }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Sinh viên');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password, role }),
        credentials: 'include',
      });
      const data = await response.json();
      if (response.ok) {
        const user = { username: data.user.username, role: data.user.role };
        localStorage.setItem('user', JSON.stringify(user));
        setIsAuthenticated(true);
        navigate('/dashboard');
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert('Lỗi: ' + error.message);
    }
  };

  return (
    <div className="App">
      <div className="login-container">
        <i className="fas fa-lock" style={{ fontSize: '40px', color: '#1e90ff', marginBottom: '20px' }}></i>
        <h1>Đăng nhập</h1>
        <p>UET Portal</p>
        <p>VNU University of Engineering and Technology</p>

        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label>Tên đăng nhập *</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label>Mật khẩu *</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label>Vai trò *</label>
            <select value={role} onChange={(e) => setRole(e.target.value)} required>
              <option value="Sinh viên">Sinh viên</option>
              <option value="Giảng viên">Giảng viên</option>
              <option value="Quản trị viên">Quản trị viên</option>
            </select>
          </div>

          <button type="submit">ĐĂNG NHẬP</button>
        </form>
        <p style={{ marginTop: '10px' }}>
          Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;