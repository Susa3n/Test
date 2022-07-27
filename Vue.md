#### Vue响应式数据的理解（双向绑定的原理）

- 响应式数据：数据变化视图发生更新
- Vue内部通过实现了 `defineReactive`方法，借用`Object.defineProperty`将data中属性进行数据劫持，添加`get`和`set`，当用户取值的时候进行依赖收集，设定值时会进行赋值通知依赖进行更新。但是也有一些缺陷，因为 `Object.defineProperty`只能对最外层数据进行劫持，对于多层对象通过递归来实现劫持
- 重点内容：嵌套数组中的数据如何收集渲染`watcher` 
   - 当给数组的属性名进行数据劫持时，会给数组添加一个`dep`属性，当属性名进行依赖收集时，同时数组也会进行依赖收集。同时深度递归数组进行依赖收集
- 个人理解：Vue在初始化data数据时，会通过Observer类实例化一个observer的实例，递归遍历data中的数据，调用`defineReactive`方法，借用`object.DefineProperty`,添加get和set，当读取数据时会触发get进行依赖收集，当数据发生修改会调用set进行赋值通知依赖更新。
```javascript
export function defineReactive ( 
  obj: Object,
  key: string,
  val: any,
  customSetter?: ?Function,
  shallow?: boolean
) {
  const dep = new Dep()

  const property = Object.getOwnPropertyDescriptor(obj, key) // 拿到自身属性的描述符配置
  if (property && property.configurable === false) { // 判断当前属性是否可以配置
    return
  }

  // cater for pre-defined getter/setters
  const getter = property && property.get
  const setter = property && property.set
  if ((!getter || setter) && arguments.length === 2) {
    val = obj[key]
  }

  let childOb = !shallow && observe(val) // 如果属性值为对象类型的继续递归劫持
  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get: function reactiveGetter () {
      const value = getter ? getter.call(obj) : val // 取值
      if (Dep.target) { // 判断当前是否有watcher实例
        dep.depend() // 将当前属性名拥有的dep属性去收集依赖
        if (childOb) { // 如果属性值是是对象类型 则返回当前属性值也就是最外层Observe的实例
          childOb.dep.depend() // 最外层的属性值收集watcher实例
          if (Array.isArray(value)) { // 判断当前最外层属性值是否为数组
            dependArray(value) // 是数组递归进行观测
          }
        }
      }
      return value
    },
    set: function reactiveSetter (newVal) {
      const value = getter ? getter.call(obj) : val
      /* eslint-disable no-self-compare */
      if (newVal === value || (newVal !== newVal && value !== value)) {
        return
      }
      /* eslint-enable no-self-compare */
      if (process.env.NODE_ENV !== 'production' && customSetter) {
        customSetter()
      }
      // #7981: for accessor properties without setter
      if (getter && !setter) return
      if (setter) {
        setter.call(obj, newVal)
      } else {
        val = newVal
      }
      childOb = !shallow && observe(newVal)
      dep.notify()
    }
  })
}
```

```javascript
function observeArray(value) {
  if(Array.isArray(value)){ // 是数组类型 进行遍历
    value.forEach(currentValue => {
      let ob = observe(currentValue) // 拿去下一层的dep实例 如果有进行下一层关联
      if(ob){
        ob.dep.append()
      } 
      observeArray(currentValue) // 递归关联
    })
  }
}

function defineReactive(data, key, value) { // 将数据定义为响应式
  let dep = new Dep() // 数据劫持时给数据绑定对应的dep
  let childOb = observe(value) // value可能还是对象  递归进行劫持,value是数组或value时，为了将value的dep的和视图watcher进行关联，此时childOb是数组或对象的observe实例
  Object.defineProperty(data, key, {
    get() { // 在watcher中读取对应数据 会判断Dep.target是否是watcher
      if(Dep.target) { // 如果是
        dep.append() // 将当前dep（也就是当前数据）进行关联
        if(childOb) { // 如果有值 数组去关联视图watcher
          childOb.dep.append()
          observeArray(value) // 递归将下一层的数据进行关联watcher  [[[1,2,3]]]
        }
      }
      return value
    },
    set(newValue) {
      // 如果set的newValue是一个对象 也要对对象进行劫持
      if(newValue !=  value) {
        observe(newValue)
        value = newValue
        dep.notify() // 通知对应观察者执行操作
      }
    }
  })
}
```

#### Vue如何监听数组中数据的变化

- 数组考虑性能原因没有使用`defineReactive`对数组中的每一项进行拦截，而是选择重写数组中能直接更改数据七个方法（push、shift、unshift、pop、splice、sort、reverse），当调用这7个api时，内部还是执行原来的方法，添加了通知依赖更新的操作和新增的数据如果包含引用数据类型会继续递归劫持
- 数组中如果是引用数据类型也会进行递归劫持 添加`get`和`set`
- 数组中的索引和长度变化是无法监控到的
```javascript
let oldMethods = Array.prototype
export let arrayMethods = Object.create(oldMethods) // 旧数组的原型方法
let methods = [
  'push',
  'shift',
  'unshift',
  'splice',
  'pop',
  'sort',
  'reverse'
]

methods.forEach(method => {
  arrayMethods[method] = function (...args) { // args 是参数列表
  // 这里的this指的是谁调的   比如data: {a:[1,2,3]}  vm.a.push(4) 此时[1,2,3]就为当前的this
    oldMethods[method].call(this, ...args) // 执行旧数组上的方法
    let inserted;
    let ob = this.__ob__ // 在对数组外层观测时 将当前实例挂载的this挂载到__ob__属性
    switch (method) { // 判断如果是push  shift splice 方法  对于新增的属性进行数据劫持 args为新增的数据
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
    if (inserted) ob.observerArray(inserted) // 通过observerArray递归进行数据劫持
    ob.dep.notify() //如果数据发生变化  通过dep通知对应的watcher进行关联
  }
})
```

#### Vue中如何进行依赖收集

- Vue在初始化时，先`data`进行初始化，通过new `Observer`类创建一个实例，之后递归遍历data中的数据，调用`defineReactive`方法，借用`Obeject.defineProperty`方法，将属性定义为响应式数据，添加get和set方法，在这一过程中通过new `Dep`类创建dep实例，存放他所依赖的`watcher`,之后初始化界面，会调用`render`函数，此时在`render`函数用到的属性会触发属性的依赖收集`dep.depend`，当属性发生修改`dep.notify`通知收集的`watcher`进行更新。



#### Vue中数组如何进行依赖收集
- 以数据`data:{arr: [1,2,[3]]}`为例
  - 初始化时首先通过observer进行数据，创建Observer类的实例，遍历data中的属性，调用defineReactive方法借用Obeject.defineProperty方法进行数据劫持，在这一过程中的作用域创建Dep的实例和递归观测属性值，判断是对象类型继续观测，创建Observer类的实例，创建属性值的Dep实例，并且给当前属性值绑定一个属性__ob__为当前observer的实例,判断属性值是不是数组，如果是修改数组隐士原型对象的指向（此时已经重写了数组原型上能直接修改数组的方法）对数组中的数据进行递归观测。
  - 初始化界面时，在模板中通过插值语法{{arr}},执行render函数时，会获取arr的值，走到属性get方法。判断当前是否有watcher实例，有的话进行依赖收集dep.depend，数组的属性值此时也会进行依赖收集，然后遍历属性值
#### 执行流程
- `Vue`的执行流程，通过`new Vue`传入配置对象，进行数据的初始化，执行`$mount`方法。模板进行`compile`，将模板通过`parse`方法转为`Ast`语法树，之后进行标记，最后生成`code`字符串`+``With(this) {}`生成`render`函数。执行`render`函数拿到一个对象，之后编译成真实的`dom`节点（这一过程中之后会使用`diff`算法），之后进行初始化渲染，在渲染的过程中界面用到的属性进行取值操作，调用`get`方法在当前上下文中拿到`dep`收集渲染`watcher`，当用户操作值得时候会调用`set`方法也是在当前上下文拿到`dep`通知对应得`watcher`进行更新。之后页面生成虚拟`dom`，将虚拟`dom`编译真实`dom`节点，挂载到页面上。

