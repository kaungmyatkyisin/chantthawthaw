import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getSupabase } from './lib/supabase';
import { User } from '@supabase/supabase-js';
import { ThemeProvider, createTheme, CssBaseline, Box, Typography, Button, Container } from '@mui/material';
import { AlertCircle } from 'lucide-react';

// Pages
import Home from './pages/Home';
import Admin from './pages/Admin';
import Login from './pages/Login';

// Components
import Navbar from './components/Navbar';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2E7D32', // Vibrant Green from logo
    },
    secondary: {
      main: '#FBC02D', // Bright Yellow from logo
    },
    background: {
      default: '#f8fafc',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h3: {
      fontWeight: 800,
    },
    h4: {
      fontWeight: 800,
    },
    h5: {
      fontWeight: 700,
    },
    h6: {
      fontWeight: 700,
    },
    subtitle1: {
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: '16px',
        },
      },
    },
  },
});

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const supabase = getSupabase();
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
        setLoading(false);
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
      });

      return () => subscription.unsubscribe();
    } catch (e) {
      setLoading(false);
    }
  }, []);

  if (loading) return null;

  if (!session) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
}

function ConfigError() {
  return (
    <Container maxWidth="md" sx={{ py: 10 }}>
      <Box sx={{ p: 6, borderRadius: '32px', backgroundColor: 'white', boxShadow: '0 20px 60px rgba(0,0,0,0.05)', textAlign: 'center' }}>
        <AlertCircle size={64} className="text-amber-500 mx-auto mb-6" />
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 800, letterSpacing: '-1px' }}>
          Supabase Setup Required
        </Typography>
        <Typography variant="body1" color="textSecondary" paragraph sx={{ mb: 4, fontSize: '1.1rem' }}>
          To start using <b>Remix: FreshCart Grocery</b>, you need to configure your Supabase project.
        </Typography>
        
        <Box sx={{ textAlign: 'left', mb: 4, p: 3, backgroundColor: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, color: '#1e293b' }}>
            Follow these steps:
          </Typography>
          <ol className="list-decimal list-inside space-y-3 text-slate-600">
            <li>Create a new project at <a href="https://supabase.com" target="_blank" className="text-emerald-600 font-bold">supabase.com</a></li>
            <li>Go to <b>Project Settings {'>'} API</b> and copy your <b>URL</b> and <b>anon key</b></li>
            <li>Set <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> in your environment variables</li>
            <li>Run this SQL in the <b>SQL Editor</b> to create the products table and disable RLS:
              <pre className="mt-2 p-3 bg-slate-900 text-slate-100 rounded-lg text-xs overflow-x-auto">
{`CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  image_url TEXT,
  category TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Disable RLS to allow the admin console to save products
ALTER TABLE products DISABLE ROW LEVEL SECURITY;`}
              </pre>
            </li>
            <li>Create a public storage bucket named <code>product-images bucket</code> and add a policy to allow <b>INSERT</b> and <b>SELECT</b> for all users (or authenticated users).</li>
          </ol>
        </Box>

        <Button 
          variant="contained" 
          size="large"
          onClick={() => window.location.reload()}
          sx={{ 
            backgroundColor: '#2E7D32', 
            '&:hover': { backgroundColor: '#1B5E20' },
            px: 6,
            py: 1.5,
            borderRadius: '12px',
            fontSize: '1rem'
          }}
        >
          I've set the variables, reload
        </Button>
      </Box>
    </Container>
  );
}

export default function App() {
  const [hasConfig, setHasConfig] = useState(true);

  useEffect(() => {
    try {
      getSupabase();
    } catch (e) {
      setHasConfig(false);
    }
  }, []);

  if (!hasConfig) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <ConfigError />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute>
                    <Admin />
                  </ProtectedRoute>
                } 
              />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
          <footer className="bg-white border-t border-slate-100 py-8">
            <Container maxWidth="lg">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center border-2 border-[#2E7D32] overflow-hidden">
                    <img 
                      src="https://onbzhnhkrvdhvrojvajh.supabase.co/storage/v1/object/public/logo/logo.jpeg" 
                      alt="FreshCart Logo" 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <span className="font-bold text-slate-900">ချန့်သော်စားသောက်ကုန်လုပ်ငန်း</span>
                </div>
                <p className="text-slate-500 text-sm">
                  © {new Date().getFullYear()} ချန့်သော်စားသောက်ကုန်လုပ်ငန်း. All rights reserved.
                </p>
                <div className="flex gap-6">
                  <a href="#" className="text-slate-400 hover:text-emerald-600 transition-colors">Privacy</a>
                  <a href="#" className="text-slate-400 hover:text-emerald-600 transition-colors">Terms</a>
                  <a href="#" className="text-slate-400 hover:text-emerald-600 transition-colors">Contact</a>
                </div>
              </div>
            </Container>
          </footer>
        </div>
      </Router>
    </ThemeProvider>
  );
}
