<script>
import { derived, writable, get } from 'svelte/store'
import { 
    generatePrivateKey,
    privateKeyToPem,
    getNandE,
    storePemFileInBrowser,
    encrypt,
    publicKeyFromNE,
} from '../../js/rsa-utils';
import Fren from './FrenProfile.svelte';
import { 
    username, 
    display_name,
    icon_base64,
    icon_url,
    frens,
privateKey
} from '../../stores/profileStore'
import { lamden_vk } from '../../stores/lamdenStores';
import { 
    hydrateProfileForAddress,
    sendProfileAction,
    sendMessageTo
} from '../../js/lamden-utils'
import Input from '../Inputs/Input.svelte';
import Button from '../Button.svelte';
import Container from '../Inputs/Container.svelte';
import Link from '../Link.svelte';
import { setupArrayStore } from '../../js/global-utils';
import { onMount } from 'svelte';
import { navigateLink } from '../../js/navigation-utils';
import PrivateKeyUpload from './PrivateKeyUpload.svelte';

const friendToAdd = writable('');
const addFriendResultsTracker = writable({});
const addFriendErrors = writable([]);
const addFriendInProgress = writable(false);


const addFriend = async () => {
    addFriendErrors.set([]);
    addFriendInProgress.set(true);
    sendProfileAction(
        "profile",
        {
            frens: [$friendToAdd],
            action: "add_frens"
        },
        addFriendResultsTracker,
        (txResults) => {
            addFriendInProgress.set(false);
            if ($addFriendResultsTracker.errors?.length > 0) {
                addFriendErrors.set($addFriendResultsTracker.errors)
            } else {
                console.log(txResults);
                let _frens = $frens;
                _frens.push($friendToAdd);
                frens.set(txResults.txBlockResult.state[0].value);
            }
        }    
    )
};

const hasFocus = writable(false);
onMount(()=>{
    hasFocus.set(true);
    return () => {
        hasFocus.set(false);
    }
})


const frensNames = writable({});
function setupFrensNames() {
    setupArrayStore(
        hasFocus,
        frens, 
        frensNames, 
        null, 
        (fren)=>()=>hydrateProfileForAddress(fren, "username", fren),
        false,
    )
}

$: $frens, setupFrensNames();


</script>

<style>
    .avatar{
        height:100px;
        width:100px;
        border-radius: 50%
    }
</style>

<h2>
    Welcome {$display_name}!
</h2>
<Container>
    {#if $icon_base64.length !== 0}
    <img class="avatar" src={$icon_base64} alt="d" />
    {/if}
    <h4>
        {$username}
    </h4>
</Container>
{#if $privateKey === null} 
    <PrivateKeyUpload />
{/if}
<Container>
    <Container>
        <Input
            label="Add Fren"
            onClick={friendToAdd.set}
            value={$friendToAdd}
            onEnterButton={addFriend}
        /><br />
        {#if $addFriendErrors !== null}
            {#each $addFriendErrors as error}
                <div class="username-error error">
                    {error}
                </div>
            {/each}
        {/if}
        <Button 
            disabled={$addFriendInProgress || $friendToAdd.length===0} 
            text={$addFriendInProgress ? "Adding..." : "Add"} 
            clicked={addFriend} 
        />
    </Container>
    <h3>
        Your Frens
    </h3>
    <Container>
        {#if Array.isArray($frens)}
            {#each $frens as fren}
                <a class="link" on:click={navigateLink} href={`/fren/${fren}`}>
                    {!$frensNames.hasOwnProperty(fren)||get($frensNames[fren])===null?"Loading...":get($frensNames[fren])}
                </a>
                <br/>
                <br/>
            {/each}
        {/if}
    </Container>

</Container>