#### Vue中如何理解模板编译原理

问题核心：如何将`template`转换为`render`函数？
`vue`中的模板`template`无法被浏览器解析并渲染，因为不属于浏览器的标准，不是正确的`HTML`语法，所以需要将`template`转化为一个函数，这样浏览器可以执行这个函数并渲染对应的`html`元素，让界面跑起来，这一个转化的过程，就成为模板编译。分为三步 `template`通过`parseHtml`转为`Ast`语法树，第二步：做优化`optimize`，之后递归遍历ast语法树拼接`code`字符串`genrat`

1. 将`template`模板通过正则的匹配递归生成`ast`语法树- `parseHtml` ，当解析到开始标签、闭合标签、文本的时候都会分别执行对应的 回调函数，来达到构造AST树的目的
1. 对静态语法做静态标记 - `optimize`为后续更新渲染做优化，深度遍历AST，查看每个子树的节点元素是否为静态节点或者静态节点根。如果为静态节点，他们生成的DOM永远不会改变，这对运行时模板更新起到了极大的优化作用
1. 重新生成代码 - `genrate``new Function(`with(this){ return ${code}}`)`

```javascript
export function compileToFunction(template) {
  let root = parserHtml(template) // 编译模板字符串 转为 ast语法
  let code = generate(root)
  let render = new Function(`with(this){ return ${code}}`)
  return render
}
```

```javascript

const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z]*`; // abc-aaa
const qnameCapture = `((?:${ncname}\\:)?${ncname})`; // <aaa:asdads>
//  /^<((?:[a-zA-Z_][\-\.0-9_a-zA-Z]*\:)?[a-zA-Z_][\-\.0-9_a-zA-Z]*)/
const startTagOpen = new RegExp(`^<${qnameCapture}`); // 标签开头的正则 捕获的内容是标签名 
// /^<\/((?:[a-zA-Z_][\-\.0-9_a-zA-Z]*\:)?[a-zA-Z_][\-\.0-9_a-zA-Z]*)[^>]*>/
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`); // 匹配标签结尾的 </div>
const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/; // 匹配属性的
const startTagClose = /^\s*(\/?)>/; // 匹配标签结束的 >  <div>


let root = null;
let currParent;
let stack = [];
const ELEMENT_TYPE = 1 // 标签节点  
const TEXT_TYPE = 3 // 文本节点

// 将html字符串通过正则的形式解析出ast
export function parserHtml(html) { // <div id="app"></app>
  while (html) { // 循环解析
    let textEnd = html.indexOf('<') // 查看是否以<开头
    if (textEnd == 0) {
      const startTagMatch = parseStartTag() // 解析开始标签
      if (startTagMatch) {
        start(startTagMatch.tagName, startTagMatch.attrs)
        continue
      }

      const endTagMatch = parseEndTag(html)
      if (endTagMatch) {
        end(endTagMatch[1])
        continue
      }

    }
    let text
    if (textEnd > 0) {
      text = html.substring(0, textEnd)
    }
    if (text) {
      chars(text)
      advance(text.length)
    }

  }

  function parseStartTag() {
    let start = html.match(startTagOpen) // 将模板字符串匹配开始标签
    if (start) { // 匹配到 创建match对象保存当前 开始标签名 默认属性为空
      const match = {
        tagName: start[1],
        attrs: []
      }
      advance(start[0].length) // 截取已经匹配到的开始标签
      let end, attr
      // 循环匹配 不结束标签 和 属性 当两者同时成立时 拿去匹配到的属性名和属性值 push到 match中 
      while (!(end = html.match(startTagClose)) && (attr = html.match(attribute))) {
        match.attrs.push({ name: attr[1], value: attr[3] || attr[4] || attr[5] })
        advance(attr[0].length) // 截取已经匹配到的属性
      }
      if (end) { // 当匹配到结束标签时
        advance(end[0].length)
        return match
      }
    }
  }

  function parseEndTag() {
    let endTagMatch = html.match(endTag) // 将模板字符串匹配开始标签
    advance(endTagMatch[0].length)
    return endTagMatch
  }

  function advance(len) {
    html = html.substring(len)
  }

  return root
}


function createElement(tagName, attrs) {
  return {
    type: ELEMENT_TYPE,
    tag: tagName,
    children: [],
    attrs,
    parent: null
  }
}

function start(tagName, tagAttrs) {
  let element = createElement(tagName, tagAttrs)
  if (!root) {
    root = element
  }
  stack.push(element)
  currParent = element
}
function end(tagName) {
  let currentElement = stack.pop()
  let parentElement = stack[stack.length - 1]
  if (tagName == currentElement.tag) {
    if (parentElement) {
      parentElement.children.push(currentElement)
      currentElement.parent = parentElement
    }
  }
}
function chars(text) {
  text = text.replace(/\s/g, '')
  if (text) {
    currParent.children.push({
      type: TEXT_TYPE,
      text
    })
  }
}
```

```javascript

const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g  // 匹配插值语法

function geneProps(attrs) {
  let props = `` 
  attrs.forEach(attr => { // 遍历当前节点的属性list  {id:'app',class:'classA',style: {font-size: '14px',color:'red'}}
    if(attr.name === 'style') { // 如果当前属性item的name为style {font-size: '14px';color:'red'}
      let obj = {} // 定义空对象
      attr.value.split(';').forEach(styleItem => {   // 拿到当前value进行split  [font-size: '14px',color:'red']
        let [key,value] = styleItem.split(':') // [key: 'font-size',value: '14px']  [key: 'color',value: 'red']
        obj[key] = `${value}` // obj = {font-size: '14px',color: 'red'}
      })
      attr.value = obj // attr.style = {font-size: '14px',color: 'red'}
    }
    props += `${attr.name}:${JSON.stringify(attr.value)},` // 如果name不是style,直接拼:props = id:'app',class:'classA',style:{font-size: '14px';color:'red'}
  })
  return `{${props.slice(0,-1)}}` // return {id:'app',class:'classA',style:{font-size: '14px';color:'red'}}
}

function gen(node) {
  if(node.type == 1){ // 如果当前节点为为标签节点  递归调用generate方法
    return generate(node)
  }else { // 如果是文本节点
    let text = node.text // 获取文本内容
    let tokens = []; // 定义空数组 方便依次递加
    let match;
    let lastIndex = defaultTagRE.lastIndex = 0 // defaultTagRE插值语法{{}} 匹配每次用exec匹配时候默认最后一次匹配项为0
    while(match = defaultTagRE.exec(text)){ // while循环去匹配当前text = "hello  {{name}}  word"
      let index = match.index //开始索引 第一次匹配到的index  hello  的长度
      if(index > lastIndex) { // 将hello  push到tokens中
        tokens.push(JSON.stringify(text.slice(lastIndex,index))) // 截取普通字符串
      }
      tokens.push(`_s(${match[1].trim()})`) // 截取插值语法字符串push到tokens中
      lastIndex = index + match[0].length // 将当前lastIndex = hello  {{name}}的长度 循环匹配直至最后一次 
    }
    if(lastIndex<text.length) { // 将最后的  word push到tokens中
      tokens.push(JSON.stringify(text.slice(lastIndex)))
    }
    return `_v(${tokens.join('+')})` // 转为字符串return
  }
}

function geneChildren(root) { 
  let children = root.children // 拿到当前children 判断children是否大于0 继续转化子节点 
  if(children && children.length > 0) {
    return children.map(c => gen(c)).join(',') 
  }else{
    return false
  }
}

export function generate(root) { // 传入ast语法树
let children = geneChildren(root) // 转化当前传入的root.children
  //  geneProps(root.attrs) 转化 当前节点的属性
  let code = `_c('${root.tag}',${root.attrs.length > 0 ? geneProps(root.attrs) : undefined}${children ? `,${children}` : ''})`
  return code
}generate
```

- keep-alive是Vue提供的一个内置组件，当组件切换时不会对当前组件进行卸载。有两个常用的属性include、exclude允许组件有条件的缓存
- 生命周期？ 
   - 如果一个组件被keep-alive包裹，那么会多出两个生命周期：deactived、actived。同时beforeDestory和destoryed就不会再被触发了，因为组件不会真正销毁

