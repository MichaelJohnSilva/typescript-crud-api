import { DataTypes, Model, Optional, Sequelize } from 'sequelize';

interface DepartmentAttributes {
  id: number;
  name: string;
  description: string;
}

interface DepartmentCreationAttributes extends Optional<DepartmentAttributes, 'id'> {}

export class Department extends Model<DepartmentAttributes, DepartmentCreationAttributes>
  implements DepartmentAttributes {
  declare id: number;
  declare name: string;
  declare description: string;
}

export function initDepartmentModel(sequelize: Sequelize): typeof Department {
  Department.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      tableName: 'departments',
      timestamps: true,
    }
  );

  return Department;
}