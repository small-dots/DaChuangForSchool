import { router } from '/@/router';
import { useUserStoreWithOut } from '/@/store/modules/user';
import JSEncrypt from 'jsencrypt';

// 定义公钥
const publicKey = `MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCochIaKWEh6IIK1pJQcJPsYhZ2AJmGNc12XeC2lsj3dHkMO9vGrXN4ZJiN3qNLlO3hERtY0UZdN8Uz18zoiL60XoOclMuuwf1TwiMA3/4Vy2NOaQdX/RgLQ8XiRobVPLMe/JTteZ6eoPrWVC5jf4kdWD7LWwgdWrnzGs/4UiWnsQIDAQAB`;

/**
 * @author: nxy
 * @Date: 2022-10-10 14:18:30
 * @param {*} value 验证邮箱是否正确
 */
export function emailReg(value: string | number) {
  const exp: any = /^([a-zA-Z0-9_.-])+@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
  return exp.test(value);
}

/**
 * @author: nxy
 * @Date: 2022-10-10 14:19:06
 * @param {*} value 验证手机号是否正确
 */
export function phoneReg(value: string | number) {
  const exp: any = /^1\d{10}$/;
  return exp.test(value);
}

/**
 * @author: nxy
 * @Date: 2022-10-11 14:15:35
 * @param {any} arr 菜单数组
 */
export function setMenu(arr: any) {
  arr.forEach((arrItem) => {
    arrItem.name = arrItem.title;
    arrItem.meta = {};
    arrItem.meta.title = arrItem.title;
    arrItem.meta.hideMenu = arrItem.hide;
    arrItem.meta.icon = arrItem.icon;
    if (arrItem.children) arrItem.component = 'LAYOUT';
    arrItem.meta.orderNo = arrItem.sortNumber;

    if (arrItem.children && arrItem.children.length > 0) {
      arrItem.children = setMenu(arrItem.children);
    }
  });
  return arr;
}

/**
 * 遍历children形式数据
 * @param data 需要遍历的数组
 * @param callback 回调
 * @param childKey children字段名
 */
export function eachTreeData(data: any, callback: any, childKey = 'children') {
  if (!data || !data.length) {
    return;
  }
  data.forEach((d) => {
    if (callback(d) !== false && d[childKey]) {
      eachTreeData(d[childKey], callback, childKey);
    }
  });
}

/**
 * 删除空的children对象，为了显示树形菜单时不显示多余的 + 号
 *
 * @author anzhongqi
 * @date 2022/5/20 18:33
 */
export function deleteEmptyChild(nodes: any) {
  for (const thisNode of nodes) {
    if (!thisNode) {
      continue;
    }
    if (thisNode.children && thisNode.children.length === 0) {
      delete thisNode.children;
    } else if (thisNode.children && thisNode.children.length > 0) {
      thisNode.children = deleteEmptyChild(thisNode.children);
    }
  }
  return nodes;
}

/**
 * 退出登录
 * @param route 是否使用路由跳转
 * @param from 登录后跳转的地址
 */
export function logout(route: boolean, from: any) {
  const userStore = useUserStoreWithOut();
  userStore.setToken(undefined);
  if (route) {
    router.push({
      path: '/login',
    });
  } else {
    // 这样跳转避免再次登录重复注册动态路由
    location.replace('/login' + (from ? '?redirect=' + from : ''));
  }
}

/**
 * rsa加密
 * @author: nxy
 * @Date: 2022-10-16 21:53:44
 */
export function RsaEncry(data: any) {
  // 使用 RSA 公钥加密 请求响应解密的key
  const myEncrypt = new JSEncrypt();
  myEncrypt.setPublicKey(publicKey);
  const cryptRespKeyStr = myEncrypt.encrypt(data);
  return cryptRespKeyStr;
}

/**
 * 判断当前数据是否存在当前数据
 * @author: nxy
 * @Date: 2022-09-30 16:22:17
 * @param {*} arr 所有的数据
 * @param {*} name  tree中用于比较的值的名称
 * @param {*} id 传过来用于比较的数据
 * @param {*} children children的叫法
 */
export function valueIsExistTree(arr: string[], name: string, id: string, children: string) {
  let stark: string[] = [];
  stark = stark.concat(arr);
  while (stark.length) {
    const temp: any = stark.shift();
    if (temp[children] && temp[children].length > 0) {
      stark = stark.concat(temp[children]);
    }
    if (temp[name] === id) {
      return temp[name];
    }
  }
  return '';
}

/**
 * 格式化菜单数据
 * @param data 菜单数据
 * @param parseMenuItem 自定义格式菜单item
 * @returns {{homePath: String, homeTitle: String, menus: Array}}
 */
export function formatMenus(data: any, parseMenuItem: any) {
  let home: any = null,
    menus = formatTreeData(data, (d) => {
      const item = parseMenuItem ? parseMenuItem(d) : Object.assign({}, d);
      if (!item.children || !item.children.length) {
        if (!home && item.path && !isUrl(item.path)) {
          home = {
            path: item.path,
            title: item.meta.title,
          };
        }
      } else if (item.children[0].path) {
        const cp = item.children[0].path;
        if (!item.redirect) {
          item.redirect = cp;
        }
        if (!item.path) {
          item.path = cp.substring(0, cp.lastIndexOf('/'));
        }
      }
      if (!item.path) {
        console.error('菜单的path作为vue循环的key不能为空且要唯一: ', d);
        return false;
      }
      return item;
    });
  return {
    menus: menus,
    homePath: home ? home.path : null,
    homeTitle: home ? home.title : null,
  };
}

/**
 * 处理树形数据
 * @param data 需要处理的数据
 * @param formatter 处理器
 * @param childKey children字段名
 * @returns {[]} 处理后的数据
 */
export function formatTreeData(data, formatter, childKey = 'children') {
  const result: any = [];
  if (data && data.length) {
    data.forEach((d) => {
      const item = formatter(d);
      if (item !== false) {
        if (item[childKey]) {
          item[childKey] = formatTreeData(item[childKey], formatter, childKey);
        }
        result.push(item);
      }
    });
  }
  return result;
}

/**
 * 判断是否是外链
 * @param url
 * @returns {boolean}
 */
export function isUrl(url) {
  return !!(
    url &&
    (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('//'))
  );
}
