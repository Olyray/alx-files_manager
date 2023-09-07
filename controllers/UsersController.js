const sha1 = require('sha1');
const dbClient = require('../utils/db');

class UsersController {
  static async postNew(req, res) {
    const { email, password } = req.body;
    if (!email) {
      return res.status(400).send({ error: 'Missing email ' });
    }
    if (!password) {
      return res.status(400).send({ error: 'Missing password' });
    }
    try {
      const user = await (await dbClient.usersCollection()).findOne({ email });
      if (user) {
        return res.status(400).send({ error: 'Already exist ' });
      }
      console.log('User doesnt exist. About to create new user');
      const newUser = await (await dbClient.usersCollection())
        .insertOne({ email, password: sha1(password) });
      console.log(newUser);
      return res.status(201).send({
        email: newUser.ops[0].email,
        id: newUser.ops[0]._id,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).send({ error: 'An error has occured' });
    }
  }
}

module.exports = UsersController;
