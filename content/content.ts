let isProcessing = false;
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	if (message.type === "fetchOrders" && !isProcessing) {
		isProcessing = true;
		console.log("content script", message);
		main()
			.then(() => {
				sendResponse({ success: true });
			})
			.catch((error) => {
				sendResponse({ success: true });
				console.log(error);
			})
			.finally(() => {
				isProcessing = false;
			});
	}
	return true;
});

import { fetchInfo } from "../services/api";
import { getOrders, saveOrders } from "./order";

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
const NEXT_PAGE_SELECTOR = "ul.a-pagination > li.a-last > a";

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

async function main() {
	if (sessionStorage.getItem("isRunning") === "true") {
		console.log("Script is already running.");
		return;
	}

	sessionStorage.setItem("isRunning", "true");
	try {
		const country = getCurrentAmazonCountry();
		console.log("country", country);
		if (country === null) {
			console.log("Does not support current url");
			return null;
		}

		if (isLogged(country)) {
			console.log("Amazon logged in");

			const user = await getLoginInfo();
			console.log(user);
			const orders = await getOrders(document, country, user);
			saveOrders(user, orders);
			// goToNextPage();
		} else {
			console.log("Amazon not logged in");
			return null;
		}
	} catch (error) {
		console.error("Error in main():", error);
	} finally {
		sessionStorage.removeItem("isRunning");
	}
}

function goToNextPage() {
	const nextSel = document.querySelector(NEXT_PAGE_SELECTOR);
	if (!nextSel) {
		console.log("Page end. No next page found.");
		return;
	}

	const nextHref = nextSel.getAttribute("href");
	if (!nextHref) {
		console.log("Next page URL is missing.");
		return;
	}

	const fullUrl = getFullUrl(nextHref);
	console.log("Navigating to next page:", fullUrl);

	setTimeout(() => {
		window.location.href = fullUrl;
		setTimeout(() => {
			main();
		}, 5000);
	}, 0);
}
