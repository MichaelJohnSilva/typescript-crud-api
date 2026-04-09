import { db } from '../_helpers/db';
import { User } from './user.model';
import bcrypt from 'bcryptjs';

class UserService {
  async getAll(): Promise<User[]> {
    return db.User.findAll();
  }

  async getById(id: number): Promise<User | null> {
    return db.User.findByPk(id);
  }

  async create(userData: any): Promise<User> {
    // ✅ hash password
    if (userData.password) {
      userData.passwordHash = await bcrypt.hash(userData.password, 10);
    }

    // ✅ remove unsafe fields
    delete userData.password;
    delete userData.confirmPassword;

    return db.User.create(userData);
  }

  async update(id: number, userData: any): Promise<User | null> {
    const user = await db.User.findByPk(id);
    if (!user) return null;

    // ✅ hash password if updating
    if (userData.password) {
      userData.passwordHash = await bcrypt.hash(userData.password, 10);
    }

    delete userData.password;
    delete userData.confirmPassword;

    await user.update(userData);
    return user;
  }

  async delete(id: number): Promise<boolean> {
    const user = await db.User.findByPk(id);
    if (!user) return false;

    await user.destroy();
    return true;
  }
}

export const userService = new UserService();