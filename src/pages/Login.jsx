import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Paper, Container, Link } from '@mui/material';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    // For demo purposes, we'll just call the onLogin function
    // This simulates a successful login with any credentials
    localStorage.setItem('token', 'demo-token');
    localStorage.setItem('user', JSON.stringify({
      id: 1,
      name: 'Demo User',
      email: email
    }));
    onLogin();
  };

  // Demo login function - no actual API calls
  const handleDemoLogin = () => {
    // For demo purposes, we'll just call the onLogin function directly
    onLogin();
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={3} sx={{ p: 4, width: '100%', borderRadius: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
            <Typography component="h1" variant="h4" sx={{ fontWeight: 'bold', color: '#0077b5' }}>
              LinkedIn SMM
            </Typography>
            <Typography component="h2" variant="subtitle1" sx={{ mt: 1, textAlign: 'center' }}>
              AI-Powered Post Automation Tool
            </Typography>
          </Box>



          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
            {error && (
              <Typography color="error" variant="body2" sx={{ mb: 2 }}>
                {error}
              </Typography>
            )}
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2, py: 1.5 }}
            >
              Sign In
            </Button>
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <Link href="#" variant="body2">
                Forgot password?
              </Link>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
              <Link href="#" variant="body2">
                Don't have an account? Sign Up
              </Link>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;