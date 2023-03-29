<template>
  <div class="guns-body">
    <!-- 搜索表单 -->
    <div class="block-interval">
      <a-card :bordered="false">
        <a-form layout="inline" :model="where">
          <a-row>
            <a-form-item label="标题:">
              <a-input
                v-model:value.trim="where.messageTitle"
                placeholder="请输入通知标题"
                allow-clear
              />
            </a-form-item>
            <a-form-item class="ele-text-center" :wrapper-col="{ span: 24 }">
              <a-space>
                <a-button type="primary" @click="reload">查询</a-button>
                <a-button @click="reset">重置</a-button>
              </a-space>
            </a-form-item>
          </a-row>
        </a-form>
      </a-card>
    </div>

    <!-- 表格 -->
    <div>
      <a-card :bordered="false" class="table-height">
        <BasicTable
          :canResize="false"
          ref="tableRef"
          :api="NoticeApi.findPage"
          :where="where"
          :columns="columns"
          rowKey="noticeId"
        >
          <!-- table上边工具栏 -->
          <template #toolbar>
            <div class="table-toolbar">
              <a-space>
                <a-button type="primary" @click="setAlready">
                  <template #icon>
                    <CheckOutlined />
                  </template>
                  <span>全部已读</span>
                </a-button>
              </a-space>
            </div>
          </template>

          <template #bodyCell="{ column, record }">
            <template v-if="column.dataIndex == 'messageTitle'">
              <a @click="openEdit(record)">{{ record.messageTitle }}</a>
            </template>

            <!-- table列表已读状态 -->
            <template v-if="column.key === 'state'">
              <a-tag color="green" v-if="record.readFlag === 0">未读</a-tag>
              <a-tag v-else> 已读</a-tag>
            </template>
          </template>
        </BasicTable>
      </a-card>
    </div>

    <!--我的消息-->
    <my-notice-detail v-model:visible="showDetail" :data="current" @done="reload" />
  </div>
</template>

<script lang="ts" setup>
  import { reactive, ref } from 'vue';
  import { message } from 'ant-design-vue';
  import { BasicTable } from '/@/components/Table';
  import MyNoticeDetail from './mynotice-detail.vue';
  import { NoticeApi } from '/@/api/system/notice/NoticeApi';

  // 查询条件
  const where = reactive({
    messageTitle: '',
  });

  // 表格配置
  const columns = ref<string[]>([
    {
      title: '通知标题',
      dataIndex: 'messageTitle',
    },
    {
      title: '发布人',
      dataIndex: 'sendUserIdWrapper',
    },
    {
      title: '发布时间',
      dataIndex: 'messageSendTime',
    },
    {
      title: '状态',
      key: 'state',
      dataIndex: 'readFLag',
    },
  ]);

  // 表格多选选中列表
  const checkedKeys = ref<Array<string | number>>([]);

  // 当前行数据
  const current = ref<any>(null);

  // 是否显示详情抽屉
  const showDetail = ref<boolean>(false);

  // ref
  const tableRef = ref(null);

  /**
   * 点击查询
   * @author: nxy
   * @Date: 2022-10-12 09:38:18
   */
  const reload = () => {
    checkedKeys.value = [];
    tableRef.value.reload({ page: 1 });
  };

  /**
   * 点击重置
   * @author: nxy
   * @Date: 2022-10-12 09:38:29
   */
  const reset = () => {
    where.messageTitle = '';
    reload();
  };

  /**
   * 设置为已读
   *
   * @author anzhongqi
   * @date 2021/6/15 23:08
   */
  const setAlready = async () => {
    await NoticeApi.setAlreadyReadState();
    message.success('请求成功');
    reload();
  };
  const per = (code) => {
    const buttons = JSON.parse(localStorage.getItem('buttonCodes') as string);
    if (buttons?.includes(code)) {
      return true;
    }
    return false;
  };

  /**
   * 打开编辑页面
   *
   * @author anzhongqi
   * @date 2021/6/15 23:14
   */
  const openEdit = (record) => {
    current.value = record;
    showDetail.value = true;
  };

  /**
   * 删除消息
   *
   * @author anzhongqi
   * @date 2021/6/14 22:31
   */
  const deleteMessage = async (record) => {
    await NoticeApi.deleteMessage(record);
    message.success('已删除');
    reload();
  };
</script>
