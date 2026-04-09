// src/server.ts

import express from 'express';
import cors from 'cors';
import { errorHandler } from './_middleware/errorHandler';
import usersController from './users/users.controller';
import { initialize } from './_helpers/db';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Routes
app.use('/users', usersController);

// ✅ ONLY THIS (keep this)
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