<script>
import Container from "../../Inputs/Container.svelte";
import Link from "../../Link.svelte";
import { autoRefreshingVariable, setupArrayStore, getValueFromDict } from '../../../js/global-utils';
import { onMount } from "svelte";
import { lamden_vk } from '../../../stores/lamdenStores'
import { derived, writable, get } from "svelte/store";
import { checkPokerContractState, sendPokerTransaction } from '../../../js/lamden-utils'
import { decrypt } from "../../../js/rsa-utils";
import { formatHand, HOLDEM_POKER, OMAHA_POKER } from "../../../js/poker-utils";
import BN from 'bignumber.js'
import Button from "../../Button.svelte";
import Errors from "./Errors.svelte";
import BnInputField from "../../Inputs/BNInputField.svelte";

export let  gameType,
            playerNamesStores,
            playerChipsStores,
            showUserPage,           
            hand_id;

const hasFocus = writable(false);
const myEncryptedHand = writable('');
const myEncryptedOtp1 = writable('');
const myEncryptedOtp2 = writable('');
const myEncryptedOtp3 = writable('');
const currentBet = writable(BN(0));
const winners = writable([]);
const allIn = writable([]);
const pot = writable(BN(0));
const next_better = writable('');
const community = writable([]);
const folded = writable([]);
const completed = writable(false);
const payedOut = writable(false);
const dealer = writable('');
const activePlayers = writable([]);
const playerBetStores = writable({});
const playerHandStores = writable({});
const playerOtp1Stores = writable({});
const playerOtp2Stores = writable({});
const playerOtp3Stores = writable({});

onMount(()=>{
    hasFocus.set(true);

    return () => {
        hasFocus.set(false);
    }
})

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


autoRefreshingVariable(
    community, 
    ()=>handStateRefreshingFunc(
        ()=>checkPokerContractState("hands", [$hand_id, 'community'], null),
        null
    ),
    hasFocus,
    null
);

autoRefreshingVariable(
    myEncryptedOtp1, 
    ()=>handStateRefreshingFunc(
        ()=>checkPokerContractState("hands", [$hand_id, $lamden_vk, 'player_encrypted_pad1'], null),
        null
    ),
    hasFocus,
    null
);

autoRefreshingVariable(
    myEncryptedOtp2, 
    ()=>handStateRefreshingFunc(
        ()=>checkPokerContractState("hands", [$hand_id, $lamden_vk, 'player_encrypted_pad2'], null),
        null
    ),
    hasFocus,
    null
);

