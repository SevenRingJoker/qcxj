mui.init()
var userInfo = JSON.parse(localStorage.getItem('userInfo'));
var vm = new Vue({
	el: '#order',
	data: {
		order: {},
		shopCars: [],
		counts: [],
		ids: [],
		totalConversion: 0,
		totalIntegral: 0,
		totalMoney: 0,
		address: null,
		receivingType: '',
		deliveryMoney: 0,
		serviceBranchList: [],
		lng: 0,
		lat: 0,
		serviceBranchIndex: null,
		payStatus: '',
		count: 0,
		bodyText: '',
		out_trade_no: '',
		myAddress: null,
		passBuyCount: [100],
		totalWelfare: 0
	},
	methods: {
		//选择网点
		clickServiceBranch: function(serviceBranch, i) {
			vm.serviceBranchIndex = i;
			vm.address = {
				name: serviceBranch.name,
				phone: serviceBranch.userNumber,
				province: serviceBranch.province,
				city: serviceBranch.county,
				region: serviceBranch.province,
				address: serviceBranch.address,
			}
			mui('#serviceBranchModel').popover('toggle');
		},
		delCount: function(index, id) {
			console.log(index, id);
			if (Number(mui('.numboxShopCare' + id).numbox().getValue()) == 0) {
				mui('.numboxShopCare' + id).numbox().setValue(1)
			} else {
				switch (vm.payStatus) {
					case '在线支付':
						vm.totalMoney -= vm.shopCars[index].price;
						break;
					case '积分':
						vm.totalIntegral -= vm.shopCars[index].price;
						break;
					case '抵扣券':
						vm.totalConversion -= vm.shopCars[index].conversion;
						break;
				}
			}
			vm.counts[index] = Number(mui('.numboxShopCare' + id).numbox().getValue());

		},
		addCount: function(index, id) {
			switch (vm.payStatus) {
				case '在线支付':
					vm.totalMoney += vm.shopCars[index].price
					break;
				case '积分':
					vm.totalIntegral += vm.shopCars[index].price
					break;
				case '抵扣券':
					vm.totalConversion += vm.shopCars[index].conversion
					break;
			}
			vm.counts[index] = Number(mui('.numboxShopCare' + id).numbox().getValue());
		}
	}
});

