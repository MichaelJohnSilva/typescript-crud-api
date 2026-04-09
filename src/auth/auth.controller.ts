import type { Request, Response, NextFunction } from 'express';
import { Router } from 'express';
import Joi from 'joi';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../_helpers/db';
import { Role } from '../_helpers/role';
import config from '../../config.json';

const router = Router();

router.post('/register', registerSchema, register);
router.post('/login', loginSchema, login);
router.get('/profile', profile);
router.put('/profile', updateProfileSchema, updateProfile);

function updateProfileSchema(req: Request, res: Response, next: NextFunction): void {
    const schema = Joi.object({
        username: Joi.string().email().optional(),
        password: Joi.string().min(6).optional(),
        firstName: Joi.string().optional(),
        lastName: Joi.string().optional()
    });
    
    const { error } = schema.validate(req.body);
    if (error) {
        res.status(400).json({ error: error.details[0].message });
        return;
    }
    next();
}

function register(req: Request, res: Response, next: NextFunction): void {
    registerHandler(req, res).catch(next);
}

function login(req: Request, res: Response, next: NextFunction): void {
    loginHandler(req, res).catch(next);
}

function profile(req: Request, res: Response, next: NextFunction): void {
    profileHandler(req, res).catch(next);
}

function updateProfile(req: Request, res: Response, next: NextFunction): void {
    updateProfileHandler(req, res).catch(next);
}

async function registerHandler(req: Request, res: Response): Promise<void> {
    const { email, password, firstName, lastName, role } = req.body;
    
    const existingUser = await db.User.findOne({ where: { email } });
    if (existingUser) {
        res.status(400).json({ error: 'Email already exists' });
        return;
    }
    
    const passwordHash = await bcrypt.hash(password, 10);
    
    await db.User.create({
        email,
        passwordHash,
        firstName: firstName || '',
        lastName: lastName || '',
        role: role || Role.User
    });
    
    res.json({ message: 'User registered successfully' });
}

async function loginHandler(req: Request, res: Response): Promise<void> {
    const { username, password } = req.body;
    
    let user = await db.Account.findOne({ where: { email: username } });
    if (!user) {
        user = await db.User.unscoped().findOne({ where: { email: username } });
    }
    
    if (!user) {
        res.status(401).json({ error: 'Invalid credentials' });
        return;
    }
    
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
        res.status(401).json({ error: 'Invalid credentials' });
        return;
    }
    
    const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        config.jwtSecret,
        { expiresIn: '24h' }
    );
    
    res.json({
        token,
        user: {
            username: user.email,
            role: user.role.toLowerCase()
        }
    });
}

async function profileHandler(req: Request, res: Response): Promise<void> {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }
    
    const token = authHeader.substring(7);
    
    try {
        const decoded = jwt.verify(token, config.jwtSecret) as { id: number; email: string; role: string };
        
        let user = await db.Account.findByPk(decoded.id);
        if (!user) {
            user = await db.User.findByPk(decoded.id);
        }
        
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        
        res.json({
            username: user.email,
            role: user.role.toLowerCase(),
            firstName: user.firstName,
            lastName: user.lastName
        });
    } catch {
        res.status(401).json({ error: 'Invalid token' });
    }
}

async function updateProfileHandler(req: Request, res: Response): Promise<void> {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }
    
    const token = authHeader.substring(7);
    
    try {
        const decoded = jwt.verify(token, config.jwtSecret) as { id: number; email: string; role: string };
        
        let user = await db.Account.findByPk(decoded.id);
        let isAccount = !!user;
        
        if (!user) {
            user = await db.User.findByPk(decoded.id);
        }
        
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        
        const { username, password, firstName, lastName } = req.body;
        
        if (username && username !== user.email) {
            const checkTable = isAccount ? db.Account : db.User;
            const existingUser = await checkTable.findOne({ where: { email: username } });
            if (existingUser && (existingUser as any).id !== user.id) {
                res.status(400).json({ error: 'Email already exists' });
                return;
            }
            await user.update({ email: username });
        }
        
        if (password) {
            const passwordHash = await bcrypt.hash(password, 10);
            await user.update({ passwordHash });
        }
        
        if (firstName !== undefined) {
            await user.update({ firstName });
        }
        
        if (lastName !== undefined) {
            await user.update({ lastName });
        }
        
        res.json({ message: 'Profile updated', username: user.email, firstName: (user as any).firstName, lastName: (user as any).lastName });
    } catch {
        res.status(401).json({ error: 'Invalid token' });
    }
}

function registerSchema(req: Request, res: Response, next: NextFunction): void {
    const schema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().min(6).required(),
        firstName: Joi.string().optional(),
        lastName: Joi.string().optional(),
        role: Joi.string().valid(Role.Admin, Role.User).optional()
    });
    
    const { error } = schema.validate(req.body);
    if (error) {
        res.status(400).json({ error: error.details[0].message });
        return;
    }
    next();
}

function loginSchema(req: Request, res: Response, next: NextFunction): void {
    const schema = Joi.object({
        username: Joi.string().required(),
        password: Joi.string().required()
    });
    
    const { error } = schema.validate(req.body);
    if (error) {
        res.status(400).json({ error: error.details[0].message });
        return;
    }
    next();
}

export default router;