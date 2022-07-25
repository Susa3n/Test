### this
  #### 关键字
  - 每个函数都有自己的this，本质上是一个对象，代表着调用这个函数或者方法的对象
  #### this指向问题
  - 函数this不是函数定义的时候决定的，而是在调用函数时决定
  #### this指向分类
  - 普通函数调用时this指向window
  - 对象中的函数调用时this指向对象本身
  - 构造函数中的this指向构造函数创建的实例对象
  - 调用call、apply（指定的对象）this指向指定的对象
  - 箭头函数的this会继承外部函数的this
  #### call bind apply
  - 都是Function原型对象上的方法，能任意对象上的方法被指定对象所调用。用作改变函数的this指向
  - 区别：
    - call、apply：调用函数，改变函数的this指向，为传入的第一个参数。call是单个传参 apply封装一个数组一起传入
    - apply：返回一个新函数，新函数的函数体内部会执行调用原来的函数，且this指向为传入的第一个参数
```javascript
    Function.prototype.call= function(obj,...args) {
      obj.callback = this
      const result = obj.callback(...args)
      delete obj.callback
      return result
    }


    Function.prototype.apply = function(newObj,args) {
      newObj.callback = this
      const result = newObj.callback(...args)
      delete newObj.callback
      return result
    }


    Function.prototype.bind = function(newObj,...argus) {
      const callback = this
      return function() {
        const result = callback.call(newObj,...argus,...arguments)
        return result
      }
    }

```

### 原型
  #### 原型对象
  - 原型：每个对象在内部初始化时，就会初始化一个prototype原型属性，而对象的__proto__属性，指向他的原型对象
  - 原型对象： 原型对象是一个公共的存储空间，通常把一些公共的属性和方法存储到原型对象中。当创建实例对象时，实例对象可以直接访问原型对象中的属性或者方法实现资源的共享
  - 每个构造函数都有prototype属性，该属性指向的是原型对象（显式原型对象）
  - 每个实例对象有__proto__属性，该属性指向的也是原型对象（隐式原型对象）
  - 构造函数的显示原型对象 等于 实例对象的隐式原型对象
  - 原型对象的本质：普通Object的实例
```javascript
    // 普通构造函数
    function Person(name,age) {
      this.name = name
      this.age = age
    }
    Person.prototype.say = function() {
      console.log(this.name+'sayHi!');
    }

    let p1 = new Person('susa3n',18)
    console.log(p1); // 实例对象 Person { name: 'susa3n', age: 18 }
    p1.say() // 实例对象调用原型上的方法  susa3nsayHi!
    console.log(p1.__proto__); // 隐式原型对象 { say: [Function (anonymous)] }
    console.log(Person.prototype); // 显式原型对象  { say: [Function (anonymous)] }
    console.log(Person.prototype == p1.__proto__); // 显式原型对象 === 隐式原型对象  true
    console.log(Person.prototype.constructor == Person); // 原型对象上的constructor属性  === 构造函数 true


    // Es6构造函数
    class Person {
      constructor(name,age) {
        this.name = name
        this.age = age
      }

      say() {
        console.log(this.name+'sayHi!');
      }
    }
```
  #### 原型链
  - 实例对象查找属性或方法时,先在自身找，如果自身没有，沿着__proto__属性去原型对象上找
  - 如果原型对象上还没有，继续沿着__proto__，直至找到Object的原型对象
  - 如果没有找到就返回undefined
  - 实例对象沿着__proto__查找属性的过程叫做原型链
  #### instanceOf实现
  - 递归拿取obj的隐式原型对象去和构造函数的原型对象做比较
```javascript
function myInstanceOf(left,right) {
  let proto = left.__proto__
  while(proto !== null) {
    if(proto == right.prototype) {
      return true
    }
    proto = proto.__proto__
  }
  return false
}
```
  #### new关键字
  - 在堆内存中开辟空间创造一个空对象指向该空间
  - 将空对象的隐式原型对象指向构造函数的显示原型对象
  - 执行构造函数并将空对象作为this
  - 返回构造函数生成的实例
