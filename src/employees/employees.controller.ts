// src/employees/employees.controller.ts
import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { db } from '../_helpers/db';
import { authenticateToken, authorizeRole } from '../_middleware/authorize';

const router = Router();

router.get('/', authenticateToken, authorizeRole('Admin'), getAll);
router.post('/', authenticateToken, authorizeRole('Admin'), create);
router.patch('/:empId', authenticateToken, authorizeRole('Admin'), update);
router.delete('/:empId', authenticateToken, authorizeRole('Admin'), remove);

export default router;

async function getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const employees = await db.Employee.findAll();
        res.json({ employees });
    } catch (err) { next(err); }
}

async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const { empId, email, position, dept, hireDate = '' } = req.body;
        if (!empId || !email || !position || !dept) {
            res.status(400).json({ error: 'ID, Email, Position and Department are required.' });
            return;
        }

        const existing = await db.Employee.findOne({ where: { empId } });
        if (existing) { res.status(409).json({ error: 'Employee ID already exists.' }); return; }

        const userExists = await db.User.findOne({ where: { email } });
        if (!userExists) { res.status(404).json({ error: 'No account found with that email.' }); return; }

        const emp = await db.Employee.create({ empId, email, position, dept, hireDate });
        res.status(201).json({ message: 'Employee added', employee: emp });
    } catch (err) { next(err); }
}

async function update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const emp = await db.Employee.findOne({ where: { empId: req.params['empId'] } });
        if (!emp) { res.status(404).json({ error: 'Employee not found.' }); return; }

        const { email, position, dept, hireDate } = req.body;
        if (email) emp.email = email;
        if (position) emp.position = position;
        if (dept) emp.dept = dept;
        if (hireDate !== undefined) emp.hireDate = hireDate;
        await emp.save();

        res.json({ message: 'Employee updated' });
    } catch (err) { next(err); }
}

async function remove(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const emp = await db.Employee.findOne({ where: { empId: req.params['empId'] } });
        if (!emp) { res.status(404).json({ error: 'Employee not found.' }); return; }

        await emp.destroy();
        res.json({ message: 'Employee deleted' });
    } catch (err) { next(err); }
}