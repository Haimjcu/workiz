
import { Text, Box, Flex, Tag, Heading, Button, Divider } from "@hubspot/ui-extensions";
 
export const TicketBox = ({ ticket, onButtonClick }) => {

  const ticketDate = (unixTimestamp) => {
    const date = new Date(unixTimestamp * 1000);
    return date.toLocaleString('en-GB');
  }

  return (
    <>
      <Box>
        <Flex direction="column" gap="small">
          <Flex justify="between" align="center" wrap="wrap" gap="small">
            <Tag variant={ticket.priority === 'urgent' || 'high' ? 'error' : 'warning'}>
              {ticket.priority}
            </Tag>
            <Tag variant={ticket.status === 'closed' ? 'success' : 'solved' ? 'warning' : 'error'}>{ticket.status}</Tag>
            <Tag variant="info">{ticket.via.channel}</Tag>
            <Tag variant="info">{ticketDate(ticket.generated_timestamp)}</Tag>
          </Flex>
          
          <Box marginTop="sm" marginBottom="xs">
            <Heading variant="h4">{ticket.subject}</Heading>
          </Box>
          
          <Text>{ticket.description}</Text>
        </Flex>

      </Box>
    </>

  )
}