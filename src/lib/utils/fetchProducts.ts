const __DEV__ = process.env.NODE_ENV == "development";
const api = __DEV__ ? 'http://127.0.0.1:8000' : 'https://mc.15.206.47.74.nip.io';

export async function fetchAllProducts(filters?: Record<string, string | number | undefined>) {
  let url = `${api}/api/public/products/`;
  if (filters && Object.keys(filters).length > 0) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== "") params.append(key, String(value));
    });
    url += `?${params.toString()}`;
  }
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch products');
  return res.json();
}

export async function fetchProductByHandle(handle: string) {
  const res = await fetch(`${api}/api/public/products/${handle}/`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch product');
  const data = await res.json();
  return Array.isArray(data) ? data[0] : data;
}
