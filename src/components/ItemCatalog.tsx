import React, { useState } from "react";
import { useCategories, useItems, useUserPrices } from "../hooks/useSupabase";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Alert, AlertDescription } from "./ui/alert";
import { Badge } from "./ui/badge";
import { Search, Edit, Package, Euro, Tag } from "lucide-react";
import { toast } from "sonner";

interface ItemCatalogProps {
  userId: string;
}

export function ItemCatalog({ userId }: ItemCatalogProps) {
  const { categories, loading: categoriesLoading } = useCategories();
  const { items, loading: itemsLoading } = useItems();
  const { userPrices, setUserPrice, deleteUserPrice } = useUserPrices(userId);

  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [editingPrice, setEditingPrice] = useState<{
    itemId: number;
    price: number;
  } | null>(null);
  const [customPrice, setCustomPrice] = useState("");

  const filteredItems = items.filter((item) => {
    const matchesCategory =
      !selectedCategory || item.category_id.toString() === selectedCategory;
    const matchesSearch =
      !searchQuery ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getUserPrice = (itemId: number) => {
    return userPrices.find((up) => up.item_id === itemId);
  };

  const getEffectivePrice = (item: any) => {
    const userPrice = getUserPrice(item.id);
    return userPrice?.custom_price || item.default_price || 0;
  };

  const handleSetCustomPrice = async () => {
    if (!editingPrice) return;

    try {
      await setUserPrice(editingPrice.itemId, parseFloat(customPrice));
      setEditingPrice(null);
      setCustomPrice("");
      toast.success("Custom price set successfully");
    } catch (error) {
      toast.error("Failed to set custom price");
    }
  };

  const handleDeleteCustomPrice = async (itemId: number) => {
    try {
      await deleteUserPrice(itemId);
      toast.success("Custom price removed");
    } catch (error) {
      toast.error("Failed to remove custom price");
    }
  };

  const openEditDialog = (item: any) => {
    const userPrice = getUserPrice(item.id);
    setEditingPrice({
      itemId: item.id,
      price: userPrice?.custom_price || item.default_price || 0,
    });
    setCustomPrice(
      (userPrice?.custom_price || item.default_price || 0).toString()
    );
  };

  if (categoriesLoading || itemsLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-2">Loading catalog...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Item Catalog</h2>
          <p className="text-gray-600">
            Browse and manage your product catalog
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary" className="bg-blue-100 text-blue-700">
            <Package className="w-3 h-3 mr-1" />
            {items.length} Items
          </Badge>
          <Badge variant="secondary" className="bg-green-100 text-green-700">
            <Tag className="w-3 h-3 mr-1" />
            {categories.length} Categories
          </Badge>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Label htmlFor="search">Search Items</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              id="search"
              placeholder="Search by item name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="sm:w-48">
          <Label htmlFor="category">Filter by Category</Label>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger>
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id.toString()}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map((item) => {
          const userPrice = getUserPrice(item.id);
          const effectivePrice = getEffectivePrice(item);
          const category = categories.find((c) => c.id === item.category_id);

          return (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{item.name}</CardTitle>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {category?.name || "Uncategorized"}
                      </Badge>
                      {userPrice && (
                        <Badge
                          variant="secondary"
                          className="text-xs bg-green-100 text-green-700"
                        >
                          Custom Price
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openEditDialog(item)}
                  >
                    <Edit className="w-3 h-3" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Price:</span>
                    <div className="flex items-center">
                      <Euro className="w-4 h-4 mr-1" />
                      <span className="font-semibold">
                        {effectivePrice > 0
                          ? effectivePrice.toFixed(2)
                          : "No price"}
                      </span>
                    </div>
                  </div>

                  {item.unit && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Unit:</span>
                      <span className="text-sm font-medium">{item.unit}</span>
                    </div>
                  )}

                  {item.source_url && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Source:</span>
                      <a
                        href={item.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline"
                      >
                        View Source
                      </a>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>ID: {item.id}</span>
                    <span>
                      Added {new Date(item.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  {userPrice && (
                    <div className="pt-2 border-t">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Default:</span>
                        <span className="text-sm">
                          {item.default_price
                            ? `€${item.default_price.toFixed(2)}`
                            : "No default"}
                        </span>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteCustomPrice(item.id)}
                        className="w-full mt-2 text-red-600 hover:text-red-700"
                      >
                        Remove Custom Price
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredItems.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-gray-500">
              {searchQuery || selectedCategory
                ? "No items found matching your criteria."
                : "No items available in the catalog."}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit Price Dialog */}
      <Dialog open={!!editingPrice} onOpenChange={() => setEditingPrice(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set Custom Price</DialogTitle>
          </DialogHeader>
          {editingPrice && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="custom-price">Custom Price (€)</Label>
                <Input
                  id="custom-price"
                  type="number"
                  step="0.01"
                  value={customPrice}
                  onChange={(e) => setCustomPrice(e.target.value)}
                  placeholder="Enter custom price"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setEditingPrice(null)}>
                  Cancel
                </Button>
                <Button onClick={handleSetCustomPrice}>Set Price</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
