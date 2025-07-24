/// <reference path="modules/Display.js" />
/// <reference path="modules/Coin.js" />

//--------------------Arguments-------------------
//Coins Data:
let coinsListAllByAPI = []; // Coins All By API

// Btn:
const btnHome = document.getElementById("btnHome");
const btnAbout = document.getElementById("btnAbout");
const btnLiveReport = document.getElementById("btnLiveReport");
const modalClose = document.getElementById("modal-close");

// Section Title & subTitle:
const sectionTitle = document.getElementById("titleSection");
const sectionSubTitle = document.getElementById("subTitleSection");

//Main
const sectionDynamic = document.getElementById("main-dynamic");

//coins - Home
let coinsSectionHome;

// Live Report
const chartsToUpdate = [];
let liveReportInterval;



// ----------------Functions-------------------

document.addEventListener("DOMContentLoaded", async function () {
  try {
    Display.Loading();
    
    registerEvents();
    
    await getCoinsStartupData();
    
    setHome();
    
  } catch (error) {
    // alert("Error: Load Startup Data!!");
    console.warn(error);
  }
});

async function getCoinsStartupData() {
  try {
    let promiseCoinsAll = Coin.AJAX.pAjaxGetDataByURL(Config.coinsListAPI);
    coinsListAllByAPI = await promiseCoinsAll;

    for (const coinID of Config.coinsListDisplay) {
      let coinMeta = coinsListAllByAPI.find((c) => coinID === c.id);

      if (coinMeta) {
        let coin = new Coin(coinMeta);
        Coin.Coins.push(coin);
      }
    }

    // console.log(Coin.Coins.length);
  } catch (e) {
    console.log(e);
  }
}

function registerEvents() {
  btnHome.addEventListener("click", setHome);
  btnLiveReport.addEventListener("click", setLiveReport);
  btnAbout.addEventListener("click", setAbout);

  document.addEventListener("input", function (event) {
    if (event.target && event.target.id === "filter") {
      const inputValue = event.target.value;

      if (!filterCoins(inputValue)) {
        removeFilterCoin();
      }
    }
  });

  modalClose.addEventListener("click", function () {
    const modal = document.getElementById("modal");
    modal.style.display = "none";

    const coinID = modalClose.value;
    const coin = Coin.Coins.find((c) => coinID === c.ID);

    if (Coin.coinsSelected < 5) {
      coin.isSelected = true;
      Coin.coinsSelected++;
    } else {
      coin.isSelected = false;
    }

    setHome();
  });
}

function removeFilterCoin() {
  const cards = document.querySelectorAll(".card__container");
  cards.forEach((card) => card.classList.remove("hide"));
}

function filterCoins(coinSymbol) {
  let result = false;

  if (coinSymbol.length >= 3) {
    const cards = document.querySelectorAll(".card__container");

    cards.forEach((card) => {
      const coinID = card.id.split("-")[1];

      if (coinSymbol.toUpperCase() === coinID) {
        card.classList.remove("hide");
        result = true;
      } else {
        card.classList.add("hide");
      }
    });
  }

  return result;
}

function setHome() {
  clearLiveReportUpdates();
  
  const modal = document.getElementById("modal");
  modal.style.display = "none";

  sectionTitle.textContent = "Home";
  sectionSubTitle.textContent = "100+ Cryptocurrency Assets";
  if (sectionTitle.textContent !== "Live Report") {
    if (window.liveReportInterval) {
      clearInterval(window.liveReportInterval);
    }
  }

  sectionDynamic.innerHTML = "";

  coinsSectionHome = document.createElement("div");
  coinsSectionHome.id = "coins__all";
  coinsSectionHome.className = "coins__flex-grid";

  coinsSectionHome.innerHTML = `
    <input type="text" id="filter" class="btn__search" placeholder="Search" />
    <div id="card-list-container" class="card__list hide"></div>
  `;

  const coinsListContainer = coinsSectionHome.querySelector("#card-list-container");
  
  Coin.Coins.forEach((coin) => {
    const coinElement = coin.generateCardElement();
    coinsListContainer.appendChild(coinElement);
  });
  
  coinsListContainer.classList.remove("hide");
  coinsSectionHome.classList.remove("hide");
  sectionDynamic.appendChild(coinsSectionHome);
}

