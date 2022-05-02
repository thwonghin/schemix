import {
	PrismaFieldAttribute,
	PrismaFieldModifier,
	PrismaFieldTypeName
} from "@/@types/prisma-field";

export class PrismaRelationalField {
	private relationAttributes: Map<string, string> = new Map();
	private attributes: Map<string, PrismaFieldAttribute> = new Map();
	private modifier: PrismaFieldModifier = "";
	
	constructor(
		private readonly name: string,
		private type: PrismaFieldTypeName
	) {};

	private parseRelationAttribute() {
		const { relationAttributes } = this;
		if (!relationAttributes.size) return;
		const relationString = [...relationAttributes.entries()].map((entries) => entries.join(": ")).join(", ");
		return `@relation(${relationString})`;
	};

	public setFields(tokens: string[]) {
		this.relationAttributes.set("fields", `[${tokens.join(", ")}]`);
		return this;
	};
	
	public setReferences(tokens: string[]) {
		this.relationAttributes.set("references", `[${tokens.join(", ")}]`);
		return this;
	};
	
	public setOptional() {
		this.modifier = "?";		
		return this;
	};

	public setList() {
		this.modifier = "[]";
		return this;
	};

	public mapTo(fieldName: string) {
		this.attributes.set("map", `@map("${fieldName}")`);
		return this;
	};

	public toTokenArray() {
		const { name, type, modifier, attributes } = this;
		const relationAttributes = this.parseRelationAttribute();
		
		return [
			name,
			type + modifier,
			...relationAttributes ? [relationAttributes] : [],
			...attributes.values()
		] as string[];
	};
};