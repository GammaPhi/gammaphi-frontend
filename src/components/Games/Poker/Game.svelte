<script>
import Container from "../../Inputs/Container.svelte";
import Link from "../../Link.svelte";
import { autoRefreshingVariable, setupArrayStore, getValueFromDict } from '../../../js/global-utils';
import { onMount } from "svelte";
import { lamden_vk } from '../../../stores/lamdenStores'
import { derived, writable, get } from "svelte/store";
import { checkPokerContractState, sendPokerPHIApproval, getAddressForUsername, sendPokerTransaction, hydrateProfileForAddress, sendProfileAction, getChannelUsers } from '../../../js/lamden-utils'
import { gameTypeHumanReadable } from "../../../js/poker-utils";
import BN from 'bignumber.js'
import Button from "../../Button.svelte";
import Errors from "./Errors.svelte";
import Input from "../../Inputs/Input.svelte";
import BnInputField from "../../Inputs/BNInputField.svelte";
import { Tabs, TabList, TabPanel, Tab } from '../../../js/tabs';
import FrenProfile from "../../Profile/FrenProfile.svelte";
import ChatRoom from "../../Chat/ChatRoom.svelte";
import Hand from "./Hand.svelte";
import PrivateKeyUpload from "../../Profile/PrivateKeyUpload.svelte";
import { privateKey } from "../../../stores/profileStore";

export let game_id, gameName, goBack;

const hasFocus = writable(false);
const creator = writable('');
const creatorName = writable('');
const players = writable([]);
const hand_id = writable(null);
const ante = writable(BN(0));
const gameType = writable(null);
const playerChipsStores = writable({});
const playerNamesStores = writable({});
const channelUsers = writable(null);

onMount(()=>{
    hasFocus.set(true);
    checkPokerContractState("games", [game_id, 'creator'], '').then((v)=>{
        creator.set(v);
        hydrateProfileForAddress(v, "username", v).then((v2)=>{
            creatorName.set(v2);
        });
    })
    checkPokerContractState("games", [game_id, 'ante'], BN(0)).then((v)=>{
        ante.set(v);
    })
    checkPokerContractState("games", [game_id, 'game_type'], null).then((v)=>{
        gameType.set(v);
    })
    getChannelUsers(gameName).then(v=>{
        channelUsers.set(v);
    })
    return () => {
        hasFocus.set(false);
    }
})

// update game state regularly
const loadedCurrentHand = writable(false);
autoRefreshingVariable(
    hand_id, 
    ()=>async () => {
        let current_hand_id = checkPokerContractState("games", [game_id, 'current_hand'], null);
        if ($hand_id !== null && $hand_id !== current_hand_id) {
            // update hand cache
            // TODO update hand cache
            cacheHand();
        }
        return current_hand_id;
    },
    hasFocus,
    ()=>loadedCurrentHand.set(true)
);

const loadedPlayers = writable(false);
autoRefreshingVariable(
    players, 
    ()=>checkPokerContractState("games", [game_id, 'players'], []),
    hasFocus,
    ()=>loadedPlayers.set(true)
);


function setupNameStores() {
    console.log("Setting up name stores");
    console.log(get(players));
    setupArrayStore(
        hasFocus,
        players, 
        playerNamesStores, 
        '', 
        (player)=>()=>hydrateProfileForAddress(player, "username", player),
        false,
        null,
        10000
    )
}

function setupChipStores() {
    setupArrayStore(
        hasFocus,
        players, 
        playerChipsStores, 
        BN(0), 
        (player)=>()=>checkPokerContractState("games", [game_id, player], BN(0))
    )
}

$: $players, setupNameStores(), setupChipStores();

