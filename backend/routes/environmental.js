const express = require('express');
const router = express.Router();
const { HfInference } = require('@huggingface/inference');

// Initialize Hugging Face inference
const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

// Environmental hazard detection models
const ENVIRONMENTAL_MODELS = {
  toxicity: 'martin-ha/toxic-comment-model',
  chemical: 'microsoft/DialoGPT-medium',
  risk: 'facebook/bart-large-cnn',
  sustainability: 'microsoft/DialoGPT-medium'
};

// Helper function to analyze text with Hugging Face model
async function analyzeWithModel(text, modelName, task = 'text-classification') {
  try {
    if (task === 'text-classification') {
      return await hf.textClassification({
        model: modelName,
        inputs: text
      });
    } else if (task === 'text-generation') {
      return await hf.textGeneration({
        model: modelName,
        inputs: text,
        parameters: {
          max_length: 200,
          temperature: 0.7
        }
      });
    }
  } catch (error) {
    console.error(`Error analyzing with model ${modelName}:`, error);
    return null;
  }
}

// Analyze product for environmental hazards
router.post('/analyze-hazards', async (req, res) => {
  try {
    const { productName, description, ingredients, category } = req.body;
    
    if (!productName || !description) {
      return res.status(400).json({ error: 'Product name and description are required' });
    }

    const analysisText = `${productName} - ${description} ${ingredients ? `Ingredients: ${ingredients}` : ''}`;
    
    // Analyze for different types of hazards
    const hazardAnalysis = {
      toxicity: null,
      chemicalRisks: null,
      environmentalImpact: null,
      sustainabilityScore: null,
      recommendations: []
    };

    // Toxicity analysis
    try {
      const toxicityResult = await analyzeWithModel(
        analysisText, 
        ENVIRONMENTAL_MODELS.toxicity
      );
      hazardAnalysis.toxicity = toxicityResult;
    } catch (error) {
      console.error('Toxicity analysis error:', error);
    }

    // Chemical risk assessment
    try {
      const chemicalPrompt = `Analyze the environmental risks of this product: ${analysisText}`;
      const chemicalResult = await analyzeWithModel(
        chemicalPrompt,
        ENVIRONMENTAL_MODELS.chemical,
        'text-generation'
      );
      hazardAnalysis.chemicalRisks = chemicalResult;
    } catch (error) {
      console.error('Chemical analysis error:', error);
    }

    // Environmental impact assessment
    try {
      const impactPrompt = `Environmental impact assessment for: ${analysisText}`;
      const impactResult = await analyzeWithModel(
        impactPrompt,
        ENVIRONMENTAL_MODELS.risk,
        'text-generation'
      );
      hazardAnalysis.environmentalImpact = impactResult;
    } catch (error) {
      console.error('Environmental impact analysis error:', error);
    }

    // Generate recommendations
    const recommendations = generateEnvironmentalRecommendations(hazardAnalysis, category);
    hazardAnalysis.recommendations = recommendations;

    // Calculate overall risk score
    const riskScore = calculateRiskScore(hazardAnalysis);
    hazardAnalysis.riskScore = riskScore;

    res.json({
      success: true,
      data: hazardAnalysis,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Environmental analysis error:', error);
    res.status(500).json({ 
      error: 'Failed to analyze environmental hazards',
      details: error.message 
    });
  }
});

// Analyze multiple products for comparison
router.post('/compare-products', async (req, res) => {
  try {
    const { products } = req.body;
    
    if (!products || !Array.isArray(products) || products.length < 2) {
      return res.status(400).json({ error: 'At least 2 products are required for comparison' });
    }

    const comparisonResults = [];

    for (const product of products) {
      const analysis = await analyzeProductHazards(product);
      comparisonResults.push({
        productId: product.id,
        productName: product.name,
        analysis
      });
    }

    // Generate comparison insights
    const comparisonInsights = generateComparisonInsights(comparisonResults);

    res.json({
      success: true,
      data: {
        products: comparisonResults,
        insights: comparisonInsights,
        recommendations: generateComparisonRecommendations(comparisonResults)
      }
    });

  } catch (error) {
    console.error('Product comparison error:', error);
    res.status(500).json({ 
      error: 'Failed to compare products',
      details: error.message 
    });
  }
});

// Get environmental compliance checklist
router.get('/compliance-checklist', (req, res) => {
  const checklist = {
    categories: [
      {
        name: 'Chemical Safety',
        items: [
          'Contains hazardous chemicals',
          'Proper disposal instructions',
          'Safety data sheets available',
          'Biodegradable components',
          'Non-toxic alternatives available'
        ]
      },
      {
        name: 'Packaging',
        items: [
          'Recyclable packaging',
          'Minimal packaging waste',
          'Biodegradable materials',
          'Reusable containers',
          'Local sourcing'
        ]
      },
      {
        name: 'Manufacturing',
        items: [
          'Energy efficient production',
          'Water conservation',
          'Waste reduction',
          'Renewable energy use',
          'Carbon footprint tracking'
        ]
      },
      {
        name: 'End-of-Life',
        items: [
          'Easy to disassemble',
          'Recyclable components',
          'Biodegradable materials',
          'Take-back programs',
          'Circular economy design'
        ]
      }
    ]
  };

  res.json({
    success: true,
    data: checklist
  });
});

// Helper function to analyze individual product hazards
async function analyzeProductHazards(product) {
  const analysisText = `${product.name} - ${product.description} ${product.ingredients ? `Ingredients: ${product.ingredients}` : ''}`;
  
  const hazards = {
    toxicity: null,
    chemicalRisks: null,
    environmentalImpact: null,
    riskScore: 0
  };

  try {
    // Simplified analysis for demo purposes
    const toxicityKeywords = ['toxic', 'hazardous', 'dangerous', 'poison', 'carcinogen'];
    const chemicalKeywords = ['chemical', 'synthetic', 'artificial', 'preservative'];
    const environmentalKeywords = ['non-biodegradable', 'plastic', 'pollution', 'waste'];

    const text = analysisText.toLowerCase();
    
    hazards.toxicity = {
      score: toxicityKeywords.some(keyword => text.includes(keyword)) ? 0.7 : 0.2,
      label: toxicityKeywords.some(keyword => text.includes(keyword)) ? 'HIGH' : 'LOW'
    };

    hazards.chemicalRisks = {
      score: chemicalKeywords.some(keyword => text.includes(keyword)) ? 0.6 : 0.3,
      label: chemicalKeywords.some(keyword => text.includes(keyword)) ? 'MODERATE' : 'LOW'
    };

    hazards.environmentalImpact = {
      score: environmentalKeywords.some(keyword => text.includes(keyword)) ? 0.8 : 0.2,
      label: environmentalKeywords.some(keyword => text.includes(keyword)) ? 'HIGH' : 'LOW'
    };

    hazards.riskScore = (hazards.toxicity.score + hazards.chemicalRisks.score + hazards.environmentalImpact.score) / 3;

  } catch (error) {
    console.error('Error in product hazard analysis:', error);
  }

  return hazards;
}

// Helper function to generate environmental recommendations
function generateEnvironmentalRecommendations(analysis, category) {
  const recommendations = [];

  if (analysis.toxicity && analysis.toxicity.score > 0.5) {
    recommendations.push({
      type: 'warning',
      title: 'Toxicity Risk Detected',
      description: 'This product may contain toxic substances. Consider alternatives with natural ingredients.',
      priority: 'high'
    });
  }

  if (analysis.chemicalRisks && analysis.chemicalRisks.score > 0.5) {
    recommendations.push({
      type: 'info',
      title: 'Chemical Composition Alert',
      description: 'Product contains synthetic chemicals. Look for organic or natural alternatives.',
      priority: 'medium'
    });
  }

  if (analysis.environmentalImpact && analysis.environmentalImpact.score > 0.5) {
    recommendations.push({
      type: 'warning',
      title: 'Environmental Impact High',
      description: 'This product may have significant environmental impact. Consider eco-friendly alternatives.',
      priority: 'high'
    });
  }

  // Category-specific recommendations
  if (category === 'electronics') {
    recommendations.push({
      type: 'info',
      title: 'E-Waste Consideration',
      description: 'Ensure proper disposal and recycling of electronic components.',
      priority: 'medium'
    });
  } else if (category === 'cosmetics') {
    recommendations.push({
      type: 'info',
      title: 'Skin Safety',
      description: 'Check for hypoallergenic and dermatologically tested alternatives.',
      priority: 'medium'
    });
  }

  return recommendations;
}

// Helper function to calculate risk score
function calculateRiskScore(analysis) {
  let score = 0;
  let factors = 0;

  if (analysis.toxicity) {
    score += analysis.toxicity.score || 0;
    factors++;
  }

  if (analysis.chemicalRisks) {
    score += analysis.chemicalRisks.score || 0;
    factors++;
  }

  if (analysis.environmentalImpact) {
    score += analysis.environmentalImpact.score || 0;
    factors++;
  }

  return factors > 0 ? score / factors : 0;
}

// Helper function to generate comparison insights
function generateComparisonInsights(comparisonResults) {
  const insights = [];

  // Find the most environmentally friendly product
  const sortedByRisk = [...comparisonResults].sort((a, b) => 
    a.analysis.riskScore - b.analysis.riskScore
  );

  insights.push({
    type: 'best_choice',
    title: 'Most Environmentally Friendly',
    description: `${sortedByRisk[0].productName} has the lowest environmental risk score.`,
    product: sortedByRisk[0]
  });

  // Find the highest risk product
  insights.push({
    type: 'warning',
    title: 'Highest Environmental Risk',
    description: `${sortedByRisk[sortedByRisk.length - 1].productName} has the highest environmental risk score.`,
    product: sortedByRisk[sortedByRisk.length - 1]
  });

  return insights;
}

// Helper function to generate comparison recommendations
function generateComparisonRecommendations(comparisonResults) {
  const recommendations = [];

  const avgRiskScore = comparisonResults.reduce((sum, product) => 
    sum + product.analysis.riskScore, 0
  ) / comparisonResults.length;

  if (avgRiskScore > 0.6) {
    recommendations.push({
      type: 'warning',
      title: 'High Average Risk',
      description: 'The compared products have high environmental risk scores. Consider more eco-friendly alternatives.',
      priority: 'high'
    });
  }

  return recommendations;
}

module.exports = router; 