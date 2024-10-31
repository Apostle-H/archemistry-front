export function checkApiAvailablity(): boolean {
    return !(globalThis.Telegram == null || globalThis.Telegram.WebApp == null || globalThis.Telegram.WebApp.initData == "")
}