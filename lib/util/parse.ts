export const parseStringOrObject = (toParse: string | object): string => {
  if (typeof toParse === "string") return toParse;
  else return JSON.stringify(toParse).replace(/"/g, '\\"');
};
