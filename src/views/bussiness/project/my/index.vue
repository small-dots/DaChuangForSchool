<!-- 我的项目（学生） -->
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
                    <a-button type="primary" @click="reload">查询</a-button>
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
              :api="UserApi.getUserPages"
              :where="where"
              :columns="columns"
              rowKey="userId"
            >
              <template #toolbar>
                <div class="table-toolbar">
                  <a-space>
                    <a-button type="primary" @click="openEdit()">
                      <template #icon>
                        <plus-outlined />
                      </template>
                      <span>新建项目</span>
                    </a-button>
                  </a-space>
                </div>
              </template>
              <template #bodyCell="{ column, record }">
                <template v-if="column.dataIndex == 'realName'">
                  <a @click="openEdit(record)">{{ record.realName }}</a>
                </template>
                <!-- table操作栏按钮 -->
                <template v-else-if="column.key === 'action'">
                  <a-space>
                    <a @click="openView(record)">查看</a>
                    <a-divider type="vertical" />
                    <a @click="openEdit(record)">编辑</a>
                    <a-divider type="vertical" />
                    <a-popconfirm title="确定要删除此项目吗？" @confirm="remove(record)">
                      <a class="guns-text-danger">删除</a>
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
    <project-edit
      v-model:visible="showEdit"
      :data="current"
      @done="reload"
      :isView="isView"
      :defaultKey="defaultKey"
      v-if="showEdit"
      ref="ProjectEdit"
    />
  </div>
</template>

<script lang="ts" setup>
  import { BasicTable } from '/@/components/Table/index.ts';
  import { onMounted, reactive, ref, createVNode } from 'vue';
  import ProjectEdit from './components/project-edit.vue';
  import { UserApi } from '/@/api/system/user/UserApi.ts';
  import { ExclamationCircleOutlined } from '@ant-design/icons-vue';
  import { message, Modal } from 'ant-design-vue';

  // 搜索数据
  const where = reactive({
    orgId: '',
    account: '',
    realName: '',
  });
  const isView = ref<boolean>(false);
  //ref
  const tableRef = ref<any>(null);
  //表格配置
  const columns = ref<string[]>([
    {
      title: '项目名称',
      dataIndex: 'account',
    },
    {
      title: '指导教师',
      dataIndex: 'realName',
    },
    {
      title: '团队成员',
      key: 'status',
      dataIndex: 'status',
      align: 'center',
    },

    {
      title: '创建日期',
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

  // 是否显示弹框
  const showEdit = ref<boolean>(false);

  // 当前行的数据
  const current = ref<any>(null);

  // 默认选中tab
  const defaultKey = ref<string>('1');

  onMounted(async () => {});

  // 查询
  const reload = () => {
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
  const openEdit = (row: any) => {
    defaultKey.value = '1';
    current.value = row;
    showEdit.value = true;
  };

  const openView = (row: any) => {
    defaultKey.value = '1';
    current.value = row;
    isView.value = true;
    showEdit.value = true;
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
</script>

<style scoped lang="less"></style>
