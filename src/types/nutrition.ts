export interface NutriAnamnesisData {
  // 1. Personal & Anthropometry
  name: string;
  age: number;
  gender: 'Masculino' | 'Feminino';
  weight: number;
  height: number;
  bodyFatPercentage?: number;
  
  // 2. Goals & Activity
  goal: string;
  secondaryGoal?: string;
  tertiaryGoal?: string;
  activityLevel: string;
  trainingFrequency: string;
  
  // 3. Dietary Habits & Preferences
  dietaryPreference: string;
  allergiesIntolerances: string[];
  foodAversions: string[];
  mealsPerDay: string;
  waterIntake: string;
  
  // 4. Emotional & Behavioral
  emotionalEating: string[];
  stressLevel: string;
  sleepQuality: string;
  energyLevels: string;
  
  // 5. Clinical & Bowel
  bowelMovement: string;
  medicalConditions: string[];
  currentSupplements: string[];
  medications: string;
}

export interface NutritionalPlan {
  id: string;
  createdAt: string;
  
  // Macros & Calories
  tdee: number;
  targetCalories: number;
  macros: {
    protein: number; // in grams
    carbs: number; // in grams
    fats: number; // in grams
  };
  
  // Guidelines
  waterIntakeGoal: string;
  strategySummary: string;
  emotionalGuidelines: string;
  
  // Meals
  meals: Meal[];
  
  // Supplementation
  supplements: SupplementRecommendation[];
}

export interface Meal {
  name: string;
  time: string;
  options: MealOption[];
}

export interface MealOption {
  description: string;
  items: string[];
}

export interface SupplementRecommendation {
  name: string;
  dosage: string;
  timing: string;
  purpose: string;
}
