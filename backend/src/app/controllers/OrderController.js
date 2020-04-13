import * as Yup from "yup";

import { Op } from "sequelize";

import Order from "../models/Order";
import File from "../models/File";
import Recipient from "../models/Recipient";
import Deliveryman from "../models/Deliveryman";
import Queue from "../../lib/Queue";
import OrderCreatedMail from "../jobs/OrderCreatedMail";

class DeliverymanController {
  async index(req, res) {
    const { product, page } = req.query;

    const querySchema = Yup.object().shape({
      product: Yup.string(),
      page: Yup.number(),
    });

    if (!(await querySchema.isValid(req.body))) {
      return res.status(400).json({
        error: "Product name must be a string and page must be a number!",
      });
    }

    const orders = await Order.findAll({
      where: {
        product: { [Op.iLike]: product ? `${product}%` : `%%` },
      },
      limit: 5,
      offset: ((page || 1) - 1) * 5,
      attributes: ["id", "product", "canceled_at", "start_date", "end_date"],
      include: [
        {
          model: File,
          as: "signature",
          attributes: ["url", "path"],
        },
        {
          model: Deliveryman,
          as: "deliveryman",
          attributes: ["id", "name"],
        },
        {
          model: Recipient,
          as: "recipient",
          attributes: [
            "id",
            "name",
            "street",
            "number",
            "additional_address",
            "state",
            "city",
            "zip_code",
          ],
        },
      ],
    });

    const numberOfOrders = await Order.count({
      where: {
        product: { [Op.iLike]: product ? `${product}%` : `%%` },
      },
    });
    const maxPage = Math.ceil(numberOfOrders / 5);

    return res.json({ orders, maxPage });
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      recipient_id: Yup.number().required(),
      deliveryman_id: Yup.number().required(),
      product: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: "Invalid inserted data!" });
    }

    const order = await Order.create(req.body);

    const { deliveryman, recipient } = req;

    await Queue.add(OrderCreatedMail.key, {
      deliveryman,
      order,
      recipient,
      product: req.body.product,
    });

    return res.json(order);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      id: Yup.number().required(),
      recipient_id: Yup.number(),
      deliveryman_id: Yup.number(),
      product: Yup.string(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: "Invalid inserted data!" });
    }

    const { id } = req.body;

    const order = await Order.findByPk(id);

    if (!order) {
      return res.status(400).json({ error: "Invalid id!" });
    }

    await order.update(req.body);

    return res.json(order);
  }

  async delete(req, res) {
    const schema = Yup.object().shape({
      id: Yup.number().required(),
    });

    if (!(await schema.isValid(req.params))) {
      return res.status(400).json({ error: "Id is required!" });
    }

    const { id } = req.params;

    const order = await Order.findByPk(id);

    if (!order) {
      return res.status(400).json({ error: "Invalid id!" });
    }

    await order.destroy();

    return res.json({ msg: "Order was deleted!" });
  }
}

export default new DeliverymanController();
