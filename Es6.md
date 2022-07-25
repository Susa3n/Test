#### let、const、var的区别
  - 块级作用域：块级作用域由`{}`包括，let和const都具有块级作用域，var不存在块级作用域
  - 变量提升：var存在变量提升，let和const都不存在变量提升（存在暂时性死区），在声明钱前使用报错提示未初始化
  - 给全局添加属性：在全局作用域下声明变量var会将当前变量添加到全局对象上，let、const不会
  - 重复声明： var声明变量时可以重复声明，const和let不可以
  - 初始值设置：在变量声明时，let和var都可以声明但不赋值，const不可以
  - 指针指向：let和var声明后指针指向都可以进行修改，const 不能修改指针指向
    - 总结：
      1. Es6中let、const都是更完美的var，不是全局变脸，具有块级作用域，不会发生变量提升，如果在声明前使用会报错。
      2. const定义常量，不能重新赋值，如果值是一个对象可以修改对象里边的属性值。
      3. let和const声明的变量都不能挂到全局对象上，不能通过window.变量名进行访问
#### 箭头函数与普通函数的区别
  - 箭头函数和普通函数更简洁
    1. 如果只有一个参数，可以省去参数的括号
    2. 如果函数体的返回值只有一句，可以省略大括号
  - 箭头函数的this
    1. 箭头函数没有自己this，它的this会继承外部函数的this。
    2. 箭头函数this不能通过call、apply、bind修改this的指向
  - 箭头函数没有arguments对象，可以用剩余运算符代替arguments
  - 不能通过new 生成实例对象，因为箭头函数没有自己的this，没有Prototype属性，即原型对象上没有construct属性指向箭头函数
#### 模板字符串
#### 剩余运算符
#### 解构赋值
#### 形参默认值
#### set和map
  #### set
  - 创建： new Set()
  - add(value)：添加某个值，返回set结构本身
  - delete(value)：删除某个值
  - has(value)：返回一个布尔值，判断参数是否是set成员
  - clear()：清除所有成员，没有返回值
  #### map
  - 创建：new Map()
  - get(key)：通过键去map中查询值并返回
  - set(key,val)：向Map中添加新元素
  - has(key)：返回布尔值，判断Map对象中是否有key所对应的值
  - delete(key)：通过键从map中移除对应数据
  - clear()：将这个map实例清空所有的元素
    - 区别
      - map是一种键值对集合，和对象不同的是，键可以是任意值，对象的键只能是字符串
      - set类似数组的一种数据结构，但是set中没有重复的值
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