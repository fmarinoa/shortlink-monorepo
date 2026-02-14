import { Result } from "@shortlink/core";
import z, { ZodError } from "zod";
import th from "zod/v4/locales/th.js";

const urlValidationSchema = z.object({
  url: z.url(),
});

const createSchema = z.object({
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
  slug!: string;
  url!: string
  creationDate!: number;
  lastUpdateDate!: number;
  visitCount!: number;

  constructor(object?: Partial<Link>) {
    if (object) {
      Object.assign(this, object);
    }
  }

  static instanceForCreate(object: Partial<Link>): Result<Link, ZodError> {
    const { error, data } = createSchema.safeParse(object);

    if (error) {
      return Result.fail(error);
    }

    return Result.ok(new Link({ ...(data as Partial<Link>) }));
  }

  updateUrl(newUrl: unknown): Result<{ isNeedUpdate: boolean; link: Link }, ZodError> {
    if (this.url === newUrl) {
      return Result.ok({ isNeedUpdate: false, link: this });
    }

    const { error } = urlValidationSchema.safeParse({ url: newUrl });

    if (error) {
      return Result.fail(error);
    }

    return Result.ok({ isNeedUpdate: true, link: new Link({ ...this, url: newUrl }) });
  }

  incrementVisitCount(): void {
    this.visitCount = (this.visitCount || 0) + 1;
  }

  toJSON() {
    return {
      slug: this.slug,
      url: this.url,
      creationDate: this.creationDate,
      lastUpdateDate: this.lastUpdateDate,
      visitCount: this.visitCount,
    };
  }
}
