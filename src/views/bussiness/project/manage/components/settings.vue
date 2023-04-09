<template>
  <div>
    <a-form
      :model="formState"
      @finish="onFinish"
      :label-col="{ md: { span: 4 }, sm: { span: 24 } }"
      :wrapper-col="{ md: { span: 20 }, sm: { span: 24 } }"
    >
      <a-row :gutter="8">
        <a-col :md="24" :sm="24" :xs="24">
          <a-form-item label="立项时间:" required>
            <a-date-picker v-model:value="formState.publishTime" />
          </a-form-item>
          <a-form-item label="结题时间:" required>
            <a-date-picker v-model:value="formState.endTime" />
          </a-form-item>
          <a-form-item label="项目状态:" required>
            <a-radio-group v-model:value="formState.statusFlag" button-style="solid">
              <a-radio-button value="1">运行中</a-radio-button>
              <a-radio-button value="2">已终止</a-radio-button>
              <a-radio-button value="3">已结题</a-radio-button>
            </a-radio-group>
          </a-form-item>
          <a-divider />

          <a-form-item :wrapper-col="{ offset: 4, span: 20 }">
            <a-button type="primary" html-type="submit">确定</a-button>
          </a-form-item>
        </a-col>
      </a-row>
    </a-form>
  </div>
</template>

<script lang="ts" setup>
  import { onMounted, reactive, watch } from 'vue';
  import { ProjectApi } from '/@/api/dc/project/ProjectApi.ts';
  import { message } from 'ant-design-vue';
  import dayjs, { Dayjs } from 'dayjs';
  const props = defineProps({
    data: {
      type: Object,
      default: () => ({}),
    },
    isView: {
      type: Boolean,
      default: false,
    },
  });
  const emits = defineEmits<{
    (e: 'close'): void;
  }>();
  interface FormState {
    statusFlag: string | undefined;
    publishTime: Dayjs | undefined;
    endTime: Dayjs | undefined;
  }
  const formState = reactive<FormState>({
    publishTime: '',
    statusFlag: '1',
    endTime: '',
  });
  onMounted(() => {
    formState.publishTime = dayjs(props.data.publishTime);
    formState.statusFlag = props.data.statusFlag;
    formState.endTime = dayjs(props.data.endTime);
    console.log(formState.publishTime);
  });
  const onFinish = async () => {
    const params = {
      ...props.data,
      projectId: props.data.projectId,
      statusFlag: formState.statusFlag,
      publishTime: formState.publishTime,
      endTime: formState.endTime,
    };
    emits('close');
    const { code } = await ProjectApi.editProject(params);
    if (code === '00000') {
      message.success('设置成功');
      emits('close');
    } else {
      message.error('设置失败');
    }
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