```javascript
    function Person(name,age,sex) {
    this.name = name 
    this.age = age
    this.sex = sex
  }
  // const singer1 = new Person('邓紫棋',22,'nv') 
  console.log(singer1); // Person { name: '邓紫棋', age: 22, sex: 'nv' }
  function myNew(cb,...argus) {
    const obj = {}
    obj.__proto__ = Person.prototype
    cb.call(obj,...argus)
    return obj
  }
  const singer1 = myNew(Person,'邓紫棋',22,'nv')

  console.log(singer1); // Person { name: '邓紫棋', age: 22, sex: 'nv' }
```
  #### 继承
   - 原型链的继承：将子类的原型指向父类创造的实例对象
     - 优点： 子类可以继承父类构造函数原型上的属性方法
     - 缺点： 子类构造器的丢失，创建子类的时候不能向父类传参、父类引用类型的实例对象被共享
   - 构造函数继承：利用.call或者.apply方法，在子类中借用父类的构造函数，继承父类的构造函数中的属性或方法
     - 优点： 子类在继承父类时，可以向父类构造函数传参
     - 缺点： 只能继承父类构造函数中的属性或方法，无法访问到原型上的方法
   - 组合继承（原型链继承+构造函数继承）
     - 优点： 结合前面两种继承方式的优点，子类的实例继承父类构造函数中的属性或方法同时可以访问到父类原型上的属性方法
     - 缺点： 子类构造器的丢失，手动将子类构造器指向它自己。调用了两次父类构造函数。父类引用类型的实例对象被共享
```javascript
    // 原型链继承
    function Person(name) {
      this.name = name
    }

    Person.prototype.test = {id:0} // 父类引用类型的实例对象被共享，容易造成修改的混乱
    Person.prototype.say = function() {
      console.log(this.name+'sayHi!');
    }

    function Child(age) {
      this.age = age
    }
    Child.prototype = new Person()
    const c1 = new Child()
    const p1 = new Person()
    console.log(Child.prototype.constructor); //[Function: Person] 
    c1.say() // undefinedsayHi!

    c1.test.id++
    console.log(c1.test.id); // 1
    console.log(p1.test.id); // 1

    //  构造函数继承
    function Person(name) {
      this.name = name
    }
    Person.prototype.say = function() {
      console.log(this.name+'sayHi!');
    }

    function Child(name,age) {
      Person.call(this,name)
      this.age = age
    }
    const c1 = new Child('susa3n',18)
    console.log(c1); // Child { name: 'susa3n', age: 18 }
    console.log( c1.say); // undefined


    // 组合继承（原型链继承+构造函数继承）

    function Person(name) {
      this.name = name
    }
    Person.prototype.say = function() {
      console.log(this.name+'sayHi!');
    }

    function Child(name,age) {
      Person.call(this,name)
      this.age = age
    }
    Child.prototype = new Person()
    Child.prototype.constructor = Child  // 解决子类构造器的丢失 
    const c1 = new Child('susa3n',18)
    console.log(c1); // Child { name: 'susa3n', age: 18 }
    console.log( c1.say); // [Function (anonymous)]
    console.log(c1.constructor); // [Function: Child] 

```
### 闭包
  #### 闭包关键字
  - 闭包：是指有权访问另一个函数作用域中变量的函数（定义函数作用域和调用函数的作用域不同）
  - 创建条件：函数嵌套，内部函数引用外部函数的局部变量。
  - 作用：
    - 函数外部能够访问到函数内部的变量。可以通过外部调用闭包函数，从而在外部访问到函数内部的变量，可以使用这种方法创建私有变量
    - 能使已经运行结束的函数上下文中的变量对象留在内存中，因为闭包函数保留了这个变量对象的引用，所以这个变量对象不会回收（延长外部函数变量对象的生命周期）
  - 缺点：
    - 创建的变量不会回收，容易消耗内存，使用不当会导致内存溢出
```javascript
function out() {
  let i = 0 
  function inner() {
    return ++i
  }
  return inner
}
const inner = out()


// 对已经运行结束的函数上下文中的变量对象继续留在内存中。因为闭包函数保留了这个变量对象的引用，所以这个变量对象不会回收
let id = 0
function Dep() {
  this.id = ++id
}
function defineReactive(target,key,value) {
  const dep = new Dep()
  Object.defineProperty(target,key,{
    get() {
      console.log(dep,`读取当前${key}做些什么`);
      return value
    },
    set(val) {
      console.log(dep,`设置当前${key}做些什么`);
      value = val
    }
  })
}
let obj = {}
defineReactive(obj,'a','aaaaaa')
setTimeout(() => {
  console.log(obj.a);
}, 1000);

setTimeout(() => {
  obj.a = 'bbbbbb'
}, 2000);

setTimeout(() => {
  console.log(obj.a);
}, 3000);
```

