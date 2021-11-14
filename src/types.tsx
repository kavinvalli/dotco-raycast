export interface Preferences {
  apiKey: string;
  baseID: string;
  tableName: string;
  mainDomain: string;
}

export interface ShortLink {
  slug: string;
  target: string;
}

export interface ShortLinkResponse {
  fields: ShortLink;
}
