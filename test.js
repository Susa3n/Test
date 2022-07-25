
// 都是函数原型上的方法，能使任意对象上的方法被指定对象所调用。改变函数的this指向
// call/apply 执行函数且将函数的this指向为传入的第一个参数
// bind 返回一个新函数新函数的内部会调用原来的函数 且将函数的this指向为传入的第一个参数
/**
 * function sum(a,b) {
  console.log(this);
  return a + b
}


Function.prototype.call = function(obj,...args) {
  obj.callback = this
  const result = obj.callback(...args)
  delete obj.callback
  return result
}
Function.prototype.apply = function(obj,args) {
  obj.callback = this
  const result = obj.callback(...args)
  delete obj.callback
  return result
}

Function.prototype.bind = function(obj,...args1) {
  const callback = this
  return function(...args2) {
    const result = callback.call(obj,...args1,...args2)
    return result
  }
}
let cat = {
  name:'猫'
}

console.log(sum.bind(cat,1,2)());
console.log(sum(1,2));
 */


/**
 * function myInstanceof(left,right) {
  let protoObject = left.__proto__
  while(protoObject) {
    if(protoObject == right.prototype) {
      return true
    }
    protoObject = protoObject.__proto__
  }  
  return false
}



function Person(name,age) {
  this.name = name
  this.age = age
}

console.log(new Person('susa3n',18));

function myNew(Fn,...args) {
  let obj = {}
  obj.__proto__ = Fn.prototype
  Fn.call(obj,...args)

  return obj
}
console.log(myNew(Person,'susa3n',18));

 */

// 闭包
// 指有权访问另一函数作用域中变量的函数（定义函数和调用函数不在同一作用域）
// 函数嵌套内部函数引用外部函数的局部变量
// 可以在函数外部访问函数内部声明的变量。通过调用在外部闭包函数，从而实现在函数外部访问函数内部声明的变量。使用这种方法可以创建私有变量
// 可以使已经运行结束的函数上下文中的变量对象保留在内存中，因为闭包函数保留了这个变量对象的引用，所以才不会进行回收（延长了函数内部变量对象的生命周期）


/**
 * function fn() {
  let id = 0
  return function() {
    return id
  } 
}

const bar = fn()
// console.log(bar());
let id = 0
function Dep() {
  this.id = id++
}
function defineReactive(target,key,value) {
  const dep = new Dep()

  Object.defineProperty(target,key,{
    get() {
      console.log('读取',dep);
      return value
    },
    set(val) {

      console.log('写入',dep);

    }
  })
}
let obj = {}

defineReactive(obj,'a',1)
obj.a
obj.a = 2
obj.a
 */

/**
 * 
 * // 浅拷贝: 将一个对象的属性值复制给另一个对象，如果属性值是引用数据类型，会将这个引用数据类型的地址赋值给新对象。两个对象的属性值引用同一个地址
// 深拷贝：对于浅拷贝而言 如果数据类型是引用数据类型，新对象会新建一个地址且赋值

// function clone(target) {
//   if(Array.isArray(target)) {
//     // return [...target]
//     // return target.map(item => item)
//     // return target.filter(item => true)
//     // return target.slice()
//     // return [].concat(target)
//     return target.reduce((pre,cur) => {
//       return pre.push(cur)
//     },[])
//   }else if(tyof target == 'object' || target !== null){
//     return {...target}
//   }else {
//     return target
//   }

// }


function deepClone1(target) {
  return JSON.parse(JSON.stringify(target))
}

function deepClone2(target) {
  if((typeof target == 'object' && target != null) || Array.isArray(target)) {
    const cloneTarget = Array.isArray(target) ? [] : {}
    for (const key in target) {
      if (Object.hasOwnProperty.call(target, key)) {
        const value = target[key];
        cloneTarget[key] = deepClone2(value)
      }
    }
    return cloneTarget
  }else {
    return target
  }
}


// let obj = [1,2,3,function() {},{a:'1',test: {a:function() {}}}]
// console.log(obj);
// // console.log(deepClone1(obj));
// let newObj = deepClone2(obj) 
// newObj[4].a = 5
// console.log(newObj);
// console.log(obj);




function deepClone3(target,map = new Map()) {
  if((typeof target == 'object' && target != null) || Array.isArray(target)) {
    let cloneTarget = map.get(target)
    if(cloneTarget) {
      return cloneTarget
    }

    cloneTarget = Array.isArray(target) ? [] : {}
    map.set(target,cloneTarget)
    for (const key in target) {
      if (Object.hasOwnProperty.call(target, key)) {
        const value = target[key];
        cloneTarget[key] = deepClone3(value,map)
      }
    }
    return cloneTarget
  } else {
    return target
  }


}
let obj = {a:1}
obj.obj1 = obj
console.log(deepClone3(obj));
 */

