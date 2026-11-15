import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 45000, // 45 seconds for LLM & Tavily synthesis
  headers: {
    'Accept': 'application/json'
  }
});

/**
 * Health check endpoint verifying FastAPI, LangGraph, and Tavily status.
 */
export const checkBackendHealth = async () => {
  try {
    const res = await apiClient.get('/api/health');
    return res.data;
  } catch (error) {
    const message = error.response?.data?.detail || error.message || 'Backend unreachable';
    console.warn('[API] Health check failed:', message);
    return { status: 'offline', error: message };
  }
};

/**
 * Uploads a .pdf or .docx resume file to FastAPI for LangChain OpenAI structured extraction.
 * @param {File} file - PDF or DOCX file
 * @returns {Promise<Object>} parsed CVProfile
 */
export const parseCVFile = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post('/api/cv/parse', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    return response.data;
  } catch (error) {
    const detail = error.response?.data?.detail || error.message || 'Failed to parse resume with AI engine';
    console.error('[API] parseCVFile error:', detail);
    throw new Error(detail);
  }
};

/**
 * Sends a resume section to OpenAI to rewrite into executive, metric-driven phrasing.
 * @param {string} sectionType - 'summary', 'experience', or 'projects'
 * @param {string} content - Raw user text
 * @param {string} targetRole - Target job title
 * @returns {Promise<string>} enhanced text
 */
export const enhanceCVSection = async (sectionType, content, targetRole = '') => {
  try {
    const response = await apiClient.post('/api/cv/enhance', {
      section_type: sectionType,
      content,
      target_role: targetRole
    });

    return response.data?.enhanced_text || '';
  } catch (error) {
    const detail = error.response?.data?.detail || error.message || 'Failed to enhance section';
    console.error('[API] enhanceCVSection error:', detail);
    throw new Error(detail);
  }
};

/**
 * Executes the LangGraph 3-node prediction workflow on FastAPI.
 * @param {Object} cv - CVProfile object
 * @param {Object} filters - JobFilters object
 * @returns {Promise<Object>} CareerPredictResponse ({ candidateSummary, marketInsight, paths })
 */
export const predictCareerPaths = async (cv, filters) => {
  try {
    const response = await apiClient.post('/api/career/predict', {
      cv,
      filters
    });

    return response.data;
  } catch (error) {
    const detail = error.response?.data?.detail || error.message || 'Failed to predict career paths';
    console.error('[API] predictCareerPaths error:', detail);
    throw new Error(detail);
  }
};

export default {
  checkBackendHealth,
  parseCVFile,
  enhanceCVSection,
  predictCareerPaths
};
