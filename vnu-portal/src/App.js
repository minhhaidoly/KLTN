// import React, { useState, useEffect } from 'react';
// import { Routes, Route, Navigate } from 'react-router-dom';
// import Login from './Login';
// import Register from './Register';
// import Dashboard from './Dashboard';
// import ProtectedRoute from './ProtectedRoute';
// import StudentBatches from './StudentBatches';
// import Upload from './Upload';
// import Profile from './Profile';
// import ProposeTopic from './ProposeTopic';
// import SupervisorTopics from './SupervisorTopics';
// import UploadHeads from './UploadHeads';
// import HeadTopics from './HeadTopics';
// import ChangePassword from './ChangePassword';

// function App() {
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     checkAuthStatus();
//   }, []);

//   const checkAuthStatus = async () => {
//     try {
//       const response = await fetch('http://localhost:5000/auth/check', {
//         credentials: 'include'
//       });
      
//       if (response.ok) {
//         const data = await response.json();
//         setIsAuthenticated(true);
//         // Lưu thông tin user vào localStorage
//         localStorage.setItem('user', JSON.stringify(data.user));
//       } else {
//         setIsAuthenticated(false);
//         localStorage.removeItem('user');
//       }
//     } catch (error) {
//       console.error('Auth check failed:', error);
//       setIsAuthenticated(false);
//       localStorage.removeItem('user');
//     }
//     setLoading(false);
//   };

//   if (loading) {
//     return <div>Loading...</div>;
//   }

//   return (
//     <Routes>
//       <Route path="/" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
//       <Route path="/register" element={<Register />} />
//       <Route
//         path="/dashboard"
//         element={
//           <ProtectedRoute isAuthenticated={isAuthenticated}>
//             <Dashboard />
//           </ProtectedRoute>
//         }
//       />
//       <Route
//         path="/profile"
//         element={
//           <ProtectedRoute isAuthenticated={isAuthenticated}>
//             <Profile />
//           </ProtectedRoute>
//         }
//       />
//       <Route
//         path="/batches"
//         element={
//           <ProtectedRoute isAuthenticated={isAuthenticated}>
//             <StudentBatches />
//           </ProtectedRoute>
//         }
//       />
//       <Route
//         path="/upload"
//         element={
//           <ProtectedRoute isAuthenticated={isAuthenticated}>
//             <Upload />
//           </ProtectedRoute>
//         }
//       />
//       <Route
//         path="/upload-heads"
//         element={
//           <ProtectedRoute isAuthenticated={isAuthenticated}>
//             <UploadHeads />
//           </ProtectedRoute>
//         }
//       />
//       <Route
//         path="/propose-topic"
//         element={
//           <ProtectedRoute isAuthenticated={isAuthenticated}>
//             <ProposeTopic />
//           </ProtectedRoute>
//         }
//       />
//       <Route
//         path="/student/propose-topic"
//         element={
//           <ProtectedRoute isAuthenticated={isAuthenticated}>
//             <ProposeTopic />
//           </ProtectedRoute>
//         }
//       />
//       <Route
//         path="/topics"
//         element={
//           <ProtectedRoute isAuthenticated={isAuthenticated}>
//             <SupervisorTopics />
//           </ProtectedRoute>
//         }
//       />
//       <Route
//         path="/supervisor/topics"
//         element={
//           <ProtectedRoute isAuthenticated={isAuthenticated}>
//             <SupervisorTopics />
//           </ProtectedRoute>
//         }
//       />
//       <Route
//         path="/head/topics"
//         element={
//           <ProtectedRoute isAuthenticated={isAuthenticated}>
//             <HeadTopics />
//           </ProtectedRoute>
//         }
//       />
//       <Route
//         path="/settings"
//         element={
//           <ProtectedRoute isAuthenticated={isAuthenticated}>
//             <ChangePassword />
//           </ProtectedRoute>
//         }
//       />
//       <Route path="*" element={<Navigate to="/" replace />} />
//     </Routes>
//   );
// }

// export default App;

import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import Register from './Register';
import Dashboard from './Dashboard';
import ProtectedRoute from './ProtectedRoute';
import StudentBatches from './StudentBatches';
import Upload from './Upload';
import Profile from './Profile';
import ProposeTopic from './ProposeTopic';
import SupervisorTopics from './SupervisorTopics';
import UploadHeads from './UploadHeads';
import HeadTopics from './HeadTopics';
import HeadStatistics from './HeadStatistics'; // Thêm import mới
import ChangePassword from './ChangePassword';
import UploadLecturers from './UploadLecturers'; // Thêm import UploadLecturers
import FacultiesInfo from './FacultiesInfo';
import FacultyMembers from './FacultyMembers';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('http://localhost:5000/auth/check', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setIsAuthenticated(true);
        // Lưu thông tin user vào localStorage
        localStorage.setItem('user', JSON.stringify(data.user));
      } else {
        setIsAuthenticated(false);
        localStorage.removeItem('user');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setIsAuthenticated(false);
      localStorage.removeItem('user');
    }
    setLoading(false);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Routes>
      <Route path="/" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/batches"
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <StudentBatches />
          </ProtectedRoute>
        }
      />
      <Route
        path="/upload"
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <Upload />
          </ProtectedRoute>
        }
      />
      <Route
        path="/upload-heads"
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <UploadHeads />
          </ProtectedRoute>
        }
      />
      <Route
        path="/propose-topic"
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <ProposeTopic />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/propose-topic"
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <ProposeTopic />
          </ProtectedRoute>
        }
      />
      <Route
        path="/topics"
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <SupervisorTopics />
          </ProtectedRoute>
        }
      />
      <Route
        path="/supervisor/topics"
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <SupervisorTopics />
          </ProtectedRoute>
        }
      />
      <Route
        path="/head/topics"
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <HeadTopics />
          </ProtectedRoute>
        }
      />
      {/* Thêm route mới cho thống kê */}
      <Route
        path="/head/statistics"
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <HeadStatistics />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <ChangePassword />
          </ProtectedRoute>
        }
      />
      <Route
        path="/upload-lecturers"
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <UploadLecturers />
          </ProtectedRoute>
        }
      />
      <Route
        path="/faculties-info"
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <FacultiesInfo />
          </ProtectedRoute>
        }
      />
      <Route
        path="/faculty/:facultyName"
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <FacultyMembers />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;