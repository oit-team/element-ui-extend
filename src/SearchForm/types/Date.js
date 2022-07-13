import { DatePicker } from 'element-ui'
import FIELD_TYPES from './FIELD_TYPES'

import mixin from '../mixin'

export default {
  functional: true,

  mixins: [mixin],

  render(h, ctx) {
    const { provideForm } = ctx.injections
    const {
      item,
    } = ctx.props

    const props = {
      value: provideForm[item.fieldKey] || '',
      clearable: true,
      rangeSeparator: '-',
      startPlaceholder: '开始日期',
      endPlaceholder: '结束日期',
    }

    const fieldTypeProps = (type) => {
      switch (type) {
        case FIELD_TYPES.DATE:
          return {
            type: 'daterange',
            format: 'yyyy/MM/dd',
            valueFormat: 'yyyy/MM/dd',
          }
        case FIELD_TYPES.DATE_TIME:
          return {
            type: 'datetimerange',
            format: 'yyyy/MM/dd HH:mm:ss',
            valueFormat: 'yyyy/MM/dd hh:mm:ss',
          }
        case FIELD_TYPES.DATE_RANGE_MONTH:
          return {
            type: 'monthrange',
            format: 'yyyy/MM',
            valueFormat: 'yyyy/MM',
          }
      }
    }


    return h(DatePicker, {
      ref: ctx.data.ref,
      props: Object.assign(props, fieldTypeProps(item.fieldType)),
      on: {
        input: e => {
          provideForm[item.fieldKey] = e
          ctx.listeners.query()
        },
      },
    })
  },
}
