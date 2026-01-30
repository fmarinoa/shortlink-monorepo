import { DynamoRepositoryImp } from "@/repositories/DynamoRepositoryImp";
import { Link, SlugAlreadyExistsError, SlugNotFoundError } from "@/domains";
import { dynamoClient } from "@/lib";
import {
  PutCommand,
  GetCommand,
  UpdateCommand,
  DeleteCommand,
  ScanCommand,
} from "@aws-sdk/lib-dynamodb";

jest.mock("@/lib", () => ({
  dynamoClient: {
    send: jest.fn(),
  },
}));

describe("DynamoRepositoryImp", () => {
  let repository: DynamoRepositoryImp;
  const tableName = "TestTable";

  beforeEach(() => {
    repository = new DynamoRepositoryImp(tableName);
    jest.clearAllMocks();
  });

  describe("createLink", () => {
    it("should create link successfully", async () => {
      const link = Link.create({
        slug: "test",
        url: "https://example.com",
      }).getValue();

      (dynamoClient.send as jest.Mock).mockResolvedValue({});

      const result = await repository.createLink(link);

      expect(result.isSuccess).toBe(true);
      expect(dynamoClient.send).toHaveBeenCalledWith(
        expect.any(PutCommand),
      );
    });

    it("should fail when slug already exists", async () => {
      const link = Link.create({
        slug: "test",
        url: "https://example.com",
      }).getValue();

      const error = new Error("Conditional check failed");
      error.name = "ConditionalCheckFailedException";
      (dynamoClient.send as jest.Mock).mockRejectedValue(error);

      const result = await repository.createLink(link);

      expect(result.isSuccess).toBe(false);
      expect(result.getErrorValue()).toBeInstanceOf(SlugAlreadyExistsError);
    });

    it("should fail with generic error on other errors", async () => {
      const link = Link.create({
        slug: "test",
        url: "https://example.com",
      }).getValue();

      (dynamoClient.send as jest.Mock).mockRejectedValue(
        new Error("DynamoDB error"),
      );

      const result = await repository.createLink(link);

      expect(result.isSuccess).toBe(false);
      expect(result.getErrorValue().message).toContain(
        "Error creating link in DynamoDB",
      );
    });
  });

  describe("getLink", () => {
    it("should get link successfully", async () => {
      const linkData = {
        slug: "test",
        url: "https://example.com",
        creationDate: Date.now(),
        visitCount: 5,
      };

      (dynamoClient.send as jest.Mock).mockResolvedValue({ Item: linkData });

      const result = await repository.getLink("test");

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().slug).toBe("test");
      expect(dynamoClient.send).toHaveBeenCalledWith(expect.any(GetCommand));
    });

    it("should fail when link not found", async () => {
      (dynamoClient.send as jest.Mock).mockResolvedValue({});

      const result = await repository.getLink("test");

      expect(result.isSuccess).toBe(false);
      expect(result.getErrorValue().message).toContain("not found");
    });
  });

  describe("incrementLinkVisitCount", () => {
    it("should increment visit count successfully", async () => {
      (dynamoClient.send as jest.Mock).mockResolvedValue({
        Attributes: { visitCount: 6 },
      });

      const result = await repository.incrementLinkVisitCount("test");

      expect(result.isSuccess).toBe(true);
      expect(result.getValue()).toBe(6);
      expect(dynamoClient.send).toHaveBeenCalledWith(
        expect.any(UpdateCommand),
      );
    });

    it("should handle errors when incrementing", async () => {
      (dynamoClient.send as jest.Mock).mockRejectedValue(
        new Error("DynamoDB error"),
      );

      const result = await repository.incrementLinkVisitCount("test");

      expect(result.isSuccess).toBe(false);
    });
  });

  describe("getAllLinks", () => {
    it("should get all links successfully", async () => {
      const links = [
        {
          slug: "test1",
          url: "https://example1.com",
          creationDate: Date.now(),
          visitCount: 5,
        },
        {
          slug: "test2",
          url: "https://example2.com",
          creationDate: Date.now(),
          visitCount: 10,
        },
      ];

      (dynamoClient.send as jest.Mock).mockResolvedValue({ Items: links });

      const result = await repository.getAllLinks();

      expect(result.isSuccess).toBe(true);
      expect(result.getValue()).toHaveLength(2);
      expect(dynamoClient.send).toHaveBeenCalledWith(expect.any(ScanCommand));
    });

    it("should return empty array when no links", async () => {
      (dynamoClient.send as jest.Mock).mockResolvedValue({});

      const result = await repository.getAllLinks();

      expect(result.isSuccess).toBe(true);
      expect(result.getValue()).toEqual([]);
    });
  });

  describe("deleteLink", () => {
    it("should delete link successfully", async () => {
      (dynamoClient.send as jest.Mock).mockResolvedValue({});

      const result = await repository.deleteLink("test");

      expect(result.isSuccess).toBe(true);
      expect(dynamoClient.send).toHaveBeenCalledWith(
        expect.any(DeleteCommand),
      );
    });

    it("should fail when slug not found", async () => {
      const error = new Error("Conditional check failed");
      error.name = "ConditionalCheckFailedException";
      (dynamoClient.send as jest.Mock).mockRejectedValue(error);

      const result = await repository.deleteLink("test");

      expect(result.isSuccess).toBe(false);
      expect(result.getErrorValue()).toBeInstanceOf(SlugNotFoundError);
    });
  });

  describe("updateLink", () => {
    it("should update link successfully", async () => {
      (dynamoClient.send as jest.Mock).mockResolvedValue({});

      const result = await repository.updateLink("test", "https://new-url.com");

      expect(result.isSuccess).toBe(true);
      expect(dynamoClient.send).toHaveBeenCalledWith(
        expect.any(UpdateCommand),
      );
    });

    it("should fail when slug not found", async () => {
      const error = new Error("Conditional check failed");
      error.name = "ConditionalCheckFailedException";
      (dynamoClient.send as jest.Mock).mockRejectedValue(error);

      const result = await repository.updateLink("test", "https://new-url.com");

      expect(result.isSuccess).toBe(false);
      expect(result.getErrorValue()).toBeInstanceOf(SlugNotFoundError);
    });
  });
});
