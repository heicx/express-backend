var when = require("when");
var moment = require("moment");
var utils = require("../helper/utils");

module.exports = function(orm, db) {
	var User = db.define("contract_user", {
		id: {type: "serial", key: true},
		user_name: String,
		user_password: String,
		user_mobileNo: String,
		user_type: Number,
		user_status: {type: "integer", defaultValue: 1},
		user_email: String,
		create_time: {type: "date", defaultValue: new Date()},
		update_time: {type: "date", defaultValue: new Date()}
	});


    /**
     * 用户查重
     * @param params
     */
    User.findUserIsExist = function (params) {
        var def = when.defer();

        User.find({user_name: params.user_name}, function(err, user) {
            if(!err)
                if(user.length > 0) {
                    def.reject("用户已存在哦");
                }else {
                    def.resolve(user);
                }
            else
                def.reject("用户查重失败");
        });

        return def.promise;
    }

    /**
     * 获取用户
     * @param params
     * @returns {promise}
     */
    User.getUser = function(params) {
        var def = when.defer();
        var strCondition  = "", arrArgs = [];
        var sql;
        var arrOutput = {
            user_type: {
                keyword: "<>"
            },
            user_name: {
                keyword: "like",
                sign: ["%", "%"]
            }
        }

        utils.ormFilter(params, arrOutput, function(str, arr) {
            strCondition = str ? " where " + str : "";
            arrArgs = arr;
        });

        sql = "select id, user_name, user_type, user_email, DATE_FORMAT(create_time, '%Y-%m-%d') as create_time from contract_user " + strCondition;

        db.driver.execQuery(sql, arrArgs, function(err, users) {
            if(!err)
                def.resolve(users);
            else
                def.reject("获取用户列表失败");
        });

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

    /**
     * 添加用户
     * @param params
     * @returns {promise}
     */
    User.addUser = function(params) {
        var def = when.defer();

        User.create(params, function(err, user) {
            if(user) {
                user.create_time = moment(user.create_time).format("L");

                def.resolve(user);
            }else
                def.reject("用户添加失败");
        });

        return def.promise;
    }
    
    
    /**
     * 修改密码
     * @param params
     * @returns {promise}
     */
    User.modifyUserPass =function(params){ 
        var def = when.defer();
        
        User.find({
            user_name: params.user_name
        }, function (err, user) {
            if (!err) {
                user[0].user_password = params.user_password;

                user[0].save(function (err) {
                    if (!err){
                        def.resolve("修改成功");
                    }
                    else
                        def.reject("修改密码失败");
                });
            } else {
                def.reject("用户不存在");
            }
        });

        return def.promise;
        
    }
    
    
    /**
     * 通过用户名密码返回旧密码输入是否正确
     * @param params
     * @returns {promise}
     */
	User.getUserValid = function (params) {
	    var def = when.defer();

	    User.find({
	        user_name: params.user_name,
	        user_password: params.user_password_old
	    }, function (err, user) {
	        if (!err) {
                if(user.length>0){ 
                    def.resolve();
                }else{ 
                    def.reject("旧密码输入错误");
                }
	        } else {
	            def.reject("获取用户信息失败");
	        }
	    })

	    return def.promise;
	}
    
    
    
}