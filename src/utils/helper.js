/**
 * 注册ref上的方法
 * @param {string} ref
 * @param {array[string]} methods
 * @return {object}
 * @example
 * registerRefMethods('input', ['focus'])
 *
 * // 返回
 * {
 *   focus(...params) {
 *     return this.$refs.input.focus(...params)
 *   }
 * }
 */
export function registerRefMethods(ref, methods) {
  if (!Array.isArray(methods)) throw new TypeError('\'methods\' must be an array')

  const map = {}

  methods.forEach(name => {
    map[name] = function (...params) {
      return this.$refs[ref][name](...params)
    }
  })

  return map
}

function trimExtraChar(value, char, regExp) {
  const index = value.indexOf(char)

  if (index === -1) {
    return value
  }

  if (char === '-' && index !== 0) {
    return value.slice(0, index)
  }

  return value.slice(0, index + 1) + value.slice(index).replace(regExp, '')
}

export function formatNumber(
  value,
  allowDot = true,
  allowMinus = true,
) {
  if (allowDot) {
    value = trimExtraChar(value, '.', /\./g)
  } else {
    value = value.split('.')[0]
  }

  if (allowMinus) {
    value = trimExtraChar(value, '-', /-/g)
  } else {
    value = value.replace(/-/, '')
  }

  const regExp = allowDot ? /[^-0-9.]/g : /[^-0-9]/g

  return value.replace(regExp, '')
}

export function genSlots(createElement, slots) {
  return Object.keys(slots).map(key => createElement('template', { slot: key }, slots[key]))
}
