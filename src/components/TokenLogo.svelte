<script>
    import { createEventDispatcher } from 'svelte'

    // Logos
    import Token_TAU from './Tokens/Token_TAU.svelte'

    export let token = null;
    export let clickable = true;
    export let size = null;
    export let margin = true

    $: hashTokenInfo = token !== null

    const dispatchEvent = createEventDispatcher();

    const TokenMap = {
        TAU: Token_TAU,
        DTAU: Token_TAU,
        dTAU: Token_TAU
    }

    function handleClick(){
        if (!clickable) return
        dispatchEvent('selected', token)
    }

</script>

<style>
    .container{
        width: 60px;
        height: 60px;
        border: 1px solid var(--accent-color);
        background: var(--accent-color);
        border-radius: 999px;
        margin: 0 10px 0 0;
    }
    .container.tiny{
        width: 30px;
        height: 30px;
    }
    .filled{
        background: var(--color-white);
    }
    .logo{
        min-width: initial;
        width: 30px;
    }
    .logo.tiny{
        min-width: initial;
        width: 16px;
    }
    .no-margin{
        margin: 0;
    }
    @media screen and (min-width: 430px) {

    }
</style>

<div class="flex align-center just-center container" class:no-margin={!margin} class:filled={hashTokenInfo} on:click={handleClick} class:tiny={size === "tiny"}>
    {#if hashTokenInfo}
        <div class="flex align-center just-center logo" class:tiny={size === "tiny"}>
            <svelte:component this={TokenMap[token.symbol]} />
        </div>
    {/if}
</div>


