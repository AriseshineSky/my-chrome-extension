import { fetchInfo } from "../services/api";
import { getOrders, goToOrderHistoryPage } from "./order";
let isProcessing = false;

export interface User {
	name: string;
	email: string;
}

function clearSessionStorageAfterDelay(delayInMilliseconds: number) {
	setTimeout(() => {
		sessionStorage.clear();
	}, delayInMilliseconds);
}

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
	if (message.type === "fetchOrders" && !isProcessing) {
		if (sessionStorage.getItem('active')) {
			console.log("already run");
			return null;
		}
		sessionStorage.setItem("active", "1");
		clearSessionStorageAfterDelay(1000 * 60 * 60 * 2);
		goToOrderHistoryPage();
	}
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

async function main() {
	if (!sessionStorage.getItem('active')) {
		console.log("not active")
		return null;
	}

	await new Promise((resolve) => {
		if (document.readyState === "complete" || document.readyState === "interactive") {
			resolve();
		} else {
			document.addEventListener("DOMContentLoaded", resolve, { once: true });
		}
	});

	try {
		const country = getCurrentAmazonCountry();
		console.log("country", country);
		if (country === null) {
			console.log("Does not support current url");
			return null;
		}

		if (isLogged(country)) {
			console.log("Amazon logged in");

			const userData = localStorage.getItem("user");
			let user = userData ? JSON.parse(userData) : null;
			if (user === null || !user.email) {
				user = await getLoginInfo();
			}
			if (user !== null && user.email !== null) {
				localStorage.setItem("user", JSON.stringify(user));
			}

			console.log(user);
			const isDone = await getOrders(document, country, user)
			if (isDone) {
				sessionStorage.removeItem('active');
				chrome.runtime.sendMessage({ type: 'updateButton', data: { active: true } });
			}

		} else {
			console.log("Amazon not logged in");
			return null;
		}
	} catch (error) {
		console.error("Error in main():", error);
	}
}

