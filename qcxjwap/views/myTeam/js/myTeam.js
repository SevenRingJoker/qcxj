var vm = new Vue({
	el: '#my-integral',
	data: {
		directUser: [],
		indirectUser: [],
		allUser: [],
		list: [],
		searchType: '直推',
		memberList: [],
		memberUserList: [],
		userInfo: JSON.parse(localStorage.getItem('userInfo'))
	},
	methods: {
		myTeam2: function(leadNumber, userName, userId) {
			console.log(123);
			openWindow('../myTeam2/myTeam2.html?leadNumber=' + leadNumber + '&userName=' + userName + '&userId=' + userId)
		}
	}
});
mui.showLoading("正在加载..", "div");
var userInfo = JSON.parse(localStorage.getItem('userInfo'));


ajaxPost(baseUrl + 'user/team', {
	leadNumber: userInfo.phone
}, function(res) {
	mui.hideLoading();
	vm.list = res.directUser;
	vm.directUser = res.directUser;
	vm.indirectUser = res.indirectUser;
	vm.allUser = res.allUser;
	console.log(res.memberList);
	$.each(res.memberList, function(i, value) {
		var count = 0;
		$.each(res.directUser, function(j, j_val) {
			if (j_val.isMember == 'true' && value.id + '' == j_val.memberId) {
				count += 1;
			}
		});
		value.userSize = count;
	});
	vm.memberList = res.memberList;
	setTimeout(function() {
		selectNoticeType();
	}, 1000)
}, function(e) {
	plusToast('请求出错');
	console.log(e);
})

$('#searchBtn').click(function() {
	var searchText = $('#searchText').val();
	console.log(searchText);
	switch (vm.searchType) {
		case '直推':
			vm.list = vm.directUser;
			break;
		case '间推':
			vm.list = vm.indirectUser;
			break;
		case '全部':
			vm.list = vm.allUser;
			break;
		case '会员':
			vm.list = vm.memberUserList;
			break;
	}
	if (searchText != '') {
		var newList = [];
		$.each(vm.list, function(i, value) {
			if (value.userName.indexOf(searchText) > -1) {
				newList.push(value);
			}
		});
		vm.list = newList;
	}
});


// 
// $('.indirectUser').click(function() {
// 	vm.searchType = '间推'
// 	$(this).css({
// 		'color': '#FF4500'
// 	})
// 	$('.directUser,.allUser,.memberUser').css({
// 		'color': '#fff'
// 	})
// 	vm.list = vm.indirectUser;
// });
// 
// $('.directUser').click(function() {
// 	vm.searchType = '直推'
// 	$(this).css({
// 		'color': '#FF4500'
// 	})
// 	$('.indirectUser,.allUser,.memberUser').css({
// 		'color': '#fff'
// 	})
// 	vm.list = vm.directUser;
// });
// $('.allUser').click(function() {
// 	vm.searchType = '全部'
// 	$(this).css({
// 		'color': '#FF4500'
// 	})
// 	$('.indirectUser,.directUser,.memberUser').css({
// 		'color': '#fff'
// 	})
// 	vm.list = vm.allUser;
// });
// 
// function memberUserClick() {
// 	$('body').find('.memberUser').click(function() {
// 		vm.searchType = '会员';
// 		$('.indirectUser,.directUser,.memberUser').css({
// 			'color': '#fff'
// 		});
// 		$(this).css({
// 			'color': '#FF4500'
// 		});
// 		vm.memberUserList = [];
// 		var memberId = $(this).attr('memberId');
// 		$.each(vm.memberList, function(i, value) {
// 			$.each(vm.directUser, function(j, j_val) {
// 				if (j_val.isMember == 'true' && value.id + '' == j_val.memberId) {
// 					vm.memberUserList.push(j_val);
// 				}
// 			});
// 		});
// 		vm.list = vm.memberUserList;
// 	})
// }

function selectNoticeType() {
	$('.haeder-tab .status').click(function() {
		$(this).addClass('active').siblings('div').removeClass('active');
		var text = $(this).find('.text').text();
		switch (text) {
			case '总团队人数':
				vm.searchType = '全部';
				vm.list = vm.allUser;
				break;
			case '直推':
				vm.searchType = '直推'
				vm.list = vm.directUser;
				break;
			case '间推':
				vm.searchType = '间推';
				vm.list = vm.indirectUser;
				break;
			default:
				vm.searchType = '会员';
				vm.memberUserList = [];
				var memberId = $(this).attr('memberId');
				console.log(memberId)
				$.each(vm.memberList, function(i, value) {
					$.each(vm.directUser, function(j, j_val) {
						if (j_val.isMember == 'true' && value.id + '' == j_val.memberId ==memberId) {
							vm.memberUserList.push(j_val);
						}
					});
				});
				vm.list = vm.memberUserList;
				break;
		}
	});

}
