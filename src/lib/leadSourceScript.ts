// Lead-source tracking script. Mirrors the one running in the main
// WordPress site's site-wide header at zoedew.com, with two adaptations
// for chips.zoedew.com:
//   1. COOKIE_DOMAIN is set to ".zoedew.com" so cookies are shared with
//      the WordPress site (zoedew.com + chips.zoedew.com).
//   2. The whole IIFE is wrapped in a typeof window check so it is a
//      no-op during server-side rendering. Strictly speaking the script
//      only runs in <head> on the client, but the guard makes that
//      explicit and survives any future SSR changes.
//
// The script writes the cb_* cookies that the registration form reads
// at submit-time. See RegistrationForm.tsx for the read side.

export const LEAD_SOURCE_SCRIPT = `
(function () {
  if (typeof window === "undefined" || typeof document === "undefined") return;
  "use strict";
  /* -------------------- CONFIG -------------------- */
  var COOKIE_DAYS = 365;
  var SESSION_GAP_MS = 30 * 60000;
  // Shared with the main WordPress site so attribution survives across
  // zoedew.com and chips.zoedew.com.
  var COOKIE_DOMAIN = ".zoedew.com";
  /* -------------------- HELPERS -------------------- */
  function sanitize(v) {
    return String(v == null ? "" : v)
      .replace(/[;,]/g, " ")
      .replace(/[\\r\\n\\t]+/g, " ")
      .replace(/\\s+/g, " ")
      .trim();
  }
  function getCookie(name) {
    var m = document.cookie.match("(?:^|; )" + name + "=([^;]*)");
    return m ? m[1] : null;
  }
  function setCookie(name, value, days) {
    var d = new Date();
    d.setTime(d.getTime() + days * 86400000);
    var c = name + "=" + sanitize(value) +
            ";expires=" + d.toUTCString() + ";path=/;SameSite=Lax";
    if (COOKIE_DOMAIN) c += ";domain=" + COOKIE_DOMAIN;
    if (location.protocol === "https:") c += ";Secure";
    document.cookie = c;
  }
  function param(name) {
    var m = location.search.match("[?&]" + name + "=([^&]*)");
    return m ? decodeURIComponent(m[1].replace(/\\+/g, " ")) : "";
  }
  function hostOf(url) {
    try { return new URL(url).hostname.replace(/^www\\./, "").toLowerCase(); }
    catch (e) { return ""; }
  }
  function nice(s) {
    var map = {
      facebook: "Facebook", instagram: "Instagram", linkedin: "LinkedIn",
      tiktok: "TikTok", youtube: "YouTube", twitter: "X / Twitter",
      x: "X / Twitter", pinterest: "Pinterest", reddit: "Reddit",
      threads: "Threads", snapchat: "Snapchat", google: "Google",
      bing: "Bing", yahoo: "Yahoo", newsletter: "Newsletter", email: "Email"
    };
    if (!s) return "";
    var key = s.toLowerCase();
    if (map[key]) return map[key];
    return s.charAt(0).toUpperCase() + s.slice(1);
  }
  var SOURCE_ALIASES = {
    ig: "instagram", insta: "instagram", instagram: "instagram",
    fb: "facebook", facebook: "facebook", meta: "facebook",
    yt: "youtube", youtube: "youtube",
    li: "linkedin", linkedin: "linkedin",
    tt: "tiktok", tiktok: "tiktok",
    x: "twitter", twitter: "twitter",
    pin: "pinterest", pinterest: "pinterest"
  };
  function canon(s) {
    var k = (s || "").toLowerCase().trim();
    return SOURCE_ALIASES[k] || k;
  }
  /* -------------------- LOOKUPS -------------------- */
  var SEARCH_ENGINES = {
    google: "Google", bing: "Bing", "yahoo": "Yahoo",
    duckduckgo: "DuckDuckGo", ecosia: "Ecosia", baidu: "Baidu",
    yandex: "Yandex", "search.brave": "Brave", startpage: "Startpage",
    aol: "AOL", "ask.com": "Ask"
  };
  var SOCIAL_DOMAINS = {
    "facebook.com": "Facebook", "fb.com": "Facebook", "fb.me": "Facebook",
    "instagram.com": "Instagram",
    "linkedin.com": "LinkedIn", "lnkd.in": "LinkedIn",
    "t.co": "X / Twitter", "twitter.com": "X / Twitter", "x.com": "X / Twitter",
    "tiktok.com": "TikTok",
    "youtube.com": "YouTube", "youtu.be": "YouTube",
    "pinterest.com": "Pinterest", "pin.it": "Pinterest",
    "reddit.com": "Reddit",
    "threads.net": "Threads", "threads.com": "Threads",
    "snapchat.com": "Snapchat"
  };
  var SOCIAL_NAMES = ["facebook", "instagram", "linkedin", "tiktok",
    "youtube", "twitter", "pinterest", "reddit", "threads", "snapchat"];
  function searchEngine(host) {
    for (var key in SEARCH_ENGINES) {
      if (host.indexOf(key) > -1) return SEARCH_ENGINES[key];
    }
    return "";
  }
  function socialPlatform(host) {
    if (SOCIAL_DOMAINS[host]) return SOCIAL_DOMAINS[host];
    for (var key in SOCIAL_DOMAINS) {
      if (host === key || host.indexOf("." + key) > -1) return SOCIAL_DOMAINS[key];
    }
    return "";
  }
  function isSocialName(name) {
    for (var i = 0; i < SOCIAL_NAMES.length; i++) {
      if (name.indexOf(SOCIAL_NAMES[i]) > -1) return true;
    }
    return false;
  }
  /* -------------------- CLASSIFY -------------------- */
  function classify() {
    var mediumRaw   = (param("utm_medium") || "").trim();
    var medium      = mediumRaw.toLowerCase();
    var mediumCanon = canon(medium);
    var source      = (param("utm_source") || "").trim();
    var sourceL     = canon(source);
    var campaign    = param("utm_campaign");
    var gclid    = param("gclid") || param("gbraid") || param("wbraid");
    var msclkid  = param("msclkid");
    var fbclid   = param("fbclid");
    var ttclid   = param("ttclid");
    var liFatId  = param("li_fat_id");
    var twclid   = param("twclid");
    var refHost  = hostOf(document.referrer || "");
    var selfHost = location.hostname.replace(/^www\\./, "").toLowerCase();
    if (medium || source) {
      var paidSignal = /cpc|ppc|paid/.test(medium) ||
                       gclid || msclkid || ttclid || liFatId || twclid;
      var socialHit = isSocialName(mediumCanon) || isSocialName(sourceL);
      var platform = "";
      if (isSocialName(sourceL))           platform = nice(sourceL);
      else if (isSocialName(mediumCanon))  platform = nice(mediumCanon);
      var channel;
      var detail = platform || nice(sourceL) || "";
      if (/email|newsletter|e-mail/.test(medium) || /email|newsletter/.test(sourceL)) {
        channel = "Email";
      } else if (/^(paidsearch|paid-search|paid_search|sem|google_?ads)$/.test(medium)) {
        channel = "Paid Search";
      } else if (/paid.?social|social.?paid|paidsocial/.test(medium)) {
        channel = "Paid Social";
      } else if (/^(display|banner|cpm|gdn|programmatic)$/.test(medium)) {
        channel = "Display";
      } else if (/affiliate|partner/.test(medium)) {
        channel = "Affiliate";
      } else if (socialHit) {
        channel = paidSignal ? "Paid Social" : "Organic Social";
      } else if (/^(social|social-media|social_media|organic-social|organic_social|sm)$/.test(medium)) {
        channel = paidSignal ? "Paid Social" : "Organic Social";
      } else if (/^referral$/.test(medium)) {
        channel = "Referral";
      } else if (/^(organic|organic-search)$/.test(medium)) {
        channel = "Organic Search";
      } else if (/^(cpc|ppc|paid)/.test(medium)) {
        channel = "Paid Search";
      } else {
        channel = "Referral";
        if (!detail) detail = mediumRaw;
      }
      return { channel: channel, detail: detail || campaign || "", campaign: campaign };
    }
    if (gclid)   return { channel: "Paid Search",    detail: "Google",      campaign: campaign };
    if (msclkid) return { channel: "Paid Search",    detail: "Microsoft",   campaign: campaign };
    if (ttclid)  return { channel: "Paid Social",    detail: "TikTok",      campaign: campaign };
    if (liFatId) return { channel: "Paid Social",    detail: "LinkedIn",    campaign: campaign };
    if (twclid)  return { channel: "Paid Social",    detail: "X / Twitter", campaign: campaign };
    if (fbclid)  return { channel: "Organic Social", detail: "Facebook",    campaign: campaign };
    if (!refHost || refHost === selfHost) {
      return { channel: "Direct", detail: "", campaign: "" };
    }
    var eng = searchEngine(refHost);
    if (eng) return { channel: "Organic Search", detail: eng, campaign: "" };
    var soc = socialPlatform(refHost);
    if (soc) return { channel: "Organic Social", detail: soc, campaign: "" };
    return { channel: "Referral", detail: refHost, campaign: "" };
  }
  /* -------------------- RUN -------------------- */
  var classified = null;
  function getClassified() {
    if (!classified) classified = classify();
    return classified;
  }
  /* FIRST TOUCH */
  var ft;
  if (getCookie("cb_channel")) {
    ft = {
      channel:  getCookie("cb_channel") || "Direct",
      detail:   getCookie("cb_channel_detail") || "",
      campaign: getCookie("cb_campaign") || "",
      landing:  getCookie("cb_landing_page") || ""
    };
  } else {
    var c = getClassified();
    ft = { channel: c.channel, detail: c.detail, campaign: c.campaign || "", landing: location.pathname };
  }
  setCookie("cb_channel", ft.channel, COOKIE_DAYS);
  if (ft.detail)   setCookie("cb_channel_detail", ft.detail, COOKIE_DAYS);
  if (ft.campaign) setCookie("cb_campaign", ft.campaign, COOKIE_DAYS);
  if (ft.landing)  setCookie("cb_landing_page", ft.landing, COOKIE_DAYS);
  /* LAST TOUCH */
  var now = Date.now();
  var lastSeen = parseInt(getCookie("cb_lt_seen") || "0", 10);
  var newSession = !lastSeen || (now - lastSeen > SESSION_GAP_MS);
  var refNow = hostOf(document.referrer || "");
  var selfNow = location.hostname.replace(/^www\\./, "").toLowerCase();
  var internalNav = refNow && refNow === selfNow;
  var haveLT = getCookie("cb_lt_channel");
  var lt;
  if ((newSession && !internalNav) || !haveLT) {
    var lc = getClassified();
    lt = { channel: lc.channel, detail: lc.detail };
    setCookie("cb_lt_channel", lt.channel, COOKIE_DAYS);
    setCookie("cb_lt_channel_detail", lt.detail, COOKIE_DAYS);
  } else {
    lt = { channel: haveLT, detail: getCookie("cb_lt_channel_detail") || "" };
  }
  setCookie("cb_lt_seen", String(now), COOKIE_DAYS);
  window.cbLeadSource = { firstTouch: ft, lastTouch: lt };
})();
`;
