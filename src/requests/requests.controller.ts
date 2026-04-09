import type { Request, Response, NextFunction } from 'express';
import { Router } from 'express';
import Joi from 'joi';
import jwt from 'jsonwebtoken';
import { db } from '../_helpers/db';
import { validateRequest } from '../_middleware/validateRequest';
import config from '../../config.json';
import type { Request as RequestModel } from './request.model';

const router = Router();

router.get('/', getAll);
router.get('/my-requests', getMyRequests);
router.post('/', createSchema, create);
router.put('/:id', updateSchema, update);

// Debug route to check database
router.get('/debug', debugRequests);

function debugRequests(req: Request, res: Response): void {
    console.log("Debug endpoint called");
    db.Request.findAll()
        .then((requests: RequestModel[]) => {
            console.log("Found requests:", requests.length);
            res.json({ count: requests.length, requests });
        })
        .catch((err: Error) => {
            console.error("Debug error:", err);
            res.status(500).json({ error: err.message });
        });
}

function getAll(req: Request, res: Response, next: NextFunction): void {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }
    
    const token = authHeader.substring(7);
    
    try {
        const decoded = jwt.verify(token, config.jwtSecret) as { id: number; email: string; role: string };
        
        if (decoded.role.toLowerCase() !== 'admin') {
            res.status(403).json({ error: 'Admin only' });
            return;
        }
        
        db.Request.findAll()
            .then((requests: RequestModel[]) => res.json(requests))
            .catch(next);
    } catch {
        res.status(401).json({ error: 'Invalid token' });
    }
}

function getMyRequests(req: Request, res: Response, next: NextFunction): void {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }
    
    const token = authHeader.substring(7);
    
    try {
        const decoded = jwt.verify(token, config.jwtSecret) as { id: number; email: string; role: string };
        
        db.Request.findAll({ where: { username: decoded.email } })
            .then((requests: RequestModel[]) => res.json(requests))
            .catch((err: Error) => {
                console.error("getMyRequests error:", err);
                res.status(500).json({ error: err.message });
            });
    } catch {
        res.status(401).json({ error: 'Invalid token' });
    }
}

function create(req: Request, res: Response, next: NextFunction): void {
    createHandler(req, res).catch(next);
}

async function createHandler(req: Request, res: Response): Promise<void> {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }
    
    const token = authHeader.substring(7);
    
    try {
        const decoded = jwt.verify(token, config.jwtSecret) as { id: number; email: string; role: string };
        
        const request = await db.Request.create({
            username: decoded.email,
            type: req.body.type,
            items: JSON.stringify(req.body.items),
            status: 'pending'
        });
        
        res.json({ message: 'Request created', request });
    } catch (err) {
        console.error("createHandler error:", err);
        res.status(500).json({ error: (err as Error).message });
    }
}

function update(req: Request, res: Response, next: NextFunction): void {
    updateHandler(req, res).catch(next);
}

async function updateHandler(req: Request, res: Response): Promise<void> {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }
    
    const token = authHeader.substring(7);
    
    try {
        const decoded = jwt.verify(token, config.jwtSecret) as { id: number; email: string; role: string };
        
        if (decoded.role.toLowerCase() !== 'admin') {
            res.status(403).json({ error: 'Admin only' });
            return;
        }
        
        const request = await db.Request.findByPk(Number(req.params.id));
        if (!request) {
            res.status(404).json({ error: 'Request not found' });
            return;
        }
        
        const { status } = req.body;
        
        await request.update({ status });
        
        res.json({ message: 'Request updated' });
    } catch {
        res.status(401).json({ error: 'Invalid token' });
    }
}

function createSchema(req: Request, res: Response, next: NextFunction): void {
    const schema = Joi.object({
        type: Joi.string().required(),
        items: Joi.array().items(
            Joi.object({
                name: Joi.string().required(),
                quantity: Joi.number().required()
            })
        ).required()
    });
    validateRequest(req, res, next, schema);
}

function updateSchema(req: Request, res: Response, next: NextFunction): void {
    const schema = Joi.object({
        status: Joi.string().valid('approved', 'rejected').required()
    });
    validateRequest(req, res, next, schema);
}

export default router;