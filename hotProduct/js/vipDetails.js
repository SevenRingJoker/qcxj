var vm = new Vue({
	el: "#vipDetails",
	data: {
		hotProduct: {},
		vipFileList: [],
		suffix: [],
	}
});
var hotProduct = localStorage.getItem('hotProduct');
$(function() {
	if (hotProduct != null) {
		vm.hotProduct = JSON.parse(hotProduct);
		if (vm.hotProduct.vipFilePath != null) {
			vm.vipFileList = vm.hotProduct.vipFilePath.split('|');
			$.each(vm.vipFileList, function(i, value) {
				var suffix = value.split('.')[1];
				vm.suffix.push(suffix);
			});
		}
		if (userInfo.hotProductIds != null && userInfo.hotProductIds.indexOf(',' + vm.hotProduct.id + ',') > -1) {
			$('.buy-button').css({
				'display': 'none'
			});
		}
	}

	$('.buy-button').click(function() {
		ajaxPost(baseUrl + 'pay', {
			total_fee: Number(vm.hotProduct.joinMoney) * 100,
			body: vm.hotProduct.title,
			openid: userInfo.openid
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
	});
})


function editUser(hotProductId) {
	if (userInfo != null) {
		hotProductId = userInfo.hotProductIds != null ? (userInfo.hotProductIds += (',' + hotProductId + ',')) : (',' +
			hotProductId + ',');
		ajaxPost(baseUrl + 'user/save', {
			id: userInfo.id,
			hotProductIds: hotProductId
		}, function(res) {
			localStorage.setItem('userInfo', JSON.stringify(res.user));
			mui.alert('恭喜你成功加入会员', '温馨提示', '确定', function(e) {
				goback();
			}, 'div')
		}, function(res) {
			mui.toast('加入会员接口异常');
		})
	}
}

function confirmPay() {
	if (typeof WeixinJSBridge == "undefined") {
		if (document.addEventListener) {
			document.addEventListener('WeixinJSBridgeReady', onBridgeReady, false);
		} else if (document.attachEvent) {
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
			if (res.err_msg == "get_brand_wcpay_request:ok") {
				editUser(vm.hotProduct.id);
			} else {
				mui.confirm('是否重新支付', '支付失败', ['取消', '确定'], function(e) {
					if (e.index == 1) {
						confirmPay();
					}
				})
			}
		}
	);
}
