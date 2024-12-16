import { writable } from 'svelte/store';
import { getCookie } from '../../utils/cookie.util';

interface User {
    username: string;
    email: string;
}

const storedUser = getCookie('user');
export const User = writable<User | null>(storedUser ? JSON.parse(storedUser) : null);