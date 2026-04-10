// src/requests/requests.controller.ts
import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { db } from '../_helpers/db';
import { authenticateToken, AuthRequest } from '../_middleware/authorize';

const router = Router();

router.get('/', authenticateToken, getAll);
router.post('/', authenticateToken, create);
router.delete('/:id', authenticateToken, remove);

export default router;

async function getAll(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
        const requests = await db.Request.findAll({
            where: { employeeEmail: req.user?.email }
        });
        // Parse items from JSON string back to array
        const parsed = requests.map((r: any) => ({
            ...r.toJSON(),
            items: JSON.parse(r.items)
        }));
        res.json({ requests: parsed });
    } catch (err) { next(err); }
}

async function create(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
        const { type, items } = req.body;
        if (!type || !items || items.length === 0) {
            res.status(400).json({ error: 'Type and items are required.' });
            return;
        }

        const newRequest = await db.Request.create({
            type,
            items: JSON.stringify(items),
            status: 'Pending',
            date: new Date().toLocaleDateString(),
            employeeEmail: req.user?.email
        });

        res.status(201).json({
            message: 'Request submitted',
            request: { ...newRequest.toJSON(), items }
        });
    } catch (err) { next(err); }
}

async function remove(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
        const request = await db.Request.findOne({
            where: { id: req.params['id'], employeeEmail: req.user?.email }
        });
        if (!request) { res.status(404).json({ error: 'Request not found.' }); return; }

        await request.destroy();
        res.json({ message: 'Request deleted' });
    } catch (err) { next(err); }
}