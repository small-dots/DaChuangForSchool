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
                    v-model:value.trim="where.account"
                    placeholder="请输入题目名称"
                    allow-clear
                  />
                </a-form-item>
                <a-form-item label="指导教师:">
                  <a-input
                    v-model:value.trim="where.realName"
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
              showTableSetting
              rowKey="userId"
              :rowSelection="{
                type: 'checkbox',
                selectedRowKeys: checkedKeys,
                onChange: onSelectChange,
              }"
            >
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
                    <a-button
                      v-if="per('TITLE_CENTER_BATCH_DEL_BUTTON')"
                      danger
                      @click="removeBatch"
                    >
                      <template #icon>
                        <delete-outlined />
                      </template>
                      <span>批量删除</span>
                    </a-button>
                  </a-space>
                </div>
              </template>
              <template #bodyCell="{ column, record }">
                <!-- table操作栏按钮 -->
                <template v-if="column.key === 'action'">
                  <a-space>
                    <a @click="openEdit(record)" v-if="per('TITLE_CENTER_UPDATE_BUTTON')">编辑</a>
                    <a-divider type="vertical" />
                    <a @click="lock(record)" v-if="per('TITLE_CENTER_LOCK_BUTTON')">锁定</a>
                    <a-divider type="vertical" />
                    <a-popconfirm title="确定要删除此用户吗？" @confirm="remove(record)">
                      <a class="guns-text-danger" v-if="per('TITLE_CENTER_DEL_BUTTON')">删除</a>
                    </a-popconfirm>
                    <a-divider type="vertical" />
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
    />
  </div>
</template>

<script lang="ts" setup>
  import { BasicTable } from '/@/components/Table';
  import { onMounted, reactive, ref, createVNode } from 'vue';
  import TitleEdit from './components/title-edit.vue';
  import { UserApi } from '/@/api/system/user/UserApi';
  import { TitleApi } from '/@/api/dc/title/TitleApi';
  import { ExclamationCircleOutlined } from '@ant-design/icons-vue';
  import { message, Modal } from 'ant-design-vue';

  // 搜索数据
  const where = reactive({
    account: '',
    realName: '',
  });

  //ref
  const tableRef = ref<any>(null);
  //表格配置
  const columns = ref([
    {
      title: '题目名称',
      dataIndex: 'account',
    },
    {
      title: '指导教师',
      dataIndex: 'realName',
    },
    {
      title: '状态',
      key: 'status',
      dataIndex: 'status',
      align: 'center',
    },

    {
      title: '发布日期',
      dataIndex: 'phone',
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

  // 是否显示弹框
  const showEdit = ref<boolean>(false);

  // 当前行的数据
  const current = ref<any>(null);

  // 默认选中tab
  const defaultKey = ref<string>('1');

  onMounted(async () => {});

  const per = (code) => {
    const buttons = JSON.parse(localStorage.getItem('buttonCodes') as string);
    if (buttons?.includes(code)) {
      return true;
    }
    return false;
  };
  // 查询
  const reload = () => {
    checkedKeys.value = [];
    tableRef.value.reload({ page: 1 });
  };

  // 重置
  const reset = () => {
    where.account = '';
    where.realName = '';
    reload();
  };

  // 打开公司部门抽屉时，关闭表格的抽屉
  const closeCompanyEdit = () => {
    showEdit.value = false;
  };

  /**
   * 修改用户状态
   *
   * @author fengshuonan
   * @date 2021/4/2 17:04
   */
  const editState = async (checked: boolean, row: any) => {
    const userId = row.userId;
    // 用户状态：1-启用，2-禁用
    const statusFlag = checked ? 1 : 2;
    const result = await UserApi.changeStatus({ userId, statusFlag });
    message.success(result.message);
    row.statusFlag = statusFlag;
  };

  /**
   * 解除冻结用户
   *
   * @author fengshuonan
   * @date 2022/5/31 14:17
   */
  const unFreezeUser = async (record) => {
    const result = await UserApi.unFreezeUser({ account: record.account });
    message.success(result.message);
    reload();
  };

  // 打开新增编辑弹框
  const openEdit = (row?: any) => {
    defaultKey.value = '1';
    current.value = row;
    showEdit.value = true;
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
   * @author fengshuonan
   * @date 2021/4/2 17:03
   */
  const remove = async (row: any) => {
    const result = await UserApi.deleteUser({ userId: row.userId });
    message.success(result.message);
    reload();
  };

  // 锁定点击
  const lock = (row: any) => {
    console.log('题目锁定', row);
  };
</script>

<style scoped lang="less"></style>
