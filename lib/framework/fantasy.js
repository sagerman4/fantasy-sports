var Q = require("q"),
    _ = require("underscore"),
    FantasyRequest = require("./fantasyRequest");

function FantasySports(auth) {
    this.defaults = {
        apiRoot: "http://fantasysports.yahooapis.com/fantasy/v2/"
    };
    this.auth = auth;
}

FantasySports.prototype.options = function(opts) {
    this.config = _.extend(this.defaults, opts);
    this.auth.config = this.config;
};

FantasySports.prototype.startAuth = function(request, reply) {
    this.auth.beginAuthentication(request, reply);
};

FantasySports.prototype.endAuth = function(request, reply) {
    this.auth.endAuthentication(request, reply);
};

FantasySports.prototype.request = function(request, reply) {
    var fantasyRequest = new FantasyRequest(this.auth, request, reply);
    return fantasyRequest;
};

exports = module.exports = FantasySports;
