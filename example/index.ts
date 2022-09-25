import { createSchema } from "../dist";

createSchema({
  basePath: __dirname,
  datasource: {
    provider: "postgresql",
    url: { env: "DATABASE_URL" },
  },
  generator: [
    {
      name: "client",
      provider: "prisma-client-js",
    },
    {
      name: "prismaThirdPartyGenerator",
      provider: "prisma-includes-generator",
      seperateRelationFields: true,
    },
  ],
})
  .addModelMixin(require("./mixins/DateTime.mixin").default)
  .addModelMixin(require("./mixins/SnakeCase.mixin").default)
  .export(__dirname, "schema");
