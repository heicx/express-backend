var when = require("when");

module.exports = function(orm, db) {
	var User = db.define("contract_user", {
		id: {type: "serial", key: true},
		user_name: String,
		user_password: String,
		user_mobileNo: String,
		user_type: Number,
		user_status: Number,
		user_email: String,
		create_time: Date,
		update_time: Date
	});

    /**
     * 获取用户列表
     * @param params
     * @returns {promise}
     */
    User.getAllUser = function(userType) {
        var def = when.defer();

        User.find({user_type: orm.ne(userType)}, function(err, userData) {
            if(!err)
                def.resolve(userData);
            else
                def.reject("获取用户列表失败");
        })

        return def.promise;
    }

    /**
     * 通过用户名密码获取用户信息
     * @param params
     * @returns {promise}
     */
	User.getUserByParams = function(params) {
        var def = when.defer();

		User.find({user_name: params.name, user_password: params.password}, function(err, userData) {
            if(!err)
                def.resolve(userData);
            else
                def.reject("获取用户信息失败");
		})

        return def.promise;
	}
}