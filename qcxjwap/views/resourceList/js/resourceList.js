var vm = new Vue({
	el: '#my-material',
	data: {
		list: [],
		pageNo: 1,
		pageSize: 10,
		pageCount: 1,
		subType: '',
		subTypeList: [],

	},
	updated: function() {
		mui('.mui-scroll-wrapper').scroll({
			deceleration: 0.0005 //flick 减速系数，系数越大，滚动速度越慢，滚动距离越小，默认值0.0006
		});
	},
	methods: {
		href: function(url, content) {
			localStorage.setItem('title', content)
			localStorage.setItem('pageUrl', url)
			openWindow('../iframe/iframe.html')
		},
		details:function(id){
			openWindow('../resourceDetails/resourceDetails.html?id='+id)
		}
	}
})

$(function() {
	if(localStorage.getItem("resourceSubType") != null && localStorage.getItem("resourceSubType") != '') {
		vm.subTypeList = localStorage.getItem("resourceSubType").split('|');
	}
	getList();
	$(window).scroll(function(e) {
		if($(document).scrollTop() >= $(document).height() - $(window).height()) {
			//		alert("滚动条已经到达底部！");
			if(vm.pageNo > vm.pageCount) {
				return false;
			}
			getList(false, function() {
				mui.hideLoading();
			})
		}
	})
});


function getList(cb) {
	mui.showLoading("正在加载..", "div");
	ajaxPost(baseUrl + 'resource/getList', {
		pageNo: vm.pageNo,
		pageSize: 8,
		type: localStorage.getItem("resourceType"),
		search: $('#search').val(),
		subType: vm.subType
	}, function(res) {
		if(res.data.length > 0) {
			vm.list = res.data
			vm.pageCount = res.pageResults.pageCount
			vm.pageNo += 1;
		} else {
			vm.list = [];
			vm.pageCount = res.pageResults.pageCount
			vm.pageNo -= 1;
			mui.toast('暂时没有新的消息')
		}
		mui.hideLoading();
	}, function() {
		plusToast('请求出错')
	})
}

mui('#my-material').on('longtap', '.copy-item', function() {
	var that = this;
	copyUrl(that.getAttribute('content') + ';' + that.getAttribute('id'));
});

$(".mui-scroll").on("tap", ".mui-control-item", function(event) {
	$('.mui-control-item').removeClass('mui-active');
	vm.subType=$(this).text();
	$(this).addClass('mui-active');
	vm.pageNo = 0;
	getList(false, function() {
		mui.hideLoading();
	})
});

$('.mui-icon-search').click(function() {
	vm.pageNo = 0;
	getList(false, function() {
		mui.hideLoading();
	});
})

document.onkeydown = function(event) {
	var e = event || window.event || arguments.callee.caller.arguments[0];
	if(e && e.keyCode == 13) {
		$(".mui-icon-search").click();
	}
};

if(mui.os.plus) {}