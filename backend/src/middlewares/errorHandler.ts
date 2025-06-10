// Global typed error handling middleware
import { Request, Response, NextFunction } from 'express';

interface AppError {
  status?: number;
  message: string;
}

export function errorHandler(err: AppError, req: Request, res: Response, next: NextFunction) {
  const status = err.status || 500;
  res.status(status).json({
    error: err.message || 'Internal Server Error',
  });
}
