var usergetUrl = baseUrl + 'user/get';
var noticegetUrl = baseUrl + 'notice/getList';
var historyMsgUrl = baseUrl + 'iMLog/getList';
var vm = new Vue({
	el: '#my-integral',
	data: {
		info: {},
		noticeList: [],
		login: false,
		historyMsgCount: 0,
		levelName: '',
		vipCode: 'false',
		pageNo: 0,
		pageSize: 10,
		pageCount: 1,
		notictTypeList: [],
		noticeType: '',
		optionIn:0
	},
	methods:{
		optionChange(index){
			this.optionIn = index;
			getNoticeType();
		}
	}
})
var userInfo = JSON.parse(localStorage.getItem('userInfo'));
var login = localStorage.getItem('login');
if (login) {
	vm.login = true;
} else {
	console.log("?")
	vm.login = false;
}
var hotProduct = JSON.parse(localStorage.getItem('hotProduct'));

$(function() {
	getUser();
	getHistoryCount();
	getPicture();
	// getData(true, function() {
	// 	mui.hideLoading();
	// });
	getNoticeType();
});

$(window).scroll(function(e) {
	if ($(document).scrollTop() >= $(document).height() - $(window).height()) {
		if (vm.pageNo > vm.pageCount || vm.notictTypeList.length == 0) {
			//			plusToast("没有更多数据啦~")
			return false;
		}
		mui.showLoading("正在加载..", "div");
		getData(false, function() {
			mui.hideLoading();
		})
	}
})

function getPicture() {
	ajaxPost(baseUrl + 'picture/get', {
		id: 1
	}, function(res) {
		console.log(res)
		if (res.picture != null) {
			$('.headBg').css({
				'background-image': 'url(' + fileUrl + res.picture.personalCenter + ')'
			});
			$('#visitingCard').css({
				'background-image': 'url(' + fileUrl + res.picture.visitingCardFilePath + ')'
			});
			console.log(res.picture.noticeTitleFilePath)
			$('#noticeTitleFilePath').attr({
				'src': fileUrl + res.picture.noticeTitleFilePath
			});
		}
	}, function(res) {
		mui.toast('获取图片接口异常');
	})
}



/*问题代码*/
function getUser() {
	if (!checkLogin()) {
		return false;
	}
	console.log(usergetUrl)
	ajaxPost(usergetUrl, {
		id: userInfo.id
	}, function(res) {
		console.log(userInfo.id)
		console.log(res)
		if (res.user != null) {
			console.log(res)
			vm.info = res.user;
			localStorage.setItem('userInfo', JSON.stringify(res.user));
			if (res.user.memberName == '未激活') {
				$('#visitingCard').css({
					'background-image': 'url(imgs/putong,png)'
				});
			}
			if (res.user.memberName == '酒家') {
				$('#visitingCard').css({
					'background-image': 'url(imgs/jiujia.png)'
				});
			} else if (res.user.memberName == '酒友') {
				$('#visitingCard').css({
					'background-image': 'url(imgs/jiuyou.png)'
				});
			} else {
				$('#visitingCard').css({
					'background-image': 'url(imgs/putong.png)'
				});
			}

			if (res.user.member != null && res.user.member.vipSize != null && res.user.member.vipSize > 0 && res.user.member.vipDate !=
				null && res.user.member.vipDate > 0) {
				vm.vipCode = true;
			}
			if (getQueryString('channel') != null && userInfo.hotProductIds != null && userInfo.hotProductIds.indexOf(',' +
					hotProduct.id + ',') > -1) {
				vm.info.memberName = '品牌代理商';
			}
		} else {
			localStorage.removeItem('userInfo');
			location.reload();
		}

	}, function() {
		plusToast('请求出错')
	})
}

function getNotice() {
	ajaxPost(noticegetUrl, {
		pageNo: 1,
		pageSize: 1
	}, function(res) {
		//		console.log(res);
		vm.noticeList = res.data;
	}, function() {
		plusToast('请求出错')
	})
}


