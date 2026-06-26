const stockData = {{ stock_data | tojson }};
const symbol = {{ symbol | tojson }};

const canvas = document.getElementById("stockCanvas");
const ctx = canvas.getContext("2d");

function drawChart(data, symbol) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (data.length === 0) {
    ctx.fillStyle = "black";
    ctx.font = "24px Arial";
    ctx.fillText("No data found for " + symbol, 50, 80);
    return;
    }

    const padding = 60;
    const graphWidth = canvas.width - padding * 2;
    const graphHeight = canvas.height - padding * 2;

    const prices = data.map(item => item.close);
    const dates = data.map(item => item.date);

    const maxPrice = Math.max(...prices);
    const minPrice = Math.min(...prices);

    function getX(index) {
    return padding + index * (graphWidth / (prices.length - 1));
    }

    function getY(price) {
    return canvas.height - padding - ((price - minPrice) / (maxPrice - minPrice)) * graphHeight;
    }

    // Title
    ctx.fillStyle = "black";
    ctx.font = "22px Arial";
    ctx.fillText(`${symbol} Closing Price`, padding, 35);

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

    ctx.strokeStyle = "blue";
    ctx.lineWidth = 3;
    ctx.stroke();

    // Points
    prices.forEach((price, index) => {
    const x = getX(index);
    const y = getY(price);

    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fillStyle = "red";
    ctx.fill();
    });

    // Min/max labels
    ctx.fillStyle = "black";
    ctx.font = "14px Arial";
    ctx.fillText(`Max: $${maxPrice.toFixed(2)}`, canvas.width - 180, 60);
    ctx.fillText(`Min: $${minPrice.toFixed(2)}`, canvas.width - 180, 80);

    // Date labels
    ctx.font = "11px Arial";
    const labelStep = Math.ceil(dates.length / 5);

    dates.forEach((date, index) => {
    if (index % labelStep === 0) {
        const x = getX(index);
        ctx.fillText(date.slice(5), x - 15, canvas.height - padding + 20);
    }
    });
}

drawChart(stockData, symbol);