const apiKey = "9401f3099dmsh183323edbeb4857p1ca1e2jsn8f4e317df8cd";
const apiHost = "currency-conversion-and-exchange-rates.p.rapidapi.com";
let exchangeRate = 300; // Default fallback rate

document.addEventListener("DOMContentLoaded", async function () {
    let rateText = document.getElementById("rateText");
    let loadingSpinner = document.getElementById("loadingSpinner");

    // Show loading animation while fetching exchange rate
    loadingSpinner.style.display = "block";
    rateText.style.display = "none";

    try {
        const response = await fetch("https://web-production-f0529.up.railway.app/latest-usd-rate", {
            method: "GET"
        });
        
        const result = await response.json();
        exchangeRate = result.rate; // Update global exchange rate
        rateText.innerText = `1 USD = ${exchangeRate.toFixed(2)} LKR`;

    } catch (error) {
        // console.error("Error fetching exchange rate:", error);
        rateText.innerText = "Error fetching rate!";
    }

    // Hide loading animation and show the exchange rate
    loadingSpinner.style.display = "none";
    rateText.style.display = "block";

    // Convert user input USD -> LKR
    document.getElementById("convertUserInput").addEventListener("click", function () {
        let usdAmount = document.getElementById("usdInput").value;
        if (usdAmount === "" || isNaN(usdAmount) || usdAmount <= 0) {
            alert("Please enter a valid amount.");
            return;
        }
        let lkrValue = (parseFloat(usdAmount) * exchangeRate).toFixed(2);
        document.getElementById("convertedResult").innerText = `${usdAmount} USD = ${lkrValue} LKR`;
    });

    // Convert all page values
    document.getElementById("convertButton").addEventListener("click", function () {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            chrome.scripting.executeScript({
                target: { tabId: tabs[0].id },
                args: [exchangeRate],
                func: convertPrices
            });
        });
    });

    // Reset converted page values
    document.getElementById("resetButton").addEventListener("click", function () {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            chrome.scripting.executeScript({
                target: { tabId: tabs[0].id },
                func: resetPrices
            });
        });
    });
});

// Function to convert prices using the fetched exchange rate
function convertPrices(exchangeRate) {
    document.querySelectorAll("*:not(script):not(style)").forEach(element => {
        if (!element.hasAttribute("data-original-price")) {
            element.childNodes.forEach(node => {
                if (node.nodeType === 3) { // Ensure it's a text node
                    let originalText = node.textContent;

                    let newText = originalText.replace(/(?:USD|\$|US\$)\s?([\d,]+(?:\.\d+)?)/g, function (match, p1) {
                        let numericValue = parseFloat(p1.replace(/,/g, '')); // Remove commas
                        let lkrValue = (numericValue * exchangeRate).toFixed(2);
                        return `${lkrValue} LKR`;
                    });

                    if (originalText !== newText) {
                        element.setAttribute("data-original-price", originalText); // Store original only once
                        node.textContent = newText;
                    }
                }
            });
        }
    });
}




// Function to reset converted prices
function resetPrices() {
    document.querySelectorAll("[data-original-price]").forEach(element => {
        let originalText = element.getAttribute("data-original-price");
        element.textContent = originalText; // Restore entire element text
        element.removeAttribute("data-original-price"); // Remove attribute
    });
}
