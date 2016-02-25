var config = require("./config");
var orm = require("orm");
var db = orm.connect(config.connection);
var when = require("when");

var deferred = when.defer();
db.on("connect", function (err, db) {
    if (err) console.log(err);

    deferred.resolve(db);
});

module.exports = deferred.promise;
