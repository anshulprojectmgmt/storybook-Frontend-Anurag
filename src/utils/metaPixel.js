const pixelId = import.meta.env.VITE_META_PIXEL_ID;
let initialized = false;
let lastPageView = "";

function loadMetaPixel() {
  if (!pixelId || typeof window === "undefined") {
    return false;
  }

  if (!window.fbq) {
    const fbq = function () {
      fbq.callMethod
        ? fbq.callMethod.apply(fbq, arguments)
        : fbq.queue.push(arguments);
    };

    window.fbq = fbq;
    window._fbq = fbq;
    fbq.push = fbq;
    fbq.loaded = true;
    fbq.version = "2.0";
    fbq.queue = [];

    const script = document.createElement("script");
    script.async = true;
    script.src = "https://connect.facebook.net/en_US/fbevents.js";

    const firstScript = document.getElementsByTagName("script")[0];
    firstScript.parentNode.insertBefore(script, firstScript);
  }

  if (!initialized) {
    window.fbq("init", pixelId);
    initialized = true;
  }

  return true;
}

export function trackMetaEvent(eventName, params = {}) {
  if (!loadMetaPixel() || typeof window.fbq !== "function") {
    return;
  }

  window.fbq("track", eventName, params);
}

export function trackMetaPageView(path) {
  if (path && path === lastPageView) {
    return;
  }

  lastPageView = path || "";
  trackMetaEvent("PageView");
}

export function getStorybookEventParams({
  bookId,
  bookTitle,
  value,
  category = "Personalized Storybook",
} = {}) {
  return {
    content_ids: bookId ? [bookId] : undefined,
    content_name: bookTitle || "Personalized Storybook",
    content_category: category,
    content_type: "product",
    currency: "INR",
    value: Number(value) || 0,
    num_items: 1,
  };
}
