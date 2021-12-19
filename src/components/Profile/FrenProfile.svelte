<script>
import { writable } from "svelte/store";

import { sendMessageTo, sendPHI } from "../../js/lamden-utils";

import { publicKeyFromNE, encrypt } from "../../js/rsa-utils";
import Button from "../Button.svelte";
import Errors from "../Games/Poker/Errors.svelte";
import Container from "../Inputs/Container.svelte";
import Link from "../Link.svelte";
import BN from 'bignumber.js'
import { loadProfile } from '../../js/profile-utils';
import { onMount } from "svelte";
import Input from "../Inputs/Input.svelte";
import { lamden_vk } from "../../stores/lamdenStores";
import MessageHistory from "./MessageHistory.svelte";
import BnInputField from "../Inputs/BNInputField.svelte";

export let user_address, goBack = null, goBackText = null;

const username = writable('');
const display_name = writable('');
const icon_base64 = writable('');
const icon_url = writable('');
const public_rsa_key = writable(null);
const frens = writable([]);

const storeMap = {
	username: username,
	display_name: display_name,
	icon_base64: icon_base64,
	icon_url: icon_url,
	frens: frens,
	public_rsa_key: public_rsa_key,
};

onMount(()=>{
	loadProfile(user_address, storeMap);
});


const amount = writable(BN(0));
const message = writable('hello world');
const encrypted = writable(false);

const sendMessageHelperHandler = writable({});
const sendMessageHelperErrors = writable([]);
const sendMessageHelperInProgress = writable(false);
const sendMessageHelper = async () => {
    let m;
    if ($encrypted) {
        if ($public_rsa_key === null) {
            alert(`${username}'s key has not been loaded yet or is not setup.`)
            return;
        }        
        m = encrypt($message, publicKeyFromNE($public_rsa_key.split("|")[0], $public_rsa_key.split("|")[1]));
    } else {
        m = $message;
    }
    sendMessageHelperInProgress.set(true);
    sendMessageHelperErrors.set([]);
    sendMessageTo(
        m,
        user_address,
        sendMessageHelperHandler, (txResults) => {
            sendMessageHelperInProgress.set(false);
            if ($sendMessageHelperHandler.errors?.length > 0) {
                sendMessageHelperErrors.set($sendMessageHelperHandler.errors)
            } else {
                console.log("Success");
                console.log(txResults);
            }
        }
    )
}

const sendPhiHelperHandler = writable({});
const sendPhiHelperErrors = writable([]);
const sendPhiHelperInProgress = writable(false);
const sendPhiHelper = async () => {
    sendPhiHelperInProgress.set(true);
    sendMessageHelperErrors.set([]);
    sendPHI(
        $amount,
        user_address,
        sendPhiHelperHandler, (txResults) => {
            sendPhiHelperInProgress.set(false);
            if ($sendPhiHelperHandler.errors?.length > 0) {
                sendPhiHelperErrors.set($sendPhiHelperHandler.errors)
            } else {
                console.log("Success");
                console.log(txResults);
            }
        }
    )
}

</script>

<style>
    .avatar{
        height:100px;
        width:100px;
        border-radius: 50%
    }
</style>

<Container>
    {#if goBack !== null && goBackText !== null}
        <Link onClick={()=>goBack()}>{goBackText}</Link>
        <br /> <br />
    {/if}
    <h2>{$username}</h2>
    <Container>
        {#if $icon_base64.length !== 0}
        <img class="avatar" src={$icon_base64} alt="d" />
        {/if}
    </Container>
    {#if $lamden_vk !== null && $lamden_vk.length > 0}
        <Container>
            <h3>
                Send PHI
            </h3>
            <BnInputField
                onInputChange={(value)=>amount.set(value)}
                startingValue={$amount}
                inputClass="primaryInput"
                labelClass="label"
                labelText="Amount"
            />  
            <br />
            <br />
            <Errors errors={sendPhiHelperErrors} />
            <Button
                text={$sendPhiHelperInProgress ? "Sending..." : "Send"}
                clicked={sendPhiHelper}
                disabled={$sendPhiHelperInProgress}
            />
        </Container>
        <Container>
            <h3>
                Messages
            </h3>
            <h4>
                Send Message
            </h4>
            <Input 
                value={$message}
                onClick={message.set}
                onEnterButton={sendMessageHelper}
                label="Message"
            />
            <br />
            {#if $public_rsa_key !== null}
                <br />
                <label>Encrypt
                    <input 
                        type="checkbox"
                        checked={$encrypted}
                        on:change={(e) => encrypted.set(e.target.checked)}
                    />
                </label>   
                <br />
            {/if}
            <br />
            <Errors errors={sendMessageHelperErrors} />
            <Button
                text={$sendMessageHelperInProgress ? "Sending..." : "Send"}
                clicked={sendMessageHelper}
                disabled={$sendMessageHelperInProgress}
            />
            <h4>
                Conversation
            </h4>
            <MessageHistory me={$lamden_vk} you={user_address}/>
        </Container>
    {/if}
</Container>
