var getListUrl = baseUrl + 'community/getList';
var praiseUrl = baseUrl + 'commPraise/save';
var saveShareUrl = baseUrl + 'community/save';
var delectUrl = baseUrl + 'community/del'

var vm = new Vue({
	el: '#association',
	data: {
		list: [],
		pageNo: 1,
		pageSize: 10,
		pageCount: 1,
		headImg:JSON.parse(localStorage.getItem("userInfo")).imgPath
	}
});

mui.previewImage();

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
	ajaxPost(getListUrl, {
		pageNo: vm.pageNo,
		pageSize: vm.pageSize,
		praiseUserId: JSON.parse(localStorage.getItem('userInfo')).id,
		type: '社区',
		status: '通过',
		userId: JSON.parse(localStorage.getItem('userInfo')).id
	}, function(res) {
		//		if(res.data.length > 0) {
		//			if(init) {
		//				vm.list = res.data;
		//			} else {
		//				vm.list = vm.list.concat(res.data);
		//			}
		//			vm.pageCount = res.pageResults.pageCount;
		//			vm.pageNo += 1;
		//			cb && cb();
		//		} else {
		//			cb && cb();
		//		}
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

// 转发
var isSheared = true;
//mui('.msg-box').on('tap', ".share", function() {
//	//	console.log(this.getAttribute('msgId'), '转发成功！');
//	if(isSheared) {
//		isSheared = false;
//		var msgId = this.getAttribute('msgId');
//		var msgIndex = this.getAttribute('msgIndex');
//		var shareNum = Number(vm.list[msgIndex].share) + 1;
//		ajaxPost(saveShareUrl, {
//			id: msgId,
//			userId: JSON.parse(localStorage.getItem('userInfo')).id,
//			share: shareNum
//		}, function(res) {
//			vm.list[msgIndex].share = shareNum;
//			isSheared = true;
//			plusToast('分享成功!');
//		}, function() {
//			isSheared = true;
//			ajaxError()
//		})
//	}
//});

// 点赞
var isRepeat = true;
mui('.msg-box').on('tap', '.praise', function() {
	if(isRepeat) {
		isRepeat = false;
		var msgId = this.getAttribute('msgId');
		var msgIndex = this.getAttribute('msgIndex');
		if(vm.list[msgIndex].isParise == 'true') {
			praise(msgId, function() {
				vm.$set(vm.list[msgIndex], 'praise', vm.list[msgIndex].praise - 1);
				vm.$set(vm.list[msgIndex], 'isParise', 'false');
				isRepeat = true;
			}, function() {
				isRepeat = true;
			})
		} else {
			praise(msgId, function() {
				vm.$set(vm.list[msgIndex], 'praise', vm.list[msgIndex].praise + 1);
				vm.$set(vm.list[msgIndex], 'isParise', 'true');
				isRepeat = true;
			}, function() {
				isRepeat = true;
			})
		}
	}
});

// 评论
mui('.msg-box').on('tap', '.comment', function() {
	openWindow('../../views/comments/comments.html?msgId=' + this.getAttribute('msgId'))
});

function praise(msgId, cb, errorFn) {
	ajaxPost(praiseUrl, {
		communityId: msgId,
		userId: JSON.parse(localStorage.getItem('userInfo')).id
	}, function(res) {
		cb && cb();
	}, function() {
		errorFn();
		ajaxError();
	})
}

mui('.msg-box').on('tap', '.delete-btn', function() {
	var that = this;
	var msgIndex = Number(that.getAttribute('msgIndex'));
	mui.confirm('确定删除？', '提示', ['确定', '取消'], function(e){
		if (e.index == 0) {
			ajaxPost(delectUrl, {
				id: that.getAttribute('msgId')
			}, function(res) {
				vm.list.splice(msgIndex, 1);
				plusToast('删除成功！');
			}, function() {
				ajaxError();
			})
		}
	});
});

window.onload = function() {
	var h = $(window).height() - $(".mui-bar-nav").outerHeight(true);
	$(".mui-scroll-wrapper").height(h);
	$(".mui-scroll-wrapper").css('top', $(".mui-bar-nav").outerHeight(true));
}
