<template>
  <div>
    <!-- 编辑 -->
    <common-drawer
      :width="1200"
      :visible="visible"
      title="编辑题目"
      @close="updateVisible(false)"
      v-if="isUpdate"
    >
      <template #extra>
        <div style="height: 32px">
          <a-button type="primary" @click="save" :loading="loading" v-show="activeKey == '1'"
            >确定</a-button
          >
        </div>
      </template>
      <!-- 基本信息 -->
      <title-form
        v-model:form="state.form"
        ref="form"
        :userList="userList"
        :rules="rules"
        v-model:targetKeys="targetKeys"
        @handleChange="handleChange"
        :isUpdate="isUpdate"
        v-show="activeKey == '1'"
      />
    </common-drawer>

    <!-- 新增 -->
    <common-drawer
      :width="1200"
      v-if="!isUpdate"
      :visible="visible"
      title="发布题目"
      @close="updateVisible(false)"
    >
      <template #extra>
        <div style="height: 32px">
          <a-button type="primary" @click="save" :loading="loading" v-show="activeKey == '1'"
            >确定</a-button
          >
        </div>
      </template>
      <title-form
        v-model:form="state.form"
        v-model:targetKeys="targetKeys"
        :userList="userList"
        ref="form"
        @handleChange="handleChange"
        :rules="rules"
    /></common-drawer>
  </div>
</template>

<script lang="ts" setup>
  import { message } from 'ant-design-vue';
  import { UserApi } from '/@/api/system/user/UserApi';
  import { TitleApi } from '/@/api/dc/title/TitleApi';
  import CommonDrawer from '/@/components/CommonDrawer/index.vue';
  import { phoneReg } from '/@/utils/common/util';
  import FieldExpandForm from '/@/components/FieldExpand/FieldExpandForm.vue';
  import TitleForm from './title-form.vue';
  import { onMounted, reactive, ref, watch } from 'vue';

  const props = defineProps<{
    // 弹窗是否打开
    visible: Boolean;
    // 修改回显的数据
    data?: Object;
    // 默认选中tab
    defaultKey: String;
    userList: Array<any>;
  }>();

  const emits = defineEmits<{
    (e: 'update:visible', visible: boolean): void;
    (e: 'done'): void;
  }>();

  const state = reactive({
    form: {},
  });

  // 表单验证规则
  const rules = reactive({
    titleTitle: [{ required: true, message: '请输入题目名称', type: 'string', trigger: 'blur' }],
    teacherName: [
      { required: true, message: '请输入指导老师姓名', type: 'string', trigger: 'blur' },
    ],
    teacherPhone: [
      { required: true, message: '请输入指导老师电话', type: 'string', trigger: 'blur' },
    ],
    titleBackground: [
      { required: true, message: '请输入题目背景', type: 'string', trigger: 'blur' },
    ],
    titleContent: [
      { required: true, message: '请输入题目具体内容', type: 'string', trigger: 'blur' },
    ],
    titleRequire: [
      { required: true, message: '请输入题目基本要求', type: 'string', trigger: 'blur' },
    ],
  });
  // 提交状态
  const loading = ref<boolean>(false);
  // 是否是修改
  const isUpdate = ref<boolean>(false);
  // 角色列表
  const roleList = ref<string[]>([]);
  // 默认选中
  const activeKey = ref<string>('1');

  // ref
  const form = ref(null);

  onMounted(() => {
    init();
  });

  // 初始化
  const init = () => {
    if (props.visible) {
      if (props.data) {
        state.form = Object.assign({}, props.data);
        isUpdate.value = true;
      } else {
        state.form = {};
        isUpdate.value = false;
      }

      // 清空校验
      if (props.defaultKey == '1' && form.value.$refs.formRef) {
        form.value.$refs.formRef.clearValidate();
      }
    }
  };

  watch(
    () => props.data,
    (val) => {
      init();
    },
  );
  /**
   * 选中人员时的监听
   */
  const handleChange = (arr: string[]) => {
    console.log(arr);
    targetKeys.value = arr;
  };

  // tab切换
  const tabChange = (key: string) => {
    activeKey.value = key;
    if (key == '1') {
      state.form = Object.assign({}, props.data);
    }
  };
  // 选中的人
  const targetKeys = ref<any>([]);
  /**
   * 更新编辑题目界面的弹框是否显示
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
    // 校验表单
    form.value.$refs.formRef.validate().then(async (valid) => {
      if (valid) {
        // 修改加载框为正在加载
        loading.value = true;
        let result;
        // 执行编辑或修改题目方法
        let image = [];
        let appendix = [];
        if (state.form.imageList) {
          image = state.form.imageList.map((item) => {
            return item.response?.data?.fileId;
          });
        }
        if (state.form.fileList) {
          appendix = state.form.fileList.map((item) => {
            return item.response?.data?.fileId;
          });
        }
        if (isUpdate.value) {
          result = TitleApi.editTitle({ image, appendix, ...state.form });
        } else {
          result = TitleApi.addTitle({ image, appendix, ...state.form });
        }
        result
          .then((result) => {
            // 移除加载框
            loading.value = true;

            // 提示添加成功
            message.success(result.message);

            // 如果是新增题目，则form表单置空
            if (!isUpdate.value) {
              state.form = {};
            }
            // 关闭弹框，通过控制visible的值，传递给父组件
            updateVisible(false);

            emits('done');
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
