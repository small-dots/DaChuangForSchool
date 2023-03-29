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
            <p v-html="form.titleTitle" style="line-height: 28px"></p>
          </a-form-item>
          <a-form-item label="指导教师:" name="teacherName">
            <p v-html="form.teacherName" style="line-height: 28px"></p>
          </a-form-item>
          <a-form-item label="联系方式:" name="teacherPhone">
            <p v-html="form.teacherPhone" style="line-height: 28px"></p>
          </a-form-item>
          <a-form-item label="课题背景:" name="titleBackground">
            <div v-html="form.titleBackground" style="line-height: 28px"></div>
          </a-form-item>
          <a-form-item label="具体内容:" name="titleContent">
            <div v-html="form.titleContent" style="line-height: 28px"></div>
          </a-form-item>
          <a-form-item label="基本要求:" name="titleRequire">
            <div v-html="form.titleRequire" style="line-height: 28px"></div>
          </a-form-item>
          <a-form-item label="图片:" name="positionId">
            <!-- <a-upload
              name="file"
              :multiple="true"
              :action="fileUploadUrl"
              list-type="picture"
              v-model:file-list="form.imageList"
              :headers="headers"
              @change="afterUploadImage"
            /> -->

            <a-upload
              name="file"
              :multiple="true"
              class="upload-list-inline"
              list-type="picture"
              :show-upload-list="{
                showDownloadIcon: true,
                showPreviewIcon: true,
                showRemoveIcon: false,
              }"
              v-model:file-list="form.imageList"
            >
              <template #downloadIcon>
                <CloudDownloadOutlined @click="download(e)" />
              </template>
            </a-upload>
          </a-form-item>
          <a-form-item label="相关附件:" name="positionId">
            <a-upload class="upload-list-inline" name="file" v-model:file-list="form.fileList">
              <template #itemRender="{ file }">
                <span :style="file.status === 'error' ? 'color: red' : ''">{{ file.name }}</span>
                <span style="width: 10px; display: inline-block"></span>
                <a @click="download(file)"><cloud-download-outlined /></a>
              </template>
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
  import { message } from 'ant-design-vue';
  import { downloadByUrl } from '/@/utils/file/download';

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
  const download = (row) => {
    console.log(row);
    // FileApi.download({
    //   fileId: row.fileId,
    //   secretFlag: row.secretFlag,
    //   token: token.value,
    // });
    downloadByUrl({ url: row.thumbUrl, fileName: row.fileOriginName });
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
    width: 300px;
    margin-right: 8px;
  }

  .upload-list-inline :deep(.ant-upload-animate-enter) {
    animation-name: uploadAnimateInlineIn;
  }

  .upload-list-inline :deep(.ant-upload-animate-leave) {
    animation-name: uploadAnimateInlineOut;
  }
</style>
