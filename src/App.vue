<script lang="ts">
import {getSingleImageArguments} from "./utils/get-arguments.ts";
import {Loading} from "element-ui";
import VConsole from 'vconsole';

let vConsole = new VConsole();
vConsole.hideSwitch()

// 监听Ctrl + F12 打开调试
document.addEventListener('keydown', function (e) {
  if (e.ctrlKey && e.keyCode === 123) {
    vConsole.show()
  }
});
export default {
  name: 'App',
  data() {
    return {
      form: {
        model: 'RealESRGAN_General_x4_v3',
        scale: "4",
        gpu: '',
        thread: '',
        format: 'png'
      },
      formats: [
        {label: "png", value: "png"},
        {label: "jpg", value: "jpg"},
        {label: "webp", value: "webp"},
      ],
      modelInfos: [
        {label: "普通照片(快速Real-ESRGAN)", value: "RealESRGAN_General_x4_v3"},
        {label: "普通照片(Real-ESRGAN)", value: "realesrgan-x4plus"},
        {label: "普通照片(Remacri)", value: "remacri"},
        {label: "普通照片(超混合平衡)", value: "ultramix_balanced"},
        {label: "普通照片(超锐)", value: "ultrasharp"},
        {label: "数字艺术", value: "realesrgan-x4plus-anime"},
      ],
      models: [],

      files: [],

      // select / preview
      type: 'select',

      loading: false,
      loadText: '正在加载模型...'
    }
  },
  watch: {
    form: {
      handler(val) {
        utools.dbStorage.setItem('config', JSON.stringify(val))
      },
      deep: true
    }
  },
  mounted() {
    if (window['utools'] && utools.dbStorage.getItem('config')) {
      this.form = JSON.parse(utools.dbStorage.getItem('config'));
    }

    this.init();

    utools.onPluginEnter(({code, type, payload, option}) => {
      console.log('用户进入插件应用', code, type, payload)
      if (type === 'files') {
        this.type = 'preview';
        let filePaths = [];
        for (const file of payload) {
          filePaths.push(file.path);
        }
        this.handleImages(filePaths);
      }
    })
  },
  methods: {
    async init() {
      let loadingInstance = Loading.service({
        fullscreen: true,
        text: '正在下载模型数据',
        customClass: 'loadingInitBox'
      });

      await window.mutils.initBinData(null);
      await window.mutils.initModelData(null);

      loadingInstance.close();

      this.loadModelList();

      if (this.models.length === 0) {
        this.$message.error('模型获取失败')
      }
    },
    async loadModelList() {
      return window.mutils.initModelData(null).then((names: any) => {
        let models = [];
        for (const model of this.modelInfos) {
          for (const name of names) {
            if (model.value === name) {
              models.push(model);
            }
          }
        }
        for (const name of names) {
          if (models.find((item: any) => item.value === name)) {
            continue;
          }
          models.push({label: name, value: name});
        }
        this.models = models;
      });
    },
    openModelPath() {
      utools.shellOpenPath(window.mutils.modelPath());
      utools.shellOpenExternal("https://github.com/utools-blowsnow/image-enlarge/tree/master/other/models")
    },
    selectImages() {
      this.$refs.file.click();
    },
    onSelectImages(e: any) {
      let files = e.target.files;
      if (files.length === 0) {
        return;
      }
      let filePaths = [];
      for (const file of files) {
        filePaths.push(file.path);
      }
      this.type = 'preview';
      this.handleImages(filePaths);
    },
    // 处理图片
    async handleImages(filePaths: string[]) {
      let files = [];
      let modelPath = window.mutils.modelPath();

      let loadingInstance = Loading.service({
        fullscreen: true,
        text: '正在处理图片...0/' + filePaths.length,
        customClass: 'loadingBox'
      });

      let index = 0;
      for (const filePath of filePaths) {
        let fileName = window.mutils.getFileName(filePath);
        let outFilePath = window.mutils.getFilePath(window.mutils.tempOutputPath(), fileName);

        try {
          await window.mutils.spawnImageHandle(getSingleImageArguments(filePath, outFilePath,
              modelPath, this.form.model, this.form.scale, this.form.gpu, this.form.format, this.form.thread), {
            onProgress: (data: any) => {
              console.log(data);
              if (data === 'Upscayl Successful') {
                data = '100%';
              }
              if (data.indexOf('%') !== -1) {
                document.querySelector('.loadingBox .el-loading-text').innerHTML = `正在处理图片...${data} , ${index}/${filePaths.length}`;
              }
            }
          });

          // 获取图片base64
          let base64 = await window.mutils.getFileBase64(outFilePath);

          files.push({
            fileName,
            filePath,
            outFilePath,
            base64
          });
        } catch (e) {
          console.error(e)
          this.$message.error("处理失败：" + e.message)
        }
        index++;
      }

      loadingInstance.close();

      console.log(files);
      this.files = files;
    },
    async handleImageDir(dirPath: string) {
      // 获取文件夹下所有图片
      let filePaths = await window.mutils.getDirFiles(dirPath);
      return this.handleImages(filePaths);
    },
    async save() {
      let dirPaths = utools.showOpenDialog({
        title: '保存图片路径',
        buttonLabel: '保存',
        properties: ['openDirectory']
      });
      if (!dirPaths || dirPaths.length === 0) {
        return;
      }
      let dirPath = dirPaths[0];
      await window.mutils.saveImages(this.files, dirPath);

      this.$message.success('保存成功')

      // 打开文件夹
      utools.shellOpenPath(dirPath);
    },
    cancel() {
      this.type = 'select';
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
            <el-button type="primary" @click="openModelPath" size="mini" style="width: 100%;">
              添加自定义模型
            </el-button>
            <el-button icon="el-icon-refresh-right" @click="loadModelList" size="mini"
                       style="width: 100%;margin: 0">
              刷新模型列表
            </el-button>
          </el-form-item>
          <el-form-item label="输出格式">
            <el-select v-model="form.format">
              <el-option v-for="item in formats" :label="item.label"
                         :value="item.value"></el-option>
            </el-select>
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
        <template v-if="type === 'select'">
          <el-empty>
            <input ref="file" type="file" accept="image/*" style="display: none;" multiple
                   @change="onSelectImages">
            <el-button type="primary" @click="selectImages">选择图片</el-button>
          </el-empty>
        </template>
        <template v-if="type === 'preview'">
          <div class="image-preview">
            <el-carousel indicator-position="outside">
              <el-carousel-item v-for="item in files" :key="item">
                <img style="max-width: 100%;" :src="' data:image/png;base64,'+item.base64" alt="">
              </el-carousel-item>
            </el-carousel>
          </div>
          <div class="operate"
               style="text-align: right; background: #fff;padding: 20px;width: 100%">
            <el-button type="danger" @click="cancel">取消</el-button>
            <el-button type="primary" @click="save">另存为</el-button>
          </div>
        </template>
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
}

.left {
  width: 250px;
  padding: 20px;
  border-right: 1px solid #e5e6e6;
  height: 100vh;
  overflow: auto;
}

.right {
  background: #e5e6e6;
  flex: 1;
}

.image-preview {
  padding: 20px;
  height: calc(100vh - 80px);
  overflow: auto;
}
</style>
