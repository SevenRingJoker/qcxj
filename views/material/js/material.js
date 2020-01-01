var getListUrl = baseUrl + 'material/getList';
var vm = new Vue({
	el: '#my-material',
	data: {
		list: [],
		pageNo: 1,
		pageSize: 10,
		pageCount: 1,
		type: '',

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
		}
	}
})

mui.previewImage();

$(function() {
	getList();
	$(window).scroll(function(e) {
		if($(document).scrollTop() >= $(document).height() - $(window).height()) {
			//		alert("滚动条已经到达底部！");
			if(vm.pageNo > vm.pageCount) {
				//			plusToast("没有更多数据啦~")
				return false;
			}
			getList(false, function() {
				mui.hideLoading();
			})
		}
	})
});

mui('#my-material').on('tap', '.share', function() {
	if(!isH5) {
		var msgIndex = this.getAttribute('msgIndex');
		var msg = null;
		var pics = [];
		var material = vm.list[msgIndex];
		material.filePath && material.filePath.split('|').forEach(function(v) {
			// 			if (getSuffix(v) == 'mp4' || getSuffix(v) == 'flv' || getSuffix(v) == 'avi' || getSuffix(v) == 'MOV') {}
			// 			if (getSuffix(v) == 'jpg' || getSuffix(v) == 'jpeg' || getSuffix(v) == 'png' || getSuffix(v) == 'gif') {}
			pics.push(fileUrl + v);
		});
		switch(material.type) {
			case 'text':
				msg = {
					type: 'text',
					content: material.content
				}
				break;
			case 'img':
				msg = {
					type: 'image',
					pictures: pics,
					content: material.content
				}
				break;
			case 'video':
				msg = {
					type: 'video',
					content: material.content,
					thumbs: ['../imgs/logo.png'],
					media: pics[0]
				}
				break;
			case 'url':
				msg = {
					type: 'web',
					content: material.content,
					title: material.content,
					thumbs: [pics[0]],
					href: material.url
				}
				break;
		}
		mui.plusReady(function() {
			window.plusShare(msg, function(status) {
				mui.toast('');
			})
		})
	}
});

function getList(cb) {
	mui.showLoading("正在加载..", "div");
	ajaxPost(getListUrl, {
		pageNo: vm.pageNo,
		pageSize: 20,
		type: vm.type,
		search: $('#search').val()
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

$(".mui-scroll").on("tap", ".mui-control-item", function(event) {
	$('.mui-control-item').removeClass('mui-active');
	$(this).addClass('mui-active');
	switch($(this).text()) {
		case '推荐':
			vm.type = '';
			break;
		case '视频':
			vm.type = 'video';
			break;
		case '图片':
			vm.type = 'img';
			break;
		case '文字':
			vm.type = 'text';
			break;
		case '链接':
			vm.type = 'url';
			break;
	}
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

document.onkeydown=function(event){
    var e = event || window.event || arguments.callee.caller.arguments[0];
    if(e && e.keyCode==13){
         $(".mui-icon-search").click();
    }
};

// $('.mui-control-item').click(function() {
// 	$('.mui-control-item').removeClass('mui-active');
// 	$(this).addClass('mui-active');
// 	switch ($(this).text()) {
// 		case '推荐':
// 			vm.type = '';
// 			break;
// 		case '视频':
// 			vm.type = 'video';
// 			break;
// 		case '图片':
// 			vm.type = 'img';
// 			break;
// 		case '文字':
// 			vm.type = 'text';
// 			break;
// 		case '链接':
// 			vm.type = 'url';
// 			break;
// 	}
// 	vm.pageNo = 0;
// 	getList(false, function() {
// 		mui.hideLoading();
// 	})
// })

if(mui.os.plus) {}