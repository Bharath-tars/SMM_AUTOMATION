import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Tabs, Tab, Button, Grid, Card, CardContent, CardActions, IconButton, Chip, Menu, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, TextField, FormControlLabel, Switch, Snackbar, Alert } from '@mui/material';
import { Add as AddIcon, MoreVert as MoreVertIcon, Edit as EditIcon, Delete as DeleteIcon, Autorenew as AutorenewIcon, Schedule as ScheduleIcon, Visibility as VisibilityIcon, LinkedIn } from '@mui/icons-material';
import { format } from 'date-fns';
// Using static data only - no API calls
// import { postsService } from '../services/api';
// import linkedinService from '../services/linkedinService';

// Mock data for posts
const initialPosts = [
  {
    id: 'post-1',
    title: 'Industry Insights: The Future of Remote Work',
    content: 'Remote work is here to stay. Here are the top trends we\'re seeing in the workplace of tomorrow. #remotework #futureofwork #workplacetrends',
    date: new Date(2023, 8, 15, 10, 30),
    status: 'scheduled',
    aiOptimized: true,
    engagement: null,
    isEvergreen: true,
    recycleFrequency: 'monthly',
    lastRecycled: null,
  },
  {
    id: 'post-2',
    title: 'Case Study: How We Increased Engagement by 200%',
    content: 'Learn how our client achieved remarkable results with our strategic approach to content marketing. #casestudy #contentmarketing #success',
    date: new Date(2023, 8, 16, 14, 0),
    status: 'scheduled',
    aiOptimized: true,
    engagement: null,
    isEvergreen: false,
    recycleFrequency: null,
    lastRecycled: null,
  },
  {
    id: 'post-3',
    title: 'Webinar Announcement: Digital Marketing Trends 2023',
    content: 'Join us for an exclusive webinar on the latest digital marketing trends. Register now to secure your spot! #webinar #digitalmarketing #trends2023',
    date: new Date(2023, 8, 18, 9, 0),
    status: 'draft',
    aiOptimized: false,
    engagement: null,
    isEvergreen: false,
    recycleFrequency: null,
    lastRecycled: null,
  },
  {
    id: 'post-4',
    title: '5 Tips for Better LinkedIn Engagement',
    content: 'Boost your LinkedIn presence with these proven strategies for increasing engagement and building your network. #linkedin #engagement #socialmediatips',
    date: new Date(2023, 8, 12, 11, 0),
    status: 'published',
    aiOptimized: true,
    engagement: 'low',
    isEvergreen: true,
    recycleFrequency: 'biweekly',
    lastRecycled: new Date(2023, 8, 5),
  },
  {
    id: 'post-5',
    title: 'How to Build a Personal Brand',
    content: 'Your personal brand is your most valuable asset. Here\'s how to build it effectively on LinkedIn. #personalbrand #linkedin #careeradvice',
    date: new Date(2023, 8, 10, 15, 30),
    status: 'published',
    aiOptimized: true,
    engagement: 'high',
    isEvergreen: true,
    recycleFrequency: 'monthly',
    lastRecycled: new Date(2023, 7, 10),
  },
];

