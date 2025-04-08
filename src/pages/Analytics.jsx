import React, { useState } from 'react';
import { Box, Typography, Paper, Grid, Card, CardContent, Tabs, Tab, FormControl, InputLabel, Select, MenuItem, Divider } from '@mui/material';
import { Line, Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import { format, subDays, subMonths } from 'date-fns';
import { TrendingUp, Schedule, Autorenew } from '@mui/icons-material';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

// Mock data for analytics
const generateDailyData = (days, baseValue, variance) => {
  return Array.from({ length: days }, (_, i) => {
    const date = subDays(new Date(), days - i - 1);
    return {
      date,
      value: Math.floor(baseValue + Math.random() * variance - variance / 2)
    };
  });
};

const engagementData = generateDailyData(30, 100, 50);
const impressionsData = generateDailyData(30, 500, 200);
const clicksData = generateDailyData(30, 50, 30);

const postTypePerformance = [
  { type: 'Industry Insights', engagement: 85 },
  { type: 'How-to Guides', engagement: 72 },
  { type: 'Case Studies', engagement: 68 },
  { type: 'Company News', engagement: 45 },
  { type: 'Product Updates', engagement: 58 },
];

const timePerformance = [
  { time: '8:00 AM', engagement: 65 },
  { time: '10:00 AM', engagement: 85 },
  { time: '12:00 PM', engagement: 75 },
  { time: '2:00 PM', engagement: 80 },
  { time: '4:00 PM', engagement: 70 },
  { time: '6:00 PM', engagement: 60 },
];

const dayPerformance = [
  { day: 'Monday', engagement: 75 },
  { day: 'Tuesday', engagement: 85 },
  { day: 'Wednesday', engagement: 80 },
  { day: 'Thursday', engagement: 90 },
  { day: 'Friday', engagement: 70 },
  { day: 'Saturday', engagement: 50 },
  { day: 'Sunday', engagement: 45 },
];

const aiInsights = [
  {
    id: 1,
    type: 'timing',
    title: 'Optimal Posting Times',
    description: 'Based on your audience activity, posts published on Tuesdays and Thursdays between 9:00 AM and 11:00 AM receive 35% higher engagement.',
    icon: <Schedule />
  },
  {
    id: 2,
    type: 'content',
    title: 'Content Performance',
    description: 'Industry Insights and How-to Guides consistently outperform other content types. Consider creating more of this content.',
    icon: <TrendingUp />
  },
  {
    id: 3,
    type: 'recycling',
    title: 'Evergreen Content Opportunity',
    description: 'Your top 5 posts from the last quarter would benefit from recycling. We recommend scheduling them again with minor updates.',
    icon: <Autorenew />
  },
];

const Analytics = () => {
  const [timeRange, setTimeRange] = useState('30d');
  const [tabValue, setTabValue] = useState(0);

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Handle time range change
  const handleTimeRangeChange = (event) => {
    setTimeRange(event.target.value);
  };

  // Filter data based on selected time range
  const getFilteredData = (data) => {
    switch (timeRange) {
      case '7d':
        return data.slice(-7);
      case '14d':
        return data.slice(-14);
      case '30d':
        return data.slice(-30);
      case '90d':
        return data;
      default:
        return data;
    }
  };

  // Prepare chart data for engagement over time
  const engagementChartData = {
    labels: getFilteredData(engagementData).map(item => format(item.date, 'MMM d')),
    datasets: [
      {
        label: 'Engagement',
        data: getFilteredData(engagementData).map(item => item.value),
        borderColor: '#0077b5',
        backgroundColor: 'rgba(0, 119, 181, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  // Prepare chart data for impressions over time
  const impressionsChartData = {
    labels: getFilteredData(impressionsData).map(item => format(item.date, 'MMM d')),
    datasets: [
      {
        label: 'Impressions',
        data: getFilteredData(impressionsData).map(item => item.value),
        borderColor: '#00a0dc',
        backgroundColor: 'rgba(0, 160, 220, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  // Prepare chart data for clicks over time
  const clicksChartData = {
    labels: getFilteredData(clicksData).map(item => format(item.date, 'MMM d')),
    datasets: [
      {
        label: 'Clicks',
        data: getFilteredData(clicksData).map(item => item.value),
        borderColor: '#2867b2',
        backgroundColor: 'rgba(40, 103, 178, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  // Prepare chart data for post type performance
  const postTypeChartData = {
    labels: postTypePerformance.map(item => item.type),
    datasets: [
      {
        label: 'Engagement Score',
        data: postTypePerformance.map(item => item.engagement),
        backgroundColor: [
          'rgba(0, 119, 181, 0.7)',
          'rgba(0, 160, 220, 0.7)',
          'rgba(40, 103, 178, 0.7)',
          'rgba(10, 102, 194, 0.7)',
          'rgba(0, 130, 202, 0.7)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Prepare chart data for time performance
  const timeChartData = {
    labels: timePerformance.map(item => item.time),
    datasets: [
      {
        label: 'Engagement by Time',
        data: timePerformance.map(item => item.engagement),
        backgroundColor: 'rgba(0, 119, 181, 0.7)',
      },
    ],
  };

  // Prepare chart data for day performance
  const dayChartData = {
    labels: dayPerformance.map(item => item.day),
    datasets: [
      {
        label: 'Engagement by Day',
        data: dayPerformance.map(item => item.engagement),
        backgroundColor: 'rgba(0, 119, 181, 0.7)',
      },
    ],
  };

  // Chart options
  const lineChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const pieChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right',
      },
    },
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 500 }}>
          Analytics
        </Typography>
        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel id="time-range-label">Time Range</InputLabel>
          <Select
            labelId="time-range-label"
            id="time-range-select"
            value={timeRange}
            label="Time Range"
            onChange={handleTimeRangeChange}
          >
            <MenuItem value="7d">Last 7 days</MenuItem>
            <MenuItem value="14d">Last 14 days</MenuItem>
            <MenuItem value="30d">Last 30 days</MenuItem>
            <MenuItem value="90d">Last 90 days</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label="Overview" />
          <Tab label="Content Performance" />
          <Tab label="Timing Analysis" />
          <Tab label="AI Insights" />
        </Tabs>
      </Paper>

      {/* Overview Tab */}
      {tabValue === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Engagement</Typography>
                <Typography variant="h3" sx={{ color: '#0077b5', fontWeight: 'bold', mb: 2 }}>
                  {engagementData[engagementData.length - 1].value}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {engagementData[engagementData.length - 1].value > engagementData[engagementData.length - 2].value ? '+' : ''}
                  {((engagementData[engagementData.length - 1].value - engagementData[engagementData.length - 2].value) / engagementData[engagementData.length - 2].value * 100).toFixed(1)}% from yesterday
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Impressions</Typography>
                <Typography variant="h3" sx={{ color: '#00a0dc', fontWeight: 'bold', mb: 2 }}>
                  {impressionsData[impressionsData.length - 1].value}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {impressionsData[impressionsData.length - 1].value > impressionsData[impressionsData.length - 2].value ? '+' : ''}
                  {((impressionsData[impressionsData.length - 1].value - impressionsData[impressionsData.length - 2].value) / impressionsData[impressionsData.length - 2].value * 100).toFixed(1)}% from yesterday
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Clicks</Typography>
                <Typography variant="h3" sx={{ color: '#2867b2', fontWeight: 'bold', mb: 2 }}>
                  {clicksData[clicksData.length - 1].value}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {clicksData[clicksData.length - 1].value > clicksData[clicksData.length - 2].value ? '+' : ''}
                  {((clicksData[clicksData.length - 1].value - clicksData[clicksData.length - 2].value) / clicksData[clicksData.length - 2].value * 100).toFixed(1)}% from yesterday
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>Engagement Over Time</Typography>
              <Box sx={{ height: 300 }}>
                <Line data={engagementChartData} options={lineChartOptions} />
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>Impressions Over Time</Typography>
              <Box sx={{ height: 300 }}>
                <Line data={impressionsChartData} options={lineChartOptions} />
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>Clicks Over Time</Typography>
              <Box sx={{ height: 300 }}>
                <Line data={clicksChartData} options={lineChartOptions} />
              </Box>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Content Performance Tab */}
      {tabValue === 1 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>Post Type Performance</Typography>
              <Box sx={{ height: 300 }}>
                <Bar data={postTypeChartData} options={barChartOptions} />
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>Content Type Distribution</Typography>
              <Box sx={{ height: 300 }}>
                <Pie data={postTypeChartData} options={pieChartOptions} />
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>Top Performing Posts</Typography>
              <Box sx={{ mt: 2 }}>
                {[
                  { title: 'How to Build a Personal Brand', engagement: 95, date: '2023-09-05' },
                  { title: 'Industry Insights: The Future of Remote Work', engagement: 87, date: '2023-08-22' },
                  { title: '5 Tips for Better LinkedIn Engagement', engagement: 82, date: '2023-09-01' },
                  { title: 'Case Study: How We Increased Engagement by 200%', engagement: 78, date: '2023-08-15' },
                  { title: 'The Ultimate Guide to Content Marketing', engagement: 75, date: '2023-08-10' },
                ].map((post, index) => (
                  <React.Fragment key={index}>
                    {index > 0 && <Divider sx={{ my: 2 }} />}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                          {post.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Published on {post.date}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="h6" sx={{ color: '#0077b5', fontWeight: 'bold', mr: 1 }}>
                          {post.engagement}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Engagement Score
                        </Typography>
                      </Box>
                    </Box>
                  </React.Fragment>
                ))}
              </Box>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Timing Analysis Tab */}
      {tabValue === 2 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>Best Time to Post</Typography>
              <Box sx={{ height: 300 }}>
                <Bar data={timeChartData} options={barChartOptions} />
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>Best Day to Post</Typography>
              <Box sx={{ height: 300 }}>
                <Bar data={dayChartData} options={barChartOptions} />
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>AI-Optimized Posting Schedule</Typography>
              <Box sx={{ mt: 2 }}>
                <Typography variant="body1" paragraph>
                  Based on your audience activity and post performance, we recommend the following optimal posting schedule:
                </Typography>
                <Grid container spacing={2}>
                  {[
                    { day: 'Monday', time: '10:00 AM', score: 75 },
                    { day: 'Tuesday', time: '9:00 AM', score: 85 },
                    { day: 'Wednesday', time: '2:00 PM', score: 80 },
                    { day: 'Thursday', time: '10:00 AM', score: 90 },
                    { day: 'Friday', time: '11:00 AM', score: 70 },
                  ].map((slot, index) => (
                    <Grid item xs={12} sm={6} md={4} lg={2.4} key={index}>
                      <Card sx={{ bgcolor: 'rgba(0, 119, 181, 0.05)', height: '100%' }}>
                        <CardContent>
                          <Typography variant="h6" sx={{ color: '#0077b5', fontWeight: 'bold', mb: 1 }}>
                            {slot.day}
                          </Typography>
                          <Typography variant="h5">
                            {slot.time}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            Engagement Score: {slot.score}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* AI Insights Tab */}
      {tabValue === 3 && (
        <Grid container spacing={3}>
          {aiInsights.map((insight) => (
            <Grid item xs={12} key={insight.id}>
              <Paper sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                  <Box sx={{ 
                    bgcolor: 'rgba(0, 119, 181, 0.1)', 
                    borderRadius: '50%', 
                    p: 1.5, 
                    mr: 2,
                    color: '#0077b5'
                  }}>
                    {insight.icon}
                  </Box>
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      {insight.title}
                    </Typography>
                    <Typography variant="body1">
                      {insight.description}
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Grid>
          ))}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>AI-Generated Content Recommendations</Typography>
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 500, mb: 1 }}>
                  Based on your audience engagement, we recommend creating content on these topics:
                </Typography>
                <Grid container spacing={2}>
                  {[
                    { topic: 'LinkedIn Algorithm Updates', relevance: 95 },
                    { topic: 'Personal Branding Strategies', relevance: 90 },
                    { topic: 'Industry Thought Leadership', relevance: 85 },
                    { topic: 'Professional Development Tips', relevance: 80 },
                    { topic: 'Remote Work Best Practices', relevance: 75 },
                  ].map((topic, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                      <Card sx={{ bgcolor: 'rgba(0, 119, 181, 0.05)', height: '100%' }}>
                        <CardContent>
                          <Typography variant="subtitle1" sx={{ fontWeight: 500, mb: 1 }}>
                            {topic.topic}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Relevance Score: {topic.relevance}/100
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default Analytics;