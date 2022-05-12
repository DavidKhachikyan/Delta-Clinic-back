const { Router } = require("express");
const { checkAuth } = require("../middlewares/auth.middleware");
const Client = require("../models/Client");
const { check, validationResult } = require("express-validator");
const ClientData = require("../models/ClientData");

const router = new Router();

router.post(
  "/create",
  [
    check("email", "Սխալ էլեկտրոնային հասցե").isEmail(),
    check("phone", "Լրացրեք հաճախորդի հեռախոսահամարը").exists(),
    check("name", "Լրացրեք հաճախորդի անունը").exists(),
    check("date", "Լրացրեք ամսաթիվը").isDate().exists(),
    // check("information", "Լրացրեք հաճախորդի մասին տեղեկություն").exists(),
  ],
  checkAuth,
  async (req, res) => {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({
          errors: errors.array(),
          message: "Սխալ տվյալներ գրանցման համար",
        });
      }

      const { email, phone, name, date } = req.body;
      const newClient = new Client({
        doctorId: req.user.id,
        email,
        phone,
        name,
        date,
        // information,
      });
      await newClient.save();
      return res.status(201).send(newClient);
    } catch (e) {
      res.status(500).send({ message: "Ինչ-որ բան այն չէ, նորից փորձեք" });
    }
  }
);

router.get("/", checkAuth, async (req, res) => {
  const clients = await Client.find({ doctorId: req.user.id });
  return res.status(200).send(clients);
});

router.patch(
  "/data",
  checkAuth,
  [check("userId", "Սխալ հաճախորդի տվյալ").exists()],
  async (req, res) => {
    try {
      let existingData = await ClientData.findOne({ userId: req.body.userId });
      if (!existingData) {
        existingData = await ClientData.create(req.body);
        return res.status(201).send(existingData);
      }
      const updateData = { ...req.body };
      delete updateData.userId;
      Object.assign(existingData, updateData);
      await existingData.save();
      return res.status(200).send(existingData);
    } catch (e) {
      return res.status(500).send({ error: e.message });
    }
  }
);

router.get("/data/:userId", checkAuth, async (req, res) => {
  try {
    const userId = req.params.userId;
    const userData = await ClientData.findOne({ userId });
    if (!userData) {
      return res.status(200).send({});
    }
    return res.status(200).send(userData);
  } catch (e) {
    return res.status(500).send({ error: e.message });
  }
});

module.exports = router;
