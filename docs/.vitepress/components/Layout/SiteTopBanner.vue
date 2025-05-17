<template>
  <!-- <div class="site-top-banner">
    <div class="site-top-banner_inner">
        <a href="https://github.com/gregreindel/llm-exe-lambda" target="_blank">Invoke llm-exe as a AWS lambda function. Deploy using CDK. View on Github</a>
    </div>
</div> -->
  <span v-if="packageId" class="package-id">v{{ packageId }}</span>
</template>

<script setup lang="ts">
defineProps<{
  packageId: string;
}>();
</script>
<style scoped>
.site-top-banner {
  color: #333;
  background-color: rgb(246 246 247);
  margin-left: 80px;
  padding: 4px 8px;
  text-align: center;
  font-size: 13px;
  font-weight: 500;
  line-height: 1.5;
  /* margin-bottom:20px; */
}

.dark .site-top-banner {
  background-color: #000000;
  color: #fff;
}

@media screen and (max-width: 768px) {
  .site-top-banner {
    display: none;
  }
}

.package-id {
  font-size: 12px;
  font-weight: 400;
  color: #666;
  margin-left: 10px;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  width: 100%;
}
</style>
