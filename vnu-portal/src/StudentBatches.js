// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import {
//   Typography, Box, Paper, Table, TableBody, TableCell, TableContainer,
//   TableHead, TableRow, Accordion, AccordionSummary, AccordionDetails,
//   CircularProgress, Alert, Drawer, List, ListItem, ListItemText,
//   TextField, InputAdornment, IconButton
// } from '@mui/material';
// import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
// import SearchIcon from '@mui/icons-material/Search';
// import ClearIcon from '@mui/icons-material/Clear';
// import axios from 'axios';
// import { format } from 'date-fns';
// import './Dashboard.css';
// import logo from './logo.png';

// function StudentBatches() {
//   const [batches, setBatches] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');
//   const [searchTerm, setSearchTerm] = useState('');
//   const user = JSON.parse(localStorage.getItem('user')) || {};
//   const navigate = useNavigate();

//   useEffect(() => {
//     fetchBatches();
//   }, []);

//   useEffect(() => {
//     // Debounce search
//     const delayedSearch = setTimeout(() => {
//       if (searchTerm.trim() !== '') {
//         fetchBatches(searchTerm);
//       } else {
//         fetchBatches();
//       }
//     }, 500);

//     return () => clearTimeout(delayedSearch);
//   }, [searchTerm]);

//   const fetchBatches = async (search = '') => {
//     try {
//       const url = search 
//         ? `http://localhost:5000/students/batches?search=${encodeURIComponent(search)}`
//         : 'http://localhost:5000/students/batches';
        
//       const response = await axios.get(url, {
//         withCredentials: true,
//       });
//       setBatches(response.data);
//       setLoading(false);
//     } catch (err) {
//       console.error('Error fetching batches:', err);
//       if (err.response?.status === 403) {
//         setError('Bạn không có quyền truy cập chức năng này.');
//       } else {
//         setError('Không thể tải danh sách học viên. Vui lòng thử lại sau.');
//       }
//       setLoading(false);
//     }
//   };

//   // Format date function
//   const formatDate = (dateString) => {
//     try {
//       if (!dateString) return 'N/A';
//       const date = new Date(dateString);
//       return format(date, 'dd/MM/yyyy');
//     } catch (error) {
//       return 'N/A';
//     }
//   };

//   const handleLogout = () => {
//     localStorage.removeItem('user');
//     document.cookie = 'auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
//     navigate('/');
//   };

//   const handleSearchChange = (event) => {
//     setSearchTerm(event.target.value);
//   };

//   const handleClearSearch = () => {
//     setSearchTerm('');
//   };

//   const content = () => {
//     if (loading) {
//       return (
//         <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
//           <CircularProgress />
//         </Box>
//       );
//     }

//     if (error) {
//       return (
//         <Box sx={{ p: 3 }}>
//           <Alert severity="error">{error}</Alert>
//         </Box>
//       );
//     }

//     return (
//       <Box sx={{ p: 3 }}>
//         <Typography variant="h4" gutterBottom>
//           Danh sách các đợt học viên
//         </Typography>
        
//         {/* Search Box */}
//         <Paper sx={{ p: 2, mb: 3 }}>
//           <TextField
//             fullWidth
//             variant="outlined"
//             placeholder="Tìm kiếm theo mã học viên, tên hoặc ngành học..."
//             value={searchTerm}
//             onChange={handleSearchChange}
//             InputProps={{
//               startAdornment: (
//                 <InputAdornment position="start">
//                   <SearchIcon />
//                 </InputAdornment>
//               ),
//               endAdornment: searchTerm && (
//                 <InputAdornment position="end">
//                   <IconButton onClick={handleClearSearch} edge="end">
//                     <ClearIcon />
//                   </IconButton>
//                 </InputAdornment>
//               ),
//             }}
//           />
//         </Paper>

//         {/* Results */}
//         {batches.length === 0 ? (
//           <Paper sx={{ p: 3, textAlign: 'center' }}>
//             <Typography variant="body1" color="text.secondary">
//               {searchTerm ? 
//                 `Không tìm thấy kết quả nào cho "${searchTerm}"` :
//                 'Hiện chưa có đợt học viên nào được tải lên.'
//               }
//             </Typography>
//           </Paper>
//         ) : (
//           <>
//             {searchTerm && (
//               <Typography variant="subtitle1" sx={{ mb: 2, color: 'text.secondary' }}>
//                 Tìm thấy {batches.reduce((total, batch) => total + batch.students.length, 0)} kết quả cho "{searchTerm}"
//               </Typography>
//             )}
//             {batches.map((batch) => (
//               <Accordion key={batch._id} sx={{ mb: 2 }}>
//                 <AccordionSummary expandIcon={<ExpandMoreIcon />}>
//                   <Box>
//                     <Typography variant="h6">{batch.batchName}</Typography>
//                     <Typography variant="body2" color="text.secondary">
//                       {batch.students.length} học viên
//                     </Typography>
//                   </Box>
//                 </AccordionSummary>
//                 <AccordionDetails>
//                   <Typography variant="subtitle1" gutterBottom>
//                     <strong>Quyết định:</strong> {batch.decision}
//                   </Typography>
//                   <Typography variant="subtitle2" gutterBottom>
//                     <strong>Ngày tải lên:</strong> {formatDate(batch.uploadDate)}
//                   </Typography>
//                   <TableContainer component={Paper} sx={{ mt: 2 }}>
//                     <Table size="small">
//                       <TableHead>
//                         <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
//                           <TableCell><strong>Mã học viên</strong></TableCell>
//                           <TableCell><strong>Họ và tên</strong></TableCell>
//                           <TableCell><strong>Ngày sinh</strong></TableCell>
//                           <TableCell><strong>Ngành học</strong></TableCell>
//                         </TableRow>
//                       </TableHead>
//                       <TableBody>
//                         {batch.students.map((student, index) => (
//                           <TableRow key={index}>
//                             <TableCell>{student.studentId}</TableCell>
//                             <TableCell>{student.fullName}</TableCell>
//                             <TableCell>{formatDate(student.birthDate)}</TableCell>
//                             <TableCell>{student.major}</TableCell>
//                           </TableRow>
//                         ))}
//                       </TableBody>
//                     </Table>
//                   </TableContainer>
//                 </AccordionDetails>
//               </Accordion>
//             ))}
//           </>
//         )}
//       </Box>
//     );
//   };

