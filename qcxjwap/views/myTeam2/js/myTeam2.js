var getListUrl = baseUrl + 'user/team';
var vm = new Vue({
	el: '#my-integral',
	data: {
		directUser: [],
		indirectUser: [],
		userName: '',
		user: null
	},
	methods: {
		myTeam2: function(leadNumber, userName, userId) {
			console.log(123);
			openWindow('../myTeam2/myTeam2.html?leadNumber=' + leadNumber + '&userName=' + userName + '&userId=' + userId)
		}
	}
})

$(function() {
	mui.showLoading("正在加载..", "div");
	getList();
	getUserById();
});

var leadNumber = getQueryString("leadNumber");
vm.userName = getQueryString("userName");

function getList() {
	ajaxPost(getListUrl, {
		leadNumber: leadNumber
	}, function(res) {
		mui.hideLoading();
		console.log(res)
		//		if(res.data.length > 0) {
		//			vm.list = res.data
		//		}
		vm.directUser = res.directUser;
		vm.indirectUser = res.indirectUser;
	}, function() {
		plusToast('请求出错')
	})
}

function getUserById() {
	if(getQueryString("userId") != null) {
		console.log(getQueryString("userId"))
		ajaxPost(baseUrl + 'user/get', {
			id: getQueryString("userId")
		}, function(res) {
			if(res.user != null) {
				vm.user = res.user;
			}
		}, function(res) {
			mui.toast('获取用户信息接口异常')
		})
	}

}

//打开激活
$('#activateUser').click(function() {
	$('.activate').css({
		'display': 'block'
	})
});
//关闭激活
$('#close').click(function() {
	$('.activate').css({
		'display': 'none'
	})
});
//在线聊天
$('#chat').click(function() {
	openWindow('../../main/medicine/pages/im/im.html?seviceId=' + getQueryString('userId') + '&userName=' + getQueryString('userName'))
});

//确定激活
$('#affirm').click(function() {
	var vipCode = $('#vipCode').val();
	mui.showLoading("正在加载..", "div");
	if(vipCode != '') {
		ajaxPost(baseUrl + 'vip/activate', {
			actUserId: getQueryString("userId"),
			actUserName: getQueryString("userName"),
			code: $('#vipCode').val()
		}, function(res) {
			mui.hideLoading();
			if(res.state == '200') {
				mui.alert('激活成功');
				$('.activatem,.activateUser').css({
					'display': 'none'
				})
			} else {
				mui.alert(res.msg);
			}
		}, function(res) {
			mui.toast('激活VIP码接口异常')
		});
	}
});