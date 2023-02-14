<template>
  <div>
    <div class="doc_list">
      <a-table :columns="columns" :data-source="docList">
        <template #operation="{ record }">
          <a-popconfirm title="Sure to delete?" @confirm="onDelete(record.key)">
            <a-button type="text" danger>删除</a-button>
          </a-popconfirm>
          <a-divider type="vertical" />
          <a>下载</a>
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
    // {
    //   title: '上传者',
    //   dataIndex: 'createUser;',
    //   key: 'createUser;',
    // },
    // {
    //   title: '上传时间',
    //   dataIndex: 'createTime',
    //   key: 'createTime',
    // },
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
  // const onDelete = (key: string) => {
  //   docList.value.splice(
  //     docList.value.findIndex((item) => item.key === key),
  //     1,
  //   );
  // };

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
