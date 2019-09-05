import Mail from '../../lib/Mail';

class SubscriptionMail {
  get key() {
    return 'SubscriptionMail';
  }

  async handle({ data }) {
    const { meetup, user } = data;

    await Mail.sendMail({
      to: `${meetup.User.name} <${meetup.User.email}>`,
      subject: `Novo Inscrito no Meetup: ${meetup.title}`,
      template: 'subscription',
      context: {
        creator: meetup.User.name,
        meetup: meetup.title,
        user: user.name,
        email: user.email,
      },
    });
  }
}

export default new SubscriptionMail();
