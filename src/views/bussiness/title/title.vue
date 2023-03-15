<template>
  <div class="guns-body">
    <a-row :gutter="16">
      <a-col :lg="24" :md="19" :sm="24" :xs="24">
        <!-- 搜索表单 -->
        <div class="block-interval">
          <a-card :bordered="false">
            <a-form layout="inline" :model="where">
              <a-row>
                <a-form-item label="题目名称:">
                  <a-input
                    v-model:value.trim="where.titleTitle"
                    placeholder="请输入题目名称"
                    allow-clear
                  />
                </a-form-item>
                <a-form-item label="指导教师:">
                  <a-input
                    v-model:value.trim="where.teacherName"
                    placeholder="请输入指导教师"
                    allow-clear
                  />
                </a-form-item>
                <a-form-item class="ele-text-center">
                  <a-space>
                    <a-button
                      v-if="per('TITLE_CENTER_SEARCH_BUTTON')"
                      type="primary"
                      @click="reload"
                      >查询</a-button
                    >
                    <a-button @click="reset">重置</a-button>
                  </a-space>
                </a-form-item>
              </a-row>
            </a-form>
          </a-card>
        </div>

        <!-- 表格 -->
        <div>
          <a-card :bordered="false" class="table-height">
            <BasicTable
              :canResize="false"
              ref="tableRef"
              :api="TitleApi.getTitlePages"
              :where="where"
              :columns="columns"
              rowKey="titleId"
            >
              <template #statusFlag="{ record }">
                <a-tag color="blue" v-if="record.statusFlag === 1">{{
                  statusMap[record.statusFlag]
                }}</a-tag>
                <a-tag color="green" v-if="record.statusFlag === 2">{{
                  statusMap[record.statusFlag]
                }}</a-tag>
              </template>
              <template #toolbar>
                <div class="table-toolbar">
                  <a-space>
                    <a-button
                      v-if="per('TITLE_CENTER_ADD_BUTTON')"
                      type="primary"
                      @click="openEdit()"
                    >
                      <template #icon>
                        <plus-outlined />
                      </template>
                      <span>发布</span>
                    </a-button>
                  </a-space>
                </div>
              </template>
              <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'titleTitle'">
                  <a @click="openView(record)">{{ record.titleTitle }}</a></template
                >
                <!-- table操作栏按钮 -->
                <template v-if="column.key === 'action'">
                  <a-space>
                    <a
                      @click="openEdit(record)"
                      v-if="per('TITLE_CENTER_UPDATE_BUTTON') && isAuther(record)"
                      >编辑</a
                    >
                    <a-divider type="vertical" />
                    <a
                      @click="lock(record)"
                      v-if="per('TITLE_CENTER_LOCK_BUTTON') && isAuther(record)"
                      >{{ record.statusFlag === 1 ? '锁定' : '解锁' }}</a
                    >
                    <a-divider type="vertical" />
                    <a-popconfirm title="确定要删除此用户吗？" @confirm="remove(record)">
                      <a
                        class="guns-text-danger"
                        v-if="per('TITLE_CENTER_DEL_BUTTON') && isAuther(record)"
                        >删除</a
                      >
                    </a-popconfirm>
                  </a-space>
                </template>
              </template>
            </BasicTable>
          </a-card>
        </div>
      </a-col>
    </a-row>

    <!-- 编辑弹窗 -->
    <title-edit
      v-model:visible="showEdit"
      :data="current"
      @done="reload"
      :defaultKey="defaultKey"
      v-if="showEdit"
      ref="userEdit"
      :userList="userList"
    />
    <title-view
      v-model:visible="showView"
      :data="current"
      @done="reload"
      :defaultKey="defaultKey"
      v-if="showView"
      ref="userView"
      :userList="userList"
    />
  </div>
</template>

