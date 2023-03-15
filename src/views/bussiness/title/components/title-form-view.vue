<template>
  <div>
    <a-form
      ref="formRef"
      :model="form"
      :rules="rules"
      :label-col="{ md: { span: 4 }, sm: { span: 24 } }"
      :wrapper-col="{ md: { span: 20 }, sm: { span: 24 } }"
    >
      <a-row :gutter="8">
        <a-col :md="24" :sm="24" :xs="24">
          <a-form-item label="题目名称:" name="titleTitle">
            <a-input
              v-model:value="form.titleTitle"
              placeholder="请输入题目名称"
              allow-clear
              autocomplete="off"
              disabled
            />
          </a-form-item>
          <a-form-item label="指导教师:" name="teacherName">
            <a-input disabled v-model:value="form.teacherName" placeholder="请输入指导教师" />
          </a-form-item>
          <a-form-item label="联系方式:" name="teacherPhone">
            <a-input disabled v-model:value="form.teacherPhone" placeholder="请输入联系方式" />
          </a-form-item>
          <a-form-item label="课题背景:" name="titleBackground">
            <a-textarea :rows="4" disabled v-model:value="form.titleBackground" />
          </a-form-item>
          <a-form-item label="具体内容:" name="titleContent">
            <a-textarea :rows="4" disabled v-model:value="form.titleContent" />
          </a-form-item>
          <a-form-item label="基本要求:" name="titleRequire">
            <a-textarea :rows="4" disabled v-model:value="form.titleRequire" />
          </a-form-item>
          <a-form-item label="图片:" name="positionId">
            <a-upload
              name="file"
              :multiple="true"
              :action="fileUploadUrl"
              list-type="picture"
              v-model:file-list="form.imageList"
              :headers="headers"
              @change="afterUploadImage"
            />
          </a-form-item>
          <a-form-item label="相关附件:" name="positionId">
            <a-upload
              name="file"
              :multiple="true"
              :action="fileUploadUrl"
              v-model:file-list="form.fileList"
              :headers="headers"
              @change="afterUploadFile"
            />
          </a-form-item>
        </a-col>
      </a-row>
    </a-form>
  </div>
</template>

<script setup>
  import { onMounted, reactive, ref, computed } from 'vue';
  import { UserApi } from '/@/api/system/user/UserApi';
  import { Tinymce } from '/@/components/Tinymce/index';
  import { FileUploadUrl } from '/@/api/system/operation/FileApi';
  import { useUserStore } from '/@/store/modules/user';
  import { message } from 'ant-design-vue';
  const props = defineProps({
    form: {
      type: Object,
      default: () => ({}),
    },
    userList: {
      type: Array,
      default: () => [],
    },
    targetKeys: {
      type: Array,
      default: () => [],
    },
    rules: Object,
    // 新增还是编辑
    isUpdate: Boolean,
  });
  const userStore = useUserStore();
  const isSuper = ref(false);
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
   * 图片上传成功的回调
   */
  const afterUploadImage = ({ file }) => {
    if (file.response) {
      message.success('上传成功');
    }
  };
  /**
   * 文件上传成功的回调
   */
  const afterUploadFile = ({ file }) => {
    if (file.response) {
      message.success('上传成功');
    }
  };
  const emits = defineEmits(['handleChange']);

  /**
   * 选中人员时的监听
   */
  const handleChange = (targetKeys) => {
    emits('handleChange', targetKeys);
  };
  onMounted(() => {
    const userinfo = JSON.parse(localStorage.getItem('UserInfo'));
    isSuper.value = userinfo.superAdmin;
  });
</script>

<style lang="less" scoped>
  .card-title {
    border-left: 5px solid;
    border-color: #2a7dc9;
    padding-left: 10px;
  }

  .card-title-background {
    background-color: #f5f5f5;
    height: 2em;
    line-height: 2em;
    margin-bottom: 2em;
  }

  .upload-list-inline :deep(.ant-upload-list-item) {
    float: left;
    width: 200px;
    margin-right: 8px;
  }

  .upload-list-inline :deep(.ant-upload-animate-enter) {
    animation-name: uploadAnimateInlineIn;
  }

  .upload-list-inline :deep(.ant-upload-animate-leave) {
    animation-name: uploadAnimateInlineOut;
  }
</style>
