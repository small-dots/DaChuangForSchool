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
                <a-form-item label="项目名称:">
                  <a-input
                    v-model:value.trim="where.projectTitle"
                    placeholder="请输入项目名称"
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
              :api="ProjectApi.getProjectPages"
              :where="where"
              :columns="columns"
              rowKey="userId"
            >
              <template #statusFlag="{ text }">{{ status[text] }} </template>
              <template #bodyCell="{ column, record }">
                <!-- table操作栏按钮 -->
                <template v-if="column.key === 'action'">
                  <a-space>
                    <a @click="openView(record)">查看</a>
                    <a-divider type="vertical" />
                    <a @click="openEdit(record)">编辑</a>
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
    />
    <ProjectEdit1
      v-model:visible="showModal"
      :data="current"
      @done="reload"
      :defaultKey="defaultKey"
      v-if="showModal"
    />
  </div>
</template>

<script lang="ts" setup>
  import { BasicTable } from '/@/components/Table/index.ts';
  import { reactive, ref } from 'vue';
  import ProjectEdit from './components/project-edit.vue';
  import ProjectEdit1 from './components/project-edit-1.vue';
  import { ProjectApi } from '/@/api/dc/project/ProjectApi.ts';
  import { message } from 'ant-design-vue';
  const status = {
    1: '进行中',
    2: '已结题',
    3: '已终止',
  };
  // 搜索数据
  const where = reactive({
    projectTitle: '',
  });
  const isView = ref<boolean>(false);
  //ref
  const showModal = ref<boolean>(false);
  const tableRef = ref<any>(null);
  //表格配置
  const columns = ref([
    {
      title: '项目名称',
      dataIndex: 'projectTitle',
    },
    {
      title: '项目负责人',
      dataIndex: 'createName',
    },
    {
      title: '创建日期',
      dataIndex: 'createTime',
    },
    {
      title: '状态',
      dataIndex: 'statusFlag',
      key: 'statusFlag',
      slots: { customRender: 'statusFlag' },
    },
    {
      title: '立项时间',
      dataIndex: 'publishTime',
    },
    {
      title: '结题时间',
      dataIndex: 'endTime',
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

  /**
   * 修改项目状态
   *
   * @author anzhongqi
   * @date 2021/4/2 17:04
   */
  const editState = async (checked: boolean, row: any) => {
    const userId = row.userId;
    // 项目状态：1-启用，2-禁用
    const statusFlag = checked ? 1 : 2;
    const result = await ProjectApi.changeStatus({ userId, statusFlag });
    message.success(result.message);
    row.statusFlag = statusFlag;
  };

  // 打开新增编辑弹框
  const openEdit = (row: any) => {
    defaultKey.value = '1';
    current.value = row;
    showModal.value = true;
  };
  const pattner = (row: any) => {
    defaultKey.value = '2';
    current.value = row;
    isView.value = true;
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
   * @author anzhongqi
   * @date 2021/4/2 17:03
   */
  const remove = async (row: any) => {
    const result = await ProjectApi.deleteProject({ projectId: row.projectId });
    message.success(result.message);
    reload();
  };
</script>

<style scoped lang="less"></style>
