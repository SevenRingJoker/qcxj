var vm = new Vue({
	el: '#mall-detail',
	data: {
		product: {},
		bannerPic: [],
		contentPic: [],
		subTitle: [],
		subMoney: [],
		subInventory: [],
		subPrice: '',
		subInventorytext: '',
		productTitle: '',
		imgPath: fileUrl,
		count: 1,
		subConversionArrays: [],
		subConversion: '',
		subWelfareArrays: [],
		subWelfare: '',
		shareImage: '',
		passBuyCount: null,
		reclassifyCountArrays: [],
		reclassifyTitleArrays: [],
		reclassifyContentArrays: [],
		reclassify: '',
		reclassifyIndexStrat: 0,
		reclassifyIndexEnd: 0
	},
	updated: function() {
		mui('#slider').slider({
			interval: 1500
		});
	},
	methods: {
		reclassifyCheck: function(i, j) {
			$('.reclassify' + i + j).addClass('active').siblings('li').removeClass('active');
			vm.reclassify = '';
			$.each($('.reclassifyTitle'), function(i, value) {
				var title = $(this).text();
				var content = $(this).parent().find('.active').text();
				vm.reclassify += title + ':' + content + ' ,';
			});
			if (vm.reclassify != '') {
				vm.reclassify = vm.reclassify.substr(0, vm.reclassify.length - 2)
			}
		}
	}
});
var userInfo = JSON.parse(localStorage.getItem('userInfo'));
var productDetailUrl = baseUrl + 'product/get';
var saveCurOrder = baseUrl + 'order/save';
var addShoppingCarUrl = baseUrl + 'shopCar/save';

