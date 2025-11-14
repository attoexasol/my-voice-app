/**
 * Supabase Client
 * Re-exports the enhanced client with robust error handling
 */

// Export the enhanced client as the default
export { supabase, supabaseClient } from './enhancedClient';

// For backwards compatibility, also export as default
import { supabase as enhancedSupabase } from './enhancedClient';
export default enhancedSupabase;
