import posthog from "posthog-js";

const client =
  posthog.init("phc_gCxHEpXWtELrIJxf4O1rBStWonKXJJxHA9iQBN3UEu0", {
    api_host: "https://eu.posthog.com",
    autocapture: false,
    capture_pageview: true,
  }) || posthog;

export { client as posthog };
