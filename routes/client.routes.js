const { Router } = require("express");
const { checkAuth } = require("../middlewares/auth.middleware");
const Client = require("../models/Client");
const { check, validationResult } = require("express-validator");

const router = new Router();

router.post(
  "/create",
  [
    check("email", "Սխալ էլեկտրոնային հասցե").isEmail(),
    check("phone", "Լրացրեք հաճախորդի հեռախոսահամարը").exists(),
    check("name", "Լրացրեք հաճախորդի անունը").exists(),
    check("date", "Լրացրեք ամսաթիվը").isDate().exists(),
    check("information", "Լրացրեք հաճախորդի մասին տեղեկություն").exists(),
  ],
  checkAuth,
  async (req, res) => {
    try {
      const { email, phone, name, date, information } = req.body;
      const newClient = new Client({
        email,
        phone,
        name,
        date,
        information,
      });
      await newClient.save();
      return res.status(201).send(newClient);
    } catch (e) {
      res.status(500).send({ message: e.message });
    }
  }
);

module.exports = router;
