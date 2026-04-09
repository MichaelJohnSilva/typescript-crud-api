import type { Request, Response, NextFunction } from 'express';
import { Router } from 'express';
import Joi from 'joi';
import { db } from '../_helpers/db';
import { validateRequest } from '../_middleware/validateRequest';
import type { Employee } from './employee.model';

const router = Router();

router.get('/', getAll);
router.get('/:id', getById);
router.post('/', createSchema, create);
router.put('/:id', update);
router.delete('/:id', _delete);

function getAll(req: Request, res: Response, next: NextFunction): void {
    db.Employee.findAll()
        .then((employees: Employee[]) => res.json(employees))
        .catch(next);
}

function getById(req: Request, res: Response, next: NextFunction): void {
    db.Employee.findByPk(req.params.id)
        .then((employee: Employee | null) => {
            if (!employee) {
                return res.status(404).json({ message: "Employee not found" });
            }
            res.json(employee);
        })
        .catch(next);
}

function create(req: Request, res: Response, next: NextFunction): void {
    db.Employee.create(req.body)
        .then((employee: Employee) => res.json({ message: 'Employee created', employee }))
        .catch(next);
}

function update(req: Request, res: Response, next: NextFunction): void {
    db.Employee.findByPk(req.params.id)
        .then((employee: Employee | null) => {
            if (!employee) {
                return res.status(404).json({ message: "Employee not found" });
            }
            employee.update(req.body).then((updated: Employee) => res.json(updated));
        })
        .catch(next);
}

function _delete(req: Request, res: Response, next: NextFunction): void {
    db.Employee.findByPk(req.params.id)
        .then((employee: Employee | null) => {
            if (!employee) {
                return res.status(404).json({ message: "Employee not found" });
            }
            employee.destroy();
            res.json({ message: 'Employee deleted' });
        })
        .catch(next);
}

function createSchema(req: Request, res: Response, next: NextFunction): void {
    const schema = Joi.object({
        id: Joi.string().required(),
        email: Joi.string().email().required(),
        position: Joi.string().required(),
        department: Joi.string().required(),
        hireDate: Joi.string().required()
    });
    validateRequest(req, res, next, schema);
}

function updateSchema(req: Request, res: Response, next: NextFunction): void {
    const schema = Joi.object({});
    validateRequest(req, res, next, schema);
}

export default router;