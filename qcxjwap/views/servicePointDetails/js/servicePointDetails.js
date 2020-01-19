var vm = new Vue({
	el: "#service-point",
	data: {
		serviceBranch: {},
		headFileList: [],
	},
	updated: function() {
		mui('#slider').slider({
			interval: 1500
		});
	}
})

$(function() {
	ajaxPost(baseUrl + 'serviceBranch/get', {
		id: getQueryString('id')
	}, function(res) {
		if(res.serviceBranch != null) {
			vm.serviceBranch = res.serviceBranch;
			vm.headFileList = vm.serviceBranch.headFilePath.split('|')
		}
	}, function(res) {

	})
	mui('#slider').slider({});
	mui.previewImage();

	ajaxPost(baseUrl + 'SdkConfig', {
			url: location.href
		}, function(data) {
			Config(data.appId, data.timestamp, data.nonceStr, data.signature, data.jsApiList);
		},
		function(res) {
			mui.toast('获取微信JJSDK配置信息异常');
		});
});

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

function logoAddress() {
	if(vm.serviceBranch.lng != null && vm.serviceBranch.lng > 0 && vm.serviceBranch.lat != null && vm.serviceBranch.lat > 0) {
		if(mui.os.plus) {
		openWindow('http://api.map.baidu.com/marker?location=' +vm.serviceBranch.lng + ',' + ivm.serviceBranch.lat + '&title=' + vm.serviceBranch.name + '&content=' + vm.serviceBranch.address + '&output=html&src=man')
		} else {
			var gcj02 = bd09togcj02(vm.serviceBranch.lng, vm.serviceBranch.lat)
			wx.openLocation({
				latitude: gcj02[1], // 纬度，浮点数，范围为90 ~ -90
				longitude: gcj02[0], // 经度，浮点数，范围为180 ~ -180。
				name: vm.serviceBranch.name, // 位置名
				address: vm.serviceBranch.address, // 地址详情说明
				scale: 20, // 地图缩放级别,整形值,范围从1~28。默认为最大
				infoUrl: 'http://www.wujielp.com/qcxjwap/main/index/index.html' // 在查看位置界面底部显示的超链接,可点击跳转
			});
		}
	} else {
		mui.toast('网点微信信息未完善！')
	}

}