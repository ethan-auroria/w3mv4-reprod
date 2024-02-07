// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
  // Defined & used by SvelteKit
  namespace App {
    // interface PageData {}
    // interface PageState {}

    // This is the common error interface, used by Svelte's error() function.
    interface Error {}

    // This is the object passed from server hook down to request handlers
    interface Locals {}

    interface Platform {}
  }
}

export {};
