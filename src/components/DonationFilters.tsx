import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Filter, Search } from "lucide-react";

interface FilterState {
  search: string;
  foodType: string;
  status: string;
  urgency: string;
  sortBy: string;
}

interface DonationFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
}

export const DonationFilters = ({ filters, onFiltersChange }: DonationFiltersProps) => {
  const [localFilters, setLocalFilters] = useState(filters);

  const handleApply = () => {
    onFiltersChange(localFilters);
  };

  const handleReset = () => {
    const resetFilters = {
      search: "",
      foodType: "all",
      status: "all",
      urgency: "all",
      sortBy: "newest",
    };
    setLocalFilters(resetFilters);
    onFiltersChange(resetFilters);
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search donations..."
          value={localFilters.search}
          onChange={(e) => setLocalFilters({ ...localFilters, search: e.target.value })}
          onBlur={handleApply}
          className="pl-10 rounded-xl"
        />
      </div>

      {/* Filter Sheet */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" className="w-full rounded-xl">
            <Filter className="w-4 h-4 mr-2" />
            Filters & Sort
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-[80vh]">
          <SheetHeader>
            <SheetTitle>Filters & Sort</SheetTitle>
          </SheetHeader>

          <div className="space-y-6 mt-6">
            {/* Food Type Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Food Type</label>
              <Select
                value={localFilters.foodType}
                onValueChange={(value) => setLocalFilters({ ...localFilters, foodType: value })}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="cooked">Cooked Food</SelectItem>
                  <SelectItem value="raw">Raw Ingredients</SelectItem>
                  <SelectItem value="packaged">Packaged Food</SelectItem>
                  <SelectItem value="fruits">Fruits & Vegetables</SelectItem>
                  <SelectItem value="bakery">Bakery Items</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Status Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select
                value={localFilters.status}
                onValueChange={(value) => setLocalFilters({ ...localFilters, status: value })}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="accepted">Accepted</SelectItem>
                  <SelectItem value="in_transit">In Transit</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Urgency Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Urgency</label>
              <Select
                value={localFilters.urgency}
                onValueChange={(value) => setLocalFilters({ ...localFilters, urgency: value })}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="All urgencies" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Urgencies</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="flexible">Flexible</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Sort By */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Sort By</label>
              <Select
                value={localFilters.sortBy}
                onValueChange={(value) => setLocalFilters({ ...localFilters, sortBy: value })}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="expiry">Expiring Soon</SelectItem>
                  <SelectItem value="quantity">Most Quantity</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={handleReset}
                className="flex-1 rounded-xl"
              >
                Reset
              </Button>
              <Button
                onClick={handleApply}
                className="flex-1 rounded-xl"
              >
                Apply Filters
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};
