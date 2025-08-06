import React from 'react';
import { hubspot, Button, Text }from "@hubspot/ui-extensions";
import { Layout } from "./components/Layout";
import { Stats } from "./components/Stats";
import { Clicker } from "./components/Clicker";
import { DealPanel } from "./components/DealPanel";
import { DealPanelInner } from "./components/DealPanelInner";

hubspot.extend(() => (
  <Extension
  />
));

const Extension = () => {
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
    const tickets = await getTickets();
    console.log('=== Client: Final tickets ===');
    console.log('Tickets:', JSON.stringify(tickets));
  } catch (error) {
    console.error('=== Client: Final error ===', error);
  }
};

fetchTickets();

  return (
    <>
<Text> Hello</Text>

    </>
  )
}