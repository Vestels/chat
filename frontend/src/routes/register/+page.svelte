<script lang="ts">
	import { goto } from '$app/navigation';
	import { writable } from 'svelte/store';
	import { fade } from 'svelte/transition';

	let username = '';
	let email = '';
	let password = '';
	let confirmPassword = '';

	let isCredentialsCorrect = writable(true);
	let isPasswordMatch = writable(true);

	const handleSubmit = async () => {
		if (password !== confirmPassword) {
			isPasswordMatch.set(false);
			return;
		}
		const res = await fetch('http://localhost:3000/auth/register', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ username, email, password })
		});

		if (res.ok) {
			const data = await res.json();
			console.log(data);
			goto('/Login');
		} else {
			isCredentialsCorrect.set(false);
			console.error('Failed to register');
		}
	};
</script>

<main class="d-flex flex-column align-itmes-center justify-content-center w-100 bg-body-tertiary">
	<form on:submit|preventDefault={handleSubmit} class="w-40 mx-auto border p-5 rounded" in:fade={{duration: 300}}>
		<h1 class="mb-5">Registration</h1>
		<div class="mb-3">
			<label for="username" class="form-label">Name</label>
			<input
				bind:value={username}
				type="text"
				class="form-control"
				id="username"
				required
				minlength="4"
			/>
		</div>
		<div class="mb-3">
			<label for="email" class="form-label">Email address</label>
			<input
				bind:value={email}
				type="email"
				class="form-control"
				id="email"
				aria-describedby="emailHelp"
				required
			/>
			<div id="emailHelp" class="form-text">We'll never share your email with anyone else.</div>
		</div>
		<div class="mb-3">
			<label for="password" class="form-label">Password</label>
			<input
				bind:value={password}
				type="password"
				class="form-control"
				id="password"
				required
				minlength="8"
			/>
		</div>
		<div class="mb-3">
			<label for="confirm-password" class="form-label">Confirm Password</label>
			<input
				bind:value={confirmPassword}
				type="password"
				class="form-control"
				id="confirm-password"
				required
				minlength="8"
			/>
		</div>

		{#if !$isCredentialsCorrect}
		<div class="alert alert-danger alert-dismissible fade show" role="alert">
			This e-mail is already taken!
			<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close" on:click={() => {isCredentialsCorrect.set(true)}}></button>
		</div>
		{/if}

		{#if !$isPasswordMatch}
		<div class="alert alert-danger alert-dismissible fade show" role="alert">
			Passwords do not match!
			<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close" on:click={() => {isPasswordMatch.set(true)}}></button>
		</div>
		{/if}

		<div class="bottom-section">
			<button type="submit" class="btn btn-primary my-3">Register</button>
			<div>
				already have an account? <a href="/login">Login</a>
			</div>
		</div>
	</form>
</main>

<style>
	main {
		height: 100vh;
		overflow: hidden;
	}
</style>