<script lang="ts" setup>
  import { BasicTable } from '/@/components/Table';
  import { onMounted, reactive, ref, createVNode } from 'vue';
  import TitleEdit from './components/title-edit.vue';
  import TitleView from './components/title-view.vue';

  import { UserApi } from '/@/api/system/user/UserApi';
  import { TitleApi } from '/@/api/dc/title/TitleApi';
  import { ExclamationCircleOutlined } from '@ant-design/icons-vue';
  import { message, Modal } from 'ant-design-vue';

  // 搜索数据
  const where = reactive({
    titleTitle: '',
    teacherName: '',
  });
  const statusMap = {
    1: '未选',
    2: '已选',
  };
  //ref
  const tableRef = ref<any>(null);
  //表格配置
  const columns = ref([
    {
      title: '题目名称',
      dataIndex: 'titleTitle',
      key: 'titleTitle',
    },
    {
      title: '指导教师',
      dataIndex: 'teacherName',
    },
    {
      title: '状态',
      key: 'statusFlag',
      dataIndex: 'statusFlag',
      align: 'center',
      slots: { customRender: 'statusFlag' },
    },

    {
      title: '发布日期',
      dataIndex: 'createTime',
    },
    {
      title: '操作',
      key: 'action',
      align: 'center',
      width: 300,
      hideInSetting: true,
    },
  ]);

  // 表格多选选中列表
  const checkedKeys = ref<Array<string | number>>([]);
  const userList = ref([]);
  // 是否显示弹框
  const showEdit = ref<boolean>(false);
  const showView = ref<boolean>(false);
  // 当前行的数据
  const current = ref<any>(null);

  // 默认选中tab
  const defaultKey = ref<string>('1');

  const per = (code) => {
    const buttons = JSON.parse(localStorage.getItem('buttonCodes') as string);
    if (buttons?.includes(code)) {
      return true;
    }
    return false;
  };
  // 判断是否是指导教师
  const isAuther = (row) => {
    const roleList = JSON.parse(localStorage.getItem('UserInfo') as string).simpleRoleInfoList;
    let isAdmin = false;
    if (roleList[0].roleCode.startsWith('admin') || roleList[0].roleCode === 'superAdmin') {
      isAdmin = true;
    }
    console.log(isAdmin);
    const realName = JSON.parse(localStorage.getItem('UserInfo') as string).simpleUserInfo
      ?.realName;
    if (row.createName === realName || isAdmin) {
      return true;
    }
    return false;
  };
  const isStudent = () => {
    const roleList = JSON.parse(localStorage.getItem('UserInfo') as string).simpleRoleInfoList;
    if (roleList[0].roleCode === 'student') {
      return true;
    }
    return false;
  };
  // 查询
  const reload = () => {
    checkedKeys.value = [];
    tableRef.value.reload({ page: 1 });
  };
  onMounted(() => {
    if (isStudent()) {
      columns.value = columns.value.filter((item) => item.key !== 'action');
    }
    getUserList();
  });
  // 重置
  const reset = () => {
    where.titleTitle = '';
    where.teacherName = '';
    reload();
  };

  // 打开公司部门抽屉时，关闭表格的抽屉
  const closeCompanyEdit = () => {
    showEdit.value = false;
  };

  // 打开新增编辑弹框
  const openEdit = (row?: any) => {
    defaultKey.value = '1';
    current.value = row;
    showEdit.value = true;
  };
  const openView = (row) => {
    defaultKey.value = '1';
    current.value = row;
    showView.value = true;
  };
  /**
   * 获取通知的用户列表
   */
  const getUserList = () => {
    UserApi.getUserList({}).then((res) => {
      userList.value = res.rows;
      userList.value = userList.value.map((item) => ({
        key: item.userId,
        title: item.realName,
        description: item.account,
        disabled: false,
      }));
    });
  };

  /**
   * 批量删除
   * @author: nxy
   * @Date: 2022-10-09 16:56:28
   */
  const removeBatch = () => {
    showEdit.value = false;
    if (!checkedKeys.value.length) {
      message.error('请至少选择一条数据');
      return;
    }
    Modal.confirm({
      title: '提示',
      content: '确定要删除选中的用户吗?',
      icon: createVNode(ExclamationCircleOutlined),
      maskClosable: true,
      onOk: async () => {
        let params = checkedKeys.value;
        const result = await UserApi.batchDeleteUser({ userIds: params });
        message.success(result.message);
        reload();
      },
    });
  };

  // 表格选中改变
  const onSelectChange = (selectedRowKeys: (string | number)[]) => {
    checkedKeys.value = selectedRowKeys;
  };
  /**
   * 删除单个
   *
   * @author anzhongqi
   * @date 2021/4/2 17:03
   */
  const remove = async (row: any) => {
    const result = await TitleApi.deleteTitle({ titleId: row.titleId });
    message.success(result.message);
    reload();
  };

  /**
   * 修改题目状态
   * @author anzhongqi
   * @date 2021/4/2 17:04
   */
  const lock = async (row: any) => {
    // 状态：1-未选，2-已选
    const status = row.statusFlag === 1 ? 2 : 1;
    const res = await TitleApi.FreezeTitle({ titleId: row.titleId, statusFlag: status });
    if (res.code === '00000') {
      message.success(row.statusFlag === 1 ? '已锁定' : '已解锁');
      row.statusFlag = status;
    }
  };
</script>

<style scoped lang="less"></style>
