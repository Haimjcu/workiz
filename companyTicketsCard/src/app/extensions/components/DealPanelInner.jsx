
import { Box, Flex, Heading, Divider, Tag, Link } from '@hubspot/ui-extensions';
 
export const DealPanelInner = ({ panelSubtitle, comments }) => {

  const showAttachments = (attachments) => {
      return (
        <>
          <Heading variant="h3">Attachments</Heading>
          {attachments.map((attachment, index) => (
            <Link key={index} variant='primary' href={{url: attachment.content_url, external: true,}}>
              {attachment.file_name}
            </Link>
            ))
          }
        </>
      )


  }

  return (
    <>
    <Heading variant="h2">{panelSubtitle}</Heading>
    <Divider />
      <Flex direction="column" gap="large">
        {comments.sort((a, b) => a.id - b.id).map((comment, index) => (
          <>
            <Box key={index} marginTop="md">
              <Tag inline={true} variant="info">{comment.via.channel}</Tag>{comment.plain_body.replace(/&nbsp;/g, '') }
            </Box>
            {comment.attachments && comment.attachments.length > 0 ? showAttachments(comment.attachments): null}
          </>
        ))}
      </Flex>
    </>
  )
}