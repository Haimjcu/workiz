const axios = require('axios');
 
exports.main = async (parameters) => {

  const XMasterKey = process.env.XMasterKey || '$2a$10$xl5rYbdZkfK1v3kxYw0pg.bbQCKXLy/obEy8DuHNV929GNTU2SAmm';
  const XAccessKey = process.env.XAccessKey || '$2a$10$5FnDsCxu6AEJ2I9KdNz6MOKTnD8cvXlQgLSgNu.qWfIev8pTY/jD6';
 

    console.log('=== Full parameters data object ===', JSON.stringify(parameters.parameters.data, null, 2));

  const  binId = parameters.parameters.data;
    console.log('binId: '+ binId);

  const axiosInstance = axios.create({
    headers: {
      'Content-Type': 'application/json',
      'X-Master-Key': XMasterKey,
      'X-Access-Key': XAccessKey
    }
  });
 
  const getSummary = async () => {
    const url = `https://api.jsonbin.io/v3/b/${binId}`;
       console.log('summary url: ' + url);
    console.log(`Attempting to get summary`);
    try {
      const response = await axiosInstance.get(url);
      console.log('Successfully got summary:' + JSON.stringify(response.data));
      return response.data.record.summary;
    } catch (error) {
      console.error('Error getting data:', error);
      throw error;
    }
  };
 
  try {
    console.log('Start summary:');
    const summarizeTicketsData = await getSummary();
    const returnValue = { statusCode: 200, body: summarizeTicketsData };
    
    return JSON.stringify(returnValue);
  } catch (error) {
    return { statusCode: 500, body: 'An error occurred' };
  }
};