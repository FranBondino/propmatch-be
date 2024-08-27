export const getStartDateOfWeek = (year: number, week: number): Date => {
  const startDate = new Date(year, 0, (week - 1) * 7 + 1)
  const startDayOfWeek = startDate.getDay()
  const adjustment = startDayOfWeek > 0 ? startDayOfWeek - 1 : 6
  startDate.setDate(startDate.getDate() - adjustment)
  return startDate
}

export const getEndDateOfWeek = (year: number, week: number): Date => {
  const startDate = getStartDateOfWeek(year, week)
  const endDate = new Date(startDate.getTime() + 6 * 24 * 60 * 60 * 1000)
  return endDate
}

export const calculateMonthFrequency = (rentalMonths: number[]): Map<number, number> => {
  const frequencyMap = new Map<number, number>()

  for (const month of rentalMonths) {
    frequencyMap.set(month, (frequencyMap.get(month) || 0) + 1)
  }

  return frequencyMap
}

export const groupBy = <T>(array: T[], getKey: (item: T) => string): { [key: string]: T[] } =>
  array.reduce((result, item) => {
    const key = getKey(item)
    if (!result[key]) {
      result[key] = []
    }
    result[key].push(item)
    return result
  }, {} as { [key: string]: T[] })