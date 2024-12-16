<script>
	import { goto } from '$app/navigation';
	import { User } from '$lib/stores/auth';
	import { writable } from 'svelte/store';
	import { deleteCookie, getCookie } from '../../utils/cookie.util';
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';

	const users = writable([]);

	const handleLogout = () => {
		deleteCookie('token');
		deleteCookie('user');
		User.set(null);
		goto('/login');
	};

	onMount(() => {
		async function fetchUsers() {
			const response = await fetch('http://localhost:3000/users', {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${getCookie('token')}`
				}
			});
			if (response.ok) {
				users.set(await response.json());
			} else {
				console.error('Failed to fetch users');
			}
		}
		fetchUsers();
		const interval = setInterval(fetchUsers, 5000);

		return () => clearInterval(interval);
	});
</script>

<main class="d-flex flex-column align-itmes-center justify-content-center w-100 text-light">
	<div class="chat-card d-flex mx-auto border rounded w-50 h-75" in:fade={{duration: 500}}>
		<div
			class="friends d-flex flex-column justify-content-start align-items-center bg-dark rounded-start"
		>
			<div class="friends-header d-flex flex-column align-items-center gap-3 pb-5 pt-3">
				<div
					class="dropdown-avatar avatar rounded-circle bg-light d-flex justify-content-center align-items-center p-1 text-dark"
				>
					{$User?.username[0].toUpperCase()}
					<div class="dropdown-menu bg-transparent border-0">
						<!-- svelte-ignore a11y_consider_explicit_label -->
						<button
							on:click={handleLogout}
							type="button"
							class="btn btn-danger d-flex align-items-center justify-content-center w-75"
						>
						Sign Out
						</button>
					</div>
				</div>
				<i class="bi bi-people-fill text-white"></i>
			</div>
			<div class="d-flex flex-column align-items-center gap-3">
				{#each $users.filter(user => user.email !== $User?.email) as user}
					<div
						class="avatar users rounded-circle bg-light d-flex justify-content-center align-items-center p-1 text-dark"
					>
						{user.username[0].toUpperCase()}
					</div>
				{/each}
			</div>
		</div>

		<div class="conversations border-start d-flex flex-column bg-dark p-3">
			<div class="conversations-header d-flex gap-3 align-items-center">
				<input class="rounded bg-dark border p-1 text-light" type="text" placeholder="Search..." />
				<i class="bi bi-chat-fill"></i>
			</div>
			<div></div>
		</div>

		<div class="chat-window d-flex flex-column justify-content-between bg-body-tertiary w-100 h-100 text-dark">
			<div class="chat-header border-bottom d-flex justify-content-between align-items-center p-3">
				<div></div>
				<i class="bi bi-three-dots-vertical"></i>
			</div>
			<div class="chat-footer border-top d-flex justify-content-between align-items-center p-3">
				<div class="d-flex gap-3 align-items-center w-100">
					<input class="w-75 rounded bg-light border px-3 py-2" type="text" placeholder="Type a message..." />
					<i class="bi bi-send-fill"></i>
				</div>
				<div class="d-flex gap-3 align-items-center">
					<i class="bi bi-emoji-smile"></i>
					<i class="bi bi-mic-fill"></i>
				</div>
			</div>
		</div>
	</div>
</main>

<style>
	:global(*) {
		margin: 0;
		padding: 0;
		box-sizing: border-box;
	}

	:global(body) {
		font-family: 'Montserrat', serif;
	}

	main {
		height: 100vh;
	}

	.dropdown-avatar {
		position: relative;
		display: inline-block;
	}

	.dropdown-menu {
		display: none;
		position: absolute;
		top: 40px;
		z-index: 1;
		height: auto;
		align-items: start;
		justify-content: center;
	}

	.dropdown-avatar:hover .dropdown-menu {
		display: flex;
	}

	.avatar {
		width: 40px;
		height: 40px;
		cursor: pointer;
		box-shadow:
			rgba(0, 0, 0, 0.25) 0px 54px 55px,
			rgba(0, 0, 0, 0.12) 0px -12px 30px,
			rgba(0, 0, 0, 0.12) 0px 4px 6px,
			rgba(0, 0, 0, 0.17) 0px 12px 13px,
			rgba(0, 0, 0, 0.09) 0px -3px 5px;
	}

	.users:hover {
		transform: scale(1.1);
		overflow-y: auto;
	}

	.friends {
		width: 15%;
	}

	.conversations {
		width: 50%;
		overflow-x: auto;
	}

	.chat-header, .chat-footer {
		height: 70px;
	}

	input {
		outline: none;
		border: none;
	}

	input:focus {
		border: 1px solid !important;
	}
</style>
