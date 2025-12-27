
declare namespace NodeJS {
  interface ProcessEnv {
    API_KEY: string;
  }
}

declare module "@google/genai" {
  export class GoogleGenAI {
    constructor(config: { apiKey: string });
    models: {
      generateContent(parameters: {
        model: string;
        contents: string | { parts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }> };
        config?: any;
      }): Promise<{ text: string; candidates: any[] }>;
    };
  }
  export enum Type {
    TYPE_UNSPECIFIED = 'TYPE_UNSPECIFIED',
    STRING = 'STRING',
    NUMBER = 'NUMBER',
    INTEGER = 'INTEGER',
    BOOLEAN = 'BOOLEAN',
    ARRAY = 'ARRAY',
    OBJECT = 'OBJECT',
    NULL = 'NULL',
  }
}
