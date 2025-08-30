// Ambient module shims to avoid TS compile errors when modules aren’t installed locally yet.
// NOTE: These are temporary and will be superseded by real types once `npm install` is run.

declare module "helmet" {
  const helmet: any;
  export default helmet;
}

declare module "express-rate-limit" {
  const rateLimit: any;
  export default rateLimit;
}

declare module "pg" {
  export const Pool: any;
}

declare module "jsonwebtoken" {
  const jwt: any;
  export default jwt;
}
