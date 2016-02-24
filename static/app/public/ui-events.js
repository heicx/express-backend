require(["jquery", "dropdown", "transition", "sortable", "tab"], function($) {
	$(function() {
		$(".ui.menu .ui.dropdown").dropdown({
            on: "click"
        });
        
        $(".ui.menu a.item").on("click", function() {
            $(this).addClass("active").siblings().removeClass("active");
        });

        $(".tabular.menu .item").tab();

        $("select.dropdown").dropdown();

        $('table.sortable').tablesort();
	})
})