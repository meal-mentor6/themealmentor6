const MealPlan = require('../models/MealPlan');
const { getApiKey } = require('../helpers/keys');
const fetch = require('node-fetch');

exports.createMealPlan = async (req, res) => {
    try {
        const mp = await MealPlan.findOne({ user: req.user._id });
        if (!mp) {
            const mealPlan = new MealPlan({
                user: req.user._id
            });
            await mealPlan.save();
            req.flash('success', 'Create Your Meal Plan here.');
            return res.render('mealPlan', { mealPlan: mealPlan });
        }
        return res.render('mealPlan', { mealPlan: mp._doc });
    } catch (err) {
        req.flash('error', err.message);
        return res.redirect('back');
    }
}

exports.addMealItem = async (req, res) => {
    try {
        const myMealPlan = await MealPlan.findOne({ user: req.user._id });
        if (!myMealPlan) {
            return res.send({ err: 'Please intialize you meal plan first!' });
        }
        const day = req.body.day;
        const time = req.body.time;

        const data = {
            id: req.body.id,
            title: req.body.title,
            image: req.body.image,
            category: req.body.category
        };
        const nutriData = await getMealAnalysis({ id: req.body.id, cat: req.body.category, qty: 1 });
        data.protein = nutriData.protein;
        data.carbs = nutriData.carbohydrates;
        data.fat = nutriData.fat;
        data.calories = nutriData.calories;
        myMealPlan[day].schedule[time].push(data);

        myMealPlan[day].summary.totalProtein += nutriData.protein;
        myMealPlan[day].summary.totalCalories += nutriData.calories;
        myMealPlan[day].summary.totalFat += nutriData.fat;
        myMealPlan[day].summary.totalCarbs += nutriData.carbohydrates;

        await myMealPlan.save();
        const len = myMealPlan[day].schedule[time].length;
        res.send({ message: 'Data Added!', _id: myMealPlan[day].schedule[time][len - 1]._id, summary: myMealPlan[day].summary });
    } catch (err) {
        console.log(err.message);
        return res.send({ err: err.message });
    }
}

exports.removeMealItem = async (req, res) => {
    try {
        const myMealPlan = await MealPlan.findOne({ user: req.user._id });
        if (!myMealPlan) {
            return res.send({ err: 'Please intialize you meal plan first!' });
        }
        const day = req.body.day;
        const time = req.body.time;
        const item = myMealPlan[day].schedule[time].find(it => it._id == req.body._id);
        myMealPlan[day].summary.totalProtein -= item.protein;
        myMealPlan[day].summary.totalCalories -= item.calories;
        myMealPlan[day].summary.totalFat -= item.fat;
        myMealPlan[day].summary.totalCarbs -= item.carbs;

        // const newPlan = await MealPlan.findOneAndUpdate({ user: req.user._id }, {$pull: {day:  {'schedule': {time: {id: req.body.id}}}}}, {new: true});
        myMealPlan[day].schedule[time].pull({ _id: req.body._id });
        await myMealPlan.save();
        // console.log('after removal', myMealPlan[day].schedule[time]);

        res.send({ message: 'Data removed!', summary: myMealPlan[day].summary });
    } catch (err) {
        console.log(err.message);
        return res.send({ err: err.message });
    }
}

exports.updateMeal = async (req, res) => {
    try {
        const myMealPlan = await MealPlan.findOne({ user: req.user._id });
        if (!myMealPlan) {
            return res.send({ err: 'Please intialize you meal plan first!' });
        }
        const id = req.body.id;
        const day = req.body.day;
        const time = req.body.time;
        const qty = req.body.qty;

        const item = myMealPlan[day].schedule[time].find(it => it.id === id);
        const prevProtein = item.protein;
        const prevCarbs = item.carbs;
        const prevFat = item.fat;
        const prevCals = item.calories;

        const nutriData = await getMealAnalysis({ id: id, cat: cat, qty: qty });

        item.qty = qty;
        item.protein = nutriData.protein;
        item.carbs = nutriData.carbohydrates;
        item.fat = nutriData.fat;
        item.calories = nutriData.calories;

        myMealPlan[day].summary.totalProtein += nutriData.protein - prevProtein;
        myMealPlan[day].summary.totalCalories += nutriData.calories - prevCals;
        myMealPlan[day].summary.totalFat += nutriData.fat - prevFat;
        myMealPlan[day].summary.totalCarbs += nutriData.carbohydrates - prevCarbs;

        await myMealPlan.save();

        return res.send({ message: 'Data Updated!', summary: myMealPlan[day].summary });

    } catch (err) {
        console.log(err.message);
        return res.send({ err: err.message });
    }
}

exports.searchMeals = function (req, res) {
    const url = req.body.url;
    const limit = req.body.limit;
    const offset = req.body.offset;
    const options = req.body.options;
    let params = '';
    options.forEach(opt => {
        params += '&' + opt.key + '=' + opt.value;
    })

    fetch(`https://api.spoonacular.com/${url}?apiKey=${getApiKey()}&number=${limit}&offset=${offset}${params}`)
        .then((res) => res.json())
        .then((data) => {
            let sendData = [];
            if (data.results) {
                sendData = data.results.map(d => ({ title: d.title ? d.title : d.name, id: d.id, image: d.name ? 'https://spoonacular.com/cdn/ingredients_250x250/' + d.image : d.image }));
            } else if (data.menuItems) {
                sendData = data.menuItems.map(d => ({ title: d.title, id: d.id, image: d.image }));
            }
            return res.json({ results: sendData });
        })
        .catch((err) => {
            console.log(err);
            return res.json({ err: err.message });
        });
};

