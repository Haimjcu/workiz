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

    useEffect(() => {
      fetchTickets();
    }, []);

    const handleButtonClick = () => {
      setError(false);
      setTickets([]);
      setSummary([]);
      fetchTickets();
    };

    const formatTextForHubSpot = (inputText) => {
      if (!inputText || inputText.length < 1) {
        return;
      }

      // Split text by actual \n characters (not \\n strings)
    const lines = inputText.split('\n');
    
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
    

    const summarizeTickets = async (isPolling = false) => {
    try {
        const response = await hubspot.serverless('summarizeTicketData', {parameters: {data: binId}});
        
        // Parse the JSON string response
        const parsedResponse = JSON.parse(response);
        
        if (parsedResponse.statusCode === 200) {
          return parsedResponse.body;
        } else {
          if (!isPolling) {
            setLoadingSummary(false);
            setErrorText(parsedResponse.body || '');
            setErrorTitle('Trouble getting Summary.');
            setErrorTryAgainProcess('summary' || '');
            setError(true);
            setStatus(`Error: ${parsedResponse.body} `);
          }
          console.error(`Error: ${parsedResponse.body}`);
          return null; // Return null to indicate failure
        }
      
      } catch (error) {
        if (!isPolling) {
          setErrorText(error.message || '');
          setErrorTitle('Trouble getting Summary.');
          setErrorTryAgainProcess('summary' || '');
          setError(true);
        }
          console.error('Error:', error);
          return null; // Return null to indicate failure
    }
  };

const fetchSummary = async () => {
  const maxAttempts = 12;
  const intervalMs = 5000; // 5 seconds
  
  try {
    setLoadingSummary(true);
    setError(false); // Clear any previous errors
    console.log('=== Client: Starting Summary Polling ===');
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      console.log(`=== Client: Summary attempt ${attempt}/${maxAttempts} ===`);
      
      const summary = await summarizeTickets(true); // Pass true to indicate polling
      
      if (summary && summary!=='new') {
        // Success - we got results
        console.log('=== Client: Summary successful ===');
        setLoadingSummary(false);
        setSummary(summary || []);
        return; // Exit the function successfully
      }
      
      if (attempt >= maxAttempts) {
        // Max attempts reached
        console.log('=== Client: Summary max attempts reached ===');
        break; // Exit the loop
      }
      
      // Wait before next attempt (except after the last attempt)
      if (attempt < maxAttempts) {
        console.log(`=== Client: Retrying in ${intervalMs/1000} seconds ===`);
        await new Promise(resolve => setTimeout(resolve, intervalMs));
      }
    }
    
    // If we get here, all attempts failed
    console.error('=== Client: Summary polling failed - max attempts reached ===');
    setLoadingSummary(false);
    setErrorText('Failed to get summary after maximum attempts');
    setErrorTitle('Summary Timeout');
    setErrorTryAgainProcess('summary');
    setError(true);
    
  } catch (error) {
    console.error('=== Client: Summary polling failed with error ===', error);
    setLoadingSummary(false);
    setErrorText(error.message || 'Failed to get summary');
    setErrorTitle('Summary Error');
    setErrorTryAgainProcess('summary');
    setError(true);
  }
};
    const handleSummarizeButtonClick = () => {
      setError(false);
      setSummary([]);
      fetchSummary();
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
            (<Button onClick={handleSummarizeButtonClick}>Try again</Button>)
          }
        </ErrorState>)}
        
        {tickets && tickets.length > 0 && (<Text>Found {tickets.length} tickets</Text>)}

        {!isInitializing && !isError && (<LoadingButton loading={isLoadingTickets} onClick={handleButtonClick}>Refresh Tickets</LoadingButton>)}
        {tickets && tickets.length > 0 && !isError &&(<LoadingButton loading={isLoadingSummary} onClick={handleSummarizeButtonClick}>Summarize All Tickets</LoadingButton>)}

        
        <Divider distance="large" />
        
        {ticketsSummary && (<>
        <Heading variant="h3">Summary</Heading>
        {formatTextForHubSpot(ticketsSummary)}
          </>)}
        
        {!isLoadingTickets && (<Flex direction="column" gap="extra-large">
          {tickets.sort((a, b) => b.generated_timestamp - a.generated_timestamp).map((ticket, index) => (
            <>
            
              <Flex direction="column" gap="small">
                <TicketBox key={index} ticket={ticket}/>
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
              <Divider distance="large" />
            </>
          ))}
        </Flex>
        )}
      </Box>
      
      {!isLoadingTickets && !isInitializing && !isError && tickets && tickets.length > 0 && (
        <>
        <Button onClick={handleButtonClick}>Refresh Tickets</Button>
        <LoadingButton loading={isLoadingSummary} onClick={handleSummarizeButtonClick}>Summarize All Tickets</LoadingButton>
      </>)}

      {ticketsSummary && !isLoadingTickets && !isInitializing && !isError &&( <> 
      <Divider distance="large" />
      <Heading variant="h3">Summary</Heading>
      {formatTextForHubSpot(ticketsSummary)}
      </>)}

    </>
  )
};

hubspot.extend(() => <Extension />);