var getNoticeList = baseUrl + 'notice/getList';
var vm = new Vue({
	el: '#notice-list',
	data: {
		notices: [],
		pageNo: 1,
		pageSize: 10,
		pageCount: 1 
	}
});

mui('.notice-list').on('tap', '.notice-item', function(){
	openWindow('../../views/noticeDetail/noticeDetail.html?noticeId=' + this.getAttribute('noticeId'))
});

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

var getCourseListUrl = baseUrl + 'onLine/getList';

function getData(init, cb) {
	ajaxPost(getNoticeList, {
		pageNo: vm.pageNo,
		pageSize: vm.pageSize
	}, function(res) {
		if(res.data.length > 0) {
			if(init) {
				vm.notices = res.data;
			} else {
				vm.notices = vm.notices.concat(res.data);
			}
			vm.pageCount = res.pageResults.pageCount;
			vm.pageNo += 1;
			cb && cb();
		} else {
			cb && cb();
		}
	}, function(xhr) {})
}

window.onload = function() {
	var top = $('.mui-bar').outerHeight(true);
	$('.mui-scroll-wrapper').css('top', top);
}
