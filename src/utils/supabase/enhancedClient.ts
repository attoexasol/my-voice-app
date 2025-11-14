/**
 * Enhanced Supabase Client
 * Wraps the standard Supabase client with robust error handling
 */

import { createClient } from '@supabase/supabase-js';
import {
  clearAuthStorage,
  handleAuthError,
  withTimeout,
  initializeAuth,
} from './authErrorHandler';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env.local or .env file.'
  );
}

// Initialize auth cleanup on app start
initializeAuth();

/**
 * Create enhanced Supabase client with custom configuration
 */
const client = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Automatically handle token refresh
    autoRefreshToken: true,
    // Persist session in local storage
    persistSession: true,
    // Detect session in URL (for OAuth callbacks)
    detectSessionInUrl: true,
    // Storage key prefix
    storageKey: 'sb-auth-token',
    // Custom storage implementation with error handling
    storage: {
      getItem: (key: string) => {
        try {
          return localStorage.getItem(key);
        } catch (error) {
          console.error('Error reading from storage:', error);
          return null;
        }
      },
      setItem: (key: string, value: string) => {
        try {
          localStorage.setItem(key, value);
        } catch (error) {
          console.error('Error writing to storage:', error);
        }
      },
      removeItem: (key: string) => {
        try {
          localStorage.removeItem(key);
        } catch (error) {
          console.error('Error removing from storage:', error);
        }
      },
    },
  },
  global: {
    headers: {
      'X-Client-Info': 'voice-to-invoice-app',
    },
  },
});

/**
 * Enhanced auth methods with error handling
 */
export const enhancedAuth = {
  /**
   * Get current session with timeout and error handling
   */
  async getSession() {
    try {
      const result = await withTimeout(
        client.auth.getSession(),
        10000,
        'getSession'
      );
      return result;
    } catch (error) {
      const { shouldClearAuth } = await handleAuthError(error, 'getSession');
      
      if (shouldClearAuth) {
        clearAuthStorage();
      }
      
      return { data: { session: null }, error };
    }
  },

  /**
   * Sign in with password with error handling
   */
  async signInWithPassword(credentials: { email: string; password: string }) {
    try {
      const result = await withTimeout(
        client.auth.signInWithPassword(credentials),
        15000,
        'signInWithPassword'
      );
      
      // Clear any previous error state on successful login
      if (result.data.session) {
        console.log('✅ Successfully signed in');
      }
      
      return result;
    } catch (error) {
      const { shouldClearAuth } = await handleAuthError(error, 'signInWithPassword');
      
      if (shouldClearAuth) {
        clearAuthStorage();
      }
      
      // Return error in Supabase format
      return {
        data: { user: null, session: null },
        error: error as any,
      };
    }
  },

  /**
   * Sign up with error handling
   */
  async signUp(credentials: {
    email: string;
    password: string;
    options?: any;
  }) {
    try {
      const result = await withTimeout(
        client.auth.signUp(credentials),
        15000,
        'signUp'
      );
      return result;
    } catch (error) {
      await handleAuthError(error, 'signUp');
      
      return {
        data: { user: null, session: null },
        error: error as any,
      };
    }
  },

  /**
   * Sign in with OAuth with error handling
   */
  async signInWithOAuth(params: any) {
    try {
      const result = await withTimeout(
        client.auth.signInWithOAuth(params),
        15000,
        'signInWithOAuth'
      );
      return result;
    } catch (error) {
      await handleAuthError(error, 'signInWithOAuth');
      
      return {
        data: { provider: params.provider, url: null },
        error: error as any,
      };
    }
  },

  /**
   * Sign out with error handling
   */
  async signOut() {
    try {
      // Clear local storage first
      clearAuthStorage();
      
      // Then try to sign out from server
      const result = await withTimeout(
        client.auth.signOut(),
        5000,
        'signOut'
      );
      
      console.log('✅ Successfully signed out');
      return result;
    } catch (error) {
      // Even if server signout fails, we've already cleared local storage
      console.warn('⚠️ Server signout failed, but local cleanup completed');
      
      return { error: null }; // Return success since local cleanup worked
    }
  },

  /**
   * Get current user with error handling
   */
  async getUser() {
    try {
      const result = await withTimeout(
        client.auth.getUser(),
        10000,
        'getUser'
      );
      return result;
    } catch (error) {
      const { shouldClearAuth } = await handleAuthError(error, 'getUser');
      
      if (shouldClearAuth) {
        clearAuthStorage();
      }
      
      return {
        data: { user: null },
        error: error as any,
      };
    }
  },

  /**
   * Reset password for email
   */
  async resetPasswordForEmail(email: string, options?: any) {
    try {
      const result = await withTimeout(
        client.auth.resetPasswordForEmail(email, options),
        15000,
        'resetPasswordForEmail'
      );
      return result;
    } catch (error) {
      await handleAuthError(error, 'resetPasswordForEmail');
      
      return { data: {}, error: error as any };
    }
  },

  /**
   * Update user
   */
  async updateUser(attributes: any) {
    try {
      const result = await withTimeout(
        client.auth.updateUser(attributes),
        15000,
        'updateUser'
      );
      return result;
    } catch (error) {
      const { shouldClearAuth } = await handleAuthError(error, 'updateUser');
      
      if (shouldClearAuth) {
        clearAuthStorage();
      }
      
      return {
        data: { user: null },
        error: error as any,
      };
    }
  },

  /**
   * Subscribe to auth state changes
   */
  onAuthStateChange(callback: (event: string, session: any) => void) {
    return client.auth.onAuthStateChange((event, session) => {
      // console.log(`🔐 Auth state changed: ${event}`);
      
      // Clear storage on sign out
      if (event === 'SIGNED_OUT') {
        clearAuthStorage();
      }
      
      // Handle token refresh errors
      if (event === 'TOKEN_REFRESHED' && !session) {
        console.warn('⚠️ Token refresh failed - clearing auth');
        clearAuthStorage();
      }
      
      callback(event, session);
    });
  },
};

/**
 * Export enhanced client with original database/storage/functions access
 * but enhanced auth methods
 */
export const supabase = {
  ...client,
  auth: enhancedAuth,
  // Keep original database, storage, functions, etc.
  from: client.from.bind(client),
  storage: client.storage,
  functions: client.functions,
  rpc: client.rpc.bind(client),
} as any; // Type assertion to maintain compatibility

// Also export the original client for cases where needed
export const supabaseClient = client;

export default supabase;

