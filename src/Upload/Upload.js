import Axios from 'axios'
import { Image, Upload } from 'element-ui'
import Vue from 'vue'
import { genSlots } from '../utils/helper'
import {
  getDefaultFormData,
  getDefaultHeaders,
  getFileItemDefault,
  imageCompression,
  mixin,
} from './options'

const axios = Axios.create({})

const closeViewer = Image.methods.closeViewer
const ImageOverwrite = Vue.extend(Image).extend({
  methods: {
    // 覆写关闭事件，使其抛出事件
    closeViewer() {
      closeViewer.call(this)
      this.$emit('closeViewer')
    },
  },
})

export default {
  name: 'VcUpload',

  inheritAttrs: false,

  mixins: [mixin],

  props: {
    ...Upload.props,
    headers: {
      type: Object,
      default: getDefaultHeaders,
    },
    // 文件大小限制，单位：kb
    maxSize: {
      type: [Number, Object],
      default: 1024 * 100,
    },
    // 启用检测文件类型和大小，并输出相应提示
    check: {
      type: Boolean,
      default: true,
    },
    // 分块上传，每块的大小限制，<=0则不分块，单位：kb
    chunkSize: {
      type: Number,
      default: 1024 * 2,
    },
    transformRequest: {
      type: Function,
      default: getDefaultFormData,
    },
    fileList: {
      type: Array,
      default: () => ([]),
    },
    fileItem: {
      type: Object,
      default: getFileItemDefault,
    },
    data: Object,
    // 根据文件类型的特殊配置
    typeOption: Object,
  },

  computed: {
    // 是否是分块上传
    isChunked() {
      return this.chunkSize > 0
    },
    uploadFiles() {
      return this.$refs.uploadCore.uploadFiles
    },
  },

  created() {
    // 用于取消请求的队列
    this.uploadQueue = new WeakMap()
  },

  methods: {
    // 根据条件调用对应的上传
    handleHttpRequest(option) {
      // 外层函数不要以promise执行，所以包一层立即执行函数
      (async () => {
        if (/^image\//.test(option.file.type)) {
          const rawFile = option.file
          option.file = await imageCompression(option.file)
          option.file.uid = rawFile.uid
          option.file.name = rawFile.name
        }
        if (this.isChunked) {
          await this.uploadChunk(option)
        }
        else {
          await this.uploadFile(option)
        }
      })()
    },
    /**
     * 上传文件
     * @param {object} option 请求配置
     */
    uploadFile(option) {
      const upload = this.$refs.uploadCore
      const rawFile = option.file

      const data = this.getOptionByFileType('data', rawFile)
      const formData = this.getFormData(data, option)

      this.post(option.action, formData, {
        cancelKey: rawFile,
        onUploadProgress: e => this.handleUploadProgress(e, rawFile),
      })
        .then((res) => {
          upload.handleSuccess(res, rawFile)
        })
        .catch((err) => {
          if (!Axios.isCancel(err)) upload.handleError(err, rawFile)
        })
    },
    /**
     * 分块上传文件
     * @param {object} option 请求配置
     */
    async uploadChunk(option) {
      const upload = this.$refs.uploadCore
      const rawFile = option.file
      const chunkSize = this.chunkSize * 1024
      const chunkTotal = chunkSize > 0 ? Math.ceil(rawFile.size / chunkSize) : 1

      // 上传总进度
      let progressTotal = 0
      // 当前上传进度
      let progressLoaded = 0
      for (let i = 0; i < chunkTotal; i++) {
        try {
          const chunkStart = i * chunkSize
          const chunkEnd = Math.min(rawFile.size, chunkStart + chunkSize)
          const fileChunk = rawFile.slice(chunkStart, chunkEnd)

          const data = this.getOptionByFileType('data', rawFile)
          const formData = await this.getFormData(data, Object.assign(option, {
            fileChunk,
            chunkSize,
            chunkStart,
            chunkEnd,
          }))

          const res = await this.post(option.action, formData, {
            cancelKey: rawFile,
            onUploadProgress: (e) => {
              progressLoaded = e.loaded

              this.handleUploadProgress({
                loaded: progressTotal + progressLoaded,
                total: rawFile.size,
              }, rawFile)
            },
          })

          progressTotal += progressLoaded
          if (progressTotal >= rawFile.size) {
            try {
              upload.handleSuccess(res, rawFile)
            }
            catch (err) {
              console.error(err)
            }
          }
        }
        catch (err) {
          if (Axios.isCancel(err)) {
            break
          }
          else {
            upload.handleError(err, rawFile)
          }
        }
      }
    },
    /**
     * 上传图片
     * @param {object} option 请求配置
     */
    async uploadImage(option) {
      const upload = this.$refs.uploadCore
      const rawFile = option.file

      const data = this.getOptionByFileType('data', rawFile)
      const formData = await this.getFormData(data, option)

      this.post(option.action, formData, {
        cancelKey: rawFile,
        onUploadProgress: e => this.handleUploadProgress(e, rawFile),
      })
        .then((res) => {
          upload.handleSuccess(res, rawFile)
        })
        .catch((err) => {
          if (!Axios.isCancel(err)) upload.handleError(err, rawFile)
          return Promise.reject(err)
        })
    },
    /**
     *
     * @param {string} url 请求url
     * @param {formData} data 表单数据
     * @param {object} config axios配置
     * @param {any} config.cancelKey 请求的key，用于取消请求
     */
    post(url, data, config) {
      const CancelToken = Axios.CancelToken
      config.cancelToken = new CancelToken((cancel) => {
        this.uploadQueue.set(config.cancelKey, cancel)
      })

      return axios.post(url, data, {
        headers: this.headers,
        ...config,
      })
        .then((res) => {
          return res
        })
        .catch((err) => {
          return Promise.reject(err)
        })
        .finally(() => {
          this.uploadQueue.delete(config.cancelKey)
        })
    },
    /**
     * 获取经过转换的表单数据
     * @param {object} data 传入组件的数据
     * @param {Object} option 配置
     * @param {file} option.file 文件 必须
     * @return {formData}
     */
    getFormData(data, option = {}) {
      if (typeof this.transformRequest === 'function') {
        return this.transformRequest(data, option)
      }
    },
    getOptionByFileType(key, file) {
      if (typeof this.typeOption === 'object') {
        for (const [type, item] of Object.entries(this.typeOption)) {
          if (this.checkFileType(file, type)) {
            if (typeof item[key] === 'object')
              return Object.assign({}, this[key], item[key])
            else
              return item[key]
          }
        }
      }

      return this[key]
    },
    handleBeforeUpload(file) {
      // 提供内置校验方法
      const methods = {
        checkFileType: this.checkFileType,
        checkFileSize: this.checkFileSize,
      }
      const customChecked = typeof this.beforeUpload === 'function'
        ? this.beforeUpload(file, methods)
        : true

      return this.check
        ? customChecked && this.checkFile(file)
        : customChecked
    },
    handleUploadProgress(e, rawFile) {
      if (e.total > 0) {
        e.percent = Math.min(100, e.loaded / e.total * 100)
      }
      this.$refs.uploadCore.handleProgress(e, rawFile)
    },
    clearFiles() {
      this.$refs.uploadCore.clearFiles()
    },
    handleRemove(file) {
      this.emitEvent('onRemove', file)
      this.emitEvent('onChange', file, this.uploadFiles)
      this.abort(file)
    },
    handlePreview(file) {
      if (this.$attrs.listType === 'picture-card') this.previewFile(file)
    },
    handleSuccess(...e) {
      console.log(e)
      this.emitEvent('onSuccess', ...e)
    },
    handleError(...e) {
      this.emitEvent('onError', ...e)
      if (typeof this.onError !== 'function') {
        this.$message.error(`${e[1].name} 上传失败，请重试！`)
      }
    },
    /**
     * 调用事件
     * @param name 事件名
     * @param params
     * @return {boolean}
     */
    emitEvent(name, ...params) {
      if (typeof this[name] === 'function') {
        return this[name](...params)
      }
      else if (typeof this.$attrs[name] === 'function') {
        return this.$attrs[name](...params)
      }
    },
    previewFile(file) {
      const remoteUrl = file.response?.data?.fileUrl || file.url
      const urlList = this.getUploadImageResults()
      const PreviewImage = Vue.extend({
        name: 'PreviewImage',
        functional: true,
        render(h) {
          return h(ImageOverwrite, {
            props: {
              src: remoteUrl,
              previewSrcList: urlList,
            },
            on: {
              closeViewer: () => {
                this.$el.remove()
                this.$destroy()
              },
              load: () => {
                const img = this.$el.querySelector('img')
                img.style.display = 'none'
                img.click()
              },
            },
          })
        },
      })

      const preview = new PreviewImage().$mount().$el
      document.body.append(preview)
    },
    /**
     * 主动上传文件
     * @public
     */
    submit() {
      this.$refs.uploadCore.submit()
    },
    /**
     * 取消上传
     * @public
     * @param file
     */
    abort(file) {
      // 取消请求
      const cancel = this.uploadQueue.get(file.raw)
      typeof cancel === 'function' && cancel()
    },
  },

  render(h) {
    console.log(this.$attrs, this.$props)
    const {
      action,
      limit,
    } = this.$props
    const data = {
      ref: 'uploadCore',
      props: {
        ...this.$attrs,
        ...this.$props,
        action: action || '',
        fileList: this.fileListFormatted,
        beforeUpload: this.handleBeforeUpload,
        httpRequest: this.handleHttpRequest,
        onRemove: this.handleRemove,
        onPreview: this.handlePreview,
        onError: this.handleError,
        onExceed: (files, fileList) => {
          this.$message.warning(`超出文件上传个数限制，当前还可上传 ${limit - fileList.length} 个`)
        },
      },
    }
    return h(Upload, data, genSlots(h, this.$slots))
  },
}
