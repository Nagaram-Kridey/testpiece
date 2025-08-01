const express = require('express');
const router = express.Router();
const natural = require('natural');
const nlp = require('compromise');

// Initialize sentiment analyzer
const analyzer = new natural.SentimentAnalyzer('English', natural.PorterStemmer, 'afinn');

// Analyze product sentiment
router.post('/sentiment', (req, res) => {
  try {
    const { text, reviews } = req.body;
    
    if (!text && (!reviews || reviews.length === 0)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Text or reviews are required' 
      });
    }

    let analysisText = text || '';
    if (reviews && reviews.length > 0) {
      analysisText = reviews.map(review => review.text || review).join(' ');
    }

    // Perform sentiment analysis
    const sentimentScore = analyzer.getSentiment(analysisText.split(' '));
    
    // Categorize sentiment
    let sentiment = 'neutral';
    if (sentimentScore > 0.5) sentiment = 'positive';
    else if (sentimentScore < -0.5) sentiment = 'negative';

    // Extract keywords
    const doc = nlp(analysisText);
    const keywords = doc.nouns().out('array').slice(0, 10);

    res.json({
      success: true,
      data: {
        sentiment,
        score: sentimentScore,
        keywords,
        textLength: analysisText.length,
        wordCount: analysisText.split(' ').length
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Analyze product performance
router.post('/performance', (req, res) => {
  try {
    const { 
      price, 
      views, 
      sales, 
      reviews, 
      rating,
      competitorPrices = [],
      marketData = {}
    } = req.body;

    if (!price) {
      return res.status(400).json({ 
        success: false, 
        error: 'Price is required' 
      });
    }

    // Calculate performance metrics
    const conversionRate = views > 0 ? (sales / views) * 100 : 0;
    const avgRating = rating || 0;
    const reviewCount = reviews ? reviews.length : 0;
    
    // Price analysis
    const avgCompetitorPrice = competitorPrices.length > 0 
      ? competitorPrices.reduce((sum, p) => sum + p, 0) / competitorPrices.length 
      : price;
    
    const pricePosition = price < avgCompetitorPrice ? 'competitive' : 
                         price > avgCompetitorPrice ? 'premium' : 'average';
    
    const priceDifference = ((price - avgCompetitorPrice) / avgCompetitorPrice) * 100;

    // Performance score (0-100)
    const performanceScore = Math.min(100, 
      (conversionRate * 0.3) + 
      (avgRating * 10) + 
      (Math.min(reviewCount, 100) * 0.1) +
      (pricePosition === 'competitive' ? 20 : pricePosition === 'average' ? 10 : 0)
    );

    res.json({
      success: true,
      data: {
        performanceScore: Math.round(performanceScore),
        conversionRate: Math.round(conversionRate * 100) / 100,
        avgRating,
        reviewCount,
        priceAnalysis: {
          position: pricePosition,
          difference: Math.round(priceDifference * 100) / 100,
          avgCompetitorPrice: Math.round(avgCompetitorPrice * 100) / 100
        },
        recommendations: generateRecommendations({
          conversionRate,
          avgRating,
          pricePosition,
          reviewCount
        })
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Market trend analysis
router.post('/market-trends', (req, res) => {
  try {
    const { category, historicalData, marketSize } = req.body;

    if (!category) {
      return res.status(400).json({ 
        success: false, 
        error: 'Category is required' 
      });
    }

    // Simulate market trend analysis
    const trends = {
      marketGrowth: Math.random() * 20 + 5, // 5-25% growth
      seasonality: ['Q1', 'Q2', 'Q3', 'Q4'].map(q => ({
        quarter: q,
        demand: Math.random() * 100 + 50
      })),
      keyDrivers: [
        'Digital transformation',
        'Sustainability focus',
        'Consumer preferences',
        'Technology adoption'
      ],
      opportunities: [
        'E-commerce expansion',
        'Product innovation',
        'Market penetration',
        'Customer experience'
      ],
      threats: [
        'Competition increase',
        'Economic uncertainty',
        'Regulatory changes',
        'Supply chain issues'
      ]
    };

    res.json({
      success: true,
      data: trends
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Generate recommendations based on analysis
function generateRecommendations(metrics) {
  const recommendations = [];

  if (metrics.conversionRate < 2) {
    recommendations.push({
      type: 'conversion',
      priority: 'high',
      suggestion: 'Improve product presentation and call-to-action elements',
      impact: 'Increase conversion rate by 20-30%'
    });
  }

  if (metrics.avgRating < 4) {
    recommendations.push({
      type: 'quality',
      priority: 'high',
      suggestion: 'Address customer feedback and improve product quality',
      impact: 'Boost customer satisfaction and ratings'
    });
  }

  if (metrics.pricePosition === 'premium' && metrics.conversionRate < 3) {
    recommendations.push({
      type: 'pricing',
      priority: 'medium',
      suggestion: 'Consider competitive pricing strategy or value proposition',
      impact: 'Improve market competitiveness'
    });
  }

  if (metrics.reviewCount < 10) {
    recommendations.push({
      type: 'engagement',
      priority: 'medium',
      suggestion: 'Encourage customer reviews and feedback',
      impact: 'Build social proof and trust'
    });
  }

  return recommendations;
}

module.exports = router; 