function getRandomRGB() {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    return `rgb(${r}, ${g}, ${b})`;
}

const ChartElement = (function () {
    return class ChartElement {
        constructor(coin, initialPrice) {
            this.coin = coin;
            this.initialPrice = initialPrice;
            this.chart = null;
            this.data = null;
            this.config = null;
            this.canvasId = `chart-${coin.ID}`;
        }

        createChart() {
            this.data = this.getData(this.coin, this.initialPrice);
            this.config = this.getConfig(this.data);
            this.chart = new Chart(document.getElementById(this.canvasId).getContext("2d"), this.config);
            return this.chart;
        }

        getData(coin, initialPrice) {
            const data = {
                labels: [new Date().toLocaleTimeString()],
                datasets: [
                    {
                        label: `${coin.Name} Price (USD) - ${initialPrice}`,
                        data: [initialPrice],
                        borderColor: getRandomRGB(),
                        backgroundColor: "rgba(78, 161, 255, 0.2)",
                        fill: true,
                        tension: 0.3,
                        pointRadius: 2,
                        borderWidth: 2,
                    },
                ],
            };
            return data;
        }

        getConfig(data) {
            const config = {
                    type: "line",
                    data: data,
                    options: {
                        animation: false,
                        responsive: true,
                        scales: {
                        x: {
                            type: "category",
                            ticks: {
                            color: "#0a0a0aff",
                            },
                        },
                        y: {
                            beginAtZero: false,
                            ticks: {
                            color: "#0a0a09ff",
                            },
                        },
                        },
                        plugins: {
                        legend: {
                            labels: {
                            color: "#090909ff",
                            },
                        },
                        },
                    },
                };
            return config;
        }
    }
})();

// // Example usage of the ConfigChart class
// document.addEventListener("DOMContentLoaded", () => {
//     const coin = { Id: "bitcoinChart", Name: "Bitcoin" };
//     const initialPrice = 50000;

//     // Create a canvas element dynamically
//     const canvas = document.createElement("canvas");
//     canvas.id = coin.Id;
//     document.body.appendChild(canvas);

//     // Instantiate and create the chart
//     const bitcoinChart = new ConfigChart(coin, initialPrice);
//     bitcoinChart.createChart();
// });
