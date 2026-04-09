import type { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

export function validateRequest(
  req: Request,
  res: Response,   // ✅ ADD THIS
  next: NextFunction,
  schema: Joi.ObjectSchema
): void {
  const options = {
    abortEarly: false,
    allowUnknown: false,
    stripUnknown: true,
  };

  const { error, value } = schema.validate(req.body, options);

  if (error) {
    const message = error.details
      .map(d => d.message.replace(/"/g, ''))
      .join(', ');

    // ✅ STOP request immediately
    res.status(400).json({
      message: `Validation error: ${message}`,
    });
    return;
  }

  req.body = value;
  next();
}