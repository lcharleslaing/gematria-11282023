<script>
  import { writable } from "svelte/store";
  import { supabase } from "$lib/supabase";
  import user from "$lib/userStore";

  const messages = writable([]);
  let organizedMessages = [];
  let newMessageText = "";
  let replyTexts = {};
  let userProfileId;
  let isTextAreaFocused = false;

  user.subscribe(($user) => {
    userProfileId = $user?.id;
  });

  async function loadMessages() {
    try {
      const { data, error } = await supabase
        .from("messages")
        .select(
          `
        id,
        text,
        created_at,
        parent_message_id,
        user_profile: user_profiles!inner(clapper_id)
      `,
        )
        .order("created_at", { ascending: true });

      if (error) throw error;

      console.log("Fetched messages:", data);
      messages.set(data);
    } catch (error) {
      console.error("Error fetching messages:", error.message);
    }
  }

  loadMessages();

  function organizeMessages(messagesArray) {
    let messageMap = new Map();
    messagesArray.forEach((msg) => {
      messageMap.set(msg.id, { ...msg, comments: [] });
    });

    messagesArray.forEach((msg) => {
      if (msg.parent_message_id && messageMap.has(msg.parent_message_id)) {
        messageMap.get(msg.parent_message_id).comments.push(msg);
      }
    });

    return Array.from(messageMap.values()).filter(
      (msg) => !msg.parent_message_id,
    );
  }

  $: organizedMessages = organizeMessages($messages);

  async function addNewMessage() {
    if (!newMessageText.trim()) return;
    const { data, error } = await supabase.from("messages").insert([
      {
        user_profile_id: userProfileId,
        text: newMessageText,
      },
    ]);

    if (error) {
      console.error("Error posting message:", error);
    } else {
      newMessageText = "";
      loadMessages();
    }
  }

  async function addReply(parentId) {
    const replyText = replyTexts[parentId];
    if (!replyText?.trim()) return;
    const { data, error } = await supabase.from("messages").insert([
      {
        user_profile_id: userProfileId,
        text: replyText,
        parent_message_id: parentId,
      },
    ]);

    if (error) {
      console.error("Error posting reply:", error);
    } else {
      replyTexts[parentId] = "";
      loadMessages();
    }
  }

  async function deleteMessageOrComment(id) {
    const { error } = await supabase.from("messages").delete().match({ id });

    if (error) {
      console.error("Error deleting message:", error);
    } else {
      loadMessages();
    }
  }

  function sendMessage() {
    addNewMessage();
    isTextAreaFocused = false;
  }
</script>

<div class="m-2">
  {#each organizedMessages as message}
    <div
      class="message mb-4 p-2 border-l-4 border-r-4 border-blue-500 bg-slate-50 shadow-md relative"
    >
      {#if message.user_profile_id === userProfileId}
        <button
          class="absolute top-0 right-0 text-red-500 p-1"
          on:click={() => deleteMessageOrComment(message.id)}>x</button
        >
      {/if}
      {#if message.user_profile && message.user_profile.id === userProfileId}
        <button
          class="absolute top-0 right-0 text-red-500 p-1"
          on:click={() => deleteMessageOrComment(message.id)}>x</button
        >
      {/if}
      <p class="text-gray-800">
        <span class="text-blue-500 text-xs">
          <strong
            >@{message.user_profile
              ? message.user_profile.clapper_id
              : "Unknown"}</strong
          >: {new Date(message.created_at).toLocaleString()}
        </span>
      </p>
      <p class="whitespace-pre-wrap">{message.text}</p>

      {#each message.comments as comment}
        <div
          class="ml-8 pl-4 border-l-4 border-r-4 border-blue-300 mt-2 bg-slate-100 shadow relative"
        >
          {#if comment.user_profile_id === userProfileId}
            <button
              class="absolute top-0 right-0 text-red-500 p-1"
              on:click={() => deleteMessageOrComment(comment.id)}>x</button
            >
          {/if}
          {#if comment.user_profile && comment.user_profile.id === userProfileId}
            <button
              class="absolute top-0 right-0 text-red-500 p-1"
              on:click={() => deleteMessageOrComment(comment.id)}>x</button
            >
          {/if}
          <p class="text-gray-900">
            <span class="text-blue-700 text-xs">
              <strong
                >@{comment.user_profile
                  ? comment.user_profile.clapper_id
                  : "Unknown"}</strong
              >: {new Date(comment.created_at).toLocaleString()}
            </span>
          </p>
          <div class="whitespace-pre-wrap pb-2">{comment.text}</div>
        </div>
      {/each}

      <div class="ml-0.5 reply-form mt-0.5 flex items-end">
        <textarea
          type="text"
          bind:value={replyTexts[message.id]}
          placeholder="Write a reply..."
          class="mt-3 input input-bordered w-3/4 mr-0.5"
        ></textarea>
        <button
          class="btn btn-primary text-white"
          on:click={() => addReply(message.id)}>Reply</button
        >
      </div>
    </div>
  {/each}
</div>

<div class="sticky bottom-0 py-0.5 bg-slate-200">
  <div class="mx-1 flex">
    <form on:submit|preventDefault={sendMessage} class="flex w-full">
      <textarea
        bind:value={newMessageText}
        placeholder="Type a message..."
        rows="2"
        class="textarea textarea-bordered flex-grow mr-0.5"
        on:focus={() => (isTextAreaFocused = true)}
        on:blur={() => (isTextAreaFocused = false)}
      ></textarea>
      <button type="submit" class="btn btn-primary text-white flex-none"
        >Send</button
      >
    </form>
  </div>
</div>
