import { Link } from "@/domains";
import { Result } from "@shortlink/core";

export interface IRepository {
  createLink(link: Link): Promise<Result<void, Error>>;
  getLink(id: string): Promise<Result<Link, Error>>;
  incrementLinkVisitCount(slug: string): Promise<Result<number, Error>>;
  getAllLinks(): Promise<Result<Link[], Error>>;
  deleteLink(slug: string): Promise<Result<void, Error>>;
  updateLink(slug: string, newUrl: string): Promise<Result<void, Error>>;
}
