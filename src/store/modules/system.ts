import { getCurrentThemeInfo } from '/@/api/system/theme';
import { getBackendDeployUrl } from '/@/api/system/user';
import { defineStore } from 'pinia';
import { store } from '/@/store';

interface SystemState {
  alreadyInitConfig: any;
  gunsMgrLogo: any;
  gunsMgrName: string;
  gunsMgrBeiNo: any;
  gunsMgrBeiUrl: string;
  gunsMgrFavicon: any;
  gunsMgrFooterText: any;
  gunsMgrLoginBackgroundImg: any;
  antdvFrontType: any;
  baseUrl: string;
}
export const useSystemStore = defineStore({
  id: 'system',
  state: (): SystemState => ({
    // 当前系统是否已经初始化过配置
    alreadyInitConfig: null,
    // 后台管理系统左上角Logo
    gunsMgrLogo: null,
    // 后台管理系统名称
    gunsMgrName: import.meta.env.VITE_GLOB_APP_TITLE,
    // 备案编号
    gunsMgrBeiNo: null,
    // 备案跳转url
    gunsMgrBeiUrl: 'https://beian.miit.gov.cn/',
    // favicon图标地址
    gunsMgrFavicon: null,
    // 页脚文字
    gunsMgrFooterText: null,
    // 登录页面背景图片
    gunsMgrLoginBackgroundImg: null,
    // 当前查询的是前台还是后台菜单，默认是前台，1-前台，2-后台
    antdvFrontType: localStorage.getItem('antdvFrontType') ? Number(localStorage.getItem('antdvFrontType')) : 1,
    //api基础路径
    baseUrl: '',
  }),
  getters: {},
  actions: {
    /**
     * 更新初始化状态
     *
     * @param {Boolean} initFlag 是否初始化了系统
     * @author anzhongqi
     * @date 2021/6/12 19:20
     */
    updateInitFlag(initFlag: boolean) {
      this.alreadyInitConfig = initFlag;
    },

    /**
     * 更新初始化状态
     *
     * @author anzhongqi
     * @date 2021/6/12 19:20
     */
    loadThemeInfo() {
      return new Promise((resolve) => {
        if (this.gunsMgrLogo != null) {
          resolve(Object.assign({}, this.$state));
        } else {
          getCurrentThemeInfo().then((result) => {
            this.gunsMgrLogo = result.gunsMgrLogo;
            this.gunsMgrName = result.gunsMgrName;
            this.gunsMgrBeiNo = result.gunsMgrBeiNo;
            this.gunsMgrBeiUrl = result.gunsMgrBeiUrl;
            this.gunsMgrFavicon = result.gunsMgrFavicon;
            this.gunsMgrFooterText = result.gunsMgrFooterText;
            this.gunsMgrLoginBackgroundImg = result.gunsMgrLoginBackgroundImg;
            resolve(result);
          });
        }
      });
    },

    /**
     * 设置菜单类型，前台菜单还是后台菜单
     *
     * @author anzhongqi
     * @date 2022/3/4 10:37
     */
    setMenuFrontType(antdvFrontType: any) {
      localStorage.setItem('antdvFrontType', antdvFrontType);
      this.antdvFrontType = antdvFrontType;
    },

    /**
     * 设置基础url
     *
     * @author anzhongqi
     * @date 2022/3/4 10:37
     */
    loadBaseUrl() {
      return new Promise((resolve) => {
        getBackendDeployUrl().then((result) => {
          this.baseUrl = result;
          resolve(result);
        });
      });
    },
  },
});

// Need to be used outside the setup
// 需要在设置之外使用
export function useSystemStoreWithOut() {
  return useSystemStore(store);
}
