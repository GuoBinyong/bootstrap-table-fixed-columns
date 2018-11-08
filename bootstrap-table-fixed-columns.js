/**
 * @author 郭斌勇  <guobinyong@qq.com>
 * @version: v1.0.2
 *
 * 修复了源项目的如下bug：
 * - 通过 bootstrapTable 的 mergeCells 方法合并单元格时，冻结的列标题没有合并效果；
 * - 修复了单元格跨行合并时，冻结的列标题的所有列都会进行相应的行合并的bug；
 * - 优化了部分代码；
 *
 * # 新增方法
 * 我给 bootstrapTable 增加了如下方法：
 *
 * - 冻结列：
 * ```
 * $('#table').bootstrapTable('fixedColumns', fixedNumber);
 * @param fixedNumber : number 冻结的列数
 * ```
 */

(function ($) {
    'use strict';

    $.extend($.fn.bootstrapTable.defaults, {
        fixedColumns: false,
        fixedNumber: 1
    });

    var BootstrapTable = $.fn.bootstrapTable.Constructor,
        _initHeader = BootstrapTable.prototype.initHeader,
        _initBody = BootstrapTable.prototype.initBody,
        _resetView = BootstrapTable.prototype.resetView,
        //保存原来的 mergeCells 方法
        _mergeCells = BootstrapTable.prototype.mergeCells;

    //重载 mergeCells 方法
    BootstrapTable.prototype.mergeCells = function(){
        _mergeCells.apply(this, Array.prototype.slice.apply(arguments));

        //在 mergeCells 方法被调用后，初始化对冻结列进行初始化
        this.fixedColumns();
    }


    /**
     * 冻结列
     * @param fixedNumber : number 冻结的列数
     */
    BootstrapTable.prototype.fixedColumns = function(fixedNumber){

        if  (fixedNumber != null){
            this.options.fixedColumns = true ;
            this.options.fixedNumber = fixedNumber ;
        }

        if (!this.options.fixedColumns) {
            return;
        }

        //根据源项目的实际调用顺序来设置以下3个方法的调用顺序
        this.initHeaderForFixedColumns();
        this.resetViewForFixedColumns();
        this.initBodyForFixedColumns();

    };



    BootstrapTable.prototype.initFixedColumns = function () {
        this.$fixedHeader = $([
            '<div class="fixed-table-header-columns">',
            '<table>',
            '<thead></thead>',
            '</table>',
            '</div>'].join(''));

        this.timeoutHeaderColumns_ = 0;
        this.$fixedHeader.find('table').attr('class', this.$el.attr('class'));
        this.$fixedHeaderColumns = this.$fixedHeader.find('thead');
        this.$tableHeader.before(this.$fixedHeader);

        this.$fixedBody = $([
            '<div class="fixed-table-body-columns">',
            '<table>',
            '<tbody></tbody>',
            '</table>',
            '</div>'].join(''));

        this.timeoutBodyColumns_ = 0;
        this.$fixedBody.find('table').attr('class', this.$el.attr('class'));
        this.$fixedBodyColumns = this.$fixedBody.find('tbody');
        this.$tableBody.before(this.$fixedBody);
    };


    BootstrapTable.prototype.initHeaderForFixedColumns = function () {

        this.initFixedColumns();

        var that = this, $trs = this.$header.find('tr').clone();
        $trs.each(function () {
            $(this).find('th:gt(' + that.options.fixedNumber + ')').remove();
        });
        this.$fixedHeaderColumns.html('').append($trs);
    };


    BootstrapTable.prototype.initHeader = function () {
        _initHeader.apply(this, Array.prototype.slice.apply(arguments));

        if (!this.options.fixedColumns) {
            return;
        }

        this.initHeaderForFixedColumns();
    };





    BootstrapTable.prototype.initBodyForFixedColumns = function () {

        var that = this,
            rowspan = 0;

        this.$fixedBodyColumns.html('');
        this.$body.find('> tr[data-index]').each(function () {
            var $tr = $(this).clone();

            $tr.html('');
            var end = that.options.fixedNumber;

            for (var i = 0; i < end; i++) {
                $tr.append($tds.eq(i).clone());
            }
            that.$fixedBodyColumns.append($tr);
        });
    };

    BootstrapTable.prototype.initBody = function () {
        _initBody.apply(this, Array.prototype.slice.apply(arguments));

        if (!this.options.fixedColumns) {
            return;
        }
        this.initBodyForFixedColumns()
    };



    BootstrapTable.prototype.resetViewForFixedColumns = function () {

        clearTimeout(this.timeoutHeaderColumns_);
        this.timeoutHeaderColumns_ = setTimeout($.proxy(this.fitHeaderColumns, this), this.$el.is(':hidden') ? 100 : 0);

        clearTimeout(this.timeoutBodyColumns_);
        this.timeoutBodyColumns_ = setTimeout($.proxy(this.fitBodyColumns, this), this.$el.is(':hidden') ? 100 : 0);
    };

    BootstrapTable.prototype.resetView = function () {
        _resetView.apply(this, Array.prototype.slice.apply(arguments));

        if (!this.options.fixedColumns) {
            return;
        }
        this.resetViewForFixedColumns();
    };

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



    //

    /**
     * 往 bootstrapTable 中注入新的方法 fixedColumns
     * 参数是 fixedNumber ，数字类型，表示冻结的列数
     */
    $.fn.bootstrapTable.methods.push("fixedColumns")

})(jQuery);
