#### JS基础
  #### this   
    关键字：每个函数都有this这个关键字 本质上是一个对象代表当前函数或者方法的调用者
    this不是函数定义时决定的 而是调用时决定的
    普通函数中的this代表着window
    构造函数中的this代表当前构造函数实例化出来的对象
    箭头函数没有自己的this箭头函数的this会继承外部函数的this
    通过call bind apply可以修改函数的this
    对象中的函数 this属于对象他自己
  #### 原型
    每个函数都有prototype属性 指向它的原型对象
    每个实实例化对象都有__proto__属性，也是指向原型对象
    原型对象就是一个公共的存储空间，通常把一些公共的属性或方法放到此空间内，当构造函数创建实例化对象时，实例化对象可以通__proto__访问到原型对象上的属性或者方法以便资源的共享
    构造函数的prototype属性指向原型对象 显示原型对象
    实例化对象的__proto__属性指向原型对象  隐式原型对象
    显示原型对象等于隐士原型对象
    原型对象上的constructor属性指向构造函数本身
    istanceof实现的关键  递归拿去实例对象的隐士原型对象和构造函数的显示原型对象对比
    new关键字实现的关键  在堆内存开辟一个空间，创建一个空对象指向该空间  将空对象的隐士原型对象指向构造函数显示原型对象
    执行构造函数且将函数的this指定为新创建的空对象  最后对象返回
    继承 
      原型链继承  子类的原型指向父类的实例  
        优点：子类创建的实例对象可以引用父类原型对象上的属性或者方法
        缺点：子类构造器函数的丢失，子类无法继承父类构造函数，无法初始化父类的构造函数的属性或方法
      构造函数继承： 通过.call或者.apply在子类构造函数中调用父类的构造函数且将this指定为子类的实例对象
        优点：子类可以继承父类构造函数身上的属性或方法，进行初始化
        缺点：子类的实例无法访问到父类原型对象上的属性或者方法
      组合继承（原型链继承+构造函数继承）
        优点：使用以上两种继承，子类的实例可以继承父类构造函数的属性或方法，也可访问父类原型上的属性
        缺点：子类构造器会丢失，需要手动将子类的构造器指向为他自己
  #### 闭包
    闭包：指有权访问另一函数作用域中变量的函数(定义函数作用域和调用函数作用域不在同一作用域)
    闭包形成的条件：函数嵌套内部函数引用外部函数的局部变量
    闭包的作用：
      可以在函数外部访问函数内部声明的变量，在外部调用闭包函数，从而实现函数外部访问函数内部声明的变量。使用这种方法可以一个私有的变量
      可以使已经运行结束函数上下文中声明的变量保留到内存中，因为闭包函数引用这个变量对象的地址。从而不会被回收。延长函数内部的变量的声明收起
    闭包的缺点：使用闭包创建的私有变量不会被回收，需要手动清除闭包。不恰当的使用闭包会导致内存溢出
  #### 事件循环机制
    同步任务：在主线程在排队执行的任务，只有当前一个任务执行完毕后，才会执行下一个任务
    异步任务：不会进入主线程，而是进入任务队列的任务，只有任务队列通知主线程上某个异步任务可以执行了，这个异步任务才会进入主线程执行
    任务队列分为：宏任务队列和微任务队列，执行顺序  执行宏任务前 先清空微任务
      宏任务：settimeOut script中整体代码
      微任务：promise.then mutationObserve
    eventLoop：
      JS执行代码时，在主线程上执行同步任务
      当开启一个异步任务时，主线程会将异步任务交给对应的管理模块
      主线程继续执行后续任务
      管理模块接管对应回调，会在恰当的时机放入任务队列中
      当主线程执行完所有的同步任务，会通过轮询的方式询问任务队列是否有可待执行的任务
      如果有进入主线程执行异步任务，如果没有一直轮询
  #### 变量提升函数提升
    JS引擎在JS执行代码时会先进行预解析
    找到var function关键字
    找到var后将var后面的变量提前声明但不赋值  默认undefined
    找到function关键字直接定义函数，也就是说函数在与解析时已经定义完毕
  #### 作用域
    用来决定代码的执行范围，变量的所属范围，主要作用隔离变量。作用域分为全局作用域和局部作用域
    全局作用域：
      最外层函数和最外层声明的变量都属于全局作用域
      winodow上所有的属性都属于全局作用域
      在全局作用域声明过多的变量会导致命名无人
    函数作用域
      在函数内部声明的变量或函数属于函数作用域
      作用域是分层的只有内层作用域可以访问外层函数作用域  反之不可以
    块级作用域
      es6中使用let const声明的变量都具有块级作用域
      在循环中比较适合绑定块级作用域。这样就可以把声明的变量限制在循环体内部
  #### 执行上下文
    执行上下文是一个抽象的概念，代表当前代码的执行环境，包含环境 变量对象 this 作用域
    js引擎在执行代码时会先创建一个执行环境，进入该环境后用于收集当前环境中的变量  函数 函数的参数 this 
    之后确认this指向
    创建作用域链
  #### 深浅拷贝
    浅拷贝：将一个对象的属性赋值给新对象，如果属性值是引用数据类型，会将这个引用数据类型的地址赋值给新对象，两个对象指向同一个引用地址，不会递归拷贝
    深拷贝：对于浅拷贝而言，如果属性值是引用类型数据，新对象会创建一个地址，且将属性值赋值进去，进行递归拷贝
  #### 防抖节流
    防抖：debounce 函数频繁执行时，在规定时间内只让最后一次生效 前面的都不生效
    节流：throttle 函数频繁执行时，规定时间内只生效一次 其他都不生效
    