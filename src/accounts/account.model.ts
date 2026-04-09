import { DataTypes, Model, Optional, Sequelize } from 'sequelize';

interface AccountAttributes {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  passwordHash: string;
  role: string;
  verified: boolean;
}

interface AccountCreationAttributes extends Optional<AccountAttributes, 'id'> {}

export class Account extends Model<AccountAttributes, AccountCreationAttributes>
  implements AccountAttributes {
  declare id: number;
  declare firstName: string;
  declare lastName: string;
  declare email: string;
  declare passwordHash: string;
  declare role: string;
  declare verified: boolean;
}

export function initAccountModel(sequelize: Sequelize): typeof Account {
  Account.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      firstName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      lastName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      passwordHash: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      role: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'User',
      },
      verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      sequelize,
      tableName: 'accounts',
      timestamps: true,
    }
  );

  return Account;
}