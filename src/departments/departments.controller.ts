// src/departments/departments.controller.ts
import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { db } from '../_helpers/db';
import { authenticateToken, authorizeRole } from '../_middleware/authorize';

const router = Router();

router.get('/', authenticateToken, getAll);
router.post('/', authenticateToken, authorizeRole('Admin'), create);
router.patch('/:id', authenticateToken, authorizeRole('Admin'), update);
router.delete('/:id', authenticateToken, authorizeRole('Admin'), remove);

export default router;

async function getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const departments = await db.Department.findAll();
        res.json({ departments });
    } catch (err) { next(err); }
}

async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const { name, description = '' } = req.body;
        if (!name) { res.status(400).json({ error: 'Department name is required.' }); return; }

        const existing = await db.Department.findOne({ where: { name } });
        if (existing) { res.status(409).json({ error: 'Department already exists.' }); return; }

        const dept = await db.Department.create({ name, description });
        res.status(201).json({ message: 'Department created', department: dept });
    } catch (err) { next(err); }
}

async function update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const dept = await db.Department.findByPk(req.params['id']);
        if (!dept) { res.status(404).json({ error: 'Department not found.' }); return; }

        const { name, description } = req.body;
        if (name) dept.name = name;
        if (description !== undefined) dept.description = description;
        await dept.save();

        res.json({ message: 'Department updated', department: dept });
    } catch (err) { next(err); }
}

async function remove(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const dept = await db.Department.findByPk(req.params['id']);
        if (!dept) { res.status(404).json({ error: 'Department not found.' }); return; }

        await dept.destroy();
        res.json({ message: 'Department deleted' });
    } catch (err) { next(err); }
}