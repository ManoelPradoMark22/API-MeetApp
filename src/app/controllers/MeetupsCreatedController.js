import Meetup from '../models/Meetup';

class MeetupsCreatedController {
  async index(req, res) {
    const meetups = await Meetup.findAll({
      where: { user_id: req.userId },
      order: ['date'], // ordenar por ordem crescente
    });

    return res.json(meetups);
  }
}

export default new MeetupsCreatedController();
