var userCodeUrl = baseUrl + 'user/userCode';
var vm = new Vue({
	el: '#my-poster',
	data: {
		distinct: '',
		list:[]
	},
	updated: function() {
		mui('#slider').slider({
			// interval: 3000
		});
		mui("#picSlider").slider({
			// interval: 1500
		});
	}
})
var number = JSON.parse(localStorage.getItem('userInfo')).phone;
$(function() {
	if(!number) {
		plusToast("请完善个人信息，添加手机号码！");
	} else {
		userCode();
	}
	
	mui('#slider').slider({
		interval: 3000
	});
});

function userCode() {
	ajaxPost(userCodeUrl, {
		phone: number
	}, function(res) {
		vm.list=res.list;
		console.log(res.list);
	}, function() {
		plusToast('请求出错')
	})
}

mui.plusReady(function() {
	if(mui.os.plus) {
		$(".share-box").show();
		mui('#my-poster').on('tap', '.share', function() {
			var pic = [];
			pic.push(baseUrl + vm.distinct);
			window.plusShare({
				pictures: pic,
				type: 'image',
				thumbs: pic
			}, function(status) {
				if(status != true) {
					plusToast('分享失败，请稍后重试！！')
				}
			})
		});
	}
});