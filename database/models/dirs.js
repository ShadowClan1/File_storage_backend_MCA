"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Dir extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Dir.init(
    {
      name: DataTypes.STRING,
      size: DataTypes.INTEGER,
      parent_dir: DataTypes.INTEGER,
      owner_id: DataTypes.INTEGER,
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE,
    },
    {
      sequelize ,
      modelName: "Dir",
      tableName : 'dirs',
      createdAt : 'createdAt',
      updatedAt : 'updatedAt' }
  );
  return Dir;
};
