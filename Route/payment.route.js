var express = require('express');
var router = express.Router();
var controller = require('../Controller/payment.controller');

router.post("/create_payment_url", controller.createPayment);
router.post("/create_payment_momo",controller.createPaymentMomo);
router.post("/question",controller.question);

module.exports = router;