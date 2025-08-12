const axios = require('axios');
 
exports.main = async () => {
  // console.log("we are connected");
  const Bearer = process.env.ticketsDataBearer || '5Hq5LZJ14EDgx90BikeVEGCPM0ApIeT4';
  const XMasterKey = process.env.XMasterKey || '$2a$10$xl5rYbdZkfK1v3kxYw0pg.bbQCKXLy/obEy8DuHNV929GNTU2SAmm';
  const XAccessKey = process.env.XAccessKey || '$2a$10$5FnDsCxu6AEJ2I9KdNz6MOKTnD8cvXlQgLSgNu.qWfIev8pTY/jD6';
 
  const axiosInstance = axios.create({
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${Bearer}`
    }
  });

  const axiosInstanceJSONBin = axios.create({
    headers: {
      'Content-Type': 'application/json',
      'X-Master-Key': XMasterKey,
      'X-Access-Key': XAccessKey
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

  const compressTicketsData = async (ticketsRaw) => {
    return {
        data: ticketsRaw.map(ticket => ({
            comments: ticket.comments.map(comment => ({
                id: comment.id,
                author_id: comment.author_id,
                plain_body: comment.plain_body,
                attachments: comment.attachments.map(attachment => ({
                    file_name: attachment.file_name
                })),
                viaChannel: comment.viaChannel || comment.via?.channel
            })),
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

  const createJsonBin = async () => {
    const url = `https://api.jsonbin.io/v3/b`;
    console.log(`Attempting to create jsonbin`);
    try {
      const response = await axiosInstanceJSONBin.post(url, {summary: "new"});
      console.log('Successfully created jsonbin:' +JSON.stringify(response.data));
      return response.data.metadata.id;
    } catch (error) {
      console.error('Error getting jsonbin data:', error);
      throw error;
    }
  };

    const getSummary = async (binId, compressedTickets) => {
    const url = `https://hook.us2.make.com/9pm1980qtpbbcwcerl2u7fqcfffnsv20`;
    console.log(`Attempting to process summary`);
    try {
      const response = await axiosInstance.post(url, {binId, data: compressedTickets.data});
      console.log('Successfully sent summary:');
      return response.data;
    } catch (error) {
      console.error('Error sending summary:', error);
      throw error;
    }
  };
 
  try {
    const ticketsData = await getTicketsData();
    const compressedTickets = await compressTicketsData(ticketsData);
  //  const binId = await createJsonBin();
const binId ="689b4089d0ea881f40576107";
    //getSummary(binId, compressedTickets);

    const returnValue = { statusCode: 200, body: { binId, tickets: ticketsData }};
    
    return JSON.stringify(returnValue);
  } catch (error) {
    return { statusCode: 500, body: 'An error occurred' };
  }
};