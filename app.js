const express = require('express');
//const uuid = require("uuid");
const cors = require('cors')

const app = express();

app.use(cors({
    //origin : 'http://localhost:3000',
    credentials : true,
}))

jwt = `nksal ksiofjisjks knhoihi cajcoishcisnjhsiocs`
app.get("/getcookie",(req, res) => {
    //const id = uuid.v4();
    res.cookie("id", jwt,{secure : true, httpOnly : true}).json({
        'status' : 'ok'
    })
});

app.get("/timecookie",(req, res) => {
    res.cookie("timecookie", "experecookie", {
        //expires : 2*60*1000,
        secure : true,
        httpOnly : true
    })
    res.json({'status' : 'Expire cookie sent'})
})

app.get('/',(req, res) =>{
    res.cookie("homec", "maincookie data", {secure:true, httpOnly : true})
    res.json({'status' : 'server working'})
})

const port = process.env.PORT || 5001; 
app.listen(port, () => {
    console.log(`Server started at ${port}`);
});