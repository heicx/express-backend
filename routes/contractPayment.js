var express = require("express");
var router = express.Router();
var login = require('./login');

var fetchContractPaymentList = function (req, res, next) {
    var params = {
        'bank_id': req.body.brand_id
    };
    var payment = req.models.contract_payment;
    var async = req.query.async || false;
    payment.getList(params, function (err, item) {
        if (async) {
            res.json({status: true, data: item});
        } else {
            res.render("payment/list", {list: list});
        }
    });
}

router.use(login.islogin);

router.get("/list", fetchContractPaymentList);
module.exports = router;