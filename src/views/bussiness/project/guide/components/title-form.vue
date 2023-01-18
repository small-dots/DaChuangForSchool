<template>
  <div>
    <a-form
      ref="formRef"
      :model="form"
      :rules="rules"
      :label-col="{ md: { span: 4 }, sm: { span: 24 } }"
      :wrapper-col="{ md: { span: 20 }, sm: { span: 24 } }"
    >
      <a-row :gutter="8">
        <a-col :md="24" :sm="24" :xs="24">
          <a-form-item label="题目名称:" name="account">
            <a-input
              v-model:value="form.account"
              placeholder="请输入题目名称"
              allow-clear
              autocomplete="off"
            />
          </a-form-item>
          <a-form-item label="指导教师:" name="password">
            <a-input-password
              v-model:value="form.password"
              placeholder="请输入登录密码"
              autocomplete="new-password"
            />
          </a-form-item>
          <a-form-item label="课题背景:" name="password">
            <tinymce v-model:value="form.ktbj" />
          </a-form-item>
          <a-form-item label="具体内容:" name="orgId">
            <tinymce v-model:value="form.jtnr" />
          </a-form-item>
          <a-form-item label="基本要求:" name="positionId">
            <tinymce v-model:value="form.jbtq" />
          </a-form-item>
          <a-form-item label="图片:" name="positionId">
            <a-upload
              action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
              list-type="picture"
              v-model:file-list="imageList"
              class="upload-list-inline"
            >
              <a-button>
                <upload-outlined />
                上传图片
              </a-button>
            </a-upload>
          </a-form-item>
          <a-form-item label="相关附件:" name="positionId">
            <a-upload
              action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
              v-model:file-list="fileList"
            >
              <a-button>
                <upload-outlined />
                上传附件
              </a-button>
            </a-upload>
          </a-form-item>
        </a-col>
      </a-row>
    </a-form>
  </div>
</template>

<script>
  import { defineComponent, onMounted, reactive, toRefs } from 'vue';
  import { UserApi } from '/@/api/system/user/UserApi';
  import { Tinymce } from '/@/components/Tinymce/index';
  export default defineComponent({
    components: {
      Tinymce,
    },
    props: {
      form: {
        type: Object,
        default: () => ({}),
      },
      rules: Object,
      // 新增还是编辑
      isUpdate: Boolean,
    },
    setup() {
      const state = reactive({
        // 职位列表
        positionList: [],
        imageList: [
          {
            uid: '-1',
            name: 'xxx.png',
            status: 'done',
            url: 'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png',
            thumbUrl:
              'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png',
          },
          {
            uid: '-2',
            name: 'yyy.png',
            status: 'done',
            url: 'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png',
            thumbUrl:
              'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png',
          },
        ],
        fileList: [
          {
            uid: '1',
            name: 'xxx.doc',
            status: 'done',
            response: 'Server Error 500', // custom error message to show
            url: 'http://www.baidu.com/xxx.png',
          },
          {
            uid: '2',
            name: 'yyy.txt',
            status: 'done',
            url: 'http://www.baidu.com/yyy.png',
          },
          {
            uid: '3',
            name: 'zzz.png',
            status: 'error',
            response: '上传失败', // custom error message to show
            url: 'http://www.baidu.com/zzz.png',
          },
        ],
      });

      const fileHandleChange = ({ file, fileList }) => {
        if (file.status !== 'uploading') {
          console.log(file, fileList);
        }
      };

      onMounted(() => {
        getPositionList();
      });

      const getPositionList = async () => {
        state.positionList = await UserApi.getPositionDropList();
      };

      return {
        ...toRefs(state),
        getPositionList,
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
