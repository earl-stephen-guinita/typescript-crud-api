// src/auth/auth.controller.ts
import { Router } from 'express';
import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../_helpers/db';
import config from '../../config.json';

const router = Router();

// POST /api/register
router.post('/register', async (req: Request, res: Response): Promise<void> => {
    const { firstName, lastName, email, password, role = 'User' } = req.body;

    if (!firstName || !lastName || !email || !password) {
        res.status(400).json({ error: 'All fields are required' });
        return;
    }

    const existing = await db.User.findOne({ where: { email } });
    if (existing) {
        res.status(409).json({ error: 'User already exists' });
        return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await db.User.create({ firstName, lastName, email, passwordHash, role, title: 'Mr' });
    res.status(201).json({ message: 'User registered', email });
});

// POST /api/login
router.post('/login', async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;

    const user = await db.User.scope('withHash').findOne({ where: { email } });
    if (!user || !await bcrypt.compare(password, user.passwordHash)) {
        res.status(401).json({ error: 'Invalid credentials' });
        return;
    }

    const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        config.jwtSecret,
        { expiresIn: '1h' }
    );

    res.json({
        token,
        user: { firstName: user.firstName, lastName: user.lastName, email: user.email, role: user.role }
    });
});

// GET /api/profile
router.get('/profile', async (req: Request, res: Response): Promise<void> => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        res.status(401).json({ error: 'Access token required' });
        return;
    }

    jwt.verify(token, config.jwtSecret, async (err: any, decoded: any) => {
        if (err) {
            res.status(403).json({ error: 'Invalid or expired token' });
            return;
        }
        const user = await db.User.findOne({ where: { email: decoded.email } });
        res.json({ user });
    });
});

export default router;