$(function() {
	if (getQueryString('type') == 'shoppingCar') {
		vm.counts = getQueryString('counts').split(',');
		vm.ids = getQueryString('ids').split(',');
		ajaxPost(baseUrl + 'shopCar/getList', {
			ids: getQueryString('ids'),
			pageNo: 1,
			pageSize: getQueryString('ids').split(',').length,
			passBuyCountStatus: 'true'
		}, function(res) {
			var map = new Map;
			$.each(res.data, function(i, value) {
				map.set(value.id, value);
				vm.bodyText += value.productTitle + '、'
				if (value.product.isDelivery != 'true') {
					$('.serviceBranch').css({
						'display': 'none'
					});
					vm.receivingType = '包邮'
				} else {
					vm.receivingType = '自费物流'
					vm.totalMoney += Number(value.product.deliveryMoney);
					vm.deliveryMoney += Number(value.product.deliveryMoney);
				}

				if (value.product.isOnlinePay != 'true' || value.price <= 0) {
					$('.isOnlinePay').parent().css({
						'display': 'none'
					})
				}
				if (value.product.isIntegralPay != 'true' || value.price <= 0) {
					$('.isIntegralPay').parent().css({
						'display': 'none'
					})
				}
				if (value.product.isConversionPay != 'true' || value.conversion <= 0) {
					$('.isConversionPay').parent().css({
						'display': 'none'
					})
				}
			});
			//重新排序
			$.each(vm.ids, function(i, value) {
				if (value != null) {
					vm.shopCars.push(map.get(Number(value)));

				}
			});

			setTimeout(function() {
				$.each(vm.ids, function(i, value) {
					if (value != null) {
						mui('.numboxShopCare' + value).numbox().setValue(vm.counts[i]);
						console.log(vm.shopCars[i].passBuyCount);
						mui('.numboxShopCare' + value).numbox().setOption('max', vm.shopCars[i].passBuyCount);
					}
				});
			}, 1000)

		}, function(res) {
			mui.toast('获取购物车数据异常')
		})
	} else {
		vm.count = Number(getQueryString('count'));
		mui('.mui-numbox').numbox().setValue(vm.count)
		//获取订单订单
		ajaxPost(baseUrl + 'order/get', {
			id: getQueryString('orderId'),
			passBuyCount: 'true'
		}, function(res) {
			if (res.order != null) {
				vm.order = res.order;
				vm.bodyText = res.order.productTitle
				if (res.order.product.isDelivery == 'true') {
					vm.receivingType = '自费物流'
					vm.totalMoney = Number(res.order.product.deliveryMoney);
					vm.deliveryMoney = Number(res.order.product.deliveryMoney);
					$('.serviceBranch').css({
						'display': 'flex'
					});
				} else {
					vm.receivingType = '包邮'
					$('.serviceBranch').css({
						'display': 'none'
					});
				}
				res.order.product.isOnlinePay == 'true' && res.order.price > 0 ? true : $('#isOnlinePay').parent().css({
					'display': 'none'
				});
				res.order.product.isIntegralPay == 'true' && res.order.price > 0 ? true : $('#isIntegralPay').parent().css({
					'display': 'none'
				});
				res.order.product.isConversionPay == 'true' && res.order.conversion > 0 ? true : $('#isConversionPay').parent()
					.css({
						'display': 'none'
					});
				(res.order.product.isJoinWelfare == 'true' && userInfo.welfareCount != null && userInfo.welfareCount > 0) ? $(
						'#isJoinWelfarePay').parent()
					.css({
						'display': 'flex'
					}): true
				if (res.passBuyCount != null) {
					vm.passBuyCount[0] = res.passBuyCount
					mui('.numboxProduct').numbox().setOption('max', res.passBuyCount)
				}
			}
		}, function(res) {
			mui.toast('获取订单请求请求出错');
		});
	}
	//获取默认收货地址
	if (localStorage.getItem('addressObj')) {
		vm.address = JSON.parse(localStorage.getItem('addressObj'));
	} else {
		ajaxPost(baseUrl + 'address/getList', {
			userId: userInfo.id,
			active: true,
			pageNo: 1,
			pageSize: 1,
		}, function(res) {
			if (res.data.length > 0) {
				vm.address = res.data[0];
				vm.myAddress = vm.address;
			}
		}, function(res) {
			mui.toast('获取用户默认时候地址请求出错');
		})
	}
	//滑动
	mui('.mui-scroll-wrapper').scroll({
		deceleration: 0.0005, //flick 减速系数，系数越大，滚动速度越慢，滚动距离越小，默认值0.0006
	});

	if (!mui.os.plus) {
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

//加减数量
mui('.numboxProduct').on('tap', 'button', function() {
	console.log(Number(mui('.mui-numbox').numbox().getValue()))
	if (Number(mui('.mui-numbox').numbox().getValue()) == 0) {
		mui('.mui-numbox').numbox().setValue(1)
	}
	vm.count = Number(mui('.mui-numbox').numbox().getValue());
	if (vm.count > 0) {
		switch (vm.payStatus) {
			case '在线支付':
				vm.totalMoney = vm.order.price * vm.count;
				break;
			case '福包':
				vm.totalWelfare = vm.order.welfare * (vm.count);
				break;
			case '积分':
				vm.totalIntegral = vm.order.price * vm.count;
				// mui(this)[0].textContent == '+' ? vm.totalIntegral += vm.order.price : vm.totalIntegral -= vm.order.price;
				break;
			case '抵扣券':
				// mui(this)[0].textContent == '+' ? vm.totalConversion += vm.order.conversion : vm.totalConversion -= vm.order.conversion;
				vm.totalConversion = vm.order.conversion * vm.count;
				break;
		}
	}
})

//订单为网点时  用户选择 网点代收 还是  自费物流
document.getElementById("changeServiceBranch").addEventListener("toggle", function(event) {
	if (event.detail.isActive) {
		vm.receivingType = '网点'
		vm.totalMoney = vm.totalMoney - vm.deliveryMoney;
		vm.address = null;
	} else {
		vm.receivingType = '自费物流'
		vm.totalMoney = vm.totalMoney + vm.deliveryMoney
		vm.address = vm.myAddress
	}
});

//选择支付通道 在线支付
document.getElementById("isOnlinePay").addEventListener("toggle", function(event) {
	$(".mui-switch-handle").attr("style", "");
	if (event.detail.isActive) {
		$('#isIntegralPay,#isConversionPay,#isJoinWelfarePay').removeClass('mui-active')
		vm.payStatus = '在线支付';
		if (getQueryString('type') == 'shoppingCar') {
			vm.totalMoney = 0;
			$.each(vm.shopCars, function(i, value) {
				vm.totalMoney += (value.price * Number(vm.counts[i])) + (vm.receivingType == '自费物流' ? value.product.deliveryMoney :
					0);
			});
		} else {
			vm.totalMoney = (vm.count * vm.order.price) + (vm.receivingType == '自费物流' ? vm.deliveryMoney : 0);
		}
		vm.totalConversion = 0;
		vm.totalIntegral = 0;
	} else {
		vm.payStatus = '';
		vm.totalMoney = (vm.receivingType == '自费物流' ? vm.deliveryMoney : 0);
	}
})
//选择支付通道  积分支付
document.getElementById("isIntegralPay").addEventListener("toggle", function(event) {
	$(".mui-switch-handle").attr("style", "");
	if (event.detail.isActive) {
		$('#isOnlinePay,#isConversionPay,#isJoinWelfarePay').removeClass('mui-active')
		vm.payStatus = '积分';
		if (getQueryString('type') == 'shoppingCar') {
			vm.totalIntegral = 0;
			$.each(vm.shopCars, function(i, value) {
				vm.totalIntegral += (value.price * Number(vm.counts[i]));
			});
		} else {
			vm.totalIntegral = (vm.count * vm.order.price);
		}
		vm.totalMoney = vm.receivingType == '自费物流' ? vm.deliveryMoney : 0;
		vm.totalConversion = 0;
		vm.totalWelfare = 0;
	} else {
		vm.payStatus = '';
		vm.totalIntegral = 0;

	}
})
//选择支付通道  抵扣券支付
document.getElementById("isConversionPay").addEventListener("toggle", function(event) {
	$(".mui-switch-handle").attr("style", "");
	if (event.detail.isActive) {
		$('#isIntegralPay,#isOnlinePay,#isJoinWelfarePay').removeClass('mui-active')
		vm.payStatus = '抵扣券';
		vm.totalMoney = vm.receivingType == '自费物流' ? vm.deliveryMoney : 0;
		if (getQueryString('type') == 'shoppingCar') {
			vm.totalConversion = 0;
			$.each(vm.shopCars, function(i, value) {
				vm.totalConversion += (value.conversion * Number(vm.counts[i]));
			});
		} else {
			vm.totalConversion = (vm.count * vm.order.conversion);
		}
		vm.totalIntegral = 0;
		vm.totalWelfare = 0;
	} else {
		vm.payStatus = '';
		vm.totalConversion = 0;
	}
})
//选择支付通道  福包支付
document.getElementById("isJoinWelfarePay").addEventListener("toggle", function(event) {
	$(".mui-switch-handle").attr("style", "");
	if (event.detail.isActive) {
		$('#isIntegralPay,#isConversionPay,#isOnlinePay').removeClass('mui-active')
		vm.payStatus = '福包';
		vm.totalMoney = vm.receivingType == '自费物流' ? vm.deliveryMoney : 0;
		if (getQueryString('type') == 'shoppingCar') {
			vm.totalMoney = 0;
			$.each(vm.shopCars, function(i, value) {
				vm.totalWelfare += (value.price * Number(vm.counts[i])) + (vm.receivingType == '自费物流' ? value.product.deliveryMoney :
					0);
			});
		} else {
			vm.totalWelfare = (vm.count * vm.order.welfare);
		}
		vm.totalConversion = 0;
		vm.totalIntegral = 0;
	} else {
		vm.payStatus = '';
		vm.totalIntegral = 0;
	}
})

//更多收货地址
$('#moreAddress').click(function() {
	if (vm.receivingType == '网点') {
		mui('#serviceBranchModel').popover('toggle');
	} else {
		openWindow('../shipping/shipping.html')
	}
});

//选择网点
mui(document.body).on('tap', '.selectServiceBranch', function(e) {
	mui(this).button('loading');
	setTimeout(function() {
		if (vm.serviceBranchList.length > 0) {
			mui('#serviceBranchModel').popover('toggle');
		} else {
			getServiceBranchList();
		}
		mui(this).button('reset');
	}.bind(this), 2000);
});

//获取网点列表
function getServiceBranchList() {
	if (vm.lng != 0 && vm.lat != 0) {
		ajaxPost(baseUrl + 'serviceBranch/getList', {
			lng: vm.lng,
			lat: vm.lat,
			distance: 1000000,
			pageNo: 1,
			pageSize: 99999,
		}, function(res) {
			// alert('网点长度：'+res.data.length);
			if (res.data.length > 0) {
				vm.serviceBranchList = res.data;
				mui('#serviceBranchModel').popover('toggle');
			}
		}, function(res) {
			mui.toast('获取网点接口异常');
		})
	} else {
		//		mui.toast('用户未授权当前地理位置');
		getUserLocation();
	}
}

/**
 * 获取当前用户的地理位置
 */
function getUserLocation() {
	if (vm.lng == 0 && vm.lat == 0) {
		if (mui.os.plus) {
			$('body').append('<div id="noneMap" style="display: none;"></div>');
			if (window.plus) {
				plusReady();
			} else {
				document.addEventListener("plusready", plusReady, false);
			}

			function plusReady() {
				// 百度地图API功能
				var geolocation = new BMap.Geolocation();
				geolocation.getCurrentPosition(function(r) {
					if (this.getStatus() == BMAP_STATUS_SUCCESS) {
						vm.lng = r.point.lng; //经度坐标
						vm.lat = r.point.lat; //纬度坐标
						getServiceBranchList();
					} else {
						alert('failed' + this.getStatus());
					}
				}, {
					enableHighAccuracy: true
				});

			}
		} else {
			wx.getLocation({
				type: 'gcj02', // 默认为wgs84的gps坐标，如果要返回直接给openLocation用的火星坐标，可传入'gcj02'
				success: function(res) {
					var gcj02 = gcj02tobd09(res.longitude, res.latitude);
					vm.lat = gcj02[1]; // 纬度，浮点数，范围为90 ~ -90
					vm.lng = gcj02[0]; // 经度，浮点数，范围为180 ~ -180。
					var speed = res.speed; // 速度，以米/每秒计
					var accuracy = res.accuracy; // 位置精度
					getServiceBranchList();
				}
			});
		}
	}
}

/**
 * 获取两地之间的距离
 * @param lng 目的地 lng
 * @param lat 目的地 lat
 * @returns {string}
 */
function distance(lng, lat) {
	if (vm.lng != 0 && vm.lat != 0) {
		var map = new BMap.Map("allmap");
		var pointA = new BMap.Point(vm.lng, vm.lat); // 创建点坐标A--大渡口区
		var pointB = new BMap.Point(lng, lat); // 创建点坐标B--江北区
		newDistance = (map.getDistance(pointA, pointB)).toFixed(1) / 1000;
		return '该网点距离你 ' + newDistance.toFixed(2) + 'km';
	} else {
		return '用户未授权地理位置';
	}

}

function decimal(number) {
	return Number(number.toFixed(2))
}

//确定支付
mui(document.body).on('tap', '.payBtn', function(e) {
	mui(this).button('loading');
	setTimeout(function() {
		mui(this).button('reset');
	}.bind(this), 2000);
	if (vm.payStatus == '抵扣券' && vm.totalConversion > userInfo.conversion) {
		mui.toast('抵扣券不足')
		return false;
	} else if (vm.payStatus == '积分' && vm.totalIntegral > userInfo.integral) {
		mui.toast('积分不足')
		return false;
	} else if (vm.payStatus == '福包' && vm.totalWelfare > userInfo.welfareCount) {
		mui.toast('福包不足')
		return false;
	} else if (vm.payStatus == '') {
		mui.toast('请选择支付类型')
		return false;
	}
	if (vm.address == null) {
		mui.toast('收货地址不能为空')
		return false;
	}
	if (vm.totalMoney > 0) {
		changePay();
	} else {
		saveOrder();
	}
});

function changePay() {
	if (mui.os.plus) {
		// app支付
		appPay('wxpay', Number(vm.totalMoney) * 100, vm.bodyText)
	} else {
		wx.miniProgram.getEnv(function(res) {
			if (res.miniprogram) {
				ajaxPost(baseUrl + 'order/cleanPaying', {
					userId: userInfo.id
				}, function(res) {
					saveOrder('mini')
				}, function(res) {
					mui.toast('清除用户支付中订单异常');
				});
			} else {
				// h5支付
				ajaxPost(baseUrl + 'pay', {
					total_fee: vm.totalMoney * 100,
					body: vm.bodyText,
					openid: user.openid
				}, function(res) {
					vm.out_trade_no = res.out_trade_no
					WeixinJSBridge.invoke(
						'getBrandWCPayRequest', {
							"appId": res.appId, //公众号名称，由商户传入
							"timeStamp": res.timeStamp, //时间戳，自1970年以来的秒数
							"nonceStr": res.nonceStr, //随机串
							"package": res.package,
							"signType": "MD5", //微信签名方式：
							"paySign": res.paySign //微信签名
						},
						function(res) {
							if (res.err_msg == "get_brand_wcpay_request:ok") {
								//支付之后的页面跳转
								saveOrder();
								//						goback();;
							} else {
								alert(JSON.stringify(res));
								mui.confirm('是否重新支付', '支付失败', ['取消', '确定'], function(e) {
									if (e.index == 1) {
										$('.payBtn').click();
									}
								})
							}
						}
					);
				}, function() {
					ajaxError();
				})
			}
		})
	}
}
var channel = null; //获取用户选择的支付途径
var channelArrays = null; //h5+ 中获取支持的支付途径集合
var w = null;
var WXPAYSERVER = baseUrl + 'appPay'; //微信連接通道
var ALIPAYSERVER = baseUrl + 'appPay'; //支付連接宝通道
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

function appPay(id, total_fee, body) {
	if (w) {
		return;
	} //检查是否请求订单中
	// 从服务器请求支付订单
	var PAYSERVER = '';
	if (id == 'alipay') {
		PAYSERVER = ALIPAYSERVER;
	} else if (id == 'wxpay') {
		PAYSERVER = WXPAYSERVER;
	} else {
		plus.nativeUI.alert("不支持此支付通道！");
		return;
	}
	//获取支付通道
	for (var i in channelArrays) {
		if (channelArrays[i].id == id) {
			channel = channelArrays[i];
		}
	}
	w = plus.nativeUI.showWaiting();
	//获取支付通道
	mui.post(PAYSERVER, {
		total_fee: total_fee, //支付费用
		body: body,
		openid: userInfo.appOpenId
	}, function(data) {
		vm.out_trade_no = data.out_trade_no;
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
				saveOrder();
			});
		}, function(e) {
			w.close();
			w = null;
			plus.nativeUI.alert("支付失败：" + JSON.stringify(e));
		});
	}, "json");
}

