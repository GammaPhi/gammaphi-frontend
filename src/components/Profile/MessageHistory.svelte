<script>
import { onMount } from "svelte";
import { derived, writable } from "svelte/store";
import { checkMessageContractState } from "../../js/lamden-utils";
import BN from 'bignumber.js';
import { autoRefreshingVariable } from "../../js/global-utils";
import { empty } from "svelte/internal";
import { decrypt, loadPrivateKeyFromPem, retrievePemFileFromBrowser } from "../../js/rsa-utils";
import { lamden_vk } from "../../stores/lamdenStores";
import Link from "../Link.svelte";

export let you, me;

const MAX_HISTORY = 10;

const messagesFrom = writable([]);
const messagesTo = writable([]);
const hasFocus = writable(false);
const privateKey = writable(null);

const messages = derived([messagesFrom, messagesTo], ([$messagesFrom, $messagesTo]) => {
    let array = $messagesFrom.concat($messagesTo);
    array.sort(function(a, b) {
        return b.timestamp.getTime() - a.timestamp.getTime();
    })
    return array;
});

const numMessagesFrom = writable(0);
const numMessagesTo = writable(0);

const formatTimestamp = (date) => {
    console.log("Date: ");
    date = date.__time__
    console.log(date);
    date = new Date(date[0], date[1]-1, date[2], date[3], date[4], date[5]);
    return new Date(date.getTime() - date.getTimezoneOffset()*60*1000)
};

const isHex = (content) => {
    let re = /[0-9A-Fa-f]{6}/g;
    let s = false;
    if(re.test(content)) {
        s = true;
    }
    re.lastIndex = 0; // be sure to reset the index after using .text()
    return s;
}

const formatContent = (content) => {
    if ($privateKey !== null) {
        try {
            content = decrypt(content, $privateKey);
        } catch(e) {
            console.log(e);
        }
    }
    if (content.length > 50 && isHex(content)) {
        content = "[ENCRYPTED]";
    }
    return content;
}

async function updateMeToYou() {
    let c = await checkMessageContractState("messages_hash", [me, you, 'counter'])
    if (c === null || c === undefined) return null;
    c = parseInt(c.toString(), 10);
    let c_prev = $numMessagesFrom;
    if (c_prev === c) {
        return c;
    }
    let h = (c - c_prev);
    if (h <= 0) return c;
    for (let i = 0; i < h; i++) {
        let r = c - i;
        if (r > 0) {
            let message = {
                to: you,
                content: formatContent(await checkMessageContractState("messages_hash", [me, you, r, 'message'])),
                timestamp: formatTimestamp(await checkMessageContractState("messages_hash", [me, you, r, 'timestamp'])),
            };
            console.log(message);
            let array = $messagesFrom;
            array.push(message);
            messagesFrom.set(array);
        }
    }
    return c;
}

async function updateYouToMe() {
    let c = await checkMessageContractState("messages_hash", [you, me, 'counter'])
    if (c === null || c === undefined) return;
    c = parseInt(c.toString(), 10);
    let c_prev = $numMessagesTo;
    if (c_prev === c) {
        return c;
    }
    let h = (c - c_prev);
    if (h <= 0) return c;
    for (let i = 0; i < h; i++) {
        let r = c - i;
        if (r > 0) {
            let message = {
                to: me,
                content: formatContent(await checkMessageContractState("messages_hash", [you, me, r, 'message'])),
                timestamp: formatTimestamp(await checkMessageContractState("messages_hash", [you, me, r, 'timestamp'])),
            };
            console.log(message);
            let array = $messagesTo;
            array.push(message);
            messagesTo.set(array);
        }
    }
    return c;
}

autoRefreshingVariable(
    numMessagesFrom,
    updateMeToYou,
    hasFocus,
    null,
    null,
    10000
);

autoRefreshingVariable(
    numMessagesTo,
    updateYouToMe,
    hasFocus,
    null,
    null,
    10000
);

onMount(()=>{
    hasFocus.set(true);
    let pem = retrievePemFileFromBrowser($lamden_vk);
    if (pem !== null) {
        privateKey.set(loadPrivateKeyFromPem(pem));
    }
    return () => {
        hasFocus.set(false);
    }
});

</script>

<style>
    .container {
        width: 90%;
        margin: auto;

    }

    .left {
        text-align: left;
        overflow-wrap: anywhere;
        padding-right: 10%;
    }

    .right {
        text-align: right;
        overflow-wrap: anywhere;
        padding-left: 10%;
    }

    .timestamp {
        color: var(--font-primary-dim);
        font-size: 13px;
    }
</style>

<div class="container">
    {#if $privateKey === null} 
        <p>
            No private key found. Please upload your private key to view your encrypted messages.
        </p>
        <br />
    {/if}
    {#each $messages as message}
        {#if message['to'] === me}
            <div class="left">
                <span class="timestamp">
                    {message['timestamp'].toString().slice(0, 24).replace(/-/g, "/").replace("T", " ")}
                </span>
                <br />
                {message["content"]}                
            </div>
        {:else}
            <div class="right">
                <span class="timestamp">
                    {message['timestamp'].toString().slice(0, 24).replace(/-/g, "/").replace("T", " ")}
                </span>
                <br />
                {message["content"]}                
            </div>
        {/if}
        <br /><br />
    {/each}
</div>