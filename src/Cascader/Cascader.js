import { Cascader } from 'element-ui'

import { registerRefMethods } from '../utils/helper'

import * as setData from './setData'
import DATA_TYPES from './DATA_TYPES'

const name = 'vc-cascader'

export default {
  name,

  inheritAttrs: false,

  props: {
    ...Cascader.props,
    data: {
      type: String,
      validator: (v) => Object.values(DATA_TYPES).includes(v)
    },
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

  created() {
    this.loadData()
  },

  methods: {
    ...setData,
    ...registerRefMethods('core', ['getCheckedNodes']),
    loadData() {
      switch (this.data) {
        case DATA_TYPES.AREA_OR_SHOP:
          return this.setAreaOrShop()
      }
    },
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
