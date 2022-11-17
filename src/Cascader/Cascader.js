import { Cascader } from 'element-ui'

import { registerRefMethods } from '../utils/helper'

const name = 'vc-cascader'

export default {
  name,

  inheritAttrs: false,

  props: {
    ...Cascader.props,
    filterable: {
      type: Cascader.props.filterable.type,
      default: true,
    },
  },

  data() {
    return {
      innerProps: {},
      innerOptions: [],
    }
  },

  watch: {
    props: {
      handler(value) {
        this.innerProps = Object.assign({}, this.innerProps, value)
      },
      immediate: true,
    },
    options: {
      handler(value) {
        this.innerOptions = value
      },
      immediate: true,
    },
  },

  computed: {
    checkedValue() {
      return this.$refs.core.checkedValue
    },
  },

  methods: {
    ...registerRefMethods('core', ['getCheckedNodes']),
    /**
     * 检查是否选中了数据
     * @public
     * @param {boolean|string} tips 定义提示，传入false不提示
     * @return {boolean}
     */
    checkSelected(tips = '请选中一项数据！') {
      const selected = this.getCheckedNodes()
      if (selected.length === 0) {
        tips && this.$message.warning(tips)
        return false
      }
      return true
    }
  },

  render(h) {
    return h(Cascader, {
      ref: 'core',
      props: {
        ...this.$props,
        props: this.innerProps,
        options: this.innerOptions,
      },
      on: this.$listeners,
    })
  },
}
