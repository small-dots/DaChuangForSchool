<template>
  <div class="anticon" :class="getAppLogoClass" @click="goHome">
    <img style="border-radius: 50%" src="../../../assets/images/xiaohui.jpg" />
    <div
      class="ml-2 truncate md:opacity-100"
      :class="getTitleClass"
      :style="{ color: inner ? '#ffffff' : '#000000' }"
      v-show="showTitle"
    >
      {{ title || t('sys.login.signInTitle') }}
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { computed, unref, onMounted, ref } from 'vue';
  import { useGo } from '/@/hooks/web/usePage';
  import { useMenuSetting } from '/@/hooks/setting/useMenuSetting';
  import { useDesign } from '/@/hooks/web/useDesign';
  import { PageEnum } from '/@/enums/pageEnum';
  import { useUserStore } from '/@/store/modules/user';
  import { useSystemStore } from '/@/store/modules/system';
  import { useI18n } from '/@/hooks/web/useI18n';
  const props = defineProps({
    /**
     * 主题
     */
    theme: { type: String, validator: (v: string) => ['light', 'dark'].includes(v) },
    /**
     * 是否显示标题
     */
    showTitle: { type: Boolean, default: true },
    /**
     * 总是显示标题
     */
    alwaysShowTitle: { type: Boolean },
    title: {
      type: String,
      default: '',
    },
    inner: {
      type: Boolean,
      default: false,
    },
    noleft: {
      type: Boolean,
      default: false,
    },
  });
  const { t } = useI18n();

  const { prefixCls } = useDesign('app-logo');
  const { getCollapsedShowTitle } = useMenuSetting();
  const userStore = useUserStore();
  const systemStore = useSystemStore();
  const go = useGo();
  // logo
  const logo = ref<string>('');
  // 项目名称
  const projectName = ref<string>('');

  const getAppLogoClass = computed(() => [
    prefixCls,
    props.theme,
    { 'collapsed-show-title': unref(getCollapsedShowTitle) },
    { noleft_s: props.noleft },
  ]);

  const getTitleClass = computed(() => [
    `${prefixCls}__title`,
    {
      'xs:opacity-0': !props.alwaysShowTitle,
    },
  ]);

  function goHome() {
    go(userStore.getUserInfo.homePath || PageEnum.BASE_HOME);
  }

  onMounted(async () => {
    // 加载主题信息，logo和左上角的项目名
    let result = await systemStore.loadThemeInfo();
    logo.value = result.gunsMgrLogo;
    projectName.value = result.gunsMgrName;
  });
</script>
<style lang="less" scoped>
  @prefix-cls: ~'@{namespace}-app-logo';

  .@{prefix-cls} {
    display: flex;
    align-items: center;
    padding-left: 7px;
    cursor: pointer;
    transition: all 0.2s ease;

    &.light {
      border-bottom: 1px solid @border-color-base;
    }

    &.collapsed-show-title {
      padding-left: 20px;
    }

    &.light &__title {
      color: @primary-color;
    }

    &.dark &__title {
      color: @white;
    }

    &__title {
      font-size: 16px;
      font-weight: 700;
      transition: all 0.5s;
      line-height: normal;
    }
  }
  .noleft_s {
    left: 0;
    transform: translateX(0);
  }
</style>
