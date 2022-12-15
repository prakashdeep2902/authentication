const mongoose=require('mongoose');
const dotenv=require('dotenv');
dotenv.config({path:'./config/config.env'})

const mongUri="mongodb+srv://prakash:prakash@cluster0.plvxgov.mongodb.net/autenticate?retryWrites=true&w=majority";
const connectToMongo = ()=>{
    mongoose.connect(mongUri ,{
        useNewUrlParser: true,
       
        useUnifiedTopology:true

    }).then(()=>{
        console.log("Connected to Mongo Successfully");

    }).catch((error)=>{
        console.log("Connected to Mongo is not Successfully ",error)
    })
}


module.exports=connectToMongo;