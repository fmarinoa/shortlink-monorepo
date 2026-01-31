const { VITE_API_URL } = import.meta.env;

if (!VITE_API_URL) {
  throw new Error("VITE_API_URL environment variable is required");
}

export { VITE_API_URL };