### 时间循环机制eventLoop
  #### 栈、队列的理解
  - 栈: 栈中的任务后进先出，JS中的执行栈是一个存储函数的栈结构，栈中的任务执行遵循先进后出的原则
  - 队列：队列中的任务先进先出，js运行时创建一个任务队列，用来处理列表（事件）和待执行的回调函数
  #### 同步任务、异步任务
  - 同步任务：在主线程上排队执行的任务，只有前一个任务执行完毕，才能执行后一个任务
  - 异步任务：不进入主线程，而进入任务队列中的任务，只有任务队列通知主线程，某个异步任务可以执行了，这个任务才会进入主线程执行。
  #### 任务队列
  - 任务队列分为两种：宏任务和微任务
    - 宏任务：script( 整体代码)、setTimeout、setInterval
    - 微任务：Promise、MutaionObserver、
    - 执行顺序先微后宏，执行宏任务前先清空微任务
  #### eventLoop轮询机制
  1. js任务都是在主线程执行
  2. 当开启一个异步任务时会交给对应的管理模块去管理
  3. 主线程继续执行后续任务
  4. 管理模块接管对应的回调，会在恰当的时机将回调放入任务队列中
  5. 当主线程任务执行完毕，会通过轮询的方式询问任务队列是否有待执行的回调
  6. 如果有放入主线程中执行，如果没有继续轮询
### 变量提升
  1. JS引擎在JS代码正式执行之前都会做预解析工作
  2. 找关键字：var、function
  3. 找到var以后将var后边的变量体检声明，但不赋值
  4. 找个function以后定义函数，也就是说函数在预解析时已经定义完毕
### 作用域、作用域链
  #### 作用域
  - 用来决定代码执行的范围，变量的所属范围，主要作用隔离变量。作用域是代码在定义时决定的，分为全局作用域和函数作用域
    1. 全局作用域：
       1. 最外层函数和最外层定义的变量属于全局作用域
       2. window对象所有属性都属于全局作用域
       3. 过多的全局作用域变量会导致变量全局污染
    2. 函数作用域：
       1. 函数作用域声明在函数内部的变量
       2. 作用域是分层的，内层作用域可以访问外层作用域  
    3. 块级作用域：
       1. 使用Es6中let和const指令声明块级作用域。也可以用`{}`包裹的代码
       2. 在循环中比较适合绑定块级作用域。这样就可以把声明的计数器变量限制在循环内部
  #### 作用域链
  - 执行代码，在当前的作用域中查找变量，如果没找到，会依次向上一层作用域进行查找，直到全局作用域。这个查找的过程被称为作用域链。

### 执行上下文
  - 理解：执行上下文是一个抽象的概念，代表了代码的执行环境，包含：执行环境，变量对象，this，作用域链
  - 流程：
    - Js引擎在Js代码正式执行之前先创建一个执行环境
    - 进入该环境以后创建一个变量对象，该对象用于收集当前环境下：变量、函数、函数的参数、this
      - 变量提升 函数提升的工作
    - 确认this指向
    - 创建作用域链
  - 重点：执行上下文是动态的，每调用一次函数就会创建一个执行上下文，函数执行完毕，销毁当前执行上下文
### 深浅拷贝
  #### 浅拷贝
  - 概念：将一个对象的属性值复制到另一个对象，如果的属性值是引用数据类型，会将引用数据类型的地址复制给新对象。两个对象引用同一个地址
  #### 深拷贝
  - 概念：深拷贝针对浅拷贝而言，如果遇属性值是引用数据类型，新对象会新建一个地址并将对应的值复制给它
