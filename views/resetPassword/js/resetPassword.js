var registerUrl = 'user/editPassWord'
var phoneCodeUrl = 'http://v.juhe.cn/sms/send';
var vm = new Vue({
	el: '#vueApp',
	data: {
		form: {
			phone: '',
			passWord: '',
		},
		phoneCode: '',
		sec: '获取验证码',
		timer: null,
		sendFlag: false,
		repeatPswd: ''
	}
});
$('#sub').on('tap', function() {
	if(vm.form.phone == '') {
		plusToast('登陆手机号码不能为空');
		return;
	}
	if(code != vm.phoneCode) {
		plusToast('验证码不正确');
		return;
	}
	if(vm.form.password == '') {
		plusToast('密码不能为空');
		return;
	}
	var url = baseUrl + registerUrl
	ajaxPost(url, vm.form, function(data) {
		if(data.state == '200') {
			plusToast('重设密码成功！');
			setTimeout(function(){
				goback();;
			}, 500)
		}
	}, function(xhr) {
		plusToast('重设密码失败')
	})
});
var code;
$('.input-code').on('tap', 'button', function() {
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
	ajaxPost(phoneCodeUrl, {
		mobile: String(vm.form.phone),
		tpl_id: 118724,
		tpl_value: '#code#=' + code,
		key: '90c214ac276a7e4f3d5e9061e5654dfc',
		dtype: 'json'
	}, function(data) {}, function(xhr) {
		console.log(JSON.stringify(xhr))
	}, true)
});
$('#vueApp form').on('change', '.repeat-password', function() {
	if(vm.form.passWord != vm.repeatPswd) {
		plusToast('两次输入的密码不一致，请重新输入');
		vm.repeatPswd = ''
	}
});
