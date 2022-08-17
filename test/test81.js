
function sum(a, b) {
  return a + b
}
// const obj = {sum}
// // console.log(obj.sum,11111111);
// const newObj = {}

// console.log(obj.sum.call(newObj,1,2));


function myInstanceof(left, right) {
  const proto = left.__proto__
  while (proto) {
    if (proto == right.prototype) {
      return true
    }
    proto = proto.__proto__
  }
  return false
}


function myNew(Fn) {
  const obj = Object.create(null)
  obj.__proto__ = Fn.prototype
  Fn.call(obj)
  return obj
}

function clone1(target) {
  if(typeof target == 'object' && target != null){
    if(Array.isArray(target)){
      // return [...target]
      // return [].concat(target)
      // return target.slice()
      // return target.reduce((pre,cur)=> {
      //   pre.push(cur)
      //   return pre
      // },[])
      // return target.map(item => item)
      return target.filter(item => true)
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
  if((typeof target == 'object' && target != null) || typeof target == 'function' ){
   const cloneTarget= Array.isArray(target) ? [] : {}
   for (const key in target) {
     if (Object.hasOwnProperty.call(target, key)) {
       const  value = target[key];
       cloneTarget[key] = deepClone2(value)
     }
   }
   return cloneTarget
  }else {
    return target
  }
}

function deepClone3(target,map = new Map()) {
  if((typeof target == 'object' && target != null) || typeof target == 'function' ){
    let cloneTarget = map.get(target)
    if(cloneTarget) {
      return cloneTarget
    }
    cloneTarget = Array.isArray(target) ? [] : {}
    for (const key in target) {
      if (Object.hasOwnProperty.call(target, key)) {
        const  value = target[key];
        cloneTarget[key] = deepClone3(value,map)
      }
    }
    return cloneTarget
  }else {
    return target
  }
}

function throttle(fn,delay) {
  const pre = 0
  const context = this
  return function(...args) {
    const cur = Date.now()
    if(cur - pre > delay) {
      const result = fn.call(context,...args)
      pre = cur
      return result
    }
  }
}

function debounce(fn,delay) {
  if(fn.timer) clearTimeout(fn.timer)
  const context = this
  return function(...args) {
    fn.timer = setTimeout(() => {
       fn.call(context,...args)
    }, delay);
  }
  
}