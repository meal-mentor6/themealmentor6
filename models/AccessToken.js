const mongoose=require('mongoose');

const accesstokenSchema=new mongoose.Schema({
	token:{
		type:String,
		required:true
	},
	user:{
		type:mongoose.Schema.Types.ObjectId,
		ref:"User"
	},
	expiresIn:{
		type: Date,
		required: true
	}
},{
	timestamps:true
});

const accessTokens=mongoose.model('AccessToken',accesstokenSchema);
module.exports=accessTokens;