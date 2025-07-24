const Display = (function () {
  return class Display {

    static loadingTime = 5;
    static imagesNumber = 8; //max 10

    static Loading() {
      const loadingText = document.getElementById("loading-text");
      const loadingImage = document.getElementById("loading-img");
      const body = document.body;

      let imageIndex = 0;
      let pageLoadPercentage = 0;
      const symbols = ["ETH", "BTC", "UNI", "1INCH", "SRM", "ANT", "POLY", "REP", "CND", "ATOM"];

      // Loading Text:
      const setLoadingText = setInterval(() => {
        pageLoadPercentage += 2;

        if (!body.classList.contains("stop-scrolling")) {
          body.classList.add("stop-scrolling");
        }

        if (pageLoadPercentage > 99) {
          body.classList.remove("stop-scrolling");
          clearInterval(setLoadingText);
        }

        if (loadingText) {
          loadingText.textContent = `${pageLoadPercentage}%`;
        }
      }, (Display.loadingTime * 1000) / 100);

      // Loading Images:
      const setLoadingImage = setInterval(() => {
        imageIndex++;
        if (pageLoadPercentage > 99) {
          clearInterval(setLoadingImage);
        }

        const symbol = symbols[imageIndex];
        if (symbol && loadingImage) {
          loadingImage.setAttribute("src", `https://www.exodus.com/img/logos/${symbol}.svg`);
        }
      }, (Display.loadingTime * 1000) / (Display.imagesNumber - 1));

      // Remove loading screen:
      setTimeout(() => {
        const loadingSection = document.getElementById("loading");
        if (loadingSection) {
          loadingSection.remove();
        }
      }, Display.loadingTime * 1000);
    }
  };
})();