//   return (
//     <div className="dashboard">
//       <Drawer variant="permanent" anchor="left">
//         <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 2 }}>
//           <img
//             src={logo}
//             alt="Logo"
//             style={{ width: '80px', height: '80px', objectFit: 'contain', cursor: 'pointer' }}
//             onClick={() => navigate('/dashboard')}
//           />
//         </Box>
//         <List>
//           <ListItem button onClick={() => navigate('/dashboard')}>
//             <ListItemText primary="Dashboard" />
//           </ListItem>
//           <ListItem button onClick={() => navigate('/profile')}>
//             <ListItemText primary="Account" />
//           </ListItem>
//           {(user.role === 'Quản trị viên' || user.role === 'Giảng viên') && (
//             <ListItem button onClick={() => navigate('/batches')}>
//               <ListItemText primary="Danh sách học viên" />
//             </ListItem>
//           )}
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
//         {content()}
//       </div>
//     </div>
//   );
// }

// export default StudentBatches;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Typography, Box, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Accordion, AccordionSummary, AccordionDetails,
  CircularProgress, Alert, Drawer, List, ListItem, ListItemText,
  TextField, Grid, Button
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import axios from 'axios';
import { format } from 'date-fns';
import './Dashboard.css';
import logo from './logo.png';

function StudentBatches() {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchFilters, setSearchFilters] = useState({
    studentId: '',
    fullName: '',
    birthDate: '',
    major: ''
  });
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const navigate = useNavigate();

  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = async (filters = {}) => {
    try {
      // Build query string from filters
      const queryParams = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key] && filters[key].trim() !== '') {
          queryParams.append(key, filters[key].trim());
        }
      });
      
      const url = queryParams.toString() 
        ? `http://localhost:5000/students/batches?${queryParams.toString()}`
        : 'http://localhost:5000/students/batches';

      const response = await axios.get(url, {
        withCredentials: true,
      });
      setBatches(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching batches:', err);
      if (err.response?.status === 403) {
        setError('Bạn không có quyền truy cập chức năng này.');
      } else {
        setError('Không thể tải danh sách học viên. Vui lòng thử lại sau.');
      }
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
    document.cookie = 'auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/';
    navigate('/');
  };

  const handleFilterChange = (field, value) => {
    setSearchFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSearch = () => {
    setLoading(true);
    fetchBatches(searchFilters);
  };

  const handleClearSearch = () => {
    setSearchFilters({
      studentId: '',
      fullName: '',
      birthDate: '',
      major: ''
    });
    setLoading(true);
    fetchBatches({});
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

        {/* Search Box with separate fields */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Tìm kiếm học viên
          </Typography>
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                variant="outlined"
                label="Mã học viên"
                placeholder="Nhập mã học viên..."
                value={searchFilters.studentId}
                onChange={(e) => handleFilterChange('studentId', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                variant="outlined"
                label="Họ và tên"
                placeholder="Nhập họ và tên..."
                value={searchFilters.fullName}
                onChange={(e) => handleFilterChange('fullName', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                variant="outlined"
                label="Ngày sinh"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={searchFilters.birthDate}
                onChange={(e) => handleFilterChange('birthDate', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                variant="outlined"
                label="Ngành học"
                placeholder="Nhập ngành học..."
                value={searchFilters.major}
                onChange={(e) => handleFilterChange('major', e.target.value)}
              />
            </Grid>
          </Grid>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              startIcon={<SearchIcon />}
              onClick={handleSearch}
            >
              Tìm kiếm
            </Button>
            <Button
              variant="outlined"
              startIcon={<ClearIcon />}
              onClick={handleClearSearch}
            >
              Xóa bộ lọc
            </Button>
          </Box>
        </Paper>

        {/* Results */}
        {batches.length === 0 ? (
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              {Object.values(searchFilters).some(value => value.trim() !== '') ?
                'Không tìm thấy kết quả nào phù hợp với bộ lọc.' :
                'Hiện chưa có đợt học viên nào được tải lên.'
              }
            </Typography>
          </Paper>
        ) : (
          <>
            {Object.values(searchFilters).some(value => value.trim() !== '') && (
              <Typography variant="subtitle1" sx={{ mb: 2, color: 'text.secondary' }}>
                Tìm thấy {batches.reduce((total, batch) => total + batch.students.length, 0)} học viên
              </Typography>
            )}
            {batches.map((batch) => (
              <Accordion key={batch._id} sx={{ mb: 2 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box>
                    <Typography variant="h6">{batch.batchName}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {batch.students.length} học viên
                    </Typography>
                  </Box>
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
            ))}
          </>
        )}
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
        {content()}
      </div>
    </div>
  );
}

export default StudentBatches;