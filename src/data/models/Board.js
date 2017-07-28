import DataType from 'sequelize';
import Model from '../sequelize';

const Board = Model.define('Board', {

  id: {
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },

  name: {
    type: DataType.STRING,
  },
});

export default Board;
