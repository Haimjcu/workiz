import React, { useState, useEffect } from 'react';
import { 
  hubspot, 
  Button, 
  LoadingButton, 
  Text, 
  Box, 
  Flex, 
  Heading, 
  Divider, 
  ErrorState, 
  LoadingSpinner 
} from "@hubspot/ui-extensions";
import { TicketBox } from "./components/TicketBox";
import { TicketPanel } from "./components/TicketPanel";
import { TicketPanelInner } from "./components/TicketPanelInner";

/**
 * Main Extension component for HubSpot ticket management interface
 * Handles ticket fetching, display, and summarization functionality
 */
const Extension = () => {
  // State management for tickets and related data
  const [tickets, setTickets] = useState([]);
  const [comments, setComments] = useState([]);
  const [ticketsSummary, setSummary] = useState('');
  const [subject, setSubject] = useState('');
  const [binId, setBinId] = useState('');
  
  // Loading states
  const [isLoadingTickets, setLoadingTicket] = useState(false);
  const [isLoadingSummary, setLoadingSummary] = useState(false);
  const [isInitializing, setInitializing] = useState(true);
  
  // Error handling states
  const [isError, setError] = useState(false);
  const [errorText, setErrorText] = useState('');
  const [errorTitle, setErrorTitle] = useState('');
  const [errorTryAgainProcess, setErrorTryAgainProcess] = useState('');

  /**
   * Fetches ticket data from HubSpot serverless function
   * @returns {Promise<Object|null>} Ticket data object or null on error
   */
  const getTickets = async () => {
    try {
      const response = await hubspot.serverless('getTicketData', {});
      const parsedResponse = JSON.parse(response);
      
      if (parsedResponse.statusCode === 200) {
        return parsedResponse.body;
      } else {
        // Handle API error response
        handleTicketFetchError(parsedResponse.body || 'Unknown error occurred');
        return null;
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
      handleTicketFetchError(error.message || 'Network error occurred');
      return null;
    }
  };

  /**
   * Handles ticket fetch errors by updating error state
   * @param {string} errorMessage - Error message to display
   */
  const handleTicketFetchError = (errorMessage) => {
    setLoadingTicket(false);
    setErrorText(errorMessage);
    setErrorTitle('Trouble fetching Tickets.');
    setErrorTryAgainProcess('tickets');
    setError(true);
  };

  /**
   * Main function to fetch and process ticket data
   * Updates component state with fetched tickets and bin ID
   */
  const fetchTickets = async () => {
    try {
      setLoadingTicket(true);
      const ticketsRaw = await getTickets();
      
      if (ticketsRaw) {
        console.log('Successfully fetched tickets data');
        setTickets(ticketsRaw.tickets || []);
        setBinId(ticketsRaw.binId || '');
      }
      
      setLoadingTicket(false);
      setInitializing(false);
    } catch (error) {
      console.error('Error in fetchTickets:', error);
      setLoadingTicket(false);
      setInitializing(false);
    }
  };

  // Fetch tickets on component mount
  useEffect(() => {
    fetchTickets();
  }, []);

  /**
   * Handles refresh button click - resets state and refetches tickets
   */
  const handleRefreshClick = () => {
    setError(false);
    setTickets([]);
    setSummary('');
    fetchTickets();
  };

  /**
   * Formats markdown-like text for HubSpot UI components
   * Converts **text** to headings or bold text and handles line breaks
   * @param {string} inputText - Raw text with markdown formatting
   * @returns {Array<React.Element>} Array of React elements
   */
  const formatTextForHubSpot = (inputText) => {
    if (!inputText || inputText.length < 1) {
      return [];
    }

    const lines = inputText.split('\n');
    const components = [];
    let key = 0;

    lines.forEach(line => {
      // Skip empty lines
      if (line.trim() === '') {
        return;
      }
      
      const boldPattern = /\*\*(.*?)\*\*/;
      
      if (boldPattern.test(line)) {
        // Check if the entire line is a heading (just **text**)
        const fullMatch = line.match(/^\*\*(.*?)\*\*$/);
        if (fullMatch) {
          components.push(
            React.createElement('Heading', { key: key++, variant: 'h3' }, fullMatch[1])
          );
        } else {
          // Line contains bold text but has other content
          const processedLine = line.replace(/\*\*(.*?)\*\*/g, '$1');
          components.push(
            React.createElement('Text', { key: key++ }, processedLine)
          );
        }
      } else {
        // Regular text line
        components.push(
          React.createElement('Text', { key: key++ }, line)
        );
      }
    });
    
    return components;
  };

  /**
   * Fetches summary data from HubSpot serverless function
   * @param {boolean} isPolling - Whether this is part of a polling operation
   * @returns {Promise<string|null>} Summary text or null on error
   */
  const summarizeTickets = async (isPolling = false) => {
    try {
      const response = await hubspot.serverless('summarizeTicketData', {
        parameters: { data: binId }
      });
      
      const parsedResponse = JSON.parse(response);
      
      if (parsedResponse.statusCode === 200) {
        return parsedResponse.body;
      } else {
        if (!isPolling) {
          handleSummaryError(parsedResponse.body || 'Unknown error occurred');
        }
        console.error('Summary error:', parsedResponse.body);
        return null;
      }
    } catch (error) {
      if (!isPolling) {
        handleSummaryError(error.message || 'Network error occurred');
      }
      console.error('Summary fetch error:', error);
      return null;
    }
  };

  /**
   * Handles summary fetch errors by updating error state
   * @param {string} errorMessage - Error message to display
   */
  const handleSummaryError = (errorMessage) => {
    setLoadingSummary(false);
    setErrorText(errorMessage);
    setErrorTitle('Trouble getting Summary.');
    setErrorTryAgainProcess('summary');
    setError(true);
  };

  /**
   * Polls for summary data with retry logic
   * Attempts to fetch summary multiple times with delays
   */
  const fetchSummary = async () => {
    const maxAttempts = 12;
    const intervalMs = 5000; // 5 seconds
    
    try {
      setLoadingSummary(true);
      setError(false);
      console.log('Starting summary polling...');
      
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        console.log(`Summary attempt ${attempt}/${maxAttempts}`);
        
        const summary = await summarizeTickets(true);
        
        // Check if we got a valid summary (not 'new' placeholder)
        if (summary && summary !== 'new') {
          console.log('Summary successful');
          setLoadingSummary(false);
          setSummary(summary);
          return;
        }
        
        // Wait before next attempt (except on last attempt)
        if (attempt < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, intervalMs));
        }
      }
      
      // All attempts failed
      console.error('Summary polling failed - max attempts reached');
      handleSummaryError('Failed to get summary after maximum attempts');
      
    } catch (error) {
      console.error('Summary polling failed with error:', error);
      handleSummaryError(error.message || 'Failed to get summary');
    }
  };

  /**
   * Handles summarize button click - resets summary state and starts polling
   */
  const handleSummarizeClick = () => {
    setError(false);
    setSummary('');
    fetchSummary();
  };

  /**
   * Handles opening comments panel for a specific ticket
   * @param {Object} ticket - Ticket object containing comments and subject
   */
  const handleCommentsClick = (ticket, reactions) => {
    setComments(ticket.comments || []);
    setSubject(ticket.subject || '');
    reactions.openPanel('comments');
  };

  // Render summary section if summary exists
  const renderSummary = () => {
    if (!ticketsSummary) return null;
    
    return (
      <>
        <Heading variant="h3">Summary</Heading>
        {formatTextForHubSpot(ticketsSummary)}
        <Divider distance="large" />
      </>
    );
  };

  // Render ticket list with sorting by timestamp (newest first)
  const renderTicketList = () => {
    if (isLoadingTickets || !tickets.length) return null;

    const sortedTickets = tickets.sort((a, b) => b.generated_timestamp - a.generated_timestamp);

    return (
      <Flex direction="column" gap="extra-large">
        {sortedTickets.map((ticket, index) => (
          <React.Fragment key={ticket.id || index}>
            <Flex direction="column" gap="small">
              <TicketBox ticket={ticket} />
              <Box>
                <Button 
                  variant="primary" 
                  onClick={(event, reactions) => handleCommentsClick(ticket, reactions)}
                >
                  Comments: {ticket.count || 0}
                </Button>
              </Box>
            </Flex>
            <Divider distance="large" />
          </React.Fragment>
        ))}
      </Flex>
    );
  };

  // Render action buttons
  const renderActionButtons = () => {
    const showButtons = !isLoadingTickets && !isInitializing && !isError && tickets.length > 0;
    
    if (!showButtons) return null;

    return (
      <>
        <LoadingButton loading={isLoadingTickets} onClick={handleRefreshClick}>
          Refresh Tickets
        </LoadingButton>
        <LoadingButton loading={isLoadingSummary} onClick={handleSummarizeClick}>
          Summarize All Tickets
        </LoadingButton>
      </>
    );
  };

  return (
    <>
      {/* Comments Panel */}
      <TicketPanel paneltitle="Comments" panelId="comments">
        <TicketPanelInner panelSubtitle={subject} comments={comments} />
      </TicketPanel>

      {/* Main Content */}
      <Box>
        <Heading variant="h1">Support Tickets</Heading>

        {/* Loading Spinner */}
        {isLoadingTickets && isInitializing && (
          <LoadingSpinner label="Loading..." />
        )}

        {/* Error State */}
        {isError && (
          <ErrorState title={errorTitle}>
            <Text>{errorText}</Text>
            <Text>Please try again in a few moments.</Text>
            <Button 
              onClick={errorTryAgainProcess === 'tickets' ? handleRefreshClick : handleSummarizeClick}
            >
              Try again
            </Button>
          </ErrorState>
        )}
        
        {/* Ticket Count */}
        {tickets.length > 0 && (
          <Text>Found {tickets.length} tickets</Text>
        )}

        {/* Initial Action Buttons */}
        {!isInitializing && !isError && (
          <LoadingButton loading={isLoadingTickets} onClick={handleRefreshClick}>
            Refresh Tickets
          </LoadingButton>
        )}
        
        {tickets.length > 0 && !isError && (
          <LoadingButton loading={isLoadingSummary} onClick={handleSummarizeClick}>
            Summarize All Tickets
          </LoadingButton>
        )}

        <Divider distance="large" />
        
        {/* Summary Section */}
        {renderSummary()}
        
        {/* Ticket List */}
        {renderTicketList()}
      </Box>
      
      {/* Bottom Action Buttons */}
      {renderActionButtons()}

      {/* Bottom Summary (Duplicate - Consider Removing) */}
      {ticketsSummary && !isLoadingTickets && !isInitializing && !isError && (
        <>
          <Divider distance="large" />
          {renderSummary()}
        </>
      )}
    </>
  );
};

// Export the extension
hubspot.extend(() => <Extension />);