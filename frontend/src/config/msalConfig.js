import { PublicClientApplication } from "@azure/msal-browser";

const TENANT_ID = process.env.REACT_APP_AZURE_TENANT_ID || "";
const CLIENT_ID = process.env.REACT_APP_AZURE_CLIENT_ID || "";

export const msalConfig = {
  auth: {
    clientId: CLIENT_ID,
    authority: TENANT_ID ? `https://login.microsoftonline.com/${TENANT_ID}` : "https://login.microsoftonline.com/common",
    redirectUri: window.location.origin,
  },
  cache: {
    cacheLocation: "sessionStorage",
    storeAuthStateInCookie: true,
  },
};

export const loginRequest = {
  scopes: ["User.Read", "openid", "profile", "email"],
};

export const msalInstance = new PublicClientApplication(msalConfig);

export const isMicrosoftConfigured = () => Boolean(TENANT_ID && CLIENT_ID);
