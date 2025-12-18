import { RATES } from "./rate";

export function getAmountFromStr(orderTotalCostStr: string, country: string = null, rate = null): string {
	if (rate === null) {
		if (country !== null && country.toLowerCase() in RATES) {
			rate = RATES[country.toLowerCase()];
		}
	}
	return (Number(orderTotalCostStr.replace(/[$£]/g, "")) * rate).toFixed(2);
}