#### MVVM的理解

- MVVM 分为 Model、View、ViewModel： 
   - Model代表数据模型，数据和业务逻辑都在Model层中定义；
   - View代表UI视图，负责数据的展示；
   - ViewModel负责监听Model中数据的改变并且控制视图的更新，处理用户交互操作；

Model和View并无直接关联，而是通过ViewModel来进行联系的，Model和ViewModel之间有着双向数据绑定的联系。因此当Model中的数据改变时会触发View层的刷新，View中由于用户交互操作而改变的数据也会在Model中同步。
这种模式实现了 Model和View的数据自动同步，因此开发者只需要专注于数据的维护操作即可，而不需要自己操作DOM。

#### computed和watch的区别

- `computed`和`watch`都是基于`watcher`来实现的
- `computed`计算属性通过已有的数据产生新的数据，支持缓存，只有依赖的数据发生了变化，才会重新计算。不支持异步，同步产生一个计算的结果 
   - 如果computed属性的属性值是函数、函数的返回值就是该属性的属性值；在computed中，属性也可是对象有一个get方法和一个set方法，读取该属性调用get的方法，当数据发生变化时，会调用set方法，他所依赖的数据发生变化

```javascript
function initComputed(vm, computed) {
  let watchers = vm._computedWatchers = {} // 保存一份计算属性的watchers到vm实例上，以便可以通过key和vm找到对应的计算属性watcher
  for (const key in computed) { // 遍历计算属性
    let userDef = computed[key]
    let getter = typeof userDef === 'function' ? userDef : userDef.get // 判断单个计算属性是函数或者是对象，拿到定义的函数
    watchers[key] = new Watcher(vm, getter, () => { }, { lazy: true }) // 生成计算属性watcher 传入vm  getter 配置对象默认lazy为true 初次不渲染 
    deReactiveComputed(vm, key, userDef) // 将computed属性的key通过Object.defineProperty定义到vm
  }
}

function createComputedGetter(key) {
  return function () {
    let computedWatcher = this._computedWatchers[key] // 通过vm和key拿到对应的watcher
    if (computedWatcher.dirty) { // 判断当前watcher是否是脏值 dirty:true
      computedWatcher.evaluate()  // 取值
    }
    if (Dep.target) { // 取值之后 渲染watcher继续收集计算属性watcher上的dep
      computedWatcher.depend()
    }
    return computedWatcher.value // 将值返回
  }
}

function deReactiveComputed(vm, key, userDef) { // 定义计算属性的key响应式
  let shareComputedFn = {}
  shareComputedFn.get = createComputedGetter(key), // 如果userDef是对象，通过key去找到对应的watcher,再通过watcher调用getter
    shareComputedFn.set = userDef.set
  Object.defineProperty(vm, key, shareComputedFn)
}
```

- `watch`则是监控值变化的，当值发生变化时调用对应的回调函数，不支持缓存。支持异步监听。
   - 监听的函数接收两个参数，第一个参数是最新的值，第二个是变化之前的值 
      - 函数有两个的配置对象： 
         - immediate：组件加载立即触发回调函数
         - deep：深度监听，发现数据内部的变化
      - 当想要执行异步或者昂贵的操作以响应不断的变化时，就需要使用watch。

```javascript
function initWatch(vm, watch) { // 初始化watch方法
  for (const key in watch) { // 遍历watch
    let handler = watch[key]
    if (Array.isArray(handler)) { // 判断value的类型，如果是数组类型 需要创建多个用户watch
      handler.forEach(handlerFn => {
        createWatch(vm, key, handlerFn)
      })
    } else {
      if (typeof handler === 'object') { // 如果是对象类型 取出handler函数，收集配置对象，创建用户watch
        createWatch(vm, key, handler.handler, handler)
      } else {
        createWatch(vm, key, handler) // 如果是函数 直接创建用户watchr
      }
    }
  }
}


function createWatch(vm, key, handler, options = {}) {
  return vm.$watch(key, handler, options) // 通过$watch进行中转
}


Vue.prototype.$watch = function (key, handler, options) { // 在Vue的原型上混入$watch的方法 创建用户监听
    options.user = true // 配置对象 用户watch为true
    let userWatcher = new Watcher(this, key, handler, options) // 生产watch实例传入 当前vm，表达式，callback，配置对象
    if (options.immediate) {
      handler(userWatcher.value)
    }
  }
```

```javascript
import { pushTarget, popTarget } from "./dep"
import { queueWatcher } from './scheduler'
let id = 0
export class Watcher {
  /**
   *  Watcher是一个类，生成一个观察者
   * @param {*} vm 被观测的对象或者数据
   * @param {*} exprOrFn  被观测的对象发生变化执行对应操作（渲染watcher是函数，在computed或者watch中是表达式）
   * @param {*} cb 执行完对应操作后的回调函数
   * @param {*} options 配置对象
   */
  constructor(vm, exprOrFn, cb, options) {
    // 将传入的参数保存到实例本身
    this.vm = vm
    this.cb = cb // 保存回调函数
    this.options = options
    this.user = options.user // 用户watch
    this.lazy = !!options.lazy // 计算属性watch 初次不加载
    this.dirty = options.lazy // 计算属性watch 默认是脏的 
    if (typeof exprOrFn == 'string') { // 如果是用户watch exprOrFn是一个表达式 'name' 'person.nam'
      this.getter = function () {  // getter为一个函数，通过表达式的取值 将watcher 和 表达式的dep进行关联
        let obj = vm
        exprOrFn.split('.').forEach(i => {
          obj = obj[i]
        })
        return obj
      }
    } else {
      this.getter = exprOrFn // 挂载到实例的getter属性上，当被观测的数据发生变化 执行this.get
    }
    this.id = id++
    this.deps = []
    this.depIds = new Set()
    this.value = this.lazy ? undefined : this.get() // 默认第一次执行 拿到watcher的值 保存到实例上，以便用户watcher发生变化执行callback传入对应新值和旧值
  }

  get() { // 利用JS的单线程
    pushTarget(this) // 开始：将watcher（页面）和dep（数据） 进行关联起来
    let value = this.getter.call(this.vm) // 读取对应数据 
    popTarget()
    return value
  }

  append(dep) { // 接收dep
    if (!this.depIds.has(dep.id)) {  // 判断当前watcher中depIds中是否有当前dep
      this.depIds.add(dep.id) // 将接收的dep的id set到当前watcher实例depIds
      this.deps.push(dep) // 将dep保存到watcher的deps中
      dep.addSub(this) // 反之将watcher关联到dep中
    }
  }

  update() { // 当前观察者执行对应操作
    // this.get()
    // 如果数据改变通知对应watcher进行update，当多次更改数据时，会导致多次渲染页面，可以将渲染界面改为异步
    // 通过queueWatcher收集watcher，之后进行异步更新
    if(this.lazy) { // 如果当前watcher是计算属性watcher dirty为true是脏的
      this.dirty = true
    }else {
      queueWatcher(this)
    }
  }

  run() {
    let oldValue = this.value // 当监听的值发生变化保存旧值在当前作用域
    let newValue = this.value = this.get() // 保存新值到实例上 用于下次更新
    if (this.user) {
      this.cb.call(this.vm, newValue, oldValue) // 如果是用户watcher 执行回调函数 传入参数
    }
  }
  evaluate() {
      this.value = this.get() // 调用计算属性的getter函数
      this.dirty = false // 脏值变为不脏的  
      return this.value // 返回计算属性的值
  }

  depend() {
    let i = this.deps.length // 拿去当前计算属性上的dep，拿到每个dep关联渲染watcher
    while(i--) {
      this.deps[i].append()
    }
  }

}

// watcher 和 dep
// 我们将更新界面的功能封装了一个渲染watcher
// 渲染页面前，会将watcher放到Dep的类上  Dep.target = watcher
// 在vue中页面渲染时使用属性，需要进行依赖收集，收集对象的渲染watcher
  // 取值时给每个属性都加了一个dep实例，用于存储渲染watcher（同一个watcher可能存有多个dep）
  // 每个属性可能对应多个视图（多个视图就对应多个watcher） 一个属性对应多个watcher
// dep.depend() => 通知dep存放watcher  Dep.target.addDep () => 通知watcher存放dep
```

