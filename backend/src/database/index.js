import Sequelize from "sequelize";

import User from "../app/models/User";
import File from "../app/models/File";
import Recipient from "../app/models/Recipient";
import Deliveryman from "../app/models/Deliveryman";
import Order from "../app/models/Order";
import DeliveryProblem from "../app/models/DeliveryProblem";

import databaseConfig from "../config/database";

const models = [User, Recipient, Deliveryman, File, Order, DeliveryProblem];

class Database {
  constructor() {
    this.init();
  }

  init() {
    this.connection = new Sequelize(databaseConfig);

    models.map(model => model.init(this.connection));

    models.map(
      model => model.associate && model.associate(this.connection.models)
    );
  }
}

export default new Database();