function getData(init, cb) {
	console.log(localStorage.getItem('userInfo'))
	if (!JSON.parse(localStorage.getItem('userInfo'))) {
		plusToast('您还没登陆，请先登录');
		return false;
	}
	vm.pageNo += 1;
	console.log(vm.noticeType)
	console.log(vm.notictTypeList[vm.optionIn].type)
	ajaxPost(noticegetUrl, {
		pageNo: vm.pageNo,
		pageSize: vm.pageSize,
		status: 'true',
		type: vm.notictTypeList[vm.optionIn].type
	}, function(res) {
		console.log(res)
		if (init) {
			vm.noticeList = res.data;
		} else {
			vm.noticeList = vm.noticeList.concat(res.data);
		}
		vm.pageCount = res.pageResults.pageCount;
		cb && cb();
	}, function(xhr) {})
}

function refresh() {
	//	window.location.reload();
	if (checkLogin()) {
		openWindow('../medicine/pages/serveUserList/serveUserList.html?comeFrom=my')
	} else {
		// plusToast("您还没登录，请先登录");
	}
}

function grade() {
	if (checkLogin()) {
		if (getQueryString('channel') == null) {
			if (vm.info.isMember == 'true') {
				joinMember();
			} else {
				if (!vm.info.passWord || !vm.info.userName || !vm.info.dealPassWord || !vm.info.name || !vm.info.city || !vm.info.county ||
					!vm.info.address || !vm.info.phone) {
					plusToast("请先完善个人信息");
					setTimeout(function() {
						openWindow('../../views/userMess/userMess.html')
					}, 800);
				} else {
					joinMember();
				}
			}
		} else {
			openWindow('../../hotProduct/vipDetails.html')
		}
	} else {
		plusToast("您还没登录，请先登录");
	}

};

function myintegral() {
	if (checkLogin()) {
		openWindow('../../views/myintegral/myintegral.html')
	} else {
		plusToast("您还没登录，请先登录");
	}
}

function material() {
	if (checkLogin()) {
		openWindow('../../views/material/material.html')
	} else {
		plusToast("您还没登录，请先登录");
	}
}

function affiche() {
	if (checkLogin()) {
		//		window.location.href = '../../views/affiche/affiche.html'
		openWindow('../../views/noticeList/noticeList.html')
	} else {
		plusToast("您还没登录，请先登录")
	}
}

function profit() {
	if (checkLogin()) {
		openWindow('../../views/profit/profit.html')
	} else {
		plusToast("您还没登录，请先登录")
	}
}

function poster() {
	if (checkLogin()) {
		if (!userInfo.phone) {
			plusToast("请完善个人信息，添加手机号码！");
			setTimeout(function() {
				openWindow('../../views/userMess/userMess.html')
			}, 800);
		} else {
			openWindow('../../views/poster/poster.html')
		}
	} else {
		plusToast("您还没登录，请先登录")
	}
}

function myTeam() {
	if (checkLogin()) {
		openWindow('../../views/myTeam/myTeam.html')
	} else {
		plusToast("您还没登录，请先登录")
	}
}

function myPerformance() {
	if (checkLogin()) {
		openWindow('../../views/myPerformance/myPerformance.html')
	} else {
		plusToast("您还没登录，请先登录")
	}
}

function userMsg() {
	if (checkLogin()) {
		openWindow('../../views/userMess/userMess.html')
	} else {
		plusToast("您还没登录，请先登录")
	}
}

function about() {
	//	window.localStorage.setItem('pageUrl', 'https://mp.weixin.qq.com/s/4uVCADFFrUdyZwJZi9ab6A');
	//	window.localStorage.setItem('title', '企业活动');
	openWindow('https://mp.weixin.qq.com/s/4uVCADFFrUdyZwJZi9ab6A')
}

function myAddress() {
	if (checkLogin()) {
		openWindow('../../views/shipping/shipping.html')
	} else {
		plusToast("您还没登录，请先登录")
	}
}

function orderList() {
	if (checkLogin()) {
		openWindow('../../views/orderList/orderList.html')
	} else {
		plusToast("您还没登录，请先登录")
	}
}

function teamOrderList() {
	if (checkLogin()) {
		openWindow('../../views/teamOrderList/teamOrderList.html')
	} else {
		plusToast("您还没登录，请先登录")
	}
}