const Posts = () => {
  const [posts, setPosts] = useState(initialPosts);
  const [tabValue, setTabValue] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editPost, setEditPost] = useState(null);

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Handle menu open/close
  const handleMenuOpen = (event, post) => {
    setAnchorEl(event.currentTarget);
    setSelectedPost(post);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedPost(null);
  };

  // Handle post editing
  const handleEditClick = () => {
    setEditPost(selectedPost);
    setOpenDialog(true);
    handleMenuClose();
  };

  const handleCreateNewPost = () => {
    setEditPost({
      id: `post-${posts.length + 1}`,
      title: '',
      content: '',
      date: new Date(),
      status: 'draft',
      aiOptimized: false,
      engagement: null,
      isEvergreen: false,
      recycleFrequency: null,
      lastRecycled: null,
    });
    setOpenDialog(true);
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    setEditPost(null);
  };

  const handleSavePost = () => {
    if (posts.find(p => p.id === editPost.id)) {
      // Update existing post
      setPosts(posts.map(p => p.id === editPost.id ? editPost : p));
    } else {
      // Add new post
      setPosts([...posts, editPost]);
    }
    handleDialogClose();
  };

  // Handle post deletion
  const handleDeleteClick = () => {
    setPosts(posts.filter(p => p.id !== selectedPost.id));
    handleMenuClose();
  };

  // Handle evergreen recycling
  const handleRecycleClick = () => {
    const updatedPost = {
      ...selectedPost,
      status: 'scheduled',
      date: new Date(Date.now() + 24 * 60 * 60 * 1000), // Schedule for tomorrow
      lastRecycled: new Date(),
    };
    setPosts(posts.map(p => p.id === selectedPost.id ? updatedPost : p));
    handleMenuClose();
  };

  // Filter posts based on tab selection
  const getFilteredPosts = () => {
    switch (tabValue) {
      case 0: // All
        return posts;
      case 1: // Published
        return posts.filter(post => post.status === 'published');
      case 2: // Scheduled
        return posts.filter(post => post.status === 'scheduled');
      case 3: // Drafts
        return posts.filter(post => post.status === 'draft');
      case 4: // Evergreen
        return posts.filter(post => post.isEvergreen);
      default:
        return posts;
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 500 }}>
          Posts
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreateNewPost}>
          Create New Post
        </Button>
      </Box>

      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label="All Posts" />
          <Tab label="Published" />
          <Tab label="Scheduled" />
          <Tab label="Drafts" />
          <Tab label="Evergreen" />
        </Tabs>
      </Paper>

      <Grid container spacing={3}>
        {getFilteredPosts().map(post => (
          <Grid item xs={12} md={6} lg={4} key={post.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Typography variant="h6" component="h2" sx={{ mb: 1 }}>
                    {post.title}
                  </Typography>
                  <IconButton onClick={(e) => handleMenuOpen(e, post)}>
                    <MoreVertIcon />
                  </IconButton>
                </Box>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {post.content.length > 100 ? `${post.content.substring(0, 100)}...` : post.content}
                </Typography>
                
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                  <Chip 
                    label={post.status.charAt(0).toUpperCase() + post.status.slice(1)} 
                    color={
                      post.status === 'published' ? 'success' :
                      post.status === 'scheduled' ? 'primary' : 'default'
                    }
                    size="small"
                  />
                  
                  {post.aiOptimized && (
                    <Chip 
                      icon={<AutorenewIcon fontSize="small" />}
                      label="AI Optimized" 
                      color="secondary"
                      variant="outlined"
                      size="small"
                    />
                  )}
                  
                  {post.isEvergreen && (
                    <Chip 
                      label="Evergreen" 
                      color="info"
                      variant="outlined"
                      size="small"
                    />
                  )}
                  
                  {post.engagement && (
                    <Chip 
                      label={`${post.engagement.charAt(0).toUpperCase() + post.engagement.slice(1)} Engagement`} 
                      color={post.engagement === 'high' ? 'success' : 'warning'}
                      variant="outlined"
                      size="small"
                    />
                  )}
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="caption" color="text.secondary">
                    {post.status === 'published' ? 'Published on: ' : post.status === 'scheduled' ? 'Scheduled for: ' : 'Last updated: '}
                    {format(post.date, 'MMM d, yyyy h:mm a')}
                  </Typography>
                  
                  {post.isEvergreen && post.lastRecycled && (
                    <Typography variant="caption" color="text.secondary">
                      Last recycled: {format(post.lastRecycled, 'MMM d, yyyy')}
                    </Typography>
                  )}
                </Box>
              </CardContent>
              
              <CardActions sx={{ justifyContent: 'flex-end', pt: 0 }}>
                {post.status === 'published' && (
                  <Button 
                    size="small" 
                    startIcon={<VisibilityIcon />}
                  >
                    View
                  </Button>
                )}
                
                <Button 
                  size="small" 
                  startIcon={<EditIcon />}
                  onClick={() => {
                    setEditPost(post);
                    setOpenDialog(true);
                  }}
                >
                  Edit
                </Button>
                
                {post.status === 'published' && post.isEvergreen && (
                  <Button 
                    size="small" 
                    startIcon={<AutorenewIcon />}
                    onClick={() => {
                      setSelectedPost(post);
                      handleRecycleClick();
                    }}
                  >
                    Recycle
                  </Button>
                )}
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Post options menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleEditClick}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Edit Post
        </MenuItem>
        
        {selectedPost && selectedPost.status === 'published' && selectedPost.isEvergreen && (
          <MenuItem onClick={handleRecycleClick}>
            <AutorenewIcon fontSize="small" sx={{ mr: 1 }} />
            Recycle Post
          </MenuItem>
        )}
        
        {selectedPost && selectedPost.status !== 'published' && (
          <MenuItem onClick={handleMenuClose}>
            <ScheduleIcon fontSize="small" sx={{ mr: 1 }} />
            Reschedule
          </MenuItem>
        )}
        
        <MenuItem onClick={handleDeleteClick}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Delete Post
        </MenuItem>
      </Menu>

      {/* Edit/Create Post Dialog */}
      <Dialog open={openDialog} onClose={handleDialogClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {editPost && editPost.id && posts.find(p => p.id === editPost.id) ? 'Edit Post' : 'Create New Post'}
        </DialogTitle>
        <DialogContent>
          {editPost && (
            <Box sx={{ mt: 2 }}>
              <TextField
                label="Post Title"
                fullWidth
                margin="normal"
                value={editPost.title}
                onChange={(e) => setEditPost({ ...editPost, title: e.target.value })}
              />
              
              <TextField
                label="Post Content"
                fullWidth
                margin="normal"
                multiline
                rows={4}
                value={editPost.content}
                onChange={(e) => setEditPost({ ...editPost, content: e.target.value })}
              />
              
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={editPost.isEvergreen}
                      onChange={(e) => setEditPost({ ...editPost, isEvergreen: e.target.checked })}
                    />
                  }
                  label="Evergreen Content"
                />
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={editPost.aiOptimized}
                      onChange={(e) => setEditPost({ ...editPost, aiOptimized: e.target.checked })}
                    />
                  }
                  label="AI Optimization"
                />
              </Box>
              
              {editPost.isEvergreen && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Recycling Frequency
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {['weekly', 'biweekly', 'monthly', 'quarterly'].map((frequency) => (
                      <Chip
                        key={frequency}
                        label={frequency.charAt(0).toUpperCase() + frequency.slice(1)}
                        onClick={() => setEditPost({ ...editPost, recycleFrequency: frequency })}
                        color={editPost.recycleFrequency === frequency ? 'primary' : 'default'}
                        variant={editPost.recycleFrequency === frequency ? 'filled' : 'outlined'}
                        sx={{ textTransform: 'capitalize' }}
                      />
                    ))}
                  </Box>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button onClick={handleSavePost} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Posts;