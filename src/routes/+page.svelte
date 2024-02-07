<script lang="ts">
  import { w3m } from "$lib";
</script>

<h1>Welcome to SvelteKit</h1>
<p>
  <w3m-button />
  {#if $w3m.isConnected}
    <button>Disconnect wallet</button>
  {:else}
    <button>Connect wallet</button>
  {/if}
</p>
