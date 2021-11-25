const User = require('../models/User');
const passport = require('passport');
const AccessToken=require('../models/AccessToken');
const crypto=require('crypto');
const {sendForgotMail,sendMail}=require('../helpers/sendMail');

const getAuthPage = (req,res)=>{
	if(req.user){
		return res.redirect('/');
	}
	res.render('login', {title: 'Signin | Meal Mentor'});
}

const register = async (req, res, next) => {
    try {
		// console.log(req.body);
		const user = new User(req.body);
		await user.save();
		passport.authenticate("local", (err, user, info) => {
			if (err) {
				return next(err);
			}
			if (!user) {
				req.flash('error', info.msg);
				return res.redirect('back');
				// return res.json({ msg: info });
			}

			req.logIn(user, function (err) {
				if (err) {
					req.flash('error', err.message);
					return next(err);
				}
				req.flash('success', 'Last Step tp your login!');
				return res.redirect("/Signup-last-step");
			});
		})(req, res, next);
    } catch (err) {
		console.log(err.message);
		req.flash('error', err.message);
		res.redirect('back');
    }
}

const login = (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
        if (err) {
            return next(err);
        }
        if (!user) {
            console.log('no user', info);
			req.flash('error', info.msg);
			return res.redirect('back');
            // return res.json({ msg: info });
        }

        req.logIn(user, function (err) {
            if (err) {
				req.flash('error', err.message);
				return next(err);
			}
	
			if(user.option===true){
				req.flash('success','Login Successfully!');
				return res.redirect("/");
			}else{
				req.flash('success','Customize your recipes')
				return res.redirect("/Signup-last-step");
			}
        });
    })(req, res, next);
}

const logout = (req, res) => {
    req.logout();
    res.redirect("/signin");
}

const getUserDashboard = async (req,res)=>{
	const user = await User.findById(req.user._id);
	const signinGoogle = user.google && !user.password ? true : false;
	delete user._doc['password'];
	delete user._doc['google'];
	res.render('profile', {title: user.fullName+' Profile', userData: user._doc, signinGoogle,user:user});
}

const enterEmail = (req, res) => {
    return res.render('forgot-password-mail',{
        title: "Meal Mentor | Verify Email",
		page: "email"
    });
}

const forgotPassword = async (req, res) => {
	try {
		const email = req.body.email;
		const existUser = await User.findOne({ email: email });
		if (!existUser) {
			return res.status(404).send({ message: 'User not found!' });
		}
		const buf = await crypto.randomBytes(20);
		var token = buf.toString('hex');
		let accesstoken = await AccessToken.create({
			token: token,
			user: existUser._id,
			expiresIn: Date.now() + 10 * 60 * 60 * 1000,
		});

		sendForgotMail(email, accesstoken);
		req.flash('success',"Check your Email,password reseting link has been sent to you");
		return res.redirect('back');
	} catch (err) {
		req.flash('error',err.message);
		return res.redirect('back');
	}
};

const enterNewPassword=async(req,res)=>{
	try{

        let accessToken=await AccessToken.findOne({token:req.query.accessToken});
    
        if(accessToken){
            return res.render('forgot-password-mail' , {
                title : 'Meal Mentor | Reset Password',
                accessToken : accessToken.token,
				page:"password"
            })
        }
        else{
			req.flash("error","Please generate new token");
            return res.redirect('/user/forgot-password');
        }

    }catch(err){
        req.flash('error',err.message);
		 return res.redirect('/user/forgot-password');
    }
}

const resetPassword = async (req, res) => {
	try {
		console.log("Request body is",req.body,"token is",req.query);
		const newPassword = req.body.newPassword;
		const confirmPassword=req.body.confirmPassword;
		const accessToken=  req.query.accessToken;
		const tokenFound = await AccessToken.findOne({ token: accessToken, expiresIn: { $gt: Date.now() } });
		const tf = await AccessToken.findOne({ token: accessToken });
		
		if (!tokenFound) {
			console.log("TokenFound",tokenFound);
			req.flash("error","Please generate new token");
			return res.redirect('/user/forgot-password');
		}
		if(newPassword!==confirmPassword){
			req.flash("error","Your password dont match with confirm Password");
			return res.redirect('back');
		}
		const user = await User.findById(tokenFound.user);
		if (!user) {
			req.flash("error","Something went wrong");
		}
		user.password = newPassword;
		if (tf) {
			await tf.remove();
		}
		await user.save();
		return res.redirect('/');
	} catch (err) {
		req.flash("error",err.message);
		return res.redirect('/');
	}
};

const editUserInfo = async (req,res)=>{
	try{
		const user = await User.findById(req.user._id);
		const newName = req.body.fullName || null;
		const password = req.body.password || null;
		const newPassword = req.body.newPassword || null;
		
		user.fullName = newName || user.fullName;
		if(password && newPassword){
			const isMatch = await user.comparePassword(password)
			if (isMatch) {
				user.password = newPassword
			}
		} else if(user.google && newPassword && !password){
			user.password = newPassword;
		}
		
		await user.save();
		console.log('completed');
		req.flash('success', 'Your Information has been updated successfully!');
		return res.redirect('back');
		
	} catch(err){
		console.log('catched error: ',err.message);
		if(err.message === 'Invalid email or password!'){
			req.flash('error', 'Invalid Current Password! So we are not updating your information.');
		}else{
			req.flash('error', err.message);
		}
		return res.redirect('back');
	}
}

const editUserInterest = async (req, res)=>{
	try{
		const user = await User.findById(req.user._id);
		
		const favCusine = req.body.favCusine;
		const foodAllergies = req.body.foodAllergies;
		const diet = req.body.diet;
		const notIngredients = req.body.notIngredients;
		const mustIngredients = req.body.mustIngredients;
		
		user.favCusine = favCusine || user.favCusine;
		user.foodAllergies = foodAllergies || user.foodAllergies;
		user.diet = diet || user.diet;
		user.notIngredients = notIngredients || user.notIngredients;
		user.mustIngredients = mustIngredients || user.mustIngredients;
		
		await user.save();
		
		req.flash('success', 'Your Interests has been updated successfully!');
		res.redirect('/user/me');
	} catch(err){
		req.flash('error', err.message);
		return res.redirect('back');
	}
}

const slider=async function(req,res){
   
    return res.render('slider',{
        title: "Meal Mentor | Personalize your choices",
    });
}

module.exports = {
	getAuthPage,
	login,
	register,
	logout,
	getUserDashboard,
	editUserInfo,
	editUserInterest,
	slider,
	forgotPassword,
	resetPassword,
	enterEmail,
	enterNewPassword
};