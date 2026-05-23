export const cleanName = (name: string) => {
  let newName = name;
  if (name.includes("A-")) newName = name.replaceAll("A-", "");
  return newName;
};
