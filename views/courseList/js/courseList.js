var vm = new Vue({
	el: '#course-list',
	data: {
		courseList: [],
		pageNo: 1,
		pageCount: 1,
		pageSize: 10,
		titleText: getQueryString('state')
	}
});

mui('#course-list').on('tap', '.course-item', function() {
	if(mui.os.plus) {
		window.localStorage.setItem('pageUrl', this.getAttribute('url'));
		window.localStorage.setItem('title', getQueryString('state'));
		openWindow('../iframe/iframe.html')
	} else {
		openWindow(this.getAttribute('url'))
	}

});

document.querySelector('title').innerHTML = vm.titleText;

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
	ajaxPost(getCourseListUrl, {
		pageNo: vm.pageNo,
		pageSize: vm.pageSize,
//		state: getQueryString('state')
	}, function(res) {
		if(res.data.length > 0) {
			if(init) {
				vm.courseList = res.data;
			} else {
				vm.courseList = vm.courseList.concat(res.data);
			}
			vm.pageCount = res.pageResults.pageCount;
			vm.pageNo += 1;
			cb && cb();
		} else {
			cb && cb();
		}
	}, function(xhr) {})
}