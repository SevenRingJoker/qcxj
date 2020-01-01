var getServiceUsersUrl = baseUrl + 'serveUser/getList';
var getOutlineService = baseUrl + 'iM/getList';

var vm = new Vue({
	el: '#serveUser-list',
	data: {
		list: [],
		pageNo: 1,
		pageSize: 10,
		pageCount: 1,
		titleText: '客服',
		curUserId: '',
		fileUrl:fileUrl
	}
});

if(!checkLogin()) {
	plusToast("您还没登录，请先登录");
} else {
	vm.curUserId = JSON.parse(localStorage.getItem('userInfo')).id;
	// 个人中心客服点进来
	if(getQueryString('comeFrom') == 'my') {
		vm.titleText = '聊天'
	}

	window.onload = function() {
		var h = $(window).height() - $(".mui-bar").outerHeight(true) - $('.banner-pic').height();
		$(".list-box").height(h);
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
		//	if(!JSON.parse(localStorage.getItem('userInfo'))) {
		//		plusToast('您还没登陆，请先登录');
		//		return false;
		//	}
		var reqUrl = getQueryString('comeFrom') == 'my' ? getOutlineService : getServiceUsersUrl
		ajaxPost(reqUrl, {
			pageNo: vm.pageNo,
			pageSize: vm.pageSize,
			type: getQueryString('comeFrom') == 'my' ? void 0 : getQueryString('type'),
			subType: getQueryString('comeFrom') == 'my' ? void 0 : getQueryString('subType'),
			userId: getQueryString('comeFrom') == 'my' ? JSON.parse(localStorage.getItem('userInfo')).id : void 0
		}, function(res) {
			if(init) {
				vm.list = res.data;
			} else {
				vm.list = vm.list.concat(res.data);
			}
			//		vm.list = vm.list.filter(function(v) {
			//			return v.user.id != vm.curUserId
			//		});
			vm.pageCount = res.pageResults.pageCount;
			vm.pageNo += 1;
			cb && cb();
		}, function(xhr) {})
	}

	mui(".service-user-list").on('tap', ".service-users", function() {
		if(getQueryString('comeFrom') == 'my') {
			var unread = Number(this.getAttribute('unread'));
			if(unread > 0) {
				openWindow('../im/im.html?seviceId=' + this.getAttribute('userId') + '&imId=' + this.getAttribute('imId') + '&userName=' + this.getAttribute('userName') + '&editStatus=' + true)
			} else {
				openWindow('../im/im.html?seviceId=' + this.getAttribute('userId') + '&imId=' + this.getAttribute('imId') + '&userName=' + this.getAttribute('userName'))
			}
		} else {
			openWindow('../serviceUserDetail/serviceUserDetail.html?userId=' + this.getAttribute('imId') + '&userName=' + this.getAttribute('userName'))
		}
	});

	window.onload = function() {
		var h = $(window).height() - $(".mui-bar-nav").outerHeight(true) - $(".banner-pic").height();
		var top = $(".mui-bar-nav").outerHeight(true) + $(".navTo").outerHeight(true);
		$(".mui-scroll-wrapper").height(h);
		$(".mui-scroll-wrapper").css('top', top);
	}
}