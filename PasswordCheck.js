/* const express = require('express')
const app = express()
app.use(express.json)

const users = [{username: 'arun Kumar',password : 'shihdihb'}]

app.get('/', (req,res) => {
    res.send(`Working....`)
})

app.get('/users', (req, res) => {
    res.json(users)
})

app.post('/login', (req, res) => {
    const user = {username : req.body.username, password: req.body.password}
    console.log(user)
    res.send(`Data recived...`)
})

const PORT = 5000;


app.listen(PORT,() =>{
    console.log("server is running... On Port "+ PORT)
}) */

const express = require('express')
const cors = require('cors');
const bodyParser = require('body-parser')
const routes = require('./Routes/router')
const retiveData = require('./Database/database')
//MYsql DataBase Connection and Run Queryies
const {createPool} = require('mysql')

//Importing bcrypt module/libreary
const bcrypt = require('bcrypt')

//Importing whole "database.js" module to use the functions of it to do DB operations
const dbModule = require('./Database/database')

//Mysql database connection module using "createpool" that is used to do parrallel database queries
const pool = createPool({
    host : "localhost",
    user : "root",
    password : "root123", // We changed the original password to connect with db.
    database:'fastoodb',
    connectionLimit: 10,

})
const app = express();
app.use(express.json())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:false}))
const coreOptions = {
    origin : '*',
    credentials : true,
    optionSuccessStatus : 200
}
app.use(cors(coreOptions))


const users = []

const user1 = {
    username : 'ArunKumar',
    password : "@1234"
}
//convering the password into hash code for security purpose by using async function "bc"
const bc = async(password) => {
    const salt = await bcrypt.genSalt()
    const hashedPassword = await bcrypt.hash(password, salt)

    return hashedPassword;

    //users.push({username : user1.username, password:hashedPassword})
    //INsert the username and into Data Base bycalling a function in "database.js" module.
/*     const InsertFun = async() => {
        try{
            const data = await dbModule.insertData(username,hashedPassword);
            if(data!=null){
                console.log(`Data Inserted Succssfully...`)
            } 
        }
        catch(err){
            console.log(`ERROR OCCURED : ${err}`)
        }
    }

    InsertFun(); */

}


app.get('/', (req,res) => {
    res.send(`Working....`)
})

app.get('/users', (req, res) => {
    res.json(users)
})
app.post('/users', async (req, res) => {
    try{
        const {username, password} = req.body;
        // console.log(`${username}, ${password}`)
         res.send(`data recived`)
        const salt = await bcrypt.genSalt()
        const hashedPassword = await bcrypt.hash(password, salt)

/* 
        console.log(salt)
        console.log(hashedPassword) */

        users.push({username : username, password : hashedPassword})

    }
    catch{
        res.status(500).send()
    }
})

//logging in user by comapring their username and hased password using "bcrypt.compare()" fun
app.post('/login',async (req,res) => {
    const {username, password} = req.body;
    //First we check the given username is present in the database or not then processed to check password.
    const user = users.find(user => user.username = username)
    if(user == null) {
        return res.status(400).send(`User Can't found`)
    }
    try{
        //comparing given password and existed passwords using "bcrypt.compare()" method in DBMS.
        //we search in the DBMS by user given name here to check password
        if(await bcrypt.compare(password, user.password)){
            console.log('You are logged In')
            res.json({"login" : true})
        }
        else{
            console.log('Incorrect Password')
        }
    }
    catch{
        res.status(500).send()
    }
})


//always write this after all the code
/* app.use('/',routes)

const PORT = 4000;
app.listen(PORT,() =>{
    console.log("server is running...")
}) */

exports.hashPwd = bc;


