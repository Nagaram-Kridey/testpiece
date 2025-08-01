import React, { createContext, useContext, useReducer, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const ProductContext = createContext();

const initialState = {
  products: [],
  selectedProduct: null,
  analysisData: null,
  competitorData: null,
  loading: false,
  error: null
};

function productReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    
    case 'SET_PRODUCTS':
      return { ...state, products: action.payload, loading: false };
    
    case 'ADD_PRODUCT':
      return { 
        ...state, 
        products: [...state.products, action.payload],
        loading: false 
      };
    
    case 'UPDATE_PRODUCT':
      return {
        ...state,
        products: state.products.map(product => 
          product.id === action.payload.id ? action.payload : product
        ),
        loading: false
      };
    
    case 'DELETE_PRODUCT':
      return {
        ...state,
        products: state.products.filter(product => product.id !== action.payload),
        loading: false
      };
    
    case 'SET_SELECTED_PRODUCT':
      return { ...state, selectedProduct: action.payload };
    
    case 'SET_ANALYSIS_DATA':
      return { ...state, analysisData: action.payload };
    
    case 'SET_COMPETITOR_DATA':
      return { ...state, competitorData: action.payload };
    
    case 'CLEAR_ANALYSIS':
      return { 
        ...state, 
        analysisData: null, 
        competitorData: null,
        selectedProduct: null 
      };
    
    default:
      return state;
  }
}

export function ProductProvider({ children }) {
  const [state, dispatch] = useReducer(productReducer, initialState);

  // Fetch products on mount
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await axios.get('/api/products');
      dispatch({ type: 'SET_PRODUCTS', payload: response.data.data });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      toast.error('Failed to fetch products');
    }
  };

  const addProduct = async (productData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await axios.post('/api/products', productData);
      dispatch({ type: 'ADD_PRODUCT', payload: response.data.data });
      toast.success('Product added successfully');
      return response.data.data;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      toast.error('Failed to add product');
      throw error;
    }
  };

  const updateProduct = async (id, productData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await axios.put(`/api/products/${id}`, productData);
      dispatch({ type: 'UPDATE_PRODUCT', payload: response.data.data });
      toast.success('Product updated successfully');
      return response.data.data;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      toast.error('Failed to update product');
      throw error;
    }
  };

  const deleteProduct = async (id) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      await axios.delete(`/api/products/${id}`);
      dispatch({ type: 'DELETE_PRODUCT', payload: id });
      toast.success('Product deleted successfully');
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      toast.error('Failed to delete product');
      throw error;
    }
  };

  const analyzeProduct = async (productId, analysisType) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const product = state.products.find(p => p.id === productId);
      
      if (!product) {
        throw new Error('Product not found');
      }

      let analysisData = {};
      
      if (analysisType === 'sentiment' || analysisType === 'all') {
        const sentimentResponse = await axios.post('/api/analysis/sentiment', {
          text: product.description,
          reviews: product.analytics?.reviews || []
        });
        analysisData.sentiment = sentimentResponse.data.data;
      }

      if (analysisType === 'performance' || analysisType === 'all') {
        const performanceResponse = await axios.post('/api/analysis/performance', {
          price: product.price,
          views: product.analytics?.views || 0,
          sales: product.analytics?.sales || 0,
          reviews: product.analytics?.reviews || [],
          rating: product.analytics?.rating || 0
        });
        analysisData.performance = performanceResponse.data.data;
      }

      if (analysisType === 'market-trends' || analysisType === 'all') {
        const trendsResponse = await axios.post('/api/analysis/market-trends', {
          category: product.category
        });
        analysisData.marketTrends = trendsResponse.data.data;
      }

      dispatch({ type: 'SET_ANALYSIS_DATA', payload: analysisData });
      dispatch({ type: 'SET_SELECTED_PRODUCT', payload: product });
      
      toast.success('Analysis completed successfully');
      return analysisData;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      toast.error('Failed to analyze product');
      throw error;
    }
  };

  const analyzeCompetitors = async (productId) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const product = state.products.find(p => p.id === productId);
      
      if (!product) {
        throw new Error('Product not found');
      }

      const response = await axios.post('/api/competitors/analyze', {
        productName: product.name,
        category: product.category,
        price: product.price,
        brand: product.brand
      });

      dispatch({ type: 'SET_COMPETITOR_DATA', payload: response.data.data });
      toast.success('Competitor analysis completed');
      return response.data.data;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      toast.error('Failed to analyze competitors');
      throw error;
    }
  };

  const generateReport = async (reportType = 'comprehensive') => {
    try {
      if (!state.selectedProduct) {
        throw new Error('No product selected for report generation');
      }

      const response = await axios.post('/api/reports/generate', {
        productData: state.selectedProduct,
        analysisData: state.analysisData,
        competitorData: state.competitorData,
        reportType
      }, {
        responseType: 'blob'
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `product-analysis-${Date.now()}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success('Report generated successfully');
    } catch (error) {
      toast.error('Failed to generate report');
      throw error;
    }
  };

  // Environmental analysis functions
  const analyzeEnvironmentalHazards = async (productData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await axios.post('/api/environmental/analyze-hazards', productData);
      toast.success('Environmental analysis completed');
      return response.data.data;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      toast.error('Failed to analyze environmental hazards');
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const compareProductsEnvironmental = async (products) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await axios.post('/api/environmental/compare-products', { products });
      toast.success('Environmental comparison completed');
      return response.data.data;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      toast.error('Failed to compare products environmentally');
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const getComplianceChecklist = async () => {
    try {
      const response = await axios.get('/api/environmental/compliance-checklist');
      return response.data.data;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      toast.error('Failed to fetch compliance checklist');
      throw error;
    }
  };

  const value = {
    ...state,
    fetchProducts,
    addProduct,
    updateProduct,
    deleteProduct,
    analyzeProduct,
    analyzeCompetitors,
    generateReport,
    analyzeEnvironmentalHazards,
    compareProductsEnvironmental,
    getComplianceChecklist,
    setSelectedProduct: (product) => dispatch({ type: 'SET_SELECTED_PRODUCT', payload: product }),
    clearAnalysis: () => dispatch({ type: 'CLEAR_ANALYSIS' })
  };

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  );
}

export function useProduct() {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProduct must be used within a ProductProvider');
  }
  return context;
} 