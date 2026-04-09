import express from 'express';
import cors from 'cors';
import path from 'path';
import { errorHandler } from './_middleware/errorHandler';
import usersController from './users/users.controller';
import authController from './auth/auth.controller';
import accountsController from './accounts/accounts.controller';
import employeesController from './employees/employees.controller';
import departmentsController from './departments/departments.controller';
import requestsController from './requests/requests.controller';
import { initialize } from './_helpers/db';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// ✅ Serve frontend FIRST
app.use(express.static(path.join(__dirname, '../public')));

// Routes
app.use('/users', usersController);
app.use('/auth', authController);
app.use('/accounts', accountsController);
app.use('/employees', employeesController);
app.use('/departments', departmentsController);
app.use('/requests', requestsController);

// ✅ ALWAYS LAST
app.use(errorHandler);

const PORT = 4000;

initialize()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err: Error) => {
    console.error(err);
  });