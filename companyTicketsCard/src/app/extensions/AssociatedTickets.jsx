import React, { useState, useEffect } from 'react';
import { hubspot, Button, LoadingButton, Text, Box, Flex, Heading, Divider, ErrorState,LoadingSpinner }from "@hubspot/ui-extensions";
import { TicketBox } from "./components/TicketBox";
import { TicketPanel } from "./components/TicketPanel";
import { TicketPanelInner } from "./components/TicketPanelInner";

const Extension = () => {
  const [tickets, setTickets] = useState([]);
  const [comments, setComments] = useState([]);
  const [ticketsSummary, setSummary] = useState('');
  const [subject, setSubject] = useState('');
  const [binId, setBinId] = useState('');
  const [isLoadingTickets, setLoadingTicket] = useState(false);
  const [isLoadingSummary, setLoadingSummary] = useState(false);
  const [isInitializing, setInitializing] = useState(true);
  const [isError, setError] = useState(false);
  const [errorText, setErrorText] = useState('');
  const [errorTitle, setErrorTitle] = useState('');
  const [errorTryAgainProcess, setErrorTryAgainProcess] = useState('');


  const getTickets = async () => {
    try {
        const response = await hubspot.serverless('getTicketData', {});
        
        // Parse the JSON string response
        const parsedResponse = JSON.parse(response);
        
        if (parsedResponse.statusCode === 200) {
          return parsedResponse.body;
        } else {
          setLoadingTicket(false);
          setErrorText(parsedResponse.body || '');
          setErrorTitle('Trouble fetching Tickets.');
          setErrorTryAgainProcess('tickets' || '');
          setError(true);
          setStatus(`Error: ${parsedResponse.body}`);
          console.error(`Error: ${parsedResponse.body}`);
        }
        return response.body;
      } catch (error) {
        console.log('Trouble fetching Tickets:', error.message);
        setLoadingTicket(false);
        setErrorText(error.message || '');
        setErrorTitle('Trouble fetching Tickets.');
        setErrorTryAgainProcess('tickets' || '');
        setError(true);
        console.error('Error fetching Tickets:', error);
    }
  };

  const fetchTickets = async () => {
    try {
      setLoadingTicket(true);
      const ticketsRaw = await getTickets();
      console.log('=== Client: Final ticketsss ===');
      setLoadingTicket(false);
      setTickets(ticketsRaw.tickets || []);
      setBinId(ticketsRaw.binId || '');
      setInitializing(false);
          console.log('===ticketsss binid ===' + ticketsRaw.binId+'xx '+binId);
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
      setError(false);
      setTickets([]);
      fetchTickets();
    };

    const handleCommentsButtonClick = (comments) => {
      console.log('=== Clicked ===');
      setComments(comments || []);
      const panelId = 'comments';
      setShowCommentsPanel(true); // Show panel via state
    };

    const formatTextForHubSpot = (inputText) => {
      // Split text by actual \n characters (not \\n strings)
    const lines = inputText.split('\\n');
    
    let components = [];
    let key = 0;

    
    lines.forEach(line => {
      // Skip empty lines
      if (line.trim() === '') {
        return;
      }
      
      // Check if line contains **text** pattern
      const boldPattern = /\*\*(.*?)\*\*/;
      
      if (boldPattern.test(line)) {
        // Check if the entire line is just **text** (heading)
        const fullMatch = line.match(/^\*\*(.*?)\*\*$/);
        if (fullMatch) {
          // Entire line is a heading
          components.push(
            React.createElement('Heading', { key: key++, variant: 'h3' }, fullMatch[1])
          );
        } else {
          // Line contains **text** but has other content too
          // Replace **text** with the text and keep everything else
          const processedLine = line.replace(/\*\*(.*?)\*\*/g, '$1');
          components.push(
            React.createElement('Text', { key: key++ }, processedLine)
          );
        }
      } else {
        // Regular text line with no **text**
        components.push(
          React.createElement('Text', { key: key++ }, line)
        );
      }
    });
    
    return components;
    };
    

    const summarizeTickets = async (binId) => {
    try {
        const response = await hubspot.serverless('summarizeTicketData', {parameters: {data: binId}});
        
        // Parse the JSON string response
        const parsedResponse = JSON.parse(response);
        
        if (parsedResponse.statusCode === 200) {
          return parsedResponse.body;
        } else {
          setLoadingSummary(false);
          setErrorText(parsedResponse.body || '');
          setErrorTitle('Trouble getting Summary.');
          setErrorTryAgainProcess('summary' || '');
          setError(true);
          setStatus(`Error: ${parsedResponse.body} `);
          console.error(`Error: ${parsedResponse.body}`);
        }
        return response.body;

      //  const response = await hubspot.serverless('summarizeTicketData', {parameters: {data: compressedTickets.data[0]} });
        
      } catch (error) {
      setErrorText(error.message || '');
      setErrorTitle('Trouble getting Summary.');
      setErrorTryAgainProcess('summary' || '');
      setError(true);
      console.error('Error:', error);
    }
  };

  const fetchSummary = async (binId) => {
    try {
      setLoadingSummary(true);
          console.log('=== Client: Summaryyyyy ===');
      const summary = await summarizeTickets(binId);
      console.log('=== Client: Summary ===');
      setLoadingSummary(false);
      setSummary(summary || []);
    } catch (error) {
      console.error('=== Client: summary error ===', error);
    }
  };

    const handleSummarizeButtonClick = (binId) => {
      setError(false);
      fetchSummary(binId);
    };

  const panelId = 'comments';

  return (
    <>
      <TicketPanel paneltitle={'Comments'} panelId={'comments'}>
        <TicketPanelInner panelSubtitle={subject} comments={comments} />
      </TicketPanel>

      <Box>
        <Heading variant="h1">Support Tickets</Heading>

        {isLoadingTickets && isInitializing && (<LoadingSpinner label="Loading..." />)}

        {isError && (<ErrorState title={errorTitle}>
          <Text>{errorText}</Text>
          <Text>Please try again in a few moments.</Text>
          {errorTryAgainProcess==='tickets' ? 
            (<Button onClick={handleButtonClick}>Try again</Button>)
            :
            (<Button onClick={handleSummarizeButtonClick(binId)}>Try again</Button>)
          }
        </ErrorState>)}
        
        {tickets && tickets.length > 0 && (<Text>Found {tickets.length} tickets</Text>)}

        {!isInitializing && !isError && (<LoadingButton loading={isLoadingTickets} onClick={handleButtonClick}>Refresh Tickets</LoadingButton>)}

        {tickets && tickets.length > 0 && (<LoadingButton loading={isLoadingSummary} onClick={() =>handleSummarizeButtonClick(binId)}>Summarize All Tickets</LoadingButton>)}
        
        {ticketsSummary && (<Divider distance="large" />)}
        
        {ticketsSummary && (formatTextForHubSpot(ticketsSummary))}
        
        {!isLoadingTickets && (<Flex direction="column" gap="extra-large">
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
        )}
      </Box>
      
      {!isLoadingTickets && !isInitializing && !isError && tickets && tickets.length > 0 && (
        <>
        <Divider distance="large" />
        <Button onClick={handleButtonClick}>Refresh Tickets</Button>
      </>)}
    </>
  )
};

hubspot.extend(() => <Extension />);