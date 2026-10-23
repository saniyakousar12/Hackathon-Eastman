import "dotenv/config";
import crypto from "crypto";
import cors from "cors";
import express from "express";
import nodemailer from "nodemailer";

const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, MAIL_FROM, CLIENT_ORIGIN, PORT = 5000 } = process.env;
const app = express();
app.use(cors({ origin: CLIENT_ORIGIN || "http://localhost:5173" }));
app.use(express.json());

const mailer = SMTP_HOST
  ? nodemailer.createTransport({ host: SMTP_HOST, port: +SMTP_PORT || 587, secure: +SMTP_PORT === 465, auth: { user: SMTP_USER, pass: SMTP_PASS } })
  : null;
const otps = new Map(); // email -> { code, exp, sent, tries }
const clean = (e) => String(e || "").trim().toLowerCase();

app.post("/api/send-otp", async (req, res) => {
  const email = clean(req.body.email);
  if (!/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ error: "Enter a valid email" });
  const prev = otps.get(email);
  if (prev && Date.now() - prev.sent < 30000) return res.status(429).json({ error: "Please wait 30 seconds before requesting another OTP" });
  const code = String(crypto.randomInt(100000, 1000000));
  otps.set(email, { code, exp: Date.now() + 5 * 60000, sent: Date.now(), tries: 0 });
  if (mailer) {
    try {
      await mailer.sendMail({ from: MAIL_FROM || SMTP_USER, to: email, subject: "Your SmartSave OTP",
        text: `Your SmartSave verification code is ${code}. It expires in 5 minutes.` });
    } catch (err) {
      console.error("SMTP error:", err.message);
      return res.status(500).json({ error: "Could not send the email. Check SMTP settings." });
    }
  } else {
    console.log(`[DEV] SMTP not configured. OTP for ${email}: ${code}`);
  }
  res.json({ ok: true });
});

app.post("/api/verify-otp", (req, res) => {
  const email = clean(req.body.email);
  const rec = otps.get(email);
  if (!rec || Date.now() > rec.exp) return res.status(400).json({ error: "OTP expired. Request a new one." });
  if (++rec.tries > 5) { otps.delete(email); return res.status(429).json({ error: "Too many attempts. Request a new OTP." }); }
  if (String(req.body.otp) !== rec.code) return res.status(400).json({ error: "Incorrect OTP" });
  otps.delete(email);
  res.json({ ok: true });
});

app.listen(PORT, () => console.log(`SmartSave server on :${PORT} (${mailer ? "SMTP" : "DEV console OTP"})`));
