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
<script>document.write('<script src="'+YOUR_DOMAIN+'src/loader.src.js"><\/script>');</script>
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
JL.setVersion({
  'moduleA.ClassB':'{versionNumbber}'
});
```
下面这是一个真实的demo,会更直观，通常文件的版本号由你代码管理工具（git,svn等）自动生成：
```javascript
JL.setVersion({
  "lang.en" : "6zzamt",
  "map.baiduMap" : "A121cx",
  "ui.listloader" : "CBOAxd_",
  "lang.zhtw" : "2uvXj2N",
  "sms.sendSMSPannelV2" : "8pe~xZ~",
  "ui.notice" : "24EFzi8",
  "ui.timelineV2" : "5d8Rzxw",
  "sms.detail" : "8Zpp0Gy",
  "contact.timeline2" : "6Ywgw8o",
  "contact.menu" : "C_QDDtw",
  "note.richEditor" : "95Z60Lu",
  "ui.toolmenu" : "EXarxVI",
  "ui.selector" : "2lEYh7e",
  "map.baiduInit" : "7GHDHm9",
  "lang.loader" : "2ufICUO",
  "sms.richEditor" : "4gLxK5Z",
  "lang.chn" : "2uvXj2N",
  "gallery.selectbar" : "EGGpwYr",
  "contact.selector" : "6UqpwQ0",
  "contact.pickerV2" : "A3Gapnk",
  "gallery.dragImage" : "ARzM2L2",
  "contact.groupmenu" : "AyqSq9z",
  "contact.detail" : "5VRCCOR",
  "ui.progress" : "9YC_b1M"
})
```
设置好模块的版本号后，做一些全局的配置，这些配置和静态资源环境的部署有关。
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

⋅⋅⋅模块的命名空间可以是任意深度的，例如：
```javascript
define('moduleA.moduleB.moduleC.classA',function(){
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

⋅⋅⋅当然既然是模块管理框架，就一定存在依赖管理问题，这里使用一种静态集中配置，很容易理解,：
```javascript
//在加载moduleA.classB时， 会先检查静态依赖关系，然后先加在依赖模块
JL.addDepend({
  'moduleA.classB' : ['moduleB.classB', 'moduleB.classC', 'moduleA.classA'],
});
```
⋅⋅⋅最后如果你想在调试时禁止本地存储缓存你的代码，你在你的地址栏上加上debug参数，例如：  
http://yourdomain.com/?debug=true;  


