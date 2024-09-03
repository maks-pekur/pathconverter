import { DAY, COOKIE_TYPES, COOKIE_NAMES } from "./constants.js";
import { cookieManager } from "./on-cookies.js";

function encodeData(data) {
  const base64Payload = btoa(JSON.stringify(data));
  const signature = window.location.host;
  return `${base64Payload}.${signature}`;
}

function decodeData(token) {
  return atob(token);
}

function setCookie(name, value, ttl) {
  cookieManager.set(name, value, ttl)
}

function getUserType() {
  return cookieManager.get("_userType")
}

function generateToken(baseString = "", length = 24) {
const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
let token = baseString;
for (let i = 0; i < length - baseString.length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    token += charset[randomIndex];
}
return token;
}

function getMetaTags() {
  const metaTags = document.getElementsByTagName('meta');

  let baseString = '';
  for (let i = 0; i < metaTags.length; i++) {
      const name = metaTags[i].getAttribute('name');
      if (name && (name === 'description' || name === 'keywords' || name === 'title')) {
          baseString += metaTags[i].getAttribute('content');
      }
  }

  return baseString.slice(0, 12); 
}

function updatePreference(cookiePreference, prefName, isActive, cookieName) {
  if (!COOKIE_TYPES.includes(prefName)) throw new Error("Unsupported cookie type!");
  
  const index = cookiePreference.indexOf(prefName);
  const baseString = getMetaTags();
  let iteration;
  let tokenName = "o"; 

  switch (cookieName) {
    case COOKIE_NAMES.essential:
      iteration = 4;
      tokenName += "ess"
      break;
    case COOKIE_NAMES.performance:
      iteration = 2;
      tokenName += "perf"
      break;
    case COOKIE_NAMES.advertising:
      iteration = 1;
      tokenName += "adv"
      break;
    default:
      break;
  }

  if (isActive) {
      if (index === -1) {
          cookiePreference.push(prefName);
      }
      for (let i = 1; i <= iteration; i++) {
          const token = generateToken(baseString);
          setCookie(`${tokenName}${i}`, token, DAY / 2);
      }
  } else {
      if (index > -1) {
          cookiePreference.splice(index, 1);
      }
      for (let i = 1; i <= iteration; i++) {
          cookieManager.remove(`${tokenName}${i}`);
      }
  }
}

function updateCookiePreferences(essential, performance, advertising) {
  cookieManager.remove("_cookie_preference");

  const cookiePreference = [];

  updatePreference(cookiePreference, "essential", essential, COOKIE_NAMES.essential);
  updatePreference(cookiePreference, "performance", performance, COOKIE_NAMES.performance);
  updatePreference(cookiePreference, "advertising", advertising, COOKIE_NAMES.advertising);
  
  setCookie("_cookie_preference", cookiePreference.join(", "), DAY);
  setCookie("_cookies_accepted", "true", DAY);
}

export {
  encodeData,
  decodeData,
  setCookie,
  getUserType,
  generateToken,
  getMetaTags,
  updateCookiePreferences
}