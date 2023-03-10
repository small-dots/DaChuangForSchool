import { defHttp } from '/@/utils/http/axios';
import { SysUserDTO, SysUserRequest } from '../system/user/model/UserModel';
import { UpdatePasswordParam } from './model/PersonInfoModel';

/**
 * 个人信息api
 *
 * @author anzhongqi
 * @date 2021/4/1 15:03
 */
export class PersonInfoApi {
  /**
   * 获取当前用户信息
   *
   * @author anzhongqi
   * @date 2021/4/1 15:04
   */
  static getCurrentLoginUserInfo() {
    return defHttp.get<SysUserDTO>({ url: '/sysUser/currentUserInfo' });
  }

  /**
   * 更新当前用户信息
   *
   * @param {String} params.account   账号
   * @param {String} params.birthday  生日
   * @param {String} params.email     邮箱
   * @param {String} params.phone     电话
   * @param {String} params.realName  真实姓名
   * @param {String} params.sex       性别
   * @param {String} params.userId    用户id
   * @author anzhongqi
   * @date 2021/4/13 16:16
   */
  static updateUserInfo(params: SysUserRequest) {
    return defHttp.post({ url: '/sysUser/updateInfo', params }, { isTransformResponse: false });
  }

  /**
   * 修改密码
   *
   * @param {String} password      旧密码
   * @param {String} newPassword   新密码
   * @author anzhongqi
   * @date 2021/4/1 15:09
   */
  static updatePassword(params: UpdatePasswordParam) {
    return defHttp.post({ url: '/sysUser/updatePassword', params }, { isTransformResponse: false });
  }

  /**
   * 修改头像
   *
   * @param {String} avatar    头像id
   * @author anzhongqi
   * @date 2021/4/1 15:09
   */
  static updateAvatar(params) {
    return defHttp.post({ url: '/sysUser/updateAvatar', params }, { isTransformResponse: false });
  }
}
