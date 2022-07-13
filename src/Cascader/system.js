// import { post } from './index'
// import API_SERVICE from './API_SERVICE'

// /**
//  *登录页面
//  * @param {object} params 用户名和密码
//  */
// export function LoginPage(params) {
//   return post(API_SERVICE.SYSTEM + '/user/login', params, {
//     cmd: 10008,
//     mod: 'home',
//   })
// }

// /**
//  * 确认删除该商品类别吗
//  * @param {object} params
//  */
// export function DeleteItem(params) {
//   return post(API_SERVICE.SYSTEM + '/dictitemInfo/dictitemInfoAllMethod', params, {
//     cmd: 10008,
//     mod: 'home',
//   })
// }

// /**
//  * 获取所属店铺/区域
//  * @param {number|string} brandId
//  */
// export function getTreeOrgList(brandId) {
//   return post(API_SERVICE.SYSTEM + '/org/getTreeOrgList', { brandId })
// }

// /**
//  * 查询导出信息
//  * @param params
//  * @param params.type
//  * @param params.code
//  */
// export function getExportInfo(params) {
//   return post(API_SERVICE.SYSTEM + '/excelPublic/getExportInfo', params)
// }
