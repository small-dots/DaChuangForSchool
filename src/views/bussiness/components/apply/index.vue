<template>
  <div class="guns-body">
    <a-row :gutter="16">
      <a-col :lg="24" :md="19" :sm="24" :xs="24">
        <!-- 搜索表单 -->
        <div class="block-interval">
          <a-card :bordered="false">
            <a-form layout="inline" :model="where">
              <a-row>
                <a-form-item label="申请人姓名:">
                  <a-input
                    v-model:value.trim="where.createName"
                    placeholder="请输入申请人姓名"
                    allow-clear
                  />
                </a-form-item>
                <a-form-item label="项目名称:">
                  <a-input
                    v-model:value.trim="where.projectTitle"
                    placeholder="请输入项目名称"
                    allow-clear
                  />
                </a-form-item>
                <a-form-item class="ele-text-center">
                  <a-space>
                    <a-button
                      v-if="per('COMPONENT_APPLY_SEARCH_BUTTON')"
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
              :api="ComponentApi.getComponentPages"
              :where="where"
              :columns="columns"
              showTableSetting
              rowKey="componentId"
            >
              <template #status="{ text }"
                ><a-tag color="blue">{{ statusMap[text] }}</a-tag></template
              >
              <template #toolbar>
                <div class="table-toolbar">
                  <a-space>
                    <a-button
                      v-if="per('COMPONENT_APPLY_ADD_BUTTON')"
                      type="primary"
                      @click="openEdit()"
                    >
                      <template #icon>
                        <plus-outlined />
                      </template>
                      <span>发起申请</span>
                    </a-button>
                    <a-upload
                      v-if="per('COMPONENT_APPLY_UPLOAD')"
                      name="file"
                      :max-count="1"
                      :multiple="false"
                      :action="fileUploadUrl"
                      v-model:file-list="templateList"
                      :headers="headers"
                      @change="afterUploadFile"
                    >
                      <a-button type="primary">
                        <upload-outlined />
                        申请单上传
                      </a-button>
                    </a-upload>
                  </a-space>
                </div>
              </template>
              <template #bodyCell="{ column, record }">
                <!-- table操作栏按钮 -->
                <template v-if="column.key === 'action'">
                  <a-space>
                    <a
                      @click="openEdit(record, true)"
                      v-if="per('COMPONENTS_APPLY_REVIEW_BUTTON') && record.status === '1'"
                      >审核</a
                    >
                    <a
                      @click="openEdit(record, true, true)"
                      v-if="per('COMPONENTS_APPLY_REVIEW_BUTTON_ADMIN') && record.status === '2'"
                      >审核</a
                    >
                    <a
                      @click="openEdit(record, true)"
                      v-if="per('COMPONENTS_APPLY_REVIEW_BUTTON_ADMIN2') && record.status === '3'"
                      >审核</a
                    >
                    <a @click="print(record)" v-if="per('COMPONENTS_APPLY_PRINT_BUTTON')"
                      >流程打印</a
                    >
                    <a-divider type="vertical" />
                    <a @click="view(record)" v-if="per('COMPONENT_APPLY_SEARCH_BUTTON')">查看</a>
                    <a-divider type="vertical" />
                    <a
                      @click="openEdit(record)"
                      v-if="per('COMPONENT_APPLY_UPDATE_BUTTON') && record.status === '5'"
                      >编辑</a
                    >
                    <a-divider type="vertical" />
                    <a-popconfirm title="确定要删除此用户吗？" @confirm="remove(record)">
                      <a class="guns-text-danger" v-if="per('COMPONENT_APPLY_DEL_BUTTON')">删除</a>
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
    <Diolag
      v-model:visible="showModal"
      :data="current"
      @done="reload"
      :isViews="isViews"
      @submit="submit"
      @apply="apply"
      :isReview="isReview"
      :isAdmin="isAdmin"
      :defaultKey="defaultKey"
      v-if="showModal"
    />
    <Print
      v-model:visible="showPrintModal"
      :data="current"
      @done="reload"
      :isReview="isReview"
      :defaultKey="defaultKey"
      v-if="showPrintModal"
      @close="showPrintModal = false"
    />
  </div>
</template>

