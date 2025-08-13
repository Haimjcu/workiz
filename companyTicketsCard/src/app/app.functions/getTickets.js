const axios = require('axios');

/**
 * Main function that processes ticket data through compression and summary generation
 * @returns {string} JSON stringified response with status code and data
 */
exports.main = async () => {
  // Environment variables for API authentication
  const Bearer = process.env.TICKETSDATABEARER || '5Hq5LZJ14EDgx90BikeVEGCPM0ApIeT4';
  const XMasterKey = process.env.XMASTERKEY || '$2a$10$xl5rYbdZkfK1v3kxYw0pg.bbQCKXLy/obEy8DuHNV929GNTU2SAmm';
  const XAccessKey = process.env.XACCESSKEY || '$2a$10$5FnDsCxu6AEJ2I9KdNz6MOKTnD8cvXlQgLSgNu.qWfIev8pTY/jD6';

  /**
   * Creates an axios instance with the appropriate headers based on API type
   * @param {string} apiType - Either 'bearer' for ticket API or 'jsonbin' for JSONBin API
   * @returns {Object} Configured axios instance
   */
  const createAxiosInstance = (apiType) => {
    const baseHeaders = {
      'Content-Type': 'application/json'
    };

    if (apiType === 'bearer') {
      return axios.create({
        headers: {
          ...baseHeaders,
          'Authorization': `Bearer ${Bearer}`
        }
      });
    } else if (apiType === 'jsonbin') {
      return axios.create({
        headers: {
          ...baseHeaders,
          'X-Master-Key': XMasterKey,
          'X-Access-Key': XAccessKey
        }
      });
    } else {
      throw new Error(`Invalid API type: ${apiType}. Use 'bearer' or 'jsonbin'.`);
    }
  };

  /**
   * Fetches ticket data from the mock API endpoint
   * @returns {Promise<Object>} Raw ticket data from the API
   */
  const getTicketsData = async () => {
    const url = 'https://mock.up.railway.app/api/data';
    console.log('Attempting to get mockup data');
    
    try {
      const axiosInstance = createAxiosInstance('bearer');
      const response = await axiosInstance.post(url);
      console.log('Successfully got data');
      return response.data;
    } catch (error) {
      console.error('Error getting data:', error);
      throw error;
    }
  };

  /**
   * Compresses ticket data by extracting only essential fields and nested properties
   * @param {Array} ticketsRaw - Raw ticket data array
   * @returns {Object} Compressed ticket data with reduced payload
   */
  const compressTicketsData = async (ticketsRaw) => {
    return {
      data: ticketsRaw.map(ticket => ({
        // Extract essential comment information
        comments: ticket.comments.map(comment => ({
          id: comment.id,
          author_id: comment.author_id,
          plain_body: comment.plain_body,
          // Extract only file names from attachments
          attachments: comment.attachments.map(attachment => ({
            file_name: attachment.file_name
          })),
          // Handle different via channel formats for backward compatibility
          viaChannel: comment.viaChannel || comment.via?.channel
        })),
        // Extract core ticket properties
        count: ticket.count,
        viaChannel: ticket.viaChannel || ticket.via?.channel,
        generated_timestamp: ticket.generated_timestamp,
        subject: ticket.subject,
        description: ticket.description,
        priority: ticket.priority,
        status: ticket.status,
        requester_id: ticket.requester_id
      }))
    };
  };

  /**
   * Creates a new JSONBin to store processed data
   * @returns {Promise<string>} The ID of the created bin
   */
  const createJsonBin = async () => {
    const url = 'https://api.jsonbin.io/v3/b';
    console.log('Attempting to create jsonbin');
    
    try {
      const axiosInstance = createAxiosInstance('jsonbin');
      const response = await axiosInstance.post(url, { summary: "new" });
      console.log('Successfully created jsonbin: ' + JSON.stringify(response.data));
      return response.data.metadata.id;
    } catch (error) {
      console.error('Error creating jsonbin:', error);
      throw error;
    }
  };

  /**
   * Sends compressed ticket data to Make.com webhook for summary processing
   * @param {string} binId - The JSONBin ID for reference
   * @param {Object} compressedTickets - Compressed ticket data
   * @returns {Promise<Object>} Response from the summary processing service
   */
  const getSummary = async (binId, compressedTickets) => {
    const url = 'https://hook.us2.make.com/9pm1980qtpbbcwcerl2u7fqcfffnsv20';
    console.log('Attempting to process summary');
    
    try {
      const axiosInstance = createAxiosInstance('bearer');
      const response = await axiosInstance.post(url, { 
        binId, 
        data: compressedTickets.data 
      });
      console.log('Successfully sent summary');
      return response.data;
    } catch (error) {
      console.error('Error sending summary:', error);
      throw error;
    }
  };

  // Main execution flow
  try {
    // Step 1: Fetch raw ticket data
    const ticketsData = await getTicketsData();
    
    // Step 2: Compress the ticket data to reduce payload size
    const compressedTickets = await compressTicketsData(ticketsData);
    
    // Step 3: Create a new JSONBin for storing processed data
    const binId = await createJsonBin();
    
    // Step 4: Send data for summary processing (fire and forget)
    // Note: Not awaiting this call as it appears to be asynchronous processing
    getSummary(binId, compressedTickets);

    // Return successful response with bin ID and original ticket data
    const returnValue = { 
      statusCode: 200, 
      body: { 
        binId, 
        tickets: ticketsData 
      }
    };
    
    return JSON.stringify(returnValue);
    
  } catch (error) {
    // Return error response with 500 status code
    console.error('Main execution error:', error);
    return JSON.stringify({ 
      statusCode: 500, 
      body: error.message
    });
  }
};