<template>
  <div class="table-page">
    <search-form
      v-bind="search"
      ref="search"
      :fields="innerFields"
      @query="handleQuery"
      @reset="handleReset"
    ></search-form>

    <template v-if="(actions && actions.length > 0) || $slots.actions">
      <div class="flex">
        <slot name="actions">
          <template v-for="(item, index) of actions">
            <el-button
              v-if="!item.slot"
              :key="index"
              :icon="item.icon"
              :type="item.type"
              size="small"
              @click="handleAction(item)"
            >
              {{ item.name }}
            </el-button>
            <slot v-else :name="`actions:${item.slot}`"></slot>
          </template>
        </slot>
      </div>
      <el-divider></el-divider>
    </template>

    <el-table
      v-loading="loading"
      ref="table"
      :data="table.data"
      border
      height="100%"
      :highlight-current-row="table.selectionItem"
      @selection-change="handleSelectionChange"
      @current-change="handleCurrentChange"
      @row-click="$emit('row-click', $event)"
    >
      <el-table-column
        v-if="table.selectionItem"
        align="center"
        width="50"
      >
        <template slot-scope="scope">
          <el-radio class="table-radio" :value="selectedItem" :label="scope.row">
            <span></span>
          </el-radio>
        </template>
      </el-table-column>
      <el-table-column
        v-if="table.selection"
        :selectable="table.selectable"
        align="center"
        type="selection"
        width="50"
      >
      </el-table-column>
      <template v-for="item in tableFields">
        <slot v-bind="item" :name="`column:${item.fieldKey}`">
          <el-table-column
            :label="item.fieldName"
            :prop="item.fieldKey"
            min-width="140"
            show-overflow-tooltip
            sortable
          >
            <template slot-scope="scope">
              <slot v-bind="scope" :name="`content:${item.fieldKey}`">{{ scope.row[item.fieldKey] }}</slot>
            </template>
          </el-table-column>
        </slot>
      </template>
      <el-table-column
        v-if="table.actions && table.actions.buttons && table.actions.buttons.length"
        :width="(table.actions && table.actions.width) || 100"
        align="center"
        fixed="right"
        label="操作"
      >
        <template slot-scope="scope">
          <slot v-bind="scope" name="rowActions">
            <template>
              <el-tooltip
                v-for="(btn, index) of table.actions.buttons"
                :key="index"
                :content="getContent(btn.tip, scope)"
                effect="dark"
                placement="top"
              >
                <el-button
                  :class="btn.class"
                  :disabled="getContent(btn.disabled, scope)"
                  :icon="getContent(btn.icon, scope)"
                  :type="getContent(btn.type, scope)"
                  circle
                  size="mini"
                  @click="rowClick(btn, scope)"
                ></el-button>
              </el-tooltip>
            </template>
          </slot>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      ref="pager"
      :current-page.sync="innerPager.index"
      :page-size.sync="innerPager.size"
      :page-sizes="innerPager.sizes"
      :total="innerPager.total"
      layout="total, sizes, prev, pager, next, jumper"
      @size-change="loadData()"
      @current-change="loadData()"
    >
    </el-pagination>
  </div>
</template>

<script>
import SearchForm from '../SearchForm'

const ROW_ACTION_TYPES = {
  DELETE: 'delete',
}

