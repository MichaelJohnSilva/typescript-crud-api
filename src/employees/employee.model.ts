import { DataTypes, Model, Optional, Sequelize } from 'sequelize';

interface EmployeeAttributes {
  id: string;
  email: string;
  position: string;
  department: string;
  hireDate: string;
}

interface EmployeeCreationAttributes extends Optional<EmployeeAttributes, 'id'> {}

export class Employee extends Model<EmployeeAttributes, EmployeeCreationAttributes>
  implements EmployeeAttributes {
  declare id: string;
  declare email: string;
  declare position: string;
  declare department: string;
  declare hireDate: string;
}

export function initEmployeeModel(sequelize: Sequelize): typeof Employee {
  Employee.init(
    {
      id: {
        type: DataTypes.STRING,
        primaryKey: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      position: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      department: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      hireDate: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      tableName: 'employees',
      timestamps: true,
    }
  );

  return Employee;
}