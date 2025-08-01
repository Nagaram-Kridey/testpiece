import React, { useState, useEffect } from 'react';
import { useProduct } from '../context/ProductContext';
import { Shield, AlertTriangle, Leaf, CheckCircle, Info, TrendingUp, BarChart3, FileText, RefreshCw } from 'lucide-react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const Environmental = () => {
  const { products = [], selectedProduct, setSelectedProduct } = useProduct();
  const [analysisData, setAnalysisData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [complianceChecklist, setComplianceChecklist] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [comparisonData, setComparisonData] = useState(null);

  useEffect(() => {
    fetchComplianceChecklist();
  }, []);

  const fetchComplianceChecklist = async () => {
    try {
      const response = await fetch('/api/environmental/compliance-checklist');
      const data = await response.json();
      if (data.success) {
        setComplianceChecklist(data.data);
      }
    } catch (error) {
      console.error('Error fetching compliance checklist:', error);
    }
  };

  const analyzeEnvironmentalHazards = async () => {
    if (!selectedProduct) {
      alert('Please select a product first');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/environmental/analyze-hazards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName: selectedProduct.name,
          description: selectedProduct.description,
          ingredients: selectedProduct.ingredients || '',
          category: selectedProduct.category
        }),
      });

      const data = await response.json();
      if (data.success) {
        setAnalysisData(data.data);
      }
    } catch (error) {
      console.error('Error analyzing environmental hazards:', error);
    } finally {
      setLoading(false);
    }
  };

  const compareProducts = async () => {
    if (selectedProducts.length < 2) {
      alert('Please select at least 2 products for comparison');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/environmental/compare-products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ products: selectedProducts }),
      });

      const data = await response.json();
      if (data.success) {
        setComparisonData(data.data);
      }
    } catch (error) {
      console.error('Error comparing products:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (score) => {
    if (score < 0.3) return '#10B981';
    if (score < 0.6) return '#F59E0B';
    return '#EF4444';
  };

  const getRiskLabel = (score) => {
    if (score < 0.3) return 'Low';
    if (score < 0.6) return 'Moderate';
    return 'High';
  };

  const chartData = analysisData ? {
    labels: ['Toxicity', 'Chemical Risks', 'Environmental Impact'],
    datasets: [{
      data: [
        analysisData?.toxicity?.score || 0,
        analysisData?.chemicalRisks?.score || 0,
        analysisData?.environmentalImpact?.score || 0
      ],
      backgroundColor: ['#EF4444', '#F59E0B', '#10B981'],
      borderWidth: 2,
      borderColor: '#fff'
    }]
  } : null;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
          <Leaf className="mr-3 text-green-600" />
          Environmental Hazard Analysis
        </h1>
        <p className="text-gray-600">
          Analyze products for environmental risks, toxicity, and sustainability using AI-powered models.
        </p>
      </div>

      {/* Product Selection */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <BarChart3 className="mr-2" />
          Product Selection
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Product for Analysis
            </label>
            <select
              value={selectedProduct?.id || ''}
              onChange={(e) => {
                const product = products.find(p => p.id === e.target.value);
                setSelectedProduct(product);
              }}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">Choose a product...</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>

            {selectedProduct && (
              <button
                onClick={analyzeEnvironmentalHazards}
                disabled={loading}
                className="mt-4 w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center"
              >
                {loading ? <RefreshCw className="mr-2 animate-spin" /> : <Shield className="mr-2" />}
                Analyze Environmental Hazards
              </button>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Products for Comparison
            </label>
            <select
              multiple
              value={selectedProducts.map(p => p.id)}
              onChange={(e) => {
                const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
                const selectedProds = products.filter(p => selectedOptions.includes(p.id));
                setSelectedProducts(selectedProds);
              }}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent min-h-[120px]"
            >
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>

            {selectedProducts.length >= 2 && (
              <button
                onClick={compareProducts}
                disabled={loading}
                className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
              >
                {loading ? <RefreshCw className="mr-2 animate-spin" /> : <TrendingUp className="mr-2" />}
                Compare Products
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Analysis Results */}
      {analysisData && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Shield className="mr-2" />
            Environmental Analysis Results
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="text-center">
              <div className="text-4xl font-bold mb-2" style={{ color: getRiskColor(analysisData.riskScore || 0) }}>
                {(analysisData.riskScore * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">Overall Risk Score</div>
              <div className="text-lg font-semibold" style={{ color: getRiskColor(analysisData.riskScore || 0) }}>
                {getRiskLabel(analysisData.riskScore || 0)} Risk
              </div>
            </div>

            <div className="lg:col-span-2">
              <Doughnut
                data={chartData}
                options={{
                  responsive: true,
                  plugins: { legend: { position: 'bottom' } }
                }}
              />
            </div>
          </div>

          {Array.isArray(analysisData.recommendations) && analysisData.recommendations.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-3">Recommendations</h3>
              <div className="space-y-3">
                {analysisData.recommendations.map((rec, index) => (
                  <div key={index} className={`p-4 rounded-lg border-l-4 ${
                    rec.type === 'warning' ? 'bg-red-50 border-red-400' :
                    rec.type === 'info' ? 'bg-blue-50 border-blue-400' :
                    'bg-green-50 border-green-400'
                  }`}>
                    <div className="flex items-start">
                      {rec.type === 'warning' ? (
                        <AlertTriangle className="text-red-500 mr-3 mt-1" />
                      ) : rec.type === 'info' ? (
                        <Info className="text-blue-500 mr-3 mt-1" />
                      ) : (
                        <CheckCircle className="text-green-500 mr-3 mt-1" />
                      )}
                      <div>
                        <h4 className="font-semibold">{rec.title}</h4>
                        <p className="text-sm text-gray-600">{rec.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Compliance Checklist */}
      {complianceChecklist?.categories?.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <FileText className="mr-2" />
            Environmental Compliance Checklist
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {complianceChecklist.categories.map((category, index) => (
              <div key={index} className="border rounded-lg p-4">
                <h3 className="font-semibold text-lg mb-3 text-gray-800">{category.name}</h3>
                <ul className="space-y-2">
                  {Array.isArray(category.items) && category.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-center text-sm text-gray-600">
                      <div className="w-4 h-4 border border-gray-300 rounded mr-3 flex-shrink-0"></div>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Environmental;
