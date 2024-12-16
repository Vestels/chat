export function getCookie(name: string): string | null {
    if (typeof document !== 'undefined') {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
    }
    return null;
}

export function setCookie(name: string, value: string, days: number = 7): void {
	const expires = new Date();
	expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000); // default 7 nap
	const expiresStr = `expires=${expires.toUTCString()}`;
	document.cookie = `${name}=${value};${expiresStr};path=/`;
}

export function deleteCookie(name: string): void {
	document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/`;
}
