// Custom Product interface for our API data
export interface CustomProduct {
  id: number;
  name: string;
  handle: string;
  featured_image: {
    url: string;
    altText: string;
  };
  price: string;
  compare_at_price: string;
  source: {
    id: number;
    store_name: string;
    base_url: string;
    collection: string;
  };
  vendor: string;
  collections: {
    nodes: Array<{
      title: string;
      handle: string;
    }>;
  };
  tags: string[];
  variants: any[];
  source_url?: string;
}

// Custom Collection interface for our API data
export interface CustomCollection {
  title: string;
  handle: string;
  products: {
    edges: any[];
  };
}

// Custom Vendor interface for our API data
export interface CustomVendor {
  vendor: string;
  productCount: number;
}

// Search parameters interface
export interface SearchParams {
  sort?: string;
  q?: string;
  minPrice?: string;
  maxPrice?: string;
  b?: string;
  c?: string;
  t?: string;
  size?: string | string[];
  color?: string | string[];
  page?: string;
  perPage?: string;
}

// API response interface
export interface ApiResponse {
  data: CustomProduct[];
  count?: number;
  next?: string;
  previous?: string;
}
