const jsforce = require('jsforce');
const userDomain = require('./domain/userDomain');

let oauth2;

let auth = {
    setOAuthInfo(clientId, clientSecret, loginCallback) {
        oauth2 = new jsforce.OAuth2({
            loginUrl : 'https://login.salesforce.com',
            clientId : clientId,
            clientSecret: clientSecret,
            redirectUri : loginCallback
        });
    },
    getConnection(req) {
        let authInfo = req.session.authInfo;
        let conn = new jsforce.Connection({
            logLevel: 'DEBUG',
            oauth2: oauth2,
            instanceUrl : authInfo.instanceUrl,
            accessToken : authInfo.accessToken,
            refreshToken : authInfo.refreshToken
        });
        conn.on("refresh", function(accessToken, res) {
            console.log('Refresh handler received accessToken: ' + accessToken);
            let authInfo = req.session.authInfo;
            authInfo.accessToken = accessToken
            req.session.authInfo = authInfo;
        });

        return conn;
    },
    async getUserInfo(req) {
        let authInfo = req.session.authInfo;
        let userInfo = req.session.userInfo;
        let info = {
            loggedIn: false,
            username: null
        };

        console.log('Auth Info: ' + JSON.stringify(authInfo));
        console.log('User Info: ' + JSON.stringify(userInfo));

        if (authInfo != null && userInfo != null) {

            // patch for users logged in, but score not stored in session
            if (userInfo.points == null) {
                let userRecord = await userDomain.createOrGetUserRecord(userInfo.username, userInfo.userEmail);
                let percentileRank = await userDomain.getPercentileValueForPoints(userRecord.points);
                userInfo.points = userRecord.points;
                userInfo.rank = percentileRank;
                req.session.userInfo = userInfo;
            }

            info.loggedIn = true;
            info.username = authInfo.username;
            info.userDisplayName = userInfo.userDisplayName;
            info.points = userInfo.points;
            info.rank = userInfo.rank;
            info.instanceUrl = authInfo.instanceUrl;
        }

        return info;
    },
    getDbUserId(req) {
        if (req.session && req.session.userInfo && req.session.userInfo.dbId) {
            return req.session.userInfo.dbId;
        }
        return null;
    },
    getLoginUrl(state) {
        return oauth2.getAuthorizationUrl({ 
            scope : 'api refresh_token',
            state: state
        });
    },
    loginCallback(req, res) {
        return new Promise(function (resolve, reject) {
            console.log('=== LOGIN CALLBACK START ===');
            console.log('Query params:', req.query);
            console.log('Body params:', req.body);
            
            var conn = new jsforce.Connection({ oauth2 : oauth2 });
            var code = req.param('code');
            var error = req.param('error');
            var errorDescription = req.param('error_description');
            var path = req.param('state');
            
            console.log('Authorization code:', code);
            console.log('Error:', error);
            console.log('Error description:', errorDescription);
            console.log('State (redirect path):', path);
            
            if (error) {
                console.log('OAuth error received:', error, errorDescription);
                reject({ error: error, description: errorDescription });
                return;
            }
            
            if (!code) {
                console.log('No authorization code received');
                reject({ error: 'no_code', description: 'Authorization code missing' });
                return;
            }
            
            if (path !== null && path !== undefined) {
                path = decodeURIComponent(path);
            }
            
            console.log('Attempting to authorize with code...');
            conn.authorize(code)
            .then(function(userInfo) {
                console.log('Authorization successful!');
                console.log('User Info from authorize:', userInfo);
                console.log('Access Token received:', conn.accessToken ? 'YES' : 'NO');
                console.log('Instance URL:', conn.instanceUrl);
                
                conn.identity(function (err, idResponse) {
                    if (err) { 
                        console.log('Error getting identity:', err);
                        throw err; 
                    }
                    console.log("User Name: " + idResponse.display_name);
                    console.log("User Email: " + idResponse.email);
                    console.log("Username: " + idResponse.username);
                    userDomain.createOrGetUserRecord(idResponse.username, idResponse.email)
                    .then((userRecord) => {
                        console.log("User's database ID: " + userRecord.id);
                        req.session.authInfo = { 
                            accessToken: conn.accessToken,
                            refreshToken: conn.refreshToken,
                            instanceUrl: conn.instanceUrl,
                            userId: userInfo.id,
                            organizationId: userInfo.organizationId
                        };
                        req.session.userInfo = {
                            dbId: userRecord.id,
                            username: idResponse.username,
                            userDisplayName: idResponse.display_name,
                            userEmail: idResponse.email,
                            points: userRecord.points
                        }
                        return userDomain.getPercentileValueForPoints(userRecord.points);
                    })
                    .then((percentileRank) => {
                        let userInfo = req.session.userInfo;
                        userInfo.rank = percentileRank;
                        req.session.userInfo = userInfo;
                        resolve(path);
                    });
                });
            })
            .catch(function (err) {
                console.log('=== AUTHORIZATION ERROR ===');
                console.log('Error type:', err.name);
                console.log('Error message:', err.message);
                console.log('Full error:', JSON.stringify(err, null, 2));
                reject(err);
            })
        });
    },
    async updateUserPointsInSession(req, points) {
        let userInfo = req.session.userInfo;
        let percentileRank = await userDomain.getPercentileValueForPoints(points);
        userInfo.rank = percentileRank;
        userInfo.points = points;
        req.session.userInfo = userInfo;
    },
    logout(req) {
        console.log('Destroying session with Session ID: ' + req.sessionID);
        req.session.destroy();
    }
}

module.exports = auth;