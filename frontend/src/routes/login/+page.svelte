<script lang="ts">
	import { goto } from '$app/navigation';
	import { User } from '$lib/stores/auth';
	import { fade } from 'svelte/transition';
	import { setCookie } from '../../utils/cookie.util';
	import { writable } from 'svelte/store';
	import { showNotification } from '$lib/stores/notification';

	let email = '';
	let password = '';

	let isCredentialsCorrect = writable(true);

	export const handleLogin = async () => {
		const res = await fetch('http://localhost:3000/auth/login', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ email, password })
		});

		if (res.ok) {
			const data = await res.json();
			console.log(data);
      		setCookie('token', data.accessToken);
			setCookie('user', JSON.stringify(data.user))
			User.set(data.user);
			goto('/');
			showNotification(`Welcome, ${data.user.username}!`);
		} else {
			isCredentialsCorrect.set(false);
			console.error('Something went wrong!');
		}
	};
</script>

<main class="d-flex flex-column align-itmes-center justify-content-center w-100 bg-body-tertiary">
	<form on:submit|preventDefault={handleLogin} class="w-40 mx-auto border p-5 rounded" in:fade={{duration: 300}}>
		<h1 class="mb-5">Login</h1>
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

		{#if !$isCredentialsCorrect}
		<div class="alert alert-danger alert-dismissible fade show" role="alert">
			Invalid e-mail or password!
			<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close" on:click={() => {isCredentialsCorrect.set(true)}}></button>
		</div>
		{/if}

		<div class="bottom-section">
			<button type="submit" class="btn btn-primary my-3">Login</button>
			<div>
				not registered yet? <a href="/register">Register</a>
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
