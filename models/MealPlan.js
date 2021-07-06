const mongoose = require("mongoose");

const mealData = {
	id: String, title: String, image: String,
	category: { type: String, enum: ['grocery', 'recipe', 'product', 'menuitem'] },
	qty: { type: Number, default: 1 },
	protein: { type: Number, default: 0 },
	fat: { type: Number, default: 0 },
	calories: { type: Number, default: 0 },
	carbs: { type: Number, default: 0 }
}

const mealPlanSchema = new mongoose.Schema({
	monday: {
		schedule: {
			morning: [mealData],
			noon: [mealData],
			evening: [mealData],
		},
		summary: { totalProtein: { type: Number, default: 0 }, totalCalories: { type: Number, default: 0 }, totalFat: { type: Number, default: 0 }, totalCarbs: { type: Number, default: 0 } }
	},
	tuesday: {
		schedule: {
			morning: [mealData],
			noon: [mealData],
			evening: [mealData],
		},
		summary: { totalProtein: { type: Number, default: 0 }, totalCalories: { type: Number, default: 0 }, totalFat: { type: Number, default: 0 }, totalCarbs: { type: Number, default: 0 } }
	},
	wednesday: {
		schedule: {
			morning: [mealData],
			noon: [mealData],
			evening: [mealData],
		},
		summary: { totalProtein: { type: Number, default: 0 }, totalCalories: { type: Number, default: 0 }, totalFat: { type: Number, default: 0 }, totalCarbs: { type: Number, default: 0 } }
	},
	thursday: {
		schedule: {
			morning: [mealData],
			noon: [mealData],
			evening: [mealData],
		},
		summary: { totalProtein: { type: Number, default: 0 }, totalCalories: { type: Number, default: 0 }, totalFat: { type: Number, default: 0 }, totalCarbs: { type: Number, default: 0 } }
	},
	friday: {
		schedule: {
			morning: [mealData],
			noon: [mealData],
			evening: [mealData],
		},
		summary: { totalProtein: { type: Number, default: 0 }, totalCalories: { type: Number, default: 0 }, totalFat: { type: Number, default: 0 }, totalCarbs: { type: Number, default: 0 } }
	},
	saturday: {
		schedule: {
			morning: [mealData],
			noon: [mealData],
			evening: [mealData],
		},
		summary: { totalProtein: { type: Number, default: 0 }, totalCalories: { type: Number, default: 0 }, totalFat: { type: Number, default: 0 }, totalCarbs: { type: Number, default: 0 } }
	},
	sunday: {
		schedule: {
			morning: [mealData],
			noon: [mealData],
			evening: [mealData],
		},
		summary: { totalProtein: { type: Number, default: 0 }, totalCalories: { type: Number, default: 0 }, totalFat: { type: Number, default: 0 }, totalCarbs: { type: Number, default: 0 } }
	},
	user: { type: mongoose.Schema.Types.ObjectId, rel: 'User', required: true, unique: true }
});

module.exports = mongoose.model('MealPlan', mealPlanSchema);