var OAuth = require("oauth").OAuth,
    Q = require("q"),
    _ = require("underscore");
var URL = require('url');

function Auth() {
}

Auth.prototype.refreshAuthentication = function(request, reply) {
    var deferred = Q.defer();

    this.getOAuth().refreshOAuthAccessToken(
        request.auth.credentials.token, 
        request.auth.credentials.secret, 
        request.auth.credentials.oauthSessionHandle,
        function(error, oauth_access_token, oauth_access_token_secret, results2) {
            if(error) {
                reply(error);
            }
            else {
                // store the access token in the session
                request.auth.credentials.token = oauth_access_token;
                //request.cookies.accessToken = oauth_access_token;
                request.auth.credentials.secret = oauth_access_token_secret;
                request.auth.credentials.timestamp = new Date();
                // request.session.oauthSessionHandle = results2.oauth_session_handle;
                // request.session.xoauthYahooGuid = results2.xoauth_yahoo_guid;

                deferred.resolve();
            }
    });

    return deferred.promise;
};

Auth.prototype.endAuthentication = function(request, reply) {
    var uri = request.raw.req.url;
    var parsed = URL.parse(uri, true);

    request.auth.credentials.oauth_verifier = parsed.query.oauth_verifier;

    this.getOAuth().getOAuthAccessToken(
        request.auth.credentials.token, 
        request.auth.credentials.secret, 
        request.auth.credentials.oauth_verifier,
        function(error, oauth_access_token, oauth_access_token_secret, results2) {
            if(error) {
                reply(error);
            }
            else {
                // store the access token in the session
                request.auth.credentials.token = oauth_access_token;
                // request.cookies.access_token = oauth_access_token;
                request.auth.credentials.secret = oauth_access_token_secret;
                request.auth.credentials.timestamp = new Date();
                // request.session.oauthSessionHandle = results2.oauth_session_handle;
                // request.session.xoauthYahooGuid = results2.xoauth_yahoo_guid;

                reply.redirect("/");
            }
    });
};

Auth.prototype.beginAuthentication = function(request, reply) {
    var oa = this.getOAuth();

    oa.getOAuthRequestToken(function(error, oauth_token, oauth_token_secret) {
        request.auth.credentials.token = oauth_token;
        request.auth.credentials.secret = oauth_token_secret;

        // TODO: move to some config
        reply.redirect("https://api.login.yahoo.com/oauth/v2/request_auth?oauth_token=" + oauth_token + "&oauth_callback=" + oa._authorize_callback);
    });
};

Auth.prototype.setupMiddleware = function() {
    this.express.use(this.authenticateMiddleware.bind(this));
};

Auth.prototype.isTokenExpired = function(timestamp) {
    return (Math.round(((new Date() - new Date(timestamp)) % 86400000) / 3600000) >= 1);
};

Auth.prototype.getOAuth = function() {
    return new OAuth(
        this.config.accessTokenUrl,
        this.config.requestTokenUrl,
        this.config.oauthKey,
        this.config.oauthSecret,
        this.config.version,
        this.config.callback,
        this.config.encryption
    );
};

exports = module.exports = Auth;