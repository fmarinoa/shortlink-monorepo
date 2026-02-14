import { Link } from "@/domains";
import { Result } from "@shortlink/core";

export interface Repository {
  create(link: Link): Promise<Result<Link, Error>>;
  getBySlug(slug: string): Promise<Result<Link, Error>>;
  getAll(): Promise<Result<Link[], Error>>;
  delete(link: Link): Promise<Result<void, Error>>;
  update(link: Link): Promise<Result<Link, Error>>;
}
