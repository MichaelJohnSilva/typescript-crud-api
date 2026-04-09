import type { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

export function validateRequest(
  req: Request,
  res: Response,
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
    console.log('Validation error details:', error.details);
    const message = error.details
      .map(d => d.message.replace(/"/g, ''))
      .join(', ');

    res.status(400).json({
      message: `Validation error: ${message}`,
      details: error.details.map(d => d.message)
    });
    return;
  }

  req.body = value;
  next();
}