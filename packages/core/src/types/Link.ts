export interface LinkType {
  slug: string;
  url: string;
  creationDate: number;
  lastUpdateDate: number;
  lastVisitDate: number;
  visitCount: number;
}

export interface LinksResponse {
  total: number;
  data: LinkType[];
}
