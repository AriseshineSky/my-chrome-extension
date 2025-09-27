import { RATES } from "./rate";

function utcTime(dateObj) {
	return new Date(Date.UTC(dateObj.getUTCFullYear(), dateObj.getUTCMonth(), dateObj.getUTCDate(), dateObj.getUTCHours(), dateObj.getUTCMinutes(), dateObj.getUTCSeconds()))
}

export const REGEX_BY_COUNTRY = {
	"us": {
		"subtotalMatch": /Item\(s\) Subtotal: (?:\$|USD )(\d{1,3}(?:,\d{3})*(?:\.\d{2})?|\d+(?:\.\d{2})?)/,
		"vatMatch": /Estimated tax to be collected: (?:\$|USD )(\d{1,3}(?:,\d{3})*(?:\.\d{2})?|\d+(?:\.\d{2})?)/,
		"postageMatch": /Shipping & Handling: (?:\$|USD )(\d{1,3}(?:,\d{3})*(?:\.\d{2})?|\d+(?:\.\d{2})?)/,
		"total": /Grand Total: (?:\$|USD )(\d{1,3}(?:,\d{3})*(?:\.\d{2})?|\d+(?:\.\d{2})?)/,
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

function getSubTotal(docText, country) {
	let subTotal: Number;

	const REGEX_BY_COUNTRY = {
		"us": {
			"subtotalMatch": /Item\(s\) Subtotal: (?:\$|USD )(\d{1,3}(?:,\d{3})*(?:\.\d{2})?|\d+(?:\.\d{2})?)/,
		},
		"uk": {
			"subtotalMatch": /\bTotal: (?:£|GBP )(\d{1,3}(?:,\d{3})*(?:\.\d{2})?|\d+(?:\.\d{2})?)/,
		}
	}
	const REGEX_BY_COUNTRY_V2 = {
		uk: {
			subtotalMatch: /Item\(s\) Subtotal:\s*(?:USD|£|GBP)?\s*([\d,]+\.\d{2})/,
		}
	}
	let regex = REGEX_BY_COUNTRY[country.toLowerCase()]
	let subTotalMatch = docText.match(regex.subtotalMatch)

	if (subTotalMatch) {
		subTotal = Number(subTotalMatch[1].replace(",", "."));
		return subTotal;
	}

	regex = REGEX_BY_COUNTRY_V2[country.toLowerCase()] ?? null;
	if (regex === null) {
		return null;
	}

	subTotalMatch = docText.match(regex.subtotalMatch)

	if (subTotalMatch) {
		subTotal = Number(subTotalMatch[1].replace(",", "."));
		return subTotal;
	}
	return null;
}

function getRate(docText, paymentTotal, total) {
	const match = docText.match(/1\s*GBP\s*=\s*([\d.]+)\s*USD/i);
	let exchangeRate: number | null = null;
	if (match) {
		exchangeRate = Number(match[1])
	}
	return exchangeRate;
	return Number((paymentTotal / total).toFixed(2));
}

function getExchangeGuaranteeFee(docText, paymentTotal, total) {

}

function getPaymentTotal(docText, country) {
	const REGEX_BY_COUNTRY = {
		us: {
			paymentTotal: /Grand Total: (?:\$|USD )(\d{1,3}(?:,\d{3})*(?:\.\d{2})?|\d+(?:\.\d{2})?)/,
		},
		uk: {
			paymentTotal: /Payment Grand Total: (?:\$|USD )(\d{1,3}(?:,\d{3})*(?:\.\d{2})?|\d+(?:\.\d{2})?)/,
		}
	}
	const REGEX_BY_COUNTRY_V2 = {
		uk: {
			paymentTotal: /Grand Total: (?:\$|USD )(\d{1,3}(?:,\d{3})*(?:\.\d{2})?|\d+(?:\.\d{2})?)/,
		}
	}
	let paymentTotal: Number;

	let regex = REGEX_BY_COUNTRY[country.toLowerCase()]
	let subTotalMatch = docText.match(regex.subtotalMatch)
	let paymentTotalMatch = docText.match(regex.paymentTotal)
	if (paymentTotalMatch) {
		paymentTotal = Number(paymentTotalMatch[1].replace(",", "."))
		return paymentTotal;
	}

	regex = REGEX_BY_COUNTRY_V2[country.toLowerCase()] ?? null;
	paymentTotalMatch = docText.match(regex.paymentTotal)
	if (paymentTotalMatch) {
		paymentTotal = Number(paymentTotalMatch[1].replace(",", "."))
		return paymentTotal;
	}
	return null;
}

function getShippingFee(docText, country) {
	let delivCost: Number;

	const REGEX_BY_COUNTRY = {
		us: {
			postageMatch: /Shipping & Handling: (?:\$|USD )(\d{1,3}(?:,\d{3})*(?:\.\d{2})?|\d+(?:\.\d{2})?)/,
		},
		uk: {
			postageMatch: /Postage & Packing: (?:£|GBP )(\d{1,3}(?:,\d{3})*(?:\.\d{2})?|\d+(?:\.\d{2})?)/,
		}
	}
	const REGEX_BY_COUNTRY_V2 = {
		uk: {
			postageMatch: /Postage & Packing: (?:\$|USD )(\d{1,3}(?:,\d{3})*(?:\.\d{2})?|\d+(?:\.\d{2})?)/,
		}
	}

	if (docText.includes("Free shipping") || docText.includes("Free Shipping") || docText.includes("Envío gratis")) {
		delivCost = 0
		return delivCost;
	}
	let regex = REGEX_BY_COUNTRY[country.toLowerCase()]
	let delivCostMatch = docText.match(regex.postageMatch)
	if (delivCostMatch) {
		delivCost = Number(delivCostMatch[1].replace(",", "."));
	}


	regex = REGEX_BY_COUNTRY_V2[country.toLowerCase()] ?? null;
	delivCostMatch = docText.match(regex.postageMatch)
	if (delivCostMatch) {
		delivCost = Number(delivCostMatch[1].replace(",", "."))
		return delivCost;
	}
	return null;
}

export function getOrderCost(docText, country: string) {
	const regex = REGEX_BY_COUNTRY[country.toLowerCase()]
	let subTotal = getSubTotal(docText, country);
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

	console.log('total', total)

	let paymentTotal = getPaymentTotal(docText, country);

	let rate: Number | null = getRate(docText, paymentTotal, total);

	let delivCost = getShippingFee(docText, country);

	let exchangeGuaranteeFee = getExchangeGuaranteeFee(docText, paymentTotal, total)

	return {
		"buy_cost": Number((subTotal * rate).toFixed(2)),
		"subTotal": Number((subTotal * rate).toFixed(2)),
		"buy_tax": Number(((taxTotal ?? 0) * rate).toFixed(2)),
		"buy_shipping_fee": Number((delivCost * rate).toFixed(2)),
		"rate": rate,
		"total": Number((total * rate).toFixed(2)),
		"taxTotal": Number(((taxTotal ?? 0) * rate).toFixed(2)),
		"exchange_guarantee_fee": exchangeGuaranteeFee,
		paymentTotal,
	}
}

const SHIPPING_ADDRES_SELECTOR = 'li.displayAddressLI, [data-component="shippingAddress"] ul li span'

export function getShippingAddress(doc) {
	const shipAddrSels = doc.querySelectorAll(SHIPPING_ADDRES_SELECTOR)
	return Array.from(shipAddrSels).map((addr) => addr.textContent.trim()).join(",")
}

