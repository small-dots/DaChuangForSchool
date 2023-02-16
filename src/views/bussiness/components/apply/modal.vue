<template>
  <div>
    <a-modal
      :visible="visible"
      :forceRender="true"
      :maskClosable="false"
      title="元器件申请"
      width="40%"
      :okButtonProps="{ disabled: !canApply }"
      :body-style="{ paddingBottom: '8px' }"
      @update:visible="updateVisible"
      @ok="onSubmit"
    >
      <a-descriptions title="申请人信息" bordered :column="2">
        <a-descriptions-item label="申请人姓名">{{ formState.name }}</a-descriptions-item>
        <a-descriptions-item label="学(工)号">{{ formState.number }}</a-descriptions-item>
        <a-descriptions-item label="联系电话">{{ formState.phone }}</a-descriptions-item>
        <a-descriptions-item label="项目名称"
          ><span class="pro_link" @click="linkToProject(formState.projectName)">{{
            formState.projectName
          }}</span>
        </a-descriptions-item>
        <a-descriptions-item label="项目编号">{{ formState.projectId }}</a-descriptions-item>
        <a-descriptions-item label="项目负责人">
          {{ formState.createUser }}
        </a-descriptions-item>
      </a-descriptions>
      <p></p>
      <a-form ref="formRef" :model="formState" :label-col="labelCol" :wrapper-col="wrapperCol">
        <a-row>
          <a-col :span="12"
            ><a-form-item v-if="!isReview" label="申请单模板" name="desc">
              <a-button type="link" @click="downLoadTemplate">申请单模板下载</a-button>
            </a-form-item></a-col
          >
        </a-row>
        <a-row>
          <a-col :span="12"
            ><a-form-item label="申请单" name="desc">
              <a-upload
                :action="fileUploadUrl"
                :multiple="false"
                :headers="headers"
                v-model:file-list="fileList"
                :max-count="1"
                @change="afterUpload"
              >
                <a-button v-if="!isReview">
                  <upload-outlined />
                  申请单上传
                </a-button>
              </a-upload>
            </a-form-item></a-col
          >
        </a-row>
      </a-form>
      <a-divider v-if="isReview" />
      <a-descriptions v-if="isReview" title="审核信息" :column="1">
        <a-descriptions-item label="审核结果"
          ><a-radio-group v-model:value="reviewResult">
            <a-radio :value="1">同意</a-radio>
            <a-radio :value="2">拒绝</a-radio>
          </a-radio-group></a-descriptions-item
        >
        <a-descriptions-item v-if="isAdmin && isReview" label="是否需要复核"
          ><a-radio-group v-model:value="needReview">
            <a-radio :value="1">是</a-radio>
            <a-radio :value="2">否</a-radio>
          </a-radio-group></a-descriptions-item
        >
        <a-descriptions-item label="审核意见"
          ><a-textarea
            v-model:value="reviewDesc"
            placeholder="输入您的审核意见"
            :auto-size="{ minRows: 2, maxRows: 5 }"
        /></a-descriptions-item>
      </a-descriptions>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
  import { reactive, ref, UnwrapRef, createVNode, computed, onMounted } from 'vue';
  import { ProjectApi } from '/@/api/dc/project/ProjectApi.ts';
  import { useRouter } from 'vue-router';
  import { message, Modal } from 'ant-design-vue';
  import { FileUploadUrl } from '/@/api/system/operation/FileApi';
  import { useUserStore } from '/@/store/modules/user';
  import { ComponentApi } from '/@/api/dc/component/componentApi';

  interface FormState {
    name: string | undefined;
    phone: string | number | undefined;
    number: string | undefined;
    projectName: string | undefined;
    projectId: string | undefined;
    createUser: string | undefined;
  }
  interface SimpleUserInfo {
    realName: string | undefined;
    phone: string | number | undefined;
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
  const router = useRouter();
  const reviewResult = ref(1);
  interface FileInfo {
    file: FileItem;
    fileList: FileItem[];
  }
  const canApply = ref(false);
  const needReview = ref('2');
  const isSuper = ref<boolean>(false);
  const props = defineProps<{
    visible: Boolean;
    isReview: Boolean;
    isAdmin: Boolean | undefined;
  }>();
  const labelCol = {
    span: 5,
  };
  const wrapperCol = {
    span: 17,
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
  const fileHandleChange = ({ file, fileList }) => {
    if (file.status !== 'uploading') {
      console.log(file, fileList);
    }
  };
  /**
   * 上传成功的回调
   *
   * @author anzhongqi
   * @date 2021/4/2 17:03
   */
  const afterUpload = ({ file }) => {
    if (file.response) {
      message.success('上传成功');
    }
  };
  const userinfo = ref<Userinfo>({});
  onMounted(() => {
    userinfo.value = JSON.parse(localStorage.getItem('UserInfo') as string);
    const { simpleUserInfo, account } = userinfo.value;
    formState.name = simpleUserInfo?.realName;
    formState.phone = simpleUserInfo?.phone;
    formState.number = account;
    getUserProject(formState.name);
  });
  const downLoadTemplate = async () => {
    const res = await ComponentApi.getComponentPass({});
    if (!res) {
      message.error('暂无申请单模板，请联系管理员');
    } else {
      let blob = new Blob([res.fileBytes], { type: 'application/msword' }); //我是下载zip压缩包
      let url = window.URL.createObjectURL(blob); //生成下载链接
      const link = document.createElement('a'); //创建超链接a用于文件下载
      link.href = url; //赋值下载路径
      link.target = '_blank'; //打开新窗口下载，不设置则为在本窗口下载
      link.download = `${res.fileOriginName}`; //下载的文件名称（不设置就会随机生成）
      link.click(); //点击超链接触发下载
      URL.revokeObjectURL(url); //释放URL
    }
  };
  const reviewDesc = ref('');
  const formRef = ref();
  const formState: UnwrapRef<FormState> = reactive({
    name: '',
    phone: undefined,
    number: undefined,
    projectName: '',
    projectId: '',
    createUser: '',
  });
  const onSubmit = () => {
    if (!fileList.value.length) {
      message.error('请上传申请单');
      return;
    } else {
      addApply();
    }
  };
  // 发起元器件申请
  const addApply = () => {
    const parmas = {
      projectId: formState.projectId,
      projectName: formState.projectName,
      createUser: formState.createUser,
      approvalFile: fileList.value[0]?.fileId || fileList.value[0]?.response?.data?.fileId,
      applyDesc: reviewDesc.value,
      applyResult: reviewResult.value,
      needReview: needReview.value,
    };
    emits('submit', parmas);
  };
  const linkToProject = (projectName) => {
    router.push({
      path: '/system/project/detail',
      query: {
        projectName: projectName,
      },
    });
  };
  const resetForm = () => {
    formRef.value.resetFields();
  };
  const emits = defineEmits<{
    (e: 'update:visible', visible: boolean): void;
    (e: 'done'): void;
    (e: 'submit', row: any): void;
  }>();
  const updateVisible = (value) => {
    emits('update:visible', value);
  };
  const fileList = ref<FileItem[]>([]);
  const handleChange = (info: FileInfo) => {
    let resFileList = [...info.fileList];
    resFileList = resFileList.slice(-2);

    resFileList = resFileList.map((file) => {
      if (file.response) {
        file.url = file.response.url;
      }
      return file;
    });

    fileList.value = resFileList;
  };

  // 获取用户名下的项目，得是负责人
  const getUserProject = async (name) => {
    const res = await ProjectApi.getProjectPages({
      pageSize: 10,
      pageNo: 1,
    });
    if (res.rows.length && name === res?.rows[0]?.createName) {
      canApply.value = true;
      formState.projectName = res.rows[0].projectTitle;
      formState.projectId = res.rows[0].projectId;
      formState.createUser = res.rows[0].createName;
    } else {
      canApply.value = false;
      Modal.error({
        title: '错误提示',
        content: '您还没有负责的项目，暂不能申请元器件',
      });
    }
  };
</script>

<style lang="less" scoped>
  .apply_form {
    border: 1px solid #e8e8e8;
    padding-top: 20px;
    border-radius: 10px;
    margin-bottom: 20px;
  }
  .font-weight-5 {
    font-weight: 500;
  }
  .pro_link {
    text-decoration: underline;
    cursor: pointer;
    color: #1890ff;
  }
</style>
