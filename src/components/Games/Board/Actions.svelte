<script>
import { derived, writable } from "svelte/store";
import BN from 'bignumber.js';

import { payUpHelper, joinHelper, requestEndHelper, nextRoundHelper, playAgainHelper, forfeitRoundHelper, sendApprovalHelper, earlyEndHelper } from "../../../js/board-utils";
import { lamden_vk } from "../../../stores/lamdenStores";
import Errors from "../Poker/Errors.svelte";
import Button from "../../Button.svelte";

export let game_id, game_type, game_metadata, game_state, makeMoveFunc, disableMakeMove;


const roundCompleted = derived([game_state], ([$game_state]) => {
    return $game_state !== null && ($game_state.hasOwnProperty('winner') || (
        $game_state.hasOwnProperty('stalemate') && $game_state['stalemate']));
});

const gameCompleted = derived([game_state], ([$game_state]) => {
    return $game_state !== null && $game_state.hasOwnProperty('completed') && $game_state['completed'];
});

const creatorPaid = derived([game_state], ([$game_state]) => {
    return $game_state !== null && $game_state.hasOwnProperty('creator_paid') && $game_state['creator_paid'];
});

const opponentPaid = derived([game_state], ([$game_state]) => {
    return $game_state !== null && $game_state.hasOwnProperty('opponent_paid') && $game_state['opponent_paid'];
});

const currentPlayer = derived([game_state], ([$game_state]) => {
    return $game_state?.current_player || null;
});

const winner = derived([game_state], ([$game_state]) => {
    return $game_state?.winner || null;
});

const stalemate = derived([game_state], ([$game_state]) => {
    return $game_state?.stalemate || false;
});

const creatorWins = derived([game_state], ([$game_state]) => {
    return $game_state?.creator_wins || 0;
});

const opponentWins = derived([game_state], ([$game_state]) => {
    return $game_state?.opponent_wins || 0;
});

const creatorTeam = derived([game_state], ([$game_state]) => {
    return $game_state?.creator_team || null;
});

const opponentTeam = derived([game_state], ([$game_state]) => {
    return $game_state?.opponent_team || null;
});

const isCreator = derived([game_metadata], ([$game_metadata]) => {
    return $game_metadata?.creator === $lamden_vk;
});

const wager = derived([game_metadata], ([$game_metadata]) => {
    return BN($game_metadata?.wager || '0');
});

const isMyMove = derived([isCreator, creatorTeam, opponentTeam, currentPlayer],
    ([$isCreator, $creatorTeam, $opponentTeam, $currentPlayer]) => {
        if ($isCreator && $creatorTeam === $currentPlayer) {
            return true;
        } else if (!$isCreator && $opponentTeam === $currentPlayer) {
            return true;
        }
        return false;
    }
);

const isWaitingOnMove = derived([isCreator, creatorTeam, opponentTeam, currentPlayer],
    ([$isCreator, $creatorTeam, $opponentTeam, $currentPlayer]) => {
        if ($isCreator && $opponentTeam === $currentPlayer) {
            return true;
        } else if (!$isCreator && $creatorTeam === $currentPlayer) {
            return true;
        }
        return false;
    }
);

const iNeedToPay = derived([wager, isCreator, creatorPaid, opponentPaid], 
    ([$wager, $isCreator, $creatorPaid, $opponentPaid]) => {
        if ($wager === null || $wager.comparedTo(BN(0) !== 1)) {
            return false; // no wager
        }
        if ($isCreator && !$creatorPaid) {
            return true;
        } else if (!$isCreator && !$opponentPaid) {
            return true;
        }
        return false;
    }
);



const payUpHandler = writable({});
const payUpErrors = writable([]);
const payUpInProgress = writable(false);
const payUp = async () => {
    if ($wager !== null && $wager.comparedTo(BN(0)) === 1) {
        // need to send PHI approval
        sendApprovalHelper($wager, payUpHandler, payUpErrors, payUpInProgress,
            () => payUpHelper(game_id, game_type, payUpHandler, payUpErrors, payUpInProgress)
        )
    } else {
        payUpHelper(game_id, game_type, payUpHandler, payUpErrors, payUpInProgress)
    }
}

