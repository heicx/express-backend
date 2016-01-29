define(["jquery", "jquery-ui"], function($) {
	$(function() {
		$("#beginTime").datepicker({
			showButtonPanel: true,
			dateFormat: "yy-mm-dd"
		});

		$("#queryBtn").on("click", function() {
			var contract_number = $("#contractNumber").val();

			$.get("/contract/list", {async: true, contract_number: contract_number}, function(data) {
				console.log(data);
			});
		});
	});
});