#### 插槽slot

- slot又名插槽，插槽slot是子组件的一个模板标签元素，这个标签元素是否显示，以及怎么显示是由父组件决定的。slot又分三类，匿名插槽，具名插槽和作用域插槽。 
   - 匿名插槽：当slot没有指定name属性，默认插槽(default)，一个组件内只有有一个匿名插槽。在父组件进行
   - 具名插槽：带有具体名字的插槽，也就是带有name属性的slot，一个组件可以出现多个具名插槽。
   - 在父组件渲染完毕后子组件进行替换操作
   - 作用域插槽：该插槽的不同点是在子组件渲染作用域插槽时，可以将子组件内部的数据传递给父组件，让父组件根据子组件的传递过来的数据决定如何渲染该插槽。
   - 在子组件中渲染父组件中插槽标签内容

#### Vue.mixin的使用场景和原理

- `Vue.mixin`的作用就是抽离公共的业务逻辑，原理类似"对象的原型"继承，当组件初始化时会调用`mergeOptions`方法进行合并，采用策略模式针对不同的属性进行合并，生命周期钩子函数也是此时维护成数组形式。如果混入的数据和本身组件中的数据冲突，会采用“就近原则”以组件的数据为基准
- `mixin`中有很多缺陷“命名冲突问题”、“依赖问题”、“数据来源问题”

```javascript
export function isFunction(value) {
  return typeof value === 'function'
}
export function isObject(value) {
  return typeof value === 'object' && value != null
}

// 生命周期策略模式
const lifecycle = ['beforeCreate', 'created', 'beforeMount', 'mounted', 'beforeUpdate', 'updated', 'beforeDestroy', 'destroyed']
let strategy = {}
function mergeHook(parentVal, childVal) {
  if (childVal) { // 第一次parentVal是空对象，拿去childValue
    if (parentVal) {
      return parentVal.concat(childVal) // 之后第二次进行合并时parentVal就是第一次合并的[childVal]，进行返回
    } else {
      return [childVal] // 返回[childVal]
    }
  } else {
    return parentVal
  }
}

lifecycle.forEach(key => { // 遍历生命周期的name在strategy中定义函数用来合并生命周期的方法
  strategy[key] = mergeHook
})
export function mergeOptions(parent, child) {
  const options = {}
  for (let key in parent) { // 遍历parent的key
    mergeFiled(key)
  }
  for (let key in child) { 
    if (parent.hasOwnProperty(key)) { // 如果child中的key在parent 跳出循环 
      continue;
    }
    mergeFiled(key) // 如果不在 调用mergeFiled => options[key] = childVal
  }

  function mergeFiled(key) {
    let parentVal = parent[key] // 拿去parent的值
    let childVal = child[key]
    if (strategy[key]) { // 如果当前key属于生命周期中字段
      options[key] = strategy[key](parentVal, childVal) // 合并生命周期
    } else {
      if (isObject(parentVal) && isObject(childVal)) { // 如果是对象形式进行简答的合并 
        options[key] = { ...parentVal, ...childVal }
      } else {
        options[key] = childVal || parentVal// 如果父中的key是undefined 直接将子中的childVal返回
      }
    }
  }
  return options
}
```

#### Vue组件中data为什么必须是函数？

- Vue组件可能存在多个实例，如果使用对象形式定义data，复用组件时会导致它们共用一个data对象，那么状态变更将会影响所有组件实例。
#### 过滤器的作用及实现

- 作用：过滤器是用来过滤数据的，在Vue中配置选项中声明`filters`实现一个过滤器，`filters`不会修改数据，而是过滤数据，改变用户看到的输出。（计算属性computed是根据已有的数据产生新数据，method是通过修改原来的数据进行输出显示）
- 实现：在组件配置对象`filters`定义局部过滤器，过滤器是一个函数，他会把表达式中的值始终作为函数的第一个参数。过滤器用在插值表达式`{{}}`和`v-bind`表达式中，然后放在操作符“`|`”后面进行指示
- 例如：在显示金额，给商品价格添加单位
#### v-if和v-for那个优先级会更高

- `v-if`和`v-for`不要在同一标签中使用，因为解析时`v-for`的优先级会高于`v-if`。如果同时出现会先执行循环再进行判断，无论vif条件如何，循环都避免不掉，浪费性能
- 要避免它们同时出现，如果条件在循环体的外部，可以使用`template`标签先进行判断,再进行循环。如果条件在内部，将循环体过滤之后再进行渲染。减少循环次数
#### v-if和v-show的区别

- v-if是惰性的，如果初始条件为假，则什么也不做；只有在条件第一次变为真时才开始局部编译; v-show是在任何条件下，无论首次条件是否为真，都会被编译；
- v-if是动态的向DOM树内添加或者删除DOM元素；v-show是通过设置DOM元素的display样式属性控制显示隐藏；
- v-if用于切换频率较少的时候(消耗性能高)，v-show适合频繁切换（消耗性能低）

#### v-model的实现原理

- 作用在表单元素上 
   - 动态绑定表单元素的 `value`指向了 `messgae`变量，并且在触发 `input`事件的时候去动态把 `message`设置为目标值：
- 作用在组件上 
   - 在自定义组件中，`v-model` 默认利用名为value的prop和名为input的事件，本质是一个父子组件通信的语法糖。

#### nextTick在哪里使用？原理是？

- `nextTick`中的接收一个回调函数作为参数，它的作用将回调函数延迟到下次DOM更新之后执行。将回调函数放入异步队列中。Vue会根据当前浏览器环境优先使用原生的Promise.then、mutationObserver等,刷新异步队列
   - 数据更新后可用于拿取更新后的`Dom`
   - 在`created`生命周期钩子函数中需要操作`dom`,也可以把操作写在`nextTick`的回调中
- `Vue`中检测到数据变化并不会直接更新Dom，而是开启一个任务队列，将所有要更新watcher的实例放到队列中，重复的watcher只会放进去一次，然后在下一事件循环中，刷新任务队列执行渲染
- 原理是：`Vue` 的 `nextTick` 其本质是对 `JavaScript` 执行原理 `EventLoop` 的一种应用，将传入的回调函数包装成微任务加入到Vue异步队列中，保证在异步更新DOM的watcher后面执行。

```javascript
let callbacks = []
let waiting = false 

function flushCallbacks() {
  callbacks.forEach(cb => cb())
  waiting = false
  callbacks = []
}

function timerFn() {
  let timer = null
  if(Promise) { // 
    timer = () => {
      Promise.resolve().then(() => {
        flushCallbacks()
      })
    }
  }else if(MutationObserver) {
    let textNode = document.createTextNode(1)
    let observe = new MutationObserver(flushCallbacks)
    observe.observe(textNode,{
      characterData: true
    })
    timer = () => {
      textNode.textContent = 3
    }
  }else {
    timer = setTimeout(flushCallbacks);
  }
  timer()
}

export function nextTick(cb) { // 接收一个回调函数
  callbacks.push(cb) // push到callbacks中
  if(!waiting){ // 异步执行一次 
    timerFn()
    waiting = true
  }
}
```

#### Vue中修改属性，视图会立即同步执行重新渲染吗？

不会同步执行重新渲染。Vue在更新`dom`时是异步执行的。只要侦听到属性的变化，Vue会开启一个队列，将所有要更新`watcher`的实例放到队列中，重复`watcher`只会进去一次，然后，在下一个的事件循环nexttick中，Vue 刷新队列并执行重新渲染的工作。

```javascript
import { nextTick } from '../next-tick'
let queue = []
let has = {}
let pending = false


function flushSchedulerQueue() {
  queue.forEach(watcher => { // 从queue遍历所有的watcher 进行更新
    watcher.run()
    queue = []; // 让下一次可以继续使用 清空数据
    has = {};
    pending = false
  })
}

export function queueWatcher(watcher) {
  let id = watcher.id // 拿取watcher的id
  if (has[id] == null) { // 判断当前watcher是否在has对象中
    queue.push(watcher) // 将当前watcher push 到对列中
    has[id] = true // has中保存watcher的id置为true
    if (!pending) { // 默认false 之后置为true 只让更新操作改为异步的，执行nexttick
      // setTimeout(flushSchedulerQueue,0);
      nextTick(flushSchedulerQueue)  // 执行异步更新视图的方法
      pending = true
    }
  }
}
```

