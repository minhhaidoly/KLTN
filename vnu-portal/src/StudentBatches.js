// import React, { useState, useEffect } from 'react';
// import axios from 'axios';

// function StudentBatches() {
//   const [batches, setBatches] = useState([]);

//   useEffect(() => {
//     const fetchBatches = async () => {
//       try {
//         const response = await axios.get('http://localhost:5000/students/batches', {
//           withCredentials: true,
//         });
//         setBatches(response.data);
//       } catch (error) {
//         alert('Lỗi: ' + error.message);
//       }
//     };
//     fetchBatches();
//   }, []);

//   return (
//     <div>
//       <h1>Danh sách học viên</h1>
//       {batches.map((batch, index) => (
//         <div key={index} style={{ marginBottom: '20px', padding: '10px', border: '1px solid #ccc' }}>
//           <h2>{batch.batchName}</h2>
//           <p><strong>Quyết định:</strong> {batch.decision}</p>
//           <h3>Danh sách học viên:</h3>
//           <ul>
//             {batch.students.map((student, idx) => (
//               <li key={idx}>
//                 {student.studentId} - {student.fullName} - {student.birthDate?.toString()} - {student.major}
//               </li>
//             ))}
//           </ul>
//         </div>
//       ))}
//     </div>
//   );
// }

// export default StudentBatches;
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Typography, Box, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Accordion, AccordionSummary, AccordionDetails,
  CircularProgress, Alert, Drawer, List, ListItem, ListItemText
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import axios from 'axios';
import { format } from 'date-fns';
import './Dashboard.css'; // Import Dashboard CSS for consistent styling
import logo from './logo.png';

function StudentBatches() {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const user = JSON.parse(localStorage.getItem('user')) || {};
  const navigate = useNavigate();

  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    try {
      const response = await axios.get('http://localhost:5000/students/batches', {
        withCredentials: true,
      });
      setBatches(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching batches:', err);
      setError('Không thể tải danh sách học viên. Vui lòng thử lại sau.');
      setLoading(false);
    }
  };

  // Format date function
  const formatDate = (dateString) => {
    try {
      if (!dateString) return 'N/A';
      const date = new Date(dateString);
      return format(date, 'dd/MM/yyyy');
    } catch (error) {
      return 'N/A';
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    document.cookie = 'auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    navigate('/');
  };

  const content = () => {
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

    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Danh sách các đợt học viên
        </Typography>
        {batches.length === 0 ? (
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              Hiện chưa có đợt học viên nào được tải lên.
            </Typography>
          </Paper>
        ) : (
          batches.map((batch) => (
            <Accordion key={batch._id} sx={{ mb: 2 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6">{batch.batchName}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="subtitle1" gutterBottom>
                  <strong>Quyết định:</strong> {batch.decision}
                </Typography>
                <Typography variant="subtitle2" gutterBottom>
                  <strong>Ngày tải lên:</strong> {formatDate(batch.uploadDate)}
                </Typography>
                <TableContainer component={Paper} sx={{ mt: 2 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                        <TableCell><strong>Mã học viên</strong></TableCell>
                        <TableCell><strong>Họ và tên</strong></TableCell>
                        <TableCell><strong>Ngày sinh</strong></TableCell>
                        <TableCell><strong>Ngành học</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {batch.students.map((student, index) => (
                        <TableRow key={index}>
                          <TableCell>{student.studentId}</TableCell>
                          <TableCell>{student.fullName}</TableCell>
                          <TableCell>{formatDate(student.birthDate)}</TableCell>
                          <TableCell>{student.major}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </AccordionDetails>
            </Accordion>
          ))
        )}
      </Box>
    );
  };

  return (
    <div className="dashboard">
      <Drawer variant="permanent" anchor="left">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 2 }}>
          <img src={logo} alt="Logo" style={{ width: '80px', height: '80px', objectFit: 'contain' }} onClick={() => navigate('/dashboard')} />
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
        {content()}
      </div>
    </div>
  );
}

export default StudentBatches;