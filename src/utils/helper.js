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
    map[name] = function(...params) {
      return this.$refs[ref][name](...params)
    }
  })

  return map
}
