<template>
  <a-form
    ref="formRef"
    :model="form"
    :label-col="{ md: { span: 4 }, sm: { span: 24 } }"
    :wrapper-col="{ md: { span: 20 }, sm: { span: 24 } }"
  >
    <a-form-item label="通知标题">
      <a-input placeholder="请输入通知标题" v-model:value="form.noticeTitle" />
    </a-form-item>

    <a-form-item label="内容">
      <tinymce v-model:value="form.noticeContent" />
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
        <template #itemRender="{ file, actions }">
          <span :style="file.status === 'error' ? 'color: red' : ''">{{ file.name }}</span>
          <span style="width: 10px; display: inline-block"></span>
          <a href="javascript:;" @click="actions.remove"><delete-outlined /></a>
          <span style="width: 10px; display: inline-block"></span>
          <a @click="downloadF(form.fileList)"><cloud-download-outlined /></a>
        </template>
      </a-upload>
    </a-form-item>
    <a-form-item label="通知范围">
      <a-radio-group
        default-value="all"
        v-model:value="form.noticeScopeType"
        :disabled="isUpdate"
        button-style="solid"
      >
        <a-radio-button value="all">全部</a-radio-button>
        <a-radio-button value="part">部分</a-radio-button>
      </a-radio-group>
    </a-form-item>

    <a-form-item v-if="form.noticeScopeType === 'part'" label="通知到的人">
      <a-transfer
        :disabled="isUpdate"
        :data-source="userList"
        show-search
        :list-style="{
          width: '40%',
          height: '300px',
        }"
        :targetKeys="targetKeys"
        :render="(item) => item.title"
        @change="handleChange"
      />
    </a-form-item>
  </a-form>
</template>

<script lang="ts" setup>
  import { computed, ref, reactive } from 'vue';
  import { Tinymce } from '/@/components/Tinymce/index';
  import { FileUploadUrl } from '/@/api/system/operation/FileApi';
  import { useUserStore } from '/@/store/modules/user';
  import { downloadByUrl } from '/@/utils/file/download';
  import { message } from 'ant-design-vue';

  const props = defineProps<{
    form: Object;
    isUpdate: Boolean;
    targetKeys: Array;
    userList: Array;
  }>();
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
   * @author anzhongqi
   * @date 2021/4/2 17:03
   */
  const afterUpload = ({ file }) => {
    if (file.response) {
      message.success('上传成功');
    }
  };
  const emits = defineEmits<{
    (e: 'handleChange', targetKeys): void;
  }>();
  const downloadF = (row) => {
    console.log(row);
    // FileApi.download({
    //   fileId: row.fileId,
    //   secretFlag: row.secretFlag,
    //   token: token.value,
    // });
    downloadByUrl({ url: row[0].thumbUrl, fileName: row[0].fileOriginName });
  };
  /**
   * 选中人员时的监听
   */
  const handleChange = (targetKeys) => {
    emits('handleChange', targetKeys);
  };
</script>
