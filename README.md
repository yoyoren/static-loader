#static-loader
=============

##A tiny framework for loading javascript and css with local cache(by localStorage);
##ǰ�˾�̬��Դ��������һ������������ǰ��ģ������������ܣ����ر����������ʵ�ֽ���̬��Դ������������ı��ش洢֮��

Usage
=============
##Step1��
����Ҫ��һЩ׼������
���Ƚ�src/proxy.htm������ļ��������㾲̬��Դ���¡�
�������js��������www.a.com,��ôproxy.htm����Ҫ������www.a.com��������µ�����һ�����Է��ʵ����ļ����С�
�������ȼ��貿������www.a.com/proxy.htm��

##Step2��
Ȼ������Ҫ�����ܻ�������
���������
<script>document.write('<script src="'+YOUR_DOMAIN+'src/loader.js"><\/script>');</script>
��ֱ��һ��
<script src="YOUR_DOMAIN/src/loader.js"><\/script>');

##Step3��
����ڿ�ʼʹ��ǰ������Ҫ��һЩ��Ҫ������

```javascript
JL.setConfig({
  //�������ڲ���һ�д�Ŵ����ַ��url
  proxyUrl:'www.a.com/proxy.htm'
  //������Ҫ���ص�script�����ڷ������ϵ�Ŀ¼
  baseDir : 'res/script',
  //���ü��س�ʱ
  timeout : 2000
});
```

##Final��������ǿ��Կ�һ�����õ�demo

