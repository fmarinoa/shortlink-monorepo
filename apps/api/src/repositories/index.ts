import { TABLE_NAME } from "..";
import { DynamoRepositoryImp } from "./DynamoRepositoryImp";

export const repository = new DynamoRepositoryImp({ tableName: TABLE_NAME });
