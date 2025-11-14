import { useState, useEffect, useCallback, useMemo } from "react";
import {
  db,
  Category,
  Item,
  Client,
  Quote,
  UserPrice,
} from "../utils/supabase/database";

// Hook for categories
export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCategories() {
      try {
        setLoading(true);
        setError(null);
        const data = await db.getCategories();
        setCategories(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch categories"
        );
      } finally {
        setLoading(false);
      }
    }

    fetchCategories();
  }, []);

  return {
    categories,
    loading,
    error,
    refetch: async () => {
      setLoading(true);
      try {
        const data = await db.getCategories();
        setCategories(data);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch categories"
        );
      } finally {
        setLoading(false);
      }
    },
  };
}

// Hook for items
export function useItems(categoryId?: number) {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchItems() {
      try {
        setLoading(true);
        setError(null);
        const data = await db.getItems(categoryId);
        setItems(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch items");
      } finally {
        setLoading(false);
      }
    }

    fetchItems();
  }, [categoryId]);

  return {
    items,
    loading,
    error,
    refetch: async () => {
      setLoading(true);
      try {
        const data = await db.getItems(categoryId);
        setItems(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch items");
      } finally {
        setLoading(false);
      }
    },
  };
}

// Hook for user prices
export function useUserPrices(userId: string) {
  const [userPrices, setUserPrices] = useState<UserPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;

    async function fetchUserPrices() {
      try {
        setLoading(true);
        setError(null);
        const data = await db.getUserPrices(userId);
        setUserPrices(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch user prices"
        );
      } finally {
        setLoading(false);
      }
    }

    fetchUserPrices();
  }, [userId]);

  const setUserPrice = async (itemId: number, customPrice: number) => {
    try {
      await db.setUserPrice(userId, itemId, customPrice);
      // Refresh the user prices
      const data = await db.getUserPrices(userId);
      setUserPrices(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to set user price");
    }
  };

  const deleteUserPrice = async (itemId: number) => {
    try {
      await db.deleteUserPrice(userId, itemId);
      // Refresh the user prices
      const data = await db.getUserPrices(userId);
      setUserPrices(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete user price"
      );
    }
  };

  return {
    userPrices,
    loading,
    error,
    setUserPrice,
    deleteUserPrice,
    refetch: async () => {
      if (!userId) return;
      setLoading(true);
      try {
        const data = await db.getUserPrices(userId);
        setUserPrices(data);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch user prices"
        );
      } finally {
        setLoading(false);
      }
    },
  };
}

// Hook for clients
export function useClients(userId: string) {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;

    async function fetchClients() {
      try {
        setLoading(true);
        setError(null);
        console.log("🔄 useClients: Fetching clients for userId:", userId);
        const data = await db.getClients(userId);
        setClients(data);
        console.log("✅ useClients: Clients fetched successfully, count:", data.length);
      } catch (err) {
        console.error("❌ useClients: Error fetching clients:", err);
        setError(
          err instanceof Error ? err.message : "Failed to fetch clients"
        );
      } finally {
        setLoading(false);
      }
    }

    fetchClients();
  }, [userId]);

  const createClient = useCallback(async (
    clientData: Omit<Client, "id" | "user_id" | "created_at">
  ) => {
    try {
      const newClient = await db.createClient(userId, clientData);
      setClients((prev) => [...prev, newClient]);
      return newClient;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create client");
      throw err;
    }
  }, [userId]);

  const updateClient = useCallback(async (
    clientId: number,
    updates: Partial<Omit<Client, "id" | "user_id" | "created_at">>
  ) => {
    try {
      await db.updateClient(clientId, updates);
      setClients((prev) =>
        prev.map((client) =>
          client.id === clientId ? { ...client, ...updates } : client
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update client");
      throw err;
    }
  }, []);

  const deleteClient = useCallback(async (clientId: number) => {
    try {
      await db.deleteClient(clientId);
      setClients((prev) => prev.filter((client) => client.id !== clientId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete client");
      throw err;
    }
  }, []);

  const refetch = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      console.log("🔄 useClients: Refetching clients for userId:", userId);
      const data = await db.getClients(userId);
      setClients(data);
      setError(null);
      console.log("✅ useClients: Refetch completed, count:", data.length);
    } catch (err) {
      console.error("❌ useClients: Error during refetch:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch clients"
      );
    } finally {
      setLoading(false);
    }
  }, [userId]);

  return useMemo(() => ({
    clients,
    loading,
    error,
    createClient,
    updateClient,
    deleteClient,
    refetch,
  }), [clients, loading, error, createClient, updateClient, deleteClient, refetch]);
}

