
import { Button } from "@hubspot/ui-extensions";
 
export const Clicker = ({ panelId }) => {
  panelId = panelId;
  return (
    <Button onClick={(event, reactions) => { reactions.openPanel(panelId) }}>
      View More
    </Button>
  )
}