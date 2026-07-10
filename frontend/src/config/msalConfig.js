import { PublicClientApplication, LogLevel } from "@azure/msal-browser";

const TENANT_ID = process.env.REACT_APP_AZURE_TENANT_ID || "";
const CLIENT_ID = process.env.REACT_APP_AZURE_CLIENT_ID || "";

export const msalConfig = {
  auth: {
    clientId: CLIENT_ID,
    authority: TENANT_ID ? `https://login.microsoftonline.com/${TENANT_ID}` : "https://login.microsoftonline.com/common",
    redirectUri: window.location.origin,
    postLogoutRedirectUri: window.location.origin,
    navigateToLoginRequestUrl: false,
  },
  cache: {
    cacheLocation: "sessionStorage",
    storeAuthStateInCookie: true,
  },
  system: {
    loggerOptions: {
      logLevel: LogLevel.Warning,
    },
  },
};

export const loginRequest = {
  scopes: ["User.Read", "openid", "profile", "email"],
};

export const msalInstance = new PublicClientApplication(msalConfig);

// Initialize MSAL immediately
let msalInitPromise = null;
export const ensureMsalInitialized = () => {
  if (!msalInitPromise) {
    msalInitPromise = msalInstance.initialize();
  }
  return msalInitPromise;
};

export const isMicrosoftConfigured = () => Boolean(TENANT_ID && CLIENT_ID);
