// api/auth.js
import express from 'express';
import { createClient } from '../server/supabase.js';

const router = express.Router();

router.get('/google', async (req, res) => {
  const supabase = createClient(req, res);
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${process.env.VITE_SERVER_URL || 'http://localhost:4000'}/api/auth/callback`,
    },
  });

  if (error) return res.status(500).send(error.message);
  res.redirect(data.url); // Sends user to Google's login page
});

// 2. The Callback Handler
router.get('/callback', async (req, res) => {
  const { code } = req.query;
  const supabase = createClient(req, res);

  if (code) {
    // Exchange the temporary code for a permanent session (stored in cookies)
    // await supabase.auth.exchangeCodeForSession(code);
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
        console.error('Error exchanging code for session:', error);
        return res.redirect('/login?error=auth-failed');
    }
  }

  res.redirect('/');
});


export default router;