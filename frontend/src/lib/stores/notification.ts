import { writable } from 'svelte/store';

interface Notification {
	message: string;
	type: NotificationType;
	isVisible: boolean;
}

const defaultNotification: Notification = { message: '', type: 'info', isVisible: false };

export const notification = writable<Notification>(defaultNotification);

export function showNotification(
	message: string,
	duration: number = 3000
): void {
	notification.set({ message, isVisible: true });

	setTimeout(() => {
		notification.set(defaultNotification);
	}, duration);
}
