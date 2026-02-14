export const createdLink = {
  slug: "test",
  url: "https://example.com",
  creationDate: Date.now(),
  visitCount: 0,
  lastVisitDate: 0,
};

export const updatedLink = {
  slug: "test",
  url: "https://example.com",
  creationDate: Date.now() - 1000 * 60 * 60, // 1 hour ago
  lastUpdateDate: Date.now(),
  lastVisitDate: Date.now(),
  visitCount: 1,
};
