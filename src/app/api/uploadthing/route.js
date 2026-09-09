import { createRouteHandler } from "uploadthing/next";
import { ourFileRouter } from "./core";

export const { GET, POST } = createRouteHandler({
  router: ourFileRouter,
  config: {
    isDev: process.env.NODE_ENV !== "production",
    callbackUrl:
      process.env.NODE_ENV === "production"
        ? "http://eq.projetoscti.com.br/26-marcaai/api/uploadthing"
        : "http://localhost:3000/26-marcaai/api/uploadthing",
  },
});