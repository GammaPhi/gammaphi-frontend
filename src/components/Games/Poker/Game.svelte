<script>
import Container from "../../Inputs/Container.svelte";
import Link from "../../Link.svelte";
import { autoRefreshingVariable, formatGameId } from '../../../js/global-utils';
import { onMount } from "svelte";
import { lamden_vk } from '../../../stores/lamdenStores'
import { derived, writable, get } from "svelte/store";
import { checkPokerContractState, sendPokerPHIApproval, sendPokerTransaction, hydrateProfileForAddress } from '../../../js/lamden-utils'
import { retrievePemFileFromBrowser, storePemFileInBrowser, decrypt, loadPrivateKeyFromPem } from "../../../js/rsa-utils";
import BN from 'bignumber.js'
import Button from "../../Button.svelte";
import Errors from "./Errors.svelte";
import Input from "../../Inputs/Input.svelte";
import BnInputField from "../../Inputs/BNInputField.svelte";

export let game_id, goBack;

const hasFocus = writable(false);
const creator = writable('');
const creatorName = writable('');
const dealer = writable('');
const next_better = writable('');
const players = writable([]);
const activePlayers = writable([]);
const folded = writable([]);
const winners = writable([]);
const allIn = writable([]);
const hand_id = writable(null);
const completed = writable(false);
const payedOut = writable(false);
const ante = writable(BN(0));
const pot = writable(BN(0));
const currentBet = writable(BN(0));
const playerMessagesStores = writable({});
const playerChipsStores = writable({});
const playerBetStores = writable({});
const playerHandStores = writable({});
const playerNamesStores = writable({});
const myEncryptedHand = writable('');
const privateKeyErrors = writable([]);
const privateKeyInput = writable('');
const storedPemFile = writable('');
const privateKey = derived([lamden_vk, storedPemFile], ([$lamden_vk, $storedPemFile]) => {
    try {
        privateKeyErrors.set([]);
        if ($storedPemFile.length > 0) {
            return loadPrivateKeyFromPem($storedPemFile);
        } else {
            return loadPrivateKeyFromPem(retrievePemFileFromBrowser($lamden_vk));
        }
    } catch(e) {
        privateKeyErrors.set(["Unable to retrieve PEM file. Please reupload it"]);
        return null;
    }
});

const myDecryptedHand = derived([myEncryptedHand, privateKey], ([$myEncryptedHand, $privateKey])=>{
    try {
        return decrypt($myEncryptedHand, $privateKey)    
    } catch(e) {
        console.log(e);
        return 'Unable to decrypt your hand.'
    }
});


const updatePrivateKey = () => {
    storePemFileInBrowser($lamden_vk, $privateKeyInput);
    storedPemFile.set($privateKeyInput)
};

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
    return () => {
        hasFocus.set(false);
    }
})

