<script lang="ts">
export default {
  name: 'App',
  data() {
    return {
      form: {
        model: 'RealESRGAN_General_x4_v3',
        scale: '4',
        gpu: 'auto',
        thread: '1:2:2'
      },
      defaultModels: [
        {label: "General Photo (Real-ESRGAN)", value: "realesrgan-x4plus"},
        {label: "General Photo (Fast Real-ESRGAN)", value: "RealESRGAN_General_x4_v3"},
        {label: "General Photo (Remacri)", value: "remacri"},
        {label: "General Photo (Ultramix Balanced)", value: "ultramix_balanced"},
        {label: "General Photo (Ultrasharp)", value: "ultrasharp"},
        {label: "Digital Art", value: "realesrgan-x4plus-anime"},
      ],
      models: []
    }
  },
  mounted() {
    this.loadModelList();
  },
  methods: {
    openModelPath() {
    },
    loadModelList() {
      this.models = [];
    }
  }
}
</script>

<template>
  <div id="app">
    <div class="container">
      <div class="left">
        <h3>配置参数</h3>
        <el-form ref="form" :model="form" inline>
          <el-form-item label="模型">
            <el-select v-model="form.model">
              <el-option v-for="item in models" :label="item.label" :value="item.value"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="自定义模型">
            <el-button @click="openModelPath" size="mini" style="width: 100%;">添加自定义模型
            </el-button>
            <el-button @click="loadModelList" size="mini" style="width: 100%;margin: 0">
              刷新自定义模型
            </el-button>
          </el-form-item>
          <el-form-item label="放大比例">
            <el-select v-model="form.scale">
              <el-option label="1" value="1"></el-option>
              <el-option label="2" value="2"></el-option>
              <el-option label="3" value="3"></el-option>
              <el-option label="4" value="4"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="GPU (默认 auto)">
            <el-input v-model="form.gpu" placeholder="设置使用哪个GPU，支持多GPU：0,1,2"></el-input>
          </el-form-item>
          <el-form-item label="线程数 (默认 1:2:2)">
            <el-input v-model="form.thread" placeholder="线程数 load/proc/save"></el-input>
          </el-form-item>
        </el-form>
      </div>
      <div class="right">
        <div class="image-preview-list">

        </div>
        <div class="image-preview">

        </div>
        <div class="operate">

        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
#app {
  margin: 0;
  padding: 0;
}

.container {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  min-height: 100vh;
  width: 100vw;
}

.left {
  width: 250px;
  padding: 20px;
}

.right {
  background: #e5e6e6;
  flex: 1;
}
</style>
