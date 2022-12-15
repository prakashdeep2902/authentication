const express = require("express");
const app=express()
app.use(express.json());

var cors = require('cors')
app.use(cors())

const connectToMongoose=require('./db')
connectToMongoose();


const cookieParser=require('cookie-parser');
app.use(cookieParser());



const port=process.env.port||5000;
app.use('/api',require('./routes/authentication'));

app.get('/', function (req, res) {
    res.send('Hello World')
  })
  
app.listen(port,()=>{

    console.log(`coding pathsala backend at port ${port}`);
})