var express = require("express");
var logger = require("morgan");
var path = require("path");
var redis = require("redis");
var cookieParser = require('cookie-parser');
var bodyParser = require("body-parser");
var favicon = require("serve-favicon");
var session = require('express-session');
var RedisStore = require("connect-redis")(session);

var port = process.env.PORT || 3000;
var app = express();
var options = {
     host: "127.0.0.1",
     port: 6379
}

client = redis.createClient();
client.on("error", function(err) {
    console.log("Error" + err);
});

app.set("views", "./view/");
app.set("view engine", "jade");
app.use(express.static(path.join(__dirname, "static")));
app.use(favicon(__dirname + "/static/assets/images/favicon.ico"));
app.use(logger("dev"));
app.use(cookieParser());
app.use(bodyParser());
app.use(session({
    store: new RedisStore(options),
    secret: 'express is powerful',
    resave: false,
	saveUninitialized: true,
	name: "sessionid"
}));

/**
 * 路由扩展
 */
var login = require("./routes/login");
var user = require("./routes/user");
var contract = require("./routes/contract");
var dictionary = require("./routes/dictionary");

/**
 * 首页定位
 */
app.get("/", login.isLogin, function(req, res, next) {
    res.redirect("/contract/list");
});

app.use("/", login.routes);

/**
 * 合同管理
 */
app.get("/contract/list", login.isLogin, contract.fetchContractList);

app.post("/contract/list", login.isLogin, contract.fetchContractList);

app.get("/receive/list", login.isLogin, function(req, res, next) {
    res.render("contract/receiveList",  {userinfo: req.session.userinfo});
});

app.get("/invoice/list", login.isLogin, function(req, res, next) {
    res.render("contract/invoiceList",  {userinfo: req.session.userinfo});
});

/**
 * 用户管理
 */
app.get("/user/list", login.isLogin, user.fetchUserList);

app.get("/user/modify", login.isLogin, function(req, res, next) {
    res.render("user/modifyPassword", {userinfo: req.session.userinfo});
});

/**
 * 字典管理
 */
app.get("/dictionary/firstParty/list", login.isLogin, dictionary.fetchFirstPartyList);

app.get("/dictionary/secondParty/list", login.isLogin, dictionary.fetchSecondPartyList);

app.get("/dictionary/contractType/list", login.isLogin, dictionary.fetchFirstPartyList);

/**
 * 登陆
 */
app.get("/login", function(req, res, next) {
    if(!req.session || !req.session.userinfo) {
        res.render("login");
    }else {
        res.redirect("/contract/list");
    }
});

app.post("/login", login.checkUser);

app.get("*", function(req, res, next) {
    next("404");
})

app.listen(port);