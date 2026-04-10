// src/server.ts
import express, { Application } from 'express';
import cors from 'cors';
import { errorHandler } from './_middleware/errorHandler';
import { initialize } from './_helpers/db';
import userController from './users/users.controller';
import authController from './auth/auth.controller';
import departmentController from './departments/departments.controller';
import employeeController from './employees/employees.controller';
import requestController from './requests/requests.controller';

const app: Application = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin: ['http://127.0.0.1:5500', 'http://localhost:5500', 'http://localhost:4000']
}));

// Routes
app.use('/api', authController);
app.use('/users', userController);
app.use('/api/departments', departmentController);
app.use('/api/employees', employeeController);
app.use('/api/requests', requestController);

app.use(errorHandler);

const PORT = process.env.PORT || 4000;

initialize()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`✅ Server running on http://localhost:${PORT}`);
        });
    })
    .catch((err) => {
        console.error('❌ Failed to initialize database:', err);
        process.exit(1);
    });