import BN from 'bignumber.js'
import { get, writable } from 'svelte/store'
import { lamden_vk } from '../stores/lamdenStores';


// Set the name of the hidden property and the change event for visibility
var hidden, visibilityChange;
if (typeof document.hidden !== "undefined") { // Opera 12.10 and Firefox 18 and later support
  hidden = "hidden";
  visibilityChange = "visibilitychange";
} else if (typeof document.msHidden !== "undefined") {
  hidden = "msHidden";
  visibilityChange = "msvisibilitychange";
} else if (typeof document.webkitHidden !== "undefined") {
  hidden = "webkitHidden";
  visibilityChange = "webkitvisibilitychange";
}

let isVisible = true;

function handleVisibilityChange() {
  if (document[hidden]) {
    isVisible = false;
  } else {
    isVisible = true;
  }
}

// Warn if the browser doesn't support addEventListener or the Page Visibility API
if (typeof document.addEventListener === "undefined" || hidden === undefined) {
  console.log("This demo requires a browser, such as Google Chrome or Firefox, that supports the Page Visibility API.");
} else {
  // Handle page visibility change
  document.addEventListener(visibilityChange, handleVisibilityChange, false);
}

export function setupArrayStore(hasFocus, array, storeDict, default_value, refresh_func, update=true, firstTimeCallback=null, interval=5000) {
    let store = get(array);
    for(var i = 0; i < store.length; i++) {
        let elem = store[i];
        if (!get(storeDict).hasOwnProperty(elem)) {
            get(storeDict)[elem] = writable(default_value);
            if (update) {
                autoRefreshingVariable(
                    get(storeDict)[elem], 
                    refresh_func(elem),
                    hasFocus,
                    firstTimeCallback,
                    storeDict,
                    interval
                );
            } else {
                refresh_func(elem)().then((v)=>{
                    get(storeDict)[elem].set(v);
                    storeDict.set(get(storeDict));
                });
            }
        }
    }
}


export const autoRefreshingVariable = (variable, refresh_func, hasFocus, firstTimeCallback=null, dictStore=null, interval=5000) => {
    let calledFirstTimeCallback = false;
    let f = () => {
        setTimeout(()=>{
            if (get(hasFocus) && (document.hasFocus() || isVisible)) {
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

export function formatGameId(game_id) {
    return `${game_id.substring(0, 4)}...${game_id.substring(game_id.length-4)}`;
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