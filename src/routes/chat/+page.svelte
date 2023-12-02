<script>
  import { writable } from "svelte/store";
  import { supabase } from "$lib/supabase";
  import user from "$lib/userStore";
  import { onMount } from "svelte";

  const messages = writable([]);
  let organizedMessages = [];
  let newMessageText = "";
  let replyTexts = {};
  let userProfileId;
  let isTextAreaFocused = false;
  let reloadInterval;
  let latestMessageId;
  let currentHighlighted = null;

  // user.subscribe(($user) => {
  //   userProfileId = $user?.id;
  // });

  // On component mount, set up the interval
  onMount(() => {
    if (typeof window !== "undefined") {
      const lastReadMessageId = localStorage.getItem("lastReadMessageId");
      if (lastReadMessageId) {
        const lastReadElement = document.getElementById(lastReadMessageId);
        if (lastReadElement) {
          lastReadElement.classList.add("highlighted");
          lastReadElement.scrollIntoView();
        }
      }
    }
    setupReloadInterval();
    const latestMessageElement = document.getElementById(latestMessageId);
    latestMessageElement?.scrollIntoView();
  });

  user.subscribe(($user) => {
    console.log("User data in subscription:", $user);
    if ($user && $user.id) {
      userProfileId = $user.id; // Assuming $user is the full profile with integer ID
    } else {
      console.error("User ID is undefined");
    }
  });

  let unreadMessages = []; // Array to hold IDs of unread messages

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
        user_profile_id,
        user_profile: user_profiles(clapper_id)
      `,
        )
        .order("created_at", { ascending: true });

      if (error) throw error;

      console.log("Fetched messages with user profiles:", data);

      // Update messages store
      messages.set(data);

      // Determine and store IDs of unread messages
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      unreadMessages = data
        .filter((message) => new Date(message.created_at) > twentyFourHoursAgo)
        .map((message) => `message-${message.id}`); // Adjust ID based on your HTML structure

      console.log("Unread messages IDs:", unreadMessages);
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
    console.log(
      "Attempting to add new message:",
      newMessageText,
      "User ID:",
      userProfileId,
    );

    const response = await supabase.from("messages").insert([
      {
        user_profile_id: userProfileId,
        text: newMessageText,
      },
    ]);

    console.log("Response from adding new message:", response);

    if (response.error) {
      console.error("Error posting new message:", response.error);
    } else {
      newMessageText = "";
      loadMessages();
    }
  }

  async function addReply(parentId) {
    const replyText = replyTexts[parentId];
    if (!replyText?.trim()) return;
    console.log(
      "Attempting to add reply:",
      replyText,
      "to message ID:",
      parentId,
      "User ID:",
      userProfileId,
    );

    const response = await supabase.from("messages").insert([
      {
        user_profile_id: userProfileId,
        text: replyText,
        parent_message_id: parentId,
      },
    ]);

    console.log("Response from adding reply:", response);

    if (response.error) {
      console.error("Error posting reply:", response.error);
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
      messages.update((currentMessages) => {
        return currentMessages.filter(
          (msg) => msg.id !== id && msg.parent_message_id !== id,
        );
      });
    }
  }

  function sendMessage() {
    addNewMessage();
    isTextAreaFocused = false;
  }

  function timeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const secondsAgo = Math.round((now - date) / 1000);

    if (secondsAgo < 60) {
      return `${secondsAgo}s ago`;
    } else if (secondsAgo < 3600) {
      return `${Math.round(secondsAgo / 60)}m ago`;
    } else if (secondsAgo < 86400) {
      return `${Math.round(secondsAgo / 3600)}h ago`;
    } else {
      return `${Math.round(secondsAgo / 86400)}d ago`;
    }
  }

  let isFullscreen = false;

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((e) => {
        console.error(
          `Error attempting to enable full-screen mode: ${e.message}`,
        );
      });
      isFullscreen = true;
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        isFullscreen = false;
      }
    }
  }

  // Function to set up the reload interval
  function setupReloadInterval() {
    reloadInterval = setInterval(() => {
      if (!isTextAreaFocused) {
        window.location.reload();
      }
    }, 60000); // 60 seconds
  }

  // Clear interval when focused on textarea
  function handleFocus() {
    clearInterval(reloadInterval);
    isTextAreaFocused = true;
  }

  // Re-establish interval when textarea loses focus
  function handleBlur() {
    isTextAreaFocused = false;
    setupReloadInterval();
  }

  function goToNextUnread() {
    if (unreadMessages.length > 0) {
      const nextUnreadId = unreadMessages.shift();
      const nextUnreadElement = document.getElementById(nextUnreadId);

      // Remove highlight from the current element
      if (currentHighlighted) {
        currentHighlighted.classList.remove("highlighted");
      }

      // Add highlight to the next unread element
      if (nextUnreadElement) {
        nextUnreadElement.classList.add("highlighted");
        nextUnreadElement.scrollIntoView({ behavior: "smooth" });

        // Update the current highlighted element
        currentHighlighted = nextUnreadElement;
      }
    }
  }

  function markAsRead(messageId) {
    if (typeof window !== "undefined") {
      localStorage.setItem("lastReadMessageId", messageId);
    }
    // Additional logic to mark the message as read
  }
</script>

<!-- Floating Button -->

<div class="mx-4 my-8">
  <button
    class="floating-button btn btn-sm btn-accent"
    on:click={goToNextUnread}
  >
    Next Unread
  </button>
  <div class="">
    {#each organizedMessages as message}
      <div id={`message-${message.id}`} class="message ...">
        {#if message.user_profile_id === userProfileId}
          <button
            class="delete-button btn btn-xs btn-error text-white"
            on:click={() => deleteMessageOrComment(message.id)}>X</button
          >
        {/if}
        <p class="text-gray-800">
          <span class="">
            <strong
              class="bg-blue-600 text-slate-100 px-1.5 pb-1 pt-0.5 rounded-full"
            >
              @{message.user_profile
                ? message.user_profile.clapper_id
                : "Unknown"}
            </strong>:
            <span
              class="bg-slate-900 text-slate-100 px-1.5 pb-1 pt-0.5 rounded-full"
              >{timeAgo(message.created_at)}</span
            >
          </span>
        </p>

        <p class="whitespace-pre-wrap my-2">{message.text}</p>

        {#each message.comments as comment}
          <div
            id={`comment-${comment.id}`}
            class="ml-8 pl-4 border-l-4 border-r-4 border-blue-300 mt-2 bg-slate-100 shadow relative"
          >
            {#if comment.user_profile_id === userProfileId}
              <button
                class="absolute top-1 right-1 btn btn-xs btn-error text-white"
                on:click={() => deleteMessageOrComment(comment.id)}>x</button
              >
            {/if}
            <p class="text-gray-900">
              <span class="text-blue-700">
                <strong
                  >@{comment.user_profile
                    ? comment.user_profile.clapper_id
                    : "Unknown"}</strong
                >: {timeAgo(comment.created_at)}
              </span>
            </p>
            <div class="whitespace-pre-wrap pb-2">{comment.text}</div>
          </div>
        {/each}

        <div class="ml-0.5 reply-form my-3 flex items-end">
          <textarea
            on:focus={handleFocus}
            on:blur={handleBlur}
            type="text"
            bind:value={replyTexts[message.id]}
            placeholder="Write a reply..."
            class=" input input-bordered w-3/4 mr-0.5"
          ></textarea>
          <button
            class="btn btn-primary text-white"
            on:click={() => addReply(message.id)}>Reply</button
          >
        </div>
      </div>
    {/each}
  </div>

  <div class="sticky bottom-0 py-0.5">
    <div class="mx-1 flex">
      <form on:submit|preventDefault={sendMessage} class="flex w-full">
        <textarea
          on:focus={handleFocus}
          on:blur={handleBlur}
          bind:value={newMessageText}
          placeholder="Type a message..."
          rows="1"
          class="textarea textarea-bordered flex-grow mr-0.5"
        ></textarea>
        <button type="submit" class="btn btn-primary text-white flex-none"
          >Send</button
        >
      </form>
    </div>
  </div>
</div>
<div class="flex justify-center btn btn-sm btn-primary text-white">
  <button class="" on:click={toggleFullscreen}>
    {isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
  </button>
</div>

<style>
  .message {
    position: relative;
    /* other styles for the message */
  }
  .delete-button {
    position: absolute;
    top: 5px; /* adjust as needed */
    right: 5px; /* adjust as needed */
    /* other styles for the button */
  }

  .textarea {
    font-size: 16px; /* or larger */
    /* other styles */
  }

  .floating-button {
    z-index: 100;
    position: fixed;
    top: 67px;
    right: 5px;
    /* other styling */
  }

  .highlighted {
    background-color: #f0f0f0; /* Light grey background, adjust as needed */
    border: 1px solid #ccc; /* Optional border, customize as desired */
    /* Add any additional styling as needed */
  }
</style>
