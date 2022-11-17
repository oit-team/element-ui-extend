import { Form, FormItem, Button } from 'element-ui'
import Input from './types/Input'
import Date from './types/Date'
import Select from './types/Select'
import Cascader from './types/Cascader'

import FIELD_TYPES from './types/FIELD_TYPES'

import './SearchForm.scss'
import { debounce } from 'lodash-es'

let h = null

export default {
  name: 'SearchForm',

  provide() {
    return {
      provideForm: this.provideForm,
    }
  },

  props: {
    fields: Array,
    fieldProps: {
      type: Object,
      default: () => ({}),
    },
  },

  data: () => ({
    form: {},
    collapse: true,
    innerFieldProps: {},
  }),

  watch: {
    collapse(value) {
      if (value) {
        this.$refs.form.$el.scrollTop = 0
      }
    },
    fields: 'initFormData',
  },

  computed: {
    provideForm: {
      set(v) {
        this.provideForm = v
      },
      get() {
        return this.form
      },
    },
    fieldFiltered() {
      return this.fields.filter(item => item.noSearchShow !== true)
    },
  },

  created() {
    this.initFormData()
  },

  methods: {
    initFormData() {
      this.fieldFiltered.forEach(item => {
        this.$set(this.form, item.fieldKey, '')
      })
    },
    genFormItem(item, el) {
      return h(FormItem, {
        key: item.fieldKey,
        props: {
          label: item.fieldName,
        },
      }, [el])
    },
    genForm() {
      return h(Form, {
        ref: 'form',
        props: {
          model: this.form,
          size: 'medium',
        },
      }, this.genFields())
    },
    genFields() {
      return this.fieldFiltered.map(item => {
        const getComponent = type => {
          switch (type) {
            case FIELD_TYPES.TEXT:
              return Input
            case FIELD_TYPES.DATE:
            case FIELD_TYPES.DATE_TIME:
            case FIELD_TYPES.DATE_RANGE_MONTH:
              return Date
            case FIELD_TYPES.SELECT:
              return Select
            case FIELD_TYPES.CASCADE:
              return Cascader
          }
        }

        const component = getComponent(item.fieldType)
        const componentRender = h(component, {
          ref: item.fieldKey,
          props: {
            item,
            form: this.form,
            custom: this.fieldProps[item.fieldKey] || {},
          },
          on: {
            query: debounce(this.query),
          },
        })

        return this.genFormItem(item, componentRender)
      })
    },
    genAction() {
      return h('div', {
        class: 'search-action',
      }, [
        this.genActionButton({
          name: '查询',
          type: 'primary',
          icon: 'el-icon-search',
        }, this.query),
        this.genActionButton({
          name: '清空',
          type: 'info',
          icon: 'el-icon-close',
        }, this.reset),
      ])
    },
    genActionButton(option, event) {
      return h(Button, {
        class: 'search-action__button',
        props: {
          size: 'medium',
          type: option.type,
          icon: option.icon,
        },
        on: {
          click: event,
        },
      }, option.name)
    },
    genCollapseButton() {
      return h('div', {
        class: 'search-collapse',
        on: {
          click: () => this.collapse = !this.collapse,
        },
      }, [
        h('i', {
          class: [
            this.collapse ? 'el-icon-caret-bottom' : 'el-icon-caret-top',
          ],
        }),
      ])
    },
    /**
     * 获取查询字段对象
     * @public
     * @return {object} 格式化后的查询字段对象
     */
    getFormatFields() {
      const queryForm = {}
      this.fieldFiltered.forEach(item => {
        if ([FIELD_TYPES.DATE, FIELD_TYPES.DATE_TIME, FIELD_TYPES.DATE_RANGE_MONTH].includes(item.fieldType)) {
          const getDateValue = i => (this.form[item.fieldKey] && this.form[item.fieldKey][i]) || ''

          queryForm['start' + item.fieldKey] = getDateValue(0)
          queryForm['end' + item.fieldKey] = getDateValue(1)
        } else if (item.fieldType === FIELD_TYPES.CASCADE) {
          const checked = this.$refs[item.fieldKey].getCheckedNodes()
          queryForm[item.fieldKey] = (checked[0] && checked[0].data) || {}
        } else {
          queryForm[item.fieldKey] = this.form[item.fieldKey]
        }
      })

      console.debug('查询 ==>', JSON.parse(JSON.stringify(queryForm)))

      return queryForm
    },
    /**
     * 查询
     * @public
     */
    query() {
      this.$emit('query', this.getFormatFields())
    },
    /**
     * 重置表单
     * @public
     */
    reset() {
      this.initFormData()
      // 级联数据获取有缓存问题，所以延迟获取
      this.$nextTick(() => this.$emit('reset', this.getFormatFields()))
    },
  },

  render() {
    h = this.$createElement

    return h('div', {
      class: {
        'search-form': true,
        'search-form--collapsed': this.collapse,
      },
    }, [
      this.genForm(),
      this.genAction(),
      this.genCollapseButton(),
    ])
  },
}
