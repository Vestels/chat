<script lang="ts">
	import { goto } from '$app/navigation';
	import { User } from '$lib/stores/auth';
	import { writable } from 'svelte/store';
	import { deleteCookie, getCookie } from '../../utils/cookie.util';
	import { onDestroy, onMount } from 'svelte';
	import { fade, fly } from 'svelte/transition';
	import { io } from 'socket.io-client';

	const users = writable<User[]>([]);

	let menu = writable(false);
	let profileSettings = writable(false);
	let confirmation = writable(false);

	$: isSaveDisabled = !newUsername && !newEmail && !newPassword && !confirmPassword;
	$: isDeleteDisabled = !$updateName && !$updateEmail && !$updatePassword;

	let isPasswordsMatch = writable(true);

	let newUsername = '';
	let newEmail = '';
	let newPassword = '';
	let confirmPassword = '';

	let updateName = writable(false);
	let updateEmail = writable(false);
	let updatePassword = writable(false);

	let socket: ReturnType<typeof io> | null = null;

	const resetProfileChanges = async () => {
		newUsername = '';
		newEmail = '';
		newPassword = '';
		confirmPassword = '';
		updateName.set(false);
		updateEmail.set(false);
		updatePassword.set(false);
	};

	onMount(() => {
		const userId = $User?._id;
		if (userId && !socket) {
			socket = io('http://localhost:3000', {
				query: { userId },
				reconnection: true,
			});

			// User connected
			socket.on('connect', () => {
				console.log('Connected to server');
			});

			// User disconnected
			socket.on('disconnect', () => {
				console.log('Disconnected from server');
			});

			socket.on('userStatus', (data) => {
				const { userId, online } = data;
				users.update((currentUsers) => {
					const userToUpdate = currentUsers.find((user) => user._id === userId);
					if (userToUpdate) {
						userToUpdate.online = online;
					}
					return currentUsers;
				});
			});
			// User regsitered
			socket.on('new-user', (newUser) => {
				$users = [...$users, newUser];
			});

			socket.on('user-updated', (updatedUser) => {
				users.update((currentUsers) => {
					const userIndex = currentUsers.findIndex((user) => user._id === updatedUser._id);
					if (userIndex !== -1) {
						currentUsers[userIndex] = updatedUser;
					}
					return currentUsers;
				});
			});

			socket.on('user-deleted',(userId) => {
				users.update((currenstUsers) => {
					return currenstUsers.filter((user) => user._id !== userId);
				})
			})
		}

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
	});

	const handleLogout = () => {
		deleteCookie('token');
		deleteCookie('user');
		User.set(null);
		goto('/login');
	};

	const updateUser = async () => {
		const newValues: { [key: string]: string } = {};
		if (newUsername) newValues.username = newUsername;
		if (newEmail) newValues.email = newEmail;
		if (newPassword === confirmPassword && newPassword && confirmPassword) {
			newValues.password = newPassword;
		} else {
			isPasswordsMatch.set(false);
		}
		if ($User?.status) {
			newValues.status = $User?.status;
		} else {
			newValues.status = '';
		}

		const response = await fetch(`http://localhost:3000/users/${$User?._id}`, {
			method: 'PATCH',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${getCookie('token')}`
			},
			body: JSON.stringify(newValues)
		});
		if (response.ok) {
			const updatedUser = await response.json();
			User.set(updatedUser);
			resetProfileChanges();
			isPasswordsMatch.set(true);
		} else {
			console.error('Failed to update userí');
		}
	};

	const deleteUser = async () => {
		const response = await fetch(`http://localhost:3000/users/${$User?._id}`, {
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${getCookie('token')}`
			}
		});
		if (response.ok) {
			deleteCookie('token');
			deleteCookie('user');
			User.set(null);
			goto('/login');
		} else {
			console.error('Failed to delete profile');
		}
	};

	onDestroy(() => {
		if (socket) {
			socket.disconnect();
		}
	});
</script>

<main class="d-flex flex-column align-itmes-center justify-content-center w-100 text-light">
	<div class="chat-card d-flex mx-auto border-0 rounded w-50 h-75" in:fade={{ duration: 500 }}>
		<div
			class="friends d-flex flex-column justify-content-start align-items-center bg-dark rounded-start"
		>
			<div class="friends-header d-flex flex-column align-items-center gap-3 pb-5 pt-3">
				<div class="bg-dark d-flex justify-content-center align-items-center p-1 text-light">
					<!-- svelte-ignore a11y_no_static_element_interactions -->
					<!-- svelte-ignore a11y_click_events_have_key_events -->
					<i
						class="bi bi-list menu-icon"
						on:click={() => {
							menu.set(!$menu);
						}}
					></i>
				</div>

				<i class="bi bi-people-fill text-white"></i>
			</div>
			<div class="d-flex flex-column align-items-center gap-3">
				{#each $users
					.filter((user) => user.email !== $User?.email)
					.sort((a, b) => (b.online ? 1 : 0) - (a.online ? 1 : 0)) as user}
					<div
						class="avatar users rounded-circle bg-dark d-flex justify-content-center align-items-center p-1 text-light"
						class:online={user.online === true}
					>
						{user.username[0].toUpperCase()}
						<div class="tooltip bg-black text-light rounded bg-opacity-75 p-2">
							<div>{user.username}</div>
							{#if user.status}
								<div class="opacity-50">{user.status}</div>
							{/if}
						</div>
					</div>
				{/each}
			</div>
		</div>

		<div class="conversations border-start d-flex flex-column bg-dark p-3">
			{#if $menu}
				<div
					class="dropdown-menu bg-dark d-flex flex-column justify-content-start align-items-center bg-dark gap-3 pt-5 pb-4 w-100 h-100"
					in:fly={{ y: -100 }}
					out:fly={{ y: -100 }}
				>
					<h3 class="text-light">Menu</h3>
					<!-- svelte-ignore a11y_consider_explicit_label -->
					<button
						type="button"
						class="btn btn-outline-secondary d-flex align-items-center justify-content-center w-75"
						on:click={() => menu.set(false)}
					>
						Close
					</button>
					<!-- svelte-ignore a11y_consider_explicit_label -->
					<button
						type="button"
						class="btn btn-secondary d-flex align-items-center justify-content-center w-75"
						data-bs-toggle="button"
						on:click={() => profileSettings.set(!$profileSettings)}
					>
						Profile
					</button>
					<button
						on:click={handleLogout}
						type="button"
						class="btn btn-danger d-flex align-items-center justify-content-center w-75"
					>
						Sign Out
					</button>
				</div>
			{/if}

			<div class="conversations-header d-flex gap-3 align-items-center">
				<input
					class="rounded bg-dark border px-3 py-1 text-light"
					type="text"
					placeholder="Search..."
				/>
				<i class="bi bi-chat-fill"></i>
			</div>
			<div></div>
		</div>

		<div
			class="chat-window d-flex rounded-end flex-column justify-content-between bg-body-tertiary w-100 h-100 text-dark"
		>
			{#if $confirmation}
				<div
					class="delete-confirm rounded-end w-50 bg-dark p-3 gap-5 d-flex flex-column align-items-center justify-content-center text-white text-center w-100"
					in:fade={{ duration: 100 }}
					out:fade={{ duration: 100 }}
				>
					<p>Are you sure want to <b>DELETE</b> your Profile?</p>
					<p><b>Cannot be reverted.</b></p>
					<div class="d-flex gap-3 w-75">
						<button
							type="button"
							class="btn btn-secondary w-50"
							on:click={() => {
								confirmation.set(false);
							}}>Back</button
						>
						<button type="button" class="btn btn-danger w-50" on:click={deleteUser}>Delete</button>
					</div>
				</div>
			{/if}

			<div class="chat-header border-bottom d-flex justify-content-between align-items-center p-3">
				<div></div>
				<i class="bi bi-three-dots-vertical"></i>
			</div>
			<div class="chat-footer border-top d-flex justify-content-between align-items-center p-3">
				<div class="d-flex gap-3 align-items-center w-100">
					<input
						class="w-75 rounded bg-light border px-3 py-2"
						type="text"
						placeholder="Type a message..."
					/>
					<i class="bi bi-send-fill"></i>
				</div>
				<div class="d-flex gap-3 align-items-center">
					<i class="bi bi-emoji-smile"></i>
					<i class="bi bi-mic-fill"></i>
				</div>
			</div>

			{#if $profileSettings}
				<div
					class="profile rounded text-dark d-flex flex-column align-items-center justiy-content-evenly p-5 gap-3 bg-body-tertiary w-100"
					in:fly={{ duration: 500, x: -100 }}
					out:fly={{ duration: 500, x: -100 }}
				>
					<form
						on:submit={updateUser}
						class="d-flex flex-column align-items-center justify-content-center gap-3 w-100"
					>
						<div
							class="rounded-circle d-flex align-items-center justify-content-center bg-dark text-white mb-1"
							style="cursor: default; height: 80px; width:80px; font-size: 1.5rem;"
						>
							{$User?.username[0].toUpperCase()}
						</div>
						<input
							on:blur={() => updateUser()}
							type="text"
							class="border py-2 px-3 w-75 rounded"
							placeholder="Set your status..."
							bind:value={$User!.status}
						/>
						<input type="file" name="file" class="mb-3" />
						<div class="d-flex flex-column gap-3 w-75 mb-5">
							<div class="d-flex justify-content-between align-items-center">
								<div><b class="me-2">Name:</b>{$User?.username}</div>
								<button
									type="button"
									class="btn btn-secondary btn-sm"
									data-bs-toggle="button"
									on:click={() => {
										updateName.set(!$updateName), (newUsername = '');
									}}>change</button
								>
							</div>
							{#if $updateName}
								<input
									bind:value={newUsername}
									type="text"
									placeholder="New Username"
									class="border py-2 px-3 w-100 rounded"
									required
									minlength="4"
									maxlength="20"
									transition:fade={{ duration: 300 }}
								/>
							{/if}
							<div class="d-flex justify-content-between align-items-center">
								<div><b class="me-2">E-mail:</b>{$User?.email}</div>
								<button
									type="button"
									class="btn btn-secondary btn-sm"
									data-bs-toggle="button"
									on:click={() => {
										updateEmail.set(!$updateEmail), (newEmail = '');
									}}>change</button
								>
							</div>
							{#if $updateEmail}
								<input
									bind:value={newEmail}
									type="email"
									placeholder="New Email"
									class="border py-2 px-3 w-100 rounded"
									required
									transition:fade={{ duration: 300 }}
								/>
							{/if}
							<div class="d-flex justify-content-between align-items-center">
								<div><b class="me-2">Password:</b>**********</div>
								<button
									type="button"
									class="btn btn-secondary btn-sm"
									data-bs-toggle="button"
									on:click={() => {
										updatePassword.set(!$updatePassword),
											(newPassword = ''),
											(confirmPassword = '');
									}}>change</button
								>
							</div>
							{#if $updatePassword}
								<input
									bind:value={newPassword}
									type="password"
									placeholder="New Password"
									class="border py-2 px-3 w-100 rounded"
									required
									minlength="8"
									transition:fade={{ duration: 300 }}
								/>
								<input
									bind:value={confirmPassword}
									type="password"
									placeholder="Confirm Password"
									class="border py-2 px-3 w-100 rounded"
									required
									minlength="8"
									transition:fade={{ duration: 300 }}
								/>
							{/if}
							{#if !$isPasswordsMatch}
								<div class="alert alert-danger alert-dismissible fade show" role="alert">
									Passwords do not match!
									<button
										type="button"
										class="btn-close"
										data-bs-dismiss="alert"
										aria-label="Close"
										on:click={() => {
											isPasswordsMatch.set(true);
										}}
									></button>
								</div>
							{/if}
						</div>

						{#if !isSaveDisabled}
							<button
								type="button"
								class="btn btn-warning w-50"
								transition:fade={{ duration: 300 }}
								on:click={() => {
									resetProfileChanges(), isPasswordsMatch.set(true);
								}}>Cancel</button
							>
						{/if}
						<button
							type="submit"
							class="btn btn-success w-50"
							disabled={isSaveDisabled}
							transition:fade={{ duration: 300 }}>Save Changes</button
						>
						<button
							type="button"
							class="btn btn-secondary w-50"
							transition:fade={{ duration: 300 }}
							on:click={() => {
								resetProfileChanges(), profileSettings.set(false);
							}}>Close Profile</button
						>
						{#if isDeleteDisabled}
							<button
								type="button"
								class="btn btn-danger w-50"
								transition:fade={{ duration: 300 }}
								on:click={() => {
									confirmation.set(true);
								}}>Delete Profile</button
							>
						{/if}
					</form>
				</div>
			{/if}
		</div>
	</div>
</main>

<style>
	main {
		height: 100vh;
	}

	.chat-card {
		position: relative;
		display: inline-block;
		box-shadow: rgba(0, 0, 0, 0.35) 0px 5px 15px;
	}

	.menu-icon {
		font-size: 1.5rem;
		cursor: pointer;
	}

	.dropdown-menu {
		display: none;
		position: absolute;
		left: 0;
		top: 0;
		z-index: 1;
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
		outline: 3px solid #666666;
	}

	.online {
		outline: 3px solid #01b119;
	}

	.avatar:hover {
		transform: scale(1.1);
	}

	/* .users {
		position: relative;
		display: inline-block;
	} */

	.tooltip {
		visibility: hidden;
		position: absolute;
		width: max-content;
		left: 120%;
		z-index: 999;
		opacity: 0;
		transition: opacity 0.5s;
		text-transform: capitalize;
	}

	.users:hover .tooltip {
		visibility: visible;
		opacity: 1;
	}

	.friends {
		width: 15%;
		position: relative;
		display: inline-block;
		z-index: 3;
	}

	.conversations {
		width: 50%;
		overflow: hidden;
		position: relative;
		display: inline-block;
	}

	.chat-window {
		position: relative;
		overflow-y: scroll;
	}

	.delete-confirm {
		position: absolute;
		min-height: 100%;
		z-index: 2;
	}

	.profile {
		position: absolute;
		z-index: 1;
		min-height: 100%;
	}

	.chat-header,
	.chat-footer {
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
