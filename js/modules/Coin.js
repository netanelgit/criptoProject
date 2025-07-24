
class CoinMarketData {
  constructor(usd = -1, eur = -1, ils = -1, marketCapacity = -1) {
    this.CurrentPrice = { USD: usd, EUR: eur, ILS: ils };
    this.MarketCap = marketCapacity;
    this.isUpdate = usd > 0 || eur > 0 || ils > 0;
  }

  static displayNumber(num) {
    let rNumber = CoinMarketData.roundNumber(num);
    return rNumber.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  static roundNumber(num) {
    return Math.round((parseFloat(num) + Number.EPSILON) * 100) / 100;
  }
}

class Coin {
  static coinsSelected = 0;
  static Coins = [];

  constructor(coinMeta, coinMarketData = new CoinMarketData()) {
    this.ID = coinMeta.id;
    this.Symbol = coinMeta.symbol.toUpperCase();
    this.Name = coinMeta.name.toUpperCase();
    this.MarketData = coinMarketData;
    this.isSelected = false;
    this.isHide = false;
  }

  static popupModal(coinID) {
    const modal = document.getElementById("modal");
    const modalCoinItems = document.getElementById("modal-coin-items");
    modalCoinItems.innerHTML = "";

    for (const coin of Coin.Coins) {
      if (coin.isSelected) {
        modalCoinItems.appendChild(coin.generateModalItem());
      }
    }

    document.getElementById("modal-close").value = coinID;
    modal.style.display = "flex";
  }

  generateModalItem() {
    const div = document.createElement("div");
    div.className = "modal__coin-item";
    div.innerHTML = `
      <h2>${this.Symbol}</h2>
      <img src="https://www.exodus.com/img/logos/${this.Symbol}.svg" alt="">
      <div class="btn__modal-toggle">
        <label class="btn__toggle-label">
          <div class="btn__toggle">
            <input class="btn__toggle-state" type="checkbox" name="check" value="check" checked>
            <div class="btn__toggle-indicator"></div>
          </div>
        </label>
      </div>
    `;

    const btnToggle = div.querySelector(".btn__toggle-state");
    btnToggle.addEventListener("change", () => {
      this.toggleModalItem(btnToggle);
    });

    this.ModalItemElement = div;
    return div;
  }

  generateCardElement() {
    const container = document.createElement("div");
    container.id = `cardID-${this.Symbol}`;
    container.className = "card__container";

    const checked = this.isSelected ? "checked" : "";

    container.innerHTML = `
      <div class="card__flip">
        <div class="card__front">
          <img class="card__logo" src="https://www.exodus.com/img/logos/${this.Symbol}.svg" alt="coin-logo">
          <h3 class="card__text-name">${this.Name}</h3>
          <h4 class="card__text-symbol">${this.Symbol}</h4>
          <div class="btn__card-select"></div>
          <div class="btn__card-toggle">
            <label class="btn__toggle-label">
              <div class="btn__toggle">
                <input class="btn__toggle-state" type="checkbox" name="check" value="${this.ID}" ${checked}>
                <div class="btn__toggle-indicator"></div>
              </div>
            </label>
          </div>
          <div class="btn__card-info">
            <i class="fas fa-info-circle"></i>
          </div>
        </div>
        <div class="card__back">
          <div class="card__progress-bar"></div>
          <div class="btn__card-flip">
            <i class="fas fa-undo"></i>
          </div>
          <div class="card__counter-container">
            <i class="card__counter-symbol fas fa-shekel-sign fa-2x"></i>
            <div class="card__counter-value counter-shekel" data-target="7500">${this.MarketData.CurrentPrice.ILS}</div>
          </div>
          <div class="card__counter-container">
            <i class="card__counter-symbol fas fa-dollar-sign fa-2x"></i>
            <div class="card__counter-value counter-dollar" data-target="7500">${this.MarketData.CurrentPrice.USD}</div>
          </div>
          <div class="card__counter-container">
            <i class="card__counter-symbol fas fa-euro-sign fa-2x"></i>
            <div class="card__counter-value counter-euro" data-target="7500">${this.MarketData.CurrentPrice.EUR}</div>
          </div>
        </div>
      </div>
    `;

    const btnInfo = container.querySelector(".btn__card-info");
    btnInfo.addEventListener("click", () => this.getCoinMarketData());

    const btnFlip = container.querySelector(".btn__card-flip");
    btnFlip.addEventListener("click", () => {
      container.querySelector(".card__flip").classList.remove("card__flipped");
    });

    const btnToggle = container.querySelector(".btn__toggle-state");
    btnToggle.addEventListener("change", () => this.toggleSelected(btnToggle));
    
    

    this.CardElement = container;
    return container;
  }