#### 子组件可以直接改变父组件的数据吗？

- 子组件不可以直接改变父组件的数据。这样做主要是为了维护父子组件的单向数据流。每次父级组件发生更新时，子组件中所有的 prop 都将会刷新为最新的值 
   - **可以通过 **`**$emit**`** 派发一个自定义事件，父组件接收到后，由父组件修改。**
   - **如果父组件通过provide将数据注入给子组件，子组件也可以通过inject来去修改父组件的值**
#### 单向数据流
  - 所有的prop都是都使得父子prop之间形成了一个单向下行绑定：父级prop的更新会向下流动到子组件中，但是反过来不行。这样防止从子组件意外改变父级组件的状态，导致数据的混乱。
  - 每次父级组件发生更新时，子组件中所有prop都会刷新为最新值。如果子组件中修改父组件传递过来的属性，控制台会发出警告
  - 子组件想修改父级组件中的属性，可以通过父组件给子组件注册监听的函数，子组件$emit触发监听函数修改父级组件中的属性
#### Vue.set方法如何实现的

- 我们给对象和数组本身都增加了`dep`属性
- 当给对象新增不存在的属性 
   - 首先判断`key`是否本身对象中的属性，如果是直接进行赋值
   - 之后判断当前对象是否有`_ob_`属性，判断是不是响应式数据
   - 如果是响应式数据，调用`defineReactive`对新增的属性进行响应式处理，之后通过`_ob_`通知页面更新
- 当修改数组索引时会调用数组本身的`splice`方法更新数组 
   - 首先判断目标对象是否为数组类型
   - 之后比较`key`和数组长度取最大值，赋值目标对象的`length`属性
   - 调用`target.splice(key,1,value)`

```javascript
export function set(
  target: any[] | Record<string, any>,
  key: any,
  val: any
): any {
  if (__DEV__ && (isUndef(target) || isPrimitive(target))) {
    warn(
      `Cannot set reactive property on undefined, null, or primitive value: ${target}`
    )
  }
  if (isReadonly(target)) {
    __DEV__ && warn(`Set operation on key "${key}" failed: target is readonly.`)
    return
  }
  const ob = (target as any).__ob__ // 拿到目标对象的observe的实例
  // 判断是否为数组  将当前数组上长度和动态修改的索引进行比较 之后调用重写的splice方法 
  // 对新增的数据进行数据劫持  通知watcher进行更新
  if (isArray(target) && isValidArrayIndex(key)) { 
    target.length = Math.max(target.length, key)
    target.splice(key, 1, val)
    // when mocking for SSR, array methods are not hijacked
    if (ob && !ob.shallow && ob.mock) {
      observe(val, false, true)
    }
    return val
  }
  // 如果是对象本身的属性 直接进行赋值
  if (key in target && !(key in Object.prototype)) {
    target[key] = val
    return val
  }
  if ((target as any)._isVue || (ob && ob.vmCount)) {
    __DEV__ &&
      warn(
        'Avoid adding reactive properties to a Vue instance or its root $data ' +
          'at runtime - declare it upfront in the data option.'
      )
    return val
  }
  // 如果没有ob属性，则代表当前目标对象不是响应式数据，直接赋值输一局
  if (!ob) {
    target[key] = val
    return val
  }
  // 以上条件都不成立，则调用defineReactive定义响应式数据 进行依赖收集
  defineReactive(ob.value, key, val, undefined, ob.shallow, ob.mock)
  // 之后通知界面进行更新
  if (__DEV__) {
    ob.dep.notify({
      type: TriggerOpTypes.ADD,
      target: target,
      key,
      newValue: val,
      oldValue: undefined
    })
  } else {
    ob.dep.notify()
  }
  return val
}
```

#### 对`Vue`组件化的理解

- 组件化开发能答复大幅提高应用开发效率、测试性、复用性等
- 组件使用按分类有：页面组件、业务组件、通用组件；
- 常用的组件化技术：属性props、自定义事件、插槽等主要用于组件之间的通信和扩展
- 降低组件更新范围，只重新渲染变化的组件
- 组件的特点：高内聚、低耦合、单项数据流等

#### template和JSX有什么区别

对于运行时来说，只要保证组件存在`render`函数即可，则有了预编译之后，只需要保证构建过程中生成`render`函数就可以，在`webpack`中，使用`vue-loader`编译`.vue`文件，内部依赖的`vue-template-compiler`模块，在`webpack`构建过程中，将`template`预编译`render`函数。与`react`类似，在添加了`jsx`的语法糖解析器`babel-plugin-transform-vue-jsx`之后，就可以直接手写`render`函数
所以，`template`和`jsx`的都是`render`的一种表现形式，不同的是：`JSX`相对与`template`而言有更高的灵活性，在复杂的组件中，更具有优势，而`template`虽然显得呆滞，但是`template`在代码结构上更符合与逻辑分离的习惯，更简单、更直观、更好维护

#### mixin和mixins有哪些区别

- `mixin`是全局混入，会影响到每个组件实例，通常插件是这样做初始化的（vuex vueRouter）
- `mixins`是局部混入，如果多个组件中有相同的业务逻辑，就可以把这个业务逻辑剥离出来，通过`mixins`混入代码。
- 另外`mixins`混入的钩子函数会高于组件的钩子函数执行。遇到同名属性会采用就近原则，以组件中的数据为基准

#### 常用的Vue性能优化方法

1. 图片优化
1. 禁止生成.map文件
1. 路由懒加载
1. cdn引入公共库
1. GZIP压缩
#### .use的实现原理

- `Vue.use`方法是用来使用插件的，我们可以在插件中扩展全局的组件，指令，原型上的方法，
- 会调用插件的install方法，将Vue 的构造函数传入进去，方便插件使用，统一Vue 版本
#### 常见的.修饰符

- `.stop`：等同于 JavaScript 中的 `event.stopPropagation()` ，防止事件冒泡；
- `.prevent` ：等同于 JavaScript 中的 `event.preventDefault()` ，防止执行预设的行为（如果事件可取消，则取消该事件，而不停止事件的进一步传播）；
- `.capture` ：与事件冒泡的方向相反，事件捕获由外到内；
- `.once` ：只会触发一次。
#### Vue组件之间传值的方式和之前的区别

1. 父子组件间的通信 
   1. 子组件通过props属性接收父组件传递的数据。父组件在子组件标签注册监听事件，子组件通过$emit触发事件来向父组件发送数据
   1. 通过ref给子组件设置一个名字，父组件通过$refs组件名获取子组件，拿取数据。
   1. 组件可以通过$parent和$children获取当前组件的父子组件也能拿到数据
2. 兄弟组件通信 
   1. 使用eventBus的方法。本质是通过创建一个空的Vue实例作为消息传递的对象，通信的组件引入这个实例，在这个实例上监听和触发事件，来实现通信
   1. 通过$parent/$refs获取到兄弟组件进行通信
3. 任意组件 
   1. 使用eventBus。事件总线通过$on $emit $once $off
4. 隔代组件
   1. $attrs和$listeners
   2. provide和inject

#### Vue为什么采用异步渲染

如果是同步更新渲染，多次对一个或者多个属性赋值，会频繁触发`dom`更新新，浪费性能
同时因为引入了虚拟`dom`，当属性发生变化，属性的关联的`dep`属性通知页面进行更新，页面更新时会调用`render`函数，生成新的虚拟`dom`，再由新老虚拟`dom`差异比对进行更新。如果是同步更新，频繁更新属性都会执行以上操作，浪费性能

### 生命周期

#### Vue中生命周期钩子如何实现

- Vue的生命周期钩子就是回调函数而已，当创建组件实例的过程中会调用对应额钩子方法
- 内部会对钩子函数进行处理，将钩子函数维护成数组的形式

