import { Result } from "@shortlink/core";
import { Link } from "@/domains/Link";

export interface LinksService {
  createLink(link: Link): Promise<Result<{ shortUrl: string }, Error>>;
  redirectLink(link: Link): Promise<Result<string, string>>;
  getAllLinks(): Promise<Result<{ total: number; data: Link[] }, Error>>;
  deleteLink(link: Link): Promise<Result<void, Error>>;
  updateLink({
    link,
    newUrl,
  }: {
    link: Link;
    newUrl: unknown;
  }): Promise<Result<{ slug: string; url: string; shortUrl: string }, Error>>;
}
