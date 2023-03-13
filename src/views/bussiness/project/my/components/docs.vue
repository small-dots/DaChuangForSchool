<template>
  <div>
    <a-alert
      message="文件命名规范"
      description="请将过程文档名称命名为:XXX_项目名称。例:大学生创新训 练项目申请书_能级强关联上转换纳米探针构筑及谷胱甘肽的高灵敏 检测应用研究"
      type="info"
      show-icon
    />
    <a-divider />
    <a-upload
      name="file"
      :action="fileUploadUrl"
      v-model:file-list="fileList"
      :headers="headers"
      @change="afterUpload"
      :show-upload-list="{
        showRemoveIcon: !isView,
      }"
    >
      <a-button v-if="!isView">
        <upload-outlined />
        文档上传
      </a-button>
    </a-upload>
    <a-divider />
    <div class="doc_list">
      <a-table :columns="columns" :data-source="docList">
        <template #operation="{ record }">
          <a-popconfirm title="确定删除吗?" @confirm="onDelete(record.key)">
            <a-button v-if="!isView" type="text" danger>删除</a-button>
          </a-popconfirm>
          <a-divider type="vertical" />
          <a @click="download(record)">下载</a>
        </template>
      </a-table>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, reactive, onMounted } from 'vue';
  import { message } from 'ant-design-vue';
  import { ProjectApi } from '/@/api/dc/project/ProjectApi.ts';
  import PublishApi from '/@/api/system/notice/PublishApi';
  import { FileUploadUrl } from '/@/api/system/operation/FileApi';
  import { useUserStore } from '/@/store/modules/user';
  import { downloadByUrl } from '/@/utils/file/download';
  const props = defineProps({
    data: {
      type: Object,
      default: () => ({}),
    },
    rules: Object,
    // 新增还是编辑
    isUpdate: Boolean,
    isView: Boolean,
  });
  interface FileItem {
    uid: string;
    name?: string;
    status?: string;
    response?: string;
    url?: string;
  }
  interface FileInfo {
    file: FileItem;
    fileList: FileItem[];
  }
  const columns = [
    {
      title: '文件名称',
      dataIndex: 'fileOriginName',
      key: 'fileOriginName',
    },
    {
      title: '文件大小',
      dataIndex: 'fileSizeInfo',
      key: 'fileSizeInfo',
    },
    {
      title: '操作',
      key: 'operation',
      slots: { customRender: 'operation' },
    },
  ];
  const docList = ref([]);
  const fileList = ref([]);
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
      saveDoc(file.response.data.fileId);
    }
  };

  const saveDoc = (fileId) => {
    const params = {
      projectId: props.data.projectId,
      fileId: fileId,
    };
    ProjectApi.addProjectDucument(params).then((res) => {
      if (res.code === '00000') {
        getDocList();
      }
    });
  };
  onMounted(() => {
    getDocList();
  });
  const getDocList = () => {
    const params = {
      businessId: props.data.projectId,
    };
    ProjectApi.listProjectDucument(params).then((res) => {
      if (res.code === '00000') {
        docList.value = res.data;
      }
    });
  };
  const onDelete = (data) => {
    ProjectApi.deleteProjectDucument(data).then((res) => {
      if (res.code === '00000') {
        message.success(` 已删除`);
        getDocList();
      }
    });
  };
  const download = (data) => {
    const url =
      window.location.origin +
      `/api/sysFileInfo/previewByObjectName?fileBucket=defaultBucket&fileObjectName=${data.fileObjectName}`;
    downloadByUrl({ url: url, fileName: data.fileOriginName });
  };
  const handleChange = (info: FileInfo) => {
    if (info.file.status !== 'uploading') {
      console.log(info.file, info.fileList);
    }
    if (info.file.status === 'done') {
      message.success(`${info.file.name} file uploaded successfully`);
    } else if (info.file.status === 'error') {
      message.error(`${info.file.name} file upload failed.`);
    }
  };
</script>

<style lang="scss" scoped></style>
