<template>
  <div>
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
