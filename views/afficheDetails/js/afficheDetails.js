var noticegetUrl = baseUrl + 'notice/get';
var vm = new Vue({
	el: '#my-integral',
	data: {
		info:{}
	}
})

$(function() {
	getNotice();
});

var id = getQueryString("id");
function getNotice() {
	ajaxPost(noticegetUrl, {
		id: id
	}, function(res) {
		console.log(res);
		vm.info = res.notice;
	}, function() {
		plusToast('请求出错')
	})
}
