/**
 * @author 郭斌勇  <guobinyong@qq.com>
 * @version: v1.0.2
 *
 * 修复了源项目的如下bug：
 * - 更改核心代码的逻辑，使冻结列的内容和样式与 bootstrapTable 尽量一致，以免其它潜在的bug；
 * - 通过 bootstrapTable 的 mergeCells 方法合并单元格时，冻结的列标题没有合并效果；
 * - 修复了单元格跨行合并时，冻结的列标题的所有列都会进行相应的行合并的bug；
 * - 优化了部分代码；
 * - 修复了改变窗口尺寸时，冻结的列不会自动调整大小的bug;
 * - 修复了冻结列的底部露出非标题内容的bug；
 *
 *
 * # 新增方法
 * 我给 bootstrapTable 增加了如下方法：
 *
 * - 初始化冻结列组件：
 * ```
 * $('#table').bootstrapTable('initFixedColumns', fixedNumber);
 * @param fixedNumber : number 冻结的列数
 * ```
 *
 *
 * - 刷新冻结列组件
 * ```
 * $('#table').bootstrapTable('initFixedColumns');
 * ```
 * 
 * 
 * 
 * # 注意
 * - 如果冻结的列中不能有空单元格，如果需要空单元格，可在单元格中插入空格字符
 * 
 */

