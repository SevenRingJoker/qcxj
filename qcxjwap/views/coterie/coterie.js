var vm = new Vue({
	el: '#coterie',
	data: {
		userList: [],
		distances: [],
		serviceBranch: {}
	}
});

var userInfo = JSON.parse(localStorage.getItem("userInfo"));
var cacheData = JSON.parse(localStorage.getItem("cacheData"));

$(function() {
	mui.showLoading("正在加载..", "div");
	getServiceBranch();
});


function getServiceBranch() {
	ajaxPost(baseUrl + 'serviceBranch/getList', {
		pageNo: 1,
		pageSize: 1,
		userId: userInfo.id
	}, function(res) {
		if (res.data.length > 0) {
			var serviceBranch = res.data[0];
			vm.serviceBranch = serviceBranch;
			if (serviceBranch.lng != null && serviceBranch.lat != null) {
				getUserList(serviceBranch.lng, serviceBranch.lat);
			}
		}
	}, function(res) {
		mui.toast('获取网点异常！')
	})
}

function getUserList(lng, lat) {
	ajaxPost(baseUrl + 'user/getList', {
		pageNo: 1,
		pageSize: 9999,
		lng: lng,
		lat: lat,
		distance: cacheData.coterieDistance
	}, function(res) {
		mui.hideLoading();
		vm.userList = res.data;
		$.each(vm.userList, function(i, value) {
			if (value.lng != null && value.lng > 0 && value.lat != null && value.lat > 0) {
				vm.distances.push(distance(value.lng, value.lat))
			} else {
				vm.distances.push('未设置距离')
			}
		});
	}, function(res) {
		mui.toast('获取圈内人异常！')
	})

}

/**
 * 获取两地之间的距离
 * @param lng 目的地 lng
 * @param lat 目的地 lat
 * @returns {string}
 */
function distance(lng, lat) {
	var map = new BMap.Map("allmap");
	var pointA = new BMap.Point(vm.serviceBranch.lng, vm.serviceBranch.lat); // 创建点坐标A--大渡口区
	var pointB = new BMap.Point(lng, lat); // 创建点坐标B--江北区
	newDistance = (map.getDistance(pointA, pointB)).toFixed(1) / 1000;
	return newDistance.toFixed(2) + 'km';
}
