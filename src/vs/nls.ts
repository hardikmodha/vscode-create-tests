export const localize = (prop:string, message:string,match:string,arg?:string) => {
  return message.replace('${0}',prop);
};
