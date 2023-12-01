<script>
  // import { onMount } from "svelte";
  // import { supabase } from "$lib/supabase";
  // import { user } from "$lib/stores";
  // import Nav from "$lib/components/Nav.svelte";
  // onMount(() => {
  //   user.set(supabase.auth.getUser());
  //   supabase.auth.onAuthStateChange((_event, session) => {
  //     user.set(session?.user || null);
  //   });
  // });

  // $: console.log("Current user: AUTH", $user);
</script>

<!-- Auth Forms -->
<div class="flex flex-col w-screen h-screen justify-center items-center gap-2">
  <a
    href="/chat"
    class="text-2xl font-extrabold my-6 w-3/4 btn btn-lg bg-pink-700 text-white uppercase"
    >Chosen Chat</a
  >
  <a
    href="https://bible-stats.vercel.app"
    target="_blank"
    class="w-3/4 btn btn-lg btn-warning text-slate-900">Numbers (New Tab)</a
  >
  <a
    href="https://countdown-blue-one.vercel.app"
    target="_blank"
    class="w-3/4 btn btn-lg btn-warning text-slate-900">Countdown (New Tab)</a
  >
  <a
    href="https://hebrew-one.vercel.app/"
    target="_blank"
    class="w-3/4 btn btn-lg btn-warning text-slate-900"
    >Hebrew Meanings (New Tab)</a
  >
  <a
    href="https://bible-stats.vercel.app/koolcat"
    target="_blank"
    class="w-3/4 btn btn-lg bg-red-600 text-slate-900"
    >Search Koolcat Videos (New Tab)</a
  >
  <a
    href="https://bible-stats.vercel.app/repoman64"
    target="_blank"
    class="w-3/4 btn btn-lg bg-red-600 text-slate-900"
    >Search Repoman Videos (New Tab)</a
  >
  <a
    href="https://leftbehind.world/"
    target="_blank"
    class="w-3/4 btn btn-lg btn-warning text-slate-900"
    >Left Behind World (New Tab)</a
  >
  <a
    href="https://leftbehind.world/prayers/"
    target="_blank"
    class="w-3/4 btn btn-lg btn-warning text-slate-900">Prayers (New Tab)</a
  >
  <a
    disabled
    href="https://sveltekit-bible-app-1-0.vercel.app/"
    target="_blank"
    class="w-3/4 btn btn-lg btn-warning text-slate-900"
    >KJV Bible Search (New Tab)</a
  >
</div>
