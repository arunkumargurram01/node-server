const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors');
const routes = require('./Routes/router')
const bcrypt = require('bcrypt')
const cookieParser = require('cookie-parser')
const app = express();

//importing user defined modules
const dbModule = require('./Database/database')

//IMporting HAshing module form "passwordCheck.js"
const hfModule = require('./PasswordCheck')


app.use(express.json())
app.use(bodyParser.json())
app.use(cookieParser())


/* app.use(bodyParser.urlencoded({extended:false}))
const coreOptions = {
    origin: 'http://localhost:3000', // Update with your frontend port
    credentials: true,
    optionSuccessStatus: 200
  }; */
  app.use(cors);
  


const jwt = require('jsonwebtoken')
require('dotenv').config();


const users = [
    {name : 'Arun Kumar', data : 'Arun Kumar Data'},
    {name : 'Mani Deep', data : 'Mani deep Data'},
    {name : 'Harish', data : 'Harish Data'},
    {name : 'Dattu', data : 'Dattu Data'},
]


app.get('/', (req,res) => {
    res.send(`Welcome To JWT Practiece`)
})

//for signup (newly creating account by giving name & password)
app.post('/signup',async(req, res) => {
    //Assume this data is came from user inputs from frontend when a new user singup
/*     const username = "Vamshi";
    const passwod = "Vamshi123";
    const mail = "vamshi@gmail.com" */
    const {username, password, mail} = req.body
    try{
       const hfoperation = await hfModule.hashPwd(password);
       const dboperation = await dbModule.insertData(username,hfoperation,mail);

       console.log(dboperation)
       res.json(dboperation)
    }
    catch(err){
        console.log(err)
    }

})

//GET method from Axios
app.get('/login', (req, res) => {
    res.cookie("cname", "cookieData",{secure : true, httpOnly : true}).json({'login' : 'success'})
    console.log(`post method called`)
})


//Authencation && JWT token creation
 app.post('/login',async(req, res) => {
//Authencation done here 
    const {username, password} = req.body
    try {
        //DB query method from "database.js" to check the user is present or not and retrive the user details foe serilization
        const userpwd = await dbModule.credentialsCheck(username);
            console.log('Data from JWT = ', userpwd);
            //comparing given password and existed passwords using "bcrypt.compare()" method in DBMS.
            //we search in the DBMS by user given name here to check password
//we can't include password in serilization here bcs we serilize this "user" with webToken that webtoken can expose passwords.
//but we can use any other deatisl like mail or user Id given In data base etc..
            if(await bcrypt.compare(password, userpwd)){
                console.log('You are logged In')
                const user = {name : username} 
                //create jwt token by serilizing the "user" object only after if the authentication is successful 
                const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET)
                //sending the token to the client 

                res.cookie('JWTcookie', accessToken,{secure : true, httpOnly : true});
                res.cookie("cookie", Date.now())
                console.log(req.cookies);
                res.json({"token" :accessToken, "acess": true,"username":username})
                
                //sending cookies to the client by including jwt token

                //console.log(`login Successful`)
                //res.status(200).send({"acess": true})

                //res.json({"login" : true,"acess": true,"username":username})
            }
            else{
                console.log('Incorrect Password')
                res.json({"acess": false,"reason":"Incorrect Password"})
            }
        
    }
    catch(err)//when there is no user found in the db method it rejects the promise that result in err in catch in this module.
    {
        console.log(`ERROR IS : ${err}`)
        //res.json({"acess": false,"reason" : "User Not Found With User Name"})  
    }

//we can't include password in serilization here bcs we serilize this "user" with webToken that webtoken can expose passwords.
//but we can use any other deatisl like mail or user Id given In data base etc..
//const data = users.find(user => user.name === username); //We have to check the creadentials in DB in real time
/*     if(data){ //here we execute the if block code only if the user is exist and credentials are correct we use DB check instead of if condition 
        const user = {name : username} 
        //create jwt token by serilizing the "user" object only after if the authentication is successful 
            const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET)
        //sending the token to the client 
            res.json({"token" :accessToken, "acess": true,"username":username})
            console.log(`login Successful`)
    }
    else{
        res.json({"acess": false})
    } */
}) 



//Creating a middleware function to check the token and user details whether the token is vailed or not 
const authenticateToken = (req, res, next)  => {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]//this line will check is authHeader is null and if not split and get the data

  try{
   // const token = req.cookie.token;
   // console.log('Cookiee = ', token)
    if(token==null) {
        return res.sendStatus(401)
    }
    //comparing jwt token which comes from client request and real token secretKey && userdata by using "jwt.verify()" method 
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if(err) return res.sendStatus(401)
        //user extracted from the "JWT" token payload
        req.user = user //here payload is "user"
        next() //This will allow use to the next step in the "/users" and all other which needs needsto check JWT in route GET method.
    }) 
  }
  catch(err){
     console.log(`ERROR IN Middleware : ${err}`)
     res.status(401);
  }
}

/* data request from client by including "jwt" in request, and we check the "jwt" token with "authentcateToken" fun
   and filter the data and provide only data related to that specific given "name" of user here
*/
//We must check the authorization by token comparing for every reqest from the client after successful login by using "authenticateToken"
app.get('/users',authenticateToken, (req, res) => {

/*     const userCredentialsHeader = req.headers['usercredentials'];
    const uname = userCredentialsHeader && JSON.parse(userCredentialsHeader).username;

    console.log(`From User : ${uname}`)
    //This line of code and data is replaced by Data Base DBMS query
    const  userData = users.filter(user => user.name === uname);
    console.log(userData)
    res.json(userData) */
/*   In the above line we are acessing the name of the user send by the request(name), But see this is
     a "GET" request but also we also we are acessing name from the "JWT", In "authenticateToken" fun we create
     we can pass some data to server in GET method also by writing in "headers" and acess it like we done "userCredentials"
*/
})

app.get('/dashboard', authenticateToken, (req,res) => {
    console.log(`dashboard route will execute `)
    const userCredentialsHeader = req.headers['usercredentials'];
    const uname = userCredentialsHeader && JSON.parse(userCredentialsHeader).username;

    console.log(req.cookies); //this line will log all the cookies which are send in req from frontend
    //This line of code and data is replaced by Data Base DBMS query
    const  userData = users.filter(user => user.name === uname);
    //console.log(`from dashboard route : ${uname}`)
    res.json(userData) 
})


//other module methods accessing 
// Use an async function to wait for the data to be retrieved
const fetchData = async () => {
    try {
        const dbdata = await dbModule.retriveData(3);
        console.log(dbdata);
    } catch (error) {
        console.error(`ERROR Occurred: ${error}`);
    }
}
// Call the async function to retrieve and use the data
fetchData();



//always write this after all the code
app.use('/',routes)

const PORT = process.env.PORT || 3000;
app.listen(PORT,() =>{
    console.log("server is running...")
})




