<template>
  <common-drawer :width="800" :visible="visible" title="通知详情" @close="updateVisible(false)">
    <a-form
      ref="form"
      :model="state.form"
      :label-col="{ md: { span: 4 }, sm: { span: 24 } }"
      :wrapper-col="{ md: { span: 20 }, sm: { span: 24 } }"
    >
      <a-form-item label="通知标题">
        <a-input placeholder="请输入通知标题" disabled v-model:value="state.form.messageTitle" />
      </a-form-item>

      <a-form-item label="内容">
        <div v-html="state.form.messageContent"></div>
        <!-- <tinymce v-model:value="state.form.messageContent" :options="{ readonly: true }" /> -->
      </a-form-item>
    </a-form>
  </common-drawer>
</template>

<script lang="ts" setup>
  import { reactive, watch, onMounted } from 'vue';
  import CommonDrawer from '/@/components/CommonDrawer/index.vue';
  import { NoticeApi } from '/@/api/system/notice/NoticeApi';
  import { useRouter } from 'vue-router';
  import { ProjectApi } from '/@/api/dc/project/ProjectApi.ts';
  import { message } from 'ant-design-vue';

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
  watch(
    () => props.data,
    async (val) => {
      if (val) {
        let messageId = props.data.messageId;
        let result = await NoticeApi.messageDetail({ messageId });
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
