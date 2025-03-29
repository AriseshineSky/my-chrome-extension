import React, { useState, useEffect } from 'react'
import './App.css'

const App: React.FC = () => {
	const [orders, setOrders] = useState<any>(null);
	const [isButtonActive, setIsButtonActive] = useState(true);

	useEffect(() => {
		chrome.runtime.onMessage.addListener((message, _sender, _sendResponse) => {
			if (message.type === 'updateButton') {
				setIsButtonActive(message.data.active);
			}
		});
	}, []);

	const handleFetchOrders = () => {
		chrome.runtime.sendMessage({ type: 'getOrders' }, (response) => {
			setOrders(response);
		})
	}

	return (
		<div className="App">
			<button id="fetchOrders" onClick={handleFetchOrders} disabled={!isButtonActive}>
				Fetch Orders
			</button>
			<pre id="output">{orders ? JSON.stringify(orders, null, 2) : 'No orders fetched yet.'}</pre>
		</div>
	)
}

export default App
