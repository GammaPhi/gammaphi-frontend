<script>
import { writable } from "svelte/store";
import Button from "../../Button.svelte";
import { sendPokerTransaction } from "../../../js/lamden-utils";
import Container from "../../Inputs/Container.svelte";
import Input from "../../Inputs/Input.svelte";
import Errors from "./Errors.svelte";
import BnInputField from "../../Inputs/BNInputField.svelte";
import BN from 'bignumber.js'
import Link from "../../Link.svelte";
import { BLIND_POKER, gameTypeHumanReadable, betTypeHumanReadable, HOLDEM_POKER, NO_LIMIT, OMAHA_POKER, ONE_CARD_POKER, POT_LIMIT, STUD_POKER } from "../../../js/poker-utils";


export let selectedGame, selectedGameName;

const isPublic = writable(false);
const name = writable('');
const game_type = writable(3);
const bet_type = writable(0);
const n_cards_total = writable(5);
const n_hole_cards = writable(1);
const creating = writable(false);
const ante = writable(new BN('1'));
const createGameHandler = writable({});
const createGameErrors = writable([]);
const showForm = writable(false);

const createGame = async () => {
    creating.set(true);
    createGameErrors.set([]);
    let kwargs = {
        name: $name,
        other_players: [],
        game_config: {
            game_type: $game_type,
            bet_type: $bet_type,
            n_cards_total: $n_cards_total,
            n_hole_cards: $n_hole_cards,
            ante: {
                __fixed__: BN($ante).toString()
            }
        },
        public: $isPublic
    }
    sendPokerTransaction('start_game', kwargs, createGameHandler, (txResults)=>{
        creating.set(false);
        if ($createGameHandler.errors?.length > 0) {
            createGameErrors.set($createGameHandler.errors)
        } else {
            console.log("Success");
            console.log(txResults);
            selectedGame.set(txResults.resultInfo.returnResult.replace("'","").replace("'", ""));
            selectedGameName.set($name);
        }
    });
}

const gameTypes = [HOLDEM_POKER, OMAHA_POKER, STUD_POKER, ONE_CARD_POKER, BLIND_POKER];
const betTypes = [NO_LIMIT, POT_LIMIT];

</script>

<Container>
    <Link onClick={()=>showForm.set(!$showForm)}>
        Create a Game
    </Link>
    <br /><br />
    {#if $showForm}
        <Input onClick={name.set} value={$name} label="Name" />
        <br /><br />
        <p>Game Type</p>
        {#each gameTypes as type}
            <label>
                <input 
                type="radio"
                name="game_type"
                checked={$game_type === type}
                on:click={()=>game_type.set(type)}
                />
                {gameTypeHumanReadable(type)}
            </label>
        {/each}       
        <br /><br />
        {#if $game_type === STUD_POKER}
            <p>Number of Cards per Hand</p>
            <label>
                <input 
                type="radio"
                name="n_cards_total"
                checked={$n_cards_total === 5}
                on:click={()=>n_cards_total.set(5)}
                />
                5 Cards
            </label>
            <label>
                <input 
                type="radio"
                name="n_cards_total"
                checked={$n_cards_total === 7}
                on:click={()=>n_cards_total.set(7)}
                />
                7 Cards
            </label>
            <br /><br />
            <p>Number of Hole Cards</p>
            <label>
                <input 
                type="radio"
                name="n_hole_cards"
                checked={$n_hole_cards === 1}
                on:click={()=>n_hole_cards.set(1)}
                />
                1 Cards
            </label>
            <label>
                <input 
                type="radio"
                name="n_hole_cards"
                checked={$n_hole_cards === 3}
                on:click={()=>n_hole_cards.set(3)}
                />
                3 Cards
            </label>
            <label>
                <input 
                type="radio"
                name="n_hole_cards"
                checked={$n_hole_cards === 5}
                on:click={()=>n_hole_cards.set(5)}
                />
                5 Cards
            </label>
            {#if $n_cards_total === 7}
                <label>
                    <input 
                    type="radio"
                    name="n_hole_cards"
                    checked={$n_hole_cards === 7}
                    on:click={()=>n_hole_cards.set(7)}
                    />
                    7 Cards
                </label>
            {/if}
            <br /><br />
        {/if}
        <p>Betting Type</p>
        {#each betTypes as type}
            <label>
                <input 
                type="radio"
                name="bet_type"
                checked={$bet_type === type}
                on:click={()=>bet_type.set(type)}
                />
                {betTypeHumanReadable(type)}
            </label>
        {/each}       
        <br /><br />
        <BnInputField
            onInputChange={(value)=>ante.set(value)}
            startingValue={$ante}
            inputClass="primaryInput"
            labelClass="label"
            labelText="Ante"
        />        
        <br /><br />
        <label>Make Public
            <input 
                type="checkbox"
                checked={$isPublic}
                on:change={(e) => isPublic.set(e.target.checked)}
            />
        </label>    
        <Errors errors={createGameErrors} />
        <Button
            text={$creating ? "Creating..." : "Create"}
            disabled={$name.length === 0 || $creating}
            clicked={createGame}
        />
    {/if}
</Container>