import { LinkType, Result } from "@shortlink/core";
import z, { ZodError } from "zod";

const urlValidationSchema = z.object({
  url: z.string().url(),
});

const linkValidationSchema = z.object({
  slug: z
    .string()
    .min(2)
    .max(50)
    .regex(
      /^[a-zA-Z0-9\-]+$/,
      "Slug can only contain letters, numbers and hyphens",
    )
    .transform((val) => val.toLowerCase()),
  url: urlValidationSchema.shape.url,
});

export class Link {
  private readonly _slug: string;
  private readonly _url: string;
  private readonly _creationDate: number;
  private readonly _visitCount: number;

  private constructor(object: LinkType) {
    this._slug = object.slug;
    this._url = object.url;
    this._creationDate = object.creationDate;
    this._visitCount = object.visitCount;
  }

  static create({
    slug,
    url,
  }: {
    slug: string;
    url: string;
  }): Result<Link, ZodError> {
    const { error, data } = linkValidationSchema.safeParse({ slug, url });

    if (error) {
      return Result.fail(error);
    }

    return Result.ok(
      new Link({ ...data, creationDate: Date.now(), visitCount: 0 }),
    );
  }

  static update(url: string): Result<string, ZodError> {
    const { error, data } = urlValidationSchema.safeParse({ url });
    if (error) {
      return Result.fail(error);
    }

    return Result.ok(data.url);
  }

  static reconstitute(object: LinkType): Link {
    return new Link(object);
  }

  get slug(): string {
    return this._slug;
  }

  get url(): string {
    return this._url;
  }

  toJSON() {
    return {
      slug: this.slug,
      url: this.url,
      creationDate: this._creationDate,
      visitCount: this._visitCount,
    };
  }
}
