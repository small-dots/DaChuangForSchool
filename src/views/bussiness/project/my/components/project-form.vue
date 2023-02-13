<template>
  <div>
    <a-form
      ref="ProjectFormRef"
      :model="form"
      :rules="rules"
      :label-col="{ md: { span: 4 }, sm: { span: 24 } }"
      :wrapper-col="{ md: { span: 20 }, sm: { span: 24 } }"
    >
      <a-row :gutter="8">
        <a-col :md="24" :sm="24" :xs="24">
          <a-form-item label="项目名称:" name="projectTitle">
            <a-input
              v-model:value="form.projectTitle"
              placeholder="请输入项目名称"
              allow-clear
              autocomplete="off"
            />
          </a-form-item>
          <a-form-item label="课题背景:" name="projectBackground">
            <tinymce v-model:value="form.projectBackground" />
          </a-form-item>
          <a-form-item label="具体内容:" name="projectContent">
            <tinymce v-model:value="form.projectContent" />
          </a-form-item>
          <a-form-item label="图片:">
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
          <a-form-item label="相关附件:">
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
  import { onMounted, computed, reactive, ref } from 'vue';
  import { Tinymce } from '/@/components/Tinymce/index';
  import { FileUploadUrl } from '/@/api/system/operation/FileApi';
  import { useUserStore } from '/@/store/modules/user';
  import { message } from 'ant-design-vue';
  const props = defineProps({
    form: {
      type: Object,
      default: () => ({}),
    },
    rules: Object,
    // 新增还是编辑
    isUpdate: Boolean,
  });
  // 职位列表
  const positionList = ref([]);
  const data = ref([]);
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