<script lang="ts" setup>
  import { BasicTable } from '/@/components/Table';
  import { onMounted, reactive, ref, computed } from 'vue';
  import Diolag from './modal.vue';
  import { ComponentApi } from '/@/api/dc/component/componentApi';
  import { message } from 'ant-design-vue';
  import Print from './print.vue';
  import { FileUploadUrl } from '/@/api/system/operation/FileApi';
  import { useUserStore } from '/@/store/modules/user';
  // 搜索数据
  const where = reactive({
    status: [1, 2, 3, 4, 5],
    projectTitle: '',
    createName: '',
  });

  type TableDataType = {
    key: string;
    name: string;
    age: number;
    date: string;
  };
  const statusMap = {
    1: '老师审核',
    2: '管理员审核',
    3: '管理员复核',
    4: '已通过',
    5: '已拒绝',
  };
  const templateList = ref([]);
  const isViews = ref(false);
  //ref
  const tableRef = ref<any>(null);
  const isReview = ref<boolean>(false);
  //表格配置
  const columns = ref([
    {
      title: '项目名称',
      dataIndex: 'projectTitle',
    },
    {
      title: '申请人',
      dataIndex: 'createName',
    },
    {
      title: '状态',
      key: 'status',
      dataIndex: 'status',
      align: 'center',
      filters: [
        { text: '老师审核', value: 1 },
        { text: '管理员审核', value: 2 },
        { text: '管理员复核', value: 3 },
        { text: '已通过', value: 4 },
        { text: '已拒绝', value: 5 },
      ],
      slots: { customRender: 'status' },
    },

    {
      title: '申请日期',
      dataIndex: 'createTime',
      defaultSortOrder: 'descend',
      sorter: (a: TableDataType, b: TableDataType) => a.createTime - b.createTime,
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
  const isAdmin = ref<boolean | undefined>(false);
  // 是否显示弹框
  const showModal = ref<boolean>(false);
  const showPrintModal = ref<boolean>(false);
  // 当前行的数据
  const current = ref<any>(null);

  // 默认选中tab
  const defaultKey = ref<string>('1');

  onMounted(async () => {
    // 获取按钮权限
    /* 
       老师审核   --1 
       管理员审核 --2 
       管理员复核 --3 
       已通过    --4 
       已拒绝    --5  
       */
    // 学生
    if (per('COMPONENT_APPLY_QUERY_STUDENT')) {
      where.status = [1, 2, 3, 4, 5];
    }
    // 经销商
    if (per('COMPONENT_APPLY_QUERY_DIS')) {
      where.status = [4];
    }
    // 老师
    if (per('COMPONENT_APPLY_QUERY_TEACHER')) {
      where.status = [1, 2, 3, 4, 5];
    }
    //管理员1
    if (per('COMPONENT_APPLY_QUERY_ADMIN1')) {
      where.status = [2, 4, 5];
      isAdmin.value = true;
    }
    //管理员2
    if (per('COMPONENT_APPLY_QUERY_ADMIN2')) {
      where.status = [3, 4, 5];
      isAdmin.value = true;
    }
  });

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
    where.status = [1, 2, 3, 4, 5];
    where.projectTitle = '';
    where.createName = '';
    reload();
  };
  const apply = (data) => {
    addApprovalList(data);
  };
  const submit = async (data) => {
    console.log(data);
    const params = {
      projectId: data.projectId,
      approvalFile: data.approvalFile,
    };
    ComponentApi.addComponent({ ...params }).then((res) => {
      addApprovalList({ componentId: res.data, ...data });
    });
  };
  const addApprovalList = async (data) => {
    console.log('09090-344908347598347503849', data);
    const params = {
      componentId: data.componentId,
      approvalStatus: data.applyResult,
      componentStatus: getStatus(data),
      approval: data.applyDesc,
    };
    const { code } = await ComponentApi.addComponentApproval({ ...params });
    if (code === '00000') {
      message.success('请求已完成');
      //关闭弹框
      showModal.value = false;
      reload();
    }
  };
  const getStatus = (data) => {
    /* 
       老师审核   --1 
       管理员审核 --2 
       管理员复核 --3 
       已通过    --4 
       已拒绝    --5  
       */
    // 学生
    let code = 1;
    if (per('COMPONENT_APPLY_QUERY_STUDENT')) {
      code = 1;
    }
    // 老师
    if (per('COMPONENT_APPLY_QUERY_TEACHER')) {
      code = data?.applyResult === 1 ? 2 : 5;
    }
    //管理员1
    if (per('COMPONENT_APPLY_QUERY_ADMIN1')) {
      if (data?.needReview) {
        code = 3;
      } else {
        code = data?.applyResult === 1 ? 4 : 5;
      }
    }
    //管理员2
    if (per('COMPONENT_APPLY_QUERY_ADMIN2')) {
      code = data?.applyResult === 1 ? 4 : 5;
    }
    return code;
  };
  const userStore = useUserStore();
  // token
  const token = computed(() => {
    return userStore.getToken;
  });
  // 上传文件的url
  const fileUploadUrl = ref(`${import.meta.env.VITE_GLOB_API_URL}${FileUploadUrl}?secretFlag=N`);

  const headers = reactive({
    Authorization: token.value,
  });
  /**
   * 文件上传成功的回调
   */
  const afterUploadFile = async ({ file }) => {
    if (file.response) {
      console.log(file);
      const { code } = await ComponentApi.uploadComponentTemplate({
        fileId: file.response.data.fileId,
      });
      if (code === '00000') {
        message.success('上传成功');
      }
    }
  };

  // 打开新增编辑弹框
  const openEdit = (row?: any, flag?, admin?: boolean | undefined) => {
    defaultKey.value = '1';
    current.value = row;
    showModal.value = true;
    isReview.value = flag;
    isAdmin.value = admin;
  };
  const view = (row) => {
    defaultKey.value = '1';
    current.value = row;
    showModal.value = true;
    isViews.value = true;
    // isReview.value = flag;
    // isAdmin.value = admin;
  };
  // 打印
  const print = (row?: any) => {
    current.value = row;
    showPrintModal.value = true;
  };

  /**
   * 删除单个
   * @author anzhongqi
   * @date 2021/4/2 17:03
   */
  const remove = async (row: any) => {
    const result = await ComponentApi.deleteComponent({ componentId: row.componentId });
    message.success(result.message);
    reload();
  };
</script>

<style scoped lang="less">
  /deep/ .ant-upload-list.ant-upload-list-text {
    display: inline-block;
  }
</style>
