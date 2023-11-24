var express = require('express');
var router = express.Router();
var db = require('../models/sql')
var jwt = require('jsonwebtoken');
var md5 = require('md5');
const querystring = require('querystring');
var transporter = require('../_helpers/sendMail')

router.get('/', function (req, res) {
    res.send('Nothing to show');
})

router.post("/login", (req, res) => {
    var username = req.body.username;
    var password = md5(req.body.password);
    try {
        db.query("select userid, role, username, isverified from Users where username=? and password=?", [username, password], function (err, result) {
            if (err) throw err;

            if (result.length > 0) {

                if(!result[0]['isverified']) {
                    res.send({ error: 'Verify email address' })
                } 

                var token = jwt.sign({
                    userid: result[0]['userid'],
                    role: result[0]['role'] ? result[0]['role'] : "User"
                }, process.env.SECRET_KEY, { expiresIn: '1h' });
                var data = {
                    message: "Login Successful",
                    username: result[0]['username'],
                    token: token,
                    role: result[0]['role']
                }
                // res.setHeader('Auth', token)
                 res.send(data)
               
            } else {
                res.send({ error: 'Invalid username or password' })
            }
        });
    } catch (e) {
        res.send(e)
    }

})

router.post("/signup", (req, res) => {
    var password = md5(req.body.password);
    var email = req.body.email;
    var username = req.body.username;
    var role = 'User';

    try {
        db.query("INSERT INTO Users (USERNAME, PASSWORD, EMAIL, ROLE) VALUES (?, ?, ?, ?)", [username, password, email, role], (err, result) => {
            if (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    // Handle duplicate entry error (duplicate username)
                    res.send({ error: 'Username already exists' });
                } else {
                    // Handle other database errors
                    res.send({ error: "Error creating account" });
                }
            } else {
                var token = jwt.sign({
                    username: username,
                }, process.env.SECRET_KEY, { expiresIn: '24h' });
                var host = "https://" + req.headers.host + "/api/auth/verify?token=" + token + "&url=" + req.headers.origin+'#/auth/login'
                
                // send mail with defined transport object
                var mailOptions = {
                    to: email,
                    subject: "Verify Your Account ",
                    html: `
                    <p style="font-family: Arial, sans-serif; color: #333; font-size: 16px;">
                    Hello! ${querystring.escape(username)}✨<br><br>
                    To verify your account, simply click the link below:
                    </p>
                    <a href="${encodeURI(host)}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: #fff; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 14px;">Verify Account 🚀</a>
                    <p style="font-family: Arial, sans-serif; color: #333; font-size: 16px; margin-top: 20px;">
                    If you can't click the link, you can copy and paste it into your browser's address bar:
                    <br>
                    <span style="color: #007bff;">${encodeURI(host)}</span>
                    </p>
                    <p style="font-family: Arial, sans-serif; color: #666; font-size: 14px; margin-top: 30px;">
                    Need help? Apologies, we don't have support available before creating account.
                    </p>
                    `
                    

                };
            
                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        res.send({ error: "Error creating account" });
                    }
            
                    res.send({ message: "User created successfully. please verify your email" });

                });
            }
        });
    } catch (e) {
        res.send({ error: e.message });
    }
});
router.get('/verify', function (req, res) {
    if(!req.query.token) {
        res.send('invalid link')
    }
    var decoded = jwt.decode(req.query.token, process.env.SECRET_KEY)
    var username = decoded?.username?decoded.username:''
    if (username!='') {
        db.query("UPDATE Users SET isverified=? where username=?",[1, username], (err, result)=>{
            if (err) throw err;
            res.redirect(req.query.url)
        })
    }
    else {
       res.send("Invalid link")
    }
});



module.exports = router;