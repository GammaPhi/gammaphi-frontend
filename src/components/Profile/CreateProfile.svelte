<script>
import { derived, writable } from 'svelte/store'
import { 
    generatePrivateKey,
    privateKeyToPem,
    getNandE,
    storePemFileInBrowser
} from '../../js/rsa-utils';
import { 
    username, 
    display_name,
    icon_base64,
    icon_url,
    frens
} from '../../stores/profileStore'
import { lamden_vk } from '../../stores/lamdenStores';
import { 
    sendCreateProfile, 
    sendUpdateProfile, 
    hydrateProfile,
    sendProfileAddFrens,
    sendProfileRemoveFrens
} from '../../js/lamden-utils'
import Input from '../Inputs/Input.svelte';
import Button from '../Button.svelte';
import Container from '../Inputs/Container.svelte';
import { onMount } from 'svelte';

const creating = writable(false);
const avatarErrors = writable([]);
const usernameErrors = writable([]);
const errors = writable([]);
const usernameValue = writable('');
const downloaded = writable(false);
const privateKeyPem = writable('');
const public_rsa_key = writable('');
const createProfileResultsTracker = writable({});

const createProfileEnabled = derived([downloaded, usernameValue, display_name, usernameErrors, creating],
    ([$downloaded, $usernameValue, $display_name, $usernameErrors, $creating]) => {
        return !$creating && $downloaded && $usernameValue.length > 0 && $display_name.length > 0 && $usernameErrors.length === 0;
    }
)

let  avatar, fileinput;

onMount(()=>{
    usernameValue.set($username);
    generatePrivateKey((key)=>{
        let pem = privateKeyToPem(key);
        privateKeyPem.set(pem);
        let pub = getNandE(key);
        public_rsa_key.set(pub[0]+"|"+pub[1]);
    })
});


const saveProfile = async () => {
    errors.set([]);
    creating.set(true);
    sendCreateProfile(
        {
            username: $usernameValue,
            display_name: $display_name,
            icon_base64: $icon_base64.length === 0 ? null : $icon_base64,
            public_rsa_key: $public_rsa_key
        },
        createProfileResultsTracker,
        (txResults) => {
            creating.set(false);
            if ($createProfileResultsTracker.errors?.length > 0) {
                errors.set($createProfileResultsTracker.errors)
            } else {
                username.set($usernameValue);
                storePemFileInBrowser($lamden_vk, $privateKeyPem);
            }
        }
    )
};


const downloadPrivateKey = () => {
    const url = window.URL.createObjectURL(new Blob([$privateKeyPem]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `gamma-phi-keys-${Math.floor(Date.now() / 1000)}.pem`);
    document.body.appendChild(link);
    link.click();
    downloaded.set(true);
}
    
const onFileSelected =(e)=>{
    avatarErrors.set([]);
    let image = e.target.files[0];
    console.log('image:');
    console.log(image);
    let reader = new FileReader();
    reader.readAsDataURL(image);
    reader.onload = e => {
        let r = e.target.result;
        if (r.startsWith("data:image/svg+xml;base64")
            || r.startsWith("data:image/png;base64")
            || r.startsWith("data:image/jpeg;base64")
        ) {
            avatar = r;
            icon_base64.set(r.trim());
            icon_url.set('');
        } else {
            avatarErrors.set(["Avatar must be a .png, .svg, .jpg, or .jpeg file."])
        }
        console.log('avatar:');
        console.log(r);
    };
}

function isAlphaNumeric(str) {
    var code, i, len;

    for (i = 0, len = str.length; i < len; i++) {
    code = str.charCodeAt(i);
    if (!(code > 47 && code < 58) && // numeric (0-9)
        !(code > 64 && code < 91) && // upper alpha (A-Z)
        !(code > 96 && code < 123)) { // lower alpha (a-z)
        return false;
    }
    }
    return true;
};

const validateAndSetUsername = (n) => {
    if (n.length > 16) {
        usernameErrors.set(['Usernames cannot be longer than 16 characters.'])
    } else {
        if (!isAlphaNumeric(n)) {
            usernameErrors.set(['Username must only contain alphanumeric characters.'])
        } else {
            usernameErrors.set([]);
        }
    }
    usernameValue.set(n);
};

</script>

<style>
    .buttons{
        margin: 2rem auto 1rem;
    }
    .username-error{
        margin: 0.5rem auto 0.5rem;
    }
    .upload{
        cursor:pointer;
    }
    .avatar{
        height:100px;
        width:100px;
        border-radius: 50%
    }
    p {
        max-width: 400px;
        margin-left: auto;
        margin-right: auto;
    }
</style>

<h2>
    Create your Profile
</h2>

<Container>
    <Input
        label="Username"
        autoComplete="username"
        value={$usernameValue}
        onClick={validateAndSetUsername}
    />
    {#if $usernameErrors !== null}
        {#each $usernameErrors as error}
            <div class="username-error error">
                {error}
            </div>
        {/each}
    {/if}
</Container>
<br />
<Container>
    <Input
        label="Display Name"
        autoComplete="name"
        value={$display_name}
        onClick={display_name.set}
    />
</Container>

<br />
<Container>
    {#if avatar}
    <img class="avatar upload" src="{avatar}" alt="d" on:click={()=>{fileinput.click();}} />
    {:else}
    <img class="avatar upload" src="https://cdn4.iconfinder.com/data/icons/small-n-flat/24/user-alt-512.png" alt="" on:click={()=>{fileinput.click();}} /> 
    {/if}
    <div class="upload" on:click={()=>{fileinput.click();}}>Upload an Avatar</div>
    <input style="display:none" type="file" accept=".jpg, .jpeg, .svg, .png" on:change={(e)=>onFileSelected(e)} bind:this={fileinput} >
    {#if $avatarErrors !== null}
        {#each $avatarErrors as error}
            <div class="username-error error">
                {error}
            </div>
        {/each}
    {/if}
</Container>
<br />
<Container>
    <p>
        Download your personal private gaming keys. 
        These keys are used to decrypt your private gaming data stored on the blockchain. 
        Without these keys, you will not be able to decrypt your private game data (eg. your poker hand during gameplay). 
        Do not lose these keys.
    </p>
    <Button 
        text="Download (required)"
        clicked={()=>{downloadPrivateKey();}}
    />
</Container>
<br />
{#if $errors !== null}
{#each $errors as error}
    <div class="username-error error">
        {error}
    </div>
{/each}
{/if}
<br />
<Button 
    text={$creating ? "Creating..." : "Create Profile"}
    clicked={saveProfile}
    disabled={!$createProfileEnabled}
/>