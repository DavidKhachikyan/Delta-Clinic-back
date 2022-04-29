const { Router } = require("express");
const bcrypt = require("bcryptjs");
const config = require("config");
const jwt = require("jsonwebtoken");
const { check, validationResult } = require("express-validator");
const User = require("../models/User");
const router = Router();

// /api/auth/register

router.post(
  "/register",
  [
    check("email", "Սխալ էլեկտրոնային հասցե").isEmail(),
    check("password", "Պետք է լինի գոնե 6 նիշ").isLength({ min: 6 }),
    check("name", "Լրացրեք ձեր անունը").exists(),
    check("lastName", "Լրացրեք ձեր Ազգանունը").exists(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({
          errors: errors.array(),
          message: "Սխալ տվյալներ գրանցման համար",
        });
      }

      const { email, password, name, lastName } = req.body;

      const candidate = await User.findOne({ email });

      if (candidate) {
        return res
          .status(400)
          .json({ message: "Այս օգտատերը արդեն գրանցված է" });
      }

      const hashedPassword = await bcrypt.hash(password, 12);
      const user = new User({
        email,
        password: hashedPassword,
        name,
        lastName,
      });

      await user.save();

      res.status(201).json({ message: "Օգտագործողը հաստատվեց" });
    } catch (e) {
      console.log(e, "e");
      res.status(500).json({ message: "Ինչ-որ բան այն չէ, նորից փորձեք" });
    }
  }
);

// /api/auth/login
router.post(
  "/login",
  [
    check("email", "Լրացրեք ճիշը էլեկտրոնային հասցե")
      .normalizeEmail()
      .isEmail(),
    check("password", "Լրացրեք գաղտնաբառը").exists(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).send({
          errors: errors.array(),
          message: "Սխալ տվյալներ մուտք գործելու համար",
        });
      }

      const { email, password } = req.body;

      const user = await User.findOne({ email });

      if (!user) {
        return res.status(400).send({ message: "Օգտատերը գրանցված չէ" });
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res
          .status(400)
          .send({ message: "Սխալ գաղտնաբառ, փորձեք նորից" });
      }

      const token = jwt.sign({ userId: user._id }, config.get("jwtSecret"), {
        expiresIn: "1h",
      });

      res.send({ token, userId: user.id });
    } catch (e) {
      console.log(e);
      res.status(500).send({ message: "Ինչ-որ բան այն չէ, նորից փորձեք" });
    }
  }
);

module.exports = router;