export default {
  name: 'TablePage',

  setFields: () => {},

  components: { SearchForm },

  props: {
    promise: {
      type: Function,
      required: true,
    },
    table: {
      type: Object,
      default: () => ({
        data: [],
        actions: [],
        // 开启多选
        selection: false,
        // 开启单选
        selectionItem: false,
      }),
    },
    pager: Object,
    actions: Array,
    auto: Boolean,
    search: Object,
    // 数据加载后自动更新布局
    autoLayout: {
      type: Boolean,
      default: true,
    },
  },

  data: () => ({
    innerFields: [],
    tableData: [],
    queryData: {},
    innerPager: {
      index: 0,
      sizes: [10, 20, 30, 50, 100],
      size: 20,
      total: 0,
    },
    // 多选结果
    selected: [],
    // 单选结果
    selectedItem: {},
    loading: false,
  }),

  watch: {
    'pager.total': function (value) {
      this.innerPager.total = value
    },
  },

  computed: {
    tableFields() {
      return this.innerFields.filter(item => !item.noTableShow)
    },
  },

  created() {
    Object.assign(this.innerPager, this.pager)

    this.setFields(this.$options.setFields())
  },

  mounted() {
    this.auto && this.initLoad()
  },

  methods: {
    initLoad() {
      this.$refs.search.query()
    },
    getQueryParams() {
      return {
        pageNum: this.innerPager.index,
        pageSize: this.innerPager.size,
        ...this.queryData,
      }
    },
    rowClick(btn, scope) {
      const option = btn.option || {}

      if (btn.to) {
        return this.$router.push({
          name: btn.to,
          params: {
            item: scope.row,
          },
        })
      }

      // 根据传入类型做简单提示，复杂提示请自行编写
      switch (option.type) {
        case ROW_ACTION_TYPES.DELETE:
          const message = this.getContent(option.message, scope)
            || (option.field ? `确定删除${option.fieldTip || ''} ${scope.row[option.field]} 吗？` : '确定要删除吗？')

          this.$confirm(message, '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
          }).then(async () => {
            await btn.click(scope)

            const successTips = option.field
              ? `删除${option.fieldTip || ''} ${scope.row[option.field]} 成功！`
              : '删除成功！'
            this.messageTips(
              'success',
              this.getContent(option.success, scope),
              successTips,
            )
          })
          break
        default:
          btn.click(scope)
      }
    },
    getContent(opt, ...params) {
      return typeof opt === 'function' ? opt(...params) : opt
    },
    messageTips(tipsType, tips, defaultTips) {
      // 如果tips是false则取消提示
      if (typeof tips === 'boolean' && !tips) return

      this.$message[tipsType](tips || defaultTips)
    },
    handleQuery(e) {
      this.queryData = e
      this.loadData()
    },
    handleReset(e) {
      this.queryData = e
      this.loadData()
    },
    handleSelectionChange(e) {
      // console.log(e);
      this.selected = e
      this.$emit('selection-change', e)
    },
    handleCurrentChange(e) {
      this.selectedItem = e
      this.$emit('current-change', e)
    },
    handleAction(item) {
      // 页面跳转
      if (item.to) {
        if (typeof item.to === 'string') {
          const isPath = /^\.{0,2}\//.test(item.to)
          // 路径跳转还是命名跳转
          const route = isPath
            ? { path: item.to }
            : { name: item.to }
          this.$router.push(route)
        } else {
          this.$router.push(item.to)
        }
      } else if (item.click) {
        item.click()
      }
    },
    /**
     * 加载数据
     * @public
     */
    async loadData() {
      this.loading = true
      const promised = this.promise(this.getQueryParams())
      if (promised instanceof Promise) {
        await promised
          .finally(() => {
            this.loading = false
          })
        // 自动更新布局
        this.autoLayout && this.doLayout()
      } else {
        this.loading = false
        console.warn('[table-page] promise 必须返回一个Promise对象!')
      }
    },
    /**
     * 检查是否选中了数据
     * @public
     * @param {boolean|string} tips 定义提示，传入false不提示
     * @return {boolean}
     */
    checkSelected(tips = '请至少选中一项数据！') {
      if (this.selected.length === 0) {
        tips && this.$message.warning(tips)
        return false
      }
      return true
    },
    /**
     * 设置字段
     * @public
     */
    setFields(fields) {
      if (fields) {
        this.innerFields = fields
      }
    },
    /**
     * 更新布局
     * @public
     */
    doLayout() {
      this.$nextTick(this.$refs.table.doLayout)
    },
  },
}
</script>

<style lang="scss">
.table-page {
  display: flex;
  overflow: hidden;
  flex: 1;
  flex-direction: column;
  height: 100%;

  .el-table-column--selection {
    .cell {
      padding-right: 10px;
      text-align: center;
    }
  }

  .el-loading-mask {
    background-color: rgba(255, 255, 255, .9) !important;

    svg {
      display: inline-block;
    }
  }

  .table-radio {
    .el-radio__label {
      padding: 0;
    }
  }

  .search-form {
    margin-bottom: 1.75rem;
  }

  .el-pagination {
    padding: 0.75rem;
  }
}
</style>
