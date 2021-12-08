<script>
import BN from 'bignumber.js'
import { writable, derived, get } from "svelte/store";
import { sendRedeem, sendRedeemApproval } from '../js/lamden-utils';
import { phiCurrencyBalance, legacyPhiCurrencyBalance, lamdenCurrencyBalance, phiCurrencyApprovedBalance } from '../stores/lamdenStores';
import { stringToFixed } from '../js/global-utils'

const errors = writable(null);
const status = writable("ready");
const btnEnabled = derived([status, legacyPhiCurrencyBalance], 
    ([$status, $legacyPhiCurrencyBalance])=>{
        if (BN($legacyPhiCurrencyBalance).comparedTo(BN('0')) === 1) {
            return $status === 'ready' || $status === 'error';
        }
        return false;
});

const approvalTxStatus = writable({})
const txStatus = writable({})

function approve() {
    status.set('betting')
    errors.set(null)
    sendRedeemApproval($legacyPhiCurrencyBalance, approvalTxStatus, (txResults)=>{
        if ($approvalTxStatus.errors?.length > 0) {
            status.set('error')
            errors.set($approvalTxStatus.errors)
        } else {
            console.log(txResults);
            console.log($approvalTxStatus);
            sendRedeem(txStatus, (txResults)=>{
                if ($txStatus.errors?.length > 0) {
                    status.set('error')
                    errors.set($txStatus.errors)
                } else {
                    console.log(txResults);
                    console.log($txStatus);
                    legacyPhiCurrencyBalance.set(BN(txResults.txBlockResult.state[1].value.__fixed__))
                    phiCurrencyBalance.set(BN(txResults.txBlockResult.state[4].value.__fixed__))
                    lamdenCurrencyBalance.set(BN(txResults.txBlockResult.state[5].value.__fixed__))                    
                    status.set("ready");
                }
            });
        }
    });
};

</script>

<div align="middle" class="card">
<h2>Redeem $PHI</h2>

{#if BN($legacyPhiCurrencyBalance).comparedTo(BN('0')) === 1}
<p>
Redeem your legacy $PHI tokens for new $PHI tokens.
</p>
<p>
Redeem {stringToFixed($legacyPhiCurrencyBalance, 8)} legacy tokens for {stringToFixed($legacyPhiCurrencyBalance, 8)} new $PHI tokens.
</p>
{#if $errors !== null}
    {#each $errors as error}
        <div class="row align-center buttons error">
            {error}
        </div>
    {/each}
{/if}
<button on:click={approve} disabled={!$btnEnabled}>
{#if $btnEnabled}
    Redeem
{:else}
    Redeem...
{/if}
</button>
{:else}
<p>
    You do not have any legacy $PHI tokens to redeem.
</p>
{/if}
</div>

<style>
    .buttons{
        margin: 1rem auto 1rem;
        text-align: center;
    }
</style>
    