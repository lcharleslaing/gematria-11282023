// src/lib/userStore.js
import { writable } from 'svelte/store';
import { supabase } from './supabase'; // Adjust import path as needed

export const user = writable(null);

// Function to load user profile
async function loadUserProfile() {
    const authUser = supabase.auth.getUser();

    if (authUser) {
        const { data, error } = await supabase
            .from('user_profiles')
            .select('id')
            .eq('user_id', authUser.id)
            .single();

        if (error) {
            console.error('Error fetching user profile:', error);
        } else {
            user.set(data);
        }
    }
}

// Call this function when the user logs in
loadUserProfile();

