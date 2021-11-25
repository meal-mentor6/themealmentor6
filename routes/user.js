const express = require('express');
const router = express.Router();
const passport = require('passport');
const { isLoggedIn } = require("../middleware/auth");
const {getAuthPage, register, login, logout, getUserDashboard, editUserInfo, editUserInterest,slider,forgotPassword,resetPassword,enterEmail,enterNewPassword} = require('../controllers/user');

router.get("/signin", getAuthPage)

router.get('/Signup-last-step',slider);

router.post("/register", register);

router.post('/login', login);

router.get("/logout", isLoggedIn, logout);

router.get('/auth/google', passport.authenticate('google',{ scope: ['profile', 'email'] }));

router.get('/auth/google/callback', passport.authenticate('google',{ failureRedirect:'/signin'}),
	function (req, res){
		console.log('signin with google!');
		if(req.user.option===true){
			return res.redirect("/");
		}else{
			return res.redirect("/Signup-last-step");
		}
  		
	});

router.get('/user/me', isLoggedIn, getUserDashboard);

router.post('/user/edituserinfo', isLoggedIn, editUserInfo);

router.post('/user/edituserinterest', isLoggedIn, editUserInterest);

router.get('/user/forgot-password',enterEmail);
router.post('/auth/forgot-password',forgotPassword);
router.get('/auth/fill-new-password',enterNewPassword);
router.post('/auth/reset-password',resetPassword);


module.exports = router;