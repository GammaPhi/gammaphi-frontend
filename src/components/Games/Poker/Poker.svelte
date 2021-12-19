<script>
import { onMount } from "svelte";
import { writable, derived, get } from "svelte/store";
import { checkPokerContractState, sendPokerTransaction } from '../../../js/lamden-utils';
import { lamden_vk } from '../../../stores/lamdenStores'
import Container from "../../Inputs/Container.svelte";
import Link from "../../Link.svelte";
import Game from "./Game.svelte";
import CreateGameForm from './CreateGameForm.svelte';
import { autoRefreshingVariable, setupArrayStore, formatGameId } from '../../../js/global-utils';
import Input from "../../Inputs/Input.svelte";
import Button from "../../Button.svelte";
import Errors from "./Errors.svelte";
import { 
    username, 
    display_name,
    icon_base64,
} from '../../../stores/profileStore'

let hasFocus = writable(false);

onMount(()=>{
    hasFocus.set(true);
    return () => {
        hasFocus.set(false);
    }
})

const selectedGame = writable(null);
const selectedGameName = writable(null);
const games = writable([]);
const gameNames = writable({});
const gameInvites = writable([]);
const gameInviteNames = writable({});
const loadedPlayersGames = writable(false);
const loadedPlayersInvites = writable(false);
const loaded = derived([loadedPlayersGames, loadedPlayersInvites], 
    ([$loadedPlayersGames, $loadedPlayersInvites]) => {
        return $loadedPlayersGames && $loadedPlayersInvites
    }
);

autoRefreshingVariable(
    games, 
    ()=>checkPokerContractState("players_games", [$lamden_vk], []),
    hasFocus,
    ()=>loadedPlayersGames.set(true),
    null,
    10000
);

autoRefreshingVariable(
    gameInvites, 
    ()=>checkPokerContractState("players_invites", [$lamden_vk], []),
    hasFocus,
    ()=>loadedPlayersInvites.set(true),
    null,
    10000
);

function setupGameNamesStores() {
    setupArrayStore(
        hasFocus,
        games, 
        gameNames, 
        '', 
        (game)=>()=>checkPokerContractState("games", [game, "name"], formatGameId(game)),
        false
    )
}

function setupGameInviteNamesStores() {
    setupArrayStore(
        hasFocus,
        gameInvites, 
        gameInviteNames, 
        '', 
        (game)=>()=>checkPokerContractState("games", [game, "name"], formatGameId(game)),
        false
    )
}

$: $games, setupGameNamesStores();
$: $gameInvites, setupGameInviteNamesStores();

const handleInviteHandler = writable({});
const handleInviteErrors = writable([]);
const handleInviteInProgress = writable(false);
const handleInvitation = async (invite, accept) => {
    handleInviteInProgress.set(true);
    handleInviteErrors.set([]);
    let kwargs = {
        game_id: invite,
        accept: accept
    }
    sendPokerTransaction('respond_to_invite', kwargs, handleInviteHandler, (txResults)=>{
        handleInviteInProgress.set(false);
        if ($handleInviteHandler.errors?.length > 0) {
            handleInviteErrors.set($handleInviteHandler.errors)
        } else {
            console.log(txResults);
            console.log("Success");
        }
    });
}

const joinPublicGameHandler = writable({});
const joinPublicGameErrors = writable([]);
const joinPublicGameInProgress = writable(false);
const publicGameId = writable('');
const joinPublicGame = async (game_id) => {
    joinPublicGameInProgress.set(true);
    joinPublicGameErrors.set([]);
    let kwargs = {
        game_id: game_id,
        accept: true
    }
    sendPokerTransaction('respond_to_invite', kwargs, joinPublicGameHandler, (txResults)=>{
        joinPublicGameInProgress.set(false);
        if ($joinPublicGameHandler.errors?.length > 0) {
            joinPublicGameErrors.set($joinPublicGameHandler.errors)
        } else {
            console.log(txResults);
            console.log("Success");
        }
    });
}

</script>

{#if $selectedGame === null}
<h2>Poker Lobby</h2>
<Container>

    <CreateGameForm selectedGame={selectedGame} selectedGameName={selectedGameName} />
    
    {#if $lamden_vk === null}

        <h4>Please connect your wallet.</h4>

    {:else if !$loaded}

        <h3>
            Loading lobby state...
        </h3>

    {:else}
        <Container>
            <h3>Your Games</h3>
            {#if Array.isArray($games)}
                {#each $games as game}
                        {#if $gameNames.hasOwnProperty(game) && get($gameNames[game]) !== null}
                        <Link onClick={()=>{selectedGame.set(game); selectedGameName.set(get($gameNames[game]))}}>
                            {get($gameNames[game])}
                        </Link>
                        {:else}
                            Loading...
                        {/if}
                    <br />
                {/each}    
            {/if}
        </Container>
        <Container>
            <h3>Join Public Game</h3>
            <Input
                value={$publicGameId}
                onClick={publicGameId.set}
                onEnterButton={()=>joinPublicGame($publicGameId)}
            />
            <Errors errors={joinPublicGameErrors} />
            <Button 
                text={$joinPublicGameInProgress ? "Joining..." : "Join"} 
                clicked={()=>joinPublicGame($publicGameId)} 
                disabled={$publicGameId.length === 0 || $joinPublicGameInProgress}    
            />
        </Container>
        <Container>
            <h3>Your Game Invitations</h3>
            {#if Array.isArray($gameInvites)}
                <Errors errors={handleInviteErrors} />
                {#each $gameInvites as invite}                
                    <p>
                        {#if $gameInviteNames.hasOwnProperty(invite) && get($gameInviteNames[invite]) !== null}
                            {get($gameInviteNames[invite])}
                            <Link onClick={()=>handleInvitation(invite, true)}>Accept</Link>
                            <Link onClick={()=>handleInvitation(invite, false)}>Decline</Link>
                        {:else}
                            Loading...
                        {/if}
                    </p>
                {/each}    
            {/if}
        </Container>
    {/if}
</Container>

{:else}

<Container>
    <Game game_id={$selectedGame} gameName={$selectedGameName} goBack={()=>{selectedGame.set(null); selectedGameName.set(null)}} />
</Container>

{/if}
