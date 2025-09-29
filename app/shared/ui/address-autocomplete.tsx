import { useState, useEffect, useRef } from "react";
import { Input } from "./input";
import { cn } from "~/lib/utils";
import { MapPin, Loader2 } from "lucide-react";

interface AddressSuggestion {
  formatted: string;
  lat: number;
  lon: number;
  city?: string;
  country?: string;
  state?: string;
}

interface AddressAutocompleteProps {
  value?: string;
  onChange: (address: AddressSuggestion | null) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

const GEOAPIFY_API_KEY = "6ce52244a514485cbc39fec7cf66bf91";

export const AddressAutocomplete = ({
  value = "",
  onChange,
  placeholder = "Введите адрес...",
  className,
  disabled = false,
}: AddressAutocompleteProps) => {
  const [inputValue, setInputValue] = useState(value || "");
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Debounced search function
  const searchAddresses = async (query: string) => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(
          query
        )}&apiKey=${GEOAPIFY_API_KEY}&limit=5&lang=ru`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch suggestions");
      }

      const data = await response.json();
      const formattedSuggestions: AddressSuggestion[] = data.features.map(
        (feature: {
          properties: {
            formatted: string;
            city?: string;
            country?: string;
            state?: string;
          };
          geometry: {
            coordinates: [number, number];
          };
        }) => ({
          formatted: feature.properties.formatted,
          lat: feature.geometry.coordinates[1],
          lon: feature.geometry.coordinates[0],
          city: feature.properties.city,
          country: feature.properties.country,
          state: feature.properties.state,
        })
      );

      setSuggestions(formattedSuggestions);
    } catch (error) {
      console.error("Error fetching address suggestions:", error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle input change with debouncing
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setSelectedIndex(-1);
    setIsOpen(true);

    // Clear previous timeout
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Set new timeout
    debounceRef.current = setTimeout(() => {
      searchAddresses(newValue);
    }, 300);
  };

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion: AddressSuggestion) => {
    setInputValue(suggestion.formatted);
    setSuggestions([]);
    setIsOpen(false);
    setSelectedIndex(-1);
    onChange(suggestion);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || suggestions.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSuggestionSelect(suggestions[selectedIndex]);
        }
        break;
      case "Escape":
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  };

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(event.target as Node) &&
        listRef.current &&
        !listRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Scroll selected item into view
  useEffect(() => {
    if (selectedIndex >= 0 && listRef.current) {
      const selectedItem = listRef.current.children[
        selectedIndex
      ] as HTMLElement;
      if (selectedItem) {
        selectedItem.scrollIntoView({
          block: "nearest",
          behavior: "smooth",
        });
      }
    }
  }, [selectedIndex]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return (
    <div className="relative">
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          ref={inputRef}
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(suggestions.length > 0)}
          placeholder={placeholder}
          className={cn("pl-10", className)}
          disabled={disabled}
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
        )}
      </div>

      {isOpen && suggestions.length > 0 && (
        <ul
          ref={listRef}
          className="absolute z-50 w-full mt-1 max-h-60 overflow-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md"
        >
          {suggestions.map((suggestion, index) => (
            <button
              key={`${suggestion.lat}-${suggestion.lon}`}
              type="button"
              className={cn(
                "relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground",
                selectedIndex === index && "bg-accent text-accent-foreground"
              )}
              onClick={() => handleSuggestionSelect(suggestion)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleSuggestionSelect(suggestion);
                }
              }}
            >
              <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
              <div className="flex-1">
                <div className="font-medium">{suggestion.formatted}</div>
                {suggestion.city && suggestion.country && (
                  <div className="text-xs text-muted-foreground">
                    {suggestion.city}, {suggestion.country}
                  </div>
                )}
              </div>
            </button>
          ))}
        </ul>
      )}
    </div>
  );
};
