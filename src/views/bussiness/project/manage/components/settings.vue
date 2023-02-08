<template>
  <div>
    <a-form
      :model="formState"
      @finish="onFinish"
      @finishFailed="onFinishFailed"
      :label-col="{ md: { span: 4 }, sm: { span: 24 } }"
      :wrapper-col="{ md: { span: 20 }, sm: { span: 24 } }"
    >
      <a-row :gutter="8">
        <a-col :md="24" :sm="24" :xs="24">
          <a-form-item
            label="立项时间:"
            :rules="[{ required: true, message: 'Please input your username!' }]"
          >
            <a-date-picker v-model:value="formState.username" />
          </a-form-item>
          <a-form-item
            label="结题时间:"
            :rules="[{ required: true, message: 'Please input your username!' }]"
          >
            <a-date-picker v-model:value="formState.remember" />
          </a-form-item>
          <a-form-item
            label="项目状态:"
            :rules="[{ required: true, message: 'Please input your username!' }]"
          >
            <a-radio-group v-model:value="formState.password" button-style="solid">
              <a-radio-button value="a">未开始</a-radio-button>
              <a-radio-button value="b">进行中</a-radio-button>
              <a-radio-button value="c">已结束</a-radio-button>
              <a-radio-button value="d">已结题</a-radio-button>
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

<script lang="ts">
  import { defineComponent, reactive } from 'vue';
  import { UserApi } from '/@/api/system/user/UserApi';
  interface FormState {
    username: string;
    password: string;
    remember: string;
  }
  export default defineComponent({
    setup() {
      const formState = reactive<FormState>({
        username: '',
        password: '进行中',
        remember: '',
      });
      const onFinish = (values: any) => {
        console.log('Success:', values);
      };

      const onFinishFailed = (errorInfo: any) => {
        console.log('Failed:', errorInfo);
      };
      return {
        formState,
        onFinish,
        onFinishFailed,
      };
    },
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