const addChipsToGameHandler = writable({});
const addChipsToGameApprovalHandler = writable({});
const addChipsToGameErrors = writable([]);
const addChipsToGameInProgress = writable(false);
const chipsToAdd = writable(BN(0));
const showAddChipsForm = writable(false);
const addChipsToGame = async () => {
    // add_chips_to_game
    addChipsToGameInProgress.set(true);
    addChipsToGameErrors.set([]);
    sendPokerPHIApproval(BN($chipsToAdd), addChipsToGameApprovalHandler, (txResults)=>{
        if ($addChipsToGameApprovalHandler.errors?.length > 0) {
            addChipsToGameInProgress.set(false);
            addChipsToGameErrors.set($addChipsToGameApprovalHandler.errors)
        } else {
            let kwargs = {
                game_id: game_id,
                amount: {
                    __fixed__: BN($chipsToAdd).toString()
                },
            }
            sendPokerTransaction('add_chips_to_game', kwargs, addChipsToGameHandler, (txResults)=>{
                addChipsToGameInProgress.set(false);
                if ($addChipsToGameHandler.errors?.length > 0) {
                    addChipsToGameErrors.set($addChipsToGameHandler.errors)
                } else {
                    console.log("Success");
                    console.log(txResults);
                }
            });
        }
    })
}

const withdrawChipsFromGameHandler = writable({});
const withdrawChipsFromGameErrors = writable([]);
const withdrawChipsFromGameInProgress = writable(false);
const chipsToWithdraw = writable(BN(0));
const showWithdrawChipsForm = writable(false);
const withdrawChipsFromGame = async () => {
    // withdraw_chips_from_game
    withdrawChipsFromGameInProgress.set(true);
    withdrawChipsFromGameErrors.set([]);
    let kwargs = {
        game_id: game_id,
        amount: {
            __fixed__: BN($chipsToWithdraw).toString()
        },
    }
    sendPokerTransaction('withdraw_chips_from_game', kwargs, withdrawChipsFromGameHandler, (txResults)=>{
        withdrawChipsFromGameInProgress.set(false);
        if ($withdrawChipsFromGameHandler.errors?.length > 0) {
            withdrawChipsFromGameErrors.set($withdrawChipsFromGameHandler.errors)
        } else {
            console.log("Success");
            console.log(txResults);
        }
    });
}

const addPlayerToGameHandler = writable({});
const addPlayerToGameErrors = writable([]);
const addPlayerToGameInProgress = writable(false);
const playerToAdd = writable('');
const showAddPlayer = writable(false);

const addPlayerToGame = async () => {
    // add_player_to_game
    addPlayerToGameInProgress.set(true);
    addPlayerToGameErrors.set([]);
    getAddressForUsername($playerToAdd, $playerToAdd).then((player_to_add)=>{
        let kwargs = {
            game_id: game_id,
            player_to_add: player_to_add,
        }
        sendPokerTransaction('add_player_to_game', kwargs, addPlayerToGameHandler, (txResults)=>{
            addPlayerToGameInProgress.set(false);
            if ($addPlayerToGameHandler.errors?.length > 0) {
                addPlayerToGameErrors.set($addPlayerToGameHandler.errors)
            } else {
                console.log("Success");
                console.log(txResults);
                playerToAdd.set('');
            }
        });
    });
}

const leaveGameHandler = writable({});
const leaveGameErrors = writable([]);
const leaveGameInProgress = writable(false);
const leaveGame = async () => {
    // leave_game
    if (confirm("Are you sure?")) {
        leaveGameInProgress.set(true);
        leaveGameErrors.set([]);
        let kwargs = {
            game_id: game_id
        }
        sendPokerTransaction('leave_game', kwargs, leaveGameHandler, (txResults)=>{
            leaveGameInProgress.set(false);
            if ($leaveGameHandler.errors?.length > 0) {
                leaveGameErrors.set($leaveGameHandler.errors)
            } else {
                console.log("Success");
                console.log(txResults);
            }
        });
    }
}

