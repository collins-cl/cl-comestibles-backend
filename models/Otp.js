module.exports = (sequelize, DataTypes) => {
  const Tokens = sequelize.define("Tokens", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    token: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    expiresIn: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
  });

  return Tokens;
};
