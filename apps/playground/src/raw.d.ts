// webpack `?raw` imports, see next.config.mjs
declare module '*?raw' {
  const content: string;
  export default content;
}
