// same imports...
import React, { useState } from 'react';
import { useProduct } from '../context/ProductContext';
import {
  Users,
  TrendingUp,
  DollarSign,
  Star,
  Eye,
  BarChart3,
  Target,
  AlertTriangle
} from 'lucide-react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function Competitors() {
  const { products = [], competitorData = {}, analyzeCompetitors, loading } = useProduct();
  const [selectedProductId, setSelectedProductId] = useState('');
  const [analyzing, setAnalyzing] = useState(false);

  const handleAnalyzeCompetitors = async () => {
    if (!selectedProductId) return;

    setAnalyzing(true);
    try {
      await analyzeCompetitors(selectedProductId);
    } catch (error) {
      console.error('Competitor analysis failed:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  const competitorsList = Array.isArray(competitorData?.competitors) ? competitorData.competitors : [];

  const marketShareData = {
    labels: competitorsList.map(comp => comp.name),
    datasets: [{
      label: 'Market Share (%)',
      data: competitorsList.map(comp => comp.marketShare),
      backgroundColor: ['rgba(59,130,246,0.8)', 'rgba(16,185,129,0.8)', 'rgba(245,158,11,0.8)', 'rgba(239,68,68,0.8)', 'rgba(139,92,246,0.8)'],
      borderColor: ['rgba(59,130,246,1)', 'rgba(16,185,129,1)', 'rgba(245,158,11,1)', 'rgba(239,68,68,1)', 'rgba(139,92,246,1)'],
      borderWidth: 1,
    }],
  };

  const priceComparisonData = {
    labels: competitorsList.map(comp => comp.name),
    datasets: [{
      label: 'Price ($)',
      data: competitorsList.map(comp => comp.price),
      backgroundColor: 'rgba(34,197,94,0.8)',
      borderColor: 'rgba(34,197,94,1)',
      borderWidth: 1,
    }],
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Competitor Analysis</h1>
          <p className="text-gray-600">Analyze your competitors and market position</p>
        </div>
      </div>

      {/* Analysis Controls */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Product</label>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Choose a product</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={handleAnalyzeCompetitors}
              disabled={!selectedProductId || analyzing}
              className="w-full inline-flex items-center justify-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
            >
              {analyzing ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Analyzing...</span>
                </div>
              ) : (
                <>
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Analyze Competitors
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Competitor Analysis Results */}
      {competitorsList.length > 0 ? (
        <div className="space-y-6">
          {/* Competitive Position */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Competitive Position</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Target className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Price Position</p>
                  <p className="text-lg font-semibold text-gray-900 capitalize">
                    {competitorData.analysis?.pricePosition || 'Unknown'}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Price Difference</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {competitorData.analysis?.priceDifference ?? 0}%
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Competitive Advantage</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {competitorData.analysis?.competitiveAdvantage || 'None'}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Recommendations</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {competitorData.analysis?.recommendations?.length ?? 0}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Competitors List */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Top Competitors</h2>
            </div>
            <div className="p-6 space-y-4">
              {competitorsList.map((competitor, index) => (
                <div key={competitor.id || index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                        <span className="text-lg font-bold text-primary-600">#{index + 1}</span>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{competitor.name}</h3>
                        <p className="text-sm text-gray-600">{competitor.brand}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-6">
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Price</p>
                        <p className="font-semibold text-gray-900">${competitor.price}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Rating</p>
                        <div className="flex items-center space-x-1">
                          <span className="font-semibold text-gray-900">{competitor.rating}</span>
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        </div>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Market Share</p>
                        <p className="font-semibold text-gray-900">{competitor.marketShare}%</p>
                      </div>
                      <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900 mb-2">Strengths</p>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {competitor?.strengths?.slice(0, 2)?.map((s, idx) => <li key={idx}>• {s}</li>)}
                      </ul>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 mb-2">Weaknesses</p>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {competitor?.weaknesses?.slice(0, 2)?.map((w, idx) => <li key={idx}>• {w}</li>)}
                      </ul>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 mb-2">Features</p>
                      <div className="flex flex-wrap gap-1">
                        {competitor?.features?.slice(0, 3)?.map((f, idx) => (
                          <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                            {f}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Market Share Comparison</h3>
              <div className="h-64">
                <Bar data={marketShareData} options={{ maintainAspectRatio: false, scales: { y: { beginAtZero: true, max: 100 } } }} />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Price Comparison</h3>
              <div className="h-64">
                <Bar data={priceComparisonData} options={{ maintainAspectRatio: false, scales: { y: { beginAtZero: true } } }} />
              </div>
            </div>
          </div>

          {/* Market Insights */}
          {competitorData.marketInsights && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Market Insights</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Key Trends</h3>
                  <ul className="space-y-2">
                    {competitorData.marketInsights.keyTrends?.map((trend, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                        <span className="text-sm text-gray-700">{trend}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Opportunities</h3>
                  <ul className="space-y-2">
                    {competitorData.marketInsights.opportunities?.map((op, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2" />
                        <span className="text-sm text-gray-700">{op}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Threats</h3>
                  <ul className="space-y-2">
                    {competitorData.marketInsights.threats?.map((t, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2" />
                        <span className="text-sm text-gray-700">{t}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Competitor Analysis Yet</h3>
          <p className="text-gray-600 mb-6">Select a product and run competitor analysis to see detailed market insights.</p>
        </div>
      )}
    </div>
  );
}

export default Competitors;
