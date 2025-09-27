import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Drawer, List, ListItem, ListItemText, CircularProgress, Button,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, IconButton, Alert
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
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
// import IconButton from '@mui/material/IconButton';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

function FacultyMembers() {
  const { facultyName } = useParams();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [memberForm, setMemberForm] = useState({ email: '', fullName: '', department: '', position: '', role: 'Giảng viên' });
  const [selectedMember, setSelectedMember] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(0);
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [positionFilter, setPositionFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [searchName, setSearchName] = useState("");
  const [searchEmail, setSearchEmail] = useState("");
  const drawerWidth = 240;
  const buttonWidth = 40;
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user')) || {};

  useEffect(() => {
    fetchMembers();
  }, [facultyName]);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/faculty/${encodeURIComponent(facultyName)}/members`, { credentials: 'include' });
      const data = await res.json();
      setMembers(Array.isArray(data) ? data : []);
    } catch (e) {
      setMembers([]);
    }
    setLoading(false);
  };

  // Thêm giảng viên/CNBM
  const handleAddMember = async () => {
    try {
      let url = '';
      if (memberForm.role === 'Giảng viên') {
        url = `http://localhost:5000/admin/faculty/${encodeURIComponent(facultyName)}/add-lecturer`;
      } else {
        url = `http://localhost:5000/admin/faculty/${encodeURIComponent(facultyName)}/add-head`;
      }
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(memberForm)
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: 'success', text: data.message });
        setAddDialogOpen(false);
        fetchMembers();
      } else {
        setMessage({ type: 'error', text: data.message });
      }
    } catch (e) {
      setMessage({ type: 'error', text: 'Lỗi khi thêm thành viên.' });
    }
  };

  // Sửa giảng viên/CNBM
  const handleEditMember = async () => {
    try {
      let url = '';
      if (selectedMember.role === 'Giảng viên') {
        url = `http://localhost:5000/admin/lecturer/${selectedMember.id}`;
      } else {
        url = `http://localhost:5000/admin/head/${selectedMember.id}`;
      }
      const res = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(memberForm)
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: 'success', text: data.message });
        setEditDialogOpen(false);
        fetchMembers();
      } else {
        setMessage({ type: 'error', text: data.message });
      }
    } catch (e) {
      setMessage({ type: 'error', text: 'Lỗi khi sửa thành viên.' });
    }
  };

  // Xóa giảng viên/CNBM
  const handleDeleteMember = async () => {
    try {
      let url = '';
      if (selectedMember.role === 'Giảng viên') {
        url = `http://localhost:5000/admin/lecturer/${selectedMember.id}`;
      } else {
        url = `http://localhost:5000/admin/head/${selectedMember.id}`;
      }
      const res = await fetch(url, { method: 'DELETE', credentials: 'include' });
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: 'success', text: data.message });
        setDeleteDialogOpen(false);
        fetchMembers();
      } else {
        setMessage({ type: 'error', text: data.message });
      }
    } catch (e) {
      setMessage({ type: 'error', text: 'Lỗi khi xóa thành viên.' });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    document.cookie = 'auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    navigate('/');
  };

  const uniqueDepartments = Array.from(new Set(members.map(m => m.department).filter(Boolean)));
  const uniquePositions = Array.from(new Set(members.map(m => m.position).filter(Boolean)));
  const uniqueRoles = Array.from(new Set(members.map(m => m.role).filter(Boolean)));

  const filteredMembers = members.filter(m => {
    let ok = true;
    if (searchName && !m.fullName?.toLowerCase().includes(searchName.toLowerCase())) ok = false;
    if (searchEmail && !m.email?.toLowerCase().includes(searchEmail.toLowerCase())) ok = false;
    if (departmentFilter && m.department !== departmentFilter) ok = false;
    if (positionFilter && m.position !== positionFilter) ok = false;
    if (roleFilter && m.role !== roleFilter) ok = false;
    return ok;
  });
  const pagedMembers = filteredMembers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

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

      <div className="dashboard-content">
        <Box sx={{ p: 3 }}>
          <Box sx={{ position: 'sticky', top: 0, paddingBottom: 0, backgroundColor: 'white', zIndex: 20, boxShadow: 2, pb: 2, mb: 2 }}>
            <Typography variant="h4" gutterBottom>
              Danh sách giảng viên & CNBM - Ngành: {facultyName}
            </Typography>
            {user.role === 'Quản trị viên' && (
              <Button startIcon={<AddIcon />} variant="contained" sx={{ mb: 2 }} onClick={() => { setMemberForm({ email: '', fullName: '', department: '', position: '', role: 'Giảng viên' }); setAddDialogOpen(true); }}>
                Thêm thành viên
              </Button>
            )}
          </Box>
          {message.text && <Alert severity={message.type} sx={{ mb: 2 }}>{message.text}</Alert>}
          {loading ? <CircularProgress /> : (
            <>
              <Box sx={{ height: 500, overflowY: 'auto', backgroundColor: 'white', borderRadius: 2, boxShadow: 1, mb: 2, pt: 2 }}>
                <Box sx={{ position: 'sticky', mb: 2, display: 'flex', alignItems: 'center', px: 2 }}>
                  <Typography sx={{ mr: 2 }}>Số bản ghi/trang:</Typography>
                  <select
                    value={rowsPerPage}
                    onChange={e => { setRowsPerPage(Number(e.target.value)); setPage(0); }}
                    style={{ padding: '4px 8px' }}
                  >
                    <option value={10}>10</option>
                    <option value={100}>100</option>
                    <option value={500}>500</option>
                  </select>
                </Box>
                <TableContainer component={Paper} sx={{ maxHeight: 440, boxShadow: 0, minWidth: 900 }}>
                  <Table stickyHeader sx={{ width: 1200 }}>
                    <TableHead>
                      {/* Sticky search row */}
                      <TableRow sx={{ position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 22 }}>
                        <TableCell></TableCell>
                        <TableCell>
                          <input
                            type="text"
                            placeholder="Tìm kiếm họ và tên"
                            value={searchName}
                            onChange={e => setSearchName(e.target.value)}
                            style={{ width: '100%', padding: '4px 8px' }}
                          />
                        </TableCell>
                        <TableCell>
                          <input
                            type="text"
                            placeholder="Tìm kiếm email"
                            value={searchEmail}
                            onChange={e => setSearchEmail(e.target.value)}
                            style={{ width: '100%', padding: '4px 8px' }}
                          />
                        </TableCell>
                        <TableCell></TableCell>
                        <TableCell></TableCell>
                        <TableCell></TableCell>
                        {user.role === 'Quản trị viên' && (
                          <TableCell></TableCell>
                        )}
                      </TableRow>
                      {/* Filter row */}
                      <TableRow>
                        <TableCell>STT</TableCell>
                        <TableCell>Họ và tên</TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell>
                          <select value={departmentFilter} onChange={e => setDepartmentFilter(e.target.value)} style={{ width: '100%' }}>
                            <option value=''>Bộ môn/ Phòng thí nghiệm</option>
                            {uniqueDepartments.map(dep => (
                              <option key={dep} value={dep}>{dep}</option>
                            ))}
                          </select>
                        </TableCell>
                        <TableCell>
                          <select value={positionFilter} onChange={e => setPositionFilter(e.target.value)} style={{ width: '100%' }}>
                            <option value=''>Chức vụ</option>
                            {uniquePositions.map(dep => (
                              <option key={dep} value={dep}>{dep}</option>
                            ))}
                          </select>
                        </TableCell>
                        <TableCell>
                          <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} style={{ width: '100%' }}>
                            <option value=''>Vai trò</option>
                            {uniqueRoles.map(dep => (
                              <option key={dep} value={dep}>{dep}</option>
                            ))}
                          </select>
                        </TableCell>
                        {user.role === 'Quản trị viên' && (
                          <TableCell>Hành động</TableCell>
                        )}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {pagedMembers.map((row, idx) => (
                        <TableRow key={idx}>
                          <TableCell>{row.stt}</TableCell>
                          <TableCell>{row.fullName}</TableCell>
                          <TableCell>{row.email}</TableCell>
                          <TableCell>{row.department}</TableCell>
                          <TableCell>{row.position}</TableCell>
                          {user.role === 'Quản trị viên' && (
                            <TableCell>{row.role}</TableCell>
                          )}
                          {user.role === 'Quản trị viên' && (
                            <TableCell>
                              <IconButton onClick={() => { setSelectedMember(row); setMemberForm(row); setEditDialogOpen(true); }}><EditIcon /></IconButton>
                              <IconButton color="error" onClick={() => { setSelectedMember(row); setDeleteDialogOpen(true); }}><DeleteIcon /></IconButton>
                            </TableCell>
                          )}
                        </TableRow>
                      ))}
                      {members.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={7}>
                            <Typography color="text.secondary">Chưa có dữ liệu.</Typography>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Button
                  disabled={page === 0}
                  onClick={() => setPage(page - 1)}
                  sx={{ mr: 2 }}
                >
                  Trang trước
                </Button>
                <Typography>
                  Trang {page + 1} / {Math.ceil(members.length / rowsPerPage)}
                </Typography>
                <Button
                  disabled={(page + 1) * rowsPerPage >= members.length}
                  onClick={() => setPage(page + 1)}
                  sx={{ ml: 2 }}
                >
                  Trang sau
                </Button>
              </Box>
            </>
          )}

          {/* Dialog thêm thành viên */}
          <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)}>
            <DialogTitle>Thêm thành viên mới</DialogTitle>
            <DialogContent>
              <TextField label="Email" value={memberForm.email} onChange={e => setMemberForm({ ...memberForm, email: e.target.value })} fullWidth sx={{ mb: 2 }} />
              <TextField label="Họ và tên" value={memberForm.fullName} onChange={e => setMemberForm({ ...memberForm, fullName: e.target.value })} fullWidth sx={{ mb: 2 }} />
              <TextField label="Bộ môn/Phòng thí nghiệm" value={memberForm.department} onChange={e => setMemberForm({ ...memberForm, department: e.target.value })} fullWidth sx={{ mb: 2 }} />
              <TextField label="Chức vụ" value={memberForm.position} onChange={e => setMemberForm({ ...memberForm, position: e.target.value })} fullWidth sx={{ mb: 2 }} />
              <TextField
                select
                label="Vai trò"
                value={memberForm.role}
                onChange={e => setMemberForm({ ...memberForm, role: e.target.value })}
                SelectProps={{ native: true }}
                fullWidth
                sx={{ mb: 2 }}
              >
                <option value="Giảng viên">Giảng viên</option>
                <option value="Chủ nhiệm bộ môn">Chủ nhiệm bộ môn</option>
              </TextField>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setAddDialogOpen(false)}>Hủy</Button>
              <Button onClick={handleAddMember} variant="contained">Thêm</Button>
            </DialogActions>
          </Dialog>

          {/* Dialog sửa thành viên */}
          <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
            <DialogTitle>Sửa thông tin thành viên</DialogTitle>
            <DialogContent>
              <TextField label="Email" value={memberForm.email} onChange={e => setMemberForm({ ...memberForm, email: e.target.value })} fullWidth sx={{ mb: 2 }} />
              <TextField label="Họ và tên" value={memberForm.fullName} onChange={e => setMemberForm({ ...memberForm, fullName: e.target.value })} fullWidth sx={{ mb: 2 }} />
              <TextField label="Bộ môn/Phòng thí nghiệm" value={memberForm.department} onChange={e => setMemberForm({ ...memberForm, department: e.target.value })} fullWidth sx={{ mb: 2 }} />
              <TextField label="Chức vụ" value={memberForm.position} onChange={e => setMemberForm({ ...memberForm, position: e.target.value })} fullWidth sx={{ mb: 2 }} />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setEditDialogOpen(false)}>Hủy</Button>
              <Button onClick={handleEditMember} variant="contained">Lưu</Button>
            </DialogActions>
          </Dialog>

          {/* Dialog xóa thành viên */}
          <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
            <DialogTitle>Xóa thành viên</DialogTitle>
            <DialogContent>
              <Typography>Bạn muốn xóa thành viên <strong>{selectedMember?.fullName}</strong>?</Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDeleteDialogOpen(false)}>Hủy</Button>
              <Button onClick={handleDeleteMember} color="error" variant="contained">Xóa</Button>
            </DialogActions>
          </Dialog>
          <Button sx={{ mt: 2 }} variant="outlined" onClick={() => navigate('/faculties-info')}>
            Quay lại danh sách Khoa/Ngành
          </Button>
        </Box>
      </div>
    </div>
  );
}

export default FacultyMembers;
