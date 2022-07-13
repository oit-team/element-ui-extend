import { Input } from 'element-ui'

import mixin from '../mixin'

export default {
  functional: true,

  mixins: [mixin],

  render(h, ctx) {
    const { provideForm } = ctx.injections
    const {
      item,
      custom,
    } = ctx.props

    return h(Input, {
      ref: ctx.data.ref,
      attrs: {
        placeholder: custom.placeholder || `请输入${item.fieldName}`,
      },
      props: {
        value: provideForm[item.fieldKey],
        prefixIcon: 'el-icon-search',
        clearable: true,
      },
      on: {
        input: e => provideForm[item.fieldKey] = e,
        clear: e => ctx.listeners.query(),
      },
      nativeOn: {
        keyup: e => {
          if (e.keyCode === 13) {
            ctx.listeners.query()
          }
        },
      },
    })
  },
}
