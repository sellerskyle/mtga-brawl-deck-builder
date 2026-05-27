export const cleanName = (name) => {
  const split = name.split(" // ")[0].trim();
  let newName = split;
  if (name.includes("A-")) newName = name.replaceAll("A-", "");
  return newName;
};
