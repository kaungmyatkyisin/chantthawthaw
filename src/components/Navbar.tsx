import { AppBar, Toolbar, Typography, Button, Box, Container } from '@mui/material';
import { ShoppingBasket, LogIn, LogOut, LayoutDashboard } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getSupabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const supabase = getSupabase();
      supabase.auth.getSession().then(({ data: { session } }) => {
        setUser(session?.user ?? null);
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null);
      });

      return () => subscription.unsubscribe();
    } catch (e) {
      console.warn('Supabase not configured');
    }
  }, []);

  const handleLogout = async () => {
    try {
      await getSupabase().auth.signOut();
      navigate('/');
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <AppBar position="sticky" sx={{ backgroundColor: 'white', color: 'black', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ justifyContent: 'space-between' }}>
          <Box component={Link} to="/" sx={{ display: 'flex', alignItems: 'center', gap: 1.5, textDecoration: 'none', color: 'inherit' }}>
            <Box 
              sx={{ 
                width: 45, 
                height: 45, 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                overflow: 'hidden',
                border: '1px solid #f1f5f9'
              }}
            >
              <img 
                src="https://onbzhnhkrvdhvrojvajh.supabase.co/storage/v1/object/public/logo/logo.jpeg" 
                alt="FreshCart Logo" 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                referrerPolicy="no-referrer"
              />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: '-0.5px', color: '#2E7D32' }}>
              ချန့်သော်စားသောက်ကုန်လုပ်ငန်း
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Button component={Link} to="/" sx={{ color: 'inherit', textTransform: 'none', fontWeight: 600 }}>
              Shop
            </Button>
            {user ? (
              <>
                <Button 
                  component={Link} 
                  to="/admin" 
                  startIcon={<LayoutDashboard size={18} />}
                  sx={{ color: 'inherit', textTransform: 'none', fontWeight: 600 }}
                >
                  Dashboard
                </Button>
                <Button 
                  onClick={handleLogout}
                  startIcon={<LogOut size={18} />}
                  variant="outlined"
                  color="error"
                  sx={{ textTransform: 'none', borderRadius: '8px' }}
                >
                  Logout
                </Button>
              </>
            ) : (
              <Button 
                component={Link} 
                to="/login" 
                startIcon={<LogIn size={18} />}
                variant="contained"
                sx={{ 
                  backgroundColor: '#2E7D32', 
                  '&:hover': { backgroundColor: '#1B5E20' },
                  textTransform: 'none',
                  borderRadius: '8px',
                  boxShadow: 'none',
                  fontWeight: 700
                }}
              >
                Admin Login
              </Button>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
