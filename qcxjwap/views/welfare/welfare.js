var vm = new Vue({
	el: '#search-page',
	data: {
		productList: [],
		baseUrl: baseUrl,
		pageNo: 0,
		pageSize: 10,
		pageCount: 1,
		userInfo:{}
	}
});

$(function() {
	vm.userInfo=userInfo;
	getData();
	$(window).scroll(function(e) {
		if ($(document).scrollTop() >= $(document).height() - $(window).height()) {
			if (vm.pageNo >= vm.pageCount) {
				return false;
			} else {
				getData()
			}
		}
	})

})



mui('.product-list').on('tap', '.product-item', function() {
	if (checkLogin()) {
		openWindow('../../views/mallDetail/mallDetail.html?productId=' + this.getAttribute('productId'))
	} else {
		plusToast("您还没登录，请先登录")
	}
})

var getProductsUrl = baseUrl + 'product/getList'

function getData(search, type, cb) {
	mui.showLoading("正在加载..", "div");
	vm.pageNo += 1;
	ajaxPost(getProductsUrl, {
		pageNo: vm.pageNo,
		pageSize: vm.pageSize,
		isShow: 'true',
		isJoinWelfare: 'true'
	}, function(res) {
		if (res.data.length > 0) {
			vm.productList = vm.productList.concat(res.data)
			vm.pageCount = res.pageResults.pageCount
		} else {
			vm.pageNo -= 1;
		}
		mui.hideLoading();

	}, function(xhr) {})
}
