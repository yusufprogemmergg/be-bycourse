import { JwtPayload } from 'jsonwebtoken';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload | any; // atau bisa di custom misal: { id: number }
    }
  }
}