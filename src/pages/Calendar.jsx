import React, { useState } from 'react';
import { Box, Paper, Typography, Grid, Button, Tabs, Tab, Chip, IconButton, Menu, MenuItem } from '@mui/material';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { format, addDays, startOfWeek, endOfWeek, eachDayOfInterval, isToday, isSameDay } from 'date-fns';
import { Add as AddIcon, MoreVert as MoreVertIcon, Schedule as ScheduleIcon, Autorenew as AutorenewIcon } from '@mui/icons-material';

// Mock data for calendar posts
const initialPosts = [
  {
    id: 'post-1',
    title: 'Industry Insights: The Future of Remote Work',
    content: 'Remote work is here to stay. Here are the top trends we\'re seeing...',
    date: new Date(2023, 8, 15, 10, 30),
    status: 'scheduled',
    aiOptimized: true,
    engagement: null,
  },
  {
    id: 'post-2',
    title: 'Case Study: How We Increased Engagement by 200%',
    content: 'Learn how our client achieved remarkable results with our strategy...',
    date: new Date(2023, 8, 16, 14, 0),
    status: 'scheduled',
    aiOptimized: true,
    engagement: null,
  },
  {
    id: 'post-3',
    title: 'Webinar Announcement: Digital Marketing Trends 2023',
    content: 'Join us for an exclusive webinar on the latest digital marketing trends...',
    date: new Date(2023, 8, 18, 9, 0),
    status: 'draft',
    aiOptimized: false,
    engagement: null,
  },
  {
    id: 'post-4',
    title: '5 Tips for Better LinkedIn Engagement',
    content: 'Boost your LinkedIn presence with these proven strategies...',
    date: new Date(2023, 8, 12, 11, 0),
    status: 'published',
    aiOptimized: true,
    engagement: 'low',
  },
  {
    id: 'post-5',
    title: 'How to Build a Personal Brand',
    content: 'Your personal brand is your most valuable asset. Here\'s how to build it...',
    date: new Date(2023, 8, 10, 15, 30),
    status: 'published',
    aiOptimized: true,
    engagement: 'high',
  },
];

// Calendar view options
const VIEW_TYPES = {
  DAY: 'day',
  WEEK: 'week',
  MONTH: 'month',
};

