interface NutritionFacts {
  servingInfo: {
    servingsPerContainer: string;
    servingSize: string;
    calories: string;
  };
  macronutrients: {
    totalFat: string;
    saturatedFat: string;
    transFat: string;
    cholesterol: string;
    sodium: string;
    totalCarbohydrate: string;
    dietaryFiber: string;
    totalSugars: string;
    addedSugars: string;
    protein: string;
  };
  vitaminsAndMinerals: {
    vitaminD: string;
    calcium: string;
    iron: string;
    potassium: string;
  };
}

export function parseNutritionText(text: string): NutritionFacts {
  // Remove 'mgm' prefix and other cleanup
  const cleanText = text
    .replace(/^mgm/, '')
    .replace(/\s+/g, ' ')
    .trim();

  // Extract serving information
  const servingsMatch = cleanText.match(/(\d+)\s*servings per container/);
  const servingSizeMatch = cleanText.match(/Serving size\s*([\d/]+\s*cup\s*\(\d+g\))/);
  const caloriesMatch = cleanText.match(/Calories\s*(\d+)/);

  // Extract macronutrients
  const totalFatMatch = cleanText.match(/Total Fat\s*([\d.]+g\s*\d+%)/);
  const saturatedFatMatch = cleanText.match(/Saturated Fat\s*([\d.]+g\s*\d+%)/);
  const transFatMatch = cleanText.match(/Trans Fat\s*([\d.]+g)/);
  const cholesterolMatch = cleanText.match(/Cholesterol\s*([\d.]+mg\s*\d+%)/);
  const sodiumMatch = cleanText.match(/Sodium\s*([\d.]+mg\s*\d+%)/);
  const carbMatch = cleanText.match(/Total Carbohydrate\s*([\d.]+g\s*\d+%)/);
  const fiberMatch = cleanText.match(/Dietary Fiber\s*([\d.]+g\s*\d+%)/);
  const sugarsMatch = cleanText.match(/Total Sugars\s*([\d.]+g)/);
  const addedSugarsMatch = cleanText.match(/Added Sugars\s*([\d.]+g\s*\d+%)/);
  const proteinMatch = cleanText.match(/Protein\s*([\d.]+g)/);

  // Extract vitamins and minerals
  const vitaminDMatch = cleanText.match(/Vitamin D\s*([\d.]+mcg\s*\d+%)/);
  const calciumMatch = cleanText.match(/Calcium\s*([\d.]+mg\s*\d+%)/);
  const ironMatch = cleanText.match(/Iron\s*([\d.]+mg\s*\d+%)/);
  const potassiumMatch = cleanText.match(/Potassium\s*([\d.]+mg\s*\d+%)/);

  return {
    servingInfo: {
      servingsPerContainer: servingsMatch?.[1] || 'N/A',
      servingSize: servingSizeMatch?.[1] || 'N/A',
      calories: caloriesMatch?.[1] || 'N/A',
    },
    macronutrients: {
      totalFat: totalFatMatch?.[1] || 'N/A',
      saturatedFat: saturatedFatMatch?.[1] || 'N/A',
      transFat: transFatMatch?.[1] || 'N/A',
      cholesterol: cholesterolMatch?.[1] || 'N/A',
      sodium: sodiumMatch?.[1] || 'N/A',
      totalCarbohydrate: carbMatch?.[1] || 'N/A',
      dietaryFiber: fiberMatch?.[1] || 'N/A',
      totalSugars: sugarsMatch?.[1] || 'N/A',
      addedSugars: addedSugarsMatch?.[1] || 'N/A',
      protein: proteinMatch?.[1] || 'N/A',
    },
    vitaminsAndMinerals: {
      vitaminD: vitaminDMatch?.[1] || 'N/A',
      calcium: calciumMatch?.[1] || 'N/A',
      iron: ironMatch?.[1] || 'N/A',
      potassium: potassiumMatch?.[1] || 'N/A',
    },
  };
}

export function formatNutritionFacts(facts: NutritionFacts): string {
  return `## 📊 Nutrition Facts Summary

### 🍽️ Serving Information
| Category | Amount |
|----------|---------|
| Servings Per Container | ${facts.servingInfo.servingsPerContainer} |
| Serving Size | ${facts.servingInfo.servingSize} |
| Calories | ${facts.servingInfo.calories} |

### 📈 Macronutrients
| Nutrient | Amount |
|----------|---------|
| Total Fat | ${facts.macronutrients.totalFat} |
| Saturated Fat | ${facts.macronutrients.saturatedFat} |
| Trans Fat | ${facts.macronutrients.transFat} |
| Cholesterol | ${facts.macronutrients.cholesterol} |
| Sodium | ${facts.macronutrients.sodium} |
| Total Carbohydrate | ${facts.macronutrients.totalCarbohydrate} |
| Dietary Fiber | ${facts.macronutrients.dietaryFiber} |
| Total Sugars | ${facts.macronutrients.totalSugars} |
| Added Sugars | ${facts.macronutrients.addedSugars} |
| Protein | ${facts.macronutrients.protein} |

### 🧪 Vitamins and Minerals
| Nutrient | Amount |
|----------|---------|
| Vitamin D | ${facts.vitaminsAndMinerals.vitaminD} |
| Calcium | ${facts.vitaminsAndMinerals.calcium} |
| Iron | ${facts.vitaminsAndMinerals.iron} |
| Potassium | ${facts.vitaminsAndMinerals.potassium} |

---
💬 What would you like to know about these nutrition facts? You can ask about:
- Daily value percentages
- Specific nutrients
- Serving size information
- Caloric content
- Dietary considerations`;
} 