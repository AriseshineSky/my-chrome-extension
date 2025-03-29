chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "getOrders") {
    const orders = [
      { orderId: 1, product: "Product 1", status: "Shipped" },
      { orderId: 2, product: "Product 2", status: "Delivered" }
    ];
    sendResponse(orders);
  } else if (message.type === "updateButton") {
    sendResponse({ active: true });
  }
});