exports.generateMealPlan = async (req, res) => {
    const tf = req.query.timeFrame;
    const tg = req.query.targetCalories;
    const diet = req.query.diet;
    const ex = req.query.exclude;
    let params = '';
    params += '&timeFrame=' + tf;
    if (tg) params += '&targetCalories' + tg;
    if (diet) params += '&diet' + diet;
    if (ex) params += '&exclude' + ex;

    fetch(`https://api.spoonacular.com/mealplanner/generate?apiKey=${getApiKey()}${params}`)
        .then((res) => res.json())
        .then((data) => {
            return res.send(data);
        }).catch((err) => {
            console.log(err);
            return res.json({ err: err.message });
        });
}

exports.setMealPlan = async (req, res) => {
    try {
        const myMealPlan = await MealPlan.findOne({ user: req.user._id });
        if (!myMealPlan) {
            return res.send({ err: 'Please intialize you meal plan first!' });
        }
        const times = ['morning', 'noon', 'evening'];
        const timeFrame = req.body.timeFrame;
        const planday = req.body.planday;
        const planData = req.body.planData;
        if (timeFrame == 'day') {
            await Promise.all(planData.meals.map((m, i) => addDayMealUtil(m, planday, times[i], myMealPlan)));
            myMealPlan[planday].summary.totalProtein = planData.nutrients.protein;
            myMealPlan[planday].summary.totalFat = planData.nutrients.fat;
            myMealPlan[planday].summary.totalCarbs = planData.nutrients.carbohydrates;
            myMealPlan[planday].summary.totalCalories = planData.nutrients.calories;
            await myMealPlan.save();
        } else {
            for (let key in planData.week) {
                await Promise.all(planData.week[key].meals.map((m, i) => addDayMealUtil(m, key, times[i], myMealPlan)));
                myMealPlan[key].summary.totalProtein = planData.week[key].nutrients.protein;
                myMealPlan[key].summary.totalFat = planData.week[key].nutrients.fat;
                myMealPlan[key].summary.totalCarbs = planData.week[key].nutrients.carbohydrates;
                myMealPlan[key].summary.totalCalories = planData.week[key].nutrients.calories;
            }
            await myMealPlan.save();
        }
        res.send({ message: 'Data Added!' });
    } catch (err) {
        console.log(err);
        return res.json({ err: err.message });
    }
}
const addDayMealUtil = async (planData, planday, time, myMealPlan) => {
    try {
        let data = {
            id: planData.id,
            title: planData.title,
            image: `https://spoonacular.com/recipeImages/${planData.id}-556x370.jpg`,
            category: 'recipe'
        };
        let nutriData = await getMealAnalysis({ id: planData.id, cat: 'recipe', qty: 1 });
        data.protein = nutriData.protein;
        data.carbs = nutriData.carbohydrates;
        data.fat = nutriData.fat;
        data.calories = nutriData.calories;
        console.log(planday, myMealPlan[planday]);
        myMealPlan[planday].schedule[time] = [data];
    } catch (err) {
        throw new Error(err.message);
    }
}
const getMealAnalysis = async (product) => {
    try {
        const { id, cat, qty } = product;
        let url = '';
        if (cat === 'recipe') {
            url = `https://api.spoonacular.com/recipes/${id}/nutritionWidget.json?apiKey=${getApiKey()}`;
        } else if (cat === 'product') {
            url = `https://api.spoonacular.com/food/ingredients/${id}/information?apiKey=${getApiKey()}&amount=${qty}&unit=grams`;
        } else if (cat === 'menuitem') {
            url = `https://api.spoonacular.com/food/menuItems/${id}?apiKey=${getApiKey()}`;
        }
        const res = await fetch(url);
        const data = await res.json();
        const nutrientsData = {};
        if (cat === 'recipe') {
            nutrientsData.protein = getNumberFromStr(data.protein);
            nutrientsData.carbohydrates = getNumberFromStr(data.carbs);
            nutrientsData.fat = getNumberFromStr(data.fat);
            nutrientsData.calories = getNumberFromStr(data.calories);
        } else if (cat === 'product' || cat === 'menuitem' && data.nutrition) {
            data.nutrition.nutrients.forEach(n => {
                if (n.name === 'Fat' || n.name === 'Protein' || n.name === 'Calories' || n.name === 'Carbohydrates') {
                    nutrientsData[n.name.toLowerCase()] = Number(n.amount ? n.amount : '0');
                }
            })
        }
        return nutrientsData;
    } catch (err) {
        throw new Error(err.message);
    }
}

const getNumberFromStr = (str) => {
    let n = '';
    for (let i = 0; i < str.length; i++) {
        if (str[i] <= 'z' && str[i] >= 'a') break;
        n += str[i];
    }
    return Number(n);
}