<script>
import { derived, writable } from 'svelte/store'
import { 
	generatePrivateKey,
	privateKeyToPem,
	getNandE,
	storePemFileInBrowser
} from '../js/rsa-utils';
import { 
	username, 
	display_name,
	icon_base64_svg,
	icon_base64_png,
	icon_base64_jpg,
	icon_url,
	frens
} from '../stores/profileStore'

import { 
	sendCreateProfile, 
	sendUpdateProfile, 
	hydrateProfile,
	sendProfileAddFrens,
	sendProfileRemoveFrens
} from '../js/lamden-utils'
import Input from '../components/Inputs/Input.svelte';
import Button from '../components/Button.svelte';
import Container from '../components/Inputs/Container.svelte';
import { onMount } from 'svelte';

const editMode = writable(false);
const avatarErrors = writable([]);
const usernameErrors = writable([]);
const errors = writable([]);
const usernameValue = writable('');
const downloaded = writable(false);
const privateKeyPem = writable('');
const public_rsa_key = writable('');
const createProfileResultsTracker = writable({});

const createProfileEnabled = derived([downloaded, usernameValue, display_name, usernameErrors],
	([$downloaded, $usernameValue, $display_name, $usernameErrors]) => {
		return $downloaded && $usernameValue.length > 0 && $display_name.length > 0 && $usernameErrors.length === 0;
	}
)

let  avatar, fileinput;

onMount(()=>{
	usernameValue.set($username);
	generatePrivateKey((key)=>{
		let pem = privateKeyToPem(key);
		privateKeyPem.set(pem);
		storePemFileInBrowser(pem);
		let pub = getNandE(key);
		public_rsa_key.set(pub[0]+"|"+pub[1]);
	})
});


const saveProfile = async () => {
	await sendCreateProfile(
		{
			username: $usernameValue,
			display_name: $display_name,
			icon_base64_svg: $icon_base64_svg.length === 0 ? null : $icon_base64_svg,
			icon_base64_png: $icon_base64_png.length === 0 ? null : $icon_base64_png,
			icon_base64_jpg: $icon_base64_jpg.length === 0 ? null : $icon_base64_jpg,
			public_rsa_key: $public_rsa_key
		},
		createProfileResultsTracker,
		(txResults) => {
			if ($createProfileResultsTracker.errors?.length > 0) {
				errors.set($createProfileResultsTracker.errors)
			} else {
				username.set($usernameValue);
			}
		}
	)
};


const downloadPrivateKey = () => {
    const url = window.URL.createObjectURL(new Blob([$privateKeyPem]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'gamma-phi-private-key.pem');
    document.body.appendChild(link);
    link.click();
	downloaded.set(true);
}
	
const onFileSelected =(e)=>{
	let image = e.target.files[0];
	console.log('image:');
	console.log(image);
	let reader = new FileReader();
	reader.readAsDataURL(image);
	reader.onload = e => {
		let r = e.target.result;
		if (r.startsWith("data:image/svg+xml;base64,")) {
			avatar = r;
			icon_base64_png.set('');
			icon_base64_svg.set(r.replace("data:image/svg+xml;base64,", "").trim());
			icon_base64_jpg.set('');
			icon_url.set('');
		} else if (r.startsWith("data:image/png;base64,")) {
			icon_base64_svg.set('');
			icon_base64_png.set(r.replace("data:image/png;base64,", "").trim());
			icon_base64_jpg.set('');
			icon_url.set('');
			avatar = r;
		} else if (r.startsWith("data:image/jpeg;base64,")) {
			icon_base64_svg.set('');
			icon_base64_png.set('');
			icon_base64_jpg.set(r.replace("data:image/jpeg;base64,", "").trim());
			icon_url.set('');
			avatar = r;
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
</style>

<div align="middle" class="buttons">
{#if $username.length === 0}
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
<Button 
	text="Create Profile"
	clicked={saveProfile}
	disabled={!$createProfileEnabled}
/>

{:else}
<h2>
	Welcome {$display_name}!
</h2>
<Container>
	{#if $icon_base64_png.length !== 0}
	<img class="avatar" src="data:image/png;base64,{$icon_base64_png}" alt="d" />
	{:else if $icon_base64_svg !== 0}
	<img class="avatar" src="data:image/svg+xml;base64,{$icon_base64_svg}" alt="d" />
	{:else if $icon_base64_jpg !== 0}
	<img class="avatar" src="data:image/jpeg;base64,{$icon_base64_svg}" alt="d" />
	{/if}
</Container>
{/if}
</div>