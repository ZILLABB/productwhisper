import React, { useState, useEffect, useMemo } from "react";
import { Input } from "../components/ui/input";
import Button from "../common/components/Button";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Slider } from "../components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "../components/ui/sheet";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../components/ui/accordion";
import { Checkbox } from "../components/ui/checkbox";
// import { Separator } from "../components/ui/separator";
import { ScrollArea } from "../components/ui/scroll-area";
import {
  Search,
  Star,
  X,
  Filter,
  SlidersHorizontal,
  Grid,
  List,
  ChevronDown,
  ShoppingCart,
  Heart,
  TrendingUp,
  History,
  Loader2,
  Info
} from "lucide-react";
import ProductCard from "../components/product/ProductCard";

// Sample product data
const products = [
  {
    id: 1,
    name: "Premium Wireless Headphones",
    category: "Audio",
    brand: "SoundMaster",
    price: 249.99,
    rating: 4.8,
    reviews: 1243,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500",
    description: "Experience premium sound quality with active noise cancellation.",
    inStock: true,
    tags: ["wireless", "noise-cancelling", "premium"],
    discount: 10
  },
  {
    id: 2,
    name: "Ultra HD Smart TV 55\"",
    category: "Television",
    brand: "VisionPlus",
    price: 799.99,
    rating: 4.7,
    reviews: 856,
    image: "https://images.unsplash.com/photo-1593784991095-a205069470b6?w=500",
    description: "Crystal clear 4K resolution with smart features and voice control.",
    inStock: true,
    tags: ["4K", "smart", "HDR"],
    discount: 15
  },
  {
    id: 3,
    name: "Professional DSLR Camera",
    category: "Photography",
    brand: "PhotoPro",
    price: 1299.99,
    rating: 4.9,
    reviews: 512,
    image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500",
    description: "Capture stunning photos with this professional-grade camera.",
    inStock: true,
    tags: ["professional", "high-resolution", "DSLR"],
    discount: 0
  },
  {
    id: 4,
    name: "Ergonomic Office Chair",
    category: "Furniture",
    brand: "ComfortPlus",
    price: 299.99,
    rating: 4.6,
    reviews: 743,
    image: "https://images.unsplash.com/photo-1505843490701-5be5d1b31f8f?w=500",
    description: "Work comfortably with adjustable height and lumbar support.",
    inStock: false,
    tags: ["ergonomic", "office", "adjustable"],
    discount: 5
  },
  {
    id: 5,
    name: "Smart Fitness Tracker",
    category: "Wearables",
    brand: "FitTech",
    price: 129.99,
    rating: 4.5,
    reviews: 1876,
    image: "https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=500",
    description: "Track your fitness goals with heart rate monitoring and GPS.",
    inStock: true,
    tags: ["fitness", "smart", "waterproof"],
    discount: 0
  },
  {
    id: 6,
    name: "Portable Bluetooth Speaker",
    category: "Audio",
    brand: "SoundMaster",
    price: 89.99,
    rating: 4.4,
    reviews: 2134,
    image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500",
    description: "Powerful sound in a compact, waterproof design for on-the-go use.",
    inStock: true,
    tags: ["bluetooth", "portable", "waterproof"],
    discount: 20
  },
  {
    id: 7,
    name: "Gaming Laptop 15.6\"",
    category: "Computers",
    brand: "TechPower",
    price: 1499.99,
    rating: 4.7,
    reviews: 763,
    image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=500",
    description: "High-performance gaming laptop with RGB keyboard and advanced cooling.",
    inStock: true,
    tags: ["gaming", "high-performance", "RGB"],
    discount: 8
  },
  {
    id: 8,
    name: "Smartphone with 5G",
    category: "Mobile",
    brand: "TechGiant",
    price: 899.99,
    rating: 4.8,
    reviews: 1521,
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500",
    description: "Next-gen smartphone with 5G connectivity and pro-grade camera system.",
    inStock: true,
    tags: ["5G", "smartphone", "camera"],
    discount: 12
  },
];