```javascript
import { mergeOptions } from "../utils"
export function globalApi(Vue) {
  Vue.options = {} // Vue本身有options属性是空对象
  Vue.mixin = function (options) {  // mixin混入，在这个方法里合并配置对象
    this.options = mergeOptions(this.options,options) // 将用户传的options和本身的options进行合并
    return this
  }
  Vue.components = {}
  Vue.options._base = Vue
  Vue.component = function(id,definition) {
    definition = this.options._base.extend(definition)
    // console.log(id,definition);
  }

  Vue.extend = function(opts) {
    const Super = this
    let Sub = function VueComponent() {
      this._init()
    }
    Sub.prototype = Object.create(Super)
    Sub.prototype.constructor = Sub
    Sub.options = mergeOptions(Super.options,opts)
    return Sub
  }

}
```

```javascript
export function isFunction(value) {
  return typeof value === 'function'
}
export function isObject(value) {
  return typeof value === 'object' && value != null
}

// 生命周期策略模式
const lifecycle = ['beforeCreate', 'created', 'beforeMount', 'mounted', 'beforeUpdate', 'updated', 'beforeDestroy', 'destroyed']
let strategy = {}
function mergeHook(parentVal, childVal) {
  if (childVal) { // 第一次parentVal是空对象，拿去childValue
    if (parentVal) {
      return parentVal.concat(childVal) // 之后第二次进行合并时parentVal就是第一次合并的[childVal]，进行返回
    } else {
      return [childVal] // 返回[childVal]
    }
  } else {
    return parentVal
  }
}

lifecycle.forEach(key => { // 遍历生命周期的name在strategy中定义函数用来合并生命周期的方法
  strategy[key] = mergeHook
})
export function mergeOptions(parent, child) {
  const options = {}
  for (let key in parent) { // 遍历parent的key
    mergeFiled(key)
  }
  for (let key in child) { 
    if (parent.hasOwnProperty(key)) { // 如果child中的key在parent 跳出循环 
      continue;
    }
    mergeFiled(key) // 如果不在 调用mergeFiled => options[key] = childVal
  }

  function mergeFiled(key) {
    let parentVal = parent[key] // 拿去parent的值
    let childVal = child[key]
    if (strategy[key]) { // 如果当前key属于生命周期中字段
      options[key] = strategy[key](parentVal, childVal) // 合并生命周期
    } else {
      if (isObject(parentVal) && isObject(childVal)) { // 如果是对象形式进行简答的合并 
        options[key] = { ...parentVal, ...childVal }
      } else {
        options[key] = childVal || parentVal// 如果父中的key是undefined 直接将子中的childVal返回
      }
    }
  }
  return options
}
```

#### Vue的生命周期钩子方法有哪些？一般在哪一步发送请求及原因

Vue实例有一个完整生命周期，也就是从开始创建、初始化数据、编译模板、挂载`dom`、渲染、更新->渲染、卸载等一系列过程，这就是Vue的生命周期

1. beforeCreate(创建前)：数据观测和初始化事件还未开始，不能通过`this`访问组件上的属性
2. created（创建后）：实例创建完成，可以通过`this`访问的data、watch、computed、methods的属性，但此时渲染节点还未挂载到`dom`，不能拿取dom。
3. beforeMount（挂载前）：在挂载开始之前被调用，相关的 render函数首次被调用，生成真实dom，但还没挂载到html页面上
4. mounted（挂载后）在el被新创建的vm.$el替换，并挂载到实例上去之后被调用。这一阶段可以操作dom
5. beforeUpdate（更新前）：数据更新，此时页面中数据还是旧的，data中的数据是更新后的。
6. updated（更新后）：页面显示的数据和data中的数据已经保持同步，都是最新的
7. beforeDestory（销毁前）：实例销毁前调用，这一步仍然可以通过`this`访问到实例上的属性，可以做一些解绑自定义事件、清除定时器等
8. destoryed（销毁后）：实例销毁后调用。

#### Vue子组件和父组件生命周期执行顺序
- 加载渲染： 
   1. 父组件 beforeCreate
   2. 父组件 created
   3. 父组件 beforeMount
   4. 子组件 beforeCreate
   5. 子组件 created
   6. 子组件 beforeMount
   7. 子组件 mounted
   8. 父组件 mounted
- 更新过程 
   1. 父组件 beforeUpdate
   2. 子组件 beforeUpdate
   3. 子组件 updated
   4. 父组件 updated
- 销毁过程 
   1. 父组件 beforeDestroy
   2. 子组件 beforeDestroy
   3. 子组件 destroyed
   4. 父组件 destroyed
#### 一般在哪个生命周期请求异步数据

- 在created、beforeMount、mounted中进行调用，因为在这三个钩子函数中，组件中的数据初始化完毕，可以将服务端返回的数据进行赋值
- 一般还是在created和mounted中发送请求（更快的获取服务端数据），created中无法拿到dom节点，mounted可以拿到真实的dom节点，根据业务的实际情况进行选择。

#### keep-alive

- `keep-alive`是vue提供的一个内置组件，用来对组件进行缓存，在组件切换过程中将状态保留到内存中，防止重复渲染dom
- 如果一个组件包裹`keep-alive`，那么他会多出两个生命周期，`deactivated`和`activated`。同时`beforeDestroy`和`destroyed`不会再被触发。因为组件没有真正的销毁

### 虚拟dom

#### 虚拟dom的理解

- 虚拟dom就是用js对象来描述真实的dom节点，是对真实dom的抽象。数据发生变化页面更新会使用新创建的虚拟节点和将上一次渲染时缓存的虚拟节点进行对比，然后根据diff算法比对差异只更新需要更新的真实DOM节点，从而避免不必要的 DOM 操作，节省一定的性能。
- 虚拟dom不依赖平台的真实环境实现跨平台

#### Vue为什么需要虚拟dom

- 操作真实dom性能消耗高，操作对象性能消耗低，操作真实dom转化为操作js对象，再进过diff算法比对差异进行更新（减少对真实dom的操作保证性能的下限）
- 虚拟dom不依赖平台的真实环境实现跨平台

#### Vue中diff算法原理

在新老虚拟`dom`对比时

1. 先比较是否是相同节点，如果不是相同节点，通过旧虚拟节点和新虚拟节点对比属性名和key是否相同，

如果不相同，通过旧虚拟节点的真实节点拿到父节点，直接替换子节点

2. 如果相同节点对比属性，并复用老节点，之后判断一方有子节点和没有子节点的情况（如果新虚拟dom没有子节点会删除旧节点的子节点，如果新虚拟`dom`有子节点旧子节点没有，将新虚拟dom的子节点插入旧节点的孩子节点是哪个）
3. 如果都有儿子节点，对比儿子节点（diff算法核心），儿子节点平级比较，不考虑跨级比较的情况。内部采用深度递归+双指针的方式进行比较
4. 优化比较：头头、尾尾、头尾、尾头
5. 暴力比对，查找进行复用

