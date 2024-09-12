const mongoose=require('mongoose');


// mongoose.connect("mongodb+srv://Nas:looseyourself112@cluster0.vhslp.mongodb.net/ethicplay");
mongoose.connect("mongodb+srv://Nas:looseyourself112@cluster0.vhslp.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0");

const userSchema=mongoose.Schema({
    username:String,
    email:String,
    password:String,
    game:String,
    height:Number,
    weight:Number,
    posts:[{type:mongoose.Schema.Types.ObjectId},ref="post"]
})

module.exports=mongoose.model('user',userSchema);