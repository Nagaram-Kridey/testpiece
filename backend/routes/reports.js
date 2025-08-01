const express = require('express');
const router = express.Router();
const PDFDocument = require('pdfkit');
const { ChartJSNodeCanvas } = require('chartjs-node-canvas');
const fs = require('fs');
const path = require('path');

// Generate PDF report
router.post('/generate', async (req, res) => {
  try {
    const { 
      productData, 
      analysisData, 
      competitorData, 
      reportType = 'comprehensive' 
    } = req.body;

    if (!productData) {
      return res.status(400).json({ 
        success: false, 
        error: 'Product data is required' 
      });
    }

    // Create PDF document
    const doc = new PDFDocument({ 
      size: 'A4', 
      margin: 50,
      info: {
        Title: `Product Analysis Report - ${productData.name}`,
        Author: 'Product Analyzer',
        Subject: 'Product Analysis Report',
        Keywords: 'product, analysis, report',
        CreationDate: new Date()
      }
    });

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="product-analysis-${Date.now()}.pdf"`);

    // Pipe PDF to response
    doc.pipe(res);

    // Generate report content
    await generateReportContent(doc, productData, analysisData, competitorData, reportType);

    // Finalize PDF
    doc.end();

  } catch (error) {
    console.error('PDF generation error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Generate report content
async function generateReportContent(doc, productData, analysisData, competitorData, reportType) {
  // Header
  doc.fontSize(24)
     .font('Helvetica-Bold')
     .text('Product Analysis Report', { align: 'center' })
     .moveDown();

  doc.fontSize(12)
     .font('Helvetica')
     .text(`Generated on: ${new Date().toLocaleDateString()}`, { align: 'center' })
     .moveDown(2);

  // Product Overview
  doc.fontSize(18)
     .font('Helvetica-Bold')
     .text('Product Overview')
     .moveDown();

  doc.fontSize(12)
     .font('Helvetica')
     .text(`Name: ${productData.name}`)
     .text(`Category: ${productData.category}`)
     .text(`Brand: ${productData.brand}`)
     .text(`Price: $${productData.price}`)
     .text(`Description: ${productData.description}`)
     .moveDown();

  // Analysis Results
  if (analysisData) {
    doc.fontSize(18)
       .font('Helvetica-Bold')
       .text('Analysis Results')
       .moveDown();

    if (analysisData.sentiment) {
      doc.fontSize(14)
         .font('Helvetica-Bold')
         .text('Sentiment Analysis')
         .moveDown();

      doc.fontSize(12)
         .font('Helvetica')
         .text(`Sentiment: ${analysisData.sentiment.sentiment}`)
         .text(`Score: ${analysisData.sentiment.score.toFixed(2)}`)
         .text(`Keywords: ${analysisData.sentiment.keywords.join(', ')}`)
         .moveDown();
    }

    if (analysisData.performance) {
      doc.fontSize(14)
         .font('Helvetica-Bold')
         .text('Performance Analysis')
         .moveDown();

      doc.fontSize(12)
         .font('Helvetica')
         .text(`Performance Score: ${analysisData.performance.performanceScore}/100`)
         .text(`Conversion Rate: ${analysisData.performance.conversionRate}%`)
         .text(`Average Rating: ${analysisData.performance.avgRating}/5`)
         .text(`Review Count: ${analysisData.performance.reviewCount}`)
         .moveDown();

      // Price Analysis
      const priceAnalysis = analysisData.performance.priceAnalysis;
      doc.text(`Price Position: ${priceAnalysis.position}`)
         .text(`Price Difference: ${priceAnalysis.difference}%`)
         .text(`Average Competitor Price: $${priceAnalysis.avgCompetitorPrice}`)
         .moveDown();

      // Recommendations
      if (analysisData.performance.recommendations.length > 0) {
        doc.fontSize(14)
           .font('Helvetica-Bold')
           .text('Recommendations')
           .moveDown();

        analysisData.performance.recommendations.forEach((rec, index) => {
          doc.fontSize(12)
             .font('Helvetica-Bold')
             .text(`${index + 1}. ${rec.suggestion}`)
             .font('Helvetica')
             .text(`   Priority: ${rec.priority}`)
             .text(`   Impact: ${rec.impact}`)
             .moveDown(0.5);
        });
      }
    }
  }

  // Competitor Analysis
  if (competitorData && competitorData.length > 0) {
    doc.fontSize(18)
       .font('Helvetica-Bold')
       .text('Competitor Analysis')
       .moveDown();

    competitorData.forEach((competitor, index) => {
      doc.fontSize(14)
         .font('Helvetica-Bold')
         .text(`${index + 1}. ${competitor.name}`)
         .moveDown();

      doc.fontSize(12)
         .font('Helvetica')
         .text(`   Price: $${competitor.price}`)
         .text(`   Rating: ${competitor.rating}/5`)
         .text(`   Market Share: ${competitor.marketShare}%`)
         .moveDown();
    });
  }

  // Market Trends
  if (analysisData && analysisData.marketTrends) {
    doc.fontSize(18)
       .font('Helvetica-Bold')
       .text('Market Trends')
       .moveDown();

    const trends = analysisData.marketTrends;
    doc.fontSize(12)
       .font('Helvetica')
       .text(`Market Growth: ${trends.marketGrowth.toFixed(1)}%`)
       .moveDown();

    doc.fontSize(14)
       .font('Helvetica-Bold')
       .text('Key Drivers:')
       .moveDown();

    trends.keyDrivers.forEach(driver => {
      doc.fontSize(12)
         .font('Helvetica')
         .text(`• ${driver}`)
         .moveDown(0.5);
    });

    doc.fontSize(14)
       .font('Helvetica-Bold')
       .text('Opportunities:')
       .moveDown();

    trends.opportunities.forEach(opportunity => {
      doc.fontSize(12)
         .font('Helvetica')
         .text(`• ${opportunity}`)
         .moveDown(0.5);
    });
  }

  // Footer
  doc.fontSize(10)
     .font('Helvetica')
     .text('Generated by Product Analyzer', { align: 'center' });
}

// Get report templates
router.get('/templates', (req, res) => {
  try {
    const templates = [
      {
        id: 'comprehensive',
        name: 'Comprehensive Report',
        description: 'Full product analysis with all metrics and recommendations',
        sections: ['overview', 'sentiment', 'performance', 'competitors', 'trends']
      },
      {
        id: 'executive',
        name: 'Executive Summary',
        description: 'High-level overview for decision makers',
        sections: ['overview', 'performance', 'recommendations']
      },
      {
        id: 'detailed',
        name: 'Detailed Analysis',
        description: 'In-depth technical analysis with charts',
        sections: ['overview', 'sentiment', 'performance', 'competitors', 'trends', 'charts']
      }
    ];

    res.json({ success: true, data: templates });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Generate chart data
router.post('/charts', async (req, res) => {
  try {
    const { chartType, data } = req.body;

    if (!chartType || !data) {
      return res.status(400).json({ 
        success: false, 
        error: 'Chart type and data are required' 
      });
    }

    const chartJSNodeCanvas = new ChartJSNodeCanvas({ 
      width: 600, 
      height: 400,
      backgroundColour: 'white'
    });

    let configuration;
    switch (chartType) {
      case 'performance':
        configuration = {
          type: 'radar',
          data: {
            labels: ['Conversion Rate', 'Rating', 'Reviews', 'Price Position', 'Market Share'],
            datasets: [{
              label: 'Performance Metrics',
              data: [
                data.conversionRate || 0,
                data.avgRating || 0,
                Math.min(data.reviewCount || 0, 100),
                data.pricePosition === 'competitive' ? 100 : data.pricePosition === 'average' ? 50 : 0,
                data.marketShare || 0
              ],
              backgroundColor: 'rgba(54, 162, 235, 0.2)',
              borderColor: 'rgba(54, 162, 235, 1)',
              borderWidth: 2
            }]
          },
          options: {
            scales: {
              r: {
                beginAtZero: true,
                max: 100
              }
            }
          }
        };
        break;

      case 'sentiment':
        configuration = {
          type: 'doughnut',
          data: {
            labels: ['Positive', 'Neutral', 'Negative'],
            datasets: [{
              data: [
                data.positive || 0,
                data.neutral || 0,
                data.negative || 0
              ],
              backgroundColor: [
                'rgba(75, 192, 192, 0.8)',
                'rgba(201, 203, 207, 0.8)',
                'rgba(255, 99, 132, 0.8)'
              ]
            }]
          }
        };
        break;

      default:
        return res.status(400).json({ 
          success: false, 
          error: 'Unsupported chart type' 
        });
    }

    const image = await chartJSNodeCanvas.renderToBuffer(configuration);
    
    res.setHeader('Content-Type', 'image/png');
    res.send(image);

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router; 