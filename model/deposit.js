var when = require("when");
var moment = require("moment");

module.exports = function(orm, db) {
    db.defineType("ftime", {
        valueToProperty: function(value, prop) {
            return moment(value).format("YYYY-MM-DD")
        }
    });
	var Deposit = db.define("contract_deposit_deduct", {
		id: {type: "serial", key: true},
		deduct_type: Number,
        deduct_price: String,
        effective_time: {type: "ftime"},
        contract_number: String,
        create_time: {type: "ftime", defaultValue: moment().format("YYYY-MM-DD")}
	});

    /**
     * 获取扣除保证金记录
     * @param params
     */
    Deposit.getDepositList = function(params) {
        var def = when.defer();

        Deposit.find({contract_number: params.contract_number}, function(err, list) {
            if(!err)
                def.resolve(list);
            else
                def.reject("获取扣除保证金记录失败");
        });

        return def.promise;
    }

    /**
     * 添加扣除保证金记录
     * @param params
     */
    Deposit.addRecord = function(params) {
        var def = when.defer();

        Deposit.create(params, function(err, item) {
            if(!err)
                def.resolve(item);
            else
                def.reject("扣除保证金记录失败");
        });

        return def.promise;
    }
}