### webpack
  #### 概念
  - webpack是一个模块打包器，在webpack看来，前端所有的资源文件（js\css\less\图片\...）都会作为模块进行处理，根据模块的依赖关系进行静态分析，生成对应的静态资源
  #### 五个核心概念
  - entry 入口，指示webpack应该使用那个文件作为入口构建其内部依赖关系的开始
  - output 出口，指示webpack在哪里输出它构建后的bundles，以及如何命名这些文件
  - loader 
    - loader本质上是一个函数，在函数中对接收到的内容进行转换，转换返回后的结果，因为webpack只支持js或者json文件，所以对于其他类型的资源需要使用对应的loader进行转换预处理工作
    - 在配置对象的module的rules属性中进行配置：test和use，test接收一个正则表达式，只有匹配上的模块才使用这条规则，use可以接收一个数组，数组包含该规则使用的loader
    - loader 分为三类，使用enforce配置  前置loader pre、后置loader post、正常loader normal
    - loader的执行顺序从下至上，从右到左
    - 常见的loader
      - file-loader （用来加载图片文件的loader）把文件输出到一个文件夹中，在代码中通过url引用输出的文件
      - url-loader 和file-loader类似，可以设置一个阈值，低于这个阈值会将文件以base64的格式注入到代码中
      - less-loader 将less文件转换成css
       - css-loader 加载css，支持模块化，压缩、文件导入等特性，转换成字符串形式
      - style-loader 把css代码注入到js中，通过dom操作去加载css
      - eslint-loader 通过eslint检查js代码
      - bable-loader 匹配js文件，将高级语法转换成低级语法
  - plugin 插件执行范围更广泛的任务，让webpack更具灵活性。
    - 插件 webpack在打包过程中会广播出许多事件，打包之前，打包之后， 编译中。插件可以监听这些事件，在这些事件中做一些操作，扩展webpack打包的功能
    - 在plugins中单独配置，类型为数组，每一项就是一个插件的实例，参数都是通过构造函数传递过去
  - 常见的插件
    - html-webpack-plugin 简化html文件的创建，打包后将打包好的js自动引入html的模板
    - clean-webpack-pluhin 清空之前打包的文件
    - mini-css-extract-plugin  分离样式文件，将css文件抽离出单独的文件
  - mode 模式，打包有开发模式和生产模式
  #### 打包流程
  
  - webpack的运行流程是一个串行的过程，从启动到结束，会执行以下流程。从配置文件和shell语句中读取并合并参数，得到最终参数。之后初始化编译对象，加载所有配置的插件，执行对象的run方法，开始执行编译。根据配置中的entry找到所有的入口文件。调用所有配置的loader对模块进行翻译，再找出模块依赖的模块，递归执行编译直至所有的入口依赖的文件都经过处理。编译完成后，得到了每个模块被编译后的最终内容以及他们的依赖关系。根据入口和模块之间的依赖关系，组装成一个个包含多个模块的chunk，将每个chunk转换成一个单独的文件加载到输出列表。确定好输出内容后，根据配置确定输出后的路径和文件名，把文件内容写入文件系统


  #### source map 是什么
  - 是将编译、打包、压缩后的代码映射回源代码的过程，方便调试，想要调试源码就要source map
  
  #### 文件监听
  - 在发现源码发生变化时，自动重新构建出新的输出文件
  - webpack开启监听模式，有两种方式
    - 在启动webpack命令时，带上--watch 参数
    - 在配置配置文件中设置watch为true
  




  