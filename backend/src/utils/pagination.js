export const getPagination = (query) => {
  const page = Math.max(Number.parseInt(query.page || "1", 10), 1);
  const limit = Math.max(Number.parseInt(query.limit || "10", 10), 1);
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};
