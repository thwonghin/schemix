import { createModel } from "../../dist";
import StatusEnum from "../enums/Status.enum";
import UUIDMixin from "../mixins/UUID.mixin";
import UserModel from "./User.model";

export default createModel((PostModel) => {
  PostModel
    .mixin(UUIDMixin)
    .enum("status", StatusEnum)
    .string("text")
    .relation("author", UserModel, { fields: ["authorId"], references: ["email"] })
    .string("authorId")
    .map({ name: "post" });
})