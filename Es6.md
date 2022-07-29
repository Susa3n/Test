#### let、const、var的区别
  - 块级作用域：块级作用域由`{}`包括，let和const都具有块级作用域，var不存在块级作用域
  - 变量提升：var存在变量提升，let和const都不存在变量提升（存在暂时性死区），在声明钱前使用报错提示未初始化
  - 给全局添加属性：在全局作用域下声明变量var会将当前变量添加到全局对象上，let、const不会
  - 重复声明： var声明变量时可以重复声明，const和let不可以
  - 初始值设置：在变量声明时，let和var都可以声明但不赋值，const不可以
  - 指针指向：let和var声明后指针指向都可以进行修改，const 不能修改指针指向
    - 总结：
      1. Es6中let、const都是更完美的var，不是全局变量，具有块级作用域，不会发生变量提升，如果在声明前使用会报错。
      2. const定义常量，不能重新赋值，如果值是一个引用数据类型可以修改引用数据类型里边的属性值。
      3. let和const声明的变量都不能挂到全局对象上，不能通过window.变量名进行访问
#### 箭头函数与普通函数的区别
  - 箭头函数和普通函数更简洁
  - 箭头函数的this，它的this会继承外部函数的this。不能通过call、apply、bind修改this的指向
  - 箭头函数没有arguments对象，可以用剩余运算符代替arguments
  - 箭头函数不能作为构造函数使用，它没有Prototype属性，没有原型对象
#### 模板字符串
#### 剩余运算符
#### 解构赋值
#### 形参默认值
#### set和map
  ##### set
  - 创建： new Set()
  - add(value)：添加某个值，返回set结构本身
  - delete(value)：删除某个值
  - has(value)：返回一个布尔值，判断参数是否是set成员
  - clear()：清除所有成员，没有返回值
  - 总结：Set本身是一个构造函数，返回一个set的实例，它类似于数组（伪数组），允许存储任何类型的值，无论是基本数据类型还是引用数据类型，但是成员值都是唯一的
  ##### map
  - 创建：new Map()
  - get(key)：通过键去map中查询值并返回
  - set(key,val)：向Map中添加新元素
  - has(key)：返回布尔值，判断Map对象中是否有key所对应的值
  - delete(key)：通过键从map中移除对应数据
  - clear()：将这个map实例清空所有的元素
    - 区别
      - map是一种键值对集合，和对象不同的是，键可以是任意值，对象的键只能是字符串
```javascript
  let mapObj = new Map()
    mapObj.set('a','111')
    let obj = {}
    mapObj.set(obj,'obj')

    console.log(mapObj.get('a')); // map中获取键a的值 111
    console.log(mapObj.has(obj)); // 判断键obj是否在当前map中  true
    console.log(mapObj); // Map(2) { 'a' => '111', {} => 'obj' }


    mapObj.delete(obj) // map中删除键obj的数据
    console.log(mapObj); // Map(1) { 'a' => '111' }

    mapObj.clear() // map清空所有数据
    console.log(mapObj); // Map(0) {}


    let setArr = new Set([1,2,3,1,1,1])
    setArr.add(4) // set中添加数据
    console.log(setArr.has(1)); // 判断set中是否有1
    console.log(setArr); // Set(4) { 1, 2, 3, 4 }
    setArr.clear() // 清空set中数据
    console.log(setArr); // Set(0) {}
  ```
#### Class
  - 基本使用
  - 相对构造函数、原型、继承更接近传统语法，它的写法能够让对象原型的写法更加清晰、面向对象编程的语法更加通俗
