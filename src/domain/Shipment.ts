export interface TrackingInfo {
  tracking: string | null;
  carrier: string | null;
}

export interface ShipmentInfo {
  shipmentId: string;
  shipmentStatus: string;
  orderItems: any[]; // 之后你可以替换成 OrderItem
  trackingInfo: TrackingInfo;
}

export interface Shipment {
  shipmentId: string;
  shipmentStatus: string;
  orderItems: any[]; // 之后你可以替换成 OrderItem
  trackingInfo: TrackingInfo;
}