// Hook for quotes
export function useQuotes(userId: string) {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;

    async function fetchQuotes() {
      try {
        setLoading(true);
        setError(null);
        const data = await db.getQuotes(userId);
        setQuotes(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch quotes");
      } finally {
        setLoading(false);
      }
    }

    fetchQuotes();
  }, [userId]);

  const createQuote = async (
    quoteData: Omit<Quote, "id_quote" | "created_at">
  ) => {
    try {
      const newQuote = await db.createQuote(userId, quoteData);
      setQuotes((prev) => [newQuote, ...prev]);
      return newQuote;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create quote");
      throw err;
    }
  };

  const updateQuote = async (
    quoteId: string,
    updates: Partial<Omit<Quote, "id_quote" | "created_at">>
  ) => {
    try {
      await db.updateQuote(quoteId, updates);
      setQuotes((prev) =>
        prev.map((quote) =>
          quote.id_quote === quoteId ? { ...quote, ...updates } : quote
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update quote");
      throw err;
    }
  };

  const deleteQuote = async (quoteId: string) => {
    try {
      await db.deleteQuote(quoteId);
      setQuotes((prev) => prev.filter((quote) => quote.id_quote !== quoteId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete quote");
      throw err;
    }
  };

  return {
    quotes,
    loading,
    error,
    createQuote,
    updateQuote,
    deleteQuote,
    refetch: async () => {
      if (!userId) return;
      setLoading(true);
      try {
        const data = await db.getQuotes(userId);
        setQuotes(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch quotes");
      } finally {
        setLoading(false);
      }
    },
  };
}

// Hook for searching items
export function useItemSearch() {
  const [searchResults, setSearchResults] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchItems = async (query: string, userId?: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const results = await db.searchItems(query, userId);
      setSearchResults(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed");
    } finally {
      setLoading(false);
    }
  };

  return {
    searchResults,
    loading,
    error,
    searchItems,
    clearResults: () => setSearchResults([]),
  };
}

// Hook for searching clients
export function useClientSearch(userId: string) {
  const [searchResults, setSearchResults] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchClients = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const results = await db.searchClients(userId, query);
      setSearchResults(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Client search failed");
    } finally {
      setLoading(false);
    }
  };

  return {
    searchResults,
    loading,
    error,
    searchClients,
    clearResults: () => setSearchResults([]),
  };
}

// Hook for items with user prices
export function useItemsWithUserPrices(userId: string, categoryId?: number) {
  const [itemsWithPrices, setItemsWithPrices] = useState<
    (Item & { user_price?: UserPrice })[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;

    async function fetchItemsWithPrices() {
      try {
        setLoading(true);
        setError(null);
        const data = await db.getItemsWithUserPrices(userId, categoryId);
        setItemsWithPrices(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to fetch items with prices"
        );
      } finally {
        setLoading(false);
      }
    }

    fetchItemsWithPrices();
  }, [userId, categoryId]);

  return {
    itemsWithPrices,
    loading,
    error,
    refetch: async () => {
      if (!userId) return;
      setLoading(true);
      try {
        const data = await db.getItemsWithUserPrices(userId, categoryId);
        setItemsWithPrices(data);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to fetch items with prices"
        );
      } finally {
        setLoading(false);
      }
    },
  };
}
