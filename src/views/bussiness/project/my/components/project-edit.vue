<template>
  <div>
    <!-- 编辑 -->
    <common-drawer
      :width="1200"
      :visible="visible"
      title="项目信息编辑"
      :activeKey="activeKey"
      :tabList="tabList"
      :isShowTab="true"
      @tabChange="tabChange"
      @close="updateVisible(false)"
      v-if="isUpdate"
    >
      <template #extra>
        <div style="height: 32px">
          <a-button type="primary" @click="save" :loading="loading">确认修改</a-button>
        </div>
      </template>
      <!-- 基本信息 -->
      <project-form
        v-if="activeKey == '1'"
        v-model:form="state.form"
        ref="form"
        :rules="rules"
        :isUpdate="isUpdate"
      />

      <!-- 项目成员 -->
      <Pattner v-if="activeKey == '2'" :data="data" ref="docs" />
      <!-- 过程文档 -->
      <docs v-if="activeKey == '3'" :data="data" ref="docs" />
    </common-drawer>

    <!-- 查看 -->
    <common-drawer
      :width="1200"
      :visible="visible"
      title="项目信息查看"
      :isShowTab="true"
      :activeKey="activeKey"
      :tabList="tabList"
      @tabChange="tabChange"
      @close="updateVisible(false)"
      v-if="isView"
    >
      <!-- 基本信息 -->
      <project-form
        v-if="activeKey == '1'"
        v-model:form="state.form"
        ref="form"
        :rules="rules"
        :isView="isView"
      />
      <!-- 项目成员 -->
      <Pattner v-if="activeKey == '2'" :isView="isView" :data="data" ref="docs" />
      <!-- 过程文档 -->
      <docs v-if="activeKey == '3'" :isView="isView" :data="data" ref="docs" />
    </common-drawer>

    <!-- 新增 -->
    <common-drawer
      :width="1200"
      v-if="!isUpdate && !isView"
      :visible="visible"
      title="创建项目"
      @close="updateVisible(false)"
    >
      <template #extra>
        <div style="height: 32px">
          <a-button type="primary" @click="save" :loading="loading" v-show="activeKey == '1'"
            >确认创建</a-button
          >
        </div>
      </template>
      <project-form v-model:form="state.form" ref="form" :rules="rules" />
    </common-drawer>
  </div>
</template>

<script lang="ts" setup>
  import { message } from 'ant-design-vue';
  import { ProjectApi } from '/@/api/dc/project/ProjectApi.ts';
  import { FileApi } from '/@/api/system/operation/FileApi';
  import CommonDrawer from '/@/components/CommonDrawer/index.vue';
  import ProjectForm from './project-form.vue';
  import Docs from './docs.vue';
  import Pattner from './pattner.vue';
  import { onMounted, reactive, ref, watch } from 'vue';

  const props = defineProps<{
    // 弹窗是否打开
    visible: Boolean;
    // 修改回显的数据
    data?: Object;
    isView?: Boolean;
    // 默认选中tab
    defaultKey: String;
  }>();

  const emits = defineEmits<{
    (e: 'update:visible', visible: boolean): void;
    (e: 'done'): void;
  }>();

  const state = reactive({
    form: {},
  });
  // 默认选中
  const activeKey = ref<string>('1');
  // 表单验证规则
  const rules = reactive({
    projectTitle: [{ required: true, message: '请输入项目名称', type: 'string', trigger: 'blur' }],
    projectBackground: [
      { required: true, message: '请输入项目背景', type: 'string', trigger: 'blur' },
    ],
    projectContent: [
      { required: true, message: '请输入项目内容', type: 'string', trigger: 'blur' },
    ],
  });
  // 提交状态
  const loading = ref<boolean>(false);
  // 是否是修改
  const isUpdate = ref<boolean>(false);
  const isView = ref<boolean>(false);
  // ref
  const form = ref(null);
  const tabList = ref([
    {
      key: '1',
      name: '基本信息',
    },
    {
      key: '2',
      name: '项目成员',
    },
    {
      key: '3',
      name: '过程文档',
    },
  ]);
  onMounted(() => {
    init();
  });

  // 初始化
  const init = () => {
    if (props.visible) {
      if (props.data) {
        state.form = Object.assign({}, props.data);
        state.form.imageList = props.data.imageFile || [];
        state.form.imageList.map((item) => {
          item.name = item.fileOriginName;
          item.thumbUrl =
            window.location.origin +
            `/api/sysFileInfo/previewByObjectName?fileBucket=defaultBucket&fileObjectName=${item.fileObjectName}`;
        });
        state.form.fileList = props.data.appendixFile || [];
        state.form.fileList.map((item) => {
          item.name = item.fileOriginName;
          item.thumbUrl =
            window.location.origin +
            `/api/sysFileInfo/previewByObjectName?fileBucket=defaultBucket&fileObjectName=${item.fileObjectName}`;
        });
        if (props.isView) {
          isView.value = true;
        } else {
          isUpdate.value = true;
        }
      } else {
        state.form = {};
        isUpdate.value = false;
      }
      activeKey.value = props.defaultKey;
      // 清空校验
      if (props.defaultKey == '1' && form.value.$refs.ProjectFormRef) {
        form.value.$refs.ProjectFormRef.clearValidate();
      }
    }
  };
  // tab切换
  const tabChange = (key: string) => {
    activeKey.value = key;
    if (key == '1') {
      state.form = Object.assign({}, props.data);
    }
  };

  watch(
    () => props.data,
    (val) => {
      init();
    },
  );
  /**
   * 更新编辑用户界面的弹框是否显示
   *
   * @param value true-显示，false-隐藏
   * @author anzhongqi
   * @date 2021/4/7 11:00
   */
  const updateVisible = (value) => {
    emits('update:visible', value);
  };

  // 保存
  const save = () => {
    console.log(form.value);
    // 校验表单
    form.value.$refs.ProjectFormRef.validate().then(async (valid) => {
      if (valid) {
        // 修改加载框为正在加载
        loading.value = true;
        let result;
        let image = [];
        let appendix = [];
        if (state.form.imageList) {
          image = state.form.imageList.map((item) => {
            return item.fileId ? item.fileId : item.response.data.fileId;
          });
        }
        if (state.form.fileList) {
          appendix = state.form.fileList.map((item) => {
            return item.fileId ? item.fileId : item.response.data.fileId;
          });
        }
        const params = {
          ...state.form,
          image: image,
          appendix: appendix,
        };
        // delete params.imageList;
        // delete params.fileList;

        // 执行编辑或修改用户方法
        if (isUpdate.value) {
          result = ProjectApi.editProject(params);
        } else {
          result = ProjectApi.addProject(params);
        }
        result
          .then((result) => {
            if (result.code === '00000') {
              // 移除加载框
              loading.value = true;
              // 提示添加成功
              message.success(result.message);
              if (!isUpdate.value) {
                state.form = {};
              }
              // 关闭弹框，通过控制visible的值，传递给父组件
              updateVisible(false);
              emits('done');
            } else {
              message.error(result.message);
              return;
            }
          })
          .catch(() => {
            loading.value = true;
          });
      }
    });
  };
</script>

<style lang="less" scoped>
  :deep(.ant-drawer-body) {
    padding: 10px 24px 24px 24px;
  }
</style>
