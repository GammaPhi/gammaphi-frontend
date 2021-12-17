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


export let selectedGame;


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
        ante: {
            __fixed__: BN($ante).toString()
        },
        other_players: [],
        game_type: $game_type,
        bet_type: $bet_type,
        n_cards_total: $n_cards_total,
        n_hole_cards: $n_hole_cards,
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
        }
    });
}

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
        <label>
            <input 
            type="radio"
            name="game_type"
            checked={$game_type === 3}
            on:click={()=>game_type.set(3)}
            />
            Texas Hold'em
        </label>
        <label>
            <input 
            type="radio"
            name="game_type"
            checked={$game_type === 4}
            on:click={()=>game_type.set(4)}
            />
            Omaha
        </label>
        <label>
            <input 
            type="radio"
            name="game_type"
            checked={$game_type === 2}
            on:click={()=>game_type.set(2)}
            />
            Stud
        </label>
        <label>
            <input 
            type="radio"
            name="game_type"
            checked={$game_type === 0}
            on:click={()=>game_type.set(0)}
            />
            One Card
        </label>
        <label>
            <input 
            type="radio"
            name="game_type"
            checked={$game_type === 1}
            on:click={()=>game_type.set(1)}
            />
            Blind Man
        </label>
        <br /><br />
        {#if $game_type === 2}
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
        <label>
            <input 
            type="radio"
            name="bet_type"
            checked={$bet_type === 0}
            on:click={()=>bet_type.set(0)}
            />
            No Limit
        </label>
        <label>
            <input 
            type="radio"
            name="bet_type"
            checked={$bet_type === 1}
            on:click={()=>bet_type.set(1)}
            />
            Pot Limit
        </label>
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