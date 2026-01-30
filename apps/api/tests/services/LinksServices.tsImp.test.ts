import { LinksServicesImp } from "@/services/LinksServices.tsImp";
import { IRepository } from "@/repositories/IRepository";
import { Link, SlugAlreadyExistsError, LinkNotFoundError } from "@/domains";
import { Result } from "@shortlink/core";

describe("LinksServicesImp", () => {
  let service: LinksServicesImp;
  let mockRepository: jest.Mocked<IRepository>;
  const apiUrl = "https://test-api.com";

  beforeEach(() => {
    mockRepository = {
      createLink: jest.fn(),
      getLink: jest.fn(),
      getAllLinks: jest.fn(),
      deleteLink: jest.fn(),
      updateLink: jest.fn(),
      incrementLinkVisitCount: jest.fn(),
    } as jest.Mocked<IRepository>;

    service = new LinksServicesImp(mockRepository, apiUrl);
  });

  describe("createLink", () => {
    it("should create link successfully and return short URL", async () => {
      const link = Link.create({
        slug: "test",
        url: "https://example.com",
      }).getValue();

      mockRepository.createLink.mockResolvedValue(Result.ok());

      const result = await service.createLink(link);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue()).toEqual({
        shortUrl: "https://test-api.com/test",
      });
      expect(mockRepository.createLink).toHaveBeenCalledWith(link);
    });

    it("should fail when slug already exists", async () => {
      const link = Link.create({
        slug: "test",
        url: "https://example.com",
      }).getValue();

      const error = new SlugAlreadyExistsError("test");
      mockRepository.createLink.mockResolvedValue(Result.fail(error));

      const result = await service.createLink(link);

      expect(result.isSuccess).toBe(false);
      expect(result.getErrorValue()).toBe(error);
    });
  });

  describe("redirectLink", () => {
    it("should return URL when link exists", async () => {
      const link = Link.reconstitute({
        slug: "test",
        url: "https://example.com",
        creationDate: Date.now(),
        visitCount: 0,
      });

      mockRepository.getLink.mockResolvedValue(Result.ok(link));
      mockRepository.incrementLinkVisitCount.mockResolvedValue(Result.ok(1));

      const result = await service.redirectLink("test");

      expect(result.isSuccess).toBe(true);
      expect(result.getValue()).toBe("https://example.com");
      expect(mockRepository.incrementLinkVisitCount).toHaveBeenCalledWith(
        "test",
      );
    });

    it("should return portfolio URL when slug is empty", async () => {
      const result = await service.redirectLink("");

      expect(result.isSuccess).toBe(false);
      expect(result.getErrorValue()).toContain("portfolio");
    });

    it("should return portfolio URL when slug is undefined", async () => {
      const result = await service.redirectLink(undefined);

      expect(result.isSuccess).toBe(false);
      expect(result.getErrorValue()).toContain("portfolio");
    });

    it("should return portfolio URL when link not found", async () => {
      mockRepository.getLink.mockResolvedValue(
        Result.fail(new LinkNotFoundError("test")),
      );

      const result = await service.redirectLink("test");

      expect(result.isSuccess).toBe(false);
      expect(result.getErrorValue()).toContain("portfolio");
    });
  });

  describe("getAllLinks", () => {
    it("should return all links with count", async () => {
      const links = [
        Link.reconstitute({
          slug: "test1",
          url: "https://example1.com",
          creationDate: Date.now(),
          visitCount: 5,
        }),
        Link.reconstitute({
          slug: "test2",
          url: "https://example2.com",
          creationDate: Date.now(),
          visitCount: 10,
        })
      ];

      mockRepository.getAllLinks.mockResolvedValue(Result.ok(links));

      const result = await service.getAllLinks();

      expect(result.isSuccess).toBe(true);
      expect(result.getValue()).toEqual({
        total: 2,
        data: links.map(link => link.toJSON()),
      });
    });

    it("should return empty array when no links", async () => {
      mockRepository.getAllLinks.mockResolvedValue(Result.ok([]));

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
      mockRepository.deleteLink.mockResolvedValue(Result.ok());

      const result = await service.deleteLink("test");

      expect(result.isSuccess).toBe(true);
      expect(mockRepository.deleteLink).toHaveBeenCalledWith("test");
    });

    it("should fail when link not found", async () => {
      const error = new Error("Link not found");
      mockRepository.deleteLink.mockResolvedValue(Result.fail(error));

      const result = await service.deleteLink("test");

      expect(result.isSuccess).toBe(false);
      expect(result.getErrorValue()).toBe(error);
    });
  });

  describe("updateLink", () => {
    it("should update link successfully", async () => {
      mockRepository.updateLink.mockResolvedValue(Result.ok());

      const result = await service.updateLink("test", "https://new-url.com");

      expect(result.isSuccess).toBe(true);
      expect(result.getValue()).toEqual({
        slug: "test",
        url: "https://new-url.com",
        shortUrl: "https://test-api.com/test",
      });
      expect(mockRepository.updateLink).toHaveBeenCalledWith(
        "test",
        "https://new-url.com",
      );
    });

    it("should fail when slug not found", async () => {
      const error = new Error("Slug not found");
      mockRepository.updateLink.mockResolvedValue(Result.fail(error));

      const result = await service.updateLink("test", "https://new-url.com");

      expect(result.isSuccess).toBe(false);
      expect(result.getErrorValue()).toBe(error);
    });
  });
});
