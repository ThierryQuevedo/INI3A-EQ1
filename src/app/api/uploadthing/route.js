import { createRouteHandler } from "uploadthing/next";
import { ourFileRouter } from "./core";

export const { GET, POST } = createRouteHandler({
    router: ourFileRouter,
    config: {
        callbackUrl: "http://localhost:3000/26-marcaai/api/uploadthing",
  },
})
