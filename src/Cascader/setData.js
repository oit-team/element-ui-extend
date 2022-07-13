import { getTreeOrgList } from './system'
import DATA_TYPES from './DATA_TYPES'

const lazyData = {
  [DATA_TYPES.AREA_OR_SHOP]: []
}

export function setAreaOrShop() {
  this.innerProps = Object.assign({
    label: 'osName',
    value: 'id',
    children: 'childrenList',
    checkStrictly: true,
  }, this.innerProps)

  this.innerOptions = lazyData[DATA_TYPES.AREA_OR_SHOP].innerOptions

  getTreeOrgList(sessionStorage.brandId).then(res => {
    this.innerOptions = res.body.orgList[0].childrenList

    lazyData[DATA_TYPES.AREA_OR_SHOP].innerOptions = this.innerOptions
  })
}
