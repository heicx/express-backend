define(["jquery", "base", "transition", "dimmer", "modal"], function($, base) {
    $(function() {
        $("#addRegionBtn").on("click", function() {
            $('#regionModal').modal('show');
        });

        $(".region-edit").on("click", function() {
            var params = {
                region_id: $(this).data("regionid")
            }

            base.common.getData(base.api.region, params, false, function(resultData) {
                console.log(resultData);

                $('#regionModal').modal('show');
            }, function(err) {});


        });
    });
});