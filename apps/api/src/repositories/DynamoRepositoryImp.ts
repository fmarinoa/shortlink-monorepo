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
import { Repository } from "./Repository";
import { Result } from "@shortlink/core";

interface DynamoRepositoryImpProps {
  readonly tableName?: string;
}

export class DynamoRepositoryImp implements Repository {
  constructor(private readonly props: DynamoRepositoryImpProps) {
    if (!this.props.tableName) {
      throw new Error("Table name is required for " + this.constructor.name);
    }
  }

  async create(link: Link): Promise<Result<Link, Error>> {
    try {
      const request = new Link({ ...link, creationDate: Date.now(), visitCount: 0 });

      await dynamoClient.send(
        new PutCommand({
          TableName: this.props.tableName,
          Item: request.toJSON(),
          ConditionExpression: "attribute_not_exists(slug)",
        }),
      );
      return Result.ok(new Link({ ...request }));
    } catch (error) {
      if (
        error instanceof Error &&
        error.name === "ConditionalCheckFailedException"
      ) {
        return Result.fail(new SlugAlreadyExistsError(link.slug));
      }

      return Result.fail(
        new Error(`Error creating Link in DynamoDB: ${error}`),
      );
    }
  }

  async getBySlug(slug: string): Promise<Result<Link, Error>> {
    const { Item: link } = await dynamoClient.send(
      new GetCommand({
        TableName: this.props.tableName,
        Key: { slug: slug },
      }),
    );

    if (!link) {
      return Result.fail(new LinkNotFoundError(slug));
    }

    return Result.ok(new Link({ ...link }));
  }

  async getAll(): Promise<Result<Link[], Error>> {
    try {
      const { Items: links } = await dynamoClient.send(
        new ScanCommand({
          TableName: this.props.tableName,
        }),
      );

      if (!links) {
        return Result.ok([] as Link[]);
      }

      return Result.ok(
        links.map((link: unknown) => new Link(link as Partial<Link>)),
      );
    } catch (error) {
      return Result.fail(
        new Error(`Error retrieving all links from DynamoDB: ${error}`),
      );
    }
  }

  async delete(link: Link): Promise<Result<void, Error>> {
    try {
      await dynamoClient.send(
        new DeleteCommand({
          TableName: this.props.tableName,
          Key: { slug: link.slug },
          ConditionExpression: "attribute_exists(slug)",
        }),
      );
      return Result.ok();
    } catch (error) {
      if (
        error instanceof Error &&
        error.name === "ConditionalCheckFailedException"
      ) {
        return Result.fail(new SlugNotFoundError(link.slug));
      }

      return Result.fail(
        new Error(`Error deleting Link in DynamoDB: ${error}`),
      );
    }
  }

  async update(link: Link): Promise<Result<Link, Error>> {
    try {
      const request = new Link({ ...link, lastUpdateDate: Date.now() });

      await dynamoClient.send(
        new UpdateCommand({
          TableName: this.props.tableName,
          Key: { slug: request.slug },
          UpdateExpression:
            "SET #url = :url, #lastUpdateDate = :lastUpdateDate, #visitCount = :visitCount",
          ExpressionAttributeNames: {
            "#url": "url",
            "#lastUpdateDate": "lastUpdateDate",
            "#visitCount": "visitCount",
          },
          ExpressionAttributeValues: {
            ":url": request.url,
            ":lastUpdateDate": request.lastUpdateDate,
            ":visitCount": request.visitCount,
          },
          ConditionExpression: "attribute_exists(slug)",
        }),
      );
      return Result.ok(request);
    } catch (error) {
      if (
        error instanceof Error &&
        error.name === "ConditionalCheckFailedException"
      ) {
        return Result.fail(new SlugNotFoundError(link.slug));
      }

      return Result.fail(
        new Error(`Error updating Link in DynamoDB: ${error}`),
      );
    }
  }
}
