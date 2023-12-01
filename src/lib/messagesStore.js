import { writable } from 'svelte/store';
import { supabase } from '$lib/supabase'; // Adjust the path as per your project structure

const messages = writable([]);

async function loadMessages() {
    const { data, error } = await supabase
        .from('messages')
        .select(`
      id,
      text,
      created_at,
      user_profile: user_profiles!inner(id, clapper_id)
    `)
        .order('created_at', { ascending: true });

    if (error) {
        console.error('Error fetching messages:', error);
    } else {
        messages.set(data);
    }
}

loadMessages(); // Load messages initially

export default {
    subscribe: messages.subscribe,
    refresh: loadMessages // Function to refresh messages
};
