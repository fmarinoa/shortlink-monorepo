import { LinksController } from "./LinksController";
import { linksService } from "@/services";

export const linksController = new LinksController({ linksService });
