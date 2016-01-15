var Q = require("q");

function FantasyRequest(auth, request, reply) {
    this.auth = auth;
    this.request = request;
    this.reply = reply;
}

FantasyRequest.prototype.isAuthenticated = function() {
    return !!this.request.auth.credentials.token;
};

FantasyRequest.prototype.api = function(url, type, data) {
    var deferred = Q.defer();

    if (!this.request.auth.credentials.token) {
        throw new Error("No access token");
    }

    if (arguments.length === 2) {
        data = type;
        type = "POST";
    }

    if (this.auth.isTokenExpired(this.request.auth.credentials.timestamp)) {
        this.auth.refreshAuthentication(this.request, this.reply)
            .done(function() {
                this._request(deferred, url, type, data);            
            }.bind(this));
    }
    else {
        this._request(deferred, url, type, data);
    }

    return deferred.promise;
};

FantasyRequest.prototype._request = function(deferred, url, type, data) {
    var oauth = this.auth.getOAuth();
    
    switch (type) {
        case "POST":
        case "PUT":
            oauth[type.toLowerCase()](url,
                this.request.auth.credentials.token,
                this.request.auth.credentials.secret,
                data,
                "application/xml",
                function(err, data) {
                    var json = typeof data === "string" ? JSON.parse(data) : data;

                    if (err) {
                        return deferred.reject(err);
                    }

                    deferred.resolve(json);
                });
            break;
        default: 
            oauth.getProtectedResource(
                url,
                "GET",
                this.request.auth.credentials.token,
                this.request.auth.credentials.secret,
                function(err, data) {
                    var json = typeof data === "string" ? JSON.parse(data) : data;

                    if (err) {
                        return deferred.reject(err);
                    }

                    deferred.resolve(json);
                });
    }
    
};

exports = module.exports = FantasyRequest;