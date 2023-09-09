const sha1 = require('sha1');
const { dbClient, ObjectId } = require('../utils/db');
const redisClient = require('../utils/redis');

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

  static async getMe(req, res) {
    try {
      const token = req.headers['x-token'];
      if (!token) return res.status(401).send({ error: 'Unauthorized' });

      const userId = await redisClient.get(`auth_${token}`);
      if (!userId) return res.status(401).send({ error: 'Unauthorized' });

      const userCollection = await dbClient.usersCollection();
      const user = await userCollection
        .findOne({ _id: new ObjectId(userId) }, { projection: { password: 0 } });

      if (!user) return res.status(401).send({ error: 'Unauthorized' });

      return res.status(200).send(user);
    } catch (error) {
      console.log(error);
      return res.status(500).send({ error: 'An error has occurred' });
    }
  }
}

module.exports = UsersController;
