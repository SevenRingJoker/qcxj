//var getintegralUrl = baseUrl + 'integral/get';
var getListUrl = baseUrl + 'integral/getList';
var loginUrl = baseUrl + 'user/get';
var vm = new Vue({
	el: '#my-integral',
	data: {
		integral: 0,
		list:[],
		pageNo: 1,
		pageCount: 1,
		pageSize: 10,
		dealPassWord: ''
	}
})
var userInfo = JSON.parse(localStorage.getItem('userInfo'));
$(function() {
	
	getintegral();
//	getList();
});

function getintegral() {
	var number = localStorage.getItem('number');
	var passWord = localStorage.getItem('passWord');
	ajaxPost(loginUrl, {
		id: userInfo.id
	}, function(res) {
			localStorage.setItem('userInfo', JSON.stringify(res.user));
			vm.integral = res.user.money;
			vm.dealPassWord = res.user.dealPassWord;
	}, function() {
		ajaxError();
	})
}

//function getList() {
//	ajaxPost(getListUrl, {
//		userId: userInfo.id,
//		pageNo: 1,
//		pageSize: 20
//	}, function(res) {
////		console.log(res);
//		vm.count = res.count
//		if(res.data.length > 0) {
//			vm.list = res.data
//		}
//	}, function() {
//		plusToast('请求出错')
//	})
//}

window.onload = function() {
	var top = $(".show-box").outerHeight(true);
	$('.mui-scroll-wrapper').css('top', top)
}

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
	ajaxPost(getListUrl, {
		userId: userInfo.id,
		pageNo: vm.pageNo,
		pageSize: vm.pageSize,
		type: '月分红'
	}, function(res) {
		if(init) {
			vm.list = res.data;
		} else {
			vm.list = vm.list.concat(res.data);
		}
		vm.pageCount = res.pageResults.pageCount;
		vm.pageNo += 1;
		cb && cb();
	}, function(xhr) {})
}

mui('#my-integral').on('tap', '.bt', function(){
	if (!vm.dealPassWord) {
		plusToast('请完善个人信息，添加交易密码');
		return false;
	}
	openWindow('../extract/extract.html')
})