# 如何启动vue项目 ?
项目启动的相关安装包介绍

## 环境更新
* `node v10.16.0 / npm 6.9.0`
* `yarn 1.22.4`


## Node安装
* windows 下载系统版本的`.msi`的安装包完全安装即可
* [下载地址](https://nodejs.org/dist/v10.16.0/)

## 全局依赖
#### 使用 yarn 管理依赖包
```
  npm config set registry https://registry.npm.taobao.org  
  npm config set sass_binary_site https://npm.taobao.org/mirrors/node-sass
  npm install -g yarn@1.12.3
  yarn config set registry https://registry.npm.taobao.org -g
  yarn config set sass_binary_site http://cdn.npm.taobao.org/dist/node-sass -g
  
  # 忽略异常
  yarn config set ignore-engines true
  
  # 其他变量名称
  registry=https://registry.npm.taobao.org/
  sass_binary_site=https://npm.taobao.org/mirrors/node-sass/phantomjs_cdn
  electron_mirror=https://npm.taobao.org/mirrors/electron/
  sqlite3_binary_host_mirror=https://foxgis.oss-cn-shanghai.aliyuncs.com/
  profiler_binary_host_mirror=https://npm.taobao.org/mirrors/node-inspector/
  
  
```

#### 安装 vue-cli
*   `yarn global add @vue/cli`
*  [官方文档](https://cli.vuejs.org/zh/guide/installation.html)

#### 安装 Git
* [下载地址](https://pc.qq.com/detail/13/detail_22693.html)

####  Visual Studio Code 编辑器
* [镜像下载](https://pc.qq.com/detail/16/detail_22856.html) [官方下载](https://code.visualstudio.com/)
##### 插件 (自定义)
* Chinese (Simplified) Language Pack for Visual Studio Code 一 中文语言包
* Verue / ivue 一 Vue 语法工具
```json
"vetur.format.defaultFormatter.html": "js-beautify-html",
"vetur.format.defaultFormatterOptions": {
    "js-beautify-html": {
        "wrap_line_length": 120,
        "wrap_attributes": "auto",
        "end_with_newline": false
    }
```
* Auto Close Tag 一 自动添加结束标签
* Beauify 一 格式化
* vue-format 一 vue文件格式化
* IntelliJ IDEA Keybindings 一 IntelliJ风格快捷键
* Darcula Theme - WebStorm Edition 一 WebStorm 主题


# 项目结构
 ```bash

# public/
# -------- index.html
# src/
# -------- asstes/ # 静态资源
# -------- components/ # 组件
# -------- styles/ # 样式
# -------- utils/ # 工具
# -------- views/ # 程序页面
# -------- App.vue # 入口模板
# -------- main.js # 主程序入口
# -------- router.js # 路由
# -------- store.js # Vuex
# babel.config.js
# vue.config.js

```

# 项目启动
```
yarn  # 安装依赖包
yarn dev    # 启动测试环境
yarn build # 编译项目 
```

# END
