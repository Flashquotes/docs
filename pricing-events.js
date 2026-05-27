(function () {
  if (typeof window === "undefined") return;

  const SURFACE = "docs";
  const PRICE_VERSION = "2026-05-27";
  const PLAN_NAMES = ["starter", "plus", "pro", "scale"];
  const PLAN_PRICES = {
    starter: { monthly: 0, yearly: 0 },
    plus: { monthly: 59, yearly: 49 },
    pro: { monthly: 119, yearly: 99 },
    scale: { monthly: 249, yearly: 199 },
  };

  const CTA_PLAN_BY_PAGE = {
    "/forms/conditional-logic": "plus",
    "/forms/booking": "plus",
    "/forms/lead-intake": "pro",
    "/leads/instant-pricing": "pro",
    "/api-reference/introduction": "scale",
  };

  const CTA_HREF_PATTERN = /app\.flashquotes\.com\/settings\/(plans|billing)/i;
  const PRICING_PAGE_PATH = "/settings/plans";

  let lastViewedPath = null;

  function ph() {
    return window.posthog;
  }

  function currentPath() {
    return window.location.pathname.replace(/\/+$/, "") || "/";
  }

  function base() {
    return {
      surface: SURFACE,
      page_path: currentPath(),
      billing_period: "monthly",
      visitor_plan: null,
      price_version: PRICE_VERSION,
    };
  }

  function fireViewed() {
    const path = currentPath();
    if (path !== PRICING_PAGE_PATH) return;
    if (lastViewedPath === path) return;
    lastViewedPath = path;
    ph()?.capture("pricing_page_viewed", {
      ...base(),
      plans_displayed: ["starter", "plus", "pro", "scale"],
    });
  }

  function planFromText(text) {
    if (!text) return null;
    const normalized = text.trim().toLowerCase();
    for (const name of PLAN_NAMES) {
      const re = new RegExp("(^|\\W)" + name + "(\\W|$)");
      if (re.test(normalized)) return name;
    }
    return null;
  }

  function planFromAncestors(el) {
    let node = el;
    let depth = 0;
    while (node && depth < 6) {
      const text = node.textContent || "";
      if (text.length < 200) {
        const plan = planFromText(text);
        if (plan) return plan;
      }
      node = node.parentElement;
      depth++;
    }
    return null;
  }

  function ctaTypeFromText(text) {
    const t = (text || "").toLowerCase();
    if (t.includes("trial")) return "start_trial";
    if (t.includes("contact")) return "contact_sales";
    if (t.includes("sign up") || t.includes("signup")) return "signup";
    return "upgrade";
  }

  function handleCtaClick(anchor) {
    const href = anchor.getAttribute("href") || "";
    if (!CTA_HREF_PATTERN.test(href)) return;
    const pagePlan = CTA_PLAN_BY_PAGE[currentPath()];
    const plan = pagePlan || planFromAncestors(anchor) || "plus";
    const text = (anchor.textContent || "").trim();
    ph()?.capture("pricing_cta_clicked", {
      ...base(),
      plan_name: plan,
      plan_price: PLAN_PRICES[plan]?.monthly ?? null,
      cta_text: text,
      cta_type: ctaTypeFromText(text),
    });
  }

  function handlePlanCardClick(target) {
    if (currentPath() !== PRICING_PAGE_PATH) return;
    // Mintlify Card renders title text inside the card; match by walking up
    // looking for an ancestor whose own text is short and contains a plan name.
    let node = target;
    let depth = 0;
    while (node && depth < 8) {
      const text = (node.textContent || "").trim();
      if (text.length > 0 && text.length < 160) {
        const plan = planFromText(text);
        if (plan) {
          ph()?.capture("pricing_plan_highlighted", {
            ...base(),
            plan_name: plan,
            plan_price: PLAN_PRICES[plan].monthly,
            trigger: "click",
          });
          return;
        }
      }
      node = node.parentElement;
      depth++;
    }
  }

  document.addEventListener("click", (e) => {
    const target = e.target;
    if (!(target instanceof Element)) return;
    const anchor = target.closest("a[href]");
    if (anchor) {
      handleCtaClick(anchor);
      return;
    }
    handlePlanCardClick(target);
  });

  const origPushState = history.pushState;
  history.pushState = function () {
    const result = origPushState.apply(this, arguments);
    setTimeout(() => {
      if (currentPath() !== lastViewedPath) lastViewedPath = null;
      fireViewed();
    }, 0);
    return result;
  };
  const origReplaceState = history.replaceState;
  history.replaceState = function () {
    const result = origReplaceState.apply(this, arguments);
    setTimeout(() => {
      if (currentPath() !== lastViewedPath) lastViewedPath = null;
      fireViewed();
    }, 0);
    return result;
  };
  window.addEventListener("popstate", () => {
    setTimeout(() => {
      if (currentPath() !== lastViewedPath) lastViewedPath = null;
      fireViewed();
    }, 0);
  });

  function init(attempts) {
    if (!ph()) {
      if (attempts > 50) return;
      setTimeout(() => init(attempts + 1), 100);
      return;
    }
    ph().register_for_session({ pricing_surface: SURFACE });
    fireViewed();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => init(0));
  } else {
    init(0);
  }
})();
