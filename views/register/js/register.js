var registerUrl = 'user/save'
var phoneCode = 'http://v.juhe.cn/sms/send';
var vm = new Vue({
	el: '#vueApp',
	data: {
		form: {
			userName: '',
			passWord: '',
			phone: '',
			province: '',
			city: '',
			county: '',
			leadNumber: '',
			cid: '',
			os: ''
		},
		phoneCode: '',
		sec: '获取验证码',
		timer: null,
		sendFlag: false,
		repeatPswd: '',
		cityDetail: ''
	}
});
if(getQueryString('onlyId')) {
	vm.form.leadNumber = getQueryString('onlyId');
}
$('#sub').on('tap', function() {
	if(vm.form.phone == '') {
		plusToast('登陆手机号码不能为空');
		return;
	}
	if(vm.form.username == '') {
		plusToast('账户名不能为空');
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
	if(vm.form.city == '') {
		plusToast('省市区不能为空');
		return;
	}
	var url = baseUrl + registerUrl
	if(!isH5 && push && os) {
		vm.form.cid = push.getClientInfo().clientid;
		vm.form.os = os.name;
	}
	ajaxPost(url, vm.form, function(data) {
		if(data.state == '200') {
			localStorage.setItem('userInfo', JSON.stringify(data.user));
//			localStorage.setItem('number', data.user.phone);
			localStorage.setItem('passWord', data.user.passWord);
			localStorage.setItem('login', 'login');
			openWindow('../../main/index/index.html')
		}
	}, function(xhr) {
		plusToast('注册失败')
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
$('#vueApp form').on('change', '.repeat-password', function() {
	if(vm.form.passWord != vm.repeatPswd) {
		plusToast('两次输入的密码不一致，请重新输入');
		vm.repeatPswd = ''
	}
});

//})