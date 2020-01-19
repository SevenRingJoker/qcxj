var saveintegralUrl = baseUrl + 'integral/save';
var phoneCode = 'http://v.juhe.cn/sms/send';

var vm = new Vue({
	el: '#my-integral',
	data: {
		integral: 0,
		form: {
			integral: '',
			dealPassWord: '',
			userId: '',
			userName: '',
			expensesUserId: '系统',
			expensesUserName: '系统',
			expensesMoney: '',
			type: '用户提现',
			status: '待处理'
		},
		phone: '',
		phoneCode: '',
		sec: '获取验证码',
		timer: null,
		sendFlag: false,
	}
})
var userInfo = JSON.parse(localStorage.getItem('userInfo'));
var dealPassWord = userInfo.dealPassWord
vm.form.userId = userInfo.id;
vm.form.userName = userInfo.userName;
vm.phone = userInfo.phone;
vm.integral = userInfo.integral;

$('#sub').on('tap', function() {
	if(vm.form.integral == '') {
		plusToast('提取的积分不能为空');
		return;
	}
	if(vm.form.integral % 100 > 0) {
		plusToast('提取的积分必须整百');
		return;
	}
	if(vm.integral < vm.form.integral) {
		plusToast('提取的积分不能大于总积分');
		return;
	}
	if(code != vm.phoneCode) {
		plusToast('验证码不正确');
		return;
	}
	if(vm.form.dealPassWord == '') {
		plusToast('交易密码不能为空');
		return;
	}
	if(dealPassWord != null) { //判断用户信息中有没存取现密码
		if(vm.form.dealPassWord == '') {
			plusToast('交易密码不能为空');
			return;
		}
		if(vm.form.dealPassWord != dealPassWord) {
			plusToast('交易密码不正确');
			return;
		}
	}
	mui.showLoading("正在加载..", "div");
	vm.form.expensesMoney = vm.form.integral;
	ajaxPost(saveintegralUrl, vm.form, function(data) {
		console.log(data)
		mui.hideLoading();
		if(data.state == '200') {
			plusToast('提现成功');
			goback();;
		}
	}, function(xhr) {
		plusToast('保存失败')
	})
});

var code;
$('.input-code').on('tap', 'button', function() {
	console.log(vm.phone)
	if(vm.sendFlag) {
		return;
	}
	if(vm.phone == '' || vm.phone == null) {
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
	}, 1000);
	ajaxPost(phoneCode, {
		mobile: String(vm.phone),
		tpl_id: 118724,
		tpl_value: '#code#=' + code,
		key: '90c214ac276a7e4f3d5e9061e5654dfc',
		dtype: 'json'
	}, function(data) {}, function(xhr) {
		console.log1(JSON.stringify(xhr))
	}, true)
});