var express = require('express');
var router = express.Router();
var db = require('../models/sql')
var md5 = require('md5');

router.get('/', function (req, res) {
     try {
        db.query("SELECT Username, Email, Role, UserID FROM Users ", (err, result) => {
            if (err) throw err;
            if (result.length > 0) {
                res.send(result)
            } else {
                res.send({message: 'no user found'})
            }
        })
    } catch (e) {
        res.send(e)
    }
})

router.post('/delete', function (req, res) {
    var id = req.body.id;

    try {
        if(req.body.id == 3) {
            res.send({error: 'cannot delete this user'})
        } else {
            db.query("DELETE FROM Users WHERE UserID = ?", [id], (err, result) => {
                if (err) {
                    res.send({ error: 'Cannot delete this user. User may have requests' });
                } else {
                    if (result.affectedRows > 0) {
                        res.send({ message: 'User deleted successfully' });
                    } else {
                        res.status(404).send({ error: 'User not found' });
                    }
                }
            });
        }
    
    } catch (e) {
        res.status(500).send({ error: e.message });
    }
});



router.post('/update', (req, res) => {
    var password = req.body.password;
    var username = req.body.username;
    var email = req.body.email;
    var role = req.body.role;
    var id = req.body.id;

    try {
        if(req.body.password) {
            db.query("UPDATE Users SET USERNAME=?, PASSWORD=?, EMAIL=?, ROLE=?, isVerified=? WHERE UserID = ?", [username, md5(password), email, role, 1, id], (err, result) => {
                if (err) {
                    res.status(500).send({ error: "Error updating user" });
                } else {
                    if (result.affectedRows > 0) {
                        res.send({ message: "User updated successfully" });
                    } else {
                        res.status(404).send({ error: "User not found" });
                    }
                }
            });
        } else {
            db.query("UPDATE Users SET USERNAME=?, EMAIL=?, ROLE=?, isVerified=? WHERE UserID = ?", [username, email, role, 1, id], (err, result) => {
                if (err) {
                    res.status(500).send({ error: "Error updating user" });
                } else {
                    if (result.affectedRows > 0) {
                        res.send({ message: "User updated successfully" });
                    } else {
                        res.status(404).send({ error: "User not found" });
                    }
                }
            });
        }
       
    } catch (e) {
        res.status(500).send({ error: e.message });
    }
});


router.post("/add", (req, res) => {
    var password = md5(req.body.password);
    var email = req.body.email;
    var role = req.body.role;
    var username = req.body.username;

    try {
        db.query("INSERT INTO Users (USERNAME, PASSWORD, EMAIL, ROLE, isVerified) VALUES (?, ?, ?, ?, ?)", [username, password, email, role, true], (err, result) => {
            if (err) {
                res.status(500).send({ error: "Error creating user" });
            } else {
                res.send({ message: "User created successfully" });
            }
        });
    } catch (e) {
        res.status(500).send({ error: e.message });
    }
});


module.exports = router;