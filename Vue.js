// 响应式数据原理
// Vue内部定义defineReactive方法借用了Object.defineProperty将data中的属性进行数据劫持，添加get和set，当用户取值时会做一些操作 比如依赖收集
// 设置值时做一些操作通知收集的依赖进行更新，但是也有一定的缺陷 因为Object.defineProperty只能对最外层数据进行收集，对于多层数据，需要进行递归劫持，
/**
 * let id = 0
class Dep {
  constructor() {
    this.id = id++
  }
}

let arrayMethods = Object.create(Array.prototype)

['push','shift','unshift','pop','sort','splice','reverse'].forEach(method => {
  arrayMethods[method] = function(...argus) {
    Array.prototype[method].call(this,...argus)
    let inserted;
    let ob = this.__ob__
    switch (method) {
      case 'push':
      case 'shift':
        inserted = args 
        break;
      case 'splice': // splice的第二个参数以后都为新增的数据
        inserted = args.slice(2)
        break;
      default:
        break;
    }
    if(inserted) ob.observerArray(inserted)
    ob.dep.notify()
  }


})

function observe(data) {
  if (typeof data != 'object' && data != null) {
    return
  }

  if (data.__ob__) {
    return data.__ob__
  }
  return new Observer(data)
}

class Observer {
  constructor(data) {
    let dep = new Dep()
    Object.defineProperty(data, '__ob__', {
      value: this,
      enumerable: false
    })

    if (Array.isArray(data)) {
      data.__proto__ = arrayMethods
      this.observerArray(data)
    } else {
      walk(data)
    }
    
    function walk(data) {
      Object.keys.forEach(key => {
        defineReactive(data, key, data[key])
      })
    }
  }

  observerArray(data) {
    data.forEach(i => {
      observe(i)
    })
  }


}
function observerArray(data) {
  if(Array.isArray(data)) {
    data.forEach(curValue => {
      let ob = observe(curValue)
      if(ob) {
        ob.dep.depend()
      }
      observerArray(curValue)
    })
  }else {
    return
  }
}

function defineReactive(target, key, value) {
  let dep = new Dep()
  const childOb = observe(value)

  Object.defineProperty(target, key, {
    get() {
      if (Dep.target) {
        dep.depend()
        if (childOb) {
          childOb.dep.depend()
          observerArray(childOb)
        }
      }
      return value
    },
    set(val) {
      if (val !== value) {
        observe(value)
        value = val
        dep.notify()
      }
    }
  })

}
 */