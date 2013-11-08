#static-loader
=============

##A tiny framework for loading javascript and css with local cache(by localStorage);
##前端静态资源加载器，一个极轻量化的前端模块和依赖管理框架，更特别的是他可以实现将静态资源缓存在浏览器的本地存储之中

Usage
=============
##Step1：
你需要做一些准备工作
首先将src/proxy.htm，这个文件部署在你静态资源域下。
例如你的js被部署在www.a.com,那么proxy.htm就需要部署在www.a.com这个域名下的任意一个可以访问到的文件夹中。
这里我先假设部署在了www.a.com/proxy.htm。

##Step2：
然后你需要引入框架基本代码
你可以这样
<script>document.write('<script src="'+YOUR_DOMAIN+'src/loader.js"><\/script>');</script>
或直接一点
<script src="YOUR_DOMAIN/src/loader.js"><\/script>');

##Step3：
最后在开始使用前，你需要做一些必要的配置

```javascript
JL.setConfig({
  //设置你在步骤一中存放代理地址的url
  proxyUrl:'www.a.com/proxy.htm'
  //设置你要加载的script代码在服务器上的目录
  baseDir : 'res/script',
  //设置加载超时
  timeout : 2000
});
```

##Final，最后我们可以看一个调用的demo

