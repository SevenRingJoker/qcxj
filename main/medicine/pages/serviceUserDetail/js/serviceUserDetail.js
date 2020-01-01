var getUserDetail = baseUrl + 'serveUser/get';
var checkImUrl = baseUrl + 'iM/checkIm'

var vm = new Vue({
	el: '#service-user-detail',
	data: {
		user: null,
		contentPic: []
	}
});
$(function() {
	getUserData();
	ajaxPost(baseUrl + 'SdkConfig', {
			url: location.href
		}, function(data) {
			Config(data.appId, data.timestamp, data.nonceStr, data.signature, data.jsApiList);
		},
		function(res) {
			mui.toast('获取微信JJSDK配置信息异常');
		});
})

//微信JJSDK配置
function Config(appId, timestamp, nonceStr, signature, jsApiList) {
	wx.config({
		debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
		appId: appId, // 必填，公众号的唯一标识
		timestamp: timestamp, // 必填，生成签名的时间戳
		nonceStr: nonceStr, // 必填，生成签名的随机串
		signature: signature, // 必填，签名，见附录1
		jsApiList: jsApiList // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
	});
}

function getUserData() {
	ajaxPost(getUserDetail, {
		id: getQueryString('userId')
	}, function(res) {
		vm.user = res.serveUser;
		vm.contentPic = res.serveUser.contentFilePath.split('|');
	}, function() {
		ajaxError();
	})
}

function onlineService() {
	//	plusToast('功能模块开发中....');
	if(checkLogin()) {
		ajaxPost(checkImUrl, {
			userId: JSON.parse(localStorage.getItem('userInfo')).id,
			toUserId: vm.user.user.id
		}, function(res) {
			if(isNullObject(res.im)) {
				openWindow('../im/im.html?seviceId=' + vm.user.user.id + '&userName=' + getQueryString('userName'))
			} else {
				openWindow('../im/im.html?seviceId=' + vm.user.user.id + '&userName=' + getQueryString('userName') + "&imId=" + res.im.id)
			}
		}, function() {
			ajaxError();
		})
	} else {
		plusToast("您还没登录，请先登录");
	}
}

function serviceAddress() {
	if(!vm.user.user.lng || !vm.user.user.lat) {
		plusToast('该用户没有提供位置信息');
	} else {
		if(mui.os.plus) {
			openWindow('http://api.map.baidu.com/marker?location=' + vm.user.user.lat + ',' + vm.user.user.lng + '&title=' + vm.user.name + '&content=' + vm.user.user.address + '&output=html&src=man')
		} else {
			var gcj02 = bd09togcj02(vm.user.user.lng, vm.user.user.lat)
			wx.openLocation({
				latitude: gcj02[1], // 纬度，浮点数，范围为90 ~ -90
				longitude: gcj02[0], // 经度，浮点数，范围为180 ~ -180。
				name: vm.user.name, // 位置名
				address: vm.user.user.address, // 地址详情说明
				scale: 20, // 地图缩放级别,整形值,范围从1~28。默认为最大
				infoUrl: 'http://www.wujielp.com/qcxjwap/main/index/index.html' // 在查看位置界面底部显示的超链接,可点击跳转
			});
		}

	}
}

function copyUrl() {
	if(mui.os.plus) {
		copyShareUrl(vm.user.weChat);
	} else {
		var clipboard = new Clipboard('#copy-item'); //实例化
		clipboard.on('success', function(e) {
			plusToast('复制成功，请打开微信添加好友');
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
			alert('复制成功，请打开微信添加好友');
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