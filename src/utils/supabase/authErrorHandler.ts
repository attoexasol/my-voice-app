/**
 * Authentication Error Handler
 * Provides robust error handling for Supabase auth issues
 * Prevents infinite retry loops and clears stale tokens automatically
 */

const AUTH_STORAGE_KEY = 'supabase.auth.token';
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY_MS = 1000;

interface RetryState {
  attempts: number;
  lastAttempt: number;
}

const retryState: Map<string, RetryState> = new Map();

/**
 * Check if we should retry an auth operation
 */
function shouldRetry(operation: string): boolean {
  const state = retryState.get(operation);
  
  if (!state) {
    retryState.set(operation, { attempts: 1, lastAttempt: Date.now() });
    return true;
  }
  
  const now = Date.now();
  const timeSinceLastAttempt = now - state.lastAttempt;
  
  // Reset retry counter if it's been more than 1 minute
  if (timeSinceLastAttempt > 60000) {
    retryState.set(operation, { attempts: 1, lastAttempt: now });
    return true;
  }
  
  // Check if we've exceeded max attempts
  if (state.attempts >= MAX_RETRY_ATTEMPTS) {
    console.warn(`⚠️ Max retry attempts reached for ${operation}`);
    return false;
  }
  
  // Increment attempts
  state.attempts += 1;
  state.lastAttempt = now;
  retryState.set(operation, state);
  
  return true;
}

/**
 * Reset retry state for an operation
 */
function resetRetryState(operation: string): void {
  retryState.delete(operation);
}

/**
 * Clear all authentication data from storage
 */
export function clearAuthStorage(): void {
  try {
    console.log('🧹 Clearing authentication storage...');
    
    // Clear Supabase auth storage
    const storageKeys = Object.keys(localStorage);
    storageKeys.forEach(key => {
      if (key.startsWith('sb-') || key.includes('supabase')) {
        localStorage.removeItem(key);
        console.log(`   Removed: ${key}`);
      }
    });
    
    // Clear session storage as well
    const sessionKeys = Object.keys(sessionStorage);
    sessionKeys.forEach(key => {
      if (key.startsWith('sb-') || key.includes('supabase')) {
        sessionStorage.removeItem(key);
      }
    });
    
    console.log('✅ Authentication storage cleared');
  } catch (error) {
    console.error('❌ Error clearing auth storage:', error);
  }
}

/**
 * Check if an error is related to stale/invalid tokens
 */
export function isStaleTokenError(error: any): boolean {
  if (!error) return false;
  
  const errorMessage = error.message?.toLowerCase() || '';
  const errorStatus = error.status || 0;
  
  return (
    errorStatus === 502 ||
    errorStatus === 401 ||
    errorStatus === 403 ||
    errorMessage.includes('bad gateway') ||
    errorMessage.includes('invalid token') ||
    errorMessage.includes('expired') ||
    errorMessage.includes('jwt') ||
    errorMessage.includes('refresh') ||
    errorMessage.includes('unauthorized')
  );
}

/**
 * Check if an error is a network error
 */
export function isNetworkError(error: any): boolean {
  if (!error) return false;
  
  const errorMessage = error.message?.toLowerCase() || '';
  const errorName = error.name?.toLowerCase() || '';
  
  return (
    !navigator.onLine ||
    errorMessage.includes('network') ||
    errorMessage.includes('fetch') ||
    errorMessage.includes('timeout') ||
    errorName.includes('network') ||
    errorName.includes('fetch')
  );
}

/**
 * Handle authentication errors with automatic recovery
 */
export async function handleAuthError(
  error: any,
  operation: string = 'auth'
): Promise<{ recovered: boolean; shouldClearAuth: boolean }> {
  console.error(`🔴 Auth error in ${operation}:`, error);
  
  // Check if it's a network error
  if (isNetworkError(error)) {
    console.warn('📡 Network error detected - user may be offline');
    return { recovered: false, shouldClearAuth: false };
  }
  
  // Check if it's a stale token error
  if (isStaleTokenError(error)) {
    console.warn('🔑 Stale or invalid token detected');
    
    // Check if we should retry
    if (!shouldRetry(operation)) {
      console.error('❌ Max retries reached - clearing auth storage');
      clearAuthStorage();
      return { recovered: false, shouldClearAuth: true };
    }
    
    // Don't automatically clear auth storage on first stale token error
    // Let Supabase handle token refresh automatically
    console.log('🔄 Allowing Supabase to handle token refresh');
    return { recovered: false, shouldClearAuth: false };
  }
  
  // For other errors, just log and return
  return { recovered: false, shouldClearAuth: false };
}

/**
 * Wrap an async auth operation with error handling
 */
export async function withAuthErrorHandling<T>(
  operation: () => Promise<T>,
  operationName: string = 'auth-operation',
  onAuthClear?: () => void
): Promise<T | null> {
  try {
    const result = await operation();
    resetRetryState(operationName);
    return result;
  } catch (error) {
    const { shouldClearAuth } = await handleAuthError(error, operationName);
    
    if (shouldClearAuth && onAuthClear) {
      onAuthClear();
    }
    
    return null;
  }
}

/**
 * Create a timeout promise
 */
export function createTimeout(ms: number, operationName: string = 'operation'): Promise<never> {
  return new Promise((_, reject) =>
    setTimeout(() => reject(new Error(`${operationName} timeout after ${ms}ms`)), ms)
  );
}

/**
 * Race a promise against a timeout
 */
export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  operationName: string = 'operation'
): Promise<T> {
  return Promise.race([
    promise,
    createTimeout(timeoutMs, operationName)
  ]);
}

/**
 * Check if auth tokens exist in storage
 */
export function hasAuthTokens(): boolean {
  try {
    const storageKeys = Object.keys(localStorage);
    return storageKeys.some(key => 
      (key.startsWith('sb-') || key.includes('supabase')) && 
      key.includes('auth-token')
    );
  } catch {
    return false;
  }
}

/**
 * Validate that auth tokens are not expired
 */
export function areTokensValid(): boolean {
  try {
    const storageKeys = Object.keys(localStorage);
    
    for (const key of storageKeys) {
      if ((key.startsWith('sb-') || key.includes('supabase')) && key.includes('auth-token')) {
        const data = localStorage.getItem(key);
        if (data) {
          try {
            const parsed = JSON.parse(data);
            const expiresAt = parsed.expires_at || parsed.expiresAt;
            
            if (expiresAt) {
              const now = Math.floor(Date.now() / 1000);
              if (now >= expiresAt) {
                console.warn('⚠️ Found expired token in storage');
                return false;
              }
            }
          } catch {
            // Parsing error, might be corrupt
            return false;
          }
        }
      }
    }
    
    return true;
  } catch {
    return false;
  }
}

/**
 * Initialize auth with cleanup of stale tokens
 */
export function initializeAuth(): void {
  console.log('🔐 Initializing authentication...');
  
  // Check if tokens exist but are invalid
  if (hasAuthTokens() && !areTokensValid()) {
    console.warn('⚠️ Found invalid tokens on startup - cleaning up');
    clearAuthStorage();
  }
}

