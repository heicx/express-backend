define(["jquery", "jquery-ui", "base", "transition", "dimmer", "modal", "popup"], function($, ui, base) {
	$(function() {

        /**
         * 条件查询
         */
        $("#queryBtn").on("click", function() {
            var params = {
                user_name: $("#userFullName").val(),
                user_email: $("#userEMail").val(),
                second_party_name: $("#userPassword").val()
            }

            $("#listLoader").addClass("active");
            base.common.getData(base.api.contractList, params, false, function(resultData) {
                render.contractList(resultData.list, function(str) {
                    $("#contractList").html(str);
                });

                render.footerPagination(resultData.pagination, function(str) {
                    $("#paginationBtn").html(str);
                });

                $("#listLoader").removeClass("active");
            }, function(err) {})
        });

        /**
         * 打开添加用户弹窗
         */
        $("#addUserBtn").on("click", function() {
            $('#regUserModal').modal("setting", "transition", "fade down").modal("show");
        });
	});
});