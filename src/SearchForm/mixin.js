export default {
  inject: ['provideForm'],

  props: {
    item: Object,
    custom: {
      type: Object,
      default: () => ({}),
    },
  },
}
