<template>
  <div id="app">
    <TablePage v-bind="tablePageOption"></TablePage>
  </div>
</template>

<script>
export default {
  name: 'App',

  data: () => ({
    data: [
      [{id:1},{id:2},{id:3}],
      [{id:4},{id:5},{id:6}],
    ],
    index: 0,
  }),

  computed: {
    tablePageOption() {
      return {
        promise: this.loadData,
        table: {
          selection: true,
          data: this.data[this.index],
          rowKey: 'id',
          reserveSelection: true,
        },
        pager: {
          total: 100,
        }
      }
    },
  },

  methods: {
    async loadData(params) {
      console.log('params ==> ', params)
      await new Promise((resolve, reject) => {
        this.index = params.pageNum - 1
        const random = Math.random() * 10
        setTimeout(() => {
          if (random > 7) resolve()
          else reject()
        }, random * 100)
      })
    },
  },
}
</script>

<style>
#app {
}
</style>
