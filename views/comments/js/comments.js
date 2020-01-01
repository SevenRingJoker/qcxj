var getCommunityUrl = baseUrl + 'community/get';
var getCommunityListUrl = baseUrl + 'community/getList';
var saveCommunityUrl = baseUrl + 'community/save';
var userInfo = JSON.parse(localStorage.getItem('userInfo'));
var msgId = getQueryString('msgId');

var vm = new Vue({
	el: '#comments-box',
	data: {
		item: null,
		list: [],
		pageNo: 1,
		pageSize: 10,
		pageCount: 1,
		content: '',
		picture: JSON.parse(localStorage.getItem('cacheData'))
	},
	computed:{
		listChange(){
			return this.list;
		}
	}
});
mui.previewImage();
getCommunityItem();
//getComments(getQueryString('msgId'));

function getCommunityItem() {
	ajaxPost(getCommunityUrl, {
		id: getQueryString('msgId'),
		pageNo: 1,
		pageSize: 1
	}, function(res) {
		vm.item = res.community;
		getComments(msgId, true, function() {})
		//		setTimeout(function() {
		//			var top = $(".msg-list").outerHeight(true) + $(".category-title").outerHeight(true) + 44;
		//			$(".top").css('top', top);
		//		}, 1000);
		//		pullRefresh('.mui-scroll', function(self, index) {
		//			self.endPullDownToRefresh();
		//			vm.pageNo = 1;
		//			getComments(msgId, true, function() {
		//				self.endPullDownToRefresh();
		//				self.refresh(true);
		//			})
		//		}, function(self, index) {
		//			//	self.endPullUpToRefresh(true);
		//			if(vm.pageNo > vm.pageCount) {
		//				self.endPullUpToRefresh(true);
		//				return false;
		//			}
		//			getComments(msgId, false, function() {
		//				self.endPullUpToRefresh(vm.pageNo > vm.pageCount);
		//			});
		//		}, true);
	}, function() {
		ajaxError()
	});
}

function saveCommunity() {
	ajaxPost(saveCommunityUrl, {
		productId: msgId,
		userId: userInfo.id,
		userName: userInfo.userName,
		type: '评论',
		content: vm.content
	}, function(res) {
		// vm.list.unshift(res.community);
		plusToast('评论成功！')
		vm.content = '';
		document.getElementById("pl").value="";
		// getComments();
		location.reload();
	}, function() {
		ajaxError();
	});
}

function getComments(msgId, init, cb) {
	ajaxPost(getCommunityListUrl, {
		pageNo: vm.pageNo,
		pageSize: vm.pageSize,
		productId: msgId,
		type: '评论'
	}, function(res) {
		console.log(res.data)
		if(init) {
			console.log(res.data)
			vm.list = res.data;
		} else {
			vm.list = vm.list.concat(res.data);
		}
		vm.pageCount = res.pageResults.pageCount;
		vm.pageNo += 1;
		cb && cb();
	}, function() {
		cb && cb();
		ajaxError();
	})
}

mui(".bottom-textarea").on('tap', '.commont-btn', function() {
	if(!vm.content) {
		plusToast('评论内容不能为空');
		return false;
	}
	saveCommunity();
});

$(window).scroll(function(e) {
//	if($(document).scrollTop() <= 0) {
//		vm.pageNo = 1;
//		mui.showLoading("正在加载..", "div");
//		getComments(true, function() {
//			mui.hideLoading();
//		})
//	}

	if($(document).scrollTop() >= $(document).height() - $(window).height()) {
		//		alert("滚动条已经到达底部！");
		if(vm.pageNo > vm.pageCount) {
			return false;
		}
		mui.showLoading("正在加载..", "div");
		getComments(msgId, false, function() {
			mui.hideLoading();
		})
	}
})

//function back() {
//	goback();
//	history.go(-1);
//}