```javascript

export function patch(oldElm, vnode) {
  const isRealDom = oldElm && oldElm.nodeType
  if (isRealDom) {
    let el = createElm(vnode) // 根据虚拟节点创建真实节点
    let parentElm = oldElm.parentNode // 拿去旧节点的父节点 body
    parentElm.insertBefore(el, oldElm.nextSibling) // 在旧节点的下一个节点钱插入编译好的真实节点
    parentElm.removeChild(oldElm);  // 移除旧的节点 进行模板替换
    return el  // 将渲染好的真实节点返回
  } else { // 对比虚拟节点 替换真实节点
    if (oldElm.tagName !== vnode.tagName) { // 如果节点的名称不同 找到父节点进行替换
      oldElm.el.parentNode.replaceChild(createElm(vnode), oldElm.el)
    }

    if (!oldElm.tagName) { // 如果是文本节点 当前oldElm.tagName为undefined
      if (oldElm.text !== vnode.text) { // 对比文本内容 如果不同进行赋值
        oldElm.el.textContent = vnode.text
      }
    }

    let el = vnode.el = oldElm.el // 将真实dom赋值给新虚拟节点的el属性
    // 对比属性  传入新虚拟节点 和 旧节点的属性
    updateProps(vnode, oldElm.data)

    // 对比孩子属性
    let newChildren = vnode.children || []
    let oldChildren = oldElm.children || []
    if (newChildren.length > 0 && oldChildren.length > 0) { // 如果children的长度都大于0
      patchChildren(el, newChildren, oldChildren) // 对比孩子节点 传入 （父节点,新虚拟节点list,旧虚拟节点list）
    } else if (newChildren.length > 0) { // 如果新虚拟节点length大于0 旧虚拟节点length = 0
      newChildren.forEach(i => { // 遍历新虚拟节点 依次添加父节点的子节点
        el.appendChild(createElm(i))
      })
    } else if (oldChildren.length > 0) { // 如果旧虚拟节点length大于0 新虚拟节点length = 0
      oldChildren.forEach(i => { // 遍历新虚拟节点 依次从父节点移除子节点
        el.removeChild(i.el)
      })
    }
    return el
  }
}

export function createElm(vnode) {
  const { tagName, data, key, children, text } = vnode
  if (tagName) { // 如果是元素节点
    vnode.el = document.createElement(tagName) // 创建元素节点
    updateProps(vnode) // 更新当前节点的属性
    if (children && children.length > 0) { // 判断当前节点是否有子节点
      children.forEach(child => { // 遍历子节点
        return vnode.el.appendChild(createElm(child)) //将子节点添加到父节点上
      })
    }
  } else { // 如果是文本节点
    vnode.el = document.createTextNode(text) // 返回文本节点
  }
  return vnode.el // 返回当前编译好的当前元素节点 用于添加子节点 最后将编译好的根节点返回
}

function isSameTag(newChild, oldChild) {
  return newChild.tagName ===oldChild.tagName && newChild.key == oldChild.key
}

function updateProps(vnode, oldVnodeData = {}) { // 更新当前节点的属性
  const el = vnode.el // 拿去当前真实dom
  const newData = vnode.data || {} // 拿去当前节点的属性
  const oldData = oldVnodeData // 拿去旧节点的属性 默认为空对象

  const newStyle = newData.style || {} // 拿去当前虚拟节点样式属性
  const oldStyle = oldVnodeData.style || {}  // 拿去旧虚拟节点样式属性

  for (const key in oldStyle) { // 遍历旧样式属性
    if (!newStyle[key]) { // 如果新样式属性中没有当前key
      el.style[key] = "" // 真实dom的style属性的key置为空
    }
  }

  for (const key in oldData) { // 同理遍历旧虚拟节点的属性
    if (!newData[key]) { // 如果新虚拟节点的属性没有当前key
      el.removeAttribute(key) // 真实dom移除当前属性
    }
  }


  for (const key in newData) { // 遍历属性
    if (Object.hasOwnProperty.call(newData, key)) {
      if (key === 'style') { // 如果当前属性key为style
        for (const key in newData.style) { // 遍历style对象
          el.style[key] = newData.style[key] // 给当前真实节点添加样式
        }
      } else if (key === 'class') { // 如果当前key是class 给当前真实节点添加class
        el.className = newData.class
      } else {
        el.setAttribute(key, newData[key]) // 设置其他属性比如 a:1 <div a="1">
      }
    }
  }
}

function makeChildrenMap(children) {
  let map = {}
  children.forEach((item,index) => {
    if(item.key) {
      map[item.key] = index
    } 
  })
  return map
}

// 双指针对比孩子虚拟节点
function patchChildren(parent, newChildren, oldChildren) { 
  let newStartIndex = 0 
  let newStartVnode = newChildren[0]
  let newEndIndex = newChildren.length - 1
  let newEndVnode = newChildren[newEndIndex]


  let oldStartIndex = 0
  let oldStartVnode = oldChildren[0]
  let oldEndIndex = oldChildren.length - 1
  let oldEndVnode = oldChildren[oldEndIndex]
  // 收集旧虚拟节点的子节点 存在map中{key:index}
    let map = makeChildrenMap(oldChildren)
    while (newStartIndex <= newEndIndex && oldStartIndex <= oldEndIndex) {
    if(oldStartVnode == null) { //因为暴力对比,匹配到的节点为置为null  所以当遇到节点为null的向下递加向上递减
      oldStartVnode = oldChildren[++oldStartIndex]
    }else if(oldEndVnode == null){
      oldEndVnode = oldChildren[--oldEndIndex]
      // 如果新虚拟节点的开头 和 旧虚拟节点的开头 相同
    }else if(isSameTag(newStartVnode,oldStartVnode)) {
      patch(oldStartVnode,newStartVnode) // 对比子节点 
      newStartVnode = newChildren[++newStartIndex]
      oldStartVnode = oldChildren[++oldStartIndex]
      // 如果新虚拟节点的结尾 和 旧虚拟节点的结尾 相同
    }else if(isSameTag(newEndVnode,oldEndVnode)) {
      patch(oldEndVnode,newEndVnode)
      oldEndVnode = oldChildren[--oldEndIndex]
      newEndVnode = newChildren[--newEndIndex]
      // 如果新虚拟节点的结尾 和 旧虚拟节点的开始 相同
    }else if(isSameTag(newEndVnode,oldStartVnode)) {
      patch(oldStartVnode,newEndVnode)
      parent.insertBefore(oldStartVnode.el,oldEndVnode.el.nextSibling)
      oldStartVnode = oldChildren[++oldStartIndex]
      newEndVnode = newChildren[--newEndIndex]
      // 如果新虚拟节点的开始 和 旧虚拟节点的结尾 相同
    }else if(isSameTag(newStartVnode,oldEndVnode)) {
      patch(oldEndVnode,newStartVnode)
      parent.insertBefore(oldEndVnode.el,oldStartVnode.el)
      newStartVnode = newChildren[++newStartIndex]
      oldEndVnode = oldChildren[--oldEndIndex]
    }else {
      // 暴力对比  
      // 未进入while之前 已经存了map对象 {key:index}
      // 如果之前的条件都未成立 通过新虚拟节点的key 去map中查找 到index 
      let moveIndex = map[newStartVnode.key]
      if(!moveIndex) { // 如果没查找到 将虚拟节点转为真实dom 添加到父节点中
        parent.insertBefore(createElm(newStartVnode),oldStartVnode.el)
      }else { // 通过index 可以拿到旧虚拟节点
        let moveVnode = oldChildren[moveIndex]
        patch(moveVnode,newStartVnode) // 对比节点
        oldChildren[moveIndex] = null // 将旧节点置为null 进行占位
        parent.insertBefore(moveVnode.el,oldStartVnode.el) // 添加真实dom
      }
      newStartVnode = newChildren[++newStartIndex]
    }
  }

  // 当跳出while循环
    // 新的子节点开始大于结尾  
    // 遍历开始和结尾的长度 通过newChildren拿到虚拟dom 从父节点中添加
  if(newStartIndex <= newEndIndex) {
    for (let i = newStartIndex; i <= newEndIndex; i++) {
      // newChildren[newEndIndex+1] 代表从开始加或者从结尾加
      let el = newChildren[newEndIndex+1] == null  ? null : newChildren[newEndIndex+1].el
      parent.insertBefore(createElm(newChildren[i]),el)     
    }
  }
  // 旧的子节点开始大于结尾
  // 遍历开始和结尾的长度 父节点中移除子节点
  if(oldStartIndex <= oldEndIndex) {
    for (let i = oldStartIndex; i <= oldEndIndex; i++) {
      if(!oldChildren[i]) {
        parent.removeChild(oldChildren[i].el)
      }
    }
  }



}


// 首先 判断 旧的虚拟节点是否为元素节点 nodeType
// 如果是元素节点代表是真实的dom 需要进行渲染操作
// 递归遍历虚拟节点 创建真实节点 在这一过程中将虚拟节点的data属性 挂载到生成真实dom节点的属性上
```

#### Vue中key的作用和原理？

