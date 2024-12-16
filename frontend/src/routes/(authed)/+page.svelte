<script lang="ts">
	import { goto } from '$app/navigation';
	import { User } from '$lib/stores/auth';
	import { writable, type Writable } from 'svelte/store';
	import { deleteCookie, getCookie } from '../../utils/cookie.util';
	import { onMount } from 'svelte';
	import { fade, fly } from 'svelte/transition';

	const users = writable <User[]>([]);

	let profileSettings = false;
	let confirmation = false;

	let updatedUser = writable<User | null>(null);

	$: isSaveDisabled = !newUsername && !newEmail && !newPassword && !confirmPassword;
	$: isDeleteDisabled = !$updateName && !$updateEmail && !$updatePassword;

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
		async function fetchUsers() {
			const response = await fetch('http://localhost:3000/users', {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					"Authorization": `Bearer ${getCookie('token')}`
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
        if (newPassword) newValues.password = newPassword;

		 console.log(newValues);
		 
		const response = await fetch(`http://localhost:3000/users/${$User?._id}`, {
			method: 'PATCH',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${getCookie('token')}`
			},
			body: JSON.stringify(newValues)
		});
		if (response.ok) {
			const updatedUser = await response.json();
			User.set(updatedUser);
			resetProfileChanges();
			profileSettings = false;
			console.log(updatedUser);
		} else {
			console.error('Failed to update profile');
		}
}


	const deleteUser = async () => {
		const response = await fetch(`http://localhost:3000/users/${$User?._id}`, {
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json',
				"Authorization": `Bearer ${getCookie('token')}`
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


	function fetchUsers() {
		throw new Error('Function not implemented.');
	}
</script>

<main class="d-flex flex-column align-itmes-center justify-content-center w-100 text-light">

	<div class="chat-card d-flex mx-auto border-0 rounded w-50 h-75" in:fade={{duration: 500}}>
		<div
			class="friends d-flex flex-column justify-content-start align-items-center bg-dark rounded-start"
		>
			<div class="friends-header d-flex flex-column align-items-center gap-3 pb-5 pt-3">
				<div
					class="dropdown-avatar avatar rounded-circle bg-body-tertiary d-flex justify-content-center align-items-center p-1 text-dark"
				>
					{$User?.username[0].toUpperCase()}
					<div class="dropdown-menu bg-dark flex-column justify-content-between align-items-center bg-dark gap-3 py-3">
						<!-- svelte-ignore a11y_consider_explicit_label -->
						<button
						type="button"
						class="btn btn-secondary d-flex align-items-center justify-content-center w-75"
						on:click={() => profileSettings = true}
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
				<input class="rounded bg-dark border px-3 py-1 text-light" type="text" placeholder="Search..." />
				<i class="bi bi-chat-fill"></i>
			</div>
			<div></div>
		</div>

		<div class="chat-window d-flex rounded-end flex-column justify-content-between bg-body-tertiary w-100 h-100 text-dark">

			{#if confirmation}
			<div class="delete-confirm rounded-end w-50 bg-dark p-3 gap-5 d-flex flex-column align-items-center justify-content-center text-white text-center w-100" in:fade={{duration: 100}} out:fade={{duration: 100}}>
				<p>Are you sure want to <b>DELETE</b> your Profile?</p>
				<p><b>Cannot be reverted.</b></p>
				<div class="d-flex gap-3 w-75">
					<button type="button" class="btn btn-secondary w-50" on:click={() => {confirmation = false}}>Back</button>
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
					<input class="w-75 rounded bg-light border px-3 py-2" type="text" placeholder="Type a message..." />
					<i class="bi bi-send-fill"></i>
				</div>
				<div class="d-flex gap-3 align-items-center">
					<i class="bi bi-emoji-smile"></i>
					<i class="bi bi-mic-fill"></i>
				</div>
			</div>

			{#if profileSettings}
			<div class="profile rounded text-dark d-flex flex-column align-items-center justiy-content-evenly p-5 gap-3 bg-body-tertiary w-100" in:fly={{duration: 500, x: -100}} out:fly={{duration: 500, x: -100}}>
				<form on:submit={updateUser} class="d-flex flex-column align-items-center justify-content-center gap-3 w-100">
				<div class="rounded-circle d-flex align-items-center justify-content-center bg-dark text-white mb-1" style="cursor: default; height: 80px; width:80px; font-size: 1.5rem;">{$User?.username[0].toUpperCase()}</div>
				<input type="text" placeholder="Set your status..." class="border py-2 px-3 w-75 rounded">
				<input type="file" name="file" class="mb-3">
				<div class="d-flex flex-column gap-3 w-75 mb-5">
					<div class="d-flex justify-content-between align-items-center"><div><b class="me-2">Name:</b>{$User?.username}</div><button type="button" class="btn btn-secondary" on:click={() => {updateName.set(!$updateName), newUsername = ''}}>change</button></div>
					{#if $updateName}
					<input bind:value={newUsername} type="text" placeholder="New Username" class="border py-2 px-3 w-100 rounded" required minlength="4" maxlength="20">
					{/if}
					<div class="d-flex justify-content-between align-items-center"><div><b class="me-2">E-mail:</b>{$User?.email}</div><button type="button" class="btn btn-secondary" on:click={() => {updateEmail.set(!$updateEmail), newEmail = ''}}>change</button></div>
					{#if $updateEmail}
					<input bind:value={newEmail} type="email" placeholder="New Email" class="border py-2 px-3 w-100 rounded" required>
					{/if}
					<div class="d-flex justify-content-between align-items-center"><div><b class="me-2">Password:</b>**********</div><button type="button" class="btn btn-secondary" on:click={() => {updatePassword.set(!$updatePassword), newPassword = '', confirmPassword = ''}}>change</button></div>
					{#if $updatePassword}
					<input bind:value={newPassword} type="password" placeholder="New Password" class="border py-2 px-3 w-100 rounded" required minlength="8">
					<input bind:value={confirmPassword} type="password" placeholder="Confirm Password" class="border py-2 px-3 w-100 rounded" required minlength="8">
					{/if}
				</div>

				{#if !isSaveDisabled}
				<button type="button" class="btn btn-warning w-50" on:click={() => {resetProfileChanges()}}>Cancel</button>
				{/if}
				<button type="submit" class="btn btn-primary w-50" disabled={isSaveDisabled}>Save Changes</button>
				<button type="button" class="btn btn-secondary w-50" on:click={() => {resetProfileChanges(), profileSettings = false}}>Close Profile</button>
				{#if isDeleteDisabled}
				<button type="button" class="btn btn-danger w-50" on:click={() => {confirmation = true}}>Delete Profile</button>
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

	button {
		box-shadow: rgba(0, 0, 0, 0.16) 0px 3px 6px, rgba(0, 0, 0, 0.23) 0px 3px 6px;
	}

	.chat-card{
		box-shadow: rgba(0, 0, 0, 0.35) 0px 5px 15px;
	}

	.dropdown-avatar {
		position: relative;
		display: inline-block;
	}

	.dropdown-menu {
		display: none;
		position: absolute;
		top: 50%;
		left: 50%;
		z-index: 1;
		min-height: 100px;
		min-width: 200px;
		align-items: start;
		justify-content: center;
		box-shadow: rgba(0, 0, 0, 0.16) 0px 3px 6px, rgba(0, 0, 0, 0.23) 0px 3px 6px;
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
