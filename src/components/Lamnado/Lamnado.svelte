<script>
import { Tabs, TabList, TabPanel, Tab } from '../../js/tabs';
import Deposit from './Deposit.svelte'
import Withdraw from './Withdraw.svelte'



</script>

<style>
    
</style>

<h2>(Work In Progress)</h2>
<div class="buttons" align="middle">
    <Tabs initialSelectedTabIndex={0}>
        <TabList>
            <Tab>Deposit</Tab>
            <Tab>Withdraw</Tab>
        </TabList>
        
        <TabPanel>
            <Deposit />
        </TabPanel>
    
        <TabPanel>
            <Withdraw />
        </TabPanel>
    </Tabs>
</div>
