<template>
  <div>
    <a-form
      ref="ProjectFormRef"
      :model="form"
      :rules="rules"
      :label-col="{ md: { span: 4 }, sm: { span: 24 } }"
      :wrapper-col="{ md: { span: 20 }, sm: { span: 24 } }"
    >
      <a-row :gutter="8">
        <a-col :md="24" :sm="24" :xs="24">
          <a-form-item label="项目名称:" name="account">
            <a-input
              v-model:value="form.account"
              placeholder="请输入项目名称"
              allow-clear
              autocomplete="off"
            />
          </a-form-item>
          <a-form-item label="课题背景:" name="password">
            <tinymce v-model:value="form.ktbj" />
          </a-form-item>
          <a-form-item label="具体内容:" name="orgId">
            <tinymce v-model:value="form.jtnr" />
          </a-form-item>
          <a-form-item label="成员邀请:" name="orgId">
            <a-select
              v-model:value="form.partters"
              show-search
              placeholder="输入学生姓名"
              mode="multiple"
              :default-active-first-option="false"
              :show-arrow="true"
              :filter-option="false"
              not-found-content="未找到该用户"
              :options="data"
              @search="handleSearch"
              @change="handleChange"
            />
          </a-form-item>
          <a-form-item label="指教教师:" name="orgId">
            <a-select
              v-model:value="form.teacher"
              show-search
              placeholder="输入教师姓名"
              style="width: 200px"
              :default-active-first-option="false"
              :show-arrow="false"
              :filter-option="false"
              :not-found-content="null"
              :options="data"
              @search="handleSearch"
              @change="handleChange"
            />
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
        data: [],
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
      const handleSearch = (val) => {
        if (val) {
          fetch(val, (d) => {
            state.data = d;
          });
        }
      };
      const handleChange = (val) => {
        form.patters = val;
      };
      let timeout;
      let currentValue = '';
      const fetch = (query, callback) => {
        if (timeout) {
          clearTimeout(timeout);
          timeout = null;
        }
        currentValue = query;
        function getStudentList() {
          // 获取学生列表
          UserApi.getUserPages({
            pageSize: 99999,
            realName: query,
            pageNo: 1,
          }).then((res) => {
            if (currentValue === query) {
              const result = res?.rows || [];
              console.log('result', res);
              const data = [];
              result.forEach((r) => {
                data.push({
                  value: r.userId,
                  label: r.realName,
                });
              });
              callback(data);
            }
          });
        }
        timeout = setTimeout(getStudentList, 300);
      };

      return {
        ...toRefs(state),
        getPositionList,
        handleSearch,
        handleChange,
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
