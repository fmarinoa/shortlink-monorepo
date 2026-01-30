export const setApiKey = (apiKey: string) => {
  localStorage.setItem("admin_api_key", apiKey);
};
export const getApiKey = (): string | null => {
  return localStorage.getItem("admin_api_key");
};
