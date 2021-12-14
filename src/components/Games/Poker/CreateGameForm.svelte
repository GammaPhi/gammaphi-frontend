<script>
import { writable } from "svelte/store";
import Button from "../../Button.svelte";
import { sendPokerTransaction } from "../../../js/lamden-utils";
import Container from "../../Inputs/Container.svelte";
import Input from "../../Inputs/Input.svelte";
import Errors from "./Errors.svelte";

export let selectedGame;


const isPublic = writable(false);
const name = writable('')
const creating = writable(false);
const createGameHandler = writable({});
const createGameErrors = writable([]);

const createGame = async () => {
    creating.set(true);
    createGameErrors.set([]);
    let kwargs = {
        name: $name,
        other_players: [],
        ante: {
            __fixed__: '1'
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
        }
    });
}

</script>

<Container>
    <h3>Create a Game</h3>
    <Input onClick={name.set} value={$name} label="Name" />
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
</Container>