import TablePage from './TablePage.vue'

TablePage.install = function (Vue, options) {
  if (typeof options.setFields === 'function') {
    TablePage.setFields = options.setFields
  }

  Vue.component(TablePage.name, TablePage)
}

export default TablePage
