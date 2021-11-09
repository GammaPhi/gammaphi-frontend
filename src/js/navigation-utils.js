import { writable } from "svelte/store";

export const page = writable(window.location.pathname);

export function navigateLink(e) {
	e.preventDefault();
	let href = this.href.replace("https://", "").replace("http://","").replace(window.location.host, "")
	console.log(window.location.hostname);
	console.log(href);
	history.pushState(history.state, '', href);
	page.set(href);
}