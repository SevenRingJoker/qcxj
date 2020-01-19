var usergetUrl = baseUrl + 'user/get';
var phoneCode = 'http://v.juhe.cn/sms/send';
var userSaveUrl = baseUrl + 'user/save';
var vm = new Vue({
	el: '#my-integral',
	data: {
		form: {
			userName: '',
			passWord: '',
			dealPassWord: '',
			name: '',
			province: '',
			city: '',
			county: '',
			address: '',
			phone: '',
			bankCarNum: '',
			bankName: '',
			//			aliPayNum: '',
			//			aliPayName: '',
			leadNumber: '',
			id: '',
			lng: 0,
			lat: 0
		},
		phoneCode: '',
		sec: '获取验证码',
		timer: null,
		sendFlag: false,
		cityDetail: ''
	}
})

$(function() {
	getUser();
	if(!mui.os.plus) {
		ajaxPost(baseUrl + 'SdkConfig', {
				url: location.href
			}, function(data) {
				Config(data.appId, data.timestamp, data.nonceStr, data.signature, data.jsApiList);
			},
			function(res) {
				mui.toast('获取微信JJSDK配置信息异常');
			});
	}
	$('#getAddress').click(function() {
		if(mui.os.plus) {
			getAddress();
			var addressInter = setInterval(function() {
				console.log(vm.form.province)
				if(vm.form.address) {
					vm.cityDetail = vm.form.province + ' ' + vm.form.city + ' ' + vm.form.county || '';
					clearInterval(addressInter);
				}
			}, 500);
		} else {
			wx.getLocation({
				type: 'gcj02', // 默认为wgs84的gps坐标，如果要返回直接给openLocation用的火星坐标，可传入'gcj02'
				success: function(res) {
					var gcj02 = gcj02tobd09(res.longitude, res.latitude);
					lat = gcj02[1]; // 纬度，浮点数，范围为90 ~ -90
					lng = gcj02[0]; // 经度，浮点数，范围为180 ~ -180。
					var speed = res.speed; // 速度，以米/每秒计
					var accuracy = res.accuracy; // 位置精度
					parseAddress();
					var addressInter = setInterval(function() {
						console.log(vm.form.province)
						if(vm.form.address) {
							vm.cityDetail = vm.form.province + ' ' + vm.form.city + ' ' + vm.form.county || '';
							clearInterval(addressInter);
						}
					}, 500);
				}
			});
		}
	});

	poppicker('#city', cityData3, 3, function(items) {
		var str = '';
		vm.form.province = items[0].text;
		vm.form.city = items[1].text;
		vm.form.county = items[2].text;
		if(items[0].text == items[1].text) {
			str = items[1].text + items[2].text
		} else {
			str = items[0].text + items[1].text + items[2].text
		}
		vm.cityDetail = str
	})

});

var userInfo = JSON.parse(localStorage.getItem('userInfo'));

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

function getUser() {
	ajaxPost(usergetUrl, {
		id: userInfo.id
	}, function(res) {
		//		console.log(res);
		//		vm.form = res.user;
		vm.form.userName = res.user.userName;
		vm.form.passWord = res.user.passWord;
		vm.form.dealPassWord = res.user.dealPassWord;
		vm.form.name = res.user.name;
		vm.form.province = res.user.province;
		vm.form.city = res.user.city;
		vm.form.county = res.user.county;
		vm.form.address = res.user.address;
		vm.form.phone = res.user.phone;
		vm.form.bankCarNum = res.user.bankCarNum;
		vm.form.bankName = res.user.bankName;
		vm.form.lng = res.user.lng;
		vm.form.lat = res.user.lat;
		//		vm.form.aliPayNum = res.user.aliPayNum;
		//		vm.form.aliPayName = res.user.aliPayName;
		vm.form.leadNumber = res.user.leadNumber;
		if(res.user.leadNumber != null) {
			$('#leadNumber').attr('readonly', 'readonly')
		}
		vm.form.id = res.user.id;
		vm.cityDetail = res.user.province + ' ' + res.user.city + ' ' + (res.user.county == null ? '' : res.user.county);
	}, function() {
		plusToast('请求出错')
	})
}

function setCookie(c_name, value, expiredays) {
	var exdate = new Date();
	exdate.setDate(exdate.getDate() + expiredays);
	document.cookie = c_name + "=" + escape(value) +
		((expiredays == null) ? "" : ";expires=" + exdate.toGMTString());
	// localStorage.setItem(c_name, value);
}

function getCookie(c_name) {
	// return localStorage.getItem(c_name) == null ? '' : localStorage.getItem(c_name);

	if(document.cookie.length > 0) {
		c_start = document.cookie.indexOf(c_name + "=");
		if(c_start != -1) {
			c_start = c_start + c_name.length + 1;
			c_end = document.cookie.indexOf(";", c_start);
			if(c_end == -1) c_end = document.cookie.length;
			return unescape(document.cookie.substring(c_start, c_end))
		}
	}
	return ""
}

mui('.commit-btn').on('tap', '#sub', function() {
	if(vm.form.phone == '') {
		plusToast('登陆手机号码不能为空');
		return;
	}
	if(vm.form.userName == '') {
		plusToast('账户名不能为空');
		return;
	}
	if(code != vm.phoneCode) {
		plusToast('验证码不正确');
		return;
	}
	if(vm.form.passWord == '') {
		plusToast('密码不能为空');
		return;
	}
	if(vm.form.city == '') {
		plusToast('省市区不能为空');
		return;
	}
	if(vm.form.address == '') {
		plusToast('详细地址不能为空');
		return;
	}
	if(vm.form.leadNumber == vm.form.phone) {
		plusToast('领导人手机号码不能与用户手机号码一致');
		return;
	}

	ajaxPost(userSaveUrl, vm.form, function(data) {
		//		console.log(data)
		if(data.state == '200') {
			plusToast('保存成功');
			setTimeout(function() {
				goback();;
			}, 800)
		} else {
			mui.toast(data.msg)
		}
	}, function(xhr) {
		plusToast('保存失败')
	})
});

var code;
$('.input-code').on('tap', 'button', function() {
	console.log(vm.form.phone)
	if(vm.sendFlag) {
		return;
	}
	if(vm.form.phone == '') {
		plusToast('请填写手机号码');
		return;
	}
	vm.sendFlag = true;
	code = uuid(5);
	vm.sec = 60;
	vm.timer = setInterval(function() {
		vm.sec--;
		if(vm.sec === 0) {
			vm.sec = "获取验证码";
			vm.sendFlag = false;
			clearInterval(vm.timer)
		}
	}, 1000)
	ajaxPost(phoneCode, {
		mobile: String(vm.form.phone),
		tpl_id: 118724,
		tpl_value: '#code#=' + code,
		key: '90c214ac276a7e4f3d5e9061e5654dfc',
		dtype: 'json'
	}, function(data) {}, function(xhr) {
		console.log(JSON.stringify(xhr))
	}, true)
});