const createOrUpdateChannelHandler = writable({});
const createOrUpdateChannelErrors = writable([]);
const createOrUpdateChannelInProgress = writable(false);
const createOrUpdateChannel = async () => {
    createOrUpdateChannelInProgress.set(true);
    createOrUpdateChannelErrors.set([]);
    let kwargs = {
        action: $channelUsers === null ? 'create_channel' : 'update_channel',
        users: $players,
        channel_name: gameName
    }
    sendProfileAction('channel', kwargs, createOrUpdateChannelHandler, (txResults)=>{
        createOrUpdateChannelInProgress.set(false);
        if ($createOrUpdateChannelHandler.errors?.length > 0) {
            createOrUpdateChannelErrors.set($createOrUpdateChannelHandler.errors)
        } else {
            console.log("Success");
            console.log(txResults);
            channelUsers.set($players);
        }
    });
}

function isSuperset(set, subset) {
    for (let elem of subset) {
        if (!set.has(elem)) {
            return false
        }
    }
    return true
}
const shouldCreateOrUpdateChannel = derived([players, channelUsers], ([$players, $channelUsers]) => {
    if ($channelUsers === null) return true;
    if ($channelUsers.length != $players.length) return true;
    let set1 = new Set($players);
    let set2 = new Set($channelUsers);
    if (isSuperset(set1, set2) && isSuperset(set2, set1)) {
        return false;
    }
    return true;
});

const loaded = derived(
    [players, loadedCurrentBet, loadedCurrentHand, loadedEncryptedHand, loadedPlayers, loadedPot],
    ([$players, $loadedCurrentBet, $loadedCurrentHand, $loadedEncryptedHand, $loadedPlayers, $loadedPot]) => {
        return $players.length > 0 && $loadedCurrentBet && $loadedCurrentHand && $loadedEncryptedHand && $loadedPlayers && $loadedPot
    }
)

const gameTypeName = derived([gameType], ([$gameType]) => {
    return gameTypeHumanReadable($gameType);
});

const showUserPage = writable(null);

</script>

<style>
    table, th, td {
        border: 1px solid black;
    }

    table {
        width: 100%;
        margin: auto;
    }
</style>


