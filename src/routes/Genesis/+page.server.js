import { supabase } from '$lib/supabase';
export async function load({ fetch }) {

    let { data: kjvbible, error } = await supabase
        .from('kjvbible')
        .select('*')
        .eq('book', 'Genesis')
    console.log(kjvbible);
    return {
        kjvbible
    };
}