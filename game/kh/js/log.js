var vm = new Vue({
	el: '#lipstickGameLog',
	data: {
		lipstickGameLogList: [],
		pageNo: 1,
		pageCount: 1
	},
	methods:{
		orderDetails:function(id){
			openWindow('../../views/orderDetails/orderDetails.html?orderId='+id);
		}
	}
});
var user = JSON.parse(localStorage.getItem('userInfo'));

pullRefresh('.mui-scroll', function(self, index) {
	self.endPullDownToRefresh();
	vm.pageNo = 1;
	getData(true, function() {
		self.endPullDownToRefresh();
		self.refresh(true);
	})
}, function(self, index) {
	//	self.endPullUpToRefresh(true);
	if(vm.pageNo > vm.pageCount) {
		self.endPullUpToRefresh(true);
		return false;
	}
	getData(false, function() {
		self.endPullUpToRefresh(vm.pageNo > vm.pageCount);
	});
}, true);

function getData(init, cb) {
	if(!JSON.parse(localStorage.getItem('userInfo'))) {
		plusToast('您还没登陆，请先登录');
		return false;
	}
	ajaxPost(baseUrl + 'lipstickGameLog/getList', {
		pageNo: vm.pageNo,
		pageSize: 10,
		userId: user.id
	}, function(res) {
		if(init) {
			vm.lipstickGameLogList = res.data;
		} else {
			vm.lipstickGameLogList = vm.lipstickGameLogList.concat(res.data);
		}
		vm.pageCount = res.pageResults.pageCount;
		vm.pageNo += 1;
		cb && cb();
	}, function(xhr) {})
}
