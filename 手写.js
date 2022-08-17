/**
 * 
 * create
 * function myCreate(obj) {
    function A() {}
    A.prototype = obj
    return new A()
  }


  const obj = {a:111}

  let newObj = myCreate(obj)
  console.log(newObj.__proto__);
 */

/**
 * 
 *  myInstanceof
 * function myInstanceof(left,right) {
  let proto = left.__proto__
  while(proto) {
    if(proto == right.prototype) {
      return true
    }
    proto = proto.__proto__
  }
  return false
}
class A {}
const a = new A()
console.log(myInstanceof(a,A));
 */


/**
 * 
 * new
 * function myNew(Fn,...argus) {
  let obj = Object.create(Fn.prototype)
  Fn.call(obj,...argus)
  return obj
}
function A(name,age) {
  this.name = name
  this.age = age
}
A.prototype.say = function() {
  console.log('say Hi!');
}
const susa3n = myNew(A,'sau3n','15')
console.log(susa3n);
susa3n.say()
 */

/**
 * 
 * 
 * const PENDING = 'pending'
const FUlFILLED = 'fulfilled'
const REJECTED = 'rejected'


function resolveCallback(p2, x, resolve, reject) {
  if (p2 == x) {
    reject('递归错误')
  }
  let called = false
  if ((typeof x == 'object' && x != null) || typeof x == 'function') {
    if (x instanceof Promise) {
      try {
        let then = x.then
        then.call(x, y => {
          if (called == true) return
          called = true
          resolveCallback(p2, y, resolve, reject)
        }, r => {
          if (called == true) return
          called = true
          resolveCallback(p2, r, resolve, reject)
        })
      } catch (error) {
        if (called == true) return
        called = true
        reject(error)
      }
    } else {
      if (called == true) return
      called = true
      resolve(x)
    }
  } else {
    resolve(x)
  }
}


class Promise {
  constructor(executor) {
    this.state = PENDING
    this.value = undefined
    this.onResolvedCallbacks = []
    this.onRejectedCallbacks = []



    const resolve = (value) => {
      this.state != PENDING return
      this.state = FUlFILLED
      this.value = value
      this.onResolvedCallbacks.forEach(cb => cb())
    }

    const reject = (reason) => {
      this.state != PENDING return
      this.state = REJECTED
      this.value = reason
      this.onRejectedCallbacks.forEach(cb => cb())
    }

    try {
      executor(resolve, reject)
    } catch (error) {
      reject(error)
    }
  }

  then(onResolved, onRejected) {
    onResolved = typeof onResolved == 'function' ? onResolved : val => val
    onRejected = typeof onRejected == 'function' ? onRejected : reason => { throw reason }
    const p2 = new Promise((resolve, reject) => {
      if (this.state == FUlFILLED) {
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
          setTimeout(() => {
            try {
              const x = onRejected(this.value)
              resolveCallback(p2, x, resolve, reject)
            } catch (error) {
              reject(error)
            }
          });
        });
      }

      if (this.state == PENDING) {
        this.onResolvedCallbacks.push(() => {
          setTimeout(() => {
            try {
              const x = onResolved(this.value)
              resolveCallback(p2, x, resolve, reject)
            } catch (error) {
              reject(error)
            }
          });
        })
        this.onResolvedCallbacks.push(() => {
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


  catch(onRejected) {
    return this.then(undefined,onRejected)
  }

  static reasolve(value) {
    return new Promise((resolve,reject) => {
      resolve(value)
    })
  }

  static reject(reason) {
    return new Promise((resolve,reject) => {
      reject(reason)
    })
  }


  all(promiseList) {
    return new Promise((resolve,reject) => {
      let i = 0
      let result = []
      function collectValue(value,index) {
        ++i
        result[index] = value
        if(i == Promise.length) {
          resolve(reslut)
        }
      }
      for (let i = 0; i < promiseList.length; i++) {
        const p = promiseList[i];
        if(p instanceof Promise) {
          try {
            p.then((value) => {
              collectValue(value,i)
            },reason => {
              reject(reason)
            })
          } catch (error) {
            reject(reason)
          }
        }else {
          collectValue(p,i)
        }
        
      }
    })
  }


  race(promiseList) {
    return new Promise((resolve,reject) => {
      promiseList.forEach(p => {
        if(p instanceof Promise) {
          try {
            p.then(value => {
              resolve(value)
            },reason => {
              reject(reason)
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
 */

/**
 * 
function debouce(fn,delay) {
  return function() {
    const self = this,argus = arguments
    if(fn.hasOwnProperty('timer')){
      clearTimeout(fn.timer)
    }
    fn.timer = setTimeout(() => {
      fn.apply(self,argus)
    }, delay);
  }
}


function throttle(fn,delay) {
  let pre = 0
  return function(event) {
    const self = this,argus = arguments
    let cur = new Date()
    if(cur - pre > delay){
      fn.apply(self,argus)
      pre = cur      
    }
  }
}
 */
// function fn() {}
// console.log(Object.prototype.toString.call(2));

/**
 * Function.prototype.call = function(obj,...argument) {
  if(!obj) obj = window
  obj.fn = this
  const result = obj.fn(...argument)
  delete obj.fn
  return result
}

Function.prototype.apply = function(obj,argument) {
  if(!obj) obj = window
  obj.fn = this
  const result = obj.fn(...argument)
  delete obj.fn
  return result
}


Function.prototype.bind = function(obj,..argus1) {
  const self = this
  return function(...argus2) {
    const result = self.call(obj,...argus1,...argus2)
    return result
  }
}
 */


function clone1(target) {
  if((typeof target == 'object' && target != null)){
    if(Array.isArray(target)){
      // return target.map(item => item)
      // return target.filter(item => true)
      // return [].concat(target)
      // return target.reduce((p,c)=> {
      //   p.push(c)
      //   return p
      // },[])
      // return [...target]
      return target.slice()
    }else {
      return {...target}
    }
  }else {
    return target
  }
}
function deepClone1(target) {
  return JSON.parse(JSON.stringify(target))
}

function deepClone2(target) {
  if((typeof target == 'object' && target != null) || typeof target == 'function'){
    let cloneTarget = Array.isArray(target) ? [] : {}
    for (const key in target) {
        const value = target[key];
        cloneTarget[key] = deepClone2(value)
      }
    } 
    return cloneTarget
  }else {
    return target
  }
}

function deepClone3(target,map = new Map()) {
  if((typeof target == 'object' && target != null) || typeof target == 'function'){
    let cloneTarget = map.get(target)
    if(cloneTarget) {
      return cloneTarget
    }
    cloneTarget = Array.isArray(target) ? [] : {}
    for (const key in target) {
        const value = target[key];
        cloneTarget[key] = deepClone2(value,map)
      }
    } 
    return cloneTarget
  }else {
    return target
  }
}