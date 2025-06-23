import { fetchInfo } from "../services/api";
const track_elem_selector =
	':scope div[data-component="shipmentConnections"] a, :scope span.track-package-button a'

const trackNumberSelector = "div.pt-delivery-card-trackingId";
const carrierSelector = "h3.a-spacing-small";

function getTrackElements(doc) {
	const trackNoStr = doc.querySelector(trackNumberSelector)?.textContent;
	const carrierStr = doc.querySelector(carrierSelector)?.textContent;
	return { trackNoStr, carrierStr };
}

export function getTrackInfo(doc) {
	const { trackNoStr, carrierStr } = getTrackElements(doc);
	return getTrackInfoFromText(trackNoStr, carrierStr);
}

function getTrackInfoFromText(trackNoStr, carrierStr) {
	let tracking = "";
	if (trackNoStr !== null && trackNoStr !== undefined) {
		tracking = trackNoStr.trim().split(" ").pop().split(":").pop();
	}

	let carrier = "";
	if (carrierStr !== null && carrierStr !== undefined) {
		const carrierText = carrierStr.trim().toLowerCase();
		if (carrierText.includes("amazon")) {
			carrier = "Amazon";
		} else if (carrierText.startsWith("shipped with")) {
			carrier = carrierStr.substring(13);
		} else if (carrierText.startsWith("delivery by")) {
			carrier = carrierStr.substring(12);
		}
	}

	return {
		tracking: tracking,
		carrier: carrier,
	};
}

export async function fetchTrackInfo(delivBox) {
	const rightButtons = delivBox.querySelectorAll(track_elem_selector);
	for (const rb of rightButtons) {
		if (
			rb.textContent.includes("Track package") ||
			rb.textContent.includes("Lieferung verfolgen")
		) {
			const trackdoc = await fetchInfo(rb.getAttribute("href"));
			return getTrackInfo(trackdoc);
		}
	}

	const empties = {
		tracking: null,
		carrier: null,
	};
	return empties;
}
