(function initializeGptBanner(window, document) {
  const GPT_SCRIPT_URL = 'https://securepubads.g.doubleclick.net/tag/js/gpt.js';
  const BANNER_DIV_ID = 'gpt-banner';
  const BANNER_STYLE_ID = 'gpt-banner-styles';
  const AD_UNIT_PATH = '/8804/teste/qa1';
  const REFRESH_INTERVAL_MS = 30000;
  const BANNER_STYLES = `
    #${BANNER_DIV_ID} {
      position: fixed;
      z-index: 9999;
      bottom: 0;
      left: 50%;
      display: flex;
      width: 728px;
      height: 90px;
      justify-content: center;
      align-items: center;
      transform: translateX(-50%);
    }

    @media (max-width: 767px) {
      #${BANNER_DIV_ID} {
        right: 20px;
        bottom: 20px;
        left: auto;
        width: 300px;
        height: 250px;
        transform: none;
      }
    }
  `;

  window.googletag = window.googletag || { cmd: [] };

  if (!document.querySelector(`script[src="${GPT_SCRIPT_URL}"]`)) {
    const gptScript = document.createElement('script');
    gptScript.async = true;
    gptScript.src = GPT_SCRIPT_URL;
    gptScript.onerror = () => {
      console.error('The Google Publisher Tag script could not be loaded.');
    };
    document.head.appendChild(gptScript);
  }

  function initializeSlot() {
    let bannerElement = document.getElementById(BANNER_DIV_ID);

    if (!bannerElement) {
      bannerElement = document.createElement('div');
      bannerElement.id = BANNER_DIV_ID;
      bannerElement.setAttribute('aria-label', 'Publicidade');
      document.body.appendChild(bannerElement);
    }

    if (bannerElement.dataset.gptBannerInitialized === 'true') {
      return;
    }

    bannerElement.dataset.gptBannerInitialized = 'true';

    if (!document.getElementById(BANNER_STYLE_ID)) {
      const styleElement = document.createElement('style');
      styleElement.id = BANNER_STYLE_ID;
      styleElement.textContent = BANNER_STYLES;
      document.head.appendChild(styleElement);
    }

    window.googletag.cmd.push(() => {
      const sizeMapping = window.googletag
        .sizeMapping()
        .addSize([768, 0], [728, 90])
        .addSize([0, 0], [300, 250])
        .build();

      const slot = window.googletag.defineSlot(
        AD_UNIT_PATH,
        [
          [728, 90],
          [300, 250],
        ],
        BANNER_DIV_ID,
      );

      if (!slot) {
        bannerElement.dataset.gptBannerInitialized = 'false';
        console.error(`GPT could not define the ad slot "${AD_UNIT_PATH}".`);
        return;
      }

      slot
        .defineSizeMapping(sizeMapping)
        .addService(window.googletag.pubads());

      window.googletag.enableServices();
      window.googletag.display(BANNER_DIV_ID);

      window.setInterval(() => {
        window.googletag.cmd.push(() => {
          window.googletag.pubads().refresh([slot]);
        });
      }, REFRESH_INTERVAL_MS);
    });
  }

  if (document.body) {
    initializeSlot();
  } else {
    document.addEventListener('DOMContentLoaded', initializeSlot, { once: true });
  }
})(window, document);
