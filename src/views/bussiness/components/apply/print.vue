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
            元器件申请单-2021-01-01.docx
            <br />
            元器件申请单-2021-01-01.docx
            <br />
            元器件申请单-2021-01-01.docx
            <br />
            元器件申请单-2021-01-01.docx
            <br />
            元器件申请单-2021-01-01.docx
            <br />
          </a-descriptions-item>
        </a-descriptions>
        <a-divider />
        <div class="review_container">
          <div class="title">审核信息</div>
          <a-table :pagination="false" :dataSource="dataSource" :columns="columns" />
        </div>
      </div>
      <!-- <template #footer>
        <div class="footer-buttons">
          <a-button @click="close">取消</a-button>
          <a-button type="primary" v-print="printObj">打印</a-button>
        </div></template
      > -->
    </a-modal>
  </div>
</template>

<script setup lang="ts">
  import { reactive, ref, UnwrapRef, onMounted } from 'vue';
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
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '审批时间',
      dataIndex: 'time',
      key: 'time',
    },
    {
      title: '审核状态',
      dataIndex: 'status',
      key: 'status',
    },
    {
      title: '审核意见',
      dataIndex: 'desc',
      key: 'desc',
    },
  ];
  const dataSource = ref([
    {
      key: '1',
      name: '胡彦斌',
      status: '同意',
      desc: '条件满足',
      time: '2023-01-06 12:02:19',
    },
    {
      key: '2',
      name: '张全',
      status: '拒绝',
      desc: '条件不满足',
      time: '2023-01-06 18:20:46',
    },
  ]);
  const fileList = ref<FileItem[]>([
    {
      uid: '-1',
      name: '元器件申请单-2021-01-01.docx',
      status: 'done',
      url: 'http://www.baidu.com/xxx.png',
    },
  ]);
  const isSuper = ref<boolean>(false);
  const props = defineProps<{
    visible: Boolean;
    isReview: Boolean;
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
    extraCss:
      'https://cdn.bootcdn.net/ajax/libs/animate.css/4.1.1/animate.compat.css, https://cdn.bootcdn.net/ajax/libs/hover.css/2.3.1/css/hover-min.css',
    extraHead: '<meta http-equiv="Content-Language"content="zh-cn"/>',
  });
  const userinfo = ref<Userinfo>({});
  onMounted(() => {
    userinfo.value = JSON.parse(localStorage.getItem('UserInfo') as string);
    const { simpleUserInfo, account } = userinfo.value;
    isSuper.value = userinfo.value.superAdmin as boolean;
    formState.name = simpleUserInfo?.realName;
    formState.phone = simpleUserInfo?.tel;
    formState.number = account;
  });
  const emits = defineEmits<{
    (e: 'update:visible', visible: boolean): void;
    (e: 'done'): void;
  }>();
  const updateVisible = (value) => {
    emits('update:visible', value);
  };
  const formRef = ref();
  const printModal = ref();
  const close = () => {
    console.log(printModal.value.getContainer());
  };
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
