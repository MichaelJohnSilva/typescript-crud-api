import { DataTypes, Model, Optional, Sequelize } from 'sequelize';
import bcrypt from 'bcryptjs';

// ✅ Include virtual fields in attributes (important fix)
interface UserAttributes {
  id: number;
  title: string;
  firstName: string;
  lastName: string;
  email: string;
  passwordHash: string;
  role: string;

  // ✅ Virtual fields (NOT stored in DB)
  password?: string;
  confirmPassword?: string;
}

// ✅ Allow optional fields on creation
interface UserCreationAttributes
  extends Optional<UserAttributes, 'id' | 'passwordHash' | 'password' | 'confirmPassword'> {}

export class User extends Model<UserAttributes, UserCreationAttributes>
  implements UserAttributes {
  declare id: number;
  declare title: string;
  declare firstName: string;
  declare lastName: string;
  declare email: string;
  declare passwordHash: string;
  declare role: string;

  // ✅ Virtuals still declared here for usage
  declare password?: string;
  declare confirmPassword?: string;
}

export function initUserModel(sequelize: Sequelize): typeof User {
  User.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: true,
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
        allowNull: false,
      },
      role: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'User',
      },

      // ✅ VIRTUAL password field
      password: {
        type: DataTypes.VIRTUAL,
        set(this: User, value: string) {
          this.setDataValue('password', value);

          if (value) {
            const hash = bcrypt.hashSync(value, 10);
            this.setDataValue('passwordHash', hash);
          }
        },
      },

      // ✅ VIRTUAL confirmPassword
      confirmPassword: {
        type: DataTypes.VIRTUAL,
      },
    },
    {
      sequelize,
      tableName: 'users',
      timestamps: true,

      defaultScope: {
        attributes: { exclude: ['passwordHash'] },
      },
    }
  );

  return User;
}