
import { 
	username, 
	display_name,
	icon_base64,
	icon_url,
	frens
} from '../stores/profileStore'

import { 
	hydrateProfile,
} from '../js/lamden-utils'


export function loadProfileStore() {
    const map = {
        username: username,
        display_name: display_name,
        icon_base64: icon_base64,
        icon_url: icon_url,
        frens: frens,
    };

    const default_overrides = {
        public_rsa_key: [],
        frens: [],
    };

    const keys = Object.keys(map);
    for (var i = 0; i < keys.length; i++) {
        let key = keys[i];
        let store = map[key];
        hydrateProfile(key, default_overrides[key] || "").then((value)=>{
            store.set(value);
        })
    }
};