function saveOrder(initType) {
	if (getQueryString('type') == 'mallDetail') {
		mui.showLoading()
		ajaxPost(baseUrl + 'order/save', {
			out_trade_no: vm.out_trade_no,
			id: vm.order.id,
			name: vm.address.name,
			phone: vm.address.phone,
			address: vm.address.province + vm.address.city + vm.address.region + vm.address.address,
			count: vm.count,
			status: initType == 'mini' ? '支付中' : '待发货',
			total: vm.totalMoney,
			totalConversion: vm.totalConversion,
			totalIntegral: vm.totalIntegral,
			receivingType: vm.receivingType,
			receivingMoney: vm.receivingMoney,
			payStatus: vm.payStatus,
			serviceBranchId: vm.serviceBranchIndex != null ? vm.serviceBranchList[vm.serviceBranchIndex].id : 0,
			totalWelfare: vm.totalWelfare
		}, function(res) {
			mui.alert(initType)
			if (initType == 'mini') {
				wx.miniProgram.navigateTo({
					url: '../pay/pay?userId=' + userInfo.id + '&id=' + vm.order.id + '&total_fee=' + (vm.totalMoney * 100) +
						'&body=' + vm.bodyText + '&type=order'
				});
			}
			mui.hideLoading();
			mui.toast('保存订单成功');
			// if (vm.order.product.isJoinGame == 'true') {
			// 	mui.confirm('如支付成功，还有赠送一次玩游戏的机会呢！', '支付提示', ['取消', '确定'], function(e) {
			// 		if (e.index == 1) {
			// 			openWindow('../luckDraw/game.html');
			// 		} else {
			// 			goback();
			// 		}
			// 	})
			// } else {
			setTimeout(function() {
				goback();
			}, 500)
			// }
		}, function(res) {
			mui.toast('保存订单失败');
			mui.hideLoading();
		});
	} else {
		var orderIndex = 0;
		var ids = '';
		$.each(vm.ids, function(i, value) {
			var totalMoney = 0;
			if (vm.payStatus == '在线支付') {
				if (vm.receivingType == '自费物流') {
					totalMoney = Number(vm.shopCars[i].price) * Number(vm.counts[i]) + vm.shopCars[i].product.receivingMoney;
				} else {
					totalMoney = Number(vm.shopCars[i].price) * Number(vm.counts[i]);
				}
			} else if (vm.receivingType == '自费物流') {
				totalMoney = vm.shopCars[i].product.receivingMoney;
			}

			ajaxPost(baseUrl + 'order/save', {
					out_trade_no: vm.out_trade_no,
					userId: userInfo.id,
					name: vm.address.name,
					phone: vm.address.phone,
					address: vm.address.province + vm.address.city + vm.address.region + vm.address.address,
					subProductTitle: vm.shopCars[i].productSubTitle,
					price: vm.shopCars[i].price,
					conversion: vm.shopCars[i].conversion,
					count: vm.counts[i],
					productFilePath: vm.shopCars[i].filePath,
					productTitle: vm.shopCars[i].productTitle,
					status: initType == 'mini' ? '支付中' : '待发货',
					total: totalMoney.toFixed(2),
					totalConversion: vm.payStatus == '抵扣券' ? (Number(vm.counts[i]) * vm.shopCars[i].conversion).toFixed(2) : 0,
					totalIntegral: vm.payStatus == '积分' ? (Number(vm.shopCars[i].price) * Number(vm.counts[i])).toFixed(2) : 0,
					receivingType: vm.receivingType,
					receivingMoney: vm.shopCars[i].product.receivingMoney,
					original: vm.shopCars[i].original,
					payStatus: vm.payStatus,
					serviceBranchId: vm.serviceBranchIndex != null ? vm.serviceBranchList[vm.serviceBranchIndex].id : 0,
					shopCarId: vm.shopCars[i].id,
					totalWelfare: vm.payStatus == '福包' ? (Number(vm.shopCars[i].welfare) * Number(vm.counts[i])).toFixed(2) : 0,
				}, function(res) {
					mui.toast('保存订单成功');
					orderIndex += 1;
					ids += res.order.id + ','
					if (orderIndex == vm.ids.length) {
						if (initType == 'mini') {
							wx.miniProgram.navigateTo({
								url: '../pay/pay?userId=' + userInfo.id + '&ids=' + ids.substr(0, ids.length - 1) + '&total_fee=' + (vm.totalMoney *
									100) + '&body=' + vm.bodyText
							});

						}
						goback();
						//						mui.confirm('如支付成功，还有赠送一次玩游戏的机会呢！', '支付提示', ['取消', '确定'], function(e) {
						//							if(e.index == 1) {
						//								openWindow('../luckDraw/game.html');
						//							} else {
						//								goback();
						//							}
						//						})
					}
				},
				function(res) {
					mui.toast('保存订单失败');
				});
		});
	}

}
