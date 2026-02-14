import { Repository } from "@/repositories/Repository";
import { SlugAlreadyExistsError, LinkNotFoundError, Link } from "@/domains";
import { Result } from "@shortlink/core";
import { createdLink, updatedLink } from "../fixtures/links";
import { LinksServiceImpStub } from "./index";

describe("LinksServiceImp", () => {
  const apiUrl = "https://test-api.com";

  describe("createLink", () => {
    it("should create link successfully and return short URL", async () => {
      const mockRepository = {
        create: jest.fn().mockResolvedValue(
          Result.ok(new Link(createdLink))
        )
      } as unknown as jest.Mocked<Repository>;

      const service = new LinksServiceImpStub({ repository: mockRepository, apiUrl });

      const link = new Link(createdLink);

      const result = await service.createLink(link);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue()).toEqual({
        shortUrl: "https://test-api.com/test",
      });
      expect(mockRepository.create).toHaveBeenCalledWith(link);
    });

    it("should fail when slug already exists", async () => {
      const mockRepository = {
        create: jest.fn().mockResolvedValue(
          Result.fail(new SlugAlreadyExistsError("test"))
        )
      } as unknown as jest.Mocked<Repository>;

      const service = new LinksServiceImpStub({ repository: mockRepository, apiUrl });

      const link = new Link(createdLink);

      const result = await service.createLink(link);

      expect(result.isSuccess).toBe(false);
      expect(result.getErrorValue()).toBeInstanceOf(SlugAlreadyExistsError);
      expect(result.getErrorValue().message).toBe("Slug 'test' already exists");
      expect(mockRepository.create).toHaveBeenCalledWith(link);
    });
  });

  describe("redirectLink", () => {
    it("should return URL when link exists and increment visit count", async () => {
      const link = new Link(createdLink);

      const mockRepository = {
        getBySlug: jest.fn().mockResolvedValue(Result.ok(link)),
        update: jest.fn().mockResolvedValue(Result.ok(link))
      } as unknown as jest.Mocked<Repository>;

      const service = new LinksServiceImpStub({ repository: mockRepository, apiUrl });

      const result = await service.redirectLink(link);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue()).toBe("https://example.com");
      expect(mockRepository.getBySlug).toHaveBeenCalledWith("test");
      expect(mockRepository.update).toHaveBeenCalled();
    });

    it("should update link with lastVisitDate when redirecting", async () => {
      const link = new Link(createdLink);

      const mockRepository = {
        getBySlug: jest.fn().mockResolvedValue(Result.ok(link)),
        update: jest.fn().mockResolvedValue(Result.ok(link))
      } as unknown as jest.Mocked<Repository>;

      const service = new LinksServiceImpStub({ repository: mockRepository, apiUrl });

      await service.redirectLink(link);

      expect(mockRepository.update).toHaveBeenCalledWith(
        expect.any(Link),
        { lastUpdateDate: false, lastVisitDate: true }
      );
    });

    it("should return portfolio URL when slug is empty", async () => {
      const mockRepository = {} as unknown as jest.Mocked<Repository>;
      const service = new LinksServiceImpStub({ repository: mockRepository, apiUrl });

      const link = new Link({ slug: "", url: "" });
      const result = await service.redirectLink(link);

      expect(result.isSuccess).toBe(false);
      expect(result.getErrorValue()).toContain("portfolio");
    });

    it("should return portfolio URL when link not found", async () => {
      const mockRepository = {
        getBySlug: jest.fn().mockResolvedValue(
          Result.fail(new LinkNotFoundError("test"))
        )
      } as unknown as jest.Mocked<Repository>;

      const service = new LinksServiceImpStub({ repository: mockRepository, apiUrl });

      const link = new Link({ slug: "test", url: "" });
      const result = await service.redirectLink(link);

      expect(result.isSuccess).toBe(false);
      expect(result.getErrorValue()).toContain("portfolio");
    });
  });

  describe("getAllLinks", () => {
    it("should return all links with count", async () => {
      const links = [
        new Link({ ...createdLink, slug: "test1", visitCount: 5 }),
        new Link({ ...createdLink, slug: "test2", url: "https://example2.com", visitCount: 10 })
      ];

      const mockRepository = {
        getAll: jest.fn().mockResolvedValue(Result.ok(links))
      } as unknown as jest.Mocked<Repository>;

      const service = new LinksServiceImpStub({ repository: mockRepository, apiUrl });

      const result = await service.getAllLinks();

      expect(result.isSuccess).toBe(true);
      const value = result.getValue();
      expect(value.total).toBe(2);
      expect(value.data).toHaveLength(2);
    });

    it("should return empty array when no links", async () => {
      const mockRepository = {
        getAll: jest.fn().mockResolvedValue(Result.ok([]))
      } as unknown as jest.Mocked<Repository>;

      const service = new LinksServiceImpStub({ repository: mockRepository, apiUrl });

      const result = await service.getAllLinks();

      expect(result.isSuccess).toBe(true);
      expect(result.getValue()).toEqual({
        total: 0,
        data: [],
      });
    });
  });

  describe("deleteLink", () => {
    it("should delete link successfully", async () => {
      const link = new Link(createdLink);

      const mockRepository = {
        delete: jest.fn().mockResolvedValue(Result.ok())
      } as unknown as jest.Mocked<Repository>;

      const service = new LinksServiceImpStub({ repository: mockRepository, apiUrl });

      const result = await service.deleteLink(link);

      expect(result.isSuccess).toBe(true);
      expect(mockRepository.delete).toHaveBeenCalledWith(link);
    });

    it("should fail when link not found", async () => {
      const link = new Link(createdLink);
      const error = new Error("Link not found");

      const mockRepository = {
        delete: jest.fn().mockResolvedValue(Result.fail(error))
      } as unknown as jest.Mocked<Repository>;

      const service = new LinksServiceImpStub({ repository: mockRepository, apiUrl });

      const result = await service.deleteLink(link);

      expect(result.isSuccess).toBe(false);
      expect(result.getErrorValue()).toBe(error);
    });
  });

  describe("updateLink", () => {
    it("should update link successfully", async () => {
      const link = new Link(createdLink);
      const linkUpdated = new Link({ ...updatedLink, url: "https://new-url.com" });

      const mockRepository = {
        getBySlug: jest.fn().mockResolvedValue(Result.ok(link)),
        update: jest.fn().mockResolvedValue(Result.ok(linkUpdated))
      } as unknown as jest.Mocked<Repository>;

      const service = new LinksServiceImpStub({ repository: mockRepository, apiUrl });

      const result = await service.updateLink({ link, newUrl: "https://new-url.com" });

      expect(result.isSuccess).toBe(true);
      expect(result.getValue()).toEqual({
        slug: "test",
        url: "https://new-url.com",
        shortUrl: "https://test-api.com/test",
      });
      expect(mockRepository.update).toHaveBeenCalled();
    });

    it("should fail when slug not found", async () => {
      const link = new Link(createdLink);
      const error = new Error("Slug not found");

      const mockRepository = {
        getBySlug: jest.fn().mockResolvedValue(Result.fail(error))
      } as unknown as jest.Mocked<Repository>;

      const service = new LinksServiceImpStub({ repository: mockRepository, apiUrl });

      const result = await service.updateLink({ link, newUrl: "https://new-url.com" });

      expect(result.isSuccess).toBe(false);
      expect(result.getErrorValue()).toBe(error);
    });
  });
});
