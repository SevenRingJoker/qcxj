var vm = new Vue({
	el: '#gameList',
	data: {
		gameList: [],
	},
	methods: {
		open: function(url) {
			if(url.indexOf('http') > -1) {
				url = document.location.protocol + "//" + url.split('://')[1]
			}
			openWindow(url);
		}
	}
});

$(function() {
	mui.showLoading("正在加载..","div");
	ajaxPost(baseUrl + 'gameList/getList', {
		pageNo: 1,
		pageSize: 999,
		isShow: 'true'
	}, function(res) {
		mui.hideLoading();
		vm.gameList = res.data;
		console.log(vm.gameList)
	}, function(res) {
		mui.hideLoading();
		mui.toast('获取游戏接口异常');
	})

});

function openIframe(url, title) {
	window.localStorage.setItem('title', title);
	window.localStorage.setItem('pageUrl', url);
	openWindow('../../views/iframe/iframe.html')
}