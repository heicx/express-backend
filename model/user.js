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
	})

	User.getUser = function(params, callback) {
		User.find({user_name: params.name, user_password: params.password}, function(err, userData) {
			callback(err, userData);
		})
	}
}