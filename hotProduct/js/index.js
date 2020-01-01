var vm = new Vue({
	el: '#hotPtoduct',
	data: {
		hotProduct: null,
		hotImage: [],
		hotVideo: [],
		videoPoster: [],
		suffix: [],
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
		shareImage: '',
		passBuyCount: null,
		reclassifyCountArrays: [],
		reclassifyTitleArrays: [],
		reclassifyContentArrays: [],
		reclassify: '',
		reclassifyIndexStrat: 0,
		reclassifyIndexEnd: 0
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
		},
		joinVip: function() {
			console.log(vm.hotProduct.vipFilePath);
			if (vm.hotProduct.vipFilePath != null) {
				localStorage.setItem('hotProduct', JSON.stringify(vm.hotProduct))
				openWindow('vipDetails.html')
			}
		},
		share: function() {
			if (vm.shareImage != '') {
				mui("#sharePopover").popover('toggle');
			} else {
				mui.toast('好物生成中！  请稍后。')
			}

		}
	},
	updated: function() {
		mui('#slider').slider({
			interval: 1500
		});
	}
});
var userInfo = JSON.parse(localStorage.getItem('userInfo'));



$(function() {
	mui.showLoading("正在加载..", "div");
	if (userInfo.hotProductIds!=null&&userInfo.hotProductIds.indexOf(',' + getQueryString('id') + ',') > -1) {
		$('.icon-update').css({
			'display': 'none'
		});
	}
	mui('#popover .mui-scroll-wrapper').scroll();

	setTimeout(function() {
		if (vm.hotProduct == null || userInfo == null) {
			location.reload();
		}
	}, 3000)

	getHotProduct();
	// 弹窗选择规格
	$(".classes").on('tap', '.sub-item', function() {
		var index = $(this).index();
		$(this).addClass('active').siblings('li').removeClass('active');
		vm.subPrice = vm.subMoney[index];
		vm.subInventorytext = vm.subInventory[index];
		vm.subPrice = vm.subMoney[index];
		vm.productTitle = vm.subTitle[index];
		vm.subConversion = vm.subConversionArrays[index];
		//		vm.curDiscount = vm.discounts[index]
		var reclassifyIndexStrat = 0;
		for (var i = 0; i < index; i++) {
			reclassifyIndexStrat += vm.reclassifyCountArrays[i];
		}
		vm.reclassifyIndexStrat = reclassifyIndexStrat;
		vm.reclassifyIndexEnd = reclassifyIndexStrat + vm.reclassifyCountArrays[index];
	});

	// 编辑数量
	mui('#hotPtoduct').on('change', '.mui-input-numbox', function() {
		vm.count = document.querySelector(".mui-input-numbox").value
	});

	// 立即购买（弹窗）
	mui('#hotPtoduct').on('tap', '.buy-btn', function() {
		saveOrder();
		mui("#popover").popover('toggle', document.getElementById("mask"));
	});

	// 立即购买（底部按钮）
	mui('#hotPtoduct').on('tap', '.buy-button', function() {
		mui("#popover").popover('toggle', document.getElementById("mask"));
	});
	getShareImg();
})

function getShareImg() {
	if (userInfo.phone != null && userInfo.phone != '') {
		ajaxPost(baseUrl + 'hotProduct/createProductShareImg', {
			userId: userInfo.id,
			id: getQueryString('id')
		}, function(res) {
			console.log(res.distinct)
			if (res.distinct != null) {
				vm.shareImage = res.distinct;
			}
		}, function(res) {

		});
	}
}



function getHotProduct() {
	ajaxPost(baseUrl + 'hotProduct/get', {
		id: getQueryString('id'),
		phone: userInfo.phone != null ? userInfo.phone : '',
		userId:userInfo.id
	}, function(res) {
		mui.hideLoading()
		if (res.hotProduct != null) {
			vm.hotProduct = res.hotProduct;
			localStorage.setItem('hotProduct', JSON.stringify(vm.hotProduct))
			console.log(res.hotProduct);
			$('title').text(res.hotProduct.title);
			var filePath = res.hotProduct.filePath.split('|');
			var videoPosterFilePath = res.hotProduct.videoPosterFilePath.split('|');
			var index = 0;
			$.each(filePath, function(i, value) {
				var suffix = value.split('.')[1];
				vm.suffix.push(suffix);
				vm.hotImage.push(value);
				if (suffix == 'mp4' || suffix == 'mov' || suffix == 'wmv' || suffix == '3gp') {
					vm.videoPoster.push(videoPosterFilePath[index]);
					index++;
				} else {
					vm.videoPoster.push('');
				}
			});

			console.log(res.hotProduct.product);
			//编辑商品信息
			if (!isNullObject(res.hotProduct.product)) {
				vm.product = res.hotProduct.product;
				vm.bannerPic = vm.product.headFilePath.split('|');
				vm.contentPic = vm.product.contentFilePath.split('|');
				vm.subTitle = vm.product.subTitle.split(',').filter(function(v) {
					return v != ''
				});
				vm.subConversionArrays = vm.product.subConversion.split(',')
				vm.subMoney = vm.product.subMoney.split(',');
				vm.subInventory = vm.product.subInventory.split(',');
				vm.subPrice = vm.subMoney[0];
				vm.subInventorytext = vm.subInventory[0];
				vm.productTitle = vm.subTitle[0];
				vm.subConversion = vm.subConversionArrays[0]
				if (typeof(res.passBuyCount) == 'number') {
					vm.passBuyCount = res.passBuyCount;
				}
				vm.reclassifyCountArrays = vm.product.reclassifyCount.split(',').map(Number);
				vm.reclassifyTitleArrays = vm.product.reclassifyTitle.split(',');
				$.each(vm.product.reclassifyContent.split(','), function(i, value) {
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
				$(".intro-content").text(vm.product.content);
				$.each($("textarea"), function(i, n) {
					autoTextarea($(n)[0], 10);
				});
			}

		}
	}, function(res) {
		mui.toast('接口异常')
	});

}


function saveOrder() {
	mui.showLoading("正在加载..", "div");
	if (typeof(vm.passBuyCount) == 'number' && vm.count > vm.passBuyCount) {
		mui.hideLoading();
		mui.toast('当前商品为限购商品，请稍后重试吧！');
		return false;
	}
	ajaxPost(baseUrl + 'order/save', {
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
		hotProductId: getQueryString('id'),
		buyChannel: 'hotProduct'
	}, function(res) {
		mui.hideLoading();
		openWindow('../views/order/order.html?orderId=' + res.order.id + '&count=' + res.order.count +
			'&type=mallDetail&channel=hotProduct')
	}, function() {
		ajaxError();
	})
}
