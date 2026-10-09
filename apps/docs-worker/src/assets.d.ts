// Wrangler embeds the build-generated access list; no asset listing is public.
declare module '*.txt' {
  const paths: string;
  export default paths;
}
