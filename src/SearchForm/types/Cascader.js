import Cascader from '../../Cascader'
import mixin from '../mixin'

export default {
  mixins: [mixin],

  functional: true,

  render(h, ctx) {
    const { provideForm } = ctx.injections
    const {
      item,
      custom,
    } = ctx.props

    let lazyValue = null

    return h(Cascader, {
      ref: ctx.data.ref,
      props: {
        data: custom.data,
        value: provideForm[item.fieldKey],
        options: custom.options,
        props: {
          emitPath: false,
          ...custom.props,
        },
        clearable: true,
      },
      on: {
        input: e => {
          provideForm[item.fieldKey] = e
          e === null && ctx.listeners.query()
        },
        'visible-change': e => {
          setTimeout(() => {
            if (e) {
              lazyValue = provideForm[item.fieldKey]
            } else {
              // 收起时数据发生变化则调用查询
              if (
                (lazyValue !== null || provideForm[item.fieldKey] !== null)
                && lazyValue !== provideForm[item.fieldKey]
              ) {
                ctx.listeners.query()
              }
            }
          })
        },
      },
    })
  },
}
