var getNoticeDetail = baseUrl + 'notice/get';

var vm = new Vue({
	el: '#notice-detail',
	data: {
		notice: null
	}
});
if (getQueryString('getMathNotice') == 'true') {
	ajaxPost(baseUrl + 'notice/getMathNotice', {
	}, function(res) {
		vm.notice = res.notice
	}, function() {
		ajaxError();
	})
} else {
	getData(getQueryString('noticeId'));

	function getData(id) {
		ajaxPost(getNoticeDetail, {
			id: id
		}, function(res) {
			vm.notice = res.notice
		}, function() {
			ajaxError();
		})
	}

}
