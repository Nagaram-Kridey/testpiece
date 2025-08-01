const express = require('express');
const router = express.Router();
const axios = require('axios');

// Get competitor analysis
router.post('/analyze', async (req, res) => {
  try {
    const { 
      productName, 
      category, 
      price, 
      brand,
      market = 'global'
    } = req.body;

    if (!productName || !category) {
      return res.status(400).json({ 
        success: false, 
        error: 'Product name and category are required' 
      });
    }

    // Simulate competitor data (in real app, this would come from external APIs)
    const competitors = generateCompetitorData(productName, category, price, brand);

    // Analyze competitive position
    const competitiveAnalysis = analyzeCompetitivePosition(price, competitors);

    res.json({
      success: true,
      data: {
        competitors,
        analysis: competitiveAnalysis,
        marketInsights: generateMarketInsights(category, market)
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get competitor details
router.get('/:id', (req, res) => {
  try {
    const competitorId = req.params.id;
    
    // Simulate competitor details
    const competitor = {
      id: competitorId,
      name: `Competitor ${competitorId}`,
      brand: 'Competitor Brand',
      price: Math.random() * 200 + 50,
      rating: (Math.random() * 2 + 3).toFixed(1),
      reviewCount: Math.floor(Math.random() * 1000) + 50,
      marketShare: (Math.random() * 15 + 2).toFixed(1),
      strengths: [
        'Strong brand recognition',
        'Wide distribution network',
        'Innovative features'
      ],
      weaknesses: [
        'Higher price point',
        'Limited customization',
        'Slower customer service'
      ],
      opportunities: [
        'Market expansion',
        'Product innovation',
        'Digital transformation'
      ],
      threats: [
        'New market entrants',
        'Changing regulations',
        'Economic uncertainty'
      ]
    };

    res.json({ success: true, data: competitor });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Compare products
router.post('/compare', (req, res) => {
  try {
    const { products } = req.body;

    if (!products || products.length < 2) {
      return res.status(400).json({ 
        success: false, 
        error: 'At least 2 products are required for comparison' 
      });
    }

    const comparison = {
      priceComparison: comparePrices(products),
      featureComparison: compareFeatures(products),
      marketPosition: compareMarketPosition(products),
      recommendations: generateComparisonRecommendations(products)
    };

    res.json({ success: true, data: comparison });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Market share analysis
router.post('/market-share', (req, res) => {
  try {
    const { category, region } = req.body;

    if (!category) {
      return res.status(400).json({ 
        success: false, 
        error: 'Category is required' 
      });
    }

    // Simulate market share data
    const marketShareData = {
      category,
      region: region || 'Global',
      totalMarketSize: Math.floor(Math.random() * 1000000) + 100000,
      competitors: [
        { name: 'Market Leader', share: 25.5, revenue: 250000 },
        { name: 'Strong Competitor', share: 18.2, revenue: 182000 },
        { name: 'Your Product', share: 12.8, revenue: 128000 },
        { name: 'Emerging Player', share: 8.9, revenue: 89000 },
        { name: 'Others', share: 34.6, revenue: 346000 }
      ],
      trends: {
        growthRate: (Math.random() * 10 + 5).toFixed(1),
        seasonality: ['Q1', 'Q2', 'Q3', 'Q4'].map(q => ({
          quarter: q,
          demand: Math.random() * 100 + 50
        }))
      }
    };

    res.json({ success: true, data: marketShareData });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Helper functions
function generateCompetitorData(productName, category, price, brand) {
  const competitors = [];
  const competitorNames = [
    'PremiumTech Pro',
    'SmartSolutions Elite',
    'InnovateMax Plus',
    'FutureTech Advanced',
    'NextGen Premium'
  ];

  for (let i = 0; i < 5; i++) {
    const basePrice = price * (0.8 + Math.random() * 0.6); // ±30% price variation
    competitors.push({
      id: `comp_${i + 1}`,
      name: competitorNames[i],
      brand: `${competitorNames[i]} Brand`,
      price: Math.round(basePrice * 100) / 100,
      rating: (Math.random() * 2 + 3).toFixed(1), // 3-5 rating
      reviewCount: Math.floor(Math.random() * 2000) + 100,
      marketShare: (Math.random() * 20 + 5).toFixed(1),
      features: generateRandomFeatures(),
      strengths: generateRandomStrengths(),
      weaknesses: generateRandomWeaknesses()
    });
  }

  return competitors.sort((a, b) => b.marketShare - a.marketShare);
}

function analyzeCompetitivePosition(price, competitors) {
  const avgCompetitorPrice = competitors.reduce((sum, comp) => sum + comp.price, 0) / competitors.length;
  const pricePosition = price < avgCompetitorPrice ? 'competitive' : 
                       price > avgCompetitorPrice ? 'premium' : 'average';
  
  const priceDifference = ((price - avgCompetitorPrice) / avgCompetitorPrice) * 100;
  
  return {
    pricePosition,
    priceDifference: Math.round(priceDifference * 100) / 100,
    avgCompetitorPrice: Math.round(avgCompetitorPrice * 100) / 100,
    competitiveAdvantage: price < avgCompetitorPrice ? 'Price' : 'Quality/Features',
    recommendations: generateCompetitiveRecommendations(price, competitors)
  };
}

function generateMarketInsights(category, market) {
  return {
    marketSize: Math.floor(Math.random() * 5000000) + 1000000,
    growthRate: (Math.random() * 15 + 8).toFixed(1),
    keyTrends: [
      'Digital transformation acceleration',
      'Sustainability focus',
      'Personalization demand',
      'AI/ML integration',
      'Mobile-first approach'
    ],
    opportunities: [
      'Emerging markets expansion',
      'Product innovation',
      'Partnership opportunities',
      'Digital marketing growth'
    ],
    threats: [
      'Economic uncertainty',
      'Regulatory changes',
      'Supply chain disruptions',
      'Competition intensification'
    ]
  };
}

function generateRandomFeatures() {
  const allFeatures = [
    'AI-powered analytics',
    'Cloud integration',
    'Mobile app',
    'Real-time monitoring',
    'Customizable dashboard',
    'API access',
    '24/7 support',
    'Advanced security',
    'Scalable architecture',
    'Multi-language support'
  ];
  
  return allFeatures
    .sort(() => Math.random() - 0.5)
    .slice(0, Math.floor(Math.random() * 5) + 3);
}

function generateRandomStrengths() {
  const strengths = [
    'Strong brand recognition',
    'Wide distribution network',
    'Innovative technology',
    'Excellent customer service',
    'Competitive pricing',
    'Product reliability',
    'Market expertise',
    'Strong partnerships'
  ];
  
  return strengths
    .sort(() => Math.random() - 0.5)
    .slice(0, Math.floor(Math.random() * 3) + 2);
}

function generateRandomWeaknesses() {
  const weaknesses = [
    'Limited customization',
    'Higher price point',
    'Slower innovation cycle',
    'Limited market presence',
    'Customer service delays',
    'Complex implementation',
    'Limited integrations',
    'Resource constraints'
  ];
  
  return weaknesses
    .sort(() => Math.random() - 0.5)
    .slice(0, Math.floor(Math.random() * 3) + 1);
}

function generateCompetitiveRecommendations(price, competitors) {
  const recommendations = [];
  const avgPrice = competitors.reduce((sum, comp) => sum + comp.price, 0) / competitors.length;
  
  if (price > avgPrice * 1.2) {
    recommendations.push({
      type: 'pricing',
      priority: 'high',
      suggestion: 'Consider price optimization to improve competitiveness',
      impact: 'Potential 15-25% increase in market share'
    });
  }
  
  if (competitors.some(comp => comp.rating > 4.5)) {
    recommendations.push({
      type: 'quality',
      priority: 'medium',
      suggestion: 'Focus on product quality and customer satisfaction',
      impact: 'Improve brand reputation and customer loyalty'
    });
  }
  
  return recommendations;
}

function comparePrices(products) {
  const prices = products.map(p => p.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const avgPrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;
  
  return {
    priceRange: { min: minPrice, max: maxPrice, average: avgPrice },
    priceDifference: ((maxPrice - minPrice) / minPrice * 100).toFixed(1),
    recommendations: generatePriceComparisonRecommendations(products)
  };
}

function compareFeatures(products) {
  const allFeatures = new Set();
  products.forEach(product => {
    if (product.features) {
      product.features.forEach(feature => allFeatures.add(feature));
    }
  });
  
  const featureMatrix = Array.from(allFeatures).map(feature => ({
    feature,
    availability: products.map(product => ({
      product: product.name,
      hasFeature: product.features ? product.features.includes(feature) : false
    }))
  }));
  
  return featureMatrix;
}

function compareMarketPosition(products) {
  return products.map(product => ({
    name: product.name,
    marketShare: product.marketShare || 0,
    rating: product.rating || 0,
    reviewCount: product.reviewCount || 0,
    competitiveScore: calculateCompetitiveScore(product)
  }));
}

function calculateCompetitiveScore(product) {
  const ratingScore = (product.rating || 0) * 20; // 0-100
  const marketShareScore = Math.min((product.marketShare || 0) * 2, 100); // 0-100
  const reviewScore = Math.min((product.reviewCount || 0) / 10, 100); // 0-100
  
  return Math.round((ratingScore + marketShareScore + reviewScore) / 3);
}

function generateComparisonRecommendations(products) {
  const recommendations = [];
  
  // Price-based recommendations
  const prices = products.map(p => p.price);
  const avgPrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;
  
  products.forEach(product => {
    if (product.price > avgPrice * 1.3) {
      recommendations.push({
        product: product.name,
        type: 'pricing',
        suggestion: 'Consider price optimization for better market positioning'
      });
    }
  });
  
  // Quality-based recommendations
  products.forEach(product => {
    if (product.rating && product.rating < 4.0) {
      recommendations.push({
        product: product.name,
        type: 'quality',
        suggestion: 'Focus on improving product quality and customer satisfaction'
      });
    }
  });
  
  return recommendations;
}

function generatePriceComparisonRecommendations(products) {
  const recommendations = [];
  const prices = products.map(p => p.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  
  if (maxPrice / minPrice > 2) {
    recommendations.push({
      type: 'pricing',
      suggestion: 'Significant price variation detected. Consider market positioning strategy.',
      impact: 'High'
    });
  }
  
  return recommendations;
}

module.exports = router; 