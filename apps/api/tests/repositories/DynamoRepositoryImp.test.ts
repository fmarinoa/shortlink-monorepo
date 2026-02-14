import { DynamoRepositoryImp } from "@/repositories/DynamoRepositoryImp";
import { SlugAlreadyExistsError, SlugNotFoundError, Link, LinkNotFoundError } from "@/domains";
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
    repository = new DynamoRepositoryImp({ tableName });
    jest.clearAllMocks();
  });

  describe("create", () => {
    it("should create link successfully", async () => {
      const linkResult = Link.instanceForCreate({
        slug: "test",
        url: "https://example.com",
      });
      
      const link = linkResult.getValue();

      (dynamoClient.send as jest.Mock).mockResolvedValue({});

      const result = await repository.create(link);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().slug).toBe("test");
      expect(dynamoClient.send).toHaveBeenCalledWith(
        expect.any(PutCommand),
      );
    });

    it("should fail when slug already exists", async () => {
      const linkResult = Link.instanceForCreate({
        slug: "test",
        url: "https://example.com",
      });
      
      const link = linkResult.getValue();

      const error = new Error("Conditional check failed");
      error.name = "ConditionalCheckFailedException";
      (dynamoClient.send as jest.Mock).mockRejectedValue(error);

      const result = await repository.create(link);

      expect(result.isSuccess).toBe(false);
      expect(result.getErrorValue()).toBeInstanceOf(SlugAlreadyExistsError);
    });

    it("should fail with generic error on other errors", async () => {
      const linkResult = Link.instanceForCreate({
        slug: "test",
        url: "https://example.com",
      });
      
      const link = linkResult.getValue();

      (dynamoClient.send as jest.Mock).mockRejectedValue(
        new Error("DynamoDB error"),
      );

      const result = await repository.create(link);

      expect(result.isSuccess).toBe(false);
      expect(result.getErrorValue().message).toContain(
        "Error creating Link in DynamoDB",
      );
    });
  });

  describe("getBySlug", () => {
    it("should get link successfully", async () => {
      const linkData = {
        slug: "test",
        url: "https://example.com",
        creationDate: Date.now(),
        visitCount: 5,
      };

      (dynamoClient.send as jest.Mock).mockResolvedValue({ Item: linkData });

      const result = await repository.getBySlug("test");

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().slug).toBe("test");
      expect(dynamoClient.send).toHaveBeenCalledWith(expect.any(GetCommand));
    });

    it("should fail when link not found", async () => {
      (dynamoClient.send as jest.Mock).mockResolvedValue({});

      const result = await repository.getBySlug("test");

      expect(result.isSuccess).toBe(false);
      expect(result.getErrorValue()).toBeInstanceOf(LinkNotFoundError);
    });
  });

  describe("getAll", () => {
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

      const result = await repository.getAll();

      expect(result.isSuccess).toBe(true);
      expect(result.getValue()).toHaveLength(2);
      expect(dynamoClient.send).toHaveBeenCalledWith(expect.any(ScanCommand));
    });

    it("should return empty array when no links", async () => {
      (dynamoClient.send as jest.Mock).mockResolvedValue({});

      const result = await repository.getAll();

      expect(result.isSuccess).toBe(true);
      expect(result.getValue()).toEqual([]);
    });

    it("should handle errors when getting all links", async () => {
      (dynamoClient.send as jest.Mock).mockRejectedValue(
        new Error("DynamoDB error"),
      );

      const result = await repository.getAll();

      expect(result.isSuccess).toBe(false);
      expect(result.getErrorValue().message).toContain(
        "Error retrieving all links from DynamoDB",
      );
    });
  });

  describe("delete", () => {
    it("should delete link successfully", async () => {
      const link = new Link({ slug: "test", url: "https://example.com" });

      (dynamoClient.send as jest.Mock).mockResolvedValue({});

      const result = await repository.delete(link);

      expect(result.isSuccess).toBe(true);
      expect(dynamoClient.send).toHaveBeenCalledWith(
        expect.any(DeleteCommand),
      );
    });

    it("should fail when slug not found", async () => {
      const link = new Link({ slug: "test", url: "https://example.com" });

      const error = new Error("Conditional check failed");
      error.name = "ConditionalCheckFailedException";
      (dynamoClient.send as jest.Mock).mockRejectedValue(error);

      const result = await repository.delete(link);

      expect(result.isSuccess).toBe(false);
      expect(result.getErrorValue()).toBeInstanceOf(SlugNotFoundError);
    });

    it("should fail with generic error on other errors", async () => {
      const link = new Link({ slug: "test", url: "https://example.com" });

      (dynamoClient.send as jest.Mock).mockRejectedValue(
        new Error("DynamoDB error"),
      );

      const result = await repository.delete(link);

      expect(result.isSuccess).toBe(false);
      expect(result.getErrorValue().message).toContain(
        "Error deleting Link in DynamoDB",
      );
    });
  });

  describe("update", () => {
    it("should update link successfully", async () => {
      const link = new Link({ 
        slug: "test", 
        url: "https://new-url.com",
        visitCount: 5,
        creationDate: Date.now()
      });

      (dynamoClient.send as jest.Mock).mockResolvedValue({});

      const result = await repository.update(link);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().slug).toBe("test");
      expect(result.getValue().url).toBe("https://new-url.com");
      expect(dynamoClient.send).toHaveBeenCalledWith(
        expect.any(UpdateCommand),
      );
    });

    it("should fail when slug not found", async () => {
      const link = new Link({ 
        slug: "test", 
        url: "https://new-url.com" 
      });

      const error = new Error("Conditional check failed");
      error.name = "ConditionalCheckFailedException";
      (dynamoClient.send as jest.Mock).mockRejectedValue(error);

      const result = await repository.update(link);

      expect(result.isSuccess).toBe(false);
      expect(result.getErrorValue()).toBeInstanceOf(SlugNotFoundError);
    });

    it("should fail with generic error on other errors", async () => {
      const link = new Link({ 
        slug: "test", 
        url: "https://new-url.com" 
      });

      (dynamoClient.send as jest.Mock).mockRejectedValue(
        new Error("DynamoDB error"),
      );

      const result = await repository.update(link);

      expect(result.isSuccess).toBe(false);
      expect(result.getErrorValue().message).toContain(
        "Error updating Link in DynamoDB",
      );
    });
  });
});
