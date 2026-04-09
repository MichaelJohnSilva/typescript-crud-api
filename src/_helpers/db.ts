import config from '../../config.json';
import * as mysql from 'mysql2/promise';
import { Sequelize } from 'sequelize';
import bcrypt from 'bcryptjs';

export const sequelize = new Sequelize(
  config.database.database,
  config.database.user,
  config.database.password,
  { dialect: 'mysql' }
);

export interface Database {
  User: any;
  Account: any;
  Employee: any;
  Department: any;
  Request: any;
}

export const db: Database = {} as Database;

export async function initialize(): Promise<void> {
  const { host, port, user, password, database } = config.database;

  const connection = await mysql.createConnection({ host, port, user, password });
  await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\`;`);
  await connection.end();

  const initUserModel = (await import('../users/user.model')).initUserModel;
  const initAccountModel = (await import('../accounts/account.model')).initAccountModel;
  const initEmployeeModel = (await import('../employees/employee.model')).initEmployeeModel;
  const initDepartmentModel = (await import('../departments/department.model')).initDepartmentModel;
  const initRequestModel = (await import('../requests/request.model')).initRequestModel;

  db.User = initUserModel(sequelize);
  db.Account = initAccountModel(sequelize);
  db.Employee = initEmployeeModel(sequelize);
  db.Department = initDepartmentModel(sequelize);
  db.Request = initRequestModel(sequelize);

  await sequelize.sync({ force: true });

  await seedAdminUser();

  console.log('✅ Database initialized and models synced');
}

async function seedAdminUser(): Promise<void> {
  const adminEmail = 'admin@gmail.com';
  
  const existingAdmin = await db.User.findOne({ where: { email: adminEmail } });
  
  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash('admin123', 10);
    
    await db.User.create({
      email: adminEmail,
      passwordHash,
      firstName: 'Admin',
      lastName: 'User',
      role: 'Admin'
    });
    
    console.log('✅ Admin user seeded: admin@gmail.com / admin123');
  }
}