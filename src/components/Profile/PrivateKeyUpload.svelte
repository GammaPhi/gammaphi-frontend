<script>
import { writable } from "svelte/store";

import { storePemFileInBrowser } from "../../js/rsa-utils";
import { lamden_vk } from "../../stores/lamdenStores";
import { privateKeyErrors, storedPemFile } from "../../stores/profileStore";
import Button from "../Button.svelte";
import Errors from "../Games/Poker/Errors.svelte";
import Container from "../Inputs/Container.svelte";


const privateKeyInput = writable('');

const updatePrivateKey = () => {
    storePemFileInBrowser($lamden_vk, $privateKeyInput);
    storedPemFile.set($privateKeyInput)
};
</script>

<Container>
    <Errors errors={privateKeyErrors} />
    <br />
    <p>
        Unable to find private key. Please reupload it here.
    </p>
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
</Container>
