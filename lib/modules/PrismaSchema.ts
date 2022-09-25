import { PrismaModel } from "@/modules/PrismaModel";
import { PrismaEnum } from "@/modules/PrismaEnum";

import { exportSchema } from "@/util/export";
import { parseKeyValueBlock } from "@/util/blocks";

import { PrismaDataSourceOptions } from "@/@types/prisma-datasource";
import {
  PrismaGeneratorOptions,
  PrismaMultiGeneratorOptions,
} from "@/@types/prisma-generator";
import { importAllFiles } from "@/util/import";
import { createMixin } from "..";

type ModelMixin = ReturnType<typeof createMixin>

export class PrismaSchema {
  private enums: Map<string, PrismaEnum> = new Map();
  private models: Map<string, PrismaModel> = new Map();
  private modelMixins: ModelMixin[] = [];

  constructor(
    private readonly basePath: string,
    private readonly datasource: PrismaDataSourceOptions,
    private readonly generator:
      | PrismaGeneratorOptions
      | PrismaMultiGeneratorOptions
  ) {}

  /**
   * Parses a datasource block for the schema using the parameters
   * provided in the constructor.
   * @returns A string representing the datasource block.
   */
  private parseDataSource() {
    return parseKeyValueBlock(
      "datasource",
      "database",
      Object.entries(this.datasource)
    );
  }

  /**
   * Parses a generator block for the schema using the parameters
   * provided in the constructor.
   * @returns A string representing the generator block.
   */
  private parseGenerator() {
    const generators = Array.isArray(this.generator)
      ? this.generator
      : [this.generator];

    return generators
      .map(({ name = "client", ...generator }) =>
        parseKeyValueBlock(
          "generator",
          name,
          Object.entries(generator) as [string, string | string[]][]
        )
      )
      .join("\n\n");
  }

  /**
   * Creates a mixin and automatically attaches it to the schema.
   * @returns The `PrismaModel` object.
   */
  public createMixin() {
    const model = new PrismaModel(this);
    return model;
  }

  /**
   * Creates a `PrismaModel` object and automatically attaches it to the schema.
   * @param modelName The name of the model.
   * @returns The `PrismaModel` object.
   */
  public createModel(modelName: string) {
    const model = new PrismaModel(this, modelName);
    this.models.set(modelName, model);
    return model;
  }

  /**
   * Creates a `PrismaEnum` object and automatically attaches it to the schema.
   * @param enumName The name of the enum.
   * @returns The `PrismaEnum` object.
   */
  public createEnum(enumName: string) {
    const prismaEnum = new PrismaEnum(enumName);
    this.enums.set(enumName, prismaEnum);
    return prismaEnum;
  }

  public addModelMixin(modelMixin: ModelMixin) {
    this.modelMixins.push(modelMixin);
    return this;
  }

  public applyModelMixins(model: PrismaModel) {
    this.modelMixins.forEach((modelMixin) => {
      model.mixin(modelMixin);
    })
  }

  /**
   * Parses the schema into a singular schema string.
   * @returns Returns a singular schema string.
   */
  public toString(): Promise<string> {
    return new Promise(async (resolve) => {
      await importAllFiles(this.basePath, "enums");
      await importAllFiles(this.basePath, "mixins");
      await importAllFiles(this.basePath, "models");

      setTimeout(() => {
        const models = [
          this.parseDataSource(),
          this.parseGenerator(),
          ...this.enums.values(),
          ...this.models.values(),
        ];

        const schemaString =
          models.map((model) => model.toString()).join("\n\n") + "\n";

        resolve(schemaString);
      }, 0);
    });
  }

  /**
   * Exports the schema to the provided filepath/filename.
   * @param filepath The target filepath.
   * @param filename The target filename.
   */
  public export(filepath: string, filename: string) {
    exportSchema(filepath, filename, this);
  }
}
