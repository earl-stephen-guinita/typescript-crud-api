// src/_middleware/authorize.ts
import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from '../../config.json';

export interface AuthRequest extends Request {
    user?: { id: number; email: string; role: string };
}

export function authenticateToken(req: AuthRequest, res: Response, next: NextFunction): void {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        res.status(401).json({ error: 'Access token required' });
        return;
    }

    jwt.verify(token, config.jwtSecret, (err: any, user: any) => {
        if (err) {
            res.status(403).json({ error: 'Invalid or expired token' });
            return;
        }
        req.user = user as { id: number; email: string; role: string };
        next();
    });
}

export function authorizeRole(role: string) {
    return (req: AuthRequest, res: Response, next: NextFunction): void => {
        if (req.user?.role !== role) {
            res.status(403).json({ error: 'Access denied: insufficient permissions' });
            return;
        }
        next();
    };
}