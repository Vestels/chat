import { writable } from 'svelte/store';
import { getCookie } from '../../utils/cookie.util';

export interface User {
    _id: string;
    email: string;
    username: string;
    password: string;
    status: string;
    online: boolean;
    profilePicture: string;
}

const storedUser = getCookie('user');
export const User = writable<User | null>(storedUser ? JSON.parse(storedUser) : null);