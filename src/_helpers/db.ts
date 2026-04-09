import config from '../../config.json';
import * as mysql from 'mysql2/promise';
import { Sequelize } from 'sequelize';

export const sequelize = new Sequelize(
  config.database.database,
  config.database.user,
  config.database.password,
  { dialect: 'mysql' }
);

export interface Database {
  User: any;
}

export const db: Database = {} as Database;

export async function initialize(): Promise<void> {
  const { host, port, user, password, database } = config.database;

  const connection = await mysql.createConnection({ host, port, user, password });
  await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\`;`);
  await connection.end();

const initUserModel = (await import('../users/user.model')).initUserModel;
  db.User = initUserModel(sequelize);

await sequelize.sync({ force: false, alter: false });

  console.log('✅ Database initialized and models synced');
}