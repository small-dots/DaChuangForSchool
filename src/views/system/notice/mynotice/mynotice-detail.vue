<template>
  <common-drawer :width="800" :visible="visible" title="通知详情" @close="updateVisible(false)">
    <a-form
      ref="form"
      :model="state.form"
      :label-col="{ md: { span: 4 }, sm: { span: 24 } }"
      :wrapper-col="{ md: { span: 20 }, sm: { span: 24 } }"
    >
      <a-form-item label="通知标题">
        <div v-html="state.form.messageTitle" style="line-height: 28px"></div>
      </a-form-item>

      <a-form-item label="内容">
        <div v-html="state.form.messageContent" style="line-height: 28px"></div>
        <!-- <tinymce v-model:value="state.form.messageContent" :options="{ readonly: true }" /> -->
      </a-form-item>
      <a-form-item label="相关附件:">
        <a-upload
          name="file"
          :multiple="true"
          :action="fileUploadUrl"
          v-model:file-list="state.form.fileList"
          :headers="headers"
          @change="afterUpload"
        >
          <!-- <a-button>
            <upload-outlined />
            上传附件
          </a-button> -->
          <!-- <span v-if="!state.form.fileList.length">暂无附件</span> -->
          <template #itemRender="{ file }">
            <span :style="file.status === 'error' ? 'color: red' : ''">{{ file.name }}</span>
            <span style="width: 10px; display: inline-block"></span>
            <a @click="downloadF(state.form.fileList)"><cloud-download-outlined /></a>
          </template>
        </a-upload>
      </a-form-item>
    </a-form>
  </common-drawer>
</template>

<script lang="ts" setup>
  import { reactive, watch, onBeforeMount, ref, computed, onMounted } from 'vue';
  import CommonDrawer from '/@/components/CommonDrawer/index.vue';
  import { NoticeApi } from '/@/api/system/notice/NoticeApi';
  import { useRouter } from 'vue-router';
  import { ProjectApi } from '/@/api/dc/project/ProjectApi.ts';
  import { message } from 'ant-design-vue';
  import { FileUploadUrl } from '/@/api/system/operation/FileApi';
  import { useUserStore } from '/@/store/modules/user';
  import { downloadByUrl } from '/@/utils/file/download';
  let router = useRouter();

  const props = defineProps<{
    // 弹窗是否打开
    visible: Boolean;
    // 上级组件传来的数据
    data?: Object;
  }>();

  const emits = defineEmits<{
    (e: 'update:visible', visible: boolean): void;
    (e: 'done'): void;
  }>();

  const state = reactive({
    form: {
      noticeTitle: '',
      noticeContent: '',
    },
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
   * @author anzhongqi
   * @date 2021/4/2 17:03
   */
  const afterUpload = ({ file }) => {
    if (file.response) {
      message.success('上传成功');
    }
  };
  /**
   * 更新编辑界面弹框是否显示
   *
   * @author anzhongqi
   * @date 2021/6/14 20:24
   */
  const updateVisible = (value) => {
    emits('update:visible', value);
    emits('done');
  };
  onMounted(() => {
    window.addEventListener('click', (e) => {
      console.log(e.target.id);
      let target = e.target as HTMLElement;
      if (target.id == 'project_invert_confirm') {
        finish(2);
      } else if (target.id == 'project_invert_refuse') {
        finish(3);
      } else if (target.id == 'projectLink') {
        router.push({
          path: '/system/project/detail',
          query: {
            projectName: target.innerText,
          },
        });
      }
    });
  });
  onBeforeMount(() => {
    // 清空click监听
    window.removeEventListener('click', (e) => {
      console.log(e.target.id);
      let target = e.target as HTMLElement;
      if (target.id == 'project_invert_confirm') {
        finish(2);
      } else if (target.id == 'project_invert_refuse') {
        finish(3);
      } else if (target.id == 'projectLink') {
        router.push({
          path: '/system/project/detail',
          query: {
            projectName: target.innerText,
          },
        });
      }
    });
  });

  const finish = async (flag) => {
    const role = JSON.parse(localStorage.getItem('UserInfo') as string).simpleRoleInfoList[0]
      .roleCode;
    console.log(document.getElementById('ID'));
    const projectId = document.getElementById('ID').innerText;
    const parmas = {
      projectId: projectId,
      memberId: JSON.parse(localStorage.getItem('UserInfo') as string).userId,
      status: flag,
    };
    const res = await ProjectApi.joinProjectMember(parmas);
    if (res.code === '00000') {
      message.success('已加入项目');
      updateVisible(false);
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
  watch(
    () => props.data,
    async (val) => {
      if (val) {
        let messageId = props.data.messageId;
        let result = await NoticeApi.messageDetail({ messageId });
        if (result.businessType === 'sys_notice') {
          NoticeApi.NoticeDetail({
            noticeId: result.businessId,
          }).then((res) => {
            state.form.fileList = res.appendixFile || [];
            state.form.fileList.map((item) => {
              item.name = item.fileOriginName;
              item.thumbUrl =
                window.location.origin +
                `/api/sysFileInfo/previewByObjectName?fileBucket=defaultBucket&fileObjectName=${item.fileObjectName}`;
            });
          });
        }
        state.form = Object.assign({}, result);
      } else {
        state.form = {};
      }
    },
  );
</script>
<style lang="less" scoped>
  .btn_custom {
    color: #fff;
    background: #1890ff;
    border-color: #1890ff;
    text-shadow: 0 -1px 0 rgb(0 0 0 / 12%);
    box-shadow: 0 2px #0000000b;
    border-radius: 4px;
    padding: 2px 10px;
    margin-right: 10px;
  }

  .refuse {
    background: #ff4d4f;
    border-color: #ff4d4f;
  }
</style>
