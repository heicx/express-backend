define(["jquery", "jquery-ui", "base", "md5", "transition", "dimmer", "modal", "popup"], function($, ui, base, md5) {
	$(function() {
        render = {
            userList: function(list, cb) {
                var i = 0, strJoin = "", strUserType = "";

                if(list) {
                    if(!(list instanceof Array)) {
                        list = [list];
                    }

                    for(; i < list.length; i++) {
                        if(list[i].user_type == 2) {
                            strUserType = "大客户";
                        }else if(list[i].user_type == 3) {
                            strUserType = "渠道";
                        }

                        strJoin += "<tr class='center aligned'>"
                            + "<td>" + list[i].user_name + "</td>"
                            + "<td>" + strUserType + "</td>"
                            + "<td>" + list[i].user_email + "</td>"
                            + "<td>" + (list[i].create_time ? list[i].create_time : '暂无' ) + "</td></tr>";
                    }
                }

                cb(strJoin);
            },
            modalMsg: function(msg) {       /** 控制弹出层的提示信息的显示与隐藏 **/
                var _msg = msg || "";

                $("#modalMsgTips").html(_msg);

                if(_msg === "") {
                    $("#modalMsg").removeClass("hidden").transition("fade");
                }else {
                    $("#modalMsg").closest(".hidden").transition("fade");
                }
            }
        }

        var validate = {
            userName: function(name) {
                if(name === "")
                    return {status: false, message: "请输入用户名称"};
                else
                    return {status: true};
            },
            userEMail: function(email) {
                if(email === "" || email.match(/^.+\@.+\..+?$/g) === null)
                    return {status: false, message: "请输入正确的邮箱地址"};
                else
                    return {status: true};
            },
            userPassword: function(pwd) {
                if(pwd === "") {
                    return {status: false, message: "请输入用户密码"};
                }else if(pwd.length < 6) {
                    return {status: false, message: "用户密码至少6位"};
                }else
                    return {status: true};
            }
        }

        /**
         * 条件查询
         */
        $("#queryBtn").on("click", function() {
            var params = {
                user_name: $("#userName").val()
            }

            $("#listLoader").addClass("active");
            base.common.getData(base.api.userList, params, false, function(result) {
                render.userList(result.data, function(str) {
                    $("#userList").html(str);
                });

                $("#listLoader").removeClass("active");
            }, function(err) {})
        });

        /**
         * 添加用户
         */
        $("#confirmUserBtn").on("click", function() {
            var errMsg = "";
            var arrValidateItem = [];
            var params = {
                user_name: $("#userFullName").val(),
                user_email: $("#userEMail").val(),
                user_password: $("#userPassword").val(),
                user_type: $("#membersType input[name='member']:checked").val()
            };

            arrValidateItem.push(validate.userName(params.user_name));
            arrValidateItem.push(validate.userEMail(params.user_email));
            arrValidateItem.push(validate.userPassword(params.user_password));

            for(var i in arrValidateItem){
                if(arrValidateItem[i].status === false) {
                    errMsg = arrValidateItem[i].message;
                    break;
                }
            }

            if(errMsg === "") {
                $("#listLoader").addClass("active");
                params.user_password = md5(params.user_password).toString();
                base.common.postData(base.api.addUser, params, false, function(ret) {
                    if(ret.status) {
                        render.userList(ret.data, function(str) {
                            $("#userList").prepend(str);
                            $('#regUserModal').modal("setting", "transition", "fade down").modal("hide");
                        });
                    }else {
                        render.modalMsg(ret.message);
                    }

                    $("#listLoader").removeClass("active");
                }, function() {});
            }else {
                render.modalMsg(errMsg);
            }
        });

        /**
         * 打开添加用户弹窗
         */
        $("#addUserBtn").on("click", function() {
            $('#regUserModal').modal("setting", "transition", "fade down").modal("show");
        });
	});
});