function dynamic() {
	if (checkLogin()) {
		openWindow('../../views/SignIn/SignIn.html')
	} else {
		plusToast("您还没登录，请先登录")
	}
}

function joinMember() {
	if (checkLogin()) {
		ajaxPost(baseUrl + 'member/getList', {
			pageNo: 1,
			pageSize: 10,
			isShow: 'true'
		}, function(res) {
			if (res.data.length > 0) {
				if (res.data.length == 1) {
					openWindow('../../views/memberDetails/memberNoeDetails.html?id=' + res.data[0].id)
				} else {
					openWindow('../../views/memberList/memberList.html')
				}
			} else {
				mui.toast('系统没有找到开放的代理商套餐！')
			}
		}, function(res) {

		})
	} else {
		plusToast("您还没登录，请先登录")
	}
}

function shoppingCar() {
	if (checkLogin()) {
		openWindow('../../views/shoppingCar/shopping-car.html')
	} else {
		plusToast("您还没登录，请先登录")
	}
}

//function complain() {
//	if(checkLogin()){
//		window.location.href='../../views/complain/complain.html'
//	} else {
//		plusToast("您还没登录，请先登录")
//	}
//}

function servicePoint() {
	if (checkLogin()) {
		openWindow('../../views/servicePoint/servicePoint.html')
	} else {
		plusToast("您还没登录，请先登录")
	}
}

function dynamicManage() {
	if (checkLogin()) {
		openWindow('../../views/dynamicManage/dynamicManage.html')
	} else {
		plusToast("您还没登录，请先登录")
	}
}

mui('#noticeList').on('tap', '.notice-item', function() {
	openWindow('../../views/noticeDetail/noticeDetail.html?noticeId=' + this.getAttribute('noticeId'))
});

mui('#my-integral').on('tap', ".more-btn", function() {
	affiche();
});

function toSetup() {
	if (!checkLogin()) {
		plusToast("您还没登录，请先登录")
	} else {
		openWindow('../../views/setup/setup.html')
	}
}

function getHistoryCount() {
	if (checkLogin()) {
		ajaxPost(historyMsgUrl, {
			toUserId: userInfo.id,
			status: '未读'
		}, function(res) {
			vm.historyMsgCount = res.data.length;
		}, function() {
			ajaxError()
		});
	}
}

function uploadTask() {
	if (checkLogin()) {
		openWindow("../../views/uploadTask/uploadTask.html")
	} else {
		plusToast("您还没登录，请先登录")
	}
}

function taskList() {
	if (checkLogin()) {
		if (userInfo.isMember == 'true' && userInfo.memberId != null) {
			openWindow("../../views/taskList/taskList.html")
		} else {
			mui.alert('功能只对带来商开放，请加入代理商再来试试吧！');
		}
	} else {
		plusToast("您还没登录，请先登录")
	}
}

function coupon() {
	openWindow('../../views/discount/discount.html')
}

//vip码
function vipCode() {
	openWindow('../../views/vipCode/vipCode.html')
}

function donation() {
	openWindow('../../views/donation/donation.html');
}

function coterie() {
	openWindow('../../views/coterie/coterie.html');
}

function getNoticeType() {
	ajaxPost(baseUrl + 'noticeType/getList', {
		pageNo: 1,
		pageSize: 100
	}, function(res) {
		console.log(res);
		if (res.data.length > 0) {
			vm.notictTypeList = res.data;
			vm.noticeType = res.data[0].type;
			getData(true, function() {
				mui.hideLoading();
			});
			setTimeout(function(){
				selectNoticeType();
			}, 1000);
		}
	}, function(res) {
		mui.toast('获取公告分类接口异常');
	});
}

function selectNoticeType() {
	$('.haeder-tab .status').click(function() {
		mui.showLoading("正在加载..", "div");
		$(this).addClass('active').siblings('div').removeClass('active');
		vm.pageNo = 0;
		vm.noticeType = $(this).find('.statusText').text();
		getData(true, function() {
			mui.hideLoading(); //隐藏后的回调函数
		});
	});

}
