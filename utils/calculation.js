import Big from 'big.js'

export const RM = {
  ROUND_DOWN: 0,
  ROUND_HALF_UP: 1,
  ROUND_HALF_EVEN: 2,
  ROUND_UP: 3,
}

Big.RM = RM.ROUND_DOWN

const catchWraper = fn => ((...args) => {
  try {
    return fn(...args)
  } catch (e) {
    return undefined
  }
})

const OperationGenerator = op => (
  (...args) => (
    args.reduce(
      (sum, val) => (sum ? sum[op](val) : Big(val)),
      undefined,
    )
  ).toFixed()
)

const ComparisonGenerator = op => (
  (arg1, arg2) => (Big(arg1)[op](Big(arg2)))
)

export const add = catchWraper(OperationGenerator('plus'))
export const sub = catchWraper(OperationGenerator('minus'))
export const mul = catchWraper(OperationGenerator('times'))
export const div = catchWraper(OperationGenerator('div'))
export const mod = catchWraper(OperationGenerator('mod'))

export const eq = catchWraper(ComparisonGenerator('eq'))
export const gte = catchWraper(ComparisonGenerator('gte'))
export const lte = catchWraper(ComparisonGenerator('lte'))
export const gt = catchWraper(ComparisonGenerator('gt'))
export const lt = catchWraper(ComparisonGenerator('lt'))

export const round = catchWraper((num, precision = 10, type = RM.ROUND_DOWN) => (
  Big(num).round(precision, type).toFixed()
))

export const toPrecision = catchWraper(
  (num, precision) => Big(num).toPrecision(precision),
)
