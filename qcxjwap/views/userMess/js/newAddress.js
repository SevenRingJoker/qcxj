//noinspection ES6ConvertVarToLetConst
/**
 *  百度地图 定位
 *
 *   省 Province
 *
 *   市 City
 *
 *   区 Region
 *
 *   详细地址 Address
 *
 *   经度  lng
 *
 *   纬度  lat
 *
 * Created by Administrator on 2017/6/23.
 */
var iosDriver = false;
if(navigator.userAgent.match(/iPhone/i) || navigator.userAgent.match(/iPad/i) || navigator.userAgent.match(/iPod/i)) {
	iosDriver = true;
}

//noinspection ES6ConvertVarToLetConst
var lng = 0;
var lat = 0;
var loca;
var on_off_getAddress = false;

function getAddress() {
	if(mui.os.plus) {
		$('body').append('<div id="noneMap" style="display: none;"></div>');
		if(window.plus) {
			plusReady();
		} else {
			document.addEventListener("plusready", plusReady, false);
		}

		function plusReady() {
			//          var map = new plus.maps.Map("noneMap");
			//          map.getUserLocation(function (state, point) {
			//              if (0 == state) {
			//                  lng = point.longitude;
			//                  lat = point.latitude;
			//                  setCookie('lng', lng, null);
			//                  setCookie('lat', lat, null);
			//                  parseAddress();
			//              } else {
			//                  alert("Failed!");
			//              }
			//          });
			// 百度地图API功能
			var geolocation = new BMap.Geolocation();
			geolocation.getCurrentPosition(function(r) {
				if(this.getStatus() == BMAP_STATUS_SUCCESS) {
					lng = r.point.lng; //经度坐标
					lat = r.point.lat; //纬度坐标
					setCookie('lng', lng, null);
					setCookie('lat', lat, null);
					parseAddress();
				} else {
					alert('failed' + this.getStatus());
				}
			}, {
				enableHighAccuracy: true
			});
		}
	} else {
		// 百度地图API功能
		var geolocation = new BMap.Geolocation();
		geolocation.getCurrentPosition(function(r) {
			if(this.getStatus() == BMAP_STATUS_SUCCESS) {
				lng = r.point.lng; //经度坐标
				lat = r.point.lat; //纬度坐标
				setCookie('lng', lng, null);
				setCookie('lat', lat, null);
				parseAddress();
			} else {
				alert('failed' + this.getStatus());
			}
		}, {
			enableHighAccuracy: true
		});
	}
}

/**
 * 获取两地之间的距离
 * @param lng 目的地 lng
 * @param lat 目的地 lat
 * @returns {string}
 */
function distance(lng, lat) {
	var map = new BMap.Map("allmap");
	var pointA = new BMap.Point($('#lng').val(), $('#lat').val()); // 创建点坐标A--大渡口区
	var pointB = new BMap.Point(lng, lat); // 创建点坐标B--江北区
	newDistance = (map.getDistance(pointA, pointB)).toFixed(1) / 1000;
	return newDistance.toFixed(2) + 'km';
}

/**
 * 解析地址
 */
function parseAddress() {
	var url = 'http://api.map.baidu.com/geocoder/v2/?callback=renderReverse' +
		'&location=' + lat + ',' + lng + '&output=json' +
		'&pois=0&ak=5QEcaoZOqMSYxyjGTWch3z9T68EFVAyV';
	$.ajax({
		type: 'post',
		url: url,
		data: {},
		dataType: 'jsonp',
		crossDomain: true,
		success: function(data) {
			redactAddress(data.result.addressComponent.province,
				data.result.addressComponent.city,
				data.result.addressComponent.district,
				data.result.addressComponent.street + data.result.sematic_description,
				data.result, true);
			on_off_getAddress = true;
		}
	});
}

//编写地址
function redactAddress(province, city, region, address, result, on_off) {
	//  $('#lat').val(lat);
	//  $('#lng').val(lng);
	vm.form.lat = lat;
	vm.form.lng = lng;
	vm.form.province = province;
	vm.form.city = city;
	vm.form.county = region;
	vm.form.address = address;
	//  $("#province").val(province);
	//  $("#city").val(city);
	//  $("#region").val(region);
	$('#HouseRegion').text(region);
	$('#Address').val(address);
	//  $('#address').val(address);
	$('#addAddress').val(province + city + region); //总地址
	loca = result;
	on_off_getAddress = on_off;

}