const joinHandler = writable({});
const joinErrors = writable([]);
const joinInProgress = writable(false);
const join = async () => {
    if ($wager !== null && $wager.comparedTo(BN(0)) === 1) {
        // need to send PHI approval
        sendApprovalHelper($wager, joinHandler, joinErrors, joinInProgress,
            () => joinHelper(game_id, game_type, joinHandler, joinErrors, joinInProgress)
        )
    } else {
        joinHelper(game_id, game_type, joinHandler, joinErrors, joinInProgress)
    }
}

const requestEndHandler = writable({});
const requestEndErrors = writable([]);
const requestEndInProgress = writable(false);
const requestEnd = async () => {
    requestEndHelper(game_id, game_type, requestEndHandler, requestEndErrors, requestEndInProgress)
}

const acceptEndHandler = writable({});
const acceptEndErrors = writable([]);
const acceptEndInProgress = writable(false);
const acceptEndHelper = async () => {
    acceptEndHelper(game_id, game_type, acceptEndHandler, acceptEndErrors, acceptEndInProgress)
}

const nextRoundHandler = writable({});
const nextRoundErrors = writable([]);
const nextRoundInProgress = writable(false);
const nextRound = async () => {
    nextRoundHelper(game_id, game_type, nextRoundHandler, nextRoundErrors, nextRoundInProgress)
}

const playAgainHandler = writable({});
const playAgainErrors = writable([]);
const playAgainInProgress = writable(false);
const playAgain = async () => {
    if ($wager !== null && $wager.comparedTo(BN(0)) === 1) {
        // need to send PHI approval
        sendApprovalHelper($wager, playAgainHandler, playAgainErrors, playAgainInProgress,
            () => playAgainHelper(game_id, game_type, playAgainHandler, playAgainErrors, playAgainInProgress)
        )
    } else {
        playAgainHelper(game_id, game_type, playAgainHandler, playAgainErrors, playAgainInProgress)
    }
}

const forfeitRoundHandler = writable({});
const forfeitRoundErrors = writable([]);
const forfeitRoundInProgress = writable(false);
const forfeitRound = async () => {
    forfeitRoundHelper(game_id, game_type, forfeitRoundHandler, forfeitRoundErrors, forfeitRoundInProgress)
}

const earlyEndHandler = writable({});
const earlyEndErrors = writable([]);
const earlyEndInProgress = writable(false);
const earlyEnd = async () => {
    earlyEndHelper(game_id, game_type, earlyEndHandler, earlyEndErrors, earlyEndInProgress)
}

const makeMoveHandler = writable({});
const makeMoveErrors = writable([]);
const makeMoveInProgress = writable(false);
const makeMove = async () => {
    await makeMoveFunc(makeMoveHandler, makeMoveErrors, makeMoveInProgress);
}
</script>


{#if $iNeedToPay}
    <Errors errors={payUpErrors} />
    <Button
        disabled={$payUpInProgress}
        text={$payUpInProgress ? "Paying..." : "Pay Wager"}
        clicked={payUp}
    />
{:else}
    {#if $gameCompleted}
        <Errors errors={playAgainErrors} />
        <Button
            disabled={$playAgainInProgress}
            text={$playAgainInProgress ? "Starting..." : "Play Again"}
            clicked={playAgain}
        />
    {:else}
        {#if $roundCompleted}
            {#if $stalemate}
            <p>Round ended in a draw.</p>
            {:else}
            <p>Winner: {$winner}</p>
            {/if}
            <Errors errors={nextRoundErrors} />
            <Button
                disabled={$nextRoundInProgress}
                text={$nextRoundInProgress ? "Starting..." : "Next Round"}
                clicked={nextRound}
            />
        {:else}
            {#if $isMyMove}
                <Errors errors={makeMoveErrors} />
                <Button
                    disabled={$disableMakeMove || $makeMoveInProgress}
                    text={$makeMoveInProgress ? "Moving..." : "Move"}
                    clicked={makeMove}
                />
            {:else if $isWaitingOnMove}
                <p>Waiting on your opponent...</p>
            {/if}
        {/if}
    {/if}
{/if}