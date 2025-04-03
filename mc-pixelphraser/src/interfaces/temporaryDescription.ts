export interface TemporaryDescription {
  id: string;
  version: number;
  key: string;
  value: {
    ["en-US"]?: string | null;
    ["en-GB"]?: string | null;
    ["de-DE"]?: string | null;
    imageUrl: string;
    productType: string;
    productName: string;
    // generatedAt: string;
  };
}
