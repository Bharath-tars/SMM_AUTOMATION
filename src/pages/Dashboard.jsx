import React from 'react';
import { Box, Grid, Typography, Paper, Button, Divider, Chip, Avatar } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { CalendarMonth, Notifications, TrendingUp, Schedule, Autorenew, PostAdd } from '@mui/icons-material';

// Mock data for the dashboard
const performanceData = [
  { name: 'Mon', engagement: 65 },
  { name: 'Tue', engagement: 59 },
  { name: 'Wed', engagement: 80 },
  { name: 'Thu', engagement: 81 },
  { name: 'Fri', engagement: 56 },
  { name: 'Sat', engagement: 40 },
  { name: 'Sun', engagement: 45 },
];

const upcomingPosts = [
  {
    id: 1,
    title: 'Industry Insights: The Future of Remote Work',
    scheduledFor: '2023-09-15T10:30:00',
    status: 'scheduled',
    aiOptimized: true,
  },
  {
    id: 2,
    title: 'Case Study: How We Increased Engagement by 200%',
    scheduledFor: '2023-09-16T14:00:00',
    status: 'scheduled',
    aiOptimized: true,
  },
  {
    id: 3,
    title: 'Webinar Announcement: Digital Marketing Trends 2023',
    scheduledFor: '2023-09-18T09:00:00',
    status: 'draft',
    aiOptimized: false,
  },
];

const aiRecommendations = [
  {
    id: 1,
    type: 'reschedule',
    message: 'Your post "5 Tips for Better LinkedIn Engagement" performed below average. Consider rescheduling to Thursday at 10:00 AM for better engagement.',
    action: 'Reschedule',
  },
  {
    id: 2,
    type: 'recycle',
    message: 'Your post "How to Build a Personal Brand" was highly successful. Consider recycling this content next month.',
    action: 'Recycle',
  },
  {
    id: 3,
    type: 'optimize',
    message: 'Based on your audience activity, the best time to post is between 8:00 AM and 10:00 AM on weekdays.',
    action: 'Apply to Schedule',
  },
];

const Dashboard = () => {
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 500 }}>
          Dashboard
        </Typography>
        <Button variant="contained" startIcon={<PostAdd />}>
          Create New Post
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Performance Overview */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Performance Overview
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="engagement" fill="#0077b5" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* AI Insights */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <TrendingUp sx={{ color: '#0077b5', mr: 1 }} />
              <Typography variant="h6">AI Insights</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Based on your post performance and audience activity
            </Typography>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                Best posting times:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1, mb: 2 }}>
                <Chip label="Tuesday 9:00 AM" size="small" />
                <Chip label="Thursday 10:00 AM" size="small" />
                <Chip label="Wednesday 2:00 PM" size="small" />
              </Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                Top performing content types:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                <Chip label="Industry Insights" size="small" />
                <Chip label="How-to Guides" size="small" />
                <Chip label="Case Studies" size="small" />
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Upcoming Posts */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Schedule sx={{ color: '#0077b5', mr: 1 }} />
              <Typography variant="h6">Upcoming Posts</Typography>
            </Box>
            {upcomingPosts.map((post, index) => (
              <React.Fragment key={post.id}>
                {index > 0 && <Divider sx={{ my: 2 }} />}
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                      {post.title}
                    </Typography>
                    <Box>
                      <Chip 
                        size="small" 
                        label={post.status === 'scheduled' ? 'Scheduled' : 'Draft'} 
                        color={post.status === 'scheduled' ? 'primary' : 'default'}
                        variant="outlined"
                      />
                      {post.aiOptimized && (
                        <Chip 
                          size="small" 
                          label="AI Optimized" 
                          color="secondary"
                          variant="outlined"
                          sx={{ ml: 1 }}
                        />
                      )}
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <CalendarMonth fontSize="small" sx={{ color: 'text.secondary', mr: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      {new Date(post.scheduledFor).toLocaleString('en-US', {
                        weekday: 'long',
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: 'numeric',
                      })}
                    </Typography>
                  </Box>
                </Box>
              </React.Fragment>
            ))}
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
              <Button variant="text" sx={{ mt: 1 }}>
                View All Posts
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* AI Recommendations */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Autorenew sx={{ color: '#0077b5', mr: 1 }} />
              <Typography variant="h6">AI Recommendations</Typography>
            </Box>
            {aiRecommendations.map((rec, index) => (
              <React.Fragment key={rec.id}>
                {index > 0 && <Divider sx={{ my: 2 }} />}
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                    <Avatar 
                      sx={{ 
                        bgcolor: 
                          rec.type === 'reschedule' ? '#ff9800' : 
                          rec.type === 'recycle' ? '#4caf50' : '#2196f3',
                        width: 32,
                        height: 32,
                        mr: 2
                      }}
                    >
                      {rec.type === 'reschedule' ? <Schedule fontSize="small" /> : 
                       rec.type === 'recycle' ? <Autorenew fontSize="small" /> : 
                       <Notifications fontSize="small" />}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2">{rec.message}</Typography>
                      <Button 
                        size="small" 
                        variant="outlined" 
                        sx={{ mt: 1 }}
                      >
                        {rec.action}
                      </Button>
                    </Box>
                  </Box>
                </Box>
              </React.Fragment>
            ))}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;