import * as Yup from "yup";

import { Op } from "sequelize";

import Deliveryman from "../models/Deliveryman";
import File from "../models/File";

class DeliverymanController {
  async index(req, res) {
    const { name, page } = req.query;

    const querySchema = Yup.object().shape({
      name: Yup.string(),
      page: Yup.number(),
    });

    if (!(await querySchema.isValid(req.body))) {
      return res.status(400).json({
        error: "Deliveryman name must be a string and page must be a number!",
      });
    }

    const deliverymen = await Deliveryman.findAll({
      where: {
        name: { [Op.iLike]: name ? `${name}%` : `%%` },
      },
      limit: 5,
      offset: ((page || 1) - 1) * 5,
      attributes: ["id", "name", "email"],
      include: [
        {
          model: File,
          as: "avatar",
          attributes: ["path", "url"],
        },
      ],
    });

    const numberOfDeliverymen = await Deliveryman.count({
      where: {
        name: { [Op.iLike]: name ? `${name}%` : `%%` },
      },
    });
    const maxPage = Math.ceil(numberOfDeliverymen / 5);

    return res.json({ deliverymen, maxPage });
  }

  async show(req, res) {
    const schema = Yup.object().shape({
      id: Yup.number().required(),
    });

    if (!(await schema.isValid(req.params))) {
      return res.status(400).json({
        error: "Deliveryman id is required!",
      });
    }

    const { id } = req.params;

    const deliveryman = await Deliveryman.findOne({
      where: { id },
      include: [
        {
          model: File,
          as: "avatar",
          attributes: ["path", "url"],
        },
      ],
    });

    return res.json(deliveryman);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string().required(),
      avatar_id: Yup.number(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: "Invalid inserted data!" });
    }

    const deliveryman = await Deliveryman.create(req.body);

    return res.json(deliveryman);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      id: Yup.number().required(),
      name: Yup.string(),
      email: Yup.string(),
      avatar_id: Yup.number(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: "Invalid inserted data!" });
    }

    const { id } = req.body;

    const deliveryman = await Deliveryman.findByPk(id);

    if (!deliveryman) {
      return res.status(400).json({ error: "Invalid id!" });
    }

    await deliveryman.update(req.body);

    return res.json(deliveryman);
  }

  async delete(req, res) {
    const schema = Yup.object().shape({
      id: Yup.number().required(),
    });

    if (!(await schema.isValid(req.params))) {
      return res.status(400).json({ error: "Id is required!" });
    }

    const { id } = req.params;

    const deliveryman = await Deliveryman.findByPk(id);

    if (!deliveryman) {
      return res.status(400).json({ error: "Invalid id!" });
    }

    await deliveryman.destroy();

    return res.json({ msg: "Delivery man was deleted!" });
  }
}

export default new DeliverymanController();
