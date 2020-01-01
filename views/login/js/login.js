var vm = new Vue({
	el: '#login',
	data: {
		userName: '',
		passWord: ''
	}
});
var loginUrl = baseUrl + 'user/getList';
$(function() {
	$('.btn.login').click(function() {
		if(!vm.userName) {
			plusToast('账号不能为空');
			return;
		}
		if(!vm.passWord) {
			plusToast('密码不能为空');
			return;
		}

		var reqBody = null;
		if(!isH5 && push && os) {
			reqBody = {
				phone: vm.userName,
				passWord: vm.passWord,
				pageNo: 1,
				pageSize: 10,
				isLogin: 'true',
				cid: push.getClientInfo().clientid,
				os: os.name
			}
		} else {
			reqBody = {
				phone: vm.userName,
				passWord: vm.passWord,
				pageNo: 1,
				pageSize: 10,
				isLogin: 'true'
			}
		}
		console.log(loginUrl)
		ajaxPost(loginUrl, reqBody, function(res) {
			if(res.data.length > 0) {
				//				localStorage.setItem('number', vm.userName);
				localStorage.setItem('passWord', vm.passWord);
				// console.log(JSON.stringify(res.data[0]))
				localStorage.setItem('userInfo', JSON.stringify(res.data[0]));
				localStorage.setItem('login', 'login');
				// localStorage.setItem('login', res.data[0].openid);
				if(!isH5) {
					var all = plus.webview.all();
					var current = plus.webview.currentWebview().id;
					for(var i = 0, len = all.length; i < len; i++) {
						if(all[i].id !== current) {
							all[i].close();
						}
					}
				}
				localStorage.setItem('userInfo', JSON.stringify(res.data[0]));
				console.log( JSON.parse(localStorage.getItem('userInfo')))
				openWindow('../../main/my/my.html')
			} else {
				plusToast("请检查用户账号信息");
			}
		}, function() {
			plusToast('请求出错');
		})
	});
	$('.register').click(function() {
		openWindow('../../views/register/register.html')
	})

	$(document).keydown(function(event) {
		if(event.keyCode == 13) {
			$('.login').click();
		}
	});

});