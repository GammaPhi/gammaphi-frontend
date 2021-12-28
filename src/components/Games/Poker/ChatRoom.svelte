<script>
    import { onMount } from "svelte";
    import { derived, writable } from "svelte/store";
    import { checkMessageContractState, sendMessageTo } from "../../../js/lamden-utils";
    import BN from 'bignumber.js';
    import { autoRefreshingVariable, getValueFromDict } from "../../../js/global-utils";
    import { decrypt, loadPrivateKeyFromPem, retrievePemFileFromBrowser } from "../../../js/rsa-utils";
    import { lamden_vk } from "../../../stores/lamdenStores";
    import Link from "../../Link.svelte";
    import Input from "../../Inputs/Input.svelte";
    import Button from "../../Button.svelte";
    import Errors from "./Errors.svelte";
    import { hydrateProfile } from "../../../js/lamden-utils";
    import { decryptAes, encryptAes } from "../../../js/aes-utils";
        
    export let channelName, channelUsers, usersNames;
        
    const messagesUnsorted = writable([]);
    const hasFocus = writable(false);
    const privateKey = writable(null);
    const aesKey = writable(null);

    const messages = derived([messagesUnsorted], ([$messagesUnsorted]) => {
        let array = $messagesUnsorted;
        array.sort(function(a, b) {
            return b.timestamp.getTime() - a.timestamp.getTime();
        })
        return array;
    });
        
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
        if ($aesKey !== null) {
            try {
                content = decryptAes(content, $aesKey);
            } catch(e) {
                console.log(e);
            }
        }
        if (content.length > 50 && isHex(content)) {
            content = "[ENCRYPTED]";
        }
        return content;
    }
    
    async function updateMessages() {
        for(let u = 0; u < channelUsers.length; u++) {
            let user = channelUsers[u];
            checkMessageContractState("messages_hash", [user, channelName, 'counter']).then(c=>{
                if (c === null || c === undefined) {
                    return;
                }
                c = parseInt(c.toString(), 10);
                let c_prev = messageCounter[user] || 0;
                if (c_prev === c) {
                    return c;
                }
                let h = (c - c_prev);
                if (h <= 0) {
                    return c;
                }
                for (let i = 0; i < h; i++) {
                    let r = c - i;
                    if (r > 0) {
                        checkMessageContractState("messages_hash", [user, channelName, r, 'message']).then((content) => {
                            checkMessageContractState("messages_hash", [user, channelName, r, 'timestamp']).then((timestamp)=>{
                                let message = {
                                    from: user,
                                    content: formatContent(content),
                                    timestamp: formatTimestamp(timestamp),
                                };
                                console.log(message);
                                
                                allMessages.push(message);
                                messagesUnsorted.set(allMessages);
                            })
                        })
                    }
                }                    
                messageCounter[user] = c;
            })
        }
    }
    
    autoRefreshingVariable(
        null,
        updateMessages,
        hasFocus,
        null,
        null,
        5000
    );

    autoRefreshingVariable(
        aesKey,
        async () => {
            // get aes key
            let encryptedKey = await hydrateProfile(`keys:${channelName}`, null);
            if (encryptedKey !== null) {
                return decrypt(encryptedKey, _privateKey);
            }
            return null;
        },
        hasFocus,
        null,
        null,
        10000
    )
    

    var messageCounter = {};
    var allMessages = [];
    onMount(()=>{
        allMessages = [];
        messageCounter = {};
        hasFocus.set(true);
        let pem = retrievePemFileFromBrowser($lamden_vk);
        if (pem !== null) {
            let _privateKey = loadPrivateKeyFromPem(pem);
            privateKey.set(_privateKey);
        }
        return () => {
            allMessages = [];
            messageCounter = {};
            hasFocus.set(false);
        }
    });

    const message = writable('');
    const encrypted = writable(false);

    const sendMessageHelperHandler = writable({});
    const sendMessageHelperErrors = writable([]);
    const sendMessageHelperInProgress = writable(false);
    const sendMessageHelper = async () => {
        let m;
        if ($encrypted) {
            if ($aesKey === null) {
                alert(`${username}'s key has not been loaded yet or is not setup.`)
                return;
            }        
            m = encryptAes($message, $aesKey);
        } else {
            m = $message;
        }
        sendMessageHelperInProgress.set(true);
        sendMessageHelperErrors.set([]);
        sendMessageTo(
            m,
            channelName,
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
    
    <h4>
        Send Message
    </h4>
    <Input 
        clazz="message-input"
        value={$message}
        onClick={message.set}
        onEnterButton={sendMessageHelper}
        label="Message"
    />
    <br />
    {#if $aesKey !== null}
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

    <div class="container">
        {#if $privateKey === null} 
            <p>
                No private key found. Please upload your private key to view your encrypted messages.
            </p>
            <br />
        {/if}
        {#each $messages as message}
            {#if message['from'] === $lamden_vk}
                <div class="right">
                    <span class="timestamp">
                        You<br/>
                        {message['timestamp'].toString().slice(0, 24).replace(/-/g, "/").replace("T", " ")}
                    </span>
                    <br />
                    {message["content"]}                
                </div>
            {:else}
                <div class="left">
                    <span class="timestamp">
                        {getValueFromDict($usersNames, message['from'], message['from'])}
                        <br />
                        {message['timestamp'].toString().slice(0, 24).replace(/-/g, "/").replace("T", " ")}
                    </span>
                    <br />
                    {message["content"]}                
                </div>
            {/if}
            <br /><br />
        {/each}
    </div>