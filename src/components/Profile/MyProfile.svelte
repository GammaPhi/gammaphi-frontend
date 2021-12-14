<script>
import { derived, writable } from 'svelte/store'
import { 
    generatePrivateKey,
    privateKeyToPem,
    getNandE,
    storePemFileInBrowser
} from '../../js/rsa-utils';
import { 
    username, 
    display_name,
    icon_base64,
    icon_url,
    frens
} from '../../stores/profileStore'
import { lamden_vk } from '../../stores/lamdenStores';
import { 
    sendCreateProfile, 
    sendUpdateProfile, 
    hydrateProfile,
    sendProfileAddFrens,
    sendProfileRemoveFrens
} from '../../js/lamden-utils'
import Input from '../Inputs/Input.svelte';
import Button from '../Button.svelte';
import Container from '../Inputs/Container.svelte';
import Link from '../Link.svelte';

const friendToAdd = writable('');
const addingFriend = writable(false);
const addFriendResultsTracker = writable({});
const addFriendErrors = writable([]);
const waitingForAddFriend = writable(false);


const addFriend = async () => {
    addFriendErrors.set([]);
    waitingForAddFriend.set(true);
    await sendProfileAddFrens(
        [$friendToAdd],
        addFriendResultsTracker,
        (txResults) => {
            waitingForAddFriend.set(false);
            if ($addFriendResultsTracker.errors?.length > 0) {
                addFriendErrors.set($addFriendResultsTracker.errors)
            } else {
                console.log(txResults);
                let _frens = $frens;
                _frens.push($friendToAdd);
                frens.set(_frens);
            }
        }    
    )
};

</script>

<style>
    .buttons{
        margin: 2rem auto 1rem;
    }
    .username-error{
        margin: 0.5rem auto 0.5rem;
    }
    .upload{
        cursor:pointer;
    }
    .avatar{
        height:100px;
        width:100px;
        border-radius: 50%
    }
    p {
        max-width: 400px;
        margin-left: auto;
        margin-right: auto;
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
<Container>
    <h3>
        Your Frens
    </h3>
    <Container>
        <Link onClick={()=>{friendToAdd.set(''); addingFriend.set(!$addingFriend)}}>Add Friend</Link>
        {#if $addingFriend}
            <br /><br />
            <Input
                label="Username or Address"
                onClick={friendToAdd.set}
                value={$friendToAdd}
                onEnterButton={addFriend}
            />
            <Button 
                disabled={$waitingForAddFriend || $friendToAdd.length===0} 
                text={$waitingForAddFriend ? "Adding..." : "Add"} 
                clicked={addFriend} 
            />
            {#if $addFriendErrors !== null}
                {#each $addFriendErrors as error}
                    <div class="username-error error">
                        {error}
                    </div>
                {/each}
            {/if}
        {/if}
    </Container>
    {#if Array.isArray($frens)}
        {#each $frens as fren}
        {fren}
        {/each}
    {/if}
</Container>