var vm = new Vue({
	el: '#donation',
	data: {
		integral: 0,
		dealPassWord: ''
	}
})
var userInfo = JSON.parse(localStorage.getItem('userInfo'));
$(function() {
	vm.integral = userInfo.integral;
})
$('#subBtn').click(function() {
	if (userInfo != null) {
		if (userInfo.dealPassWord == null) {
			mui.toast('用户交易密码不能为空！')
			return false;
		}
		if (userInfo.phone == null) {
			mui.toast('用户手机号码不能为空！')
			return false;
		}
		var phone = $('#phone').val();
		var integral = $('#integral').val() != '' ? Number($('#integral').val()) : 0;
		var dealPassWord = $('#dealPassWord').val();
		if (integral <= 0) {
			mui.toast('交易积分必须大于0！')
			return false;
		}
		if (phone == '' && userInfo.phone == phone) {
			mui.toast('转赠号码错误！')
			return false;
		}
		if (dealPassWord == userInfo.dealPassWord) {
			ajaxPost(baseUrl + 'integral/donation', {
				userId: userInfo.id,
				phone: phone,
				integral: integral
			}, function(res) {
				console.log(res);
				if (res.state == '200') {
					mui.toast('转赠成功');
					userInfo = res.user;
					vm.integral = userInfo.integral;
					localStorage.setItem('userInfo', JSON.stringify(userInfo));
					location.reload();
				} else {
					mui.toast(res.msg);
				}
			}, function(res) {
				mui.toast('积分转赠异常！')
			})
		}
	} else {
		mui.toast('用户信息信息为空！')
	}
});
