import { writable } from 'svelte/store';
import { supabase } from './supabase'; // Adjust the import path as needed

const user = writable(null);

async function loadUserProfile() {
    const { data: { user: authUser }, error } = await supabase.auth.getUser();

    if (authUser) {
        const { data, error } = await supabase
            .from('user_profiles')
            .select('*')  // Fetch all fields including the integer ID
            .eq('user_id', authUser.id)
            .single();

        if (error) {
            console.error('Error fetching user profile:', error);
        } else {
            user.set(data);
        }
    }
}

loadUserProfile();

export default user;
