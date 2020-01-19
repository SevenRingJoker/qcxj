var getMemberListUrl = baseUrl + 'vip/getList';
var vm = new Vue({
	el: '#vip-code',
	data: {
		pageNo: 1,
		pageCount: 1,
		pageSize: 10,
		list: [],
		statusText: '状态',
		pullObj: null
	}
})

function scrollFn() {
	var scrollObj = mui('#msgBox').scroll();
	var scrollTop = scrollObj.y + 4;
	mui('#msgBox').scroll().scrollTo(0, scrollTop, 0);
}

pullRefresh('.mui-scroll', function(self, index) {
	vm.pullObj = self
	self.endPullDownToRefresh();
	vm.pageNo = 1;
	getData(true, function() {
		self.endPullDownToRefresh();
		scrollFn();
		self.refresh(true);
	})
}, function(self, index) {
	//	self.endPullUpToRefresh(true);
	vm.pullObj = self
	if(vm.pageNo > vm.pageCount) {
		self.endPullUpToRefresh(true);
		return false;
	}
	getData(false, function() {
		self.endPullUpToRefresh(vm.pageNo > vm.pageCount);
		scrollFn();
	});
}, true);

//$('#status').click(function() {
mui('#vip-code').on('tap', '#status', function() {
	var picker = new mui.PopPicker();
	picker.setData([{
			value: '全部',
			text: '全部'
		},
		{
			value: '待激活',
			text: '待激活'
		},
		{
			value: '已激活',
			text: '已激活'
		},
		{
			value: '已过期',
			text: '已过期'
		}
	]);
	picker.show(function(selectItems) {
		$('#list').find('li').remove();
		$('#status').text(selectItems[0].text);
		vm.statusText = selectItems[0].value;
		vm.pageNo = 1;
		getData(true, function() {
			vm.pullObj.refresh(true);
			scrollFn();
		})
	})
});


$('#statusList').find('div').click(function(){
	mui('.mui-scroll-wrapper').scroll().scrollTo(0,0,100);
	var status=$(this).text();
	$('#statusList').find('div').removeClass('statusAct');
	$(this).addClass('statusAct');
	$('#list').find('li').remove();
		$('#status').text(status);
		vm.statusText = status;
		vm.pageNo = 1;
		getData(true, function() {
			vm.pullObj.refresh(true);
			scrollFn();
		})
});


function getData(init, cb) {
	ajaxPost(getMemberListUrl, {
		pageNo: vm.pageNo,
		pageSize: vm.pageSize,
		userId: JSON.parse(localStorage.getItem('userInfo')).id,
		status: vm.statusText == '状态' || vm.statusText == '全部' ? '' : vm.statusText
	}, function(res) {
		if(init) {
			vm.list = res.data;

		} else {
			vm.list = vm.list.concat(res.data);
		}
		vm.pageCount = res.pageResults.pageCount;
		vm.pageNo += 1;
		cb && cb();
	}, function(xhr) {})
}
$('#vip-code').on('tap', '.copy-item', function() {
	var that = this;
	if(this.getAttribute('status') == '待激活') {
		copyUrl(that.getAttribute('code') + ';' + that.getAttribute('id'));
	}
});

//function copyFn(str) {
//	if(str.split(';')[1]== '待激活') {
//		copyUrl(str.split(';')[0] + ';' + str.split(';')[2]);
//	}
//}

window.onload = function() {
	var h = $(window).height() - $(".header-box").outerHeight(true) - $('.title-bar').outerHeight(true);
	$("#msgBox").height(h).css('top', $(".header-box").outerHeight(true) + $('.title-bar').outerHeight(true)-5);
}

function copyUrl(url) {
	if(mui.os.plus) {
		copyShareUrl(url.split(';')[0]);
	} else {
		var clipboard = new Clipboard('#' + url.split(';')[1]); //实例化
		clipboard.on('success', function(e) {
			plusToast('复制成功');
		});

		//复制失败执行的回调，可选
		clipboard.on('error', function(e) {
			plusToast('复制失败');
		});
	}
}

function copyShareUrl(url) {
	mui.plusReady(function() {
		//复制链接到剪切板
		var copy_content = url;
		//判断是安卓还是ios
		if(mui.os.ios) {
			//ios
			var UIPasteboard = plus.ios.importClass("UIPasteboard");
			var generalPasteboard = UIPasteboard.generalPasteboard();
			//设置/获取文本内容:
			generalPasteboard.plusCallMethod({
				setValue: copy_content,
				forPasteboardType: "public.utf8-plain-text"
			});
			generalPasteboard.plusCallMethod({
				valueForPasteboardType: "public.utf8-plain-text"
			});
			alert('复制成功');
		} else {
			//安卓
			var context = plus.android.importClass("android.content.Context");
			var main = plus.android.runtimeMainActivity();
			var clip = main.getSystemService(context.CLIPBOARD_SERVICE);
			plus.android.invoke(clip, "setText", copy_content);
			alert('复制成功');
		}
	});
}

document.querySelector('#msgBox').addEventListener('scroll', function(e) {
	var scrollTop = mui('#msgBox').scroll().y;
	if(scrollTop==0) {
		scrollFn();
	}
	
})