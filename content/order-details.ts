function utcTime(dateObj) {
	return new Date(Date.UTC(dateObj.getUTCFullYear(), dateObj.getUTCMonth(), dateObj.getUTCDate(), dateObj.getUTCHours(), dateObj.getUTCMinutes(), dateObj.getUTCSeconds()))
}

export const REGEX_BY_COUNTRY = {
	"us": {
		"subtotalMatch": /Item\(s\) Subtotal: (?:\$|USD )(\d{1,3}(?:,\d{3})*(?:\.\d{2})?|\d+(?:\.\d{2})?)/,
		"vatMatch": /Estimated tax to be collected: (?:\$|USD )(\d{1,3}(?:,\d{3})*(?:\.\d{2})?|\d+(?:\.\d{2})?)/,
		"postageMatch": /Shipping & Handling: (?:\$|USD )(\d{1,3}(?:,\d{3})*(?:\.\d{2})?|\d+(?:\.\d{2})?)/,
		"paymenTotal": /Grand Total: (?:\$|USD )(\d{1,3}(?:,\d{3})*(?:\.\d{2})?|\d+(?:\.\d{2})?)/,
	},
	"uk": {
		"subtotalMatch": /\bTotal: (?:£|GBP )(\d{1,3}(?:,\d{3})*(?:\.\d{2})?|\d+(?:\.\d{2})?)/,
		"vatMatch": /(?<!Total Before )VAT: (?:£|GBP )(\d{1,3}(?:,\d{3})*(?:\.\d{2})?|\d+(?:\.\d{2})?)/,
		"postageMatch": /Postage & Packing: (?:£|GBP )(\d{1,3}(?:,\d{3})*(?:\.\d{2})?|\d+(?:\.\d{2})?)/,
		"vat": /VAT: (?:£|GBP )(\d{1,3}(?:,\d{3})*(?:\.\d{2})?|\d+(?:\.\d{2})?)/,
		"total": /Total: (?:£|GBP )(\d{1,3}(?:,\d{3})*(?:\.\d{2})?|\d+(?:\.\d{2})?)/,
		"paymenTotal": /Payment Grand Total: (?:\$|USD )(\d{1,3}(?:,\d{3})*(?:\.\d{2})?|\d+(?:\.\d{2})?)/,
	},
	"de": {
		"subtotalMatch": /Zwischensumme: (?:€|EUR )(\d{1,3}(?:[.,]\d{2})?)/,
		"vatMatch": /Anzurechnende MwSt\.: (?:€|EUR )(\d{1,3}(?:[.,]\d{2})?)/,
		"postageMatch": /Verpackung & Versand: (?:€|EUR )(\d{1,3}(?:[.,]\d{2})?)/,
		"total": /Summe: (?:€|EUR )(\d{1,3}(?:[.,]\d{2})?)/,
		"paymenTotal": /Gesamtsumme: (?:$|USD )(\d{1,3}(?:[.,]\d{2})?)/,
	},
}

export function getOrderCost(docText, country, rate) {
	const regex = REGEX_BY_COUNTRY[country]
	let subTotal = null
	const subTotalMatch = docText.match(regex.subtotalMatch)

	if (subTotalMatch) {
		subTotal = Number(subTotalMatch[1].replace(",", "."))
	}

	let taxTotal = null
	const taxTotalMatch = docText.match(regex.vatMatch)
	if (taxTotalMatch) {
		taxTotal = Number(taxTotalMatch[1].replace(",", "."))
	}

	let total = null
	const totalMatch = docText.match(regex.total)
	if (totalMatch && totalMatch[1]) {
		console.log(totalMatch[1])
		total = Number(totalMatch[1].replace(",", "."))
	}
	let paymenTotal = null
	const paymenTotalMatch = docText.match(regex.paymenTotal)
	if (paymenTotalMatch) {
		console.log(paymenTotalMatch[1])
		paymenTotal = Number(paymenTotalMatch[1].replace(",", "."))
	}

	let delivCost = null
	if (docText.includes("Free shipping") || docText.includes("Free Shipping") || docText.includes("Envío gratis")) {
		delivCost = 0
	} else {
		const delivCostMatch = docText.match(regex.postageMatch)
		if (delivCostMatch) {
			delivCost = Number(delivCostMatch[1].replace(",", "."))
		}
	}
	let buy_cost = Number(paymenTotal?.toFixed(2))
	if (!buy_cost) {
		buy_cost = Number((total / rate).toFixed(2))
	}

	return {
		buy_cost,
		"buy_tax": Number((taxTotal / rate).toFixed(2)),
		"buy_shipping_fee": Number((delivCost / rate).toFixed(2)),
	}
}

const SHIPPING_ADDRES_SELECTOR = 'li.displayAddressLI'

export function getShippingAddress(doc) {
	const shipAddrSels = doc.querySelectorAll(SHIPPING_ADDRES_SELECTOR)
	return Array.from(shipAddrSels).map((addr) => addr.textContent.trim()).join(",")
}

