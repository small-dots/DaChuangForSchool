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
      <a-form
        ref="formRef"
        :model="formState"
        :rules="rules"
        :label-col="labelCol"
        :wrapper-col="wrapperCol"
      >
        <a-form-item ref="name" label="申请人姓名" name="name">
          <a-input v-model:value="formState.name" disabled="true" />
        </a-form-item>
        <a-form-item label="学(工)号" name="number">
          <a-input v-model:value="formState.number" disabled="true" />
        </a-form-item>
        <a-form-item label="联系电话" required name="phone">
          <a-input v-model:value="formState.phone" disabled="true" />
        </a-form-item>
        <a-form-item label="项目名称" name="delivery">
          <a-input v-model:value="formState.name" disabled="true" />
        </a-form-item>
        <a-form-item label="项目编号" name="type">
          <a-input v-model:value="formState.name" disabled="true" />
        </a-form-item>
        <a-form-item label="项目负责人" name="resource">
          <a-input v-model:value="formState.name" disabled="true" />
        </a-form-item>
        <a-form-item v-if="!isReview" label="申请单模板" name="desc">
          <a-button type="link">申请单模板下载</a-button>
        </a-form-item>
        <a-form-item label="附件" name="desc">
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
        </a-form-item>
      </a-form>
      <a-divider v-if="isReview" />
      <a-descriptions v-if="isReview" title="审核信息" :column="1">
        <a-descriptions-item label="审核结果"
          ><a-radio-group v-model:value="reviewResult">
            <a-radio :value="1">同意</a-radio>
            <a-radio :value="2">拒绝</a-radio>
          </a-radio-group></a-descriptions-item
        >
        <a-descriptions-item v-if="isSuper && isReview" label="是否需要复核"
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
  import { ValidateErrorEntity } from 'ant-design-vue/es/form/interface';
  import { reactive, ref, toRaw, UnwrapRef, onMounted } from 'vue';
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

  const reviewResult = ref(1);
  interface FileInfo {
    file: FileItem;
    fileList: FileItem[];
  }
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
  const userinfo = ref<Userinfo>({});
  onMounted(() => {
    userinfo.value = JSON.parse(localStorage.getItem('UserInfo') as string);
    const { simpleUserInfo, account } = userinfo.value;
    isSuper.value = userinfo.value.superAdmin as boolean;
    formState.name = simpleUserInfo?.realName;
    formState.phone = simpleUserInfo?.tel;
    formState.number = account;
  });
  const reviewDesc = ref('');
  const formRef = ref();
  const formState: UnwrapRef<FormState> = reactive({
    name: '',
    phone: undefined,
    number: undefined,
    delivery: false,
    type: [],
    resource: '',
    desc: '',
  });
  const rules = {
    name: [
      { required: true, message: 'Please input Activity name', trigger: 'blur' },
      { min: 3, max: 5, message: 'Length should be 3 to 5', trigger: 'blur' },
    ],
    region: [{ required: true, message: 'Please select Activity zone', trigger: 'change' }],
    date1: [{ required: true, message: 'Please pick a date', trigger: 'change', type: 'object' }],
    type: [
      {
        type: 'array',
        required: true,
        message: 'Please select at least one activity type',
        trigger: 'change',
      },
    ],
    resource: [{ required: true, message: 'Please select activity resource', trigger: 'change' }],
    desc: [{ required: true, message: 'Please input activity form', trigger: 'blur' }],
  };
  const onSubmit = () => {
    formRef.value
      .validate()
      .then(() => {
        console.log('values', formState, toRaw(formState));
      })
      .catch((error: ValidateErrorEntity<FormState>) => {
        console.log('error', error);
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

    // 1. Limit the number of uploaded files
    //    Only to show two recent uploaded files, and old ones will be replaced by the new
    resFileList = resFileList.slice(-2);

    // 2. read from response and show file link
    resFileList = resFileList.map((file) => {
      if (file.response) {
        // Component will show file.url as link
        file.url = file.response.url;
      }
      return file;
    });

    fileList.value = resFileList;
  };
</script>

<style lang="scss" scoped></style>
