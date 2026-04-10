declare const global: typeof globalThis & Record<string, any>;
declare const require: (moduleName: string) => any;
declare const Buffer: {
  from(input: string): {
    toString(encoding: string): string;
  };
};
