import { writable, derived } from "svelte/store";
import { loadPrivateKeyFromPem, retrievePemFileFromBrowser } from "../js/rsa-utils";
import { lamden_vk } from "./lamdenStores";

export const username = writable('');
export const display_name = writable('');
export const icon_base64 = writable('');
export const icon_url = writable('');
export const frens = writable([]);

export const privateKeyErrors = writable([]);
export const storedPemFile = writable('');
export const privateKey = derived([lamden_vk, storedPemFile], ([$lamden_vk, $storedPemFile]) => {
    try {
        privateKeyErrors.set([]);
        if ($storedPemFile.length > 0) {
            return loadPrivateKeyFromPem($storedPemFile);
        } else {
            return loadPrivateKeyFromPem(retrievePemFileFromBrowser($lamden_vk));
        }
    } catch(e) {
        privateKeyErrors.set(["Unable to retrieve PEM file. Please reupload it"]);
        return null;
    }
});