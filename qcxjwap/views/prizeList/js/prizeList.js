var getProdctListUrl = baseUrl + 'product/getList';

var userInfo = JSON.parse(localStorage.getItem('userInfo'));
var vm = new Vue({
	el: '#prize-list',
	data: {
		list: [],
		pageNo: 1,
		pageSize: 10,
		pageCount: 1
	}
});

getData(true);

$(window).scroll(function(e) {
	if($(document).scrollTop() >= $(document).height() - $(window).height()) {
		//		alert("滚动条已经到达底部！");
		if(vm.pageNo > vm.pageCount) {
			//			plusToast("没有更多数据啦~")
			return false;
		}
		mui.showLoading("正在加载..", "div");
		getData(false, function() {
			mui.hideLoading();
		})
	}
})

function getData(init, cb) {
	ajaxPost(getProdctListUrl, {
		pageNo: vm.pageNo,
		pageSize: vm.pageSize,
		isJoinGame: true
	}, function(res) {
		if(init) {
			vm.list = res.data;
		} else {
			vm.list = vm.list.concat(res.data);
		}
		vm.pageNo += 1;
		vm.pageCount = res.pageResults.pageCount;
	}, function() {
		ajaxError();
	})
}

mui(".product-list").on("tap", ".product-item", function() {
	var price = Number(this.getAttribute('price'))
	if(price > Number(userInfo.conversion)) {
		plusToast("您的抵扣券不足")
		return;
	} else {
		
	}
});
