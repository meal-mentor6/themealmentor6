const express=require('express');
const router=express.Router();
const {createMealPlan,addMealItem, removeMealItem, searchMeals, updateMeal, generateMealPlan, setMealPlan} =require('../controllers/mealPlanner');
const {isLoggedIn} = require('../middleware/auth');

router.get('/mymealplan',isLoggedIn, createMealPlan);
router.post('/addMealItem',isLoggedIn, addMealItem);
router.post('/removeMealItem',isLoggedIn, removeMealItem);
router.post('/getsearchresults',isLoggedIn, searchMeals);
router.post('/updatemeal',isLoggedIn, updateMeal);
router.get('/generatemealplan',isLoggedIn, generateMealPlan);
router.post('/setmymealplan',isLoggedIn, setMealPlan);

module.exports = router;