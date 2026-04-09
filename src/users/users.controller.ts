// src/users/users.controller.ts

import type { Request, Response, NextFunction } from 'express';
import { Router } from 'express';
import Joi from 'joi';
import { Role } from '../_helpers/role';
import { validateRequest } from '../_middleware/validateRequest';
import { userService } from './user.service';
import type { User } from './user.model';

const router = Router();

// 🔒 ROUTES
router.get('/', getAll);
router.get('/:id', getById);
router.post('/', createSchema, create);
router.put('/:id', updateSchema, update);
router.delete('/:id', _delete);

export default router;

// 🔒 ROUTE HANDLERS (typed)
function getAll(req: Request, res: Response, next: NextFunction): void {
    userService.getAll()
        .then((users: User[]) => res.json(users))
        .catch(next);
}

function getById(req: Request, res: Response, next: NextFunction): void {
    userService.getById(Number(req.params.id))
        .then((user: User | null) => {
            if (!user) {
                return res.status(404).json({
                    message: "User not found"
                });
            }

            res.json(user);
        })
        .catch(next);
}

function create(req: Request, res: Response, next: NextFunction): void {
    userService.create(req.body)
        .then(() => res.json({ message: 'User created' }))
        .catch(next);
}

function update(req: Request, res: Response, next: NextFunction): void {
    userService.update(Number(req.params.id), req.body)
        .then(() => res.json({ message: 'User updated' }))
        .catch(next);
}

function _delete(req: Request, res: Response, next: NextFunction): void {
    userService.delete(Number(req.params.id))
        .then(() => res.json({ message: 'User deleted' }))
        .catch(next);
}

// 🔒 VALIDATION SCHEMAS
function createSchema(req: Request, res: Response, next: NextFunction): void {
  const schema = Joi.object({
    title: Joi.string().optional(),
    firstName: Joi.string().optional(),
    lastName: Joi.string().optional(),
    role: Joi.string().valid(Role.Admin, Role.User).default(Role.User),
    email: Joi.string().email().required(),       // ✅ required
    password: Joi.string().min(6).required(),     // ✅ required
    // ❌ remove confirmPassword completely
  });

  validateRequest(req, res, next, schema);
}
function updateSchema(req: Request, res: Response, next: NextFunction): void {
    const schema = Joi.object({
        title: Joi.string().empty(''),
        firstName: Joi.string().empty(''),
        lastName: Joi.string().empty(''),
        role: Joi.string().valid(Role.Admin, Role.User).empty(''),
        email: Joi.string().email().empty(''),
        password: Joi.string().min(6).empty(''),
        confirmPassword: Joi.string().valid(Joi.ref('password')).empty(''),
    }).with('password', 'confirmPassword');
    validateRequest(req, res, next, schema);
}