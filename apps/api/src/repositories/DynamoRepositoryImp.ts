import {
  Link,
  SlugAlreadyExistsError,
  LinkNotFoundError,
  SlugNotFoundError,
} from "@/domains";
import { dynamoClient } from "@/lib";
import {
  DeleteCommand,
  GetCommand,
  PutCommand,
  ScanCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { IRepository } from "./IRepository";
import { LinkType, Result } from "@shortlink/core";

export class DynamoRepositoryImp implements IRepository {
  private readonly tableName: string;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  async createLink(link: Link): Promise<Result<void, Error>> {
    try {
      await dynamoClient.send(
        new PutCommand({
          TableName: this.tableName,
          Item: link.toJSON(),
          ConditionExpression: "attribute_not_exists(slug)",
        }),
      );
      return Result.ok();
    } catch (error) {
      if (
        error instanceof Error &&
        error.name === "ConditionalCheckFailedException"
      ) {
        return Result.fail(new SlugAlreadyExistsError(link.slug));
      }

      return Result.fail(
        new Error(`Error creating link in DynamoDB: ${error}`),
      );
    }
  }

  async getLink(slug: string): Promise<Result<Link, Error>> {
    const { Item: link } = await dynamoClient.send(
      new GetCommand({
        TableName: this.tableName,
        Key: { slug: slug },
      }),
    );

    if (!link) {
      return Result.fail(new LinkNotFoundError(slug));
    }

    return Result.ok(Link.reconstitute(link as LinkType));
  }

  async incrementLinkVisitCount(slug: string): Promise<Result<number, Error>> {
    try {
      const { Attributes } = await dynamoClient.send(
        new UpdateCommand({
          TableName: this.tableName,
          Key: { slug: slug },
          UpdateExpression:
            "SET visitCount = if_not_exists(visitCount, :start) + :inc",
          ExpressionAttributeValues: {
            ":inc": 1,
            ":start": 0,
          },
          ReturnValues: "ALL_NEW",
        }),
      );
      return Result.ok(Number(Attributes?.visitCount) || 0);
    } catch (error) {
      return Result.fail(
        new Error(`Error incrementing visit count in DynamoDB: ${error}`),
      );
    }
  }
  async getAllLinks(): Promise<Result<Link[], Error>> {
    try {
      const { Items: links } = await dynamoClient.send(
        new ScanCommand({
          TableName: this.tableName,
        }),
      );

      if (!links) {
        return Result.ok([] as Link[]);
      }

      return Result.ok(
        links.map((link: unknown) => Link.reconstitute(link as LinkType)),
      );
    } catch (error) {
      return Result.fail(
        new Error(`Error retrieving all links from DynamoDB: ${error}`),
      );
    }
  }

  async deleteLink(slug: string): Promise<Result<void, Error>> {
    try {
      await dynamoClient.send(
        new DeleteCommand({
          TableName: this.tableName,
          Key: { slug: slug },
          ConditionExpression: "attribute_exists(slug)",
        }),
      );
      return Result.ok();
    } catch (error) {
      if (
        error instanceof Error &&
        error.name === "ConditionalCheckFailedException"
      ) {
        return Result.fail(new SlugNotFoundError(slug));
      }

      return Result.fail(
        new Error(`Error deleting link in DynamoDB: ${error}`),
      );
    }
  }

  async updateLink(slug: string, newUrl: string): Promise<Result<void, Error>> {
    try {
      await dynamoClient.send(
        new UpdateCommand({
          TableName: this.tableName,
          Key: { slug: slug },
          UpdateExpression: "SET #url = :newUrl",
          ExpressionAttributeNames: {
            "#url": "url",
          },
          ExpressionAttributeValues: {
            ":newUrl": newUrl,
          },
          ConditionExpression: "attribute_exists(slug)",
        }),
      );
      return Result.ok();
    } catch (error) {
      if (
        error instanceof Error &&
        error.name === "ConditionalCheckFailedException"
      ) {
        return Result.fail(new SlugNotFoundError(slug));
      }

      return Result.fail(
        new Error(`Error updating link in DynamoDB: ${error}`),
      );
    }
  }
}
