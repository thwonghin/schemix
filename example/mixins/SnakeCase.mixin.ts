import { snakeCase } from "snake-case";

import { createMixin } from "../../dist";
import { PrismaRelationalField } from "../../dist/modules/PrismaRelationalField";

export default createMixin((SnakeCaseMixin) => {
  SnakeCaseMixin.addFieldMixin((name, field) => {
    if (field instanceof PrismaRelationalField) {
      return;
    }

    const mappedName = snakeCase(name);
    if (mappedName === name) {
      return;
    }
    field.mapTo(mappedName);
  });
});
