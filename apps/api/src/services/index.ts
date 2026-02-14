import { repository } from "@/repositories";
import { LinksServiceImp } from "./LinksServiceImp";

export const linksService = new LinksServiceImp({
  repository,
  apiUrl: process.env.API_URL,
});
