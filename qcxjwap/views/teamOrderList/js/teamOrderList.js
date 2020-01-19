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
	}
});
$(function() {
	vm.status = '';
	mui.showLoading("正在加载..", "div");
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
//		orderDetail(order);
	});
});

function getData(init, cb) {
	ajaxPost(baseUrl+'order/getList', {
		userId: JSON.parse(localStorage.getItem('userInfo')).id,
		pageNo: vm.pageNo,
		pageSize: vm.pageSize,
		status: vm.status,
		teamOrder:'true',
		buyChannel:'hotProduct'
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
		userId: JSON.parse(localStorage.getItem('userInfo')).id,
		teamOrder:'true',
		buyChannel:'hotProduct'
	}, function(res) {
		mui.hideLoading();
		vm.payCount = res.payList.length;
		vm.sendCount = res.sendList.length;
		vm.deliveryCount = res.deliveryList.length;
		vm.receivedCount = res.receivedList.length;
		vm.reimburseCount = res.reimburseList.length;
	}, function(res) {
		mui.toast('获取订单数量接口失败');
	});

}