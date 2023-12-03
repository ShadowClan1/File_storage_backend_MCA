"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class File extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  File.init(
    {
      name: DataTypes.STRING,
      object_url : DataTypes.TEXT,
      object_key : DataTypes.TEXT,
      mime_type :  DataTypes.STRING,
      size: DataTypes.INTEGER,
      parent_dir: DataTypes.INTEGER,
      owner_id: DataTypes.INTEGER,
      created_at: DataTypes.DATE,
      updated_at: DataTypes.DATE,
    },
    {
      sequelize ,
      modelName: "File",
      tableName : 'files',
      createdAt : 'created_at',
      updatedAt : 'updated_at' }
  );
  return File;
};
