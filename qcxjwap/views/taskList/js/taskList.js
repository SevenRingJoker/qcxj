var vm = new Vue({
	el: '#my-material',
	data: {
		list: [],
		pageNo: 1,
		pageSize: 10,
		pageCount: 1,
	},
	updated: function() {
		mui('.mui-scroll-wrapper').scroll({
			deceleration: 0.0005 //flick 减速系数，系数越大，滚动速度越慢，滚动距离越小，默认值0.0006
		});
	}
});

mui.previewImage();

$(function() {

	ajaxPost(baseUrl + 'picture/get', {
		id: 1
	}, function(res) {
		if(res.picture != null) {
			$('#headImg').attr({
				'src': fileUrl + res.picture.appMaterialFilePath
			})
		}
	}, function(res) {
		mui.toast('获取图片接口异常');
	})

	getList();
	$(window).scroll(function(e) {
		if($(document).scrollTop() >= $(document).height() - $(window).height()) {
			//		alert("滚动条已经到达底部！");
			if(vm.pageNo > vm.pageCount) {
				//			plusToast("没有更多数据啦~")
				return false;
			}
			getList();
		}
	});
	mui('.mui-scroll-wrapper').scroll({
		deceleration: 0.0005 //flick 减速系数，系数越大，滚动速度越慢，滚动距离越小，默认值0.0006
	});
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
				mui.alert('如果分享朋友圈成功，请上传截图');
			})
		})
	} else {
		mui.alert('你可长按图片保存，下载视频或复制链接转发朋友圈！')
	}

});

function getList(cb) {
	mui.showLoading("正在加载..", "div");
	ajaxPost(baseUrl + 'material/getList', {
		pageNo: vm.pageNo,
		pageSize: 20,
		isTask: true,
		time: 'now',
	}, function(res) {
		console.log(res.data.length)
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

mui("#my-material").on("tap", ".upload-btn", function() {
	var taskId = this.getAttribute('msgId');
	openWindow('../uploadTask/uploadTask.html?taskId=' + taskId)
});

if(mui.os.plus) {}