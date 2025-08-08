const axios = require('axios');
 
exports.main = async () => {
  // console.log("we are connected");
  const Bearer = process.env['ticketsDataBearer'] || '5Hq5LZJ14EDgx90BikeVEGCPM0ApIeT4';
  const axiosInstance = axios.create({
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${Bearer}`
    }
  });
 
  const getTicketsData = async () => {
    const url = `https://mock.up.railway.app/api/data`;
    console.log(`Attempting to get mockup data`);
    try {
      const response = await axiosInstance.post(url);
      console.log('Successfully got data:');
      return response.data;
    } catch (error) {
      console.error('Error getting data:', error);
      throw error;
    }
  };
 
  try {
    const ticketsData = await getTicketsData();
    const returnValue = { statusCode: 200, body: ticketsData };
    
    return JSON.stringify(returnValue);
  } catch (error) {
    return { statusCode: 500, body: 'An error occurred' };
  }
};