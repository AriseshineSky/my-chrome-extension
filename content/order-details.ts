import { RATES } from "./rate";

function utcTime(dateObj) {
	return new Date(Date.UTC(dateObj.getUTCFullYear(), dateObj.getUTCMonth(), dateObj.getUTCDate(), dateObj.getUTCHours(), dateObj.getUTCMinutes(), dateObj.getUTCSeconds()))
}

export const REGEX_BY_COUNTRY = {
	"us": {
		"subtotalMatch": /Item\(s\) Subtotal: (?:\$|USD )(\d{1,3}(?:,\d{3})*(?:\.\d{2})?|\d+(?:\.\d{2})?)/,
		"vatMatch": /Estimated tax to be collected: (?:\$|USD )(\d{1,3}(?:,\d{3})*(?:\.\d{2})?|\d+(?:\.\d{2})?)/,
		"postageMatch": /Shipping & Handling: (?:\$|USD )(\d{1,3}(?:,\d{3})*(?:\.\d{2})?|\d+(?:\.\d{2})?)/,
		"paymentTotal": /Grand Total: (?:\$|USD )(\d{1,3}(?:,\d{3})*(?:\.\d{2})?|\d+(?:\.\d{2})?)/,
	},
	"uk": {
		"subtotalMatch": /\bTotal: (?:£|GBP )(\d{1,3}(?:,\d{3})*(?:\.\d{2})?|\d+(?:\.\d{2})?)/,
		"vatMatch": /(?<!Total Before )VAT: (?:£|GBP )(\d{1,3}(?:,\d{3})*(?:\.\d{2})?|\d+(?:\.\d{2})?)/,
		"postageMatch": /Postage & Packing: (?:£|GBP )(\d{1,3}(?:,\d{3})*(?:\.\d{2})?|\d+(?:\.\d{2})?)/,
		"vat": /VAT: (?:£|GBP )(\d{1,3}(?:,\d{3})*(?:\.\d{2})?|\d+(?:\.\d{2})?)/,
		"total": /Total: (?:£|GBP )(\d{1,3}(?:,\d{3})*(?:\.\d{2})?|\d+(?:\.\d{2})?)/,
		"paymentTotal": /Payment Grand Total: (?:\$|USD )(\d{1,3}(?:,\d{3})*(?:\.\d{2})?|\d+(?:\.\d{2})?)/,
	},
	"de": {
		"subtotalMatch": /Zwischensumme: (?:€|EUR )(\d{1,3}(?:[.,]\d{2})?)/,
		"vatMatch": /Anzurechnende MwSt\.: (?:€|EUR )(\d{1,3}(?:[.,]\d{2})?)/,
		"postageMatch": /Verpackung & Versand: (?:€|EUR )(\d{1,3}(?:[.,]\d{2})?)/,
		"total": /Summe: (?:€|EUR )(\d{1,3}(?:[.,]\d{2})?)/,
		"paymentTotal": /Gesamtsumme: (?:$|USD )(\d{1,3}(?:[.,]\d{2})?)/,
	},
}

export function getOrderCost(docText, country: string) {
	const regex = REGEX_BY_COUNTRY[country.toLowerCase()]
	let subTotal: Number;
	const subTotalMatch = docText.match(regex.subtotalMatch)

	if (subTotalMatch) {
		subTotal = Number(subTotalMatch[1].replace(",", "."));
	}

	let taxTotal: Number;
	const taxTotalMatch = docText.match(regex.vatMatch)
	console.log('tax', taxTotalMatch)
	if (taxTotalMatch) {
		taxTotal = Number(taxTotalMatch[1].replace(",", "."))

	}
	console.log('tax', taxTotal)

	let total: Number;
	const totalMatch = docText.match(regex.total)
	if (totalMatch && totalMatch[1]) {
		total = Number(totalMatch[1].replace(",", "."))
	}

	console.log('tax', total)

	let paymentTotal: Number;
	const paymentTotalMatch = docText.match(regex.paymentTotal)
	if (paymentTotalMatch) {
		paymentTotal = Number(paymentTotalMatch[1].replace(",", "."))
	}

	let rate: Number = Number((paymentTotal / total).toFixed(2));

	let delivCost: Number;
	if (docText.includes("Free shipping") || docText.includes("Free Shipping") || docText.includes("Envío gratis")) {
		delivCost = 0
	} else {
		const delivCostMatch = docText.match(regex.postageMatch)
		if (delivCostMatch) {
			delivCost = Number(delivCostMatch[1].replace(",", "."));
		}
	}

	return {
		"buy_cost": Number((subTotal * rate).toFixed(2)),
		"subTotal": Number((subTotal * rate).toFixed(2)),
		"buy_tax": Number((taxTotal * rate).toFixed(2)),
		"buy_shipping_fee": Number((delivCost * rate).toFixed(2)),
		"rate": rate,
		"total": Number((total * rate).toFixed(2)),
		"taxTotal": Number((taxTotal * rate).toFixed(2)),
		paymentTotal,
	}
}

const SHIPPING_ADDRES_SELECTOR = 'li.displayAddressLI'

export function getShippingAddress(doc) {
	const shipAddrSels = doc.querySelectorAll(SHIPPING_ADDRES_SELECTOR)
	return Array.from(shipAddrSels).map((addr) => addr.textContent.trim()).join(",")
}