// update game state regularly
const loadedCurrentHand = writable(false);
autoRefreshingVariable(
    hand_id, 
    ()=>checkPokerContractState("games", [game_id, 'current_hand'], null),
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

// update hand state regularly
const handStateRefreshingFunc = (refresh_func, default_value) => {
    if ($hand_id===null) {
        return Promise.resolve(default_value);
    } else {
        return refresh_func();
    }
};

const loadedEncryptedHand = writable(false);
autoRefreshingVariable(
    myEncryptedHand, 
    ()=>handStateRefreshingFunc(
        ()=>checkPokerContractState("hands", [$hand_id, $lamden_vk, 'player_encrypted_hand'], ''),
        ''
    ),
    hasFocus,
    ()=>loadedEncryptedHand.set(true)
);

const loadedPot = writable(false);
autoRefreshingVariable(
    pot, 
    ()=>handStateRefreshingFunc(
        ()=>checkPokerContractState("hands", [$hand_id, 'pot'], BN(0)),
        BN(0)
    ),
    hasFocus,
    ()=>loadedPot.set(true)
);

const loadedCurrentBet = writable(false);
autoRefreshingVariable(
    currentBet, 
    ()=>handStateRefreshingFunc(
        ()=>checkPokerContractState("hands", [$hand_id, 'current_bet'], BN(0)),
        BN(0)
    ),
    hasFocus,
    ()=>loadedCurrentBet.set(true)
);

autoRefreshingVariable(
    payedOut, 
    ()=>handStateRefreshingFunc(
        ()=>checkPokerContractState("hands", [$hand_id, 'payed_out'], false),
        false
    ),
    hasFocus
);

autoRefreshingVariable(
    winners, 
    ()=>handStateRefreshingFunc(
        ()=>checkPokerContractState("hands", [$hand_id, 'winners'], []),
        []
    ),
    hasFocus
);

autoRefreshingVariable(
    dealer, 
    ()=>handStateRefreshingFunc(
        ()=>checkPokerContractState("hands", [$hand_id, 'dealer'], []),
        BN(0)
    ),
    hasFocus
);

autoRefreshingVariable(
    completed, 
    ()=>handStateRefreshingFunc(
        ()=>checkPokerContractState("hands", [$hand_id, 'completed'], false),
        false
    ),
    hasFocus
);

autoRefreshingVariable(
    next_better, 
    ()=>handStateRefreshingFunc(
        ()=>checkPokerContractState("hands", [$hand_id, 'next_better'], ''),
        ''
    ),
    hasFocus
);

autoRefreshingVariable(
    activePlayers, 
    ()=>handStateRefreshingFunc(
        ()=>checkPokerContractState("hands", [$hand_id, 'active_players'], []),
        []
    ),
    hasFocus
);

autoRefreshingVariable(
    folded, 
    ()=>handStateRefreshingFunc(
        ()=>checkPokerContractState("hands", [$hand_id, 'folded'], []),
        []
    ),
    hasFocus
);

autoRefreshingVariable(
    allIn, 
    ()=>handStateRefreshingFunc(
        ()=>checkPokerContractState("hands", [$hand_id, 'all_in'], []),
        []
    ),
    hasFocus
);

function setupArrayStore(array, storeDict, default_value, refresh_func, update=true, firstTimeCallback=null) {
    let store = get(array);
    console.log(store);
    for(var i = 0; i < store.length; i++) {
        let elem = store[i];
        console.log("Loading: "+elem);
        if (!get(storeDict).hasOwnProperty(elem)) {
            get(storeDict)[elem] = writable(default_value);
            if (update) {
                autoRefreshingVariable(
                    get(storeDict)[elem], 
                    refresh_func(elem),
                    hasFocus,
                    firstTimeCallback,
                    storeDict
                );
            } else {
                refresh_func(elem)().then((v)=>{
                    get(storeDict)[elem].set(v);
                    storeDict.set(get(storeDict));
                });
            }
        }
    }
}

function setupMessageStores() {
    setupArrayStore(
        players, 
        playerMessagesStores, 
        [], 
        (player)=>()=>checkPokerContractState("messages", [game_id, player], [])
    )
}

function setupNameStores() {
    console.log("Setting up name stores");
    console.log(get(players));
    setupArrayStore(
        players, 
        playerNamesStores, 
        '', 
        (player)=>()=>hydrateProfileForAddress(player, "username", player),
        false
    )
}

function setupChipStores() {
    setupArrayStore(
        players, 
        playerChipsStores, 
        BN(0), 
        (player)=>()=>checkPokerContractState("games", [game_id, player], BN(0))
    )
}

function setupBetStores() {
    setupArrayStore(
        activePlayers, 
        playerBetStores, 
        BN(0), 
        (player)=>()=>handStateRefreshingFunc(
            ()=>checkPokerContractState("hands", [$hand_id, player, 'bet'], BN(0)),
            BN(0)
        )
    )
}

function setupHandStores() {
    setupArrayStore(
        activePlayers, 
        playerHandStores, 
        null, 
        (player)=>()=>handStateRefreshingFunc(
            ()=>checkPokerContractState("hands", [$hand_id, player, 'hand'], null),
            null
        )
    )
}

$: $players, setupNameStores(), setupMessageStores(), setupChipStores();
$: $activePlayers, setupBetStores(), setupHandStores();


const startHandHandler = writable({});
const startHandErrors = writable([]);
const startHandInProgress = writable(false);
const startHand = async () => {
    // start_hand
    startHandInProgress.set(true);
    startHandErrors.set([]);
    let kwargs = {
        game_id: game_id,
        game_type: 0,
    }
    sendPokerTransaction('start_hand', kwargs, startHandHandler, (txResults)=>{
        startHandInProgress.set(false);
        if ($startHandHandler.errors?.length > 0) {
            startHandErrors.set($startHandHandler.errors)
        } else {
            console.log("Success");
            console.log(txResults);
            hand_id.set(txResults.resultInfo.returnResult.replace("'","").replace("'", ""));
        }
    });
};

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

const sendMessageHandler = writable({});
const sendMessageErrors = writable([]);
const sendMessageInProgress = writable(false);
const sendMessage = async (message) => {
    // game_message
    sendMessageInProgress.set(true);
    sendMessageErrors.set([]);
    let kwargs = {
        game_id: game_id,
        message: message,
    }
    sendPokerTransaction('game_message', kwargs, sendMessageHandler, (txResults)=>{
        sendMessageInProgress.set(false);
        if ($sendMessageHandler.errors?.length > 0) {
            sendMessageErrors.set($sendMessageHandler.errors)
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
    let kwargs = {
        game_id: game_id,
        player_to_add: $playerToAdd,
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
}

const leaveGameHandler = writable({});
const leaveGameErrors = writable([]);
const leaveGameInProgress = writable(false);
const leaveGame = async () => {
    // leave_game
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

const anteUpHandler = writable({});
const anteUpErrors = writable([]);
const anteUpInProgress = writable(false);
const anteUp = async () => {
    // ante_up
    anteUpInProgress.set(true);
    anteUpErrors.set([]);
    let kwargs = {
        hand_id: $hand_id,
    }
    sendPokerTransaction('ante_up', kwargs, anteUpHandler, (txResults)=>{
        anteUpInProgress.set(false);
        if ($anteUpHandler.errors?.length > 0) {
            anteUpErrors.set($anteUpHandler.errors)
        } else {
            console.log("Success");
            console.log(txResults);
        }
    });
}

const dealCardsHandler = writable({});
const dealCardsErrors = writable([]);
const dealCardsInProgress = writable(false);
const dealCards = async () => {
    // deal_cards
    dealCardsInProgress.set(true);
    dealCardsErrors.set([]);
    let kwargs = {
        hand_id: $hand_id,
    }
    sendPokerTransaction('deal_cards', kwargs, dealCardsHandler, (txResults)=>{
        dealCardsInProgress.set(false);
        if ($dealCardsHandler.errors?.length > 0) {
            dealCardsErrors.set($dealCardsHandler.errors)
        } else {
            console.log("Success");
            console.log(txResults);
        }
    });
}

const betCheckOrFoldHandler = writable({});
const betCheckOrFoldErrors = writable([]);
const betCheckOrFoldInProgress = writable(false);
const betInput = writable(BN('0'));

const betCheckOrFold = async () => {
    // bet_check_or_fold
    betCheckOrFoldInProgress.set(true);
    betCheckOrFoldErrors.set([]);
    let kwargs = {
        hand_id: $hand_id,
        bet: {
            __fixed__: BN($betInput).toString()
        }
    }
    sendPokerTransaction('bet_check_or_fold', kwargs, betCheckOrFoldHandler, (txResults)=>{
        betCheckOrFoldInProgress.set(false);
        if ($betCheckOrFoldHandler.errors?.length > 0) {
            betCheckOrFoldErrors.set($betCheckOrFoldHandler.errors)
        } else {
            betInput.set(BN('0'));
            console.log("Success");
            console.log(txResults);
        }
    });
}

const verifyHandHandler = writable({});
const verifyHandErrors = writable([]);
const verifyHandInProgress = writable(false);
const verifyHand = async () => {
    // verify_hand
    verifyHandInProgress.set(true);
    verifyHandErrors.set([]);
    let kwargs = {
        hand_id: $hand_id,
        player_hand_str: $myDecryptedHand
    }
    sendPokerTransaction('verify_hand', kwargs, verifyHandHandler, (txResults)=>{
        verifyHandInProgress.set(false);
        if ($verifyHandHandler.errors?.length > 0) {
            verifyHandErrors.set($verifyHandHandler.errors)
        } else {
            console.log("Success");
            console.log(txResults);
        }
    });
}

const payoutHandHandler = writable({});
const payoutHandErrors = writable([]);
const payoutHandInProgress = writable(false);
const payoutHand = async () => {
    // payout_hand
    payoutHandInProgress.set(true);
    payoutHandErrors.set([]);
    let kwargs = {
        hand_id: $hand_id
    }
    sendPokerTransaction('payout_hand', kwargs, payoutHandHandler, (txResults)=>{
        payoutHandInProgress.set(false);
        if ($payoutHandHandler.errors?.length > 0) {
            payoutHandErrors.set($payoutHandHandler.errors)
        } else {
            console.log("Success");
            console.log(txResults);
        }
    });
}

const formatHand = (handStr) => {
    console.log("Formatting hand: "+handStr);
    let h = handStr.split(":")
    if (h.length === 2) {
        h = [h[0]]
    }
    if (h.length == 1 && h[0].length == 2) {
        let card = h[0];
        let text = "";
        if (card[0] === 'A') {
            text += "Ace";
        } else if (card[0] === 'K') {
            text += "King"
        } else if (card[0] === 'Q') {
            text += "Queen"
        } else if (card[0] === 'J') {
            text += "Jack"
        } else if (card[0] === 'T') {
            text += "10"
        } else {
            text += card[0];
        }
        text += " of ";
        if (card[1] === 's') {
            text += "Spades"
        } else if (card[1] === 'd') {
            text += "Diamonds"
        } else if (card[1] === 'h') {
            text += "Hearts"
        } else if (card[1] === 'c') {
            text += "Clubs"
        }
        return text
    }
    return handStr;
}

const loaded = derived(
    [loadedCurrentBet, loadedCurrentHand, loadedEncryptedHand, loadedPlayers, loadedPot],
    ([$loadedCurrentBet, $loadedCurrentHand, $loadedEncryptedHand, $loadedPlayers, $loadedPot]) => {
        return $loadedCurrentBet && $loadedCurrentHand && $loadedEncryptedHand && $loadedPlayers && $loadedPot
    }
)

const payoutTime = derived([playerHandStores, activePlayers, folded], 
    ([$playerHandStores, $activePlayers, $folded]) => {
        let valid = true;
        for(var i = 0; i < $activePlayers.length; i++) {
            let p = $activePlayers[i];
            if (!$folded.includes(p)) {
                if (!$playerHandStores.hasOwnProperty(p) || get($playerHandStores[p]) === null) {
                    valid = false;
                    break;
                } 
            }
        }
        return valid;
    });

</script>

<style>
    table {
        margin: auto;
    }
</style>


<Container>
    <Link onClick={goBack}>Return to Lobby</Link>
</Container>    

<h2>Poker Game:{" "}{formatGameId(game_id)}</h2>

{#if $lamden_vk === null}

    <h4>Please connect your wallet.</h4>

{:else if !$loaded}

    <h4>Loading state...</h4>

{:else}

    <Container>
        <Errors errors={privateKeyErrors} />
        {#if $privateKey === null} 
            Unable to find private key. Please reupload it here.
            <br />
            <textarea 
                value={$privateKeyInput}
                on:change={(e)=>privateKeyInput.set(e.target.value)}
                on:input={(e)=>privateKeyInput.set(e.target.value)}
                rows={4}
            /><br />
            <Button
                text="Upload"
                clicked={updatePrivateKey}
                disabled={$privateKeyInput.length===0}
            />
        {/if}
    </Container>


    <Container>
        <Link onClick={()=>showAddChipsForm.set(!$showAddChipsForm)}>Add Chips To Game</Link>
        <br />
        {#if $showAddChipsForm}
        <BnInputField
            onInputChange={(value)=>chipsToAdd.set(value)}
            startingValue={$chipsToAdd}
            inputClass="primaryInput"
            labelClass="label"
            labelText="Chips To Add"
        />
        <Button
            text={$addChipsToGameInProgress ? "Adding..." : "Add"}
            clicked={addChipsToGame}
            disabled={$addChipsToGameInProgress}
        />
        {/if}
    </Container>

    <Container>
        <Link onClick={()=>showWithdrawChipsForm.set(!$showWithdrawChipsForm)}>Withdraw Chips From Game</Link>
        <br />
        {#if $showWithdrawChipsForm}
        <BnInputField
            onInputChange={(value)=>chipsToWithdraw.set(value)}
            startingValue={$chipsToWithdraw}
            inputClass="primaryInput"
            labelClass="label"
            labelText="Chips To Withdraw"
        />
        <Button
            text={$withdrawChipsFromGameInProgress ? "Withdrawing..." : "Withdraw"}
            clicked={withdrawChipsFromGame}
            disabled={$withdrawChipsFromGameInProgress}
        />
        {/if}
    </Container>

    <h3>Owner:{" "}
        {$creatorName}
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
                {!$playerNamesStores.hasOwnProperty(player)?'Loading...':get($playerNamesStores[player])}
            </td>
            <td>
                {!$playerChipsStores.hasOwnProperty(player)?'Loading...':get($playerChipsStores[player])}
            </td>
        </tr>
        {/each}
    </tbody>
    </table>
    <br /><br />

    {#if $creator === $lamden_vk}
        <Link onClick={()=>{playerToAdd.set(''); showAddPlayer.set(!$showAddPlayer)}}>Add Player</Link>
        <br />
        <br />
        {#if $showAddPlayer}
            <Input 
                value={$playerToAdd} 
                onClick={playerToAdd.set}
                onEnterButton={addPlayerToGame}
            />
            <Button 
                text={$addPlayerToGameInProgress ? "Adding..." : "Add" }
                clicked={addPlayerToGame} 
                disabled={$playerToAdd.length===0 || $addPlayerToGameInProgress} 
            /> <br /> <br />
        {/if}
    {/if}

    <h2>Hand State</h2>

    <h3>Current Pot: {$pot}</h3>

    {#if $myDecryptedHand.length > 0}
        <h3>My Hand: {formatHand($myDecryptedHand)}</h3>
    {/if}

    {#if $hand_id === null || $payedOut === true}
        <Errors errors={startHandErrors} />
        <Button
            text={$startHandInProgress ? "Starting..." : "Start Hand"}
            clicked={startHand}
            disabled={$startHandInProgress}
        />

    {:else if $completed === true}

        Hand completed...        

        {#if $payoutTime}

            This hand has completed...

            <Errors errors={payoutHandErrors} />
            <Button
                text={$payoutHandInProgress ? "Paying..." : "Payout Hand"}
                clicked={payoutHand}
                disabled={$payoutHandInProgress}
            />

        {:else if $activePlayers.includes($lamden_vk) && !$folded.includes($lamden_vk)}

            {#if $activePlayers.length - $folded.length == 1}

                Everyone else folded... No need to verify your hand.

                <Errors errors={payoutHandErrors} />
                <Button
                    text={$payoutHandInProgress ? "Paying..." : "Payout Hand"}
                    clicked={payoutHand}
                    disabled={$payoutHandInProgress}
                />
            
            {:else}

                {#if $playerHandStores.hasOwnProperty($lamden_vk) && get($playerHandStores[$lamden_vk]) !== null}
                
                    Waiting for others to verify their hands...
                
                {:else}

                    <Errors errors={verifyHandErrors} />
                    <Button
                        text={$verifyHandInProgress ? "Verifying..." : "Verify Hand"}
                        clicked={verifyHand}
                        disabled={$verifyHandInProgress}
                    />
                
                {/if}
            
            {/if}

        {:else if $folded.includes($lamden_vk)}

            You folded. Waiting for next hand...

        {/if}

    {:else if $next_better.length === 0}

        Hand hasn't been dealt yet...

        {#if $activePlayers.includes($lamden_vk)}

            {#if $activePlayers.length <= 1}

                Waiting for at least one more player to ante up...

            {:else if $dealer === $lamden_vk}

                <Errors errors={dealCardsErrors} />
                <Button
                    text={$dealCardsInProgress ? "Dealing..." : "Deal Cards"}
                    clicked={dealCards}
                    disabled={$dealCardsInProgress}
                />

            {:else}

                Waiting for dealer to deal cards...

            {/if}

        {:else}

            <Errors errors={anteUpErrors} />
            <Button
                text={$anteUpInProgress ? "Placing Ante..." : "Ante Up"}
                clicked={anteUp}
                disabled={$anteUpInProgress}
            />

        {/if}

    {:else if $next_better === $lamden_vk}

        <h4>
            Place a bet below (bet 0 to check or -1 to fold)
        </h4>

        <BnInputField
            onInputChange={(value)=>betInput.set(value)}
            startingValue={$betInput}
            inputClass="primaryInput"
            labelClass="label"
            labelText="My Bet"
        />
        <br />
        <Errors errors={betCheckOrFoldErrors} />
        <Button
            text={$betCheckOrFoldInProgress ? "Betting..." : "Bet"}
            clicked={async () => await betCheckOrFold()}
            disabled={$betCheckOrFoldInProgress}
        />    

    {/if}

    <br />
    <br />
    <table>
    <thead>
        <tr>
            <th>
                Player
            </th>
            <th>
                Chips
            </th>
            <th>
                In Pot
            </th>
            <th>
                Hand
            </th>
        </tr>
    </thead>
    <tbody>
        {#each $activePlayers as player}
        <tr>
            <td>
                {!$playerNamesStores.hasOwnProperty(player)?'Loading...':get($playerNamesStores[player])}
                {$dealer.length > 0 && $dealer===player ? "(D)" : ""}
                {$next_better.length > 0 && $next_better===player ? "(*)" : ""}
            </td>
            <td>
                {!$playerChipsStores.hasOwnProperty(player)?'Loading...':get($playerChipsStores[player])}
            </td>
            <td>
                {!$playerBetStores.hasOwnProperty(player)?'Loading...':get($playerBetStores[player])}
            </td>
            <td>
                {!$playerHandStores.hasOwnProperty(player)?'Loading...':get($playerHandStores[player])===null?"(private)":get($playerHandStores[player])}
            </td>
        </tr>
        {/each}
    </tbody>
    </table>
    <br /><br />

{/if}