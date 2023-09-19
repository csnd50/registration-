const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const secertkey = process.env.SECERT_KEY;
class registration {
  static async signUp(req, res) {
    const { name, email, password } = req.body;

    try {
      const user = await prisma.user.findUnique({
        where: {
          email: email,
        },
      });

      if (user) {
        return res.status(400).json({ message: "User already exists" });
      }
      const hashPassword = await bcrypt.hash(password, 10);
      const newUser = await prisma.user.create({
        data: {
          name: name,
          email: email,
          password: hashPassword,
        },
      });
      const token = jwt.sign(
        {
          userId: newUser.id,
        },
        secertkey,
        {
          expiresIn: "7d",
        }
      );
      return res.status(201).json({
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        token: token,
      });
    } catch (error) {
      console.error("Error creating user:", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }
  static async signIn(req, res) {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({
      where: { email },
    });
    if (!user) {
      return res.status(404).json({ Message: "invalid email" });
    }
    const comparePassword = await bcrypt.compare(password, user.password);
    if (!comparePassword) {
      return res.status(400).json({ Message: "Invalid password" });
    }
    const token = jwt.sign(
      {
        userId: user.id,
      },
      secertkey,
      { expiresIn: "7d" }
    );
    return res
      .status(201)
      .json({ Message: "signIn successfully", token: token });
  }

  static async verifyToken(req, res, next) {
    const tokens= req.headers.authorization;
    if (!tokens) {
      return res
        .status(400)
        .json({ message: "please put the token in the headers as Bearer" });
    }
    if (tokens) {
      const [bearer, token] = tokens.split(" ");
      try {
        const payload = jwt.verify(token, secertkey);
        req.payload = payload;
        return next();
      } catch (error) {
        return res.status(400).json({ message: "Invalid token" });
      }
    }

    return res.status(400).json({ message: "Unauthorized" });
  }

}
module.exports = {
  registration,
};
