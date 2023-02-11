import { defHttp } from '/@/utils/http/axios';

export class ProjectApi {
  /**
   * 获取项目列表
   */
  static getProjectPages(params) {
    return defHttp.get({ url: '/dc/project/page', params });
  }

  /**
   * 新增项目
   */
  static addProject(params) {
    return defHttp.post({ url: '/dc/project/add', params }, { isTransformResponse: false });
  }

  /**
   * 修改项目
   */
  static editProject(params) {
    return defHttp.post({ url: '/dc/project/edit', params }, { isTransformResponse: false });
  }

  /**
   * 删除项目
   */
  static deleteProject(params) {
    return defHttp.post({ url: '/dc/project/delete', params }, { isTransformResponse: false });
  }
}