```javascript
    class Person {
      age = '18' // 属性
      constructor(name) { // 构造器
        this.name = name
      }

      sayHi() { // 原型上的方法
        console.log(this.name+'sayHi!');
      }

      static test () { // 类上的方法  相当于 Person.test = function() {}
        console.log('1111');
      }

      get age() { // getter
        return this._age
      }

      set age(value) { // setter
        this.age = value
      }
    }
    Person.test()
    const p1 = new Person('susa3n')
    console.log(p1,p1.age,p1.name); // Person { age: '18', name: 'susa3n' } 18 susa3n
    console.log(p1.age); // 18
    p1.age = 19
    console.log(p1.age); // 19
```
#### Promise
  - 理解：从语法上是一个构造函数，从功能上封装一个异步操作并可以获取成功或者失败的值。是异步编程的解决方案，将异步操作通过以同步的流程表达出来，避免了回调地狱
  - 一个Promise实例有三种状态
    - pending 初始化状态
    - fulfilled 成功状态
    - rejected 失败状态
    - 状态的改变只有两种可能,一个promise状态只能更改一次
      - pending -> fulfilled 
      - pending -> rejected
  - Promise构造函数接收一个执行器函数，执行器函数默认接收两个回调函数作为参数（resolve、reject）
    - resolve的作用是更改当前promise的状态为fulfilled，在异步操作成功时调用，并将异步结果返回，作为参数传递出去
    - reject的作用更改当前promise的状态为rejected,在异步操作失败时调用，将异步操作失败的原因，作为参数传递出去
  - Promise的关键问题
    - 改变Promise实例的状态和指定回调函数谁先谁后？
      - 都有可能，一般是先指定回调函数再改变Promise的状态，也可以先改变Promise实例的状态后调用回调函数
    - 如何先改变状态后指定回调函数？
      - 在执行器函数中直接调用resolve或者reject，或者延迟更久的时间指定回调函数
    - 什么时候可以拿到数据？
      - 如果先改变状态，当指定回调函数时就会拿到返回的结果
      - 如果是先指定回调函数，当调用resolve或者reject时就会拿到返回的结果
    - promise.then返回的新的promise的状态由什么决定？
      - 由then()指定的回调函数决定
        - 如果回调函数的返回结果是普通值，新的promise的状态为fulfilled
        - 如果在执行回调函数时抛出错误，新promise的状态为rejected
        - 如果返回一个新的promise实例，由返回新的promise的实例决定promise的状态
  - Promsie实例方法
    - promise.then()对应resolve成功的处理
    - promise.catch()对应reject失败的处理
    - promise.all()接受参数多个Promise的实例封装成的数组，返回一个新的Promise实例对象,当数组中所有的实例状态都为fulfiled的时候，才会调用实例对象执行器函数中的resolve参数，如果有一个失败就调用实例对象执行器函数的reject参数
    - promise.rece()接受参数多个Promise的实例封装成的数组，返回一个新的Promise实例对象,当数组中某个实例首先变为fulfiled状态，就会调用新的实例对象执行器函数中的resolve参数，如果都失败了调用执行函数中的reject参数
  - 总结：Promise是一个构造函数，接收一个执行器函数作为参数。一个Promise实例有三种状态，pending、fulfilled、rejected，分别代表了初始化状态，成功和失败。状态只能从初始化状态到成功或者失败，而且状态一旦改变，就无法再改变了。状态的改变是通过调用执行器函数中参数（resolve,reject）来实现的。再将异步操作结束后结果调用这两个函数作为参数改变当前promise的状态。它在原型上定义了then方法，使用这个then方法可以为两个状态的改变注册回调函数，这个回调函数是微任务，会在同步任务执行完毕后再执行
