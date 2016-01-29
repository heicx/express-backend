define(["jquery", "transition", "dimmer", "modal"], function($) {
	$(function() {
		$("#addUserBtn").on("click", function() {
			$('#regUserModal').modal('show');
		});
	});
});