// User management API
import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { requireAuth } from '../middleware/auth';
import nodemailer from 'nodemailer';
import User from '../models/user';
import Org from '../models/org';
import { connectMongo } from '../models/mongo';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

// Connect to MongoDB
connectMongo();

// Email integration (SendGrid stub)
const transporter = nodemailer.createTransport({
  host: process.env.SENDGRID_HOST || 'smtp.sendgrid.net',
  port: process.env.SENDGRID_PORT ? Number(process.env.SENDGRID_PORT) : 587,
  auth: {
    user: process.env.SENDGRID_USER,
    pass: process.env.SENDGRID_PASS,
  },
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username, password });
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  const token = jwt.sign({ sub: user._id, org: user.org, role: user.role }, JWT_SECRET, {
    expiresIn: '1d',
  });
  res.json({
    token,
    user: { id: user._id, username: user.username, org: user.org, role: user.role },
  });
});

router.get('/me', requireAuth(['user', 'admin', 'readonly']), async (req, res) => {
  const auth = (req as any).auth;
  const user = await User.findById(auth.sub);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ user: { id: user._id, username: user.username, org: user.org, role: user.role } });
});

router.post('/register', async (req, res) => {
  const { username, password, email, org, role } = req.body;
  if (!username || !password || !email || !org || !role) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  const exists = await User.findOne({ username, org });
  if (exists) {
    return res.status(409).json({ error: 'User already exists' });
  }
  const user = new User({ username, password, email, org, role });
  await user.save();
  res.json({ user: { id: user._id, username, org, role } });
});

router.post('/reset-password', requireAuth(['admin', 'user']), async (req, res) => {
  const { username, org, newPassword } = req.body;
  if (!username || !org || !newPassword) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  const user = await User.findOne({ username, org });
  if (!user) return res.status(404).json({ error: 'User not found' });
  user.password = newPassword;
  await user.save();
  res.json({ message: 'Password reset successful' });
});

// Email verification (stub)
const pendingVerifications: Record<string, string> = {};

router.post('/send-verification', async (req, res) => {
  const { username, org, email } = req.body;
  const user = await User.findOne({ username, org });
  if (!user) return res.status(404).json({ error: 'User not found' });
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  pendingVerifications[user._id.toString()] = code;
  // Send email
  try {
    await transporter.sendMail({
      from: 'noreply@observax.dev',
      to: email,
      subject: 'Your ObservaX Verification Code',
      text: `Your code: ${code}`,
    });
    logAudit('email_verification_sent', user, { email });
    res.json({ message: `Verification code sent to ${email}` });
  } catch (err) {
    res.status(500).json({ error: 'Email send failed' });
  }
});

router.post('/verify-email', async (req, res) => {
  const { username, org, code } = req.body;
  const user = await User.findOne({ username, org });
  if (!user) return res.status(404).json({ error: 'User not found' });
  if (pendingVerifications[user._id.toString()] !== code) {
    return res.status(400).json({ error: 'Invalid verification code' });
  }
  user.verified = true;
  await user.save();
  delete pendingVerifications[user._id.toString()];
  res.json({ message: 'Email verified' });
});

// Audit logging (stub)
const auditLogs: any[] = [];
function logAudit(action: string, user: any, details: any) {
  auditLogs.push({ timestamp: new Date(), action, user: user?.username, org: user?.org, details });
}

router.get('/audit-logs', requireAuth(['admin']), (req, res) => {
  res.json({ logs: auditLogs });
});

// Advanced audit logging: log all user actions
router.use((req, res, next) => {
  if ((req as any).auth) {
    logAudit(req.method + ' ' + req.path, (req as any).auth, req.body);
  }
  next();
});

// Organization management (MongoDB)

router.post('/orgs/create', requireAuth(['admin']), async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Missing org name' });
  const exists = await Org.findOne({ name });
  if (exists) return res.status(409).json({ error: 'Org already exists' });
  const org = new Org({ name, owner: (req as any).auth.sub, members: [(req as any).auth.sub] });
  await org.save();
  logAudit('org_create', (req as any).auth, { name, id: org._id });
  res.json({ org: { name: org.name, id: org._id } });
});

router.get('/orgs', requireAuth(['admin', 'user']), async (req, res) => {
  const orgs = await Org.find();
  res.json({ orgs });
});

// Org-level RBAC enforcement
function requireOrgRole(role: string) {
  return (
    req: import('express').Request,
    res: import('express').Response,
    next: import('express').NextFunction
  ) => {
    const auth = (req as any).auth;
    if (!auth || !auth.org || !auth.role) return res.status(401).json({ error: 'Unauthorized' });
    if (auth.role !== role) return res.status(403).json({ error: 'Insufficient org role' });
    next();
  };
}

router.post('/orgs/delete', requireOrgRole('admin'), async (req, res) => {
  const { name } = req.body;
  const org = await Org.findOne({ name });
  if (!org) return res.status(404).json({ error: 'Org not found' });
  await org.deleteOne();
  logAudit('org_delete', (req as any).auth, { name });
  res.json({ message: 'Org deleted' });
});

export default router;
