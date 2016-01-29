var utils = require("../helper/utils");
var qs = require("querystring");
var when = require("when");

exports.get = function(data) {
	var deferred = when.defer();
	var options = {
		method: "GET",
		path: "/contract/second-party/index"
	};

    oData = qs.stringify(data);
	utils.sendRequest(oData, options, function(response) {
		var chunk = "";

        response.on("data", function(data) {
            chunk += data;
        });

        response.on("end", function() {
            var oChunk = JSON.parse(chunk);

            deferred.resolve(oChunk);
		});
	});

	return deferred.promise;
}