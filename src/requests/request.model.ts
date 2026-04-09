import { DataTypes, Model, Optional, Sequelize } from 'sequelize';

interface RequestAttributes {
  id: number;
  username: string;
  type: string;
  items: string;
  status: string;
}

interface RequestCreationAttributes extends Optional<RequestAttributes, 'id'> {}

export class Request extends Model<RequestAttributes, RequestCreationAttributes>
  implements RequestAttributes {
  declare id: number;
  declare username: string;
  declare type: string;
  declare items: string;
  declare status: string;
}

export function initRequestModel(sequelize: Sequelize): typeof Request {
  Request.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      username: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      type: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      items: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      status: {
        type: DataTypes.STRING,
        defaultValue: 'pending',
      },
    },
    {
      sequelize,
      tableName: 'requests',
      timestamps: true,
    }
  );

  return Request;
}