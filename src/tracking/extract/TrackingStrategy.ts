export interface TrackingStrategy {
	match(text: string): boolean;
	extract(text: string): string | null;
}

export interface CarrierStrategy {
	match(text: string): boolean;
	extract(text: string): string | null;
}

export class EnglishTrackingStrategy implements TrackingStrategy {
  match(text: string): boolean {
    return /Tracking\s*ID:/i.test(text);
  }

  extract(text: string): string | null {
    const match = text.match(/Tracking\s*ID:\s*(\S+)/i);
    return match ? match[1] : null;
  }
}

export class SpanishTrackingStrategy implements TrackingStrategy {
	match(text: string): boolean {
		return /ID\s*de\s*seguimiento/i.test(text);
	}

	extract(text: string): string | null {
    const match = text.match(/ID\s*de\s*seguimiento:\s*(\S+)/i);
    return match ? match[1] : null;
  }
}

export class AmazonCarrierStrategy implements CarrierStrategy {
  match(text: string): boolean {
    return /amazon/i.test(text);
  }

  extract(): string {
    return "Amazon";
  }
}

export class ShippedWithStrategy implements CarrierStrategy {
  match(text: string): boolean {
    return /shipped with/i.test(text);
  }

  extract(text: string): string {
    return text.replace(/shipped with/i, "").trim();
  }
}

export class SpanishCarrierStrategy implements TrackingStrategy {
	match(text: string): boolean {
		return /Se envió con/i.test(text);
	}

	extract(text: string): string | null {
    return text.replace(/Se envió con/i, "").trim();
  }
}

export class DeliveryByStrategy implements CarrierStrategy {
  match(text: string): boolean {
    return /Delivery By/i.test(text);
  }

  extract(text: string): string {
    return text.replace(/Delivery By/i, "").trim();
  }
}

