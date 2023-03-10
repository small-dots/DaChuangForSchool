<template>
  <div>
    <a-modal
      ref="printModal"
      visible="visible"
      :forceRender="true"
      :maskClosable="false"
      title="元器件申请表打印"
      width="40%"
      :body-style="{ paddingBottom: '8px' }"
      @update:visible="updateVisible"
    >
      <div class="print_target" id="print-target">
        <a-descriptions title="申请信息" :column="2" bordered>
          <a-descriptions-item label="申请人姓名">{{ formState.name }}</a-descriptions-item>
          <a-descriptions-item label="学(工)号">{{ formState.number }}</a-descriptions-item>
          <a-descriptions-item label="申请日期">2023-01-09 15:33:01</a-descriptions-item>
          <a-descriptions-item label="联系电话">{{ formState.phone }}</a-descriptions-item>
          <a-descriptions-item label="项目名称">{{ formState.name }}</a-descriptions-item>
          <a-descriptions-item label="项目编号" :span="2">{{ formState.name }}</a-descriptions-item>
          <a-descriptions-item label="项目负责人" :span="3">
            {{ formState.name }}</a-descriptions-item
          >
          <a-descriptions-item label="附件">
            {{ data.approvalFile.fileOriginName }}
          </a-descriptions-item>
        </a-descriptions>
        <a-divider />
        <div class="review_container">
          <div class="title">审核信息</div>
          <a-table :pagination="false" :dataSource="dataSource" :columns="columns">
            <template #status="{ text }">
              <a-tag v-if="text === '1'" color="green">同意</a-tag>
              <a-tag v-if="text === '2'" color="red">拒绝</a-tag></template
            ></a-table
          >
        </div>
      </div>
      <template #footer>
        <a-button @click="close">取消</a-button>
        <a-button v-print="printObj" type="primary">打印</a-button>
      </template>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
  import { reactive, ref, UnwrapRef, onMounted } from 'vue';
  import print from 'vue3-print-nb';
  interface FormState {
    name: string | undefined;
    phone: string | number | undefined;
    number: string | undefined;
    delivery: boolean;
    type: string[];
    resource: string;
    desc: string;
  }
  interface SimpleUserInfo {
    realName: string | undefined;
    tel: string | number | undefined;
  }
  interface Userinfo {
    simpleUserInfo?: SimpleUserInfo;
    account?: string | undefined;
    superAdmin?: boolean;
  }
  interface FileItem {
    uid: string;
    name?: string;
    status?: string;
    response?: Response;
    url: string;
  }
  interface FileInfo {
    file: FileItem;
    fileList: FileItem[];
  }
  const columns = [
    {
      title: '审批人',
      dataIndex: 'createName',
      key: 'createName',
    },
    {
      title: '审批时间',
      dataIndex: 'createTime',
      key: 'createTime',
    },
    {
      title: '审核状态',
      dataIndex: 'status',
      key: 'status',
      slots: { customRender: 'status' },
    },
    {
      title: '审核意见',
      dataIndex: 'approval',
      key: 'approval',
    },
  ];
  const dataSource = ref([]);
  const fileList = ref<FileItem[]>([]);
  const isSuper = ref<boolean>(false);
  const props = defineProps<{
    visible: Boolean;
    isReview: Boolean;
    data;
  }>();
  const labelCol = {
    span: 5,
  };
  const wrapperCol = {
    span: 17,
  };

  const printObj = ref({
    id: 'print-target',
    preview: false,
    popTitle: '元器件申请表单',
    extraCss:
      'https://cdn.bootcdn.net/ajax/libs/animate.css/4.1.1/animate.compat.css, https://cdn.bootcdn.net/ajax/libs/hover.css/2.3.1/css/hover-min.css',
    extraHead: '<meta http-equiv="Content-Language"content="zh-cn"/>',
  });
  const userinfo = ref<Userinfo>({});
  onMounted(() => {
    console.log(print);
    userinfo.value = JSON.parse(localStorage.getItem('UserInfo') as string);
    const { simpleUserInfo, account } = userinfo.value;
    isSuper.value = userinfo.value.superAdmin as boolean;
    formState.name = props.data.createName;
    formState.phone = props.data?.phone;
    formState.number = props.data.account;
    dataSource.value = props.data?.history || [];
  });
  const emits = defineEmits<{
    (e: 'update:visible', visible: boolean): void;
    (e: 'done'): void;
    (e: 'close', visible: boolean): void;
  }>();
  const close = (value) => {
    emits('close', value);
  };
  const updateVisible = (value) => {
    emits('update:visible', value);
  };
  const printModal = ref();
  const formState: UnwrapRef<FormState> = reactive({
    name: '',
    phone: undefined,
    number: undefined,
    delivery: false,
    type: [],
    resource: '',
    desc: '',
  });
</script>

<style scoped>
  .review_container {
    margin-bottom: 20px;
  }

  .review_container .title {
    flex: auto;
    overflow: hidden;
    color: rgba(0, 0, 0, 0.85);
    font-weight: bold;
    font-size: 16px;
    line-height: 1.5715;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .footer-buttons {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
  }
</style>