/**
 * function debounce(fn,delay) {
  return function() {
    const context = this
    const args = arguments
    if(fn.hasOwnProperty('timer')) {
      clearTimeout(fn.timer)
    }
    fn.timer = setTimeout(() => {
      fn.call(context,...args)
    }, delay);
  }
}

function throttle(fn,delay) {
  let pre = Date.now()
  return function() {
    const context = this
    const args = arguments
    let cur = Date.now()
    if(cur - pre > delay) {
      fn.call(context,...args)
      pre = cur
    }
  }
}

function test () {
  console.log('1111');
}

debounce(test,2000)()
debounce(test,2000)()
debounce(test,2000)()
debounce(test,2000)()
 */

let PENDING = 'pending'
let FUIFILED = 'fulfilled'
let REJECTED = 'rejected'

function resolveCallback(p2, x, resolve, reject) {
  if (x == p2) {
    reject('递归错误')
  } else if ((typeof x == 'object' && x != null) || typeof x == 'function') {
    let called = false
    if (x instanceof Promise) {
      try {
        then = x.then
        then.call(x, (y) => {
          if (called) return
          called = true
          resolveCallback(p2, y, resolve, reject)
        }, (r) => {
          if (called) return
          called = true
          reject(r)
        })
      } catch (error) {
        if (called) return
        called = true
        reject(rerror)
      }
    } else {
      if (called) return
      called = true
      resolve(x) // 属于对象或者函数 但不是promise直接返回
    }
  } else {
    resolve(x) // 普通值进行返回
  }
}

class Promise {


  constructor(executor) {
    this.state = PENDING
    this.value = undefined
    this.onResolveCallback = []
    this.onRejectCallback = []


    const resolve = (value) => {
      if (this.state == PENDING) {
        this.value = value
        this.state = FUIFILED
        this.onResolveCallback.forEach(cb => cb())
      }
    }

    const reject = (reason) => {
      if (this.state == PENDING) {
        this.value = reason
        this.state = REJECTED
        this.onRejectCallback.forEach(cb => cb())
      }
    }

    try {
      executor(resolve, reject)
    } catch (error) {
      reject(error)
    }
  }


  then(onResolved, onRejected) {
    onResolved = typeof onResolved == 'function' ? onResolved : val => val
    onRejected = typeof onRejected == 'function' ? onRejected : error => { throw error }
    let p2 = new Promise((resolve, reject) => {
      if (this.state === FUIFILED) {
        setTimeout(() => {
          try {
            const x = onResolved(this.value)
            resolveCallback(p2, x, resolve, reject)
          } catch (error) {
            reject(error)
          }
        }, 0);
      }
      if (this.state === REJECTED) {
        setTimeout(() => {
          try {
            const x = onRejected(this.value)
            resolveCallback(p2, x, resolve, reject)
          } catch (error) {
            reject(error)
          }
        }, 0);
      }
      if (this.state === PENDING) {
        this.onResolveCallback.push(() => {
          setTimeout(() => {
            try {
              const x = onResolved(this.value)
              resolveCallback(p2, x, resolve, reject)
            } catch (error) {
              reject(error)
            }
          }, 0);
        })

        this.onRejectCallback.push(() => {
          setTimeout(() => {
            try {
              const x = onRejected(this.value)
              resolveCallback(p2, x, resolve, reject)
            } catch (error) {
              reject(error)
            }
          }, 0);
        })
      }



    })
    return p2
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
    let count = 0
    return new Promise((resolve, reject) => {
      let result = []
      function collectValue(value, index) {
        ++count
        result[index] = value
        if (count == PromiseList.length) {
          resolve(result)
        }
      }
      for (let i = 0; i < PromiseList.length; i++) {
        if (PromiseList[i] instanceof Promise) {
          try {
            PromiseList[i].then(result => {
              collectValue(result, i)
            }, err => {
              reject(err)
            })
          } catch (error) {
            reject(error)
          }
        } else {
          collectValue(PromiseList[i], i)
        }
      }
    })
  }

  static race(PromiseList) {
    return new Promise((resolve, reject) => {
      PromiseList.forEach((p, i) => {
        if (p instanceof Promise) {
          try {
            p.then(result => {
              resolve(result)
            }, err => {
              reject(err)
            })
          } catch (error) {
            reject(error)
          }
        } else {
          resolve(p)
        }
      })
    })
  }
}

// const p1 = new Promise((resolve, reject) => {
//   // setTimeout(() => {
//   resolve('2')
//   // }, 200);
// })
// p1.then((result) => {
//     throw new Error('xxxxx')
//     // console.log(result);
//     // return 'xxxxxxy'
// }, (error) => {
//   console.log(error);
// }).then().then(res => {
//   console.log(res);
// },err => {
//   console.log(err);
//   return 'mowei'
// }).then(res => {
//   console.log(res);
// })


Promise.race([Promise.reject('2'),new Promise((resolve,reject) => {
  setTimeout(() => {
    resolve('1')
  }, 200);
})]).then(result => {
  console.log(result);
}, err => {
  console.log(err,111111);
})


