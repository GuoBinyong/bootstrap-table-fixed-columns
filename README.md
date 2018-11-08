[源项目]: https://github.com/wenzhixin/bootstrap-table-fixed-columns


本项目 从 [源项目][] Fork 而来，旨在解决原项目的bug； 目前已经解决了如下 bug:

# 已解决的问题
- 通过 bootstrapTable 的 mergeCells 方法合并单元格时，冻结的列标题没有合并效果；
- 修复了单元格跨行合并时，冻结的列标题的所有列都会进行相应的行合并的bug；
- 优化了部分代码；


# 新增方法
我给 bootstrapTable 增加了如下方法：

**冻结列：**  
```
$('#table').bootstrapTable('fixedColumns', fixedNumber);
@param fixedNumber : number 冻结的列数
```


# bootstrap-table-fixed-columns

Fixed Columns extension of [bootstrap-table](https://github.com/wenzhixin/bootstrap-table)

## Demo

* [Via JavaScript](http://issues.wenzhixin.net.cn/bootstrap-table/#extensions/fixed-columns.html)
* [Via data attributes](http://jsfiddle.net/wenyi/e3nk137y/2946/)
* [Fixed height](http://jsfiddle.net/wenyi/e3nk137y/2954/)

## Options

### data-fixed-columns / fixedColumns

* type: Boolean
* description: set `true` to enable fixed columns.
* default: `false`

### data-fixed-number / fixedNumber

* type: Number
* description: the number of fixed columns.
* default: `1`

## License

The MIT License.