```javaScript
const PENDING = 'pending'
const FULFILLED = 'fulfilled'
const REJECTED = 'rejected'


function resolveCallback(p2, x, resolve, reject) {
  if (p2 == x) {
    reject('递归错误')
  }
  let called = false
  if ((typeof x == 'object' && x != null) || typeof x == 'function') {
    if (x instanceof Promise) { // 如果是promise实例
      try {
        let then = x.then
        then.call(x, (y) => {
          if (called == true) return
          called = true
          resolveCallback(p2, y, resolve, reject) // 递归调用resolve
        }, r => {
          if (called == true) return
          called = true
          reject(r)
        })
      } catch (error) {
        if (called == true) return
        called = true
        reject(error)
      }
    } else { // 普通对象
      if (called == true) return
      called = true
      resolve(x)
    }
  } else { // 普通值
    resolve(x)
  }
}
class Promise {
  constructor(execute) {
    this.value = undefined
    this.state = PENDING
    this.onResolveCallbacks = []
    this.onRejectCallbacks = []
    const resolve = (value) => {
      if (this.state != PENDING) return
      this.state = FULFILLED
      this.value = value
      this.onResolveCallbacks.forEach(cb => cb())
    }

    const reject = (reason) => {
      if (this.state != PENDING) return
      this.state = REJECTED
      this.value = reason
      this.onRejectCallbacks.forEach(cb => cb())
    }

    try {
      execute(resolve, reject)
    } catch (error) {
      reject(error)
    }
  }

  then(onResolved, onRejected) {
    onResolved = typeof onResolved == 'function' ? onResolved : val => val
    onRejected = typeof onRejected == 'function' ? onRejected : error => { throw error }
    const p2 = new Promise((resolve, reject) => {
      if (this.state == FULFILLED) {
        setTimeout(() => {
          try {
            const x = onResolved(this.value)
            resolveCallback(p2, x, resolve, reject)
          } catch (error) {
            reject(error)
          }
        });
      }

      if (this.state == REJECTED) {
        setTimeout(() => {
          try {
            const x = onRejected(this.value)
            resolveCallback(p2, x, resolve, reject)
          } catch (error) {
            reject(error)
          }
        });
      }

      if (this.state == PENDING) {
        this.onResolveCallbacks.push(() => {
          setTimeout(() => {
            try {
              const x = onResolved(this.value)
              resolveCallback(p2, x, resolve, reject)
            } catch (error) {
              reject(error)
            }
          });
        })
        this.onRejectCallbacks.push(() => {
          setTimeout(() => {
            try {
              const x = onRejected(this.value)
              resolveCallback(p2, x, resolve, reject)
            } catch (error) {
              reject(error)
            }
          });
        })
      }
    })
    return p2

  }


  catch(cb) {
    return this.then(undefined, cb)
  }

  static resolve(value) {
    return new Promise((resolve, reject) => {
      resolve(value)
    })
  }

  static reject(reason) {
    return new Promise((resolve, reject) => {
      reject(reason)
    })
  }

  static all(PromiseList) {
    return new Promise((resolve, reject) => {
      let result = []
      let id = 0
      function resultCallback(value, i) {
        ++id
        result[i] = value
        if (id == PromiseList.length) {
          resolve(result)
        }
      }
      PromiseList.forEach((p, i) => {
        if (p instanceof Promise) {
          try {
            p.then(res => {
              resultCallback(res, i)
            },err => {
              reject(err)
            })
          } catch (error) {
            reject(error)
          }
        } else {
          resultCallback(p, i)
        }
      })
    })
  }


  static race(PromiseList) {
    return new Promise((resolve,reject) => {
      PromiseList.forEach((p,i) => {
        if(p instanceof Promise) {
          try {
            p.then(res => {
              resolve(res)
            },error => {
              reject(error)
            })
          } catch (error) {
            reject(error)
          }
        }else {
          resolve(p)
        }
      })
    })
  }
}

```

####  Es6导入导出和CommonJS
- CommonJS模块输出的值的拷贝，ES6模块输出的值的引用
  - CommonJS输出的值的拷贝，第一次加载模块时会缓存该模块，并且加载该模块时，即使改变输入的值，也不会对原模块内部的变量造成影响
  - ES6模块输出的值的引用，引入该模块修改输入的变量时，会对原模块内部的变量有影响。
- CommonJS模块是运行时加载，只有执行到require时才会加载该模块，而import引入ES6模块是在编译阶段执行，在代码执行之前就已经拿到输入的变量
- CommonJS模块的require是同步在家模块，Es6模块的import命令是异步加载，有一个独立的模块依赖的解析阶段
- ES6动态加载 import('path')，参数接收一个路径，返回的是一个promise的实例，可以通过.then拿到引入的模块的值
- 适用场景：  
  - 按需加载:可能点击某个按钮之后触发函数，加载模块
  - 条件加载:可以放到if代码块中，根据不同的情况加载不同的模块
  - 动态路径加载:import('')传入的路径可以是动态的，根据函数返回路径
```javascript
// 按需加载
button.addEventListener('click', event => {
  import('./dialogBox.js')
  .then(dialogBox => {
    dialogBox.open();
  })
  .catch(error => {
    /* Error handling */
  })
});

// 条件加载
if (condition) {
  import('moduleA').then(...);
} else {
  import('moduleB').then(...);
}

// 动态加载
import(f())
.then(...);
```