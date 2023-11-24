var express = require('express');
var router = express.Router();
var db = require('../models/sql')
var getUserIdFromToken = require('../_helpers/getUserId')

router.get('/', function (req, res) {
     try {
        const sql = `
        SELECT 
          R.RequestID,
          R.Title,
          R.Description,
          R.Priority,
          R.Status,
          R.RequesterID,
          R.AssignedToID,
          R.CreatedAt,
          R.UpdatedAt,
          U1.Username AS RequesterName,
          U2.Username AS AssignedToName
        FROM Requests R
        LEFT JOIN Users U1 ON R.RequesterID = U1.UserID
        LEFT JOIN Users U2 ON R.AssignedToID = U2.UserID
      `;
        db.query(sql, (err, result) => {
            if (err) throw err;
            if (result.length > 0) {
                res.send(result)
            } else {
                res.send(JSON.stringify({error: 'no Request found'}))
            }
        })
    } catch (e) {
        res.send(e)
    }
})

router.get('/assignedToMe', function (req, res) {
    var userID = getUserIdFromToken(req.headers['authorization']);
     try {
        const sql = `
        SELECT 
            R.RequestID,
            R.Title,
            R.Description,
            R.Priority,
            R.Status,
            R.RequesterID,
            R.AssignedToID,
            R.CreatedAt,
            R.UpdatedAt,
            U1.Username AS RequesterName,
            U2.Username AS AssignedToName
        FROM Requests R
        LEFT JOIN Users U1 ON R.RequesterID = U1.UserID
        LEFT JOIN Users U2 ON R.AssignedToID = U2.UserID
        WHERE R.AssignedToID = ?
        `;
        db.query(sql,[userID], (err, result) => {
            if (err) throw err;
            if (result.length > 0) {
                res.send(result)
            } else {
                res.send(JSON.stringify({error: 'no Request found'}))
            }
        })
    } catch (e) {
        res.send(e)
    }
})


router.post('/update', (req, res) => {
   
    var title = req.body.Title;
    var description = req.body.Description;
    var status = req.body.Status;
    var assignedto = req.body.AssignedToID;
    var priority = req.body.Priority;
    var id = req.body.id;

    const currentDate = new Date();
    const formattedTimestamp = currentDate.toISOString().slice(0, 19).replace('T', ' ');
    
    try {
        db.query("UPDATE Requests SET Title=?, Description=?, Status=?, UpdatedAt=?, AssignedToID=?, Priority=? WHERE RequestID = ?", [title, description, status, formattedTimestamp, assignedto, priority, id], (err, result) => {
            if (err) {
                res.send({ error: "Error updating Request" });
            } else {
                if (result.affectedRows > 0) {
                    res.send({ message: "Request updated successfully" });
                } else {
                    res.status(404).send({ error: "Request not found" });
                }
            }
        });
    } catch (e) {
        res.send({ error: e.message });
    }
});


router.post("/add", (req, res) => {
   
    var title = req.body.Title;
    var description = req.body.Description;
    var Priority = req.body.Priority;
    var Status = req.body.Status;
    var AssignedToID = req.body.AssignedToID;

    const currentDate = new Date();
    const formattedTimestamp = currentDate.toISOString().slice(0, 19).replace('T', ' ');
    
    try {
        db.query("INSERT INTO Requests (Title, Description, UpdatedAt, Priority, Status, AssignedToID, RequesterID) VALUES (?, ?,?, ?, ?, ?, ?)", [title, description, formattedTimestamp, Priority, Status, AssignedToID, getUserIdFromToken(req.headers['authorization'])], (err, result) => {
            if (err) {
                res.send({ error: err });
            } else {
                res.send({ message: "Request created successfully" });
            }
        });
    } catch (e) {
        res.send({ error: e.message });
    }
});

router.get('/agentList', function (req, res) {
     try {
        db.query(`SELECT UserID, Username from Users WHERE Role = 'Agent'`, (err, result) => {
            if (err) throw err;
            if (result.length > 0) {
                res.send(result)
            } else {
                res.send(JSON.stringify({error: 'no Agents found'}))
            }
        })
    } catch (e) {
        res.send(e)
    }
})

module.exports = router;