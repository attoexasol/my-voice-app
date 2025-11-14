/**
 * Debug Supabase Queries
 * This file helps debug query construction issues
 */

import { supabase } from './client';

export async function debugClientsQuery(userId: string) {
  console.log('🔍 Debugging clients query...');
  console.log('User ID:', userId);
  
  try {
    // Test 1: Basic query without filters
    console.log('Test 1: Basic clients query');
    const { data: basicData, error: basicError } = await supabase
      .from('clients')
      .select('*');
    
    if (basicError) {
      console.error('❌ Basic query error:', basicError);
      return false;
    }
    console.log('✅ Basic query successful, found:', basicData?.length || 0, 'clients');
    
    // Test 2: Query with user_id filter
    console.log('Test 2: Clients query with user_id filter');
    const { data: filteredData, error: filteredError } = await supabase
      .from('clients')
      .select('*')
      .eq('user_id', userId);
    
    if (filteredError) {
      console.error('❌ Filtered query error:', filteredError);
      return false;
    }
    console.log('✅ Filtered query successful, found:', filteredData?.length || 0, 'clients');
    
    // Test 3: Query with order
    console.log('Test 3: Clients query with order');
    const { data: orderedData, error: orderedError } = await supabase
      .from('clients')
      .select('*')
      .eq('user_id', userId)
      .order('name');
    
    if (orderedError) {
      console.error('❌ Ordered query error:', orderedError);
      return false;
    }
    console.log('✅ Ordered query successful, found:', orderedData?.length || 0, 'clients');
    
    return true;
    
  } catch (error) {
    console.error('❌ Debug query failed:', error);
    return false;
  }
}

export async function debugQuotesQuery(userId: string) {
  console.log('🔍 Debugging quotes query...');
  console.log('User ID:', userId);
  
  try {
    // Test quotes query
    const { data: quotesData, error: quotesError } = await supabase
      .from('quotes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (quotesError) {
      console.error('❌ Quotes query error:', quotesError);
      return false;
    }
    
    console.log('✅ Quotes query successful, found:', quotesData?.length || 0, 'quotes');
    return true;
    
  } catch (error) {
    console.error('❌ Quotes debug failed:', error);
    return false;
  }
}

export async function debugQuoteUpdate(quoteId: string) {
  console.log('🔍 Debugging quote update...');
  console.log('Quote ID:', quoteId);
  
  try {
    // Test quote update without actually updating
    const { data: quoteData, error: quoteError } = await supabase
      .from('quotes')
      .select('id_quote, client_name, client_email')
      .eq('id_quote', quoteId)
      .single();
    
    if (quoteError) {
      console.error('❌ Quote select error:', quoteError);
      return false;
    }
    
    console.log('✅ Quote select successful:', quoteData);
    
    // Test update with minimal data
    const { error: updateError } = await supabase
      .from('quotes')
      .update({
        updated_at: new Date().toISOString()
      })
      .eq('id_quote', quoteId);
    
    if (updateError) {
      console.error('❌ Quote update error:', updateError);
      return false;
    }
    
    console.log('✅ Quote update successful');
    return true;
    
  } catch (error) {
    console.error('❌ Quote update debug failed:', error);
    return false;
  }
}

export async function runAllDebugTests(userId: string) {
  console.log('🚀 Running all debug tests...');
  
  const clientsTest = await debugClientsQuery(userId);
  const quotesTest = await debugQuotesQuery(userId);
  
  if (clientsTest && quotesTest) {
    console.log('✅ All debug tests passed!');
    return true;
  } else {
    console.log('❌ Some debug tests failed. Check the logs above.');
    return false;
  }
}
