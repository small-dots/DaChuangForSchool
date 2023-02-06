import { defHttp } from '/@/utils/http/axios';

export class TitleApi {
  /**
   * 获取题目列表
   */
  static getTitlePages(params) {
    return defHttp.get({ url: '/title/page', params });
  }

  /**
   * 新增题目
   */
  static addTitle(params) {
    return defHttp.post({ url: '/title/add', params }, { isTransformResponse: false });
  }

  /**
   * 修改题目
   */
  static editTitle(params) {
    return defHttp.post({ url: '/title/edit', params }, { isTransformResponse: false });
  }

  /**
   * 解除题目冻结
   */
  static unFreezeTitle(params) {
    return defHttp.post({ url: '/cancelFreeze', params }, { isTransformResponse: false });
  }

  /**
   * 删除题目
   */
  static deleteTitle(params) {
    return defHttp.post({ url: '/title/delete', params }, { isTransformResponse: false });
  }

  /**
   * 批量删除题目
   */
  static batchDeleteUser(params) {
    return defHttp.post({ url: '/sysUser/batchDelete', params }, { errorMessageMode: 'message' });
  }
}
