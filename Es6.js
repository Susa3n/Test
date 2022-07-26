// set map
/**
 * let mapObj = new Map()
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
 */

// class MyClass {
//   prop = value; // 属性

//   constructor(...) { // 构造器
//     // ...
//   }

//   method(...) {} // method

//   get something(...) {} // getter 方法
//   set something(...) {} // setter 方法

// }


// class
/**
 * class Person {
  age = '18' // 属性
  constructor(name) { // 构造器
    this.name = name
  }

  sayHi() { // 原型上的方法
    console.log(this.name+'sayHi!');
  }

  static test () { // 类上的方法  相当于 Person.test = function() {}
    console.log(this);
  }
  static age =  19

  get age() { // getter
    return this._age
  }

  set age(value) { // setter
    this.age = value
  }
}


class Child extends Person {  // 继承
  // 如果子类没有构造器
      // 子类默认构造器
      // constructor (...arguments) {
      //   super(...arguments)
      // }
  // 如果有子类构造器,在子类构造器中需要在this前调用super()并传参父类构造器使用
  constructor(name,age) {
    super(name)
    this.age = age
  }

  eat() {
    console.log(this.name + 'eat!');
  }
}

const baby = new Child('baby',3)

console.log(baby); // Child { age: 3, name: 'baby' }
// baby.eat()
Child.test() // 子类继承父类静态属性及原型对象上的属性或方法
 */

// Promise
/*

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


const p1 = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve('1')
  }, 1500);
})
Promise.race([new Promise((resolve, reject) => {
  throw new Error('2121')
}), Promise.resolve('2')]).then(result => {
  console.log(result);
},error => {
  console.log(error,2222222222);
})



p1.then(res => {
  // return Promise.resolve('111111')
  return Promise.reject('222222')
}).then(res => {
  console.log(res);
}).catch(error => {
  console.log(error,222);
})

const p2 = p1.then(result => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // resolve(result + '2')
      reject('new Error')
    }, 300);
  })
}, err => {
  console.log(err);
})

p2.then(result => {
  return new Promise((resolve,reject) => {
    setTimeout(() => {
      resolve('3')
    }, 1000);
  })
}).then().then().then(res => {
  console.log(res);
}).catch(error => {
  console.log(error,4);
})
*/
s