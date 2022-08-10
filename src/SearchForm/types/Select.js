import { Select, Option } from 'element-ui'

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

    const getItemOptions = () => typeof item.fieldAttr === 'object'
      ? item.fieldAttr
      : item.fieldAttr
        ? JSON.parse(item.fieldAttr)
        : []

    const options = custom.options || getItemOptions()

    const optionsRender = options.map(option => {
      return h(Option, {
        key: `${item.fieldKey}-${option.optionKey}`,
        props: {
          label: option.optionValue,
          value: option.optionKey,
        }
      })
    })

    return h(Select, {
      ref: ctx.data.ref,
      props: {
        value: provideForm[item.fieldKey],
        clearable: true,
      },
      on: {
        change: e => {
          provideForm[item.fieldKey] = e
          ctx.listeners.query()
        }
      }
    }, [optionsRender])
  }
}
