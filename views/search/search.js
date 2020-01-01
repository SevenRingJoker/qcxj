var vm = new Vue({
	el: '#search-page',
	data: {
		search: '',
		type: '',
		productList: [],
		baseUrl: baseUrl,
		queryType: '',
		pageNo: 0,
		pageSize: 10,
		pageCount: 1,
		adUrl: [],
		adFilePath: [],
	}
});
var cacheData = JSON.parse(localStorage.getItem('cacheData'));
vm.adUrl = cacheData.advertisingUrl.split('|')
vm.adFilePath = cacheData.advertisingFilePath.split('|');
if(vm.adFilePath.length > 4) {
	var indexArr = [];
	var tempUrl = [];
	var tempFilePath = []
	while(indexArr.length < 4) {
		var curIndex = fnRand(0, vm.adFilePath.length);
		var bol = true
		indexArr.forEach(function(v) {
			if(v == curIndex) {
				bol = false
			}
		})
		if(bol) {
			indexArr.push(curIndex)
		}
	}
	indexArr.forEach(function(v) {
		tempUrl.push(vm.adUrl[v]);
		tempFilePath.push(vm.adFilePath[v]);
	});
	vm.adUrl = tempUrl;
	vm.adFilePath = tempFilePath;
}

$(function() {
	vm.queryType = getQueryString('queryType') != null ? getQueryString('queryType') : '';
	vm.search = getQueryString('keyword') != null ? getQueryString('keyword') : '';
	getData(vm.search, vm.queryType);
	$(window).scroll(function(e) {
		if($(document).scrollTop() >= $(document).height() - $(window).height()) {
			if(vm.pageNo >= vm.pageCount) {
				return false;
			} else {
				getData(vm.search, vm.queryType)
			}
		}
	})

})

mui('.search-bar').on('tap', '.search-btn', function() {
	document.querySelector('.search-bar input').blur();
	if(!vm.search) {
		plusToast('请输入搜索内容');
		return false;
	}
	vm.showBanner = true;
	vm.pageNumber = 1;
	getData(vm.search, '', true);
	vm.search = ''
});

document.onkeydown = function(event) {
	var e = event || window.event;
	if(e && e.keyCode == 13) { //回车键的键值为13
		document.querySelector('.search-bar input').blur();
		if(!vm.search) {
			plusToast('请输入搜索内容');
			return false;
		}
		vm.showBanner = true;
		vm.pageNumber = 1;
		getData(vm.search, '', true);
		vm.search = ''
	}
};

mui('.product-list').on('tap', '.product-item', function() {
	if(checkLogin()) {
		openWindow('../../views/mallDetail/mallDetail.html?productId=' + this.getAttribute('productId'))
	} else {
		plusToast("您还没登录，请先登录")
	}
})
//});

var getProductsUrl = baseUrl + 'product/getList'

function getData(search, type, cb) {
	mui.showLoading("正在加载..", "div");
	vm.pageNo += 1;
	ajaxPost(getProductsUrl, {
		pageNo: vm.pageNo,
		pageSize: vm.pageSize,
		search: search,
		type: type,
		isShow: 'true'
	}, function(res) {
		if(res.data.length > 0) {
			vm.productList = vm.productList.concat(res.data)
			vm.pageCount = res.pageResults.pageCount
		} else {
			vm.pageNo -= 1;
		}
		mui.hideLoading();

	}, function(xhr) {})
}

function back() {
	openWindow('../../main/index/index.html')
}