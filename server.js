import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
const resend = new Resend(process.env.RESEND_API_KEY);

app.post('/api/momo-webhook', async (req, res) => {
  try {
    const { amount, payerEmail, filmId } = req.body;
    if (amount < 2000) return res.status(400).json({ error: "Insufficient amount" });

    const code = `MOB-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    await supabase.from('unlock_codes').insert([{ code: code, film_id: filmId, email: payerEmail, is_used: false }]);

    await resend.emails.send({
      from: 'MOB Films <onboarding@resend.dev>',
      to: payerEmail,
      subject: 'Your Unlock Code for MOB Films UG',
      html: `<h1>Thank you!</h1><p>Your code is: <strong>${code}</strong></p>`
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));
