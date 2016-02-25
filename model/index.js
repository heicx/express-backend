var config = require("../helper/config");
var orm = require("orm");
var connection = null;

var setup = function(db, cb) {
    require("./user")(orm, db);
    require("./contractInfo")(orm, db);
    require("./contractInvoice")(orm, db);
    require("./contractPayment")(orm, db);
    require("./firstParty")(orm, db);
    require("./secondParty")(orm, db);
    require("./contractType")(orm, db);
    require("./contractBank")(orm, db);
    require("./region")(orm, db);
    require("./area")(orm, db);
    require("./regionArea")(orm, db);

    return cb(null, db);
}

module.exports = function(cb) {
    if(connection) return cb(null, connection);

    orm.connect(config.database, function(err, db) {
        if(err) return cb(err);

        connection = db;
        db.settings.set('instance.returnAllErrors', true);
        db.settings.set("connection.reconnect", true);
        db.settings.set("connection.pool", true);

        setup(db, cb);
    });
}
