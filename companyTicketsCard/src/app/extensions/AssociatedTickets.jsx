import React, { useState, useEffect } from 'react';
import { hubspot, Button, Text, Box, Flex, Heading, Divider }from "@hubspot/ui-extensions";
import { TicketBox } from "./components/TicketBox";
import { DealPanel } from "./components/DealPanel";
import { DealPanelInner } from "./components/DealPanelInner";

const Extension = () => {
  const [tickets, setTickets] = useState([]);
  const [comments, setComments] = useState([]);
  const [subject, setSubject] = useState('');

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

  const handleCommentsButtonClick = (comments) => {
    console.log('=== Clicked ===');
    setComments(comments || []);
    const panelId = 'comments';
    setShowCommentsPanel(true); // Show panel via state
  };

  const panelId = 'comments';

  return (
    <>
      <DealPanel paneltitle={'Comments'} panelId={'comments'}>
        <DealPanelInner panelSubtitle={subject} comments={comments} />
      </DealPanel>

      <Box>
        <Heading variant="h1">Support Tickets</Heading>
        
        {tickets && tickets.length > 0 && (<Text>Found {tickets.length} tickets</Text>)}
        
        <Flex direction="column" gap="extra-large">
          {tickets.sort((a, b) => b.generated_timestamp - a.generated_timestamp).map((ticket, index) => (
            <>
            <Divider distance="large" />
              <Flex direction="column" gap="small">
                <TicketBox key={index} ticket={ticket} onButtonClick={handleCommentsButtonClick}/>
                <Box>
                  <Button variant="primary" onClick={(event, reactions) => { 
                      setComments(ticket.comments || []),
                      setSubject(ticket.subject || []), 
                      reactions.openPanel(panelId) 
                    }}>
                    Comments: {ticket.count}
                  </Button>  
                </Box>
              </Flex>
            </>
          ))}
        </Flex>
      </Box>
      
      <Button onClick={handleButtonClick}>Refresh Tickets</Button>
    </>
  )
};

hubspot.extend(({ actions }) => <Extension />);