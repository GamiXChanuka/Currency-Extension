document.querySelectorAll("*:not(script):not(style)").forEach(element => {
    if (element.childNodes.length === 1 && element.childNodes[0].nodeType === 3) {  // Ensures only text is modified
        let originalText = element.innerHTML;
        let newText = originalText.replace(/\$\s?(\d+(\.\d+)?)/g, function (match, p1) {
            let lkrValue = (parseFloat(p1) * 300).toFixed(2);
            return `${lkrValue} LKR`;
        });

        if (originalText !== newText) {
            element.setAttribute("data-original-price", originalText);  // Save original price
            element.innerHTML = newText;  // Replace with converted value
        }
    }
});
