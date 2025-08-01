import React, { useState, useEffect } from 'react';
import { useProduct } from '../context/ProductContext';
import { useSearchParams } from 'react-router-dom';
import { 
  BarChart3, 
  TrendingUp, 
  FileText, 
  Users,
  Play,
  Download,
  Star,
  DollarSign,
  Target,
  AlertCircle
} from 'lucide-react';
import { Line, Doughnut, Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale
);

function Analysis() {
  const { products = [], selectedProduct = null, analysisData = {}, analyzeProduct, loading } = useProduct();
  const [searchParams] = useSearchParams();
  const [selectedProductId, setSelectedProductId] = useState('');
  const [analysisType, setAnalysisType] = useState('all');

  useEffect(() => {
    const productId = searchParams.get('product');
    if (productId) {
      setSelectedProductId(productId);
    }
  }, [searchParams]);

  const handleAnalyze = async () => {
    if (!selectedProductId) return;
    try {
      await analyzeProduct?.(selectedProductId, analysisType);
    } catch (error) {
      console.error('Analysis failed:', error);
    }
  };

  const sentiment = analysisData?.sentiment;
  const performance = analysisData?.performance;
  const marketTrends = analysisData?.marketTrends;

  const sentimentData = {
    labels: ['Positive', 'Neutral', 'Negative'],
    datasets: [
      {
        data: [
          sentiment?.sentiment === 'positive' ? 60 : 20,
          sentiment?.sentiment === 'neutral' ? 60 : 20,
          sentiment?.sentiment === 'negative' ? 60 : 20,
        ],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(156, 163, 175, 0.8)',
          'rgba(239, 68, 68, 0.8)',
        ],
        borderColor: [
          'rgba(34, 197, 94, 1)',
          'rgba(156, 163, 175, 1)',
          'rgba(239, 68, 68, 1)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const performanceData = {
    labels: ['Conversion Rate', 'Rating', 'Reviews', 'Price Position', 'Market Share'],
    datasets: [
      {
        label: 'Performance Metrics',
        data: [
          performance?.conversionRate || 0,
          (performance?.avgRating || 0) * 20,
          Math.min((performance?.reviewCount || 0) / 10, 100),
          performance?.priceAnalysis?.position === 'competitive' ? 100 :
          performance?.priceAnalysis?.position === 'average' ? 50 : 0,
          75,
        ],
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(59, 130, 246, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(59, 130, 246, 1)',
      },
    ],
  };

  const trendsData = {
    labels: ['Q1', 'Q2', 'Q3', 'Q4'],
    datasets: [
      {
        label: 'Market Demand',
        data: marketTrends?.seasonality?.map(q => q.demand) || [65, 75, 85, 70],
        borderColor: 'rgba(34, 197, 94, 1)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.4,
      },
    ],
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Product Analysis</h1>
          <p className="text-gray-600">Analyze product performance and market insights</p>
        </div>
      </div>

      {/* Analysis Controls */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Product
            </label>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">Choose a product</option>
              {products?.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Analysis Type
            </label>
            <select
              value={analysisType}
              onChange={(e) => setAnalysisType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">Comprehensive Analysis</option>
              <option value="sentiment">Sentiment Analysis</option>
              <option value="performance">Performance Analysis</option>
              <option value="market-trends">Market Trends</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={handleAnalyze}
              disabled={!selectedProductId || loading}
              className="w-full inline-flex items-center justify-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Analyzing...</span>
                </div>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Run Analysis
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Analysis Results */}
      {selectedProduct && analysisData && (
        <div className="space-y-6">
          {/* Product Overview */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Product Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <OverviewItem icon={<DollarSign />} label="Price" value={`$${selectedProduct?.price || 0}`} color="primary" />
              <OverviewItem icon={<Star />} label="Rating" value={`${performance?.avgRating || 0}/5`} color="green" />
              <OverviewItem icon={<Target />} label="Performance Score" value={`${performance?.performanceScore || 0}/100`} color="purple" />
              <OverviewItem icon={<TrendingUp />} label="Conversion Rate" value={`${performance?.conversionRate || 0}%`} color="yellow" />
            </div>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {sentiment && (
              <ChartCard title="Sentiment Analysis">
                <Doughnut data={sentimentData} options={{ maintainAspectRatio: false }} />
                <div className="mt-4 space-y-2 text-sm text-gray-600">
                  <p><strong>Sentiment:</strong> {sentiment?.sentiment}</p>
                  <p><strong>Score:</strong> {sentiment?.score?.toFixed(2)}</p>
                  <p><strong>Keywords:</strong> {sentiment?.keywords?.join(', ') || 'None'}</p>
                </div>
              </ChartCard>
            )}

            {performance && (
              <ChartCard title="Performance Metrics">
                <Radar data={performanceData} options={{ maintainAspectRatio: false }} />
                <div className="mt-4 space-y-2 text-sm text-gray-600">
                  <p><strong>Price Position:</strong> {performance?.priceAnalysis?.position || 'N/A'}</p>
                  <p><strong>Price Difference:</strong> {performance?.priceAnalysis?.difference || 0}%</p>
                </div>
              </ChartCard>
            )}

            {marketTrends && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 lg:col-span-2">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Market Trends</h3>
                <div className="h-64">
                  <Line data={trendsData} options={{ maintainAspectRatio: false }} />
                </div>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Market Growth</p>
                    <p className="text-2xl font-bold text-green-600">
                      {marketTrends?.marketGrowth?.toFixed(1) || 0}%
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Key Drivers</p>
                    <ul className="text-sm text-gray-600 mt-1">
                      {marketTrends?.keyDrivers?.slice(0, 2).map((driver, i) => (
                        <li key={i}>• {driver}</li>
                      )) || <li>None</li>}
                    </ul>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Opportunities</p>
                    <ul className="text-sm text-gray-600 mt-1">
                      {marketTrends?.opportunities?.slice(0, 2).map((o, i) => (
                        <li key={i}>• {o}</li>
                      )) || <li>None</li>}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Recommendations */}
          {performance?.recommendations?.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommendations</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {performance.recommendations.map((rec, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        rec.priority === 'high' ? 'bg-red-100' : 'bg-yellow-100'
                      }`}>
                        <AlertCircle className={`w-4 h-4 ${
                          rec.priority === 'high' ? 'text-red-600' : 'text-yellow-600'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{rec.suggestion}</h4>
                        <p className="text-sm text-gray-600 mt-1">{rec.impact}</p>
                        <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full mt-2 ${
                          rec.priority === 'high' 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {rec.priority} priority
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {!selectedProduct && !analysisData && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Analysis Yet</h3>
          <p className="text-gray-600 mb-6">
            Select a product and run analysis to see detailed insights and recommendations.
          </p>
        </div>
      )}
    </div>
  );
}

// Reusable Components
const OverviewItem = ({ icon, label, value, color }) => (
  <div className="flex items-center space-x-3">
    <div className={`w-10 h-10 bg-${color}-100 rounded-lg flex items-center justify-center`}>
      {React.cloneElement(icon, { className: `w-5 h-5 text-${color}-600` })}
    </div>
    <div>
      <p className="text-sm text-gray-600">{label}</p>
      <p className="text-lg font-semibold text-gray-900">{value}</p>
    </div>
  </div>
);

const ChartCard = ({ title, children }) => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
    <div className="h-64">{children}</div>
  </div>
);

export default Analysis;