  async getCoinMarketData() {
    try {
      const flip = this.CardElement.querySelector(".card__flip");
      flip.classList.add("card__flipped");
      // console.log(`Fetching data for ${this.ID}...`);
      

      if (!this.MarketData.isUpdate) {
        this.CardElement.querySelectorAll(".card__counter-container").forEach(el => el.classList.add("hide"));

        this.MarketData = await Coin.AJAX.getCoinMarketDataByID(this.ID);

        const setTarget = (cls, val) => {
          const el = this.CardElement.querySelector(cls);
          el.setAttribute("data-target", val);
        };

        setTarget(".counter-shekel", this.MarketData.CurrentPrice.ILS);
        setTarget(".counter-dollar", this.MarketData.CurrentPrice.USD);
        setTarget(".counter-euro", this.MarketData.CurrentPrice.EUR);

        this.CardElement.querySelectorAll(".card__counter-container").forEach(el => el.classList.remove("hide"));

        this.CardElement.querySelectorAll(".card__counter-value").forEach(cardElement => {
          cardElement.innerHTML = "0";
          const updateCounter = () => {
            const target = CoinMarketData.roundNumber(cardElement.getAttribute("data-target"));
            let c = +cardElement.innerHTML;
            const increment = target / 100;
            if (c < target) {
              cardElement.innerHTML = Math.ceil(c + increment);
              setTimeout(updateCounter, 20);
            } else {
              cardElement.innerHTML = CoinMarketData.displayNumber(target);
            }
          };
          updateCounter();
        });

        setTimeout(() => {
          this.MarketData.isUpdate = false;
        }, 2 * 60 * 1000);
      }
    } catch (error) {
      alert(error);
      console.warn(error);
    }
  }

  toggleModalItem(btnToggle) {
    this.isSelected = btnToggle.checked;
    
    Coin.coinsSelected += this.isSelected ? 1 : -1;
    // console.log(Coin.coinsSelected);
  }

  toggleSelected(btnToggle) {
    if (btnToggle.checked) {
      if (Coin.coinsSelected < 5) {
        this.isSelected = true;
        Coin.coinsSelected++;
      } else {
        btnToggle.checked = false;
        Coin.popupModal(this.ID);
      }
    } else {
      this.isSelected = false;
      Coin.coinsSelected--;
    }
  }

  static sortByPriceHigh(a, b) {
    return b.MarketData.CurrentPrice.USD - a.MarketData.CurrentPrice.USD;
  }

  static sortByPriceLow(a, b) {
    return a.MarketData.CurrentPrice.USD - b.MarketData.CurrentPrice.USD;
  }

  static sortByMarketCapacityHigh(a, b) {
    return b.MarketData.MarketCap - a.MarketData.MarketCap;
  }

  static sortByMarketCapacityLow(a, b) {
    return a.MarketData.MarketCap - b.MarketData.MarketCap;
  }

  static AJAX = class {
    static pAjaxGetDataByURL(urlPath) {
      return fetch(urlPath).then(res => {
        if (!res.ok) throw new Error("Network error");
        return res.json();
      });
    }

    static async getCoinMarketDataByID(coinID) {
      const data = await Coin.AJAX.pAjaxGetDataByURL(
        `https://api.coingecko.com/api/v3/coins/${coinID}`
      );
      const prices = data.market_data.current_price;
      const marketCap = data.market_data.market_cap.usd;
      return new CoinMarketData(prices.usd, prices.eur, prices.ils, marketCap);
    }
  };
}
