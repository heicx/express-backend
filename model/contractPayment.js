var when = require("when");
module.exports = function(orm, db) {
    var Payment = db.define("contract_payment", {
        id: {type: 'serial', key: true},
        bank_id: Number,
        payment: String,
        payment_time: {type: 'date', defaultValue: new Date()},
        user_id: Number
    });

    Payment.getList = function(params) {
        var deferred = when.defer();
        var sql = "select * from contract_payment a join contract_bank b on a.bank_id=b.id join contract_user c on a.user_id=c.id";
        db.driver.execQuery(sql, function(err, list) {
            console.log(list);
            if (!err)
                deferred.resolve(list);
            else
                deferred.reject(err);
        });
        return deferred.promise;
    }
};
