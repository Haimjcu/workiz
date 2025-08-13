const axios = require('axios');

/**
 * Main function that retrieves ticket summary data from JSONBin
 * @param {Object} parameters - Input parameters containing the bin ID
 * @param {Object} parameters.parameters - Nested parameters object
 * @param {string} parameters.parameters.data - The JSONBin ID to retrieve summary from
 * @returns {string} JSON stringified response with status code and summary data
 */
exports.main = async (parameters) => {
  // JSONBin API authentication credentials with fallback defaults
  const XMasterKey = process.env.XMASTERKEY || '$2a$10$xl5rYbdZkfK1v3kxYw0pg.bbQCKXLy/obEy8DuHNV929GNTU2SAmm';
  const XAccessKey = process.env.XACCESSKEY || '$2a$10$5FnDsCxu6AEJ2I9KdNz6MOKTnD8cvXlQgLSgNu.qWfIev8pTY/jD6';

  // Extract the bin ID from the nested parameters structure
  const binId = parameters.parameters.data;

  // Validate that binId exists
  if (!binId) {
    const errorMsg = 'Missing required binId in parameters.parameters.data';
    console.error(errorMsg);
    return JSON.stringify({ 
      statusCode: 400, 
      body: { error: errorMsg }
    });
  }

  // Create axios instance configured for JSONBin API
  const axiosInstance = axios.create({
    headers: {
      'Content-Type': 'application/json',
      'X-Master-Key': XMasterKey,
      'X-Access-Key': XAccessKey
    }
  });

  /**
   * Retrieves summary data from the specified JSONBin
   * @returns {Promise<string>} The summary content from the bin record
   */
  const getSummary = async () => {
    const url = `https://api.jsonbin.io/v3/b/${binId}`;
    console.log('Summary URL:', url);
    console.log('Attempting to get summary from JSONBin');
    
    try {
      const response = await axiosInstance.get(url);
      
      // Validate response structure
      if (!response.data || !response.data.record) {
        throw new Error('Invalid response structure: missing record data');
      }
      
      if (!response.data.record.summary) {
        console.warn('Warning: No summary field found in record');
        return null;
      }
      
      return response.data.record.summary;
    } catch (error) {
      console.error('Error retrieving summary data:', error.message);
      
      // Provide more specific error information
      if (error.response) {
        console.error('API Response Status:', error.response.status);
        console.error('API Response Data:', error.response.data);
      }
      
      throw error;
    }
  };

  // Main execution flow
 
  try {
    console.log('Starting summary retrieval process');
    
    // Retrieve the summary data from JSONBin
    const summarizeTicketsData = await getSummary();
    
    // Prepare successful response
    const returnValue = { statusCode: 200, body: summarizeTicketsData };
    
    return JSON.stringify(returnValue);
  } catch (error) {
    console.error('Main execution error:', error.message);
    return { statusCode: 500, body: error.message };
  }
};