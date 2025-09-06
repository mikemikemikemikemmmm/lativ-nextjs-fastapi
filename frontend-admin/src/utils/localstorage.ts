import { TOKEN_KEY } from "./constant";

export function setToken(value: string) {
    localStorage.setItem(TOKEN_KEY, value);
    window.dispatchEvent(new Event('tokenChange'));
}

export function removeToken() {
    localStorage.removeItem(TOKEN_KEY);
    window.dispatchEvent(new Event('tokenChange'));
}