- `Vue`在`patch`过程中（新老虚拟dom对比）通过`key`和`tagName`来判断两个虚拟节点是否是相同节点。
- 无key会导致更新时出现问题，只会对比标签名是否相同，如果相同就进行对比更新子节点，达不到复用的效果
- 尽量不要采用索引作为`key`
- ![image.png](https://cdn.nlark.com/yuque/0/2022/png/1684797/1657423029273-61fa1d62-450a-42c7-8fce-cd38bda9ecf3.png#clientId=u78438ae1-750f-4&crop=0&crop=0&crop=1&crop=1&from=paste&height=501&id=u4b29a07b&margin=%5Bobject%20Object%5D&name=image.png&originHeight=655&originWidth=827&originalType=binary&ratio=1&rotation=0&showTitle=false&size=169893&status=done&style=none&taskId=u94a1a54e-a36a-4d04-8370-fb78142f812&title=&width=632#crop=0&crop=0&crop=1&crop=1&id=qnBuI&originHeight=655&originWidth=827&originalType=binary&ratio=1&rotation=0&showTitle=false&status=done&style=none&title=)

### VueRouter
  #### VueRouter的懒加载

  - 普通路由引用: 静态引用（只有打包时引入），使用webpack打包后文件异常大，造成进入首页时，加载内容过多时间长，造成白屏不利于用户体验。
  - 路由组件懒加载:  动态引入（动态加载对应的组件对象） 
    - 在打包时路由组件会被单独打包(代码分割: code split)
    - 默认不请求加载路由组件打包文件，当请求路径对应路由组件时才请求加载(按需加载)
  - 运用懒加载会通过路由路径对页面进行划分，减少首屏加载js文件，提高速度，代码分割 对应组件单独单独打包
  ```javascript
  // 普通加载
  import Home from '@/views/Home'
  const routes = [
    {
      path: '/home',
      name: 'home',
      component: Home
    }
  ]

  // 使用箭头函数+import动态加载
  const routes = [
    {
      path: '/home',
      name: 'home',
      component: () => import('@/views/Home')
    }
  ]
  // 使用箭头函数+require动态加载
  const router = new Router({
    routes: [
    {
      path: '/list',
      component: resolve => require(['@/components/list'], resolve)
    }
    ]
  })
  ```
  #### 路由的hash和history模式的区别

  - VueRouter有两种模式：hash模式和history模式。默认的路由模式为hash模式
  - hash模式 
    - 简介：hash模式是开发中默认的模式，它的URL带着一个#，例如：http://www.abc.com/#/vue，它的hash值就是#/vue
    - 发请求的路径：[http://localhost:8080](http://localhost:8080)  访问的项目的根路径
    - 响应：返回的总是根据路由路径匹配到多个路由组件打包后的index页面，自动引入打包后的js ==> path部分被解析为前台路由路径
    - 特点：hash值会出现在URL里面，但是不会出现在HTTP请求中，对后端完全没有影响。vue-router插件绑定在原生hashchange的方法，如果hash值发生改变去匹配对应的matched。
  - history模式 
    - history模式的URL中没有#，它使用的是传统的路由分发模式，即用户在输入一个URL时，后台服务器会接收这个请求，并解析这个URL，然后做出相应的逻辑处理。如果后台没有正确配置，访问时会返回404。
  #### 如何获取页面hash变化

  - 监听$route的变化
  ```javascript
  watch: {
    $route: {
      handler: function(val, oldVal){
        console.log(val);
      },
      // 深度观察监听
      deep: true
    }
  }
  ```

  - window.location.hash读取hash值
  #### $route和$router的区别

  - $route是路由信息对象，包括path、name、params、query、hash等路由信息参数
  - $router是路由实例对象包括了路由跳转的方法，钩子函数等
  #### 如何定义动态路由？

  - params方式 
    -  配置路由方式格式：/router/:id 
    -  传递方式：在path后面跟上对应值 
    -  传递后形成的路径：/router/123 
  ```javascript
    //在APP.vue中
    <router-link :to="'/user/'+userId" replace>用户</router-link>    

    //在index.js
    {
       path: '/user/:userid',
       component: User,
    },
  ```

    -  路由跳转 
  ```javascript
  // 方法1：
  <router-link :to="{ name: 'users', params: { uname: wade }}">按钮</router-link>

  // 方法2：
  this.$router.push({name:'users',params:{uname:wade}})

  // 方法3：
  this.$router.push('/user/' + wade)
  ```

    -  参数获取 
        - 通过$route.params.userId获取传递值
  - query方式 
    - 配置路由格式：/router，普通路由配置
    - 传递方式：对象中使用query的key作为传递方式（类似get请求）
    - 传递后形成的路径：/router?id=123
    - 路由定义
  ```javascript
  //方式1：直接在router-link 标签上以对象的形式
  <router-link :to="{path:'/profile',query:{name:'why',age:28,height:188}}">档案</router-link>

  // 方式2：写成按钮以点击事件形式
  <button @click='profileClick'>我的</button>    

  profileClick(){
    this.$router.push({
      path: "/profile",
      query: {
          name: "kobi",
          age: "28",
          height: 198
      }
    });
  }
  ```

    - 路由跳转
  ```javascript
  // 方法1：
  <router-link :to="{ name: 'users', query: { uname: james }}">按钮</router-link>

  // 方法2：
  this.$router.push({ name: 'users', query:{ uname:james }})

  // 方法3：
  <router-link :to="{ path: '/user', query: { uname:james }}">按钮</router-link>

  // 方法4：
  this.$router.push({ path: '/user', query:{ uname:james }})

  // 方法5：
  this.$router.push('/user?uname=' + jsmes)
  ```

    - 获取参数
  ```javascript
  $route.query
  ```
  #### 路由导航守卫
### Vuex
  #### Vuex理解
  Vuex是一个专为Vue.js应用程序开发的状态管理模式。每个Vuex应用的核心就是store，“store”基本上就是一个容器，它包含着你的应用大部分的状态（state）
    - Vuex的状态存储是响应式的。当Vue组件从store中读取状态时，若store中状态发生变化，那会对应的组件也会更新
    - 改变store中的状态唯一途径显示地（commit）mutation，这样可以方便跟踪每个状态的变化
    - 主要包括以下几个模块
      - state：Vuex的基本数据，用于存储变量（data中定义的属性）
      - getter：根据state中已有的数据产生新的数据（计算属性）
      - mutation：用于直接提交更新state数据方法
      - action：和mutation功能类似，都是用于提交更新，但action提交的是mutation，而不是直接变更数据，并且action支持异步操作
      - module：模块化Vuex，每个模块都有自己的state、mutation、action、getter等
    - 总结：Vuex是一个单向数据流，在全局拥有一个state存放数据，当组件要更改state中的数据时，必须通过mutation提交修改的信息，mutation同时提供了订阅者模式供外部调用更新state中数据。而当所有异步操作必须需要走action,但action也是无法直接修改state的,还是需要通过mutation来修改state的数据。getter是中的数据时根据state中已有的数据产生的新数据（计算属性）
  #### Vuex中action和mutation的区别
    - mutation更专注于修改state中的数据，必须是同步执行。 触发mutation，是通过Vuex实例上的commit方法，接收两个参数(事件类型，参数)
    - action提交的是mutation，而不是直接更新数据，可以是异步的，可以同时提交多个mutation。触发action，是通过Vuex实例上的dispath方法，接收两个参数（mutation的类型，参数）
    -mutation的参数是state，包含store中的数据；action的参数是context，他是关于Vuex实例上一些属性或者方法
  #### Vuex中state和localStorage的区别
    - vuex中的state是存储在内存中，页面关闭或刷新数据丢失。localStorage存储在本地，存储时只能存取字符串类型的数据，对于引用数据类型需要通过JSON.stringify转为字符串。读取vuex中数据的速度要比读取localStorage速度要快
    - vuex中的数据是响应式的，数据发生变化界面更新，localstorage中更新数据需要刷新
    - vuex应用于组件之间的传值，localStorage主要用于不同界面之间的传递
  #### Vuex和单纯的全局对象有什么区别
    - vuex的状态是响应式数据，当Vue组件中使用到state中的数据，数据发生变化，界面会自动更新
    - 不能直接修改state中的数据，必须通过commit提交mutation的方法进行数据更新，这样方便跟踪状态的变化。
  #### 为什么Vuex的mutation中不能做异步操作
    - Vuex中所有的状态更新都要依赖commit提交mutation，方便跟踪每个状态的变化
    - 每个mutation执行完成后都会对应一个新的状态变更，这样devTools就可以打个快照保存下来，方便调试跟踪


