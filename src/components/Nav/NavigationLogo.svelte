<script>
    import { onMount } from 'svelte';
    import { writable } from 'svelte/store';
    import { checkHousePHIBalance } from '../../js/lamden-utils';
    import Logo from '../SVG/TauSVG.svelte'
    import BN from 'bignumber.js'
    import { stringToFixed } from '../../js/global-utils'

    let housePHIBalance = writable(BN(0))
    onMount(async () => {
        housePHIBalance.set(await checkHousePHIBalance())
    })
</script>

<div class="flex row align-center container">
    <div class="flex align-center just-center nav-brand-logo">
        <Logo width="100%"/>
    </div>
    <p>House Balance: {`${stringToFixed($housePHIBalance, 2)}`} PHI</p>
</div>

<style>
    a, p{
        color: var(--color-gray-4);
        font-size: clamp(16px, 1.5vw, 45px);
        font-weight: 800;
    }
    .container:hover > a{
        color: var(--primary-color);
    }
    a:visited{
        color: var(--color-gray-3);
    }
    .nav-brand-logo {
        min-width: initial;
        color: var(--color-gray-4);
        width: 23px;
        margin-right: 10px;
    }

    @media screen and (min-width: 430px) {
        .nav-brand-logo {
            width: 35px;
        }
    }
    @media screen and (min-width: 2000px) {
        .nav-brand-logo {
            width: 55px;
        }
    }
</style>