autoRefreshingVariable(
    myEncryptedOtp3, 
    ()=>handStateRefreshingFunc(
        ()=>checkPokerContractState("hands", [$hand_id, $lamden_vk, 'player_encrypted_pad3'], null),
        null
    ),
    hasFocus,
    null
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

function setupBetStores() {
    setupArrayStore(
        hasFocus,
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
        hasFocus,
        activePlayers, 
        playerHandStores, 
        null, 
        (player)=>()=>handStateRefreshingFunc(
            ()=>checkPokerContractState("hands", [$hand_id, player, 'hand'], null),
            null
        )
    )
}

function setupOtp1Stores() {
    setupArrayStore(
        hasFocus,
        activePlayers, 
        playerOtp1Stores, 
        null, 
        (player)=>()=>handStateRefreshingFunc(
            ()=>checkPokerContractState("hands", [$hand_id, player, 'pad1'], null),
            null
        )
    )
}

function setupOtp2Stores() {
    setupArrayStore(
        hasFocus,
        activePlayers, 
        playerOtp2Stores, 
        null, 
        (player)=>()=>handStateRefreshingFunc(
            ()=>checkPokerContractState("hands", [$hand_id, player, 'pad2'], null),
            null
        )
    )
}

function setupOtp3Stores() {
    setupArrayStore(
        hasFocus,
        activePlayers, 
        playerOtp3Stores, 
        null, 
        (player)=>()=>handStateRefreshingFunc(
            ()=>checkPokerContractState("hands", [$hand_id, player, 'pad3'], null),
            null
        )
    )
}

$: $activePlayers, setupBetStores(), setupHandStores(), setupOtp1Stores(), setupOtp2Stores(), setupOtp3Stores();

            
const startHandHandler = writable({});
const startHandErrors = writable([]);
const startHandInProgress = writable(false);
const startHand = async () => {
    // start_hand
    startHandInProgress.set(true);
    startHandErrors.set([]);
    let kwargs = {
        game_id: game_id
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

const revealOtpHandler = writable({});
const revealOtpErrors = writable([]);
const revealOtpInProgress = writable(false);
const revealOtp = (index) => async () => {
    // reveal_otp
    revealOtpInProgress.set(true);
    revealOtpErrors.set([]);
    let decryptedOtp;
    if (index === 1) {
        decryptedOtp = $decryptedOtp1;
    } else if (index === 2) {
        decryptedOtp = $decryptedOtp2;
    } else if (index === 3) {
        decryptedOtp = $decryptedOtp3;
    } else {
        return; // error?
    }

    let kwargs = {
        hand_id: $hand_id,
        pad: decryptedOtp.split(":")[0],
        salt: decryptedOtp.split(":")[1],
        index: index
    }
    console.log(kwargs);
    sendPokerTransaction('reveal_otp', kwargs, revealOtpHandler, (txResults)=>{
        revealOtpInProgress.set(false);
        if ($revealOtpHandler.errors?.length > 0) {
            revealOtpErrors.set($revealOtpHandler.errors)
        } else {
            console.log("Success");
            console.log(txResults);
        }
    });
}

const revealHandler = writable({});
const revealErrors = writable([]);
const revealInProgress = writable(false);
const reveal = (index) => async () => {
    // reveal
    revealInProgress.set(true);
    revealErrors.set([]);
    let kwargs = {
        hand_id: $hand_id,
        index: index
    }
    sendPokerTransaction('reveal', kwargs, revealHandler, (txResults)=>{
        revealInProgress.set(false);
        if ($revealHandler.errors?.length > 0) {
            revealErrors.set($revealHandler.errors)
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

const myDecryptedHand = derived([myEncryptedHand, privateKey], ([$myEncryptedHand, $privateKey])=>{
    try {
        return decrypt($myEncryptedHand, $privateKey)    
    } catch(e) {
        console.log(e);
        return 'Unable to decrypt your hand.'
    }
});

const decryptedOtp1 = derived([myEncryptedOtp1, privateKey], ([$myEncryptedOtp1, $privateKey])=>{
    try {
        return decrypt($myEncryptedOtp1, $privateKey)    
    } catch(e) {
        console.log(e);
        return 'Unable to decrypt your otp 1.'
    }
});

const decryptedOtp2 = derived([myEncryptedOtp2, privateKey], ([$myEncryptedOtp2, $privateKey])=>{
    try {
        return decrypt($myEncryptedOtp2, $privateKey)    
    } catch(e) {
        console.log(e);
        return 'Unable to decrypt your otp 2.'
    }
});

const decryptedOtp3 = derived([myEncryptedOtp3, privateKey], ([$myEncryptedOtp3, $privateKey])=>{
    try {
        return decrypt($myEncryptedOtp3, $privateKey)    
    } catch(e) {
        console.log(e);
        return 'Unable to decrypt your otp 3.'
    }
});

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

const canReveal1 = derived([playerOtp1Stores, activePlayers], 
    ([$playerOtp1Stores, $activePlayers]) => {
        let valid = true;
        for(var i = 0; i < $activePlayers.length; i++) {
            let p = $activePlayers[i];
            if (!$playerOtp1Stores.hasOwnProperty(p) || get($playerOtp1Stores[p]) === null) {
                valid = false;
                break;
            } 
        }
        return valid;
    });

const canReveal2 = derived([playerOtp2Stores, activePlayers], 
    ([$playerOtp2Stores, $activePlayers]) => {
        let valid = true;
        for(var i = 0; i < $activePlayers.length; i++) {
            let p = $activePlayers[i];
            if (!$playerOtp2Stores.hasOwnProperty(p) || get($playerOtp2Stores[p]) === null) {
                valid = false;
                break;
            } 
        }
        return valid;
    });

const canReveal3 = derived([playerOtp3Stores, activePlayers], 
    ([$playerOtp3Stores, $activePlayers]) => {
        let valid = true;
        for(var i = 0; i < $activePlayers.length; i++) {
            let p = $activePlayers[i];
            if (!$playerOtp3Stores.hasOwnProperty(p) || get($playerOtp3Stores[p]) === null) {
                valid = false;
                break;
            } 
        }
        return valid;
    });

const isRevealed1 = derived([community], ([$community]) => {
    if ($community === null) {
        return false;
    }
    if ($community[0] === null) {
        return false;
    }
    return true;
})

const isRevealed2 = derived([community], ([$community]) => {
    if ($community === null) {
        return false;
    }
    if ($community[1] === null) {
        return false;
    }
    return true;
})

const isRevealed3 = derived([community], ([$community]) => {
    if ($community === null) {
        return false;
    }
    if ($community[2] === null) {
        return false;
    }
    return true;
})



const persistPerHand = {
    pot: pot,
    gameType: gameType,
    playerOtp1Stores: playerOtp1Stores,
    playerOtp2Stores: playerOtp2Stores,
    playerOtp3Stores: playerOtp3Stores,
    activePlayers: activePlayers,
    folded: folded,
    playerHandStores: playerHandStores,
    playerBetStores: playerBetStores,
    next_better: next_better,
    dealer: dealer,
    completed: completed,
    payedOut: payedOut,
    hand_id: hand_id,
    community: community
}

const handCache = {}

function cacheHand() {
    let cache = {};
    for (const [key, value] of Object.entries(persistPerHand)) {
        let _value = get(value);
        if (typeof _value === 'object' && !Array.isArray(_value)){
            let inner = {};
            for (const [key2, value2] of Object.entries(_value)) {
                inner[key2] = get(value2);
            }
            cache[key] = inner;
        } else {
            cache[key] = _value;
        }
    }
    handCache[$hand_id] = cache;
}


function tryLoadHandFromHash(_hand_id) {
    if (handCache.hasOwnProperty(_hand_id)) {
        let cache = handCache[_hand_id];
        for (const [key, value] of Object.entries(persistPerHand)) {
            let _value = cache[key];
            if (typeof _value === 'object' && !Array.isArray(_value) && _value !== null){
                let inner = {};
                for (const [key2, value2] of Object.entries(_value)) {
                    inner[key2] = writable(value2);
                }
                value.set(inner);
            } else {
                value.set(_value);
            }
        }
        return true;
    }
    return false;
}

function displayHandById(_hand_id) {
    if ($hand_id !== null) {
        if ($hand_id !== _hand_id) {
            cacheHand();
        }        
    }
    tryLoadHandFromHash(_hand_id);
}

</script>


<h2>Hand State</h2>

<h3>Current Pot: {$pot}</h3>

{#if $myDecryptedHand.length > 0}
    <h3>My Hand: {formatHand($myDecryptedHand)}</h3>
{/if}

{#if $gameType === HOLDEM_POKER || $gameType === OMAHA_POKER}
    <Errors errors={revealOtpErrors} />
    <Errors errors={revealErrors} />
    <Container>
        {#if $isRevealed1}
        <h4>Flop: {formatHand($community[0])}</h4>
        {/if}
        {#if $isRevealed2}
        <h4>Flop: {formatHand($community[1])}</h4>
        {/if}
        {#if $isRevealed3}
        <h4>Flop: {formatHand($community[2])}</h4>
        {/if}
        {#if get($playerOtp1Stores[$lamden_vk]) === null}
            <Button
                text="Reveal Flop"
                clicked={revealOtp(1)}
                disabled={$revealOtpInProgress}
            />
        {:else}
            {#if $canReveal1 && !$isRevealed1}
                <Button
                    text="Decrypt Flop"
                    clicked={reveal(1)}
                    disabled={$revealInProgress}
                />
            {:else}
                {#if get($playerOtp2Stores[$lamden_vk]) === null}
                    <Button
                        text="Reveal Turn"
                        clicked={revealOtp(2)}
                        disabled={$revealOtpInProgress}
                    />
                {:else}
                    {#if $canReveal2 && !$isRevealed2}
                        <Button
                            text="Decrypt Turn"
                            clicked={reveal(2)}
                            disabled={$revealInProgress}
                        />
                    {:else}                        
                        {#if get($playerOtp3Stores[$lamden_vk]) === null}
                            <Button
                                text="Reveal River"
                                clicked={revealOtp(3)}
                                disabled={$revealOtpInProgress}
                            />
                        {:else}
                            {#if $canReveal3 && !$isRevealed3}
                                <Button
                                    text="Decrypt River"
                                    clicked={reveal(3)}
                                    disabled={$revealInProgress}
                                />
                            {/if}
                        {/if}
                    {/if}
                {/if}
            {/if}
        {/if}
    </Container>
{/if}

{#if $hand_id === null || $payedOut === true}
    <Errors errors={startHandErrors} />
    <Button
        text={$startHandInProgress ? "Starting..." : "Start Hand"}
        clicked={startHand}
        disabled={$startHandInProgress}
    />

{:else if $completed === true}

    Hand Completed        

    {#if $payoutTime}

        <Errors errors={payoutHandErrors} />
        <Button
            text={$payoutHandInProgress ? "Paying..." : "Payout Hand"}
            clicked={payoutHand}
            disabled={$payoutHandInProgress}
        />

    {:else if $activePlayers.includes($lamden_vk) && !$folded.includes($lamden_vk)}

        {#if $activePlayers.length - $folded.length == 1}

            Everyone else has folded. <br /> No need to verify your hand.

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

    Hand hasn't been dealt yet.

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
            <Link onClick={()=>showUserPage.set(player)}>
                {getValueFromDict($playerNamesStores, player, "Loading...")}                        
            </Link>                    
            {$dealer.length > 0 && $dealer===player ? "(D)" : ""}
            {$next_better.length > 0 && $next_better===player ? "(*)" : ""}
        </td>
        <td>
            {getValueFromDict($playerChipsStores, player, "Loading...")}
        </td>
        <td>
            {getValueFromDict($playerBetStores, player, "Loading...")}
        </td>
        <td>
            {getValueFromDict($playerHandStores, player, "Loading...")===null?"(private)":getValueFromDict($playerHandStores, player, "Loading...")}
        </td>
    </tr>
    {/each}
</tbody>
</table>