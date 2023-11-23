var jwt = require('jsonwebtoken');
require('dotenv').config()

authorize = (req, res, next) => {
    var token = req.headers['authorization']
           jwt.verify(token, process.env.SECRET_KEY, (err, authorizedData) => {
            if(err){
                //If error send Forbidden (403)
                res.sendStatus(403);
            } else {
                next()
            }
        })
}
authorizeAgent = (req, res, next)=> {
    var token = req.headers['authorization']
           jwt.verify(token, process.env.SECRET_KEY, (err, authorizedData) => {
            if(err || authorizedData.role != 'Agent'){
                //If error send Forbidden (403)
                res.sendStatus(403);
            } else {
                next()
            }
        })
}
adminOnly=(req, res, next)=> {
    var token = req.headers['authorization']
           jwt.verify(token, process.env.SECRET_KEY, (err, authorizedData) => {
            if(err || authorizedData.role != 'Admin'){
                //If error send Forbidden (403)
                res.sendStatus(403);
            } else {
                next()
            }
        })
}
module.exports = {adminOnly,authorizeAgent, authorize};
// module.exports = authorize;