const Calendar = () => {
  const [posts, setPosts] = useState(initialPosts);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewType, setViewType] = useState(VIEW_TYPES.WEEK);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);

  // Handle menu open/close
  const handleMenuOpen = (event, post) => {
    setAnchorEl(event.currentTarget);
    setSelectedPost(post);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedPost(null);
  };

  // Handle view type change
  const handleViewChange = (event, newValue) => {
    setViewType(newValue);
  };

  // Handle drag and drop
  const onDragEnd = (result) => {
    const { destination, source, draggableId } = result;

    // If there's no destination or the item was dropped back in its original position
    if (!destination || 
        (destination.droppableId === source.droppableId && 
         destination.index === source.index)) {
      return;
    }

    // Find the post that was dragged
    const post = posts.find(p => p.id === draggableId);
    
    // Create a new date based on the destination droppableId (which is the date string)
    const newDate = new Date(destination.droppableId);
    
    // Update the post's date
    const updatedPost = {
      ...post,
      date: newDate,
      aiOptimized: true, // Mark as AI optimized when manually moved
    };

    // Update the posts array
    const updatedPosts = posts.map(p => 
      p.id === draggableId ? updatedPost : p
    );

    setPosts(updatedPosts);
  };

  // Generate days for the current view
  const getDaysForView = () => {
    switch (viewType) {
      case VIEW_TYPES.DAY:
        return [currentDate];
      case VIEW_TYPES.WEEK:
        const start = startOfWeek(currentDate, { weekStartsOn: 1 }); // Start on Monday
        const end = endOfWeek(currentDate, { weekStartsOn: 1 }); // End on Sunday
        return eachDayOfInterval({ start, end });
      case VIEW_TYPES.MONTH:
        // Simplified month view - just showing 4 weeks for demo
        const monthStart = startOfWeek(currentDate, { weekStartsOn: 1 });
        const monthEnd = addDays(monthStart, 27); // 4 weeks
        return eachDayOfInterval({ start: monthStart, end: monthEnd });
      default:
        return [currentDate];
    }
  };

  // Get posts for a specific day
  const getPostsForDay = (day) => {
    return posts.filter(post => isSameDay(post.date, day));
  };

  // Render the calendar grid
  const renderCalendarGrid = () => {
    const days = getDaysForView();

    return (
      <Grid container spacing={2}>
        {days.map((day) => (
          <Grid item xs={viewType === VIEW_TYPES.DAY ? 12 : viewType === VIEW_TYPES.WEEK ? 12/7 : 3} key={day.toString()}>
            <Paper 
              elevation={1} 
              sx={{
                p: 2,
                height: '100%',
                minHeight: 200,
                backgroundColor: isToday(day) ? 'rgba(0, 119, 181, 0.05)' : 'white',
                border: isToday(day) ? '1px solid #0077b5' : '1px solid #e0e0e0',
              }}
            >
              <Typography 
                variant="subtitle2" 
                sx={{ 
                  mb: 1, 
                  fontWeight: isToday(day) ? 'bold' : 'normal',
                  color: isToday(day) ? '#0077b5' : 'inherit',
                }}
              >
                {format(day, 'EEE, MMM d')}
              </Typography>
              
              <Droppable droppableId={day.toISOString()}>
                {(provided) => (
                  <Box
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    sx={{ minHeight: 150 }}
                  >
                    {getPostsForDay(day).map((post, index) => (
                      <Draggable key={post.id} draggableId={post.id} index={index}>
                        {(provided) => (
                          <Paper
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            elevation={2}
                            sx={{
                              p: 1.5,
                              mb: 1,
                              backgroundColor: 
                                post.status === 'published' ? 
                                  post.engagement === 'high' ? 'rgba(76, 175, 80, 0.1)' : 
                                  post.engagement === 'low' ? 'rgba(255, 152, 0, 0.1)' : 'white' : 
                                post.status === 'scheduled' ? 'rgba(33, 150, 243, 0.1)' : 'white',
                              borderLeft: 
                                post.status === 'published' ? 
                                  post.engagement === 'high' ? '4px solid #4caf50' : 
                                  post.engagement === 'low' ? '4px solid #ff9800' : '4px solid #2196f3' : 
                                post.status === 'scheduled' ? '4px solid #2196f3' : '4px solid #9e9e9e',
                            }}
                          >
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                              <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>
                                {post.title}
                              </Typography>
                              <IconButton 
                                size="small" 
                                sx={{ mt: -1, mr: -1 }}
                                onClick={(e) => handleMenuOpen(e, post)}
                              >
                                <MoreVertIcon fontSize="small" />
                              </IconButton>
                            </Box>
                            
                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                              <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>
                                {format(post.date, 'h:mm a')}
                              </Typography>
                              
                              {post.aiOptimized && (
                                <Chip 
                                  icon={<AutorenewIcon fontSize="small" />}
                                  label="AI Optimized" 
                                  size="small" 
                                  variant="outlined"
                                  sx={{ height: 20, '& .MuiChip-label': { fontSize: '0.625rem' } }}
                                />
                              )}
                            </Box>
                          </Paper>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </Box>
                )}
              </Droppable>
            </Paper>
          </Grid>
        ))}
      </Grid>
    );
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 500 }}>
          Content Calendar
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />}>
          Create New Post
        </Button>
      </Box>

      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Tabs value={viewType} onChange={handleViewChange} aria-label="calendar view tabs">
          <Tab label="Day" value={VIEW_TYPES.DAY} />
          <Tab label="Week" value={VIEW_TYPES.WEEK} />
          <Tab label="Month" value={VIEW_TYPES.MONTH} />
        </Tabs>
        
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Button 
            variant="outlined" 
            size="small" 
            onClick={() => setCurrentDate(new Date())}
            sx={{ mr: 1 }}
          >
            Today
          </Button>
          <Button 
            variant="outlined" 
            size="small" 
            onClick={() => {
              if (viewType === VIEW_TYPES.DAY) {
                setCurrentDate(addDays(currentDate, -1));
              } else if (viewType === VIEW_TYPES.WEEK) {
                setCurrentDate(addDays(currentDate, -7));
              } else {
                setCurrentDate(addDays(currentDate, -28));
              }
            }}
            sx={{ minWidth: 0, p: '5px' }}
          >
            &lt;
          </Button>
          <Button 
            variant="outlined" 
            size="small" 
            onClick={() => {
              if (viewType === VIEW_TYPES.DAY) {
                setCurrentDate(addDays(currentDate, 1));
              } else if (viewType === VIEW_TYPES.WEEK) {
                setCurrentDate(addDays(currentDate, 7));
              } else {
                setCurrentDate(addDays(currentDate, 28));
              }
            }}
            sx={{ minWidth: 0, p: '5px', ml: 1 }}
          >
            &gt;
          </Button>
        </Box>
      </Box>

      <DragDropContext onDragEnd={onDragEnd}>
        {renderCalendarGrid()}
      </DragDropContext>

      {/* Post options menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleMenuClose}>
          <ScheduleIcon fontSize="small" sx={{ mr: 1 }} />
          Reschedule
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <AutorenewIcon fontSize="small" sx={{ mr: 1 }} />
          Apply AI Optimization
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>Edit Post</MenuItem>
        <MenuItem onClick={handleMenuClose}>Delete Post</MenuItem>
      </Menu>
    </Box>
  );
};

export default Calendar;