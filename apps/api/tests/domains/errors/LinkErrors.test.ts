import {
  LinkNotFoundError,
  SlugAlreadyExistsError,
  SlugNotFoundError,
} from "@/domains/errors/LinkErrors";

describe("Link Errors", () => {
  describe("LinkNotFoundError", () => {
    it("should create error with correct message", () => {
      const error = new LinkNotFoundError("test-slug");

      expect(error.message).toBe("Link with slug 'test-slug' not found");
      expect(error.name).toBe("LinkNotFoundError");
      expect(error).toBeInstanceOf(Error);
    });
  });

  describe("SlugAlreadyExistsError", () => {
    it("should create error with correct message", () => {
      const error = new SlugAlreadyExistsError("test-slug");

      expect(error.message).toBe("Slug 'test-slug' already exists");
      expect(error.name).toBe("SlugAlreadyExistsError");
      expect(error).toBeInstanceOf(Error);
    });
  });

  describe("SlugNotFoundError", () => {
    it("should create error with correct message", () => {
      const error = new SlugNotFoundError("test-slug");

      expect(error.message).toBe("Slug 'test-slug' not found");
      expect(error.name).toBe("SlugNotFoundError");
      expect(error).toBeInstanceOf(Error);
    });
  });
});
