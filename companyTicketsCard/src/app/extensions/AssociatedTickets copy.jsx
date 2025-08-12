import React, { useState, useEffect } from 'react';
import { hubspot, Button, Text, Box, Flex, Heading, Divider }from "@hubspot/ui-extensions";
import { TicketBox } from "./components/TicketBox";
import { TicketPanel } from "./components/TicketPanel";
import { TicketPanelInner } from "./components/TicketPanelInner";

const Extension = () => {
  const [tickets, setTickets] = useState([]);
  const [comments, setComments] = useState([]);
  const [ticketsSummary, setSummary] = useState('');
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

  const summarizeTickets = async (tickets) => {
  try {
      const compressedTickets = await compressTicketsData(tickets);
      const response = await hubspot.serverless('summarizeTicketData', {parameters: {data: compressedTickets.data[0]}});
      
      // Parse the JSON string response
      const parsedResponse = JSON.parse(response);
      
      if (parsedResponse.statusCode === 200) {
        return parsedResponse.body;
      } else {
        setStatus(`Error: Status ${parsedResponse.statusCode}`);
      }
       return response.body;

    //  const response = await hubspot.serverless('summarizeTicketData', {parameters: {data: compressedTickets.data[0]} });
      
    } catch (error) {
    console.error('Error:', error);
  }
};

const fetchSummary = async (tickets) => {
  try {
        console.log('=== Client: Summaryyyyy ===');
    const summary = await summarizeTickets(tickets);
    console.log('=== Client: Summary ===');
    setSummary(summary || []);
  } catch (error) {
    console.error('=== Client: summary error ===', error);
  }
};

  const handleSummarizeButtonClick = (tickets) => {
    fetchSummary(tickets);
  };

  const panelId = 'comments';

  return (
    <>
      <TicketPanel paneltitle={'Comments'} panelId={'comments'}>
        <TicketPanelInner panelSubtitle={subject} comments={comments} />
      </TicketPanel>

      <Box>
        <Heading variant="h1">Support Tickets</Heading>
        
        {tickets && tickets.length > 0 && (<Text>Found {tickets.length} tickets</Text>)}

        <Button onClick={() =>handleSummarizeButtonClick(tickets)}>Summarize All Tickets</Button>

        {ticketsSummary && (<Text>Summary: {ticketsSummary}</Text>)}
        
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

hubspot.extend(() => <Extension />);