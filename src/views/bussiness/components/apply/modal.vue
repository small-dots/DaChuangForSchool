<template>
  <div>
    <a-modal
      :visible="visible"
      :forceRender="true"
      :maskClosable="false"
      title="元器件申请"
      width="40%"
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
              <a-button type="link">申请单模板下载</a-button>
            </a-form-item></a-col
          >
        </a-row>
        <a-row>
          <a-col :span="12"
            ><a-form-item label="申请单" name="desc">
              <a-upload
                action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
                :multiple="true"
                :file-list="fileList"
                @change="handleChange"
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
          ><a-radio-group v-model:value="reviewResult">
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
  import { reactive, ref, UnwrapRef, onMounted } from 'vue';
  import { ProjectApi } from '/@/api/dc/project/ProjectApi.ts';
  import { useRouter } from 'vue-router';
  import { message } from 'ant-design-vue';
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
  const isSuper = ref<boolean>(false);
  const props = defineProps<{
    visible: Boolean;
    isReview: Boolean;
    isAdmin: Boolean;
  }>();
  const labelCol = {
    span: 5,
  };
  const wrapperCol = {
    span: 17,
  };
  const userinfo = ref<Userinfo>({});
  onMounted(() => {
    getUserProject();
    userinfo.value = JSON.parse(localStorage.getItem('UserInfo') as string);
    const { simpleUserInfo, account } = userinfo.value;
    formState.name = simpleUserInfo?.realName;
    formState.phone = simpleUserInfo?.phone;
    formState.number = account;
  });
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
      applyFile: fileList.value[0].url,
      applyDesc: reviewDesc.value,
      applyResult: reviewResult.value,
    };
    const res = ProjectApi.addComponent({ ...parmas });
    console.log(res);
    if (res.code === '00000') {
      message.success('提交成功,待老师审核');
      updateVisible(false);
      emits('done');
    }
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
  }>();
  const updateVisible = (value) => {
    emits('update:visible', value);
  };
  const fileList = ref<FileItem[]>([
    {
      uid: '-1',
      name: '元器件申请单-2021-01-01.docx',
      status: 'done',
      url: 'http://www.baidu.com/xxx.png',
    },
  ]);
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
  const getUserProject = async () => {
    const res = await ProjectApi.getProjectPages({
      pageSize: 10,
      pageNo: 1,
    });
    if (res.rows.length) {
      formState.projectName = res.rows[0].projectTitle;
      formState.projectId = res.rows[0].projectId;
      formState.createUser = res.rows[0].createName;
    }
    console.log('res', res);
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
