require(["jquery", "dropdown", "transition"], function($) {
	$(function() {
		$('.ui.menu .ui.dropdown').dropdown({
            on: 'click'
        });
        
        $('.ui.menu a.item').on('click', function() {
            $(this).addClass('active').siblings().removeClass('active');
        });
	})
})