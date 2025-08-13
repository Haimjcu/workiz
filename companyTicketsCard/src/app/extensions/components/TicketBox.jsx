import { Text, Box, Flex, Tag, Heading } from "@hubspot/ui-extensions";

/**
 * TicketBox component displays ticket information in a structured layout with tags
 * @param {Object} props - Component props
 * @param {Object} props.ticket - Ticket data object
 * @param {string} props.ticket.priority - Ticket priority level (urgent, high, normal, low)
 * @param {string} props.ticket.status - Ticket status (open, pending, solved, closed)
 * @param {Object} props.ticket.via - Via object containing channel information
 * @param {string} props.ticket.via.channel - Communication channel (email, web, phone, etc.)
 * @param {number} props.ticket.generated_timestamp - Unix timestamp of ticket creation
 * @param {string} props.ticket.subject - Ticket subject line
 * @param {string} props.ticket.description - Ticket description content
 * @param {Function} props.onButtonClick - Callback function for button interactions (currently unused)
 * @returns {JSX.Element} Rendered ticket box component
 */
export const TicketBox = ({ ticket, onButtonClick }) => {
  /**
   * Converts Unix timestamp to human-readable date string
   * @param {number} unixTimestamp - Unix timestamp in seconds
   * @returns {string} Formatted date string in GB locale format
   */
  const formatTicketDate = (unixTimestamp) => {
    const date = new Date(unixTimestamp * 1000);
    return date.toLocaleString('en-GB');
  };

  /**
   * Determines the appropriate variant for priority tag based on priority level
   * @param {string} priority - Ticket priority level
   * @returns {string} Tag variant ('error' for urgent/high, 'warning' for others)
   */
  const getPriorityVariant = (priority) => {
    return (priority === 'urgent' || priority === 'high') ? 'error' : 'warning';
  };

  /**
   * Determines the appropriate variant for status tag based on status value
   * @param {string} status - Ticket status
   * @returns {string} Tag variant ('success' for closed, 'warning' for solved, 'error' for others)
   */
  const getStatusVariant = (status) => {
    if (status === 'closed') return 'success';
    if (status === 'solved') return 'warning';
    return 'error';
  };

  return (
    <Box>
      <Flex direction="column" gap="small">
        {/* Tag row: Priority, Status, Channel, and Date */}
        <Flex justify="between" align="center" wrap="wrap" gap="small">
          {/* Priority tag with conditional styling */}
          <Tag variant={getPriorityVariant(ticket.priority)}>
            {ticket.priority}
          </Tag>
          
          {/* Status tag with conditional styling */}
          <Tag variant={getStatusVariant(ticket.status)}>
            {ticket.status}
          </Tag>
          
          {/* Communication channel tag */}
          <Tag variant="info">
            {ticket.via?.channel || 'Unknown'}
          </Tag>
          
          {/* Formatted creation date tag */}
          <Tag variant="info">
            {formatTicketDate(ticket.generated_timestamp)}
          </Tag>
        </Flex>
        
        {/* Ticket subject heading */}
        <Box marginTop="sm" marginBottom="xs">
          <Heading variant="h4">
            {ticket.subject || 'No Subject'}
          </Heading>
        </Box>
        
        {/* Ticket description */}
        <Text>
          {ticket.description || 'No description available'}
        </Text>
      </Flex>
    </Box>
  );
};