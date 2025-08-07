import React, { useState, useEffect } from 'react';
import { hubspot, Button, Text, Box, Flex, Heading, Divider }from "@hubspot/ui-extensions";
import { TicketBox } from "./components/TicketBox";

const Extension = () => {
  const [tickets, setTickets] = useState([]);

  const getTickets = async () => {
  try {
      const response = await hubspot.serverless('getTicketData', {});
      
      // Parse the JSON string response
      const parsedResponse = JSON.parse(response);
      
      if (parsedResponse.statusCode === 200) {
        return parsedResponse.body;
      } else {
        setStatus(`Error: Status ${parsedResponse.statusCode}`);
      }
       return response.body;
    } catch (error) {
    console.error('Error:', error);
  }
};

const fetchTickets = async () => {
  try {
    const ticketsRaw = await getTickets();
    console.log('=== Client: Final ticketsss ===');
    setTickets(ticketsRaw || []);
  } catch (error) {
    console.error('=== Client: Final error ===', error);
  }
};

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleButtonClick = () => {
    fetchTickets();
  };

  return (
    <>
    <Box>
      <Heading variant="h1">Support Tickets</Heading>
      <Divider distance="extra-large"/>
      <Flex direction="column" gap="extra-large">
        {tickets.sort((a, b) => b.generated_timestamp - a.generated_timestamp).map((ticket, index) => (
          <TicketBox key={index} ticket={ticket} />
        ))}
      </Flex>
    </Box>

          <Button onClick={handleButtonClick}>Refresh Tickets</Button>
      {tickets && tickets.length > 0 && (
        <Text>Found {tickets.length} tickets</Text>    
      )}

    </>
  )
};

hubspot.extend(() => <Extension />);