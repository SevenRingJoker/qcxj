var getListUrl = baseUrl + 'integral/statistics';
var vm = new Vue({
	el: '#my-integral',
	data: {
		list: {},
		state: '当日业绩',
		thisMonth: '',
		thisYear: '',
		today: ''
	},
	updated: function() {
		mui('.mui-scroll-wrapper').scroll({
			deceleration: 0.0005 //flick 减速系数，系数越大，滚动速度越慢，滚动距离越小，默认值0.0006
		});
	}
})

var userInfo = JSON.parse(localStorage.getItem('userInfo'));
$(function() {
	getNum();
	getList();

});

function getNum() {
	ajaxPost(getListUrl, {
		userId: userInfo.id,
		state: '我的业绩'
	}, function(res) {
		console.log(res);
		vm.thisMonth = res.thisMonth[0] != null ? res.thisMonth[0].toFixed(2) : 0;
		vm.thisYear = res.thisYear[0] != null ? res.thisYear[0].toFixed(2) : 0;
		vm.today = res.today[0] != null ? res.today[0].toFixed(2) : 0;
	}, function() {
		plusToast('请求出错')
	})
}

function getList() {
	mui.showLoading("正在加载..", "div");
	ajaxPost(getListUrl, {
		userId: userInfo.id,
		state: vm.state
	}, function(res) {
		mui.hideLoading();
		//		console.log(res);
		if (res.performance.length > 0) {
			vm.list = res.performance
		}
	}, function() {
		plusToast('请求出错')
	})
}

$(".mui-scroll").on("tap", ".mui-control-item", function(event) {
	$('.mui-control-item').removeClass('mui-active');
	$(this).addClass('mui-active');
	vm.state = $(this).text();
	getList();
});
