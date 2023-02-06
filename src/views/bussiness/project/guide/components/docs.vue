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
      v-model:file-list="fileList"
      name="file"
      :multiple="false"
      action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
      :headers="headers"
      @change="handleChange"
    >
      <a-button>
        <upload-outlined />
        过程文档上传
      </a-button>
    </a-upload>
    <a-divider />
    <div class="doc_list">
      <a-table :columns="columns" :data-source="data">
        <template #name="{ text }">
          <a>{{ text }}</a>
        </template>
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
  import { ref } from 'vue';
  import { message } from 'ant-design-vue';
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
      dataIndex: 'name',
      key: 'name',
      slots: { customRender: 'name' },
    },
    {
      title: '上传时间',
      dataIndex: 'time',
      key: 'time',
    },
    {
      title: '操作',
      key: 'operation',
      slots: { customRender: 'operation' },
    },
  ];
  const fileList = ref([]);
  const headers = ref({
    authorization: 'authorization-text',
  });
  const data = [
    {
      key: '1',
      name: 'John Brown',
      time: '2023-12-12 12:12:12',
      address: 'New York No. 1 Lake Park',
    },
    {
      key: '2',
      name: 'Jim Green',
      time: '2023-52-11 09:09:59',
      address: 'London No. 1 Lake Park',
    },
  ];

  const onDelete = (key: string) => {
    data.splice(
      data.findIndex((item) => item.key === key),
      1,
    );
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
