import { defineComponent } from 'vue'
import { Input } from 'element-ui'
import { formatNumber } from '../utils/helper'

export default defineComponent({
  name: 'VcInput',

  inheritAttrs: false,

  props: {
    type: Input.props.type,
    value: Input.props.value,
    formatter: Function,
    formatTrigger: String,
  },

  data: () => ({
    formattedValue: '',
  }),

  watch: {
    value: {
      immediate: true,
      handler() {
        this.updateValue(this.value)
      },
    },
  },

  methods: {
    updateValue(value, trigger = 'change') {
      const isNumber = this.type === 'number'

      if (isNumber)
        value = formatNumber(value)

      if (typeof this.formatter === 'function' && trigger === this.formatTrigger)
        value = this.formatter(value)

      this.formattedValue = value
    },
  },

  render(h) {
    const isNumber = this.type === 'number'
    const type = isNumber ? 'text' : this.type

    return h(Input, {
      attrs: this.$attrs,
      props: {
        type,
        value: this.formattedValue,
      },
      on: {
        ...this.$listeners,
        blur: (...e) => {
          this.$emit('blur', ...e)
          this.updateValue(this.value, 'blur')
        },
      },
    })
  },
})
