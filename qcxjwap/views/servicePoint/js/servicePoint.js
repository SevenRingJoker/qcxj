//$("body, html").scrollTop(0);
var getServiceList = baseUrl + 'serviceBranch/getList'
var vm = new Vue({
	el: "#service-point",
	data: {
		pageNo: 1,
		pageSize: 10,
		pageCount: 1,
		distance: 10000,
		list: [],
		distances: [],
	}
})

ajaxPost(baseUrl + 'picture/get', {
	id: 1
}, function(res) {
	if (res.picture != null) {
		$('#headImg').attr({
			'src': fileUrl + res.picture.appBranchFilePath
		})
	}
}, function(res) {
	mui.toast('获取图片接口异常');
})

getData(false, function() {
	self.endPullUpToRefresh(vm.pageNo > vm.pageCount);
}, lng, lat, vm.distance);

if (mui.os.plus) {
	var map = new BMap.Map('map');
	var geolocation = new BMap.Geolocation();
	geolocation.getCurrentPosition(function(r) {
		if (this.getStatus() == BMAP_STATUS_SUCCESS) {
			lng = r.point.lng;
			lat = r.point.lat;
			$('#lng').val(lng);
			$('#lat').val(lat);
			pullRefresh('.mui-scroll', function(self, index) {
				self.endPullDownToRefresh();
				vm.pageNo = 1;
				getData(true, function() {
					self.endPullDownToRefresh();
					self.refresh(true);
				}, lng, lat, vm.distance)
			}, function(self, index) {
				//	self.endPullUpToRefresh(true);
				if (vm.pageNo > vm.pageCount) {
					self.endPullUpToRefresh(true);
					return false;
				}
				getData(false, function() {
					self.endPullUpToRefresh(vm.pageNo > vm.pageCount);
				}, lng, lat, vm.distance);
			}, true);

		} else {
			plusToast(this.getStatus())
		}
	}, {
		enableHighAccuracy: true
	});
} else {
	ajaxPost(baseUrl + 'SdkConfig', {
			url: location.href
		}, function(data) {
			Config(data.appId, data.timestamp, data.nonceStr, data.signature, data.jsApiList);
		},
		function(res) {
			mui.toast('获取微信JJSDK配置信息异常');
		});
}

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
	wx.ready(function() {
		// config信息验证后会执行ready方法，所有接口调用都必须在config接口获得结果之后，config是一个客户端的异步操作，所以如果需要在页面加载时就调用相关接口，则须把相关接口放在ready函数中调用来确保正确执行。对于用户触发时才调用的接口，则可以直接调用，不需要放在ready函数中。
		wx.getLocation({
			type: 'gcj02', // 默认为wgs84的gps坐标，如果要返回直接给openLocation用的火星坐标，可传入'gcj02'
			success: function(res) {
				var gcj02 = gcj02tobd09(res.longitude, res.latitude);
				lat = gcj02[1]; // 纬度，浮点数，范围为90 ~ -90
				lng = gcj02[0]; // 经度，浮点数，范围为180 ~ -180。
				$('#lng').val(lng);
				$('#lat').val(lat);
				var speed = res.speed; // 速度，以米/每秒计
				var accuracy = res.accuracy; // 位置精度
				pullRefresh('.mui-scroll', function(self, index) {
					self.endPullDownToRefresh();
					vm.pageNo = 1;
					getData(true, function() {
						self.endPullDownToRefresh();
						self.refresh(true);
					}, lng, lat, vm.distance)
				}, function(self, index) {
					//	self.endPullUpToRefresh(true);
					if (vm.pageNo > vm.pageCount) {
						self.endPullUpToRefresh(true);
						return false;
					}
					getData(false, function() {
						self.endPullUpToRefresh(vm.pageNo > vm.pageCount);
					}, lng, lat, vm.distance);
				}, true);
			}
		});
	});

}

function getData(init, cb, lng, lat, distanceCount) {
	ajaxPost(getServiceList, {
		pageNo: vm.pageNo,
		pageSize: vm.pageSize,
		// lng: lng,
		// lat: lat,
		// distance: distanceCount
	}, function(res) {
		if (res.data.length > 0) {
			if (init) {
				vm.list = res.data;
			} else {
				vm.list = vm.list.concat(res.data);
			}
			var distances = [];
			$.each(vm.list, function(i, value) {
				if (value.lng != null && value.lng > 0 && value.lat != null && value.lat > 0) {
					distances.push(distance(value.lng, value.lat))
				} else {
					distances.push('未设置距离')
				}
			});
			vm.distances = distances;
			vm.pageCount = res.pageResults.pageCount;
			vm.pageNo += 1;
			cb && cb();
		} else {
			cb && cb();
		}
	}, function(xhr) {})
}

mui('.service-list').on('tap', '.service-item', function() {
	var item = JSON.parse(this.getAttribute('item'));
	openWindow('../servicePointDetails/servicePointDetails.html?id=' + item.id)
});

window.onload = function() {
	var top =  $('.banner-pic').outerHeight(true);
	$(".mui-scroll-wrapper").css('top', top);
}
