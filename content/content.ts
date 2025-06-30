import { fetchInfo } from "../services/api";
import { getOrders, goToOrderHistoryPage } from "./order";
let isProcessing = false;

export interface User {
	name: string;
	email: string;
}


function markSessionActive() {
	sessionStorage.setItem("active", "1");
	clearSessionStorageAfterDelay(1000 * 60 * 60 * 2);
}

function shouldFetchOrders(message, isProcessing) {
	return (
		message.type === "fetchOrders" &&
		!isProcessing &&
		!sessionStorage.getItem("active")
	)
}

function checkIfActiveExpired() {
	const expiresAt = parseInt(sessionStorage.getItem("active_expires_at") || "0", 10);
	if (Date.now() > expiresAt) {
		sessionStorage.removeItem("active");
		sessionStorage.removeItem("active_expires_at");
		console.log("Session expired");
	}
}

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
	if (message.type === "fetchOrders" && !isProcessing) {
		if (sessionStorage.getItem('active')) {
			console.log("already run");
			sendResponse({ status: "already running" });
			return;
		}

		sessionStorage.setItem("active", "1");
		sessionStorage.setItem("active_expires_at", Date.now() + 1000 * 60 * 60 * 2 + "");

		goToOrderHistoryPage();
		sendResponse({ status: "started" });
	}
	return true;
});


const DOMAIN_BY_COUNTRY = {
	us: "amazon.com",
	uk: "amazon.co.uk",
	de: "amazon.de",
};

const COOKIE_BY_COUNTRY = {
	uk: "x-acbuk=",
	us: "x-main=",
	de: "x-acbde=",
	jp: "x-acbjp=",
};

const ACCOUNT_RELATIVE_PATH = "/ax/account/manage";

function getCurrentAmazonCountry() {
	return (
		Object.keys(DOMAIN_BY_COUNTRY).find((country) => {
			return window.location.href.includes(DOMAIN_BY_COUNTRY[country]);
		}) || null
	);
}

function isLogged(country: string): boolean {
	const cookieKey = COOKIE_BY_COUNTRY[country];
	if (!cookieKey) {
		return false;
	}
	return document.cookie.includes(cookieKey);
}

function getFullUrl(relativePath: string) {
	const fullUrl = new URL(relativePath, window.location.origin);
	return fullUrl.href;
}

async function getLoginInfo(): Promise<{ name: string; email: string } | null> {
	try {
		const loginDoc: Document = await fetchInfo(
			getFullUrl(ACCOUNT_RELATIVE_PATH),
		);
		let name: string;
		const nameElem = loginDoc.querySelector("span#NAME_SUBTITLE");
		if (nameElem?.textContent) {
			name = nameElem.textContent.trim();
		}

		let email: string;
		const emailElem = loginDoc.querySelector("span#EMAIL_SUBTITLE");
		if (emailElem?.textContent) {
			email = emailElem.textContent.trim();
		}

		return { name, email };
	} catch (error) {
		console.error("Error getting login info:", error);
	}
}

main()

function isActive() {
	return sessionStorage.getItem("active") !== null;
}

function deactive() {
	sessionStorage.removeItem("active");
	chrome.runtime.sendMessage({type: "updateButton", data: {active: true}});
}

function ensureDomReady() {
	return new Promise<void>((resolve) => {
		if (document.readyState === "complete" || document.readyState === "interactive") {
			resolve();
		} else {
			document.addEventListener("DOMContentLoaded", () => resolve(), { once: true });
		}
	})
}

async function loadUser() {
	const cached = localStorage.getItem("user");
	if (cached) {
		const user = JSON.parse(cached);
		if (user?.email) return user;
	}
	const user = await getLoginInfo();
	if (user?.email) localStorage.setItem("user", JSON.stringify(user));
	return user;
}

export async function main() {
	checkIfActiveExpired();

	if (!isActive()) {
		console.log("not active")
		return;
	}

	await ensureDomReady()

	try {
		const country = getCurrentAmazonCountry();
		console.log("country", country);
		if (country === null) {
			console.log("Does not support current url");
			return null;
		}

		if (!isLogged(country)) {
			console.log("Amazon not logged in");
			return;
		}

		console.log("Amazon logged in");

		const user = await loadUser();
		console.log(user);

		const isDone = await getOrders(document, country, user)
		if (isDone) {
			deactive()
		}

	} catch (error) {
		console.error("Error in main():", error);
	}
}

