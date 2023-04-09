<template>
  <div class="pannter_container">
    <a-table :columns="columns" bordered :pagination="false" :data-source="data">
      <template #memberName="{ record }">
        <span v-if="record.type === 2">{{ record.memberName + '（指导教师）' }}</span>
        <span v-if="record.type === 1">{{ record.memberName + '（项目成员）' }}</span>
        <span v-if="record.type === 3">{{ record.memberName + '（项目负责人）' }}</span>
      </template>
      <template #status="{ text }">
        <a-tag :color="colorMap[text]">{{ statusMap[text] }}</a-tag>
      </template>
      <template #operation="{ record }">
        <a-popconfirm title="Sure to delete?" @confirm="onDelete(record.key)">
          <a-button v-if="record.type !== 3" type="text" danger>删除</a-button>
        </a-popconfirm>
      </template>
    </a-table>
    <a-divider /><a-form
      :model="form"
      v-show="showForm"
      :label-col="{ md: { span: 4 }, sm: { span: 24 } }"
      :wrapper-col="{ md: { span: 20 }, sm: { span: 24 } }"
    >
      <a-form-item label="成员邀请:" name="partters">
        <a-select
          v-model:value="form.partters"
          show-search
          placeholder="输入学生姓名"
          mode="multiple"
          :default-active-first-option="false"
          :show-arrow="true"
          :filter-option="false"
          not-found-content="未找到该用户"
          :options="options"
          @search="handleSearch"
          @change="handleChange"
        />
      </a-form-item>
      <a-form-item label="指导教师:" name="teacherId">
        <a-select
          v-model:value="form.teacherId"
          show-search
          placeholder="输入教师姓名"
          :default-active-first-option="false"
          :show-arrow="false"
          :filter-option="false"
          :not-found-content="null"
          :options="options"
          @search="handleSearch"
          @change="handleChange"
        />
      </a-form-item>
    </a-form>
    <a-button type="primary" v-show="showAdd && !isView" @click="addMember">添加成员</a-button>
    <span style="width: 10px; display: inline-block"></span>
    <a-button type="primary" v-show="showCancel && !isView" @click="cancleAdd">取消</a-button>
    <span style="width: 10px; display: inline-block"></span>
    <a-button type="primary" v-show="showCancel && !isView" @click="add">确定</a-button>
  </div>
</template>
<script setup>
  import { ref, onMounted, reactive } from 'vue';
  import { UserApi } from '/@/api/system/user/UserApi';
  import { ProjectApi } from '/@/api/dc/project/ProjectApi.ts';
  import PublishApi from '/@/api/system/notice/PublishApi';
  import { message } from 'ant-design-vue';
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
  const showForm = ref(false);
  const showCancel = ref(false);
  const showAdd = ref(true);
  const options = ref([]);
  const form = reactive({
    partters: [],
    teacherId: '',
  });
  const userList = ref([]);
  const studentList = ref([]);
  const teacherId = ref('');
  const targetKeyss = ref([]);
  const targetKeyt = ref([]);
  const statusMap = {
    1: '已邀请',
    2: '已加入',
    3: '已拒绝',
  };
  const colorMap = {
    1: 'blue',
    2: 'green',
    3: 'red',
  };
  const columns = [
    {
      title: '姓名',
      dataIndex: 'memberName',
      key: 'memberName',
      slots: { customRender: 'memberName' },
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      slots: { customRender: 'status' },
    },
    {
      title: '操作',
      key: 'operation',
      slots: { customRender: 'operation' },
    },
  ];
  const data = ref([]);
  onMounted(() => {
    getUserList();
    // 获取团队成员列表
    getMemberList();
  });
  const getMemberList = () => {
    ProjectApi.listProjectMember({ projectId: props.data.projectId }).then((res) => {
      data.value = res.data || [];
      data.value.unshift({
        memberName: props.data.createName,
        type: 3,
        status: 2,
      });
    });
  };
  const addMember = () => {
    showForm.value = true;
    showCancel.value = true;
    showAdd.value = false;
  };
  const cancleAdd = () => {
    showForm.value = false;
    showCancel.value = false;
    showAdd.value = true;
  };
  // 添加成员
  const add = () => {
    const parmas = {
      projectId: props.data.projectId,
      memberId: form.partters,
      teacherId: [form.teacherId],
      status: 1,
    };
    const users = [form.teacherId, ...form.partters];
    ProjectApi.addProjectMember(parmas).then((res) => {
      getMemberList();
      message.success('邀请已发送');
      sendMsg(users);
    });
  };
  const sendMsg = (userlist) => {
    console.log(userlist);
    const parmas = {
      noticeContent: `<div>
          <p style="line-height:30px;">项目
            <a id="projectLink">${props.data.projectTitle}</a>,
            ID:<span id="ID"><b>${props.data.projectId}</b></span>负责人<b>${
        JSON.parse(localStorage.getItem('UserInfo')).simpleUserInfo.realName
      }</b> 邀请您加入他(她)的项目。</p>
      <button id="project_invert_confirm" class="btn_custom">加入</button>
          <button id="project_invert_refuse"  class="btn_custom refuse">拒绝</button>
        </div>`,
      noticeScope: userlist.join(',') || '',
      noticeScopeType: 'part',
      noticeTitle: '项目邀请',
    };
    PublishApi.addPublish(parmas);
  };
  /**
   * 获取通知的用户列表
   */
  const getUserList = () => {
    UserApi.getUserList({}).then((res) => {
      userList.value = res.rows;
      userList.value = userList.value.map((item) => ({
        value: item.userId,
        label: item.realName,
        description: item.account,
        disabled: false,
      }));
    });
  };
  const handleSearch = (val) => {
    if (val) {
      fetch(val, (d) => {
        options.value = d;
      });
    }
  };
  const handleChange = (val) => {
    console.log(val);
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
</script>

<style scoped></style>
