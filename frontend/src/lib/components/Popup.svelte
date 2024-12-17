<script lang="ts">
    import { notification } from '../../lib/stores/notification';
    import { fade, fly } from 'svelte/transition';
  
    let currentNotification = { message: '', type: 'info', isVisible: false };
  
    $: notification.subscribe((value) => {
      currentNotification = value;
    });
  </script>
  
  {#if currentNotification.isVisible}
    <div class="popup d-flex alig-items-center justify-content-center bg-dark bg-opacity-75 text-light rounded p-4" in:fly={{ y: 50, duration: 300 }} out:fly={{ y: 50, duration: 300 }}>
      <div class="d-flex gap-3"><i class="bi bi-check-circle-fill"></i>{currentNotification.message}</div>
    </div>
  {/if}
  
  <style>
    .popup {
      position: fixed;
      bottom: 2rem;
      left: 50%;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
      z-index: 1000;
      transform: translateX(-50%);
    }

    i{
        color: rgb(0, 216, 0);
    }
  </style>
  