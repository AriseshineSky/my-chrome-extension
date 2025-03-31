import { parse, addDays, subDays } from "date-fns";
import { enUS, de, enGB } from "date-fns/locale";

export function getDateObj(dateStr, region = "us") {
	let retDate;
	const localeMap = {
		us: enUS,
		de: de,
		uk: enGB,
	};
	const formatMap = {
		us: "MMMM dd, yyyy",
		de: "dd. MMMM yyyy",
		uk: "dd MMMM yyyy",
	};
	const locale = localeMap[region] || enUS;

	const today = new Date();
	const currentYear = today.getFullYear();

	if (dateStr.toLowerCase().includes("today")) {
		retDate = today;
	} else if (dateStr.toLowerCase().includes("tomorrow")) {
		retDate = addDays(today, 1);
	} else if (dateStr.toLowerCase().includes("yesterday")) {
		retDate = subDays(today, 1);
	} else {
		try {
			retDate = parse(dateStr, formatMap[region], today, { locale });
			if (!/(\d{4})/.test(dateStr)) {
				retDate.setFullYear(currentYear);
			}
		} catch (e) {
			console.error("Failed to parse date: ", e);
			retDate = new Date("Invalid Date");
		}
	}

	return retDate;
}
