import React, { useState } from "react";
import "./App.css";

const App: React.FC = () => {
	const [isButtonActive, setIsButtonActive] = useState(true);

	const handleFetchOrders = () => {
		console.log("button clicked");
		setIsButtonActive(false);
		chrome.runtime.sendMessage({ type: "getOrders" }, (response) => {
			setIsButtonActive(true);
		});
	};

	return (
		<div className="App">
			<button
				id="fetchOrders"
				onClick={handleFetchOrders}
				disabled={!isButtonActive}
			>
				Fetch Orders
			</button>
		</div>
	);
};

export default App;
