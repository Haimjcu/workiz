
 import { Text, Flex } from '@hubspot/ui-extensions';
import { CrmAssociationTable } from '@hubspot/ui-extensions/crm';
 
export const DealPanelInner = ({ panelSubtitle, operator }) => {
  return (
    <>
      <Flex direction={'column'} gap={'lg'}>
        <Text variant="microcopy">
          This example is a card for contact records to display high-level associated deal information in a table.
        </Text>
        <Text format={panelSubtitle}></Text>
        <CrmAssociationTable
          objectTypeId="0-3"
          propertyColumns={[
            'dealname',
            'hubspot_owner_id',
            'amount',
            'dealstage',
          ]}
          quickFilterProperties={['hubspot_owner_id', 'dealstage', 'amount']}
          pageSize={10}
          preFilters={[
            {
              operator: 'NOT_IN',
              property: 'dealstage',
              values: ['closedwon', 'closedlost'],
            },
            {
              operator: operator,
              property: 'amount',
              value: 1000,
            },
          ]}
          sort={[
            {
              direction: 1,
              columnName: 'amount',
            },
          ]}
          searchable={true}
          pagination={true}
        />
      </Flex>
    </>
  )
}