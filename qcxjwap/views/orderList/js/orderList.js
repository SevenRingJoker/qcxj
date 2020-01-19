var vm = new Vue({
	el: '#order-list',
	data: {
		lists: [],
		pageNo: 1,
		pageSize: 10,
		pagesCount: 1,
		status: '',
		payCount: 0,
		sendCount: 0,
		deliveryCount: 0,
		receivedCount: 0,
		reimburseCount: 0,
		orderOptionList:[
			{name:"全部",count:0},
			{name:"待支付",count:0},
			{name:"待发货",count:0},
			{name:"待收货",count:0},
			{name:"已收货",count:0},
			{name:"待评价",count:0},
			{name:"申请退款",count:0},
		],
		optionIn:0
	},
	methods:{
		optionChange(index){
			this.optionIn = index;
			mui.showLoading("正在加载..", "div");
			vm.pageNo = 1;
			getData(true, function() {
				mui.hideLoading(); //隐藏后的回调函数
			});
		}
	}
});
//var userInfo = JSON.parse(localStorage.getItem('userInfo'));
$(function() {

	//	var ws = plus.webview.currentWebview();
	vm.status = '';
	//	if(ws.index) {
	//		$('.haeder-tab .status').removeClass('active');
	//		$('.haeder-tab .status').eq(Number(ws.index)).addClass('active');
	//	}
	pullRefresh('.data-list.mui-scroll', function(self, index) {
		self.endPullDownToRefresh();
		vm.pageNo = 1;
		getData(true, function() {
			self.endPullDownToRefresh();
			self.refresh(true);
		});
		//		waittingClose();
	}, function(self, index) {
		if(vm.pageNo > vm.pagesCount) {
			self.endPullUpToRefresh(true);
			return false;
		}
		getData(false, function() {
			self.endPullUpToRefresh(vm.pageNo > vm.pagesCount);
		});
		//		waittingClose();
	}, true);
	$('.haeder-tab .status').click(function() {
		mui.showLoading("正在加载..", "div");
		$(this).addClass('active').siblings('div').removeClass('active');
		vm.pageNo = 1;
		var statusText = $(this).find('.statusText').text();
		console.log(statusText)
		if(statusText == '待支付') {
			vm.status = '待支付'
		} else if(statusText == '待发货') {
			vm.status = '待发货'
		} else if(statusText == '待收货') {
			vm.status = '待收货';
		} else if(statusText == '已收货') {
			vm.status = '已收货'
		} else if(statusText == '待评价') {
			vm.status = '待评价'
		} else if(statusText == '申请退款') {
			vm.status = '申请退款'
		} else {
			vm.status = ''
		}
		getData(true, function() {
			mui.hideLoading(); //隐藏后的回调函数
			$('.data-list').css('transform', 'translate3d(0, 0, 0)');
		});
	});

	mui('.list-box').on('tap', '.order', function() {
		var order = JSON.parse(this.getAttribute('obj'));
		orderDetail(order);
	});
});

function getData(init, cb) {
	let status;
	if(vm.orderOptionList[vm.optionIn].name == "全部"){
		status = "";
	}else{
		status = vm.orderOptionList[vm.optionIn].name;
	}
	ajaxPost(getStatusOrder, {
		userId: JSON.parse(localStorage.getItem('userInfo')).id,
		pageNo: vm.pageNo,
		pageSize: vm.pageSize,
		// status: vm.status
		status: status
	}, function(res) {
		console.log(res)
		if(!isNullObject(res.pageResults)) {
			if(init) {
				vm.lists = res.data
			} else {
				vm.lists = vm.lists.concat(res.data)
			}
			vm.pagesCount = res.pageResults.pageCount;
			vm.pageNo += 1;
			cb && cb();
		} else {
			cb && cb();
		}
	}, function() {
		plusToast('请求出错');
		cb && cb();
	})
}

function orderDetail(item) {
	if(!checkLogin()) {
		plusToast("您还没登陆，请先登陆！")
		return false;
	}
	openWindow('../orderDetails/orderDetails.html?orderId=' + item.id)
}

getOrderCount();

function getOrderCount() {
	ajaxPost(baseUrl + 'order/statusCount', {
		userId: JSON.parse(localStorage.getItem('userInfo')).id
	}, function(res) {
		console.log(res)
		vm.orderOptionList[0].count = res.payList.length +  res.sendList.length + res.deliveryList.length + res.receivedList.length+res.reimburseList.length;
		vm.orderOptionList[1].count = res.payList.length;//待支付
		vm.orderOptionList[2].count = res.sendList.length;//待发货
		vm.orderOptionList[3].count = res.deliveryList.length;//待收货
		vm.orderOptionList[4].count = res.receivedList.length;//已收货
		vm.orderOptionList[5].count = res.payList.length;//待评价
		vm.orderOptionList[6].count = res.reimburseList.length;//申请退款

		vm.payCount = res.payList.length;
		vm.sendCount = res.sendList.length;
		vm.deliveryCount = res.deliveryList.length;
		vm.receivedCount = res.receivedList.length;
		vm.reimburseCount = res.reimburseList.length;
	}, function(res) {
		mui.toast('获取订单数量接口失败');
	});

}