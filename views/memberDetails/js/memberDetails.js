var user = JSON.parse(localStorage.getItem('userInfo'));
var appId; //APPID
var timeStamp; //时间戳
var nonceStr; //随见字符串
var package1; //
var paySign; //支付密匙
var out_trade_no; //商户订单号
var WXPAYSERVER = baseUrl + 'appPay'; //微信連接通道
var ALIPAYSERVER = baseUrl + 'appPay'; //支付連接宝通道
var channel = null; //获取用户选择的支付途径
var channelArrays = null; //h5+ 中获取支持的支付途径集合
var w = null;
var vm = new Vue({
	el: '#memberDetails',
	data: {
		member: {},
		fileUrl: fileUrl,
		headFilePathArrays: [],
		contentFilePathArrays: []
	},
	updated: function() {
		mui('#slider').slider({
			interval: 1500
		});
	},
	methods: {
		//购买会员
		buy: function(id) {
			console.log(vm.member)
			if(vm.member.relevancyVip == 'true') {
				mui('#picture').popover('toggle');
			} else {
				changePay();
			}
		},
		onlinePay: function() {
			mui('#picture').popover('toggle');
			changePay()
		},
		prompt: function() {
			mui('#picture').popover('toggle');
			mui.prompt('请输入正确的VIP邀请码', '请输入VIP码', 'VIP注册', new Array('取消', '确定'), function(res) {
				if(res.index == 1) {
					console.log(res.value);
					vipActivate(res.value);
				}
			});
		}
	}
});

$(function() {
	mui('#slider').slider({
		nterval: 5000
	});
	mui.previewImage();
	getMemeberById(getQueryString('id'));
	document.querySelector('.mui-slider').addEventListener('slide', function(event) {
		//注意slideNumber是从0开始的；
		document.getElementById("info").innerText = event.detail.slideNumber + 1;
	});
	//提前初始化支付   如果是wap方法无效
	document.addEventListener('plusready', plusReady, false);
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
});

function vipActivate(code) {
	mui.showLoading("正在加载..", "div");
	ajaxPost(baseUrl + 'vip/activate', {
		actUserId: user.id,
		actUserName: user.userName,
		code: code
	}, function(res) {
		mui.hideLoading();
		if(res.state == '200') {
			mui.alert('激活成功', function() {
				goback();
			});
		} else {
			mui.alert(res.msg);
		}
	}, function(res) {
		mui.toast('激活VIP码接口异常')
	});

}

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

function getMemeberById(id) {
	ajaxPost(baseUrl + 'member/get', {
		id: id,
		state:'buy',
		userId:user.id
	}, function(res) {
		vm.member = res.member;
		vm.headFilePathArrays = res.member.headFilePath.split('|');
		vm.contentFilePathArrays = res.member.contentFilePath.split('|');
		$.each($("textarea"), function(i, n) {
			autoTextarea($(n)[0], 10);
		});
	}, function(res) {
		mui.toast('获取会员套餐信息异常');
	})
}

function plusReady() {
	// 获取支付通道
	plus.payment.getChannels(function(cs) {
		channelArrays = cs;
	}, function(e) {
		alert("获取支付通道失败：" + e.message);
	});
}

//选择支付方式 app之方式  还是  微信支付防止
function changePay() {
	if(mui.os.plus) {
		appPay('wxpay', Number(vm.member.joinMoney) * 100, vm.member.name)
	} else {
		// editUser();
		wx.miniProgram.getEnv(function(res) {
			if(res.miniprogram) {
				// mui.alert('小程序支付功能还没开工！请绕道到微信公众号或APP进行支付');
				wx.miniProgram.navigateTo({
					url: '../pay/pay?userId=' + user.id + '&total_fee=' + (Number(vm.member.joinMoney) * 100) + '&body=' + vm.member
						.name + '&price=' + vm.member.joinMoney + '&memberId=' + vm.member.id + '&type=member',
					success: function() {
						history.back();
					}
				})
			} else {
				ajaxPost(baseUrl + 'pay', {
					total_fee: Number(vm.member.joinMoney) * 100,
					body: vm.member.name,
					openid: user.openid
				}, function(data) {
					appId = data.appId;
					timeStamp = data.timeStamp;
					nonceStr = data.nonceStr;
					package1 = data.package;
					paySign = data.paySign;
					out_trade_no = data.out_trade_no; //做到订单商务号
					confirmPay();
					// editUser();
				}, function(data) {
					mui.toast(JSON.stringify(data));
				})
			}
		})
	}
}

function appPay(id, total_fee, body) {
	if(w) {
		return;
	} //检查是否请求订单中
	// 从服务器请求支付订单
	var PAYSERVER = '';
	if(id == 'alipay') {
		PAYSERVER = ALIPAYSERVER;
	} else if(id == 'wxpay') {
		PAYSERVER = WXPAYSERVER;
	} else {
		plus.nativeUI.alert("不支持此支付通道！");
		return;
	}
	//获取支付通道
	for(var i in channelArrays) {
		if(channelArrays[i].id == id) {
			channel = channelArrays[i];
		}
	}
	w = plus.nativeUI.showWaiting();
	//获取支付通道
	mui.post(PAYSERVER, {
		total_fee: total_fee, //支付费用
		body: body,
		openid: user.appOpenId
	}, function(data) {
		out_trade_no = data.out_trade_no;
		var varpay = { //参数顺序必须正确
			retcode: 0, //5+必备参数
			retmsg: "ok", //5+必备参数
			appid: data.appid,
			noncestr: data.noncestr,
			package: data.package,
			partnerid: data.partnerid,
			prepayid: data.prepayid,
			timestamp: data.timestamp,
			sign: data.sign
		};
		plus.payment.request(channel, varpay, function(result) {
			w.close();
			w = null;
			plus.nativeUI.alert("支付成功！", function(data) {
				editUser();
			});
		}, function(e) {
			w.close();
			w = null;
			//			plus.nativeUI.alert("支付失败：" + JSON.stringify(e));
			plusToast("支付失败，请重新支付")
		});
	}, "json");
}

function wxPay() {
	wx.chooseWXPay({
		timestamp: timeStamp, // 支付签名时间戳，注意微信jssdk中的所有使用timestamp字段均为小写。但最新版的支付后台生成签名使用的timeStamp字段名需大写其中的S字符
		nonceStr: nonceStr, // 支付签名随机串，不长于 32 位
		package: package1, // 统一支付接口返回的prepay_id参数值，提交格式如：prepay_id=\*\*\*）
		signType: 'MD5', // 签名方式，默认为'SHA1'，使用新版支付需传入'MD5'
		paySign: paySign, // 支付签名
		success: function(res) {
			alert(JSON.stringify(res));
		}
	});
}

function confirmPay() {
	if(typeof WeixinJSBridge == "undefined") {
		if(document.addEventListener) {
			document.addEventListener('WeixinJSBridgeReady', onBridgeReady, false);
		} else if(document.attachEvent) {
			document.attachEvent('WeixinJSBridgeReady', onBridgeReady);
			document.attachEvent('onWeixinJSBridgeReady', onBridgeReady);
		}
	} else {
		onBridgeReady();
	}

}

function onBridgeReady() {
	WeixinJSBridge.invoke(
		'getBrandWCPayRequest', {
			"appId": appId, //公众号名称，由商户传入
			"timeStamp": timeStamp, //时间戳，自1970年以来的秒数
			"nonceStr": nonceStr, //随机串
			"package": package1,
			"signType": "MD5", //微信签名方式：
			"paySign": paySign //微信签名
		},
		function(res) {
			if(res.err_msg == "get_brand_wcpay_request:ok") {
				editUser();
			} else {
				alert(JSON.stringify(res.err_msg))
				mui.confirm('是否重新支付', '支付失败', ['取消', '确定'], function(e) {
					if(e.index == 1) {
						confirmPay();
					}
				})
			}
		}
	);
}

function editUser() {
	ajaxPost(baseUrl + 'memberOrder/save', {
		price: vm.member.joinMoney,
		userId: user.id,
		memberId: vm.member.id,
		status: '待处理',
		payState: '在线支付'
	}, function(res) {
		mui.alert('操作成功', '后台管理员正在审核中', function() {
			history.back();
		});
	}, function(res) {
		mui.toast('保存订单接口异常');
	})
	// 	ajaxPost(joinVipUrl, {
	// 		expensesMoney: vm.member.joinMoney,
	// 		id: user.id,
	// 		leadNumber: user.leadNumber || '',
	// 		isMember: 'true',
	// 		userName: user.userName,
	// 		memberId: vm.member.id,
	// 		joinPath: "app",
	// 	}, function(res) {
	// 		if (res.state == '200') {
	// 			localStorage.setItem('userInfo', JSON.stringify(res.user));
	// 			var userInfo = JSON.parse(localStorage.getItem('userInfo'));
	// 			mui.toast('操作成功')
	// 			setTimeout(function() {
	// 				history.back();
	// 			}, 1000)
	// 		}
	// 	}, function() {
	// 		ajaxError();
	// 	})
}