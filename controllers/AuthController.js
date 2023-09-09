const { v4: uuidv4 } = require('uuid');
const sha1 = require('sha1');
const dbClient = require('../utils/db');
const redisClient = require('../utils/redis');

class AuthController {
  static async getConnect(req, res) {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) return res.status(400).send({ error: 'Unauthorized' });
      const [email, password] = Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');
      const user = await (await dbClient.usersCollection())
        .findOne({ email, password: sha1(password) });
      if (!user) return res.status(400).send({ error: 'Unauthorized' });
      const token = uuidv4();
      await redisClient.set(`auth_${token}`, user._id.toString(), 86400);
      return res.status(200).send({ token });
    } catch (error) {
      console.log(error);
      return res.status(500).send({ error: 'An error has occurred' });
    }
  }

  static async getDisconnect(req, res) {
    try {
      const token = req.headers['x-token'];
      if (!token) return res.status(401).send({ error: 'Unauthorized' });

      const userId = await redisClient.get(`auth_${token}`);
      if (!userId) return res.status(401).send({ error: 'Unauthorized' });

      await redisClient.del(`auth_${token}`);
      return res.status(204).send();
    } catch (error) {
      console.log(error);
      return res.status(500).send({ error: 'An error has occurred' });
    }
  }
}

module.exports = AuthController;
