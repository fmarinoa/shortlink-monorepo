import { LinksController } from "./LinksController";
import { DynamoRepositoryImp } from "@/repositories/DynamoRepositoryImp";
import { LinksServicesImp } from "@/services/LinksServices.tsImp";
import { TABLE_NAME, API_URL } from "..";

if (!TABLE_NAME || !API_URL) {
  throw new Error(
    "TABLE_NAME or API_URL is not defined in environment variables",
  );
}

const dbRepository = new DynamoRepositoryImp(TABLE_NAME);
export const linksController = new LinksController(
  new LinksServicesImp(dbRepository, API_URL),
);