$(function() {
	mui.showLoading("正在加载..", "div");
	mui('#slider').slider({});
	mui.previewImage();
	var orderId = getQueryString('productId');
	getProductDeatail(orderId);
	document.querySelector('.mui-slider').addEventListener('slide', function(event) {
		//注意slideNumber是从0开始的；
		document.getElementById("info").innerText = event.detail.slideNumber + 1;
	});
	mui('#mall-detail').on('tap', '.styles', function() {
		mui("#popover").popover('toggle', document.getElementById("mask"));
		mui('#popover .mui-scroll-wrapper').scroll();
	});
	mui('#mall-detail').on('tap', '.safeguard', function() {
		mui("#explain").popover('toggle', document.getElementById("mask"));

	});
	mui('#explain').on('tap', '.btn', function() {
		mui("#explain").popover('toggle', document.getElementById("mask"));
	});

	// 立即购买（弹窗）
	mui('.exchange-btn').on('tap', '.buy-btn', function() {
		saveOrder();
		mui("#popover").popover('toggle', document.getElementById("mask"));
	});

	// 立即购买（底部按钮）
	mui('.button-bar').on('tap', '.buy-button', function() {
		saveOrder();
	});

	// 弹窗选择规格
	$(".classes").on('tap', '.sub-item', function() {
		var index = $(this).index();
		$(this).addClass('active').siblings('li').removeClass('active');
		vm.subPrice = vm.subMoney[index];
		vm.subInventorytext = vm.subInventory[index];
		vm.subPrice = vm.subMoney[index];
		vm.productTitle = vm.subTitle[index];
		vm.subConversion = vm.subConversionArrays[index];
		vm.subWelfare = vm.subWelfareArrays[index];
		//		vm.curDiscount = vm.discounts[index]
		var reclassifyIndexStrat = 0;
		for (var i = 0; i < index; i++) {
			reclassifyIndexStrat += vm.reclassifyCountArrays[i];
		}
		vm.reclassifyIndexStrat = reclassifyIndexStrat;
		vm.reclassifyIndexEnd = reclassifyIndexStrat + vm.reclassifyCountArrays[index];
	});

	// 规格 关闭弹窗按钮
	mui('#mall-detail').on('tap', '.close', function() {
		mui("#popover").popover('toggle', document.getElementById("mask"));
	});

	// 编辑数量
	mui('#mall-detail').on('change', '.mui-input-numbox', function() {
		vm.count = document.querySelector(".mui-input-numbox").value
	});

	mui('.button-bar').on('tap', '.car', function() {
		openWindow('../shoppingCar/shopping-car.html')
	})

	//加入购物车
	mui('.button-bar').on('tap', '.add-car-button', function() {
		addShoppingCar();
	});

	// 加入购物车（弹窗）
	mui('.exchange-btn').on('tap', '.add-car-btn', function() {
		addShoppingCar();
		mui("#popover").popover('toggle', document.getElementById("mask"));
	});
	getShareImg();
	console.log(location.href)
	if (!mui.os.plus) {
		ajaxPost(baseUrl + 'SdkConfig', {
				url: location.href
			}, function(data) {
				Config(data.appId, data.timestamp, data.nonceStr, data.signature, data.jsApiList);
			},
			function(res) {
				mui.toast('获取微信JJSDK配置信息异常');
			});
		wx.miniProgram.getEnv(function(res) {
			if (!res.miniprogram) {
				$('.shareBtn').find('div').css({
					'display': 'none'
				})
				$('.shareBtn').css({
					'text-align': 'center'
				}).html('请长按操作图片');
			}
		})
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

function getProductDeatail(id) {
	mui.hideLoading();
	ajaxPost(productDetailUrl, {
		id: id,
		userId: userInfo.id
	}, function(res) {
		console.log(res)
		if (!isNullObject(res.product)) {
			vm.product = res.product;
			vm.bannerPic = res.product.headFilePath.split('|');
			vm.contentPic = res.product.contentFilePath.split('|');
			vm.subTitle = res.product.subTitle.split(',').filter(function(v) {
				return v != ''
			});
			vm.subConversionArrays = res.product.subConversion.split(',')
			vm.subWelfareArrays = res.product.subWelfare.split(',')
			vm.subMoney = res.product.subMoney.split(',');
			vm.subInventory = res.product.subInventory.split(',');
			vm.subPrice = vm.subMoney[0];
			vm.subInventorytext = vm.subInventory[0];
			vm.productTitle = vm.subTitle[0];
			vm.subConversion = vm.subConversionArrays[0]
			vm.subWelfare = vm.subWelfareArrays[0]
			if (typeof(res.passBuyCount) == 'number') {
				vm.passBuyCount = res.passBuyCount;
			}
			if (res.product.reclassifyCount != null && res.product.reclassifyCount != '') {
				vm.reclassifyCountArrays = res.product.reclassifyCount.split(',').map(Number);
			}
			if (res.product.reclassifyTitle != null && res.product.reclassifyTitle != '') {
				vm.reclassifyTitleArrays = res.product.reclassifyTitle.split(',');
			}
			$.each(res.product.reclassifyContent.split(','), function(i, value) {
				vm.reclassifyContentArrays.push(value.split('|'))
			});
			vm.reclassifyIndexEnd = vm.reclassifyCountArrays[0];
			for (var i = 0; i < vm.reclassifyCountArrays[0]; i++) {
				if (vm.reclassifyTitleArrays[i] != '' && vm.reclassifyContentArrays[i][0] != '') {
					vm.reclassify += vm.reclassifyTitleArrays[i] + ':' + vm.reclassifyContentArrays[i][0] + ' ,';
				}
			}

			if (vm.reclassify != '') {
				vm.reclassify = vm.reclassify.substr(0, vm.reclassify.length - 2)
			}
			//			vm.discounts = res.product.discounts.split(',');
			//			vm.curDiscount = vm.discounts[0];
			$(".intro-content").text(vm.product.content);
			$.each($("textarea"), function(i, n) {
				autoTextarea($(n)[0], 10);
			});
		} else {
			console.log()
		}
	}, function() {
		console.log(id)
	});
}

function saveOrder() {
	if (typeof(vm.passBuyCount) == 'number' && vm.count > vm.passBuyCount) {
		mui.toast('当前商品为限购商品，请稍后重试吧！');
		return false;
	}
	ajaxPost(saveCurOrder, {
		productId: vm.product.id,
		userId: userInfo.id,
		name: userInfo.userName,
		phone: userInfo.phone,
		address: userInfo.province + userInfo.city + userInfo.county,
		subProductTitle: vm.productTitle + ' ' + vm.reclassify,
		price: vm.subPrice,
		count: vm.count,
		productFilePath: vm.product.homeFilePath,
		productTitle: vm.product.title,
		status: '待支付',
		total: (Number(vm.subPrice) * Number(vm.count)).toFixed(2),
		receivingType: vm.product.isDelivery == 'false' ? '包邮' : vm.product.deliveryMoney,
		receivingMoney: vm.product.isDelivery == 'false' ? 0 : vm.product.deliveryMoney,
		original: vm.subPrice,
		totalConversion: (Number(vm.subConversion) * Number(vm.count)).toFixed(2),
		conversion: Number(vm.subConversion),
		welfare: Number(vm.subWelfare)
	}, function(res) {
		openWindow('../order/order.html?orderId=' + res.order.id + '&count=' + res.order.count + '&type=mallDetail')
	}, function() {
		ajaxError();
	})
}

function addShoppingCar() {
	ajaxPost(addShoppingCarUrl, {
		productId: vm.product.id,
		productTitle: vm.product.title,
		productSubTitle: vm.productTitle + ' ' + vm.reclassify,
		filePath: vm.product.homeFilePath,
		userId: userInfo.id,
		count: vm.count,
		price: vm.subPrice,
		receivingType: vm.product.isDelivery == 'false' ? '包邮' : vm.product.deliveryMoney,
		original: vm.subPrice,
		conversion: Number(vm.subConversion),
		welfare: Number(vm.subWelfare)
	}, function(res) {
		if (res.state == '200') {
			plusToast('成功添加到购物车~');
		} else {
			plusToast(res.msg);
		}
	}, function() {
		ajaxError();
	});
}

localStorage.getItem('total') && localStorage.removeItem('total');

$('#share').click(function() {
	if (vm.shareImage != '') {
		mui("#sharePopover").popover('toggle');
	} else {
		mui.toast('好物生成中！  请稍后。')
	}
});

function getShareImg() {
	ajaxPost(baseUrl + 'product/createProductShareImg', {
		userId: userInfo.id,
		productId: getQueryString('productId')
	}, function(res) {
		console.log(res.distinct)
		if (res.distinct != null) {
			vm.shareImage = res.distinct;
		}
	}, function(res) {

	});
}

$('#saveShare').click(function() {
	if (!mui.os.plus) {
		wx.miniProgram.getEnv(function(res) {
			if (res.miniprogram) {
				wx.miniProgram.navigateTo({
					url: '../share/share?shareImage=' + vm.shareImage.replace("\\", "/") +
						'&type=downLoad&homeFilePath=' + vm.product.homeFilePath + '&title=' + vm.product.title +
						'&phone=' + userInfo.phone + '&productId=' + vm.product.id
				})
			} else {
				//h5环境
			}
		})
	} else {
		//app环境
		downLoadImg(fileUrl + vm.shareImage)
	}
});

$('#goShare').click(function() {
	if (!mui.os.plus) {
		wx.miniProgram.getEnv(function(res) {
			if (res.miniprogram) {
				wx.miniProgram.navigateTo({
					url: '../share/share?shareImage=' + vm.shareImage.replace("\\", "/") +
						'&type=share&homeFilePath=' + vm.product.homeFilePath + '&title=' + vm.product.title +
						'&phone=' + userInfo.phone + '&productId=' + vm.product.id
				})
			} else {
				//h5环境
			}
		})
	} else {
		//app环境
		mui.plusReady(function() {
			window.plusShare({
				type: 'image',
				pictures: [fileUrl + vm.shareImage],
				content: '分享好物'
			}, function(status) {
				mui.toast('分享成功');
			})
		})
	}
});
