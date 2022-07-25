// 原型对象
/**
 * function Person(name,age) {
      this.name = name
      this.age = age
    }
    Person.prototype.say = function() {
      console.log(this.name+'sayHi!');
    }
    class Person {
      constructor(name,age) {
        this.name = name
        this.age = age
      }

      say() {
        console.log(this.name+'sayHi!');
      }
    }

    let p1 = new Person('susa3n',18)
    console.log(p1);
    p1.say() // 实例对象调用原型上的方法
    console.log(p1.__proto__); // 隐式原型对象
    console.log(Person.prototype); // 显式原型对象
    console.log(Person.prototype == p1.__proto__); // 显式原型对象 === 隐式原型对象
    console.log(Person.prototype.constructor == Person); // 原型对象上的constructor属性  === 构造函数

 */

// 原型链
/**
 *   function Person() {
        this.test1 = function() {
          console.log('test1');
        }
      }

      Person.prototype.test2 = function() {
        console.log('test2');
      }
      const p1 = new Person()
      p1.test1()
      p1.test2()


      p1.toString()
 */

// 继承
/**
 * // 原型链继承
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

 function create(obj) {
  // 创建一个空的的构造函数
    function F() {};
    
    // 将空的构造函数原型指向传递进来的对象
    F.prototype = obj;
    
    // 返回一个实例对象
    return new F();
  }


  const obj = {
    name: 'zs',
  };

const newObj1 = create(obj);
const newObj2 = create(obj);
console.log(newObj1);

 */


//  call apply bind的实现
/**
 * 
const obj = {
 name:'obj',
 sum:function (a,b) {
   console.log(this);
   return a+b
 }
}
// console.log(obj.sum(1,2)); { sum: [Function: sum] } 3
const newObj = {name: 'newObj'}
Function.prototype.call= function(obj,...args) {
 obj.callback = this
 const result = obj.callback(...args)
 delete obj.callback
 return result
}
// obj对象中sum方法 被newObj调用 函数的this还是newObj
// console.log(obj.sum.call(newObj,2,4)); // { name: 'newObj' } 6

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
 */


// instanceof
/**
 * let arr = []
  function Person() {
  }

  const p1 = new Person()

  function myInstanceof(left,right) {
    let proto = left.__proto__
    while(proto !== null){
      if(proto == right.prototype) {
        return true
      }
      proto = proto.__proto__
    }
    return false
  }

  console.log(myInstanceof(arr,Array)); // true
  console.log(myInstanceof(p1,Person)); // true
 */

// new 关键字
/**
 * 
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
 */

// 闭包： 指有权访问另一个函数作用域变量的函数（函数定义的作用域和调用的作用域不在同一个作用域）
/**
// 从函数外部调用闭包函数能够访问函数内部的局部变量 从而创建一个私有变量
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
 */


// 防抖
/**
 * function debounce(fn,delay) {
  return function() {
    const context = this
    const args = arguments
    if(fn.hasOwnProperty('cb')){
      clearTimeout(fn.cb)
    }
    fn.cb = setTimeout(() => {
      fn.call(context,...args)
    }, delay);
  }
}




function throttle(fn,delay) {
  let pre = 0
  return function(){
    const context = this
    const args = arguments
    let cur = Date.now()
    if(cur - pre >= delay) {
      fn.call(context,arguments)
    }else {
      console.log(1);
      return 
    }
  }
}

function test() {
  console.log(1);
}

 */

// 深浅拷贝
/**
 * function clone(target) {
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
 */

// 事件轮询机制