{#if $showUserPage !== null}
    <FrenProfile 
        user_address={$showUserPage}
        goBack={()=>showUserPage.set(null)}
        goBackText="Back To Game"
    />
{:else}

    <Container>
        <Link onClick={goBack}>Return to Lobby</Link>
    </Container>    

    <h2>Poker Game:{" "}{gameName}</h2>

    <h4>{$gameTypeName}</h4>

    {#if $lamden_vk === null}

        <h4>Please connect your wallet.</h4>

    {:else if !$loaded}

        <h4>Loading state...</h4>

    {:else}

    {#if $privateKey === null} 
        <PrivateKeyUpload />
    {/if}

    <Tabs initialSelectedTabIndex={1}>

        <TabList>
            <Tab>Game State</Tab>
            <Tab>Hand State</Tab>
            <Tab>{" "}Chatroom{" "}</Tab>
            <Tab>Management</Tab>
        </TabList>

        <TabPanel>

            <h2>
                Game State
            </h2>
        
            <h3>
                Owner:{" "}{$creatorName}
            </h3>

            <h3>Players</h3>
        
            <table>
            <thead>
                <tr>
                    <th>
                        Player
                    </th>
                    <th>
                        Chip Count
                    </th>
                </tr>
            </thead>
            <tbody>
                {#each $players as player}
                <tr>
                    <td>
                        <Link onClick={()=>showUserPage.set(player)}>
                            {getValueFromDict($playerNamesStores, player, "Loading...")}                        
                        </Link>  
                    </td>
                    <td>
                        {getValueFromDict($playerChipsStores, player, "Loading...")}
                    </td>
                </tr>
                {/each}
            </tbody>
            </table>
            <br /><br />

        </TabPanel>

        <TabPanel>
            <Hand 
                gameType={gameType}
                playerNamesStores={playerNamesStores}
                playerChipsStores={playerChipsStores}
                showUserPage={showUserPage}
                hand_id={hand_id}
            />
            <br /><br />
        </TabPanel>
        <TabPanel>
            <h2>Game Chat</h2>
            {#if $creator === $lamden_vk}
                {#if $shouldCreateOrUpdateChannel}
                    <Container>
                        {#if $channelUsers === null}
                        <Errors errors={createOrUpdateChannelErrors} />
                        <Button
                            text={$createOrUpdateChannelInProgress ? "Creating..." : "Create Private Game Chat"}
                            clicked={createOrUpdateChannel}
                            disabled={$createOrUpdateChannelInProgress}
                        />
                        {:else}
                        <p>At least one player in this game has been added or removed. Please update the private game chat.</p>
                        <Button
                            text={$createOrUpdateChannelInProgress ? "Updating..." : "Update Private Game Chat"}
                            clicked={createOrUpdateChannel}
                            disabled={$createOrUpdateChannelInProgress}
                        />
                        {/if}
                    </Container>
                {/if}
            {/if}
            {#if $channelUsers === null}
                <p>Private channel not created.</p>
                {#if $players !== null}
                    <ChatRoom
                        channelName={gameName}
                        channelUsers={$players}
                        usersNames={playerNamesStores}
                    />
                {:else}
                    <p>Loading...</p>
                {/if}
            {:else}
                <ChatRoom
                    channelName={gameName}
                    channelUsers={$channelUsers}
                    usersNames={playerNamesStores}
                />
            {/if}
            <br /><br />
        </TabPanel>
        <TabPanel>
            <h2>
                Game Management
            </h2>
            <Container>
                <Link onClick={()=>showAddChipsForm.set(!$showAddChipsForm)}>Add Chips</Link>
                <br />
                {#if $showAddChipsForm}
                <br />
                <BnInputField
                    onInputChange={(value)=>chipsToAdd.set(value)}
                    startingValue={$chipsToAdd}
                    inputClass="primaryInput"
                    labelClass="label"
                    labelText="Chips To Add"
                />
                <Errors errors={addChipsToGameErrors} />
                <Button
                    text={$addChipsToGameInProgress ? "Adding..." : "Add"}
                    clicked={addChipsToGame}
                    disabled={$addChipsToGameInProgress}
                />
                {/if}
            </Container>
            <br />
            <Container>
                <Link onClick={()=>showWithdrawChipsForm.set(!$showWithdrawChipsForm)}>Withdraw Chips</Link>
                <br />
                {#if $showWithdrawChipsForm}
                <br />
                <BnInputField
                    onInputChange={(value)=>chipsToWithdraw.set(value)}
                    startingValue={$chipsToWithdraw}
                    inputClass="primaryInput"
                    labelClass="label"
                    labelText="Chips To Withdraw"
                />
                <Errors errors={withdrawChipsFromGameErrors} />
                <Button
                    text={$withdrawChipsFromGameInProgress ? "Withdrawing..." : "Withdraw"}
                    clicked={withdrawChipsFromGame}
                    disabled={$withdrawChipsFromGameInProgress}
                />
                {/if}
            </Container>
            <br />
            {#if $creator === $lamden_vk}                
                <Container>
                    <Link onClick={()=>{playerToAdd.set(''); showAddPlayer.set(!$showAddPlayer)}}>Add Player</Link>
                    <br />
                    {#if $showAddPlayer}
                        <br />
                        <Input 
                            value={$playerToAdd} 
                            onClick={playerToAdd.set}
                            onEnterButton={addPlayerToGame}
                        />
                        <Errors errors={addPlayerToGameErrors} />
                        <Button 
                            text={$addPlayerToGameInProgress ? "Adding..." : "Add" }
                            clicked={addPlayerToGame} 
                            disabled={$playerToAdd.length===0 || $addPlayerToGameInProgress} 
                        />
                    {/if}
                </Container>
                <br />
            {/if} 
            <Container>
                <Link onClick={leaveGame}>Leave Game</Link>
            </Container>
            <br />
        </TabPanel>

    </Tabs>

    {/if}
{/if}