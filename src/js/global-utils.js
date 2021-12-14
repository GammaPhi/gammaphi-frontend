import BN from 'bignumber.js'
import { get } from 'svelte/store'
import { lamden_vk } from '../stores/lamdenStores';

export const autoRefreshingVariable = (variable, refresh_func, hasFocus, firstTimeCallback=null, dictStore=null, interval=2000) => {
    let calledFirstTimeCallback = false;
    let f = () => {
        setTimeout(()=>{
            if (get(hasFocus) && document.hasFocus()) {
                refresh_func().then((v)=>{
                    variable.set(v)
                    if (!calledFirstTimeCallback && get(lamden_vk) !== null) {
                        calledFirstTimeCallback = true;
                        if (firstTimeCallback !== null) {
                            firstTimeCallback(v);
                        }
                    }
                    if (dictStore !== null) {
                        dictStore.set(get(dictStore));
                    }            
                });
            }
            f();
        }, interval);
    }
    refresh_func().then((v)=>{
        variable.set(v)
        if (firstTimeCallback !== null && get(lamden_vk) !== null) {
            firstTimeCallback(v);
            calledFirstTimeCallback = true;
        }
        if (dictStore !== null) {
            dictStore.set(get(dictStore));
        }
        f();
    });
};



export function openURL(url){
	window.open(url, '_blank');
}

export function isString(s) {
    return typeof s === 'string' || s instanceof String
}

export const stringToFixed = (value, precision) => {
	if (BN.isBigNumber(value) && precision ) value = value.toFixed(precision)
	if (!value) return "0.0"
		try {
			var values = value.split('.')
		} catch {
			var values = value.toString().split('.')
		}
		if (!values[1]) return value
		else {
			if (values[1].length < precision) precision = values[1].length
				let decValue = parseInt(values[1].substring(0, precision))
			if (decValue === 0) return `${values[0]}`
			else {
				let decimals = values[1].substring(0, precision)
				for (let i = precision - 1; i >= 0; i--) {
					if (decimals[i] === '0') precision -= 1
					else i = -1
			}
			return `${values[0]}.${values[1].substring(0, precision)}`
		}
	}
}

export const copyToClipboard = ( textTOcopy='', callback=undefined ) => {
    try{
        var dummy = document.createElement("input");
        document.body.appendChild(dummy);
        dummy.setAttribute("id", "copyhelper");
        document.getElementById("copyhelper").value=textTOcopy;
        dummy.select();
        document.execCommand("copy");
        document.body.removeChild(dummy);
        
    } catch (e) {
        throw new Error('unable to copy')
    }
    if (callback){callback()}
};

export const determinePrecision = (value) => {
	if (BN.isBigNumber(value)) value = value.toString()
	let valueStripped = stripTrailingZero(value)
	if (!valueStripped.includes(".")) return 0
	else {
		return valueStripped.split(".")[1].length
	}
}


function stripTrailingZero (value) {
    const removeZeros = (v) => {
        const numParts = v.split('.')
        let formatted = numParts[1]
        for (let i = numParts[1].length - 1; numParts[1][i] === '0' && typeof numParts[1][i] !== 'undefined'; i--) {
            formatted = formatted.slice(0, -1)
        }
        if (formatted === '') return numParts[0]
            return numParts[0] + '.' + formatted
    }

    const isDecmailString = (v) => {
        if (typeof v !== 'string') return false
        if (v.includes('.')) return true
        return false
    }

    if (isDecmailString(value)) {
          return removeZeros(value)
    } else {
          return value
    }
}