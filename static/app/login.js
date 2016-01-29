define(["jquery"], function ($) {
    $(function () {
        $("#loginBtn").on("click", function () {
            var name = $("#userName").val();
            var password = $("#userPwd").val();

            if(name.length === 0) {
                $("#formMsg .header").html("请输入您的用户名");
                $("#formMsg").removeClass("hidden").addClass("visible");
            }else if(password.length === 0) {
                $("#formMsg .header").html("请输入您的密码");
                $("#formMsg").removeClass("hidden").addClass("visible");
            }else {
                $(".login-form form").submit();
            }
        });

        $("#userName, #userPwd").keydown(function() {
            $("#formMsg").removeClass("visible").addClass("hidden");
        });
    });
});
