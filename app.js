var express = require("express");
var logger = require("morgan");
var path = require("path");
var redis = require("redis");
var cookieParser = require('cookie-parser');
var bodyParser = require("body-parser");
var favicon = require("serve-favicon");
var session = require('express-session');
var RedisStore = require("connect-redis")(session);
var compression = require('compression')

var port = process.env.PORT || 3000;
var app = express();
var models = require('./model/index');

var options = {
     host: "127.0.0.1",
     port: 6379,
     ttl: 10800
}

client = redis.createClient();
client.on("error", function(err) {
    console.log("Error" + err);
});

app.set("views", path.join(__dirname, 'view'));
app.set("view engine", "jade");
app.disable('x-powered-by');
app.use(express.static(path.join(__dirname, "static")));
app.use(favicon(__dirname + "/static/assets/images/favicon.ico"));
app.use(logger("dev"));
app.use(compression());
app.use(cookieParser());
app.use(bodyParser());
app.use(session({
    store: new RedisStore(options),
    secret: 'express is powerful',
    resave: false,
	saveUninitialized: true,
	name: "sessionid"
}));
app.use(function(req, res, next) {
    models(function(err, db) {
        if(err) return next(err);
        req.models = db.models;

        req.db = db;

        return next();
    });
});

/**
 * 路由扩展
 */
var login = require("./routes/login");
var user = require("./routes/user");
var contract = require("./routes/contract");
var invoice = require("./routes/invoice");
var firstParty = require("./routes/firstParty");
var secondParty = require("./routes/secondParty");
var contractType = require("./routes/contractType");
var contractBank = require("./routes/contractBank");
var region = require("./routes/region");
var area = require("./routes/area");
var contractPayment = require("./routes/contractPayment")
var deposit = require("./routes/deposit")

app.use("/", login.routes);
app.use("/user", user);
app.use("/contract", contract);
app.use("/invoice", invoice);
app.use("/dictionary/firstParty", firstParty);
app.use("/dictionary/secondParty", secondParty);
app.use("/dictionary/contractType", contractType);
app.use("/dictionary/contractBank", contractBank);
app.use("/dictionary/region", region);
app.use("/area", area);
app.use("/payment", contractPayment);
app.use("/deposit", deposit);

app.get("*", function(req, res) {
    res.status(404).end("404");
});

app.listen(port);