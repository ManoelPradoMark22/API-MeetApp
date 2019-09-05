import * as Yup from 'yup';
import { Op } from 'sequelize';
import { isBefore, startOfDay, endOfDay, parseISO } from 'date-fns';
import Meetup from '../models/Meetup';
import User from '../models/User';

class MeetupController {
  async index(req, res) {
    const where = {};
    const page = req.query.page || 1;

    if (req.query.date) {
      const searchDate = parseISO(req.query.date);

      where.date = {
        [Op.between]: [startOfDay(searchDate), endOfDay(searchDate)],
      };
    }

    const meetups = await Meetup.findAll({
      where,
      order: ['date'], // ordenar por ordem crescente
      include: [
        {
          model: User,
          attributes: ['name', 'email'], // filtrando as informações
        },
      ],
      limit: 10,
      offset: 10 * page - 10,
    });

    return res.json(meetups);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string().required(),
      file_id: Yup.number().required(),
      description: Yup.string().required(),
      location: Yup.string().required(),
      date: Yup.date().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    if (isBefore(parseISO(req.body.date), new Date())) {
      return res.status(400).json({ error: 'This date has passed' });
    }

    const user_id = req.userId;

    const meetup = await Meetup.create({
      ...req.body,
      user_id,
    });

    return res.json(meetup);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string(),
      file_id: Yup.number(),
      date: Yup.date(),
      description: Yup.string(),
      location: Yup.string(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const user_id = req.userId;

    const meetup = await Meetup.findByPk(req.params.id);

    if (meetup.user_id !== user_id) {
      return res
        .status(401)
        .json({ error: 'Only the creator can update the meetup' });
    }

    if (isBefore(parseISO(req.body.date), new Date())) {
      return res.status(400).json({ error: 'Only dates not passed' });
    }

    if (meetup.past) {
      return res.status(400).json({ error: 'Past meetups cannot be updated' });
    }

    /* Acréscimo da condicao de só poder atualizar 4 hrs antes do meetup
    começar */
    if (!meetup.cancelable) {
      return res.status(401).json({
        error: 'You can only update meetups 4 hours in advance.',
      });
    }

    await meetup.update(req.body);

    return res.json(meetup);
  }

  async delete(req, res) {
    const user_id = req.userId;

    const meetup = await Meetup.findByPk(req.params.id);

    if (meetup.user_id !== user_id) {
      return res
        .status(401)
        .json({ error: 'Only the creator can delete the meetup' });
    }

    if (meetup.past) {
      return res.status(400).json({ error: 'Past meetups cannot be deleted' });
    }

    /* Acréscimo da condicao de só poder deletar 4 hrs antes do meetup
    começar */
    if (!meetup.cancelable) {
      return res.status(401).json({
        error: 'You can only cancel meetups 4 hours in advance.',
      });
    }

    await meetup.destroy();

    return res.send();
  }
}

export default new MeetupController();
