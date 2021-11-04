import { swapInfo, swapHistory  } from '../stores/globalStores'
import { get } from "svelte/store";
import BN from 'bignumber.js'


function setLSValue(key, value){
    localStorage.setItem(key, JSON.stringify(value))
}