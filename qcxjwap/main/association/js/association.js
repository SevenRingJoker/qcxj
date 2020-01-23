var getListUrl = baseUrl + 'community/getList';
var praiseUrl = baseUrl + 'commPraise/save';
var saveShareUrl = baseUrl + 'community/save';

var vm = new Vue({
	el: '#association',
	data: {
		list: [],
		pageNo: 1,
		pageSize: 10,
		pageCount: 1,
		picture: JSON.parse(localStorage.getItem('cacheData')),
		imgs: [],
		vedioSrc: '' //http://www.cilongdianzikeji.com/qcxj/uploadfile/user/f1e49ae555dc481a.mp4
	}
});

mui.previewImage();
if (checkLogin()) {
	mui.showLoading("正在加载..", "div");
}
getData(true, function() {
	mui.hideLoading();
})

$(window).scroll(function(e) {
	//	if($(document).scrollTop() <= 0) {
	//		vm.pageNo = 1;
	//		mui.showLoading("正在加载..", "div");
	//		getData(true, function() {
	//			mui.hideLoading();
	//		})
	//	}

	if ($(document).scrollTop() >= $(document).height() - $(window).height()) {
		//		alert("滚动条已经到达底部！");
		if (vm.pageNo > vm.pageCount) {
			//			plusToast("没有更多数据啦~")
			return false;
		}
		mui.showLoading("正在加载..", "div");
		getData(false, function() {
			mui.hideLoading();
		})
	}
})
//pullRefresh('.mui-scroll', function(self, index) {
//	self.endPullDownToRefresh();
//	vm.pageNo = 1;
//	getData(true, function() {
//		self.endPullDownToRefresh();
//		self.refresh(true);
//	})
//}, function(self, index) {
//	//	self.endPullUpToRefresh(true);
//	if(vm.pageNo > vm.pageCount) {
//		self.endPullUpToRefresh(true);
//		return false;
//	}
//	getData(false, function() {
//		self.endPullUpToRefresh(vm.pageNo > vm.pageCount);
//	});
//}, true);

function getData(init, cb) {
	if (!JSON.parse(localStorage.getItem('userInfo'))) {
		plusToast('您还没登陆，请先登录');
		return false;
	}
	ajaxPost(getListUrl, {
		pageNo: vm.pageNo,
		pageSize: vm.pageSize,
		praiseUserId: JSON.parse(localStorage.getItem('userInfo')).id,
		type: '社区',
		status: '通过',
		
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
		$.each(res.data, function(i, value) {
			if (getSuffix(value.filePath) == 'mp4' || getSuffix(value.filePath) == 'flv' || getSuffix(value.filePath) ==
				'avi' || getSuffix(value.filePath) == 'MOV') {
				value.filePath = 'imgs/lookVideo.jpg';
			} else {
				value.filePath = fileUrl + value.filePath.split('|')[0];
			}
		});
		if (init) {
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
mui('.msg-box').on('tap', ".share", function() {
	var msgId = this.getAttribute('msgId');
	var msgIndex = this.getAttribute('msgIndex');
	var shareNum = Number(vm.list[msgIndex].share) + 1;
	var isVedio = false,
		isPic = false,
		msg = null;
	var pics = [];
	vm.list[msgIndex].filePath && vm.list[msgIndex].filePath.split('|').forEach(function(v) {
		if (getSuffix(v) == 'mp4' || getSuffix(v) == 'flv' || getSuffix(v) == 'avi' || getSuffix(v) == 'MOV') {
			isVedio = true
		}
		if (getSuffix(v) == 'jpg' || getSuffix(v) == 'jpeg' || getSuffix(v) == 'png' || getSuffix(v) == 'gif') {
			isPic = true
		}
		pics.push(fileUrl + v);
	});

	if (isVedio) {
		// 分享视频
		msg = {
			type: 'video',
			content: vm.list[msgIndex].content,
			thumbs: ['../imgs/logo.png'],
			media: pics[0]
		}
	} else if (isPic) {
		// 分享图片
		msg = {
			type: 'image',
			pictures: pics,
			content: vm.list[msgIndex].content
		}
	} else {
		// 分享文字
		msg = {
			type: 'text',
			content: vm.list[msgIndex].content
		}
	}
	mui.plusReady(function() {
		window.plusShare(msg, function(status) {
			//				console.log(JSON.stringify(status))
			ajaxPost(saveShareUrl, {
				id: msgId,
				userId: JSON.parse(localStorage.getItem('userInfo')).id,
				share: shareNum
			}, function(res) {
				vm.list[msgIndex].share = shareNum;
				//					isSheared = true;
				//					plusToast('分享成功!');
			}, function() {
				//					isSheared = true;
				ajaxError()
			})
		})
	})
});

// 点赞
var isRepeat = true;
mui('.msg-box').on('tap', '.praise', function() {
	if (isRepeat) {
		isRepeat = false;
		var msgId = this.getAttribute('msgId');
		var msgIndex = this.getAttribute('msgIndex');
		if (vm.list[msgIndex].isParise == 'true') {
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