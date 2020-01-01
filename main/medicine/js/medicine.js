var getMainDataUrl = baseUrl + 'serveType/getList'

var vm = new Vue({
	el: '#medicine-page',
	data: {
		mainDatas: [],
		subDatas: [],
		search: ''
	},
	methods: {
		serveUserDetails: function(id, userName) {
			openWindow('./pages/serviceUserDetail/serviceUserDetail.html?userId=' + id + '&userName=' + userName)
		}
	}
});
getMainData();
var typeName = '';

ajaxPost(baseUrl + 'picture/get', {
	id: 1
}, function(res) {
	if(res.picture != null) {
		$('#headImg').attr({
			'src': fileUrl + res.picture.appServiceFilePath
		})
	}
}, function(res) {
	mui.toast('获取图片接口异常');
})

// state ==>type() subType(子类型)
function getMainData() {
	ajaxPost(getMainDataUrl, {
		state: 'type',
		pageNo: 1,
		pageSize: 99
	}, function(res) {
		vm.mainDatas = res.data;
		vm.$set(vm.mainDatas[0], 'active', true);
		getSubData(vm.mainDatas[0].id);
		typeName = vm.mainDatas[0].name;
	}, function() {
		ajaxError();
	});
}

function getSubData(parentId, cb) {
	ajaxPost(baseUrl + 'serveUser/getList', {
		pageNo: 1,
		pageSize: 200,
		type: parentId
	}, function(res) {
		vm.subDatas = res.data;
		cb && cb();
	}, function() {
		ajaxError();
		cb && cb();
	});
}

mui('.brand-list').on('tap', 'li', function() {
	vm.mainDatas.forEach(function(v) {
		vm.$set(v, 'active', false)
	})
	vm.pageNumber = 0;
	vm.search = ''
	var parentId = vm.mainDatas[Number(this.getAttribute('sort'))].id;
	typeName = vm.mainDatas[Number(this.getAttribute('sort'))].name;
	mui.showLoading("正在加载..", "div");
	getSubData(parentId, function() {
		mui.hideLoading(); //隐藏后的回调函数
		$('#offCanvasContentScroll').css('transform', 'translate3d(0,0,0)')
	});
	mui("#offCanvasContentScroll").scroll().scrollTo(0, 0, 0);
	vm.$set(vm.mainDatas[Number(this.getAttribute('sort'))], 'active', true)
});

//mui('.product-list').on('tap', '.product-item', function() {
////	var hrefUrl = 'pages/serveUserList/serveUserList.html?subType=' +
////		this.getAttribute('subType') + '&type=' + this.getAttribute('type') +
////		'&typeName=' + typeName + '&subTypeName=' + this.getAttribute('subTypeName');
//	openWindow(hrefUrl)
//});

mui('#offCanvasSideScroll').scroll();
mui('#offCanvasContentScroll').scroll();
window.onload = function() {
	var height = $(window).height() - $(".banner-pic").height() - $('#bottom-nav').outerHeight(true);
	$(".mui-inner-wrap").css("height", height);
	//	$('#offCanvasContentScroll').css('height', height - 50);
};