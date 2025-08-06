
import {
  Panel,
  PanelBody,
  PanelFooter,
  PanelSection,
} from '@hubspot/ui-extensions';
 
export const DealPanel = ({ paneltitle, panelId, children, customFooter }) => {
  return (
    <>
      <Panel title={paneltitle} id={panelId}>
        <PanelBody>
          <PanelSection>
            {children}
          </PanelSection>
        </PanelBody>
        <PanelFooter>
          {customFooter || "Footer text"}
        </PanelFooter>
      </Panel>
    </>
  )
}