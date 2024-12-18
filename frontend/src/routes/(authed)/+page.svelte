<script lang="ts">
	import { goto } from '$app/navigation';
	import { User } from '$lib/stores/auth';
	import { writable } from 'svelte/store';
	import { deleteCookie, getCookie } from '../../utils/cookie.util';
	import { onDestroy, onMount } from 'svelte';
	import { fade, fly } from 'svelte/transition';
	import { io } from 'socket.io-client';
	import { showNotification } from '$lib/stores/notification';

	const apiBaseUrl = 'http://localhost:3000';

	const users = writable<User[]>([]);
	let socket: ReturnType<typeof io> | null = null;
	let profilePicture: File | null = null;
	let previewProfilePicture: string | null = null;

	let menu = writable(false);
	let profileSettings = writable(false);
	let confirmation = writable(false);

	$: isSaveDisabled = !newUsername && !newEmail && !newPassword && !confirmPassword;
	$: isDeleteDisabled =
		!$updateName && !$updateEmail && !$updatePassword && !profilePicture && !previewProfilePicture;

	let isPasswordsMatch = writable(true);

	let newUsername = '';
	let newEmail = '';
	let newPassword = '';
	let confirmPassword = '';

	let updateName = writable(false);
	let updateEmail = writable(false);
	let updatePassword = writable(false);

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
			socket = io(`${apiBaseUrl}`, {
				query: { userId },
				reconnection: true
			});

			socket.on('connect', () => {
				console.log('Connected to server');
			});

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

			socket.on('user-deleted', (userId) => {
				users.update((currenstUsers) => {
					return currenstUsers.filter((user) => user._id !== userId);
				});
			});

			socket.on('profile-picture-uploaded', (updatedUser) => {
				users.update((currentUsers) => {
					const userIndex = currentUsers.findIndex((user) => user._id === updatedUser._id);
					if (userIndex !== -1) {
						currentUsers[userIndex] = updatedUser;
						if ($User._id === updatedUser._id) {
							User.set(updatedUser);
							document.cookie = `user=${JSON.stringify(updatedUser)}; path=/`;
						}
					}
					return currentUsers;
				});
			});
		}

		async function fetchUsers() {
			const response = await fetch(`${apiBaseUrl}/users`, {
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
		showNotification('See you soon!');
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

		const response = await fetch(`${apiBaseUrl}/users/${$User?._id}`, {
			method: 'PATCH',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${getCookie('token')}`
			},
			body: JSON.stringify(newValues)
		});
		if (response.ok) {
			showNotification('Profile updated successfully');
			const updatedUser = await response.json();
			User.set(updatedUser);
			resetProfileChanges();
			isPasswordsMatch.set(true);
		} else {
			console.error('Failed to update userí');
		}
	};

	const deleteUser = async () => {
		await deleteProfilePicture();
		const response = await fetch(`${apiBaseUrl}/users/${$User?._id}`, {
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
			showNotification('Profile deleted successfully');
		} else {
			console.error('Failed to delete profile');
		}
	};

	onDestroy(() => {
		if (socket) {
			socket.disconnect();
		}

		if (previewProfilePicture) {
			URL.revokeObjectURL(previewProfilePicture);
		}
	});

	let fileInput: HTMLInputElement;

	const triggerFileInput = () => {
		if (fileInput) {
			fileInput.click();
		}
	};

	const handleProfilePictureChange = (event: Event) => {
		const target = event.target as HTMLInputElement;
		if (previewProfilePicture) {
			URL.revokeObjectURL(previewProfilePicture);
		}
		profilePicture = null;
		previewProfilePicture = null;

		if (!target.files || target.files.length !== 1) {
			if (fileInput) fileInput.value = '';
			return;
		}
		profilePicture = target.files[0];
		previewProfilePicture = URL.createObjectURL(profilePicture);
	};

	const deleteProfilePicture = async () => {
		try {
			if ($User?.profilePicture) {
				const response = await fetch(`${apiBaseUrl}/users/${$User._id}/pfp`, {
					method: 'DELETE',
					headers: {
						Authorization: `Bearer ${getCookie('token')}`
					}
				});
				if (response.ok) {
					showNotification('Profile picture deleted successfully');
				} else {
					console.error('Failed to delete profile picture');
				}
			}
		} catch (error) {
			console.error(error);
		}
	};

	const uploadProfilePicture = async () => {
		const formData = new FormData();
		if (profilePicture) {
			deleteProfilePicture();

			formData.append('file', profilePicture);

			const response = await fetch(`${apiBaseUrl}/users/${$User?._id}/pfp`, {
				method: 'PUT',
				headers: {
					Authorization: `Bearer ${getCookie('token')}`
				},
				body: formData
			});

			if (response.ok) {
				URL.revokeObjectURL(previewProfilePicture!);
				previewProfilePicture = null;
				showNotification('Profile picture uploaded successfully');
				const updatedUser = await response.json();
				User.set(updatedUser);
				profilePicture = null;
				previewProfilePicture = null;
				document.cookie = `user=${JSON.stringify(updatedUser)}; path=/`;
				if (fileInput) fileInput.value = '';
			} else {
				console.error('Failed to upload profile picture');
			}
		}
	};

	const cancelProfilePictureChange = () => {
		if (previewProfilePicture) {
			URL.revokeObjectURL(previewProfilePicture);
			previewProfilePicture = null;
		}
		profilePicture = null;
		if (fileInput) fileInput.value = '';
	};
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
						class="avatar p-1 pfp users rounded-circle bg-dark d-flex justify-content-center align-items-center text-light"
						class:online={user.online === true}
					>
						{#if user.profilePicture}
							<img src={`${apiBaseUrl}${user.profilePicture}`} alt="pfp" />
						{:else}
							{user.username[0].toUpperCase()}
						{/if}
						<div class="tooltip bg-black text-light rounded px-2 py-1">
							<div class="text-capitalize">{user.username}</div>
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
						class="btn btn-outline-light btn-sm d-flex align-items-center justify-content-center w-75"
						on:click={() => menu.set(false)}
					>
						Close
					</button>
					<!-- svelte-ignore a11y_consider_explicit_label -->
					<button
						type="button"
						class="btn btn-secondary btn-sm d-flex align-items-center justify-content-center w-75"
						data-bs-toggle="button"
						on:click={() => profileSettings.set(!$profileSettings)}
					>
						Profile
					</button>
					<button
						on:click={handleLogout}
						type="button"
						class="btn btn-danger btn-sm d-flex align-items-center justify-content-center w-75"
					>
						Sign Out
					</button>
				</div>
			{/if}

			<div class="conversations-header d-flex gap-3 justify-content-center align-items-center">
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
					class="delete-confirm rounded bg-dark p-3 gap-5 d-flex flex-column align-items-center justify-content-center text-white text-center w-50 h-75"
					in:fade={{ duration: 100 }}
					out:fade={{ duration: 100 }}
				>
					<h5>Are you sure want to <b>DELETE</b> your Profile?</h5>
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
							class="profile-pfp rounded-circle d-flex align-items-center justify-content-center bg-dark text-white"
						>
							{#if previewProfilePicture}
								<div
									class="profile-pfp rounded-circle d-flex align-items-center justify-content-center bg-dark text-white"
								>
									<img src={previewProfilePicture} alt="pfp" />
								</div>
							{:else if $User?.profilePicture}
								<div
									class="profile-pfp rounded-circle d-flex align-items-center justify-content-center bg-dark text-white"
								>
									<img src={`${apiBaseUrl}${$User?.profilePicture}`} alt="pfp" />
								</div>
							{:else}
								{$User?.username[0].toUpperCase()}
							{/if}
						</div>
						{#if $User?.profilePicture && !previewProfilePicture}
							<button
								type="button"
								class="btn btn-sm btn-danger w-25"
								transition:fade={{ duration: 300 }}
								on:click={deleteProfilePicture}>Remove</button
							>
						{/if}
						<button
							type="button"
							class="btn btn-sm btn-light"
							on:click={triggerFileInput}
							transition:fade={{ duration: 300 }}
						>
							<i class="bi bi-camera-fill"></i> Change Picture
						</button>
						<input
							on:blur={() => updateUser()}
							type="text"
							class="border py-2 px-3 w-75 rounded"
							placeholder="Set your status..."
							bind:value={$User!.status}
						/>
						<input
							bind:this={fileInput}
							type="file"
							name="file"
							accept="image/*"
							class="d-none"
							on:change={handleProfilePictureChange}
						/>
						{#if profilePicture}
							<button
								type="button"
								class="btn btn-sm btn-warning w-50"
								transition:fade={{ duration: 300 }}
								on:click={cancelProfilePictureChange}>Cancel</button
							>
							<button
								type="button"
								class="btn btn-sm btn-primary w-50 mb-3"
								transition:fade={{ duration: 300 }}
								on:click={uploadProfilePicture}>Upload</button
							>
						{/if}
						<div class="d-flex flex-column gap-3 w-75 mb-5 mt-3">
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
								class="btn btn-warning btn-sm w-50"
								transition:fade={{ duration: 300 }}
								on:click={() => {
									resetProfileChanges(), isPasswordsMatch.set(true);
								}}>Cancel</button
							>
						{/if}
						<button
							type="submit"
							class="btn btn-success btn-sm w-50"
							disabled={isSaveDisabled}
							transition:fade={{ duration: 300 }}>Save Changes</button
						>
						<button
							type="button"
							class="btn btn-secondary btn-sm w-50"
							transition:fade={{ duration: 300 }}
							on:click={() => {
								resetProfileChanges(), profileSettings.set(false);
							}}>Close Profile</button
						>
						{#if isDeleteDisabled}
							<button
								type="button"
								class="btn btn-danger btn-sm w-50"
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

	.profile-pfp {
		width: 150px;
		height: 150px;
		border: none;
		outline: none;
		font-size: 3rem;
	}

	.profile-pfp img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		border-radius: 100%;
	}

	.pfp img {
		width: 100% !important;
		height: 100% !important;
		object-fit: cover;
		border-radius: 50%;
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
		width: 60px;
		height: 60px;
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

	.tooltip {
		visibility: hidden;
		position: absolute;
		width: max-content;
		left: 120%;
		z-index: 999;
		opacity: 0;
		transition: opacity 0.5s;
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
		position: fixed;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		overflow: hidden;
		z-index: 999;
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