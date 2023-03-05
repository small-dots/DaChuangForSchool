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
            <tinymce v-if="!isView" v-model:value="form.projectBackground" />
            <div v-else v-html="form.projectBackground"></div>
          </a-form-item>
          <a-form-item label="具体内容:" name="projectContent">
            <tinymce v-if="!isView" v-model:value="form.projectContent" />
            <div v-else v-html="form.projectContent"></div>
          </a-form-item>
          <a-form-item label="图片:">
            <a-upload
              name="file"
              :multiple="true"
              :action="fileUploadUrl"
              list-type="picture"
              accept="image/*"
              v-model:file-list="form.imageList"
              :headers="headers"
              @change="afterUpload"
              :show-upload-list="{
                showRemoveIcon: !isView,
              }"
            >
              <a-button v-if="!isView" type="primary">
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
              :show-upload-list="{
                showRemoveIcon: !isView,
              }"
            >
              <a-button v-if="!isView">
                <upload-outlined />
                上传附件
              </a-button>
              <template #itemRender="{ file }">
                <span :style="file.status === 'error' ? 'color: red' : ''">{{ file.name }}</span>
                <span style="width: 10px; display: inline-block"></span>
                <a @click="downloadF(form.fileList)"><cloud-download-outlined /></a>
              </template>
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
  import { downloadByUrl } from '/@/utils/file/download';

  const props = defineProps({
    form: {
      type: Object,
      default: () => ({}),
    },
    rules: Object,
    // 新增还是编辑
    isUpdate: Boolean,
    isView: Boolean,
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
  const downloadF = (row) => {
    console.log(row);
    // FileApi.download({
    //   fileId: row.fileId,
    //   secretFlag: row.secretFlag,
    //   token: token.value,
    // });
    downloadByUrl({ url: row[0].thumbUrl, fileName: row[0].fileOriginName });
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
