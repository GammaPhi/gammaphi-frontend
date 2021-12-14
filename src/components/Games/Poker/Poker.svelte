<script>
import { onMount } from "svelte";
import { writable, derived } from "svelte/store";
import { checkPokerContractState, sendPokerTransaction } from '../../../js/lamden-utils';
import { lamden_vk } from '../../../stores/lamdenStores'
import Container from "../../Inputs/Container.svelte";
import Link from "../../Link.svelte";
import Game from "./Game.svelte";
import CreateGameForm from './CreateGameForm.svelte';
import { autoRefreshingVariable, formatGameId } from '../../../js/global-utils';
import Input from "../../Inputs/Input.svelte";
import Button from "../../Button.svelte";
import Errors from "./Errors.svelte";

let hasFocus = writable(false);

onMount(()=>{
    hasFocus.set(true);
    return () => {
        hasFocus.set(false);
    }
})

const selectedGame = writable(null);
const games = writable([]);
const gameInvites = writable([]);
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
    ()=>loadedPlayersGames.set(true)
);

autoRefreshingVariable(
    gameInvites, 
    ()=>checkPokerContractState("players_invites", [$lamden_vk], []),
    hasFocus,
    ()=>loadedPlayersInvites.set(true)
);

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

    {#if $lamden_vk === null}

        <h4>Please connect your wallet.</h4>

    {:else if !$loaded}

        <h3>
            Loading lobby state...
        </h3>

    {:else}
        <Container> 
            <CreateGameForm selectedGame={selectedGame} />
            <Container>
                <h3>Your Games</h3>
                {#if Array.isArray($games)}
                    {#each $games as game}
                        <Link onClick={()=>selectedGame.set(game)}>{formatGameId(game)}</Link>
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
                            {invite}
                            <Link onClick={()=>handleInvitation(invite, true)}>Accept</Link>
                            <Link onClick={()=>handleInvitation(invite, false)}>Decline</Link>
                        </p>
                    {/each}    
                {/if}
            </Container>
        </Container>
    {/if}
{:else}

<Container>
    <Game game_id={$selectedGame} goBack={()=>selectedGame.set(null)} />
</Container>

{/if}
