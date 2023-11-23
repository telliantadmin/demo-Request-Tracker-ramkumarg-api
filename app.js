var express = require('express')
var cookieParser = require('cookie-parser')
var cors = require('cors')
require('dotenv').config()



// middlewares
var app = express()
app.use(cors())
app.use( express.json() );   
app.use(express.urlencoded({
  extended: true
})); 
app.use(cookieParser())

// app.use(express.static('views'))
var {authorize, adminOnly, authorizeAgent} = require('./middlewares/authorize')

// routes
var auth = require("./routes/auth")
var user = require('./routes/user')
var agent = require('./routes/agent')
var admin = require('./routes/admin')


app.use('/api/auth', auth);
app.use('/api/user',authorize, user);
app.use('/api/agent',authorizeAgent, agent);
app.use('/api/admin',adminOnly, admin);




app.get('/', function (req, res) {
    res.sendFile('index.html', {root: __dirname })
})



const hostname = "127.0.0.1";
const port = process.env.PORT || 8000;
app.listen(port,  () => {
    console.log(`Server running at http://${hostname}:${port}/`);
 })