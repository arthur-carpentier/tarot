// Feuille Google Sheets qui sert de base de données.
export const SHEET_ID = "1BRs8pRcSWjVSaukepufJvhKZOXczsXSur61r2X0nDK8";

export const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/edit`;

// URL du script Google Apps Script déployé en "Web App" qui permet
// d'ajouter des parties (voir apps-script/README.md pour le déploiement).
// Peut être surchargée dans l'application (stockée en localStorage).
export const DEFAULT_APPS_SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycbyHZQyB15AefPhcjfYbslJJt1xh3L5RiWfYklsWEvt9gfl5mQYFpAonh6EoCusriVMt/exec";

const APPS_SCRIPT_URL_KEY = "tarot.appsScriptUrl";

export function getAppsScriptUrl() {
    return localStorage.getItem(APPS_SCRIPT_URL_KEY) || DEFAULT_APPS_SCRIPT_URL;
}

export function setAppsScriptUrl(url) {
    if (url) {
        localStorage.setItem(APPS_SCRIPT_URL_KEY, url.trim());
    } else {
        localStorage.removeItem(APPS_SCRIPT_URL_KEY);
    }
}