(function ($) {
    'use strict';

    $.extend($.fn.bootstrapTable.defaults, {
        fixedColumns: false,
        fixedNumber: 1
    });

    var BootstrapTable = $.fn.bootstrapTable.Constructor;







    //重载 initContainer：开始
    var _initContainer = BootstrapTable.prototype.initContainer ;

    BootstrapTable.prototype.initContainer = function(){
        _initContainer.apply(this, Array.prototype.slice.apply(arguments));

        if (!this.options.fixedColumns) {
            return;
        }

        this.initContainerForFixedColumns();
    }


    BootstrapTable.prototype.initContainerForFixedColumns = function () {
          //$fixedHeader：开始
          this.$fixedHeader = $('<div class="fixed-table-header-columns">');
          this.timeoutHeaderColumns_ = 0;
          this.$tableHeader.before(this.$fixedHeader);
        //$fixedHeader：结束



        //$fixedBody：开始
        this.$fixedBody = $('<div class="fixed-table-body-columns">');

        var $fixedBodyTable = $('<table>');
        $fixedBodyTable.addClass(this.$el.attr('class'));

        this.$fixedBody.append($fixedBodyTable);
        this.$fixedBodyTable = $fixedBodyTable ;

          this.timeoutBodyColumns_ = 0;
          this.$tableBody.before(this.$fixedBody);
        //$fixedBody：结束

      };

    //重载 initContainer：结束





    // 重载 fitHeader：开始

    var _fitHeader = BootstrapTable.prototype.fitHeader ;
    BootstrapTable.prototype.fitHeader = function () {
        _fitHeader.apply(this, Array.prototype.slice.apply(arguments));

        if (!this.options.fixedColumns) {
            return;
        }

        this.resetHeaderForFixedColumns();
    };


    BootstrapTable.prototype.resetHeaderForFixedColumns = function () {

        var tableHeader = this.$tableHeader.children("table");
        var tableHeaderClone = tableHeader.clone(true,true);
        tableHeaderClone.removeAttr("style");

        var fixedNumber = this.options.fixedNumber

        var $trs = tableHeaderClone.find('tr');

        $trs.each(function (trIndex,tr) {

            var totalColspan = 0;

            $(tr).children().filter(function (thIndex) {
                 var colspan = $(this).attr('colspan') || 1 ;
                 totalColspan += colspan;

                 return totalColspan > fixedNumber ;
            }).remove();
        });

        this.$fixedHeader.empty();
        this.$fixedHeader.append(tableHeaderClone);
    };

    // 重载 fitHeader：结束






    // 重载 initBody：开始

    var _initBody = BootstrapTable.prototype.initBody;

    BootstrapTable.prototype.initBody = function () {
        _initBody.apply(this, Array.prototype.slice.apply(arguments));

        if (!this.options.fixedColumns) {
            return;
        }
        this.initBodyForFixedColumns()
    };


    BootstrapTable.prototype.initBodyForFixedColumns = function () {

        var $fixedBodyTbody = this.$body.clone(true,true);

        var fixedNumber = this.options.fixedNumber;


        var $trs = $fixedBodyTbody.children();

        $trs.each(function (trIndex,tr) {

            var totalColspan = 0;

            $(tr).children().filter(function (thIndex) {
                var colspan = $(this).attr('colspan') || 1 ;
                totalColspan += colspan;

                return totalColspan > fixedNumber ;
            }).remove();
        });

        this.$fixedBodyTable.empty();
        this.$fixedBodyTable.append($fixedBodyTbody);

    };

    // 重载 initBody：结束



    // 重载 resetView：开始

    var _resetView = BootstrapTable.prototype.resetView;

    BootstrapTable.prototype.resetView = function () {
        _resetView.apply(this, Array.prototype.slice.apply(arguments));

        if (!this.options.fixedColumns) {
            return;
        }
        this.resetViewForFixedColumns();
    };


    BootstrapTable.prototype.resetViewForFixedColumns = function () {

        clearTimeout(this.timeoutHeaderColumns_);
        this.timeoutHeaderColumns_ = setTimeout($.proxy(this.fitHeaderColumns, this), this.$el.is(':hidden') ? 100 : 0);

        clearTimeout(this.timeoutBodyColumns_);
        this.timeoutBodyColumns_ = setTimeout($.proxy(this.fitBodyColumns, this), this.$el.is(':hidden') ? 100 : 0);
    };

    // 重载 resetView：开始



    BootstrapTable.prototype.fitHeaderColumns = function () {
        var that = this,
            visibleFields = this.getVisibleFields(),
            headerWidth = 0;

        this.$body.find('tr:first-child:not(.no-records-found) > *').each(function (i) {
            var $this = $(this),
                index = i;

            if (i >= that.options.fixedNumber) {
                return false;
            }

            if (that.options.detailView && !that.options.cardView) {
                index = i - 1;
            }

            that.$fixedHeader.find('th[data-field="' + visibleFields[index] + '"]')
                .find('.fht-cell').width($this.innerWidth());
            headerWidth += $this.outerWidth();
        });
        this.$fixedHeader.width(headerWidth + 1).show();
    };



    BootstrapTable.prototype.fitBodyColumns = function () {
        var that = this,
            top = -(parseInt(this.$el.css('margin-top')) - 2),
            // the fixed height should reduce the scorll-x height
            //后面的数字可用于调节tbody的冻结列 $fixedBody 的高度与$tableBody的差值
            height = this.$tableBody.height() - 14;

        if (!this.$body.find('> tr[data-index]').length) {
            this.$fixedBody.hide();
            return;
        }

        if (!this.options.height) {
            top = this.$fixedHeader.height();
            height = height - top;
        }

        this.$fixedBody.css({
            width: this.$fixedHeader.width(),
            height: height,
            top: top
        }).show();

        this.$body.find('> tr').each(function (i) {
            that.$fixedBody.find('tr:eq(' + i + ')').height($(this).height() - 1);
        });

        // events
        this.$tableBody.on('scroll', function () {
            that.$fixedBody.find('table').css('top', -$(this).scrollTop());
        });
        this.$body.find('> tr[data-index]').off('hover').hover(function () {
            var index = $(this).data('index');
            that.$fixedBody.find('tr[data-index="' + index + '"]').addClass('hover');
        }, function () {
            var index = $(this).data('index');
            that.$fixedBody.find('tr[data-index="' + index + '"]').removeClass('hover');
        });
        this.$fixedBody.find('tr[data-index]').off('hover').hover(function () {
            var index = $(this).data('index');
            that.$body.find('tr[data-index="' + index + '"]').addClass('hover');
        }, function () {
            var index = $(this).data('index');
            that.$body.find('> tr[data-index="' + index + '"]').removeClass('hover');
        });
    };











    //重载 mergeCells：开始

    //保存原来的 mergeCells 方法
    var _mergeCells = BootstrapTable.prototype.mergeCells;

    //重载 mergeCells 方法
    BootstrapTable.prototype.mergeCells = function(){
        _mergeCells.apply(this, Array.prototype.slice.apply(arguments));

        //在 mergeCells 方法被调用后，刷新冻结列组件
        this.refreshFixedColumns();
    }
    //重载 mergeCells：结束





    //重载 resetWidth：开始
    var _resetWidth = BootstrapTable.prototype.resetWidth;

    BootstrapTable.prototype.resetWidth = function(){

        _resetWidth.apply(this, Array.prototype.slice.apply(arguments));

        if (!this.options.fixedColumns) {
            return;
        }

        this.resetViewForFixedColumns();
    }

    //重载resetWidth：结束


















    //初始化冻结列：开始

    /**
     * 初始化冻结列组件
     * @param fixedNumber : number 冻结的列数
     */
    BootstrapTable.prototype.initFixedColumns = function(fixedNumber){

        if  (fixedNumber != null){
            this.options.fixedColumns = true ;
            this.options.fixedNumber = fixedNumber ;
        }

        if (!this.options.fixedColumns) {
            return;
        }


        this.initContainerForFixedColumns();    //初始化容器
        this.refreshFixedColumns();     //刷新冻结列组件

    };



    /**
     * 刷新冻结列组件
     */
    BootstrapTable.prototype.refreshFixedColumns = function(){

        if (!this.options.fixedColumns) {
            return;
        }

        this.resetHeaderForFixedColumns();      //重设冻结列的标题行
        this.initBodyForFixedColumns();         //重置冻结列的标题列
        this.resetViewForFixedColumns();        //重置view

    };



    /**
     * 往 bootstrapTable 中注入以下新的方法
     * - initFixedColumns ： 初始化冻结列组件
     * 参数是 fixedNumber ，数字类型，表示冻结的列数
     *
     * - initFixedColumns : 刷新冻结列组件
     */
    $.fn.bootstrapTable.methods.push("initFixedColumns","refreshFixedColumns");

    //初始化冻结列：结束



})(jQuery);
