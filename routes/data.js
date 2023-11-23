var express = require('express');
var router = express.Router();


router.get('/', function (req, res) {
    res.send('Nothing to show');
})
module.exports = router;