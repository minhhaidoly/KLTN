import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Paper, Typography, Button, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Alert, Drawer, List, ListItem, ListItemText
} from '@mui/material';
import logo from './logo.png';

function HeadTopics() {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [comments, setComments] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user')) || {};

  useEffect(() => {
    fetchProposals();
  }, []);

  const fetchProposals = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/head/topic-proposals', {
        credentials: 'include'
      });
      const data = await response.json();
      if (response.ok) {
        setProposals(data);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Không thể tải danh sách đề tài.' });
    }
    setLoading(false);
  };

  const handleReview = async (status) => {
    try {
      const response = await fetch(`http://localhost:5000/head/review-topic/${selectedProposal._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, comments }),
        credentials: 'include'
      });
      const data = await response.json();
      if (response.ok) {
        setMessage({ type: 'success', text: data.message });
        fetchProposals();
        setDialogOpen(false);
      } else {
        setMessage({ type: 'error', text: data.message });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Lỗi khi xử lý đề xuất' });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    document.cookie = 'auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/';
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
          <ListItem button onClick={() => navigate('/batches')}>
            <ListItemText primary="Danh sách học viên" />
          </ListItem>
          <ListItem button onClick={() => navigate('/head/topics')}>
            <ListItemText primary="Đề tài chờ phê duyệt" />
          </ListItem>
          <ListItem button onClick={handleLogout}>
            <ListItemText primary="Logout" />
          </ListItem>
        </List>
      </Drawer>
      <div className="dashboard-content">
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Đề tài chờ phê duyệt
          </Typography>
          {message.text && (
            <Alert severity={message.type} sx={{ mb: 2 }}>
              {message.text}
            </Alert>
          )}
          {loading ? (
            <Typography>Đang tải...</Typography>
          ) : proposals.length === 0 ? (
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography>Không có đề tài nào chờ phê duyệt.</Typography>
            </Paper>
          ) : (
            proposals.map((proposal) => (
              <Paper key={proposal._id} sx={{ p: 2, mb: 2 }}>
                <Typography variant="subtitle1">
                  Tên đề tài: {proposal.topicTitle}
                </Typography>
                <Typography>
                  Học viên: {proposal.studentName} ({proposal.studentId})
                </Typography>
                <Typography>
                  GVHD: {proposal.primarySupervisor}
                  {proposal.secondarySupervisor && `, ${proposal.secondarySupervisor}`}
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => {
                      setSelectedProposal(proposal);
                      setDialogOpen(true);
                    }}
                    sx={{ mr: 1 }}
                  >
                    Xem chi tiết
                  </Button>
                </Box>
              </Paper>
            ))
          )}

          <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
            {selectedProposal && (
              <>
                <DialogTitle>Chi tiết đề xuất</DialogTitle>
                <DialogContent>
                  <Typography variant="h6">{selectedProposal.topicTitle}</Typography>
                  <Typography variant="body1" sx={{ mt: 2 }}>
                    {selectedProposal.content}
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="Nhận xét"
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    sx={{ mt: 2 }}
                  />
                </DialogContent>
                <DialogActions>
                  <Button onClick={() => handleReview('returned')} color="error">
                    Trả lại
                  </Button>
                  <Button onClick={() => handleReview('approved_by_head')} color="primary">
                    Phê duyệt
                  </Button>
                </DialogActions>
              </>
            )}
          </Dialog>
        </Box>
      </div>
    </div>
  );
}

export default HeadTopics;