function setAbout() {
  clearLiveReportUpdates();

  const modal = document.getElementById("modal");
  modal.style.display = "none";

  sectionTitle.textContent = "About";
  sectionSubTitle.textContent = "Cryptocurrency Overview";

  sectionDynamic.innerHTML = `
    <div class="about-text">
      <p class="about-paragraph">
        This application provides an overview of the cryptocurrency market,
        showing live data fetched from an external API to keep you up-to-date.
      </p>
      <p class="about-paragraph">
        Icons used in this project are sourced from 
        <a href="https://www.exodus.com/" target="_blank" class="about-link">Exodus</a>.
      </p>
      <p class="about-paragraph">
        Cryptocurrency data is retrieved from the 
        <a href="https://www.coingecko.com/en/api" target="_blank" class="about-link">CoinGecko API</a>.
      </p>
      <p class="about-paragraph">
        the charts are powered by
        <a href="https://www.chartjs.org/" target="_blank" class="about-link">Chart.js</a>.
      </p>
    </div>
  `;
}

async function setLiveReport() {
  const modal = document.getElementById("modal");
  modal.style.display = "none";

  sectionTitle.textContent = "Live Report";
  sectionSubTitle.textContent = "Real-time change analysis";

  sectionDynamic.innerHTML = "";

  const liveReportSection = document.createElement("div");
  liveReportSection.id = "liveReportSection";
  liveReportSection.className = "liveReport";

  const selectedCoins = [];
  Coin.Coins.forEach(coin => {
    if (coin.isSelected) {
      selectedCoins.push(coin);
      // console.log(`Coin ${coin.Symbol} is now selected.`);
    }
  });
  // console.log(selectedCoins);
  
  // If no coins are selected
  if (selectedCoins.length === 0) {
    liveReportSection.innerHTML = "<p>No coins selected for live report.</p>";
    sectionDynamic.appendChild(liveReportSection);
    return;
  }

  for (const coin of selectedCoins) {

    const canvas = document.createElement("canvas");
    canvas.id = `chart-${coin.ID}`;
    canvas.style.maxWidth = "400px";
    canvas.style.marginTop = "10px";

    const container = document.createElement("div");
    container.className = "coin-graph-container";
    // container.appendChild(coinItem);
    container.appendChild(canvas);

    liveReportSection.appendChild(container);

    sectionDynamic.appendChild(liveReportSection);
  
    const initialPrice = await fetchCoinPrice(coin.ID);

    const chart = createLiveChart(canvas.id, coin, initialPrice);
    chartsToUpdate.push({ chart, coinId: coin.ID });
  }
  
  startLiveReportUpdates();
}

async function fetchCoinPrice(coinId) {
  try {
    // console.log(`Fetching price for coin: ${coinId}`);
    
    const response = await fetch(`https://api.coingecko.com/api/v3/coins/${coinId}`);
    if (!response.ok) throw new Error("Network response was not ok");
    const data = await response.json();

    return data.market_data.current_price.usd || 0;
  } catch (error) {
    console.error("Failed to fetch coin price:", error);
    return 0;
  }
}

function getRandomRGB() {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    return `rgb(${r}, ${g}, ${b})`;
}

function createLiveChart(canvasId, coin, initialPrice) {
  const ctx = document.getElementById(canvasId).getContext("2d");

  const data = {
    labels: [new Date().toLocaleTimeString()],
    datasets: [{
      label: `${coin.Name} Price (USD) - ${initialPrice}`,
      data: [initialPrice],
      borderColor: getRandomRGB(),
      backgroundColor: "rgba(78, 161, 255, 0.2)",
      fill: true,
      tension: 0.3,
      pointRadius: 2,
      borderWidth: 2,
    }]
  };

  const config = {
    type: 'line',
    data: data,
    options: {
      animation: false,
      responsive: true,
      scales: {
        x: {
          type: 'category',
          ticks: {
            color: '#0a0a0aff'
          }
        },
        y: {
          beginAtZero: false,
          ticks: {
            color: '#0a0a09ff'
          }
        }
      },
      plugins: {
        legend: {
          labels: {
            color: '#090909ff'
          }
        }
      }
    }
  };

  const chart = new Chart(ctx, config);
  return chart;
}

function startLiveReportUpdates() {
  liveReportInterval = setInterval(async () => {
    for (const { chart, coinId } of chartsToUpdate) {
      const price = await fetchCoinPrice(coinId);
      const now = new Date().toLocaleTimeString();

      chart.data.labels.push(now);
      chart.data.datasets[0].data.push(price);
      chart.data.datasets[0].label = `${coinId} Price (USD) - ${price}`;
      if (price < chart.data.datasets[0].data[chart.data.datasets[0].data.length - 2]) {
        chart.options.plugins.legend.labels.color = 'red'; 
      }
      else {
        chart.options.plugins.legend.labels.color = 'green';
      }

      if (chart.data.labels.length > 20) {
        chart.data.labels.shift();
        chart.data.datasets[0].data.shift();
      }

      chart.update('none');
    }
  }, 10000);
}

function clearLiveReportUpdates() {
  if (liveReportInterval) {
    clearInterval(liveReportInterval);
    liveReportInterval = null;
  }
}