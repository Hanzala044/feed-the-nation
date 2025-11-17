import { useMemo } from "react";
import type { Database } from "@/integrations/supabase/types";

type Donation = Database["public"]["Tables"]["donations"]["Row"];

interface FilterState {
  search: string;
  foodType: string;
  status: string;
  urgency: string;
  sortBy: string;
}

export const useDonationFilter = (donations: Donation[], filters: FilterState) => {
  return useMemo(() => {
    let result = [...donations];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(
        (d) =>
          d.title.toLowerCase().includes(searchLower) ||
          d.description?.toLowerCase().includes(searchLower) ||
          d.pickup_city.toLowerCase().includes(searchLower)
      );
    }

    // Food type filter
    if (filters.foodType !== "all") {
      result = result.filter((d) => d.food_type === filters.foodType);
    }

    // Status filter
    if (filters.status !== "all") {
      result = result.filter((d) => d.status === filters.status);
    }

    // Urgency filter
    if (filters.urgency !== "all") {
      result = result.filter((d) => d.urgency === filters.urgency);
    }

    // Sort
    switch (filters.sortBy) {
      case "newest":
        result.sort(
          (a, b) =>
            new Date(b.created_at || "").getTime() - new Date(a.created_at || "").getTime()
        );
        break;
      case "oldest":
        result.sort(
          (a, b) =>
            new Date(a.created_at || "").getTime() - new Date(b.created_at || "").getTime()
        );
        break;
      case "expiry":
        result.sort(
          (a, b) => new Date(a.expiry_date).getTime() - new Date(b.expiry_date).getTime()
        );
        break;
      case "quantity":
        result.sort((a, b) => parseInt(b.quantity) - parseInt(a.quantity));
        break;
    }

    return result;
  }, [donations, filters]);
};



