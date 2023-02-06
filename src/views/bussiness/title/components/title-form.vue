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
          <a-form-item label="题目名称:" name="projectTitle">
            <a-input
              v-model:value="form.projectTitle"
              placeholder="请输入题目名称"
              allow-clear
              autocomplete="off"
            />
          </a-form-item>
          <a-form-item label="指导教师:" name="teacherName">
            <a-input v-model:value="form.teacherName" placeholder="请输入指导教师" />
          </a-form-item>
          <a-form-item label="指导教师联系方式:" name="teacherPhone">
            <a-input v-model:value="form.teacherPhone" placeholder="请输入指导教师联系方式" />
          </a-form-item>
          <a-form-item label="课题背景:" name="projectBackground">
            <tinymce v-model:value="form.projectBackground" />
          </a-form-item>
          <a-form-item label="具体内容:" name="projectContent">
            <tinymce v-model:value="form.projectContent" />
          </a-form-item>
          <a-form-item label="基本要求:" name="projectRequire">
            <tinymce v-model:value="form.projectRequire" />
          </a-form-item>
          <a-form-item label="图片:" name="positionId">
            <a-upload
              name="file"
              :multiple="true"
              :action="fileUploadUrl"
              list-type="picture"
              v-model:file-list="form.imageList"
              :headers="headers"
              @change="afterUpload"
            >
              <a-button type="primary">
                <template #icon>
                  <CloudUploadOutlined />
                </template>
                <span>上传图片</span>
              </a-button>
            </a-upload>
          </a-form-item>
          <a-form-item label="相关附件:" name="positionId">
            <a-upload
              name="file"
              :multiple="true"
              :action="fileUploadUrl"
              v-model:file-list="form.fileList"
              :headers="headers"
              @change="afterUpload"
            >
              <a-button>
                <upload-outlined />
                上传附件
              </a-button>
            </a-upload>
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

  const props = defineProps({
    form: {
      type: Object,
      default: () => ({}),
    },
    rules: Object,
    // 新增还是编辑
    isUpdate: Boolean,
  });
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
   * 上传成功的回调
   *
   * @author fengshuonan
   * @date 2021/4/2 17:03
   */
  const afterUpload = ({ file }) => {
    console.log(file);
    if (file.response) {
      message.success('上传成功');
    }
  };
  const fileHandleChange = ({ file, fileList }) => {
    if (file.status !== 'uploading') {
      console.log(file, fileList);
    }
  };
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
