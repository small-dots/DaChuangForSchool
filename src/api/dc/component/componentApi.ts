import { defHttp } from '/@/utils/http/axios';

export class ComponentApi {
  /**
   * 获取元器件申请列表
   */
  static getComponentPages(params) {
    return defHttp.get({ url: '/dc/component/page', params });
  }

  /**
   * 发起元器件申请
   */
  static addComponent(params) {
    return defHttp.post({ url: '/dc/component/add', params }, { isTransformResponse: false });
  }

  /**
   * 删除元器件
   */
  static deleteComponent(params) {
    return defHttp.post({ url: '/dc/component/delete', params }, { isTransformResponse: false });
  }

  /**
   * 获取元器件申请单
   */
  static getComponentPass(params) {
    return defHttp.get({ url: '/dc/component/get', params });
  }
}
