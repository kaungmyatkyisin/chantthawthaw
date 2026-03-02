import { Container, Box, Paper, Typography, TextField, Button, Divider, CircularProgress, Alert } from '@mui/material';
import { useState } from 'react';
import { getSupabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { LogIn, Mail } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { error } = await getSupabase().auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      navigate('/admin');
    } catch (err: any) {
      setError(err.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await getSupabase().auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/admin'
        }
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message || 'Failed to login with Google');
      setLoading(false);
    }
  };

  return (
    <Box sx={{ 
      minHeight: 'calc(100vh - 64px)', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      backgroundColor: '#f8fafc',
      py: 4
    }}>
      <Container maxWidth="xs">
        <Paper elevation={0} sx={{ 
          p: 4, 
          borderRadius: '24px', 
          boxShadow: '0 10px 40px rgba(0,0,0,0.05)',
          border: '1px solid #f1f5f9'
        }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box sx={{ 
              width: 80, 
              height: 80, 
              borderRadius: '50%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              mx: 'auto',
              mb: 2,
              border: '2px solid #2E7D32',
              overflow: 'hidden'
            }}>
              <img 
                src="https://onbzhnhkrvdhvrojvajh.supabase.co/storage/v1/object/public/logo/logo.jpeg" 
                alt="FreshCart Logo" 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                referrerPolicy="no-referrer"
              />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: '-0.5px', color: '#2E7D32' }}>
              Admin Access
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Please sign in to manage ချန့်သော်စားသောက်ကုန်လုပ်ငန်း
            </Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>{error}</Alert>}

          <form onSubmit={handleEmailLogin}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <TextField
                label="Email Address"
                type="email"
                fullWidth
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />
              <TextField
                label="Password"
                type="password"
                fullWidth
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />
              <Button 
                type="submit" 
                variant="contained" 
                fullWidth 
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Mail size={20} />}
                sx={{ 
                  backgroundColor: '#2E7D32', 
                  '&:hover': { backgroundColor: '#1B5E20' },
                  textTransform: 'none',
                  borderRadius: '12px',
                  py: 1.5,
                  fontWeight: 700,
                  boxShadow: 'none'
                }}
              >
                Sign in with Email
              </Button>
            </Box>
          </form>
        </Paper>
      </Container>
    </Box>
  );
}
