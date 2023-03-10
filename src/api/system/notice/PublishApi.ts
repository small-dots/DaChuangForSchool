import { defHttp } from '/@/utils/http/axios';

/**
 * 系统通知管理api
 *
 * @author laihongliang
 * @date 2021/04/04 00:29
 */
export default class PublishApi {
  /**
   * 获取通知列表
   *
   * @author anzhongqi
   * @date 2021/4/1 16:07
   */
  static findPage(params) {
    return defHttp.get({ url: '/sysNotice/page', params });
  }

  /**
   * 新建系统通知
   *
   * @author laihongliang
   * @date 2021/04/04 00:29
   */
  static addPublish(params) {
    return defHttp.post({ url: '/sysNotice/add', params }, { isTransformResponse: false });
  }

  /**
   * 编辑系统消息
   * @author laihongliang
   * @date 2021/04/07 23:03
   */
  static editPublish(params) {
    return defHttp.post({ url: '/sysNotice/edit', params }, { isTransformResponse: false });
  }
}
