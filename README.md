#static-loader
=============

##A tiny framework for loading javascript and css with local cache(by localStorage);
##前端静态资源加载器，一个极轻量化的前端模块和依赖管理框架，更特别的是他可以实现将静态资源缓存在浏览器的本地存储之中

Usage
=============
##Step1：
你需要做一些准备工作
⋅⋅⋅首先将src/proxy.htm，这个文件部署在你静态资源域下。
⋅⋅⋅例如你的js被部署在www.a.com,那么proxy.htm就需要部署在www.a.com这个域名下的任意一个可以访问到的文件夹中。
⋅⋅⋅这里我先假设部署在了www.a.com/proxy.htm。部署这个文件的意义在于他可以帮你缓存曾经请求的js文件到本地存储。

##Step2：
然后你需要引入框架基本代码
你可以这样
```javascript
<script>document.write('<script src="'+YOUR_DOMAIN+'src/loader.js"><\/script>');</script>
```
或直接一点
```javascript
<script src="YOUR_DOMAIN/src/loader.js"><\/script>');
```

##Step3：
最后在开始使用前，你需要做一些必要的配置.  
这里需要注意的是baseUrl中必须有{VERSION}，用来标记同一个静态文件的不同版本号。  
当然'{VERSION}'不一定可以放在URL中任意位置，例如  
⋅⋅⋅http://yourdomain.com/{VERSION}/a.js  
⋅⋅⋅http://yourdomain.com/dir/{VERSION}/a.js  
⋅⋅⋅http://yourdomain.com/dir/a.js?ver={VERSION};  
⋅⋅⋅作为一个前端工程师，你的静态资源在发布的时候一定是携带版本号的，否则你无法保证资源部被浏览器缓存。  

```javascript
JL.setConfig({
  //设置你在步骤一中存放代理地址的url
  proxyUrl:'www.a.com/proxy.htm'
  //设置你要加载的script代码在服务器上的目录
  baseDir : 'res/{VERSION}/script',
  //设置加载超时
  timeout : 2000
});
```

##Final，最后我们可以看一个调用的demo。
⋅⋅⋅首先在加载一个模块前你需要先定义他。
```javascript
//这样定义会在baseDir下的moduleA目录下查找并加载classB.js这个文件。
define('moduleA.classB',function(){
	//需要暴露出来的接口，放在export中就可以了
	this.export = {};
});
```

⋅⋅⋅然后是调用到这个定义的模块  
```javascript
import('moduleA.classB',callback);
```
⋅⋅⋅当然如果你确定模块已经加载或者是使用同步方式调用，则可以用：  
```javascript
require('moduleA.classB',callback);
```

