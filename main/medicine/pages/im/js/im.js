var historyMsgUrl = baseUrl + 'iMLog/getList';
//var clearMsgCount = baseUrl + 'iMLog/delByImId';
var vm = new Vue({
	el: '#im-page',
	data: {
		content: '',
		msglist: [],
		pageNo: 1,
		pageCount: 1,
		pageSize: 10,
		curUserId: '',
		height:0,
		top:0
	}
});
vm.curUserId = JSON.parse(localStorage.getItem('userInfo')).id;

mui.previewImage();

var sendBol = true;

function sendFn() {
	if(vm.content.trim() == '') {
		return false
	}
	if(sendBol) {
		sendBol = false
		var dateStr = new Date().toLocaleDateString();
		ajaxPost(baseUrl + 'user/sendMsg', {
			//		urseId: JSON.parse(window.localStorage.getItem('userInfo')).id,
			userId: getQueryString('seviceId'),
			content: '<div>' + vm.content + '</div>'
		}, function(res) {
			createChatDom({
				date: '刚刚',
				userName: JSON.parse(localStorage.getItem('userInfo')).userName,
				content: '<div>' + vm.content + '</div>',
				isSelf: true
			});
			vm.content = '';
			sendBol = true;
		}, function() {
			ajaxError()
		})
	}
}
// 发送图片
var PicUploadUrl = baseUrl + 'file/uploadImage?state=user';
uploader('#send-pic', PicUploadUrl, function() {
	mui.showLoading("发送中..", "div");
}, null, function(file, res) {
	var imgPath = fileUrl + res.imgPath;
	ajaxPost(baseUrl + 'user/sendMsg', {
		userId: getQueryString('seviceId'),
		content: "<img src='" + imgPath + "' data-preview-src='' data-preview-group='1'/>"
	}, function(res) {
		console.log(imgPath)
		createChatDom({
			date: '刚刚',
			userName: JSON.parse(localStorage.getItem('userInfo')).userName,
			content: "<img src='" + imgPath + "' data-preview-src='' data-preview-group='1'/>",
			isSelf: true
		}, function() {
			mui.hideLoading()
		});
		vm.content = '';
		sendBol = true;
	}, function() {
		mui.hideLoading()
		ajaxError()
	})
}, null, null, true);

//mui('.mui-scroll-wrapper').scroll();
//mui('.mui-scroll-wrapper').scroll().scrollToBottom();
window.onload = function() {
	var h = $(window).height() - 50 - $('.mui-bar-nav').outerHeight(true) - $('.bottom-textarea').outerHeight();
	vm.height = h;
	vm.top =  $('.mui-bar-nav').outerHeight(true) + 50;
	$("#bg").css({
		height: h,
		top: $('.mui-bar-nav').outerHeight(true) + 50
	})
	console.log(vm.top)
	$('.mui-scroll-wrapper').css({
		height: h,
		top: $('.mui-bar-nav').outerHeight(true) + 50
	});
}

function getData(init, cb) {
	console.log(historyMsgUrl)
	ajaxPost(historyMsgUrl, {
		//		toUserId: JSON.parse(window.localStorage.getItem('userInfo')).id,
		//		userId: getQueryString('seviceId'),
		iMId: getQueryString('imId'),
		editStatus: getQueryString('editStatus') ? 'true' : 'false'
	}, function(res) {
		if(init) {
			console.log(res)
			vm.msglist = res.data;
		} else {
			vm.msglist = vm.msglist.concat(res.data);
		}
		//		vm.pageCount = res.pageResults.pageCount;
		//		vm.pageNo += 1;
		cb && cb();
	}, function(xhr) {
		cb && cb();
	})
}

if(getQueryString('imId')) {
	getData(true, function() {
		mui.showLoading("正在加载..", "div");
		setTimeout(function() {
			mui('.mui-scroll-wrapper').scroll()
			mui('.mui-scroll-wrapper').scroll().scrollToBottom();
			mui.hideLoading();
		}, 1000)
	});
}
//var isLoading = true;
//var scrollObj = mui('.mui-scroll-wrapper').scroll();
//document.querySelector('.mui-scroll-wrapper').addEventListener('scroll', function(e) {
//	if(isLoading) {
//		isLoading = false;
//		var scrollTop = -scrollObj.y;
//		//		if(scrollTop >= -scrollObj.maxScrolly) {
//		//			// 判断滚动条到底部
//		////			console.log('到底部了');
//		//			
//		//		}
//		if(scrollTop <= 0) {
//			// 判断滚动条到顶部
//			//		console.log('到顶部了');
//			//			mui('.mui-scroll-wrapper').scroll().scrollToBottom();
//			//			mui.showLoading("正在加载..", "div");
//			//			getData(false, function() {
//			//				mui.hideLoading();
//			//			})
//		}
//	}
//});

function createChatDom(msg, cb) {
	var dateStr = msg.createDate ? msg.createDate : msg.date;
	var userName = msg.user ? msg.user.userName : msg.userName;
	var content = msg.content;
	console.log(content)
	var className = msg.isSelf ? 'text-right' : ''
	var wrapHtml = '<div class="msg-item ' + className + '">' +
		'<div class="color-000 font-b font-30">' +
		'<span class="color-999 font-22">' + dateStr + '</span> ' + userName +
		'</div><div class="color-333 msg-content">' + content + '</div>' +
		'</div>';
	$(".msg-list").append(wrapHtml);
	var scroll = mui('.mui-scroll-wrapper').scroll();
	scroll.reLayout();
	scroll.scrollToBottom();
	cb && cb();
}
mui('#im-page').on('tap', '#text-area', function(){
	setTimeout(function(){ this.scrollIntoView(true);},500)
})