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


class Person {
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
  /**
   *  // 如果子类没有构造器
      // 子类默认构造器
      // constructor (...arguments) {
      //   super(...arguments)
      // }
   */
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