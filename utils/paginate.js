export const paginate = (page, limit) => {
  const currentPage = Number(page) || 1
  const perPage = Number(limit) || 10

  return {
    currentPage,
    perPage,
    skip:
      (currentPage - 1) * perPage,
  }
}