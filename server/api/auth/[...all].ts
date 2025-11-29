import { toNodeHandler } from "better-auth/node";
import { useRuntimeConfig } from "#imports";

export default defineEventHandler(async (event) => {
  const auth = useRuntimeConfig().auth;
  return toNodeHandler(auth)(event.node.req, event.node.res);
});