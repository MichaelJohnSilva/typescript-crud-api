import type { Request, Response, NextFunction } from 'express';
import { Router } from 'express';
import Joi from 'joi';
import { db } from '../_helpers/db';
import { validateRequest } from '../_middleware/validateRequest';
import type { Department } from './department.model';

const router = Router();

router.get('/', getAll);
router.get('/:id', getById);
router.post('/', createSchema, create);
router.put('/:id', updateSchema, update);
router.delete('/:id', _delete);

function getAll(req: Request, res: Response, next: NextFunction): void {
    db.Department.findAll()
        .then((departments: Department[]) => res.json(departments))
        .catch(next);
}

function getById(req: Request, res: Response, next: NextFunction): void {
    db.Department.findByPk(Number(req.params.id))
        .then((department: Department | null) => {
            if (!department) {
                return res.status(404).json({ message: "Department not found" });
            }
            res.json(department);
        })
        .catch(next);
}

function create(req: Request, res: Response, next: NextFunction): void {
    db.Department.create(req.body)
        .then((department: Department) => res.json({ message: 'Department created', department }))
        .catch(next);
}

function update(req: Request, res: Response, next: NextFunction): void {
    db.Department.findByPk(Number(req.params.id))
        .then((department: Department | null) => {
            if (!department) {
                return res.status(404).json({ message: "Department not found" });
            }
            department.update(req.body).then((updated: Department) => res.json(updated));
        })
        .catch(next);
}

function _delete(req: Request, res: Response, next: NextFunction): void {
    db.Department.findByPk(Number(req.params.id))
        .then((department: Department | null) => {
            if (!department) {
                return res.status(404).json({ message: "Department not found" });
            }
            department.destroy();
            res.json({ message: 'Department deleted' });
        })
        .catch(next);
}

function createSchema(req: Request, res: Response, next: NextFunction): void {
    const schema = Joi.object({
        name: Joi.string().required(),
        description: Joi.string().required()
    });
    validateRequest(req, res, next, schema);
}

function updateSchema(req: Request, res: Response, next: NextFunction): void {
    const schema = Joi.object({
        name: Joi.string().optional(),
        description: Joi.string().optional()
    });
    validateRequest(req, res, next, schema);
}

export default router;