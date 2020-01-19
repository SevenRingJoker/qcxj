var vm = new Vue({
	el: '#order',
	data: {
		order: {},
	},
	methods: {}
})
var userInfo = JSON.parse(localStorage.getItem('userInfo'));

$(function() {
	ajaxPost(baseUrl + 'order/get', {
		id: getQueryString('orderId'),
	}, function(res) {
		if(res.order != null) {
			console.log(res.order);
			document.getElementsByClassName("qcxj_headBoxViewText")[0].innerHTML = res.order.status;
			vm.order = res.order;
			console.log(vm.order);
		}
	}, function(res) {
		mui.toast('获取订单信息异常')
	})
});

// var orderStatus = _get('orderStatus'); //使用该方法获取上级页面携带过来的参数id
// console.log(orderStatus)
// document.getElementsByClassName("qcxj_headBoxViewText")[0].innerHTML = orderStatus;
//
// function _get(name) {
// 	var  reg = new  RegExp("(^|&)" + name + "=([^&]*)(&|$)");
// 	var  r = window.location.search.substr(1).match(reg);
// 	if(r != null) return   unescape(r[2]);
// 	return  null;
// };

mui(document.body).on('tap', '.takeSuccess', function(e) {
	mui(this).button('loading');
	setTimeout(function() {
		mui(this).button('reset');
	}.bind(this), 2000);
	ajaxPost(baseUrl + 'order/save', {
		id: vm.order.id,
		status: '已收货',
		userId: userInfo.id
	}, function(res) {
		location.reload();
	}, function(res) {
		mui.toast('订单保存异常')
	})

});

mui(document.body).on('tap', '.afterSale', function(e) {
	mui(this).button('loading');
	setTimeout(function() {
		mui(this).button('reset');
	}.bind(this), 2000);
	//	mui.toast('功能模块正在开发中！');
	mui.prompt('输入联系人手机号码，方便客服与你联系！', '请输入联系人手机号码', '售后提示', ['确定', '取消'], function(res) {
		if(res.index == 0) {
			console.log(res.value);
			ajaxPost(baseUrl + 'order/save', {
				id: vm.order.id,
				status: '申请退款',
				afterSaleType: '处理中',
				afterSalePhone: res.value
			}, function(res) {
				mui.toast('操作成功');
				vm.order = res.order;
			}, function(res) {

			})
		}
	}, 'div')
	document.querySelector('.mui-popup-input input').type = 'number'
});

mui(document.body).on('tap', '.buy', function(e) {
	mui(this).button('loading');
	setTimeout(function() {
		mui(this).button('reset');
	}.bind(this), 2000);
	openWindow('../order/order.html?orderId=' + vm.order.id + '&count=' + vm.order.count + '&type=mallDetail')
});

function logisticsDeatils() {
	localStorage.setItem('title', '物流详情')
	localStorage.setItem('pageUrl', 'https://m.kuaidi100.com/result.jsp?nu=' + vm.order.logisticsNum)
	openWindow('../iframe/iframe.html')
}