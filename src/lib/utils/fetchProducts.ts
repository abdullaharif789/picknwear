const __DEV__ = process.env.NODE_ENV == "development";
const api = __DEV__ ? 'http://127.0.0.1:8000' : 'https://mc.15.206.47.74.nip.io';

export async function fetchAllProducts(filters?: Record<string, string | number | undefined>) {
  let url = `${api}/api/public/products/`;
  if (filters && Object.keys(filters).length > 0) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== "") {
        switch (key) {
          case 'search':
            params.append('search', String(value));
            break;
          case 'min_price':
            params.append('min_price', String(value));
            break;
          case 'max_price':
            params.append('max_price', String(value));
            break;
          case 'brand':
            params.append('brand', String(value));
            break;
          case 'category':
            params.append('category', String(value));
            break;
          case 'sort':
            params.append('ordering', String(value));
            break;
          case 'page':
            params.append('page', String(value));
            break;
          case 'perPage':
            params.append('perPage', String(value));
            break;
          default:
            params.append(key, String(value));
        }
      }
    });

    if (!params.has('perPage')) {
      params.append('perPage', '54');
    }

    url += `?${params.toString()}`;
  } else {
    url += '?perPage=54';
  }

  const res = await fetch(url, {
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
    }
  });

  if (!res.ok) {
    console.error('Failed to fetch products:', res.status, res.statusText);
    throw new Error('Failed to fetch products');
  }

  return res.json();
}

export async function fetchProductByHandle(handle: string) {
  const res = await fetch(`${api}/api/public/products/${handle}/`, {
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
    }
  });

  if (!res.ok) {
    console.error('Failed to fetch product:', res.status, res.statusText);
    throw new Error('Failed to fetch product');
  }

  const data = await res.json();
  return Array.isArray(data) ? data[0] : data;
}
