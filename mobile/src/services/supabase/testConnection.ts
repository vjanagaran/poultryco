import { supabase } from '../../config/supabase';

export async function testSupabaseConnection() {
  try {
    // Test query to check connection
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);

    if (error) {
      console.error('Supabase connection error:', error);
      return false;
    }

    console.log('✅ Supabase connected successfully');
    return true;
  } catch (error) {
    console.error('Supabase connection test failed:', error);
    return false;
  }
}