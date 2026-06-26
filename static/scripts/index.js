const canvas = document.getElementById("stockCanvas");
const ctx = canvas.getContext("2d");
const message = document.getElementById("message");

document.querySelectorAll(".ticker-link").forEach(button => {
    button.addEventListener("click", () => {
    const symbol = button.dataset.symbol;

    loadStock(symbol);

    document.getElementById("stock-search-section").scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
    });
});

async function loadStock(clickedSymbol = null) {
    const input = document.getElementById("symbolInput");
    const symbol = (clickedSymbol || input.value).toUpperCase().trim();

    input.value = symbol;

    if (!symbol) {
    message.textContent = "Please enter a stock symbol.";
    return;
    }

    message.textContent = "Loading...";

    const response = await fetch(`/api/stock/${symbol}`);
    const result = await response.json();

    if (result.data.length === 0) {
    clearCanvas();
    message.textContent = `No data found for ${result.symbol}.`;
    return;
    }

    message.textContent = `${result.symbol} loaded successfully.`;
    drawChart(result.data, result.symbol);
}

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function drawChart(data, symbol) {
    clearCanvas();

    const padding = 60;
    const graphWidth = canvas.width - padding * 2;
    const graphHeight = canvas.height - padding * 2;

    const prices = data.map(item => item.close);
    const dates = data.map(item => item.date);

    const maxPrice = Math.max(...prices);
    const minPrice = Math.min(...prices);

    const firstPrice = prices[0];
    const lastPrice = prices[prices.length - 1];

    const isUptrend = lastPrice >= firstPrice;
    const lineColor = isUptrend ? "green" : "red";

    const priceChange = lastPrice - firstPrice;
    const percentChange = (priceChange / firstPrice) * 100;

    function getX(index) {
        if (prices.length === 1) {
        return canvas.width / 2;
        }

        return padding + index * (graphWidth / (prices.length - 1));
    }

    function getY(price) {
        if (maxPrice === minPrice) {
        return canvas.height / 2;
        }

        return canvas.height - padding - ((price - minPrice) / (maxPrice - minPrice)) * graphHeight;
    }

    // Title
    ctx.fillStyle = "black";
    ctx.font = "22px Arial";
    ctx.fillText(`${symbol} Closing Price - Last 1 Month`, padding, 35);

    // Trend label
    ctx.fillStyle = lineColor;
    ctx.font = "16px Arial";

    const changeText = `${priceChange >= 0 ? "+" : ""}${priceChange.toFixed(2)} (${percentChange >= 0 ? "+" : ""}${percentChange.toFixed(2)}%)`;

    ctx.fillText(changeText, padding, 58);

    // Axes
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, canvas.height - padding);
    ctx.lineTo(canvas.width - padding, canvas.height - padding);
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Line graph
    ctx.beginPath();

    prices.forEach((price, index) => {
        const x = getX(index);
        const y = getY(price);

        if (index === 0) {
        ctx.moveTo(x, y);
        } else {
        ctx.lineTo(x, y);
        }
    });

    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 3;
    ctx.stroke();

    // Black points
    prices.forEach((price, index) => {
        const x = getX(index);
        const y = getY(price);

        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fillStyle = "black";
        ctx.fill();
    });

    // Min/max labels
    ctx.fillStyle = "black";
    ctx.font = "14px Arial";
    ctx.fillText(`Max: $${maxPrice.toFixed(2)}`, canvas.width - 180, 60);
    ctx.fillText(`Min: $${minPrice.toFixed(2)}`, canvas.width - 180, 80);

    // Date labels
    ctx.font = "11px Arial";
    ctx.fillStyle = "black";

    const labelStep = Math.ceil(dates.length / 5);

    dates.forEach((date, index) => {
        if (index % labelStep === 0) {
        const x = getX(index);
        ctx.fillText(date.slice(5), x - 15, canvas.height - padding + 20);
        }
    });
    }

// Load default stock when page opens
loadStock();