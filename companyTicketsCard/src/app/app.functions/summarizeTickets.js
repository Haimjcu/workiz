const axios = require('axios');
 
exports.main = async (context) => {

  const { data } = context.parameters; 

  const axiosInstance = axios.create({
    headers: {
      'Content-Type': 'application/json'
    },
    data: data
  });
 
  const getSummary = async () => {
    const url = `https://hook.us2.make.com/9pm1980qtpbbcwcerl2u7fqcfffnsv20`;
    console.log(`Attempting to get summary`);
    try {
      const response = await axiosInstance.post(url);
      console.log('Successfully got summary:');
      return response.data;
    } catch (error) {
      console.error('Error getting data:', error);
      throw error;
    }
  };
 
  try {
    const summarizeTicketsData = await getSummary();
    const returnValue = { statusCode: 200, body: summarizeTicketsData };
    
    return JSON.stringify(returnValue);
  } catch (error) {
    return { statusCode: 500, body: 'An error occurred' };
  }
};