// Extract unique categories and brands
const categories = ["All", ...Array.from(new Set(products.map(p => p.category)))];
const brands = ["All", ...Array.from(new Set(products.map(p => p.brand)))];

const sortOptions = [
  { value: "relevance", label: "Relevance" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "rating", label: "Highest Rated" },
  { value: "newest", label: "Newest First" },
];

const trendingSearches = ["wireless headphones", "gaming laptop", "smart tv", "fitness tracker"];
const recentSearchesDefault = ["bluetooth speaker", "office chair", "smartphone"];

// Star rating component
const StarRating: React.FC<{ rating: number }> = ({ rating }) => {
  return (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={16}
          className={`${rating >= star ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
        />
      ))}
    </div>
  );
};

// Price formatter
const formatPrice = (price: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(price);
};

export default function SearchPage() {
  // Calculate max price for slider
  const maxPrice = Math.max(...products.map(p => p.price));

  // State management
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [brand, setBrand] = useState("All");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("relevance");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, maxPrice]);
  const [minRating, setMinRating] = useState(0);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>(recentSearchesDefault);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Filtered products based on all criteria
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Text search
      const matchesSearch = search === "" ||
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.description.toLowerCase().includes(search.toLowerCase()) ||
        product.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()));

      // Category filter
      const matchesCategory = category === "All" || product.category === category;

      // Brand filter
      const matchesBrand = brand === "All" || product.brand === brand;

      // Price range filter
      const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];

      // Rating filter
      const matchesRating = product.rating >= minRating;

      // Stock filter
      const matchesStock = !inStockOnly || product.inStock;

      return matchesSearch && matchesCategory && matchesBrand && matchesPrice && matchesRating && matchesStock;
    }).sort((a, b) => {
      // Sorting
      switch (sortBy) {
        case "price-low":
          return a.price - b.price;
        case "price-high":
          return b.price - a.price;
        case "rating":
          return b.rating - a.rating;
        case "newest":
          return b.id - a.id; // Using ID as a proxy for newness
        default:
          // Relevance - prioritize exact matches in name
          const aNameMatch = a.name.toLowerCase().includes(search.toLowerCase());
          const bNameMatch = b.name.toLowerCase().includes(search.toLowerCase());
          if (aNameMatch && !bNameMatch) return -1;
          if (!aNameMatch && bNameMatch) return 1;
          return 0;
      }
    });
  }, [search, category, brand, priceRange, minRating, inStockOnly, sortBy]);

  // Update active filters for display
  useEffect(() => {
    const filters: string[] = [];

    if (category !== "All") filters.push(`Category: ${category}`);
    if (brand !== "All") filters.push(`Brand: ${brand}`);
    if (priceRange[0] > 0 || priceRange[1] < maxPrice)
      filters.push(`Price: ${formatPrice(priceRange[0])} - ${formatPrice(priceRange[1])}`);
    if (minRating > 0) filters.push(`Rating: ${minRating}+ stars`);
    if (inStockOnly) filters.push("In Stock Only");

    setActiveFilters(filters);
  }, [category, brand, priceRange, minRating, inStockOnly, maxPrice]);

  // Handle search submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    if (search.trim() && !recentSearches.includes(search.trim())) {
      setRecentSearches(prev => [search.trim(), ...prev].slice(0, 5));
    }

    // Simulate search loading
    setIsSearching(true);
    setTimeout(() => {
      setIsSearching(false);
    }, 500);
  };

  // Reset all filters
  const resetFilters = () => {
    setCategory("All");
    setBrand("All");
    setPriceRange([0, maxPrice]);
    setMinRating(0);
    setInStockOnly(false);
    setSortBy("relevance");
  };

  // Remove a specific filter
  const removeFilter = (filter: string) => {
    if (filter.startsWith("Category:")) setCategory("All");
    else if (filter.startsWith("Brand:")) setBrand("All");
    else if (filter.startsWith("Price:")) setPriceRange([0, maxPrice]);
    else if (filter.startsWith("Rating:")) setMinRating(0);
    else if (filter === "In Stock Only") setInStockOnly(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="relative mb-10 bg-gradient-primary rounded-2xl overflow-hidden shadow-lg">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-64 h-64 rounded-full bg-secondary/30 blur-3xl"></div>
            <div className="absolute bottom-10 right-10 w-80 h-80 rounded-full bg-accent/20 blur-3xl"></div>
          </div>
          <div className="relative z-10 px-6 py-12 sm:px-12 sm:py-16 text-white text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold mb-4 text-white">
              Discover Perfect Products
            </h1>
            <p className="text-white/80 text-lg max-w-2xl mx-auto mb-8 font-light">
              Find exactly what you're looking for with our advanced product search and sentiment analysis
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="relative max-w-3xl mx-auto">
              <div className="flex shadow-xl rounded-xl overflow-hidden">
                <div className="relative flex-grow bg-white/10 backdrop-blur-sm">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/70" size={20} />
                  <Input
                    type="text"
                    placeholder="Search for products, brands, or categories..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-12 pr-4 py-4 text-white placeholder:text-white/60 bg-transparent border-0 focus-visible:ring-2 focus-visible:ring-white/30 text-lg"
                  />
                </div>
                <Button
                  type="submit"
                  className="rounded-l-none px-8 py-4 bg-secondary hover:bg-secondary-light text-white font-medium text-base"
                  disabled={isSearching}
                >
                  {isSearching ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : "Search"}
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Search suggestions - Now outside the hero section */}
        {search && (
          <div className="relative z-20 max-w-3xl mx-auto -mt-4 mb-8">
            <div className="bg-white rounded-xl shadow-xl border border-gray-100 p-4 backdrop-blur-sm">
              <div className="mb-4">
                <div className="flex items-center text-sm text-primary mb-3">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  <span className="font-medium">Trending Searches</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {trendingSearches.map((term) => (
                    <Badge
                      key={term}
                      variant="secondary"
                      className="cursor-pointer hover:bg-secondary/10 hover:text-secondary transition-colors py-1.5 px-3"
                      onClick={() => setSearch(term)}
                    >
                      {term}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center text-sm text-primary mb-3">
                  <History className="h-4 w-4 mr-2" />
                  <span className="font-medium">Recent Searches</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map((term) => (
                    <Badge
                      key={term}
                      variant="outline"
                      className="cursor-pointer hover:bg-gray-50 transition-colors py-1.5 px-3"
                      onClick={() => setSearch(term)}
                    >
                      {term}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Active Filters */}
        {activeFilters.length > 0 && (
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-100 p-4 mb-8">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm font-medium text-gray-700">Active Filters:</span>
              {activeFilters.map((filter) => (
                <Badge
                  key={filter}
                  variant="secondary"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                >
                  {filter}
                  <X
                    size={14}
                    className="cursor-pointer hover:text-primary-dark transition-colors"
                    onClick={() => removeFilter(filter)}
                  />
                </Badge>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={resetFilters}
                className="text-xs ml-auto border-gray-200 hover:bg-gray-50 hover:text-primary transition-colors"
              >
                Clear All Filters
              </Button>
            </div>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filters - Desktop */}
          <div className="hidden lg:block w-60 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4 sticky top-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-display text-base text-gray-900 font-semibold">Refine Results</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetFilters}
                  className="h-7 text-xs hover:text-primary hover:bg-primary/5 transition-colors px-2"
                >
                  Reset
                </Button>
              </div>

              <Accordion type="multiple" defaultValue={["category", "brand", "price", "rating"]} className="space-y-1">
                <AccordionItem value="category" className="border-b border-gray-100 pb-0.5">
                  <AccordionTrigger className="hover:text-primary hover:no-underline py-2 text-gray-800 font-medium text-sm">
                    Category
                  </AccordionTrigger>
                  <AccordionContent className="pt-1 pb-2">
                    <div className="space-y-1.5">
                      {categories.map((cat) => (
                        <div key={cat} className="flex items-center group">
                          <Checkbox
                            id={`category-${cat}`}
                            checked={category === cat}
                            onCheckedChange={() => setCategory(cat)}
                            className="data-[state=checked]:bg-primary data-[state=checked]:border-primary h-3.5 w-3.5"
                          />
                          <label
                            htmlFor={`category-${cat}`}
                            className="ml-2 text-xs text-gray-700 cursor-pointer group-hover:text-primary transition-colors"
                          >
                            {cat}
                          </label>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="brand" className="border-b border-gray-100 pb-1">
                  <AccordionTrigger className="hover:text-primary hover:no-underline py-3 text-gray-800 font-medium">
                    Brand
                  </AccordionTrigger>
                  <AccordionContent className="pt-2 pb-3">
                    <ScrollArea className="h-44 pr-4">
                      <div className="space-y-2.5 pr-4">
                        {brands.map((b) => (
                          <div key={b} className="flex items-center group">
                            <Checkbox
                              id={`brand-${b}`}
                              checked={brand === b}
                              onCheckedChange={() => setBrand(b)}
                              className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                            />
                            <label
                              htmlFor={`brand-${b}`}
                              className="ml-2.5 text-sm text-gray-700 cursor-pointer group-hover:text-primary transition-colors"
                            >
                              {b}
                            </label>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="price" className="border-b border-gray-100 pb-1">
                  <AccordionTrigger className="hover:text-primary hover:no-underline py-3 text-gray-800 font-medium">
                    Price Range
                  </AccordionTrigger>
                  <AccordionContent className="pt-2 pb-3">
                    <div className="space-y-6">
                      <Slider
                        defaultValue={[0, maxPrice]}
                        value={priceRange}
                        max={maxPrice}
                        step={10}
                        onValueChange={(value) => setPriceRange(value as [number, number])}
                        className="mt-6"
                      />
                      <div className="flex items-center justify-between">
                        <div className="px-3 py-1.5 bg-gray-50 rounded-md text-sm font-medium text-gray-700">
                          {formatPrice(priceRange[0])}
                        </div>
                        <div className="px-3 py-1.5 bg-gray-50 rounded-md text-sm font-medium text-gray-700">
                          {formatPrice(priceRange[1])}
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="rating" className="border-b border-gray-100 pb-1">
                  <AccordionTrigger className="hover:text-primary hover:no-underline py-3 text-gray-800 font-medium">
                    Rating
                  </AccordionTrigger>
                  <AccordionContent className="pt-2 pb-3">
                    <div className="space-y-3">
                      {[4, 3, 2, 1].map((rating) => (
                        <div key={rating} className="flex items-center group">
                          <Checkbox
                            id={`rating-${rating}`}
                            checked={minRating === rating}
                            onCheckedChange={() => setMinRating(minRating === rating ? 0 : rating)}
                            className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                          />
                          <label
                            htmlFor={`rating-${rating}`}
                            className="ml-2.5 flex items-center cursor-pointer group-hover:text-primary transition-colors"
                          >
                            <StarRating rating={rating} />
                            <span className="text-sm ml-2 text-gray-700">& Up</span>
                          </label>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="availability" className="border-b-0">
                  <AccordionTrigger className="hover:text-primary hover:no-underline py-3 text-gray-800 font-medium">
                    Availability
                  </AccordionTrigger>
                  <AccordionContent className="pt-2 pb-3">
                    <div className="flex items-center group">
                      <Checkbox
                        id="in-stock"
                        checked={inStockOnly}
                        onCheckedChange={() => setInStockOnly(!inStockOnly)}
                        className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                      />
                      <label
                        htmlFor="in-stock"
                        className="ml-2.5 text-sm text-gray-700 cursor-pointer group-hover:text-primary transition-colors"
                      >
                        In Stock Only
                      </label>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              <div className="mt-8 pt-6 border-t border-gray-100">
                <Button
                  className="w-full bg-primary hover:bg-primary-dark text-white"
                  onClick={() => setShowMobileFilters(false)}
                >
                  Apply Filters
                </Button>
              </div>
            </div>
          </div>

          {/* Mobile Filters */}
          <div className="lg:hidden flex items-center gap-3 mb-6">
            <Sheet open={showMobileFilters} onOpenChange={setShowMobileFilters}>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  className="flex items-center gap-2 border-gray-200 hover:bg-gray-50 hover:text-primary transition-colors"
                  onClick={() => setShowMobileFilters(true)}
                >
                  <Filter size={16} />
                  Filters
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[350px]">
                <SheetHeader className="mb-6">
                  <SheetTitle className="text-xl font-display text-gray-900">Filters</SheetTitle>
                  <SheetDescription className="text-gray-600">
                    Refine your product search
                  </SheetDescription>
                </SheetHeader>
                <div className="py-4">
                  <Accordion type="multiple" defaultValue={["category", "brand", "price", "rating"]} className="space-y-2">
                    <AccordionItem value="category" className="border-b border-gray-100 pb-1">
                      <AccordionTrigger className="hover:text-primary hover:no-underline py-3 text-gray-800 font-medium">
                        Category
                      </AccordionTrigger>
                      <AccordionContent className="pt-2 pb-3">
                        <div className="space-y-2.5">
                          {categories.map((cat) => (
                            <div key={cat} className="flex items-center group">
                              <Checkbox
                                id={`mobile-category-${cat}`}
                                checked={category === cat}
                                onCheckedChange={() => setCategory(cat)}
                                className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                              />
                              <label
                                htmlFor={`mobile-category-${cat}`}
                                className="ml-2.5 text-sm text-gray-700 cursor-pointer group-hover:text-primary transition-colors"
                              >
                                {cat}
                              </label>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="brand" className="border-b border-gray-100 pb-1">
                      <AccordionTrigger className="hover:text-primary hover:no-underline py-3 text-gray-800 font-medium">
                        Brand
                      </AccordionTrigger>
                      <AccordionContent className="pt-2 pb-3">
                        <ScrollArea className="h-44">
                          <div className="space-y-2.5 pr-4">
                            {brands.map((b) => (
                              <div key={b} className="flex items-center group">
                                <Checkbox
                                  id={`mobile-brand-${b}`}
                                  checked={brand === b}
                                  onCheckedChange={() => setBrand(b)}
                                  className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                />
                                <label
                                  htmlFor={`mobile-brand-${b}`}
                                  className="ml-2.5 text-sm text-gray-700 cursor-pointer group-hover:text-primary transition-colors"
                                >
                                  {b}
                                </label>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="price" className="border-b border-gray-100 pb-1">
                      <AccordionTrigger className="hover:text-primary hover:no-underline py-3 text-gray-800 font-medium">
                        Price Range
                      </AccordionTrigger>
                      <AccordionContent className="pt-2 pb-3">
                        <div className="space-y-6">
                          <Slider
                            defaultValue={[0, maxPrice]}
                            value={priceRange}
                            max={maxPrice}
                            step={10}
                            onValueChange={(value) => setPriceRange(value as [number, number])}
                            className="mt-6"
                          />
                          <div className="flex items-center justify-between">
                            <div className="px-3 py-1.5 bg-gray-50 rounded-md text-sm font-medium text-gray-700">
                              {formatPrice(priceRange[0])}
                            </div>
                            <div className="px-3 py-1.5 bg-gray-50 rounded-md text-sm font-medium text-gray-700">
                              {formatPrice(priceRange[1])}
                            </div>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="rating" className="border-b border-gray-100 pb-1">
                      <AccordionTrigger className="hover:text-primary hover:no-underline py-3 text-gray-800 font-medium">
                        Rating
                      </AccordionTrigger>
                      <AccordionContent className="pt-2 pb-3">
                        <div className="space-y-3">
                          {[4, 3, 2, 1].map((rating) => (
                            <div key={rating} className="flex items-center group">
                              <Checkbox
                                id={`mobile-rating-${rating}`}
                                checked={minRating === rating}
                                onCheckedChange={() => setMinRating(minRating === rating ? 0 : rating)}
                                className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                              />
                              <label
                                htmlFor={`mobile-rating-${rating}`}
                                className="ml-2.5 flex items-center cursor-pointer group-hover:text-primary transition-colors"
                              >
                                <StarRating rating={rating} />
                                <span className="text-sm ml-2 text-gray-700">& Up</span>
                              </label>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="availability" className="border-b-0">
                      <AccordionTrigger className="hover:text-primary hover:no-underline py-3 text-gray-800 font-medium">
                        Availability
                      </AccordionTrigger>
                      <AccordionContent className="pt-2 pb-3">
                        <div className="flex items-center group">
                          <Checkbox
                            id="mobile-in-stock"
                            checked={inStockOnly}
                            onCheckedChange={() => setInStockOnly(!inStockOnly)}
                            className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                          />
                          <label
                            htmlFor="mobile-in-stock"
                            className="ml-2.5 text-sm text-gray-700 cursor-pointer group-hover:text-primary transition-colors"
                          >
                            In Stock Only
                          </label>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
                <SheetFooter className="flex-col gap-3 sm:flex-col mt-6">
                  <Button
                    onClick={() => setShowMobileFilters(false)}
                    className="w-full bg-primary hover:bg-primary-dark text-white"
                  >
                    Apply Filters
                  </Button>
                  <Button
                    variant="outline"
                    onClick={resetFilters}
                    className="w-full border-gray-200"
                  >
                    Reset All
                  </Button>
                </SheetFooter>
              </SheetContent>
            </Sheet>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-[180px] border-gray-200">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center gap-1 ml-auto">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode("grid")}
                className={`rounded-full ${viewMode === "grid" ? "bg-primary/10 text-primary" : "text-gray-500"}`}
              >
                <Grid size={18} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode("list")}
                className={`rounded-full ${viewMode === "list" ? "bg-primary/10 text-primary" : "text-gray-500"}`}
              >
                <List size={18} />
              </Button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-grow">
            {/* Results Header */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <p className="text-sm text-gray-600">
                    Showing <span className="font-semibold text-gray-900">{filteredProducts.length}</span> results
                    {search && <span> for "<span className="font-semibold text-primary">{search}</span>"</span>}
                  </p>
                </div>
                <div className="hidden lg:flex items-center gap-4">
                  <div className="flex-grow-0">
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-[200px] border-gray-200">
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        {sortOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setViewMode("grid")}
                      className={`rounded-full ${viewMode === "grid" ? "bg-primary/10 text-primary" : "text-gray-500"}`}
                    >
                      <Grid size={18} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setViewMode("list")}
                      className={`rounded-full ${viewMode === "list" ? "bg-primary/10 text-primary" : "text-gray-500"}`}
                    >
                      <List size={18} />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Product Grid/List */}
            {filteredProducts.length > 0 ? (
              <div className={`grid gap-4 ${
                viewMode === "grid"
                  ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                  : "grid-cols-1"
              }`}>
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    name={product.name}
                    brand={product.brand}
                    category={product.category}
                    price={product.price}
                    originalPrice={product.discount > 0 ? product.price : undefined}
                    rating={product.rating}
                    reviewCount={product.reviews}
                    sentimentScore={0.7} // Mock sentiment score
                    image={product.image}
                    description={product.description}
                    inStock={product.inStock}
                    discount={product.discount}
                    tags={product.tags}
                    viewMode={viewMode}
                    onAddToCompare={() => console.log('Add to compare', product.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 px-8 bg-white rounded-xl border border-gray-100 shadow-sm">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-6">
                  <Info size={28} className="text-gray-400" />
                </div>
                <h2 className="text-2xl font-display font-bold mb-3 text-gray-900">No products found</h2>
                <p className="text-gray-600 max-w-md mx-auto mb-6">
                  We couldn't find any products matching your criteria. Try adjusting your filters or searching for something else.
                </p>
                <Button
                  variant="outline"
                  onClick={resetFilters}
                  className="border-gray-200 hover:bg-primary hover:text-white transition-colors"
                >
                  Clear All Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