```javascript
    function clone(target) {
      if(Array.isArray(target)) {
        // return [].concat(target)
        // return [...target]
        // return target.map(item => item)
        // return target.reduce((pre,cur) => {
        //   pre.push(cur)
        //   return pre
        // },[])
        // return target.filter(item => true)
        return target.slice()
      }else if(typeof target == 'object') {
        // return {...target}
        let obj = {}
        target.entries(target).forEach(([key,value]) => {
          obj[key] = value
        })
        return obj
      }else {
        return target
      }
    }


    let arr = [{a:'1'},2,3]
    let cloneArr = clone(arr)
    console.log(cloneArr); // [ { a: '1' }, 2, 3 ]
    cloneArr[0].a = 2 // 引用类型数据 发生修改
    console.log(cloneArr,arr); // [ { a: 2 }, 2, 3 ] [ { a: 2 }, 2, 3 ]



    // 使用JSON 进行深克隆 函数类型数据会丢失,引用数据类型修改 不会影响到clone后的结果
    function deepClone1(target) {
      return JSON.parse(JSON.stringify(target))
    }

    let arr = [{a:'1'},2,3,function() {},  ,]
    let cloneArr = deepClone1(arr)
    arr[0].a = 3 // 引用类型发生更改
    console.log(arr); // [ { a: 3 }, 2, 3, [Function (anonymous)], <1 empty item> ]
    console.log(cloneArr);  // [ { a: '1' }, 2, 3, null, null ]

    let obj = {a:1,test:() => {},b:{b1:2}}
    let cloneObj = deepClone1(obj)
    obj.a = 2
    console.log(cloneObj); // { a: 1, b: { b1: 2 } }


    // 函数类型数据未丢失，但是会出现循环引用引起爆栈
    function deepClone2(target) {
      if((typeof target == 'object' && target != null) || target instanceof Array) {
        let result = Array.isArray(target) ? [] : {}
        for (const key in target) {
          if (Object.hasOwnProperty.call(target, key)) {
            const value = deepClone2(target[key]);
            result[key] = value
          }
        }
        return result
      }else {
        return target
      }
    }

    let obj = {a:1,b:[1,2,3],test:() => {},c:{a:1}}
    console.log(obj); // { a: 1, b: [ 1, 2, 3 ], test: [Function: test], c: { a: 1 } }
    let cloneObj = deepClone2(obj)
    cloneObj.c.a = 2 // 修改引用类型数据
    console.log(cloneObj,obj); // { a: 1, b: [ 1, 2, 3 ], test: [Function: test], c: { a: 2 } } { a: 1, b: [ 1, 2, 3 ], test: [Function: test], c: { a: 1 } }

    let obj = {a:1}
    obj.obj1 = obj // 循环引用引起爆栈
    let newObj = deepClone2(obj) // RangeError: Maximum call stack size exceeded

    // 解决循环引用引起的爆栈
    function deepClone3(target,map = new Map()) {
      if((typeof target == 'object' && target != null)) {
        let cloneTarget = map.get(target)
        if(cloneTarget) {
          return cloneTarget
        }
        cloneTarget = target instanceof Array ? [] : {}
        map.set(target,cloneTarget)
        for (const key in target) {
          if (Object.hasOwnProperty.call(target, key)) {
            cloneTarget[key] = deepClone3(target[key],map);
          }
        }
        return cloneTarget
      }else {
        return target
      }
    }

    let obj = {a:1}
    obj.obj1 = obj // 循环引用引起爆栈
    let newObj = deepClone3(obj) // RangeError: Maximum call stack size exceeded
    console.log(newObj); // { a: 1, obj1: <ref *1> { a: 1, obj1: [Circular *1] } }
```
### 防抖节流函数
  #### 防抖函数
  - 概念：在函数需要频繁触发时，在规定时间内，只让最后一次生效，前面的都不生效
  - 实现：
  - 应用：搜索框中，输入文字后再触发对应函数
  #### 节流函数
  - 概念：在函数需要频繁触发时，设定一个特定的时间，在此时间内只执行一次
  - 实现： 
  - 应用：鼠标滑轮滚动，每隔两秒打印一次
```javascript
    function debounce(fn, delay) {
      return function (event) {
        const context = this
        if (fn.hasOwnProperty('callback')) {
          clearTimeout(fn.callback)
        }
        fn.callback = setTimeout(() => {
          fn.apply(context,arguments)
          delete fn.callback
        }, delay);
      }
    }


    function throttle(fn,delay) {
      let pre = 0
      return function(){
        const context = this
        let cur = Date.now()
        if(cur - pre >= delay) {
          fn.apply(context,arguments)
          pre = cur
        }else {
          return 
        }
      }
    }
```