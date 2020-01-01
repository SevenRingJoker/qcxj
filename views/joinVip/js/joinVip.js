var joinVipUrl = baseUrl + 'user/save';
var getAgentUrl = baseUrl + 'member/getList';
var loginUrl = baseUrl + 'user/get';
var user = JSON.parse(localStorage.getItem('userInfo'));
var appId; //APPID
var timeStamp; //时间戳
var nonceStr; //随见字符串
var package1; //
var paySign; //支付密匙
var out_trade_no; //商户订单号
var WXPAYSERVER = baseUrl + 'appPay'; //微信連接通道
var ALIPAYSERVER = baseUrl + 'appPay'; //支付連接宝通道
mui.init(); //mui初始化
var channel = null; //获取用户选择的支付途径
var channelArrays = null; //h5+ 中获取支持的支付途径集合
var w = null;
getMemberInfo();
var vm = new Vue({
	el: '#join-vip',
	data: {
		memberInfo: null,
		isShowBtn: false
	}
})

$('#join-vip').on('tap', '.joinBtn', function() {
	if(vm.memberInfo) {
		changePay();
	} else {
		plusToast('代理不存在，请联系客服！');
	}
});

//提前初始化支付   如果是wap方法无效
document.addEventListener('plusready', plusReady, false);

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
		appPay('wxpay', Number(vm.memberInfo[0].joinMoney) * 100, vm.memberInfo[0].name)
	} else {
		ajaxPost(baseUrl + 'pay', {
			total_fee: Number(vm.memberInfo[0].joinMoney) * 100,
			body: vm.memberInfo[0].name,
			openid: user.openid
		}, function(data) {
			appId = data.appId;
			timeStamp = data.timeStamp;
			nonceStr = data.nonceStr;
			package1 = data.package;
			paySign = data.paySign;
			out_trade_no = data.out_trade_no; //做到订单商务号
			confirmPay();
		}, function(data) {
			mui.toast(JSON.stringify(data));
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

function getMemberInfo() {
	ajaxPost(getAgentUrl, {
		pageNo: 1,
		pageSize: 1,
		isShow: 'true'
	}, function(res) {
		if(res.data.length > 0) {
			vm.memberInfo = res.data.filter(function(v) {
				return v.isShow == 'true'
			});
		}
	}, function() {
		ajaxError();
	});
}

ajaxPost(loginUrl, {
	id: user.id
}, function(res) {
	if(res.user != null) {
		localStorage.setItem('userInfo', JSON.stringify(res.user));
		if(res.user.isMember == 'true') {
			vm.isShowBtn = false
			//			$(".headImage").height('100%');
		} else {
			vm.isShowBtn = true
			//			$(".headImage").height('88%');
		}
	}
})

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
	ajaxPost(joinVipUrl, {
		expensesMoney: vm.memberInfo[0].joinMoney,
		id: userInfo.id,
		leadNumber: userInfo.leadNumber || '',
		isMember: 'true',
		userName: userInfo.userName,
		memberId: vm.memberInfo[0].id,
		joinPath: "app",
	}, function(res) {
		if(res.state == '200') {
			localStorage.setItem('userInfo', JSON.stringify(res.user));
			var userInfo = JSON.parse(localStorage.getItem('userInfo'));
			if(userInfo.isMember == 'true') {
				vm.isShowBtn = false;
				//				$(".headImage").height('100%');
			} else {
				vm.isShowBtn = true
				//				$(".headImage").height('88%');
			}
			mui.toast('操作成功')
			setTimeout(function() {
				history.back();
			}, 1000)
		}
	}, function() {
		ajaxError();
	})
}

window.onload = function() {
	var h = $(window).height() - $(".mui-bar-nav").outerHeight(true);
	$(".headImage").height(h);
}