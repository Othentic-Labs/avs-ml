const fs = require('fs');

// Load the JSON files
const model1 = JSON.parse(fs.readFileSync('poor_performance_model.json', 'utf8'));
const model2 = JSON.parse(fs.readFileSync('improved_performance_model.json', 'utf8'));

// Compare the performance
const comparePerformance = (model1, model2) => {
  const accuracy1 = model1.performance.accuracy;
  const accuracy2 = model2.performance.accuracy;

  if (accuracy1 > accuracy2) {
    console.log('The first model has better performance.');
  } else if (accuracy1 < accuracy2) {
    console.log('The second model has better performance.');
  } else {
    console.log('Both models have the same performance.');
  }
};

// Run the comparison
comparePerformance(model1, model2);