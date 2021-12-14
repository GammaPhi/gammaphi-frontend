import { writable, derived } from "svelte/store";

export const username = writable('');
export const display_name = writable('');
export const icon_base64 = writable('');
export const icon_url = writable('');
export const frens = writable([]);