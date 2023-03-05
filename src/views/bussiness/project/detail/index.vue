<template>
  <div class="project-detail">
    <a-form
      ref="ProjectFormRef"
      :model="form"
      :label-col="{ md: { span: 2 }, sm: { span: 24 } }"
      :wrapper-col="{ md: { span: 22 }, sm: { span: 24 } }"
    >
      <a-row :gutter="8">
        <a-col :md="24" :sm="24" :xs="24">
          <a-form-item label="项目名称:" name="projectTitle">
            <span class="font-600">{{ form.projectTitle }}</span>
          </a-form-item>
          <a-form-item label="项目负责人:" name="projectTitle">
            <span class="font-600">{{ form.createName }}</span>
          </a-form-item>
          <a-form-item label="创建时间:" name="projectTitle">
            <span class="font-600">{{ form.createTime }}</span>
          </a-form-item>
          <a-form-item label="课题背景:" name="projectBackground">
            <div v-html="form.projectBackground"></div>
          </a-form-item>
          <a-form-item label="具体内容:" name="projectContent">
            <div v-html="form.projectContent"></div>
          </a-form-item>
          <a-form-item label="图片:">
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
          <a-form-item label="相关附件:">
            <a-upload class="upload-list-inline" name="file" v-model:file-list="form.fileList">
              <template #itemRender="{ file, actions }">
                <span :style="file.status === 'error' ? 'color: red' : ''">{{ file.name }}</span>
                <a href="javascript:;" @click="actions.download">下载</a>
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
  import { ProjectApi } from '/@/api/dc/project/ProjectApi.ts';
  import { FileApi } from '/@/api/system/operation/FileApi';
  import { useRouter } from 'vue-router';
  import { downloadByUrl } from '/@/utils/file/download';

  const form = reactive({
    projectTitle: '',
    projectBackground: '',
    projectContent: '',
    imageList: [],
    fileList: [],
    createName: '',
    createTime: '',
  });
  const userStore = useUserStore();
  // token
  const token = computed(() => {
    return userStore.getToken;
  });
  let router = useRouter();
  onMounted(() => {
    getProjectList();
  });
  const getProjectList = async () => {
    // 获取路有参数projectName
    const projectName = router.currentRoute.value.query.projectName;
    const res = await ProjectApi.getProjectPages({
      pageSize: 10,
      projectTitle: projectName,
      pageNo: 1,
    });
    const data = res.rows;
    console.log(data);
    Array.isArray(data) &&
      data.map((v) => {
        if (v.projectTitle === projectName) {
          form.projectTitle = v.projectTitle;
          form.projectBackground = v.projectBackground;
          form.projectContent = v.projectContent;
          form.imageList = v.imageFile || [];
          form.fileList = v.appendixFile || [];
          form.createName = v.createName;
          form.createTime = v.createTime;
        }
      });
    form.imageList.map((item) => {
      item.name = item.fileOriginName;
      item.thumbUrl =
        window.location.origin +
        `/api/sysFileInfo/previewByObjectName?fileBucket=defaultBucket&fileObjectName=${item.fileObjectName}`;
    });
    form.fileList.map((item) => {
      item.name = item.fileOriginName;
      item.thumbUrl =
        window.location.origin +
        `/api/sysFileInfo/previewByObjectName?fileBucket=defaultBucket&fileObjectName=${item.fileObjectName}`;
    });
  };

  /**
   * 下载文件
   *
   * @author anzhongqi
   * @date 2021/4/12 22:11
   */
  const download = (row) => {
    console.log(row);
    // FileApi.download({
    //   fileId: row.fileId,
    //   secretFlag: row.secretFlag,
    //   token: token.value,
    // });
    downloadByUrl({ url: row.thumbUrl, fileName: row.fileOriginName });
  };
</script>

<style lang="less" scoped>
  .project-detail {
    padding: 20px;
    background: #ffffff;
    margin: 20px;
    border-radius: 4px;

    .font-600 {
      font-weight: 600;
    }
  }

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
