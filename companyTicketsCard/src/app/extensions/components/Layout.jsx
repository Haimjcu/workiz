// first we need to import the Flex component from the ui-extensions package

import {Flex} from '@hubspot/ui-extensions';

// then we will create a functional component that takes in two props, stats and clicker

export const Layout = ({ stats, clicker }) =>

{ return (    

<Flex direction="row" align='start'>
            <Flex flex="1" align="start">
                {stats}
            </Flex>
            <Flex flex="2" alignSelf="center">
                {clicker}
            </Flex>
        </Flex>)}