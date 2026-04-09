import type { Request, Response, NextFunction } from 'express';
import { Router } from 'express';
import Joi from 'joi';
import bcrypt from 'bcryptjs';
import { db } from '../_helpers/db';
import { Role } from '../_helpers/role';
import { validateRequest } from '../_middleware/validateRequest';
import type { Account } from './account.model';

const router = Router();

router.get('/', getAll);
router.get('/:id', getById);
router.post('/', createSchema, create);
router.put('/:id', updateSchema, update);
router.delete('/:id', _delete);

function getAll(req: Request, res: Response, next: NextFunction): void {
    db.Account.findAll()
        .then((accounts: Account[]) => res.json(accounts))
        .catch(next);
}

function getById(req: Request, res: Response, next: NextFunction): void {
    db.Account.findByPk(Number(req.params.id))
        .then((account: Account | null) => {
            if (!account) {
                return res.status(404).json({ message: "Account not found" });
            }
            res.json(account);
        })
        .catch(next);
}

function create(req: Request, res: Response, next: NextFunction): void {
    createHandler(req, res).catch(next);
}

async function createHandler(req: Request, res: Response): Promise<void> {
    const { firstName, lastName, email, password, role, verified } = req.body;
    
    const existingAccount = await db.Account.findOne({ where: { email } });
    if (existingAccount) {
        res.status(400).json({ error: 'Email already exists' });
        return;
    }
    
    let passwordHash: string | undefined;
    if (password) {
        passwordHash = await bcrypt.hash(password, 10);
    }
    
    const account = await db.Account.create({
        firstName,
        lastName,
        email,
        passwordHash,
        role: role || Role.User,
        verified: verified || false
    });
    
    res.json({ message: 'Account created', id: account.id });
}

function update(req: Request, res: Response, next: NextFunction): void {
    updateHandler(req, res).catch(next);
}

async function updateHandler(req: Request, res: Response): Promise<void> {
    const account = await db.Account.findByPk(Number(req.params.id));
    if (!account) {
        res.status(404).json({ error: 'Account not found' });
        return;
    }
    
    const { firstName, lastName, email, password, role, verified } = req.body;
    
    let passwordHash = account.passwordHash;
    if (password) {
        passwordHash = await bcrypt.hash(password, 10);
    }
    
    await account.update({
        firstName: firstName || account.firstName,
        lastName: lastName || account.lastName,
        email: email || account.email,
        passwordHash: password || account.passwordHash ? passwordHash : account.passwordHash,
        role: role || account.role,
        verified: verified !== undefined ? verified : account.verified
    });
    
    res.json({ message: 'Account updated' });
}

function _delete(req: Request, res: Response, next: NextFunction): void {
    db.Account.findByPk(Number(req.params.id))
        .then((account: Account | null) => {
            if (!account) {
                return res.status(404).json({ message: "Account not found" });
            }
            account.destroy();
            res.json({ message: 'Account deleted' });
        })
        .catch(next);
}

function createSchema(req: Request, res: Response, next: NextFunction): void {
    const schema = Joi.object({
        firstName: Joi.string().required(),
        lastName: Joi.string().required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(6).required(),
        role: Joi.string().valid(Role.Admin, Role.User).optional(),
        verified: Joi.boolean().optional()
    });
    validateRequest(req, res, next, schema);
}

function updateSchema(req: Request, res: Response, next: NextFunction): void {
    const schema = Joi.object({
        firstName: Joi.string().optional(),
        lastName: Joi.string().optional(),
        email: Joi.string().email().optional(),
        password: Joi.string().min(6).optional(),
        role: Joi.string().valid(Role.Admin, Role.User).optional(),
        verified: Joi.boolean().optional()
    });
    validateRequest(req, res, next, schema);
}

export default router;