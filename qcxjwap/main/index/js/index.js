var pictureManageUrl = baseUrl + 'picture/get';
var getNoticeUrl = baseUrl + 'notice/getList';
var cloumnUrl = baseUrl + 'product/homeProduct';

localStorage.getItem('total') && localStorage.removeItem('total');
localStorage.getItem('addressObj') && localStorage.removeItem('addressObj');
localStorage.getItem('swichBol') && localStorage.removeItem('swichBol');

var vm = new Vue({
	el: '#vueApp',
	data: {
		bannerPics: [],
		bannerLinks: [],
		typePics: [],
		typeTexts: [],
		typeUrls: [],
		productList: [],
		notice: [],
		adUrl: [],
		adFilePath: [],
		mapList: [],
		liveFilePath: '',
		courseFilePath: '',
		moduleTitleFilePath:[]
	},
	updated: function() {
		mui('#slider').slider({
			// interval: 3000
		});
		mui("#picSlider").slider({
			// interval: 1500
		});
	},
	methods: {
		noteDetails: function(id) {
			openWindow('../../views/noticeDetail/noticeDetail.html?noticeId=' + id);
		},
		typeDetails: function(url) {
			console.log(url)
			if (url.indexOf('http') > -1) {
				url = document.location.protocol + "//" + url.split('://')[1]
			}
			// openWindow(url);
		}
	}

})

var swiper = new Swiper('.swiper-container', {
	slidesPerView: 'auto',
	centeredSlides: true,
	spaceBetween: 30,
	pagination: {
		el: '.swiper-pagination',
		clickable: true,
	},
});
$(function() {
	if (getQueryString('leadNumber') != null && getQueryString('productId') != null) {
		ajaxPost(baseUrl + 'user/save', {
			id: user.id,
			leadNumber: getQueryString('leadNumber')
		}, function(res) {
			openWindow('../../views/mallDetail/mallDetail.html?productId=' + getQueryString('productId'));
		}, function(res) {
			mui.toast('关联领导人接口异常');
		})
	}
	mui('#slider').slider({
		interval: 3000
	});
	mui("#picSlider").slider({
		interval: 1500
	});
	ajaxPost(pictureManageUrl, {
		id: 1
	}, function(res) {
		console.log(res)
		getHomeProduct(res.picture.moduleName);
		vm.moduleTitleFilePath=res.picture.moduleTitleFilePath!=null?res.picture.moduleTitleFilePath.split('|'):[];
		vm.bannerPics = res.picture.swiperFilePath.split('|');
		vm.bannerLinks = res.picture.swiperUrl.split(',');
		vm.typePics = res.picture.typeFilePath.split('|');
		console.log(vm.typePics)
		vm.typeTexts = res.picture.typeName.split(',');
		vm.typeUrls = res.picture.typeUrl.split(',');
		vm.adFilePath = res.picture.advertisingFilePath.split('|');
		vm.adUrl = res.picture.advertisingUrl.split(',');
		vm.liveFilePath = res.picture.liveFilePath;
		vm.courseFilePath = res.picture.courseFilePath;
		if (vm.adFilePath.length > 4) {
			var indexArr = [];
			var tempUrl = [];
			var tempFilePath = []
			while (indexArr.length < 4) {
				var curIndex = fnRand(0, vm.adFilePath.length);
				var bol = true
				indexArr.forEach(function(v) {
					if (v == curIndex) {
						bol = false
					}
				})
				if (bol) {
					indexArr.push(curIndex)
				}
			}
			indexArr.forEach(function(v) {
				tempUrl.push(vm.adUrl[v]);
				tempFilePath.push(vm.adFilePath[v]);
			});
			vm.adUrl = tempUrl;
			vm.adFilePath = tempFilePath;
		}
		localStorage.setItem('cacheData', JSON.stringify(res.picture));
	}, function() {
		plusToast('请求出错')
	});
	mui("#vueApp").on('tap', '.product-item', function() {
		if (checkLogin()) {
			var pageHref = '../../views/mallDetail/mallDetail.html?productId=' + $(this).attr('productId');
			openWindow(pageHref);
		} else {
			openWindow('../../views/login/login.html')
		}
	});
	getNotice();

	// if (!mui.os.plus) {
	// 	ajaxPost(baseUrl + 'SdkConfig', {
	// 			url: location.href
	// 		}, function(data) {
	// 			Config(data.appId, data.timestamp, data.nonceStr, data.signature, data.jsApiList);
	// 		},
	// 		function(res) {
	// 			mui.toast('获取微信JJSDK配置信息异常');
	// 		});
	// }
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
	var link = 'http://www.wujielp.com/qcxjwap/main/index/index.html';
	if (userInfo != null && userInfo.phone != null && userInfo != '') {
		link = 'http://www.wujielp.com/qcxjwap/main/index/index.html?leadNumber=' + userInfo.phone;
	}

	wx.ready(function() { //需在用户可能点击分享按钮前就先调用
		wx.updateAppMessageShareData({
			title: '青春小匠生活平台', // 分享标题
			desc: '健康乃当下势！《青春小匠》平台立足于大健康生活品类的定位，本着赋能创业者，赢享消费者的理念，持无界无阻，利众共赢的开怀格局，以全渠道，新零售的经营模式，无界展示，健康爆品，帮服更多的追梦人，实现梦想，无压创业！', // 分享描述
			link: link, // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
			imgUrl: '../../association/imgs/logo.png', // 分享图标
			success: function() {
				// 设置成功
				mui.toast('设置成功');
			}
		});

		wx.updateTimelineShareData({
			title: '青春小匠生活平台', // 分享标题
			link: link, // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
			imgUrl: '../../association/imgs/logo.png', // 分享图标
			success: function() {
				// 设置成功
				mui.toast('设置成功');
			}
		})

	});
}

function getNotice() {
	ajaxPost(getNoticeUrl, {
		pageNo: 1,
		pageSize: 5
	}, function(res) {
		vm.notice = res.data;
	}, function() {
		ajaxError();
	});
}

function getHomeProduct(moduleName) {
	ajaxPost(cloumnUrl, {
		moduleName: moduleName,
		isShow:'true'
	}, function(res) {
		console.log(res)
		vm.mapList = res.mapList;
	}, function() {
		ajaxError()
	})
}

mui('#slider').on('tap', 'a', function() {
	var url = this.getAttribute('url');
	if (url != null && url != '') {
		if (url.indexOf('http') > -1) {
			url = document.location.protocol + "//" + url.split('://')[1]
		}
		openWindow(url)
	}
});

mui('#picSlider').on('tap', 'a', function() {
	window.localStorage.setItem('pageUrl', this.getAttribute('url'));
	//	window.localStorage.setItem('title', '广告');
	if (this.getAttribute('url').indexOf("productId") <= -1) {
		window.localStorage.setItem('title', '广告');
	} else {
		window.localStorage.removeItem('title')
	}
	openWindow('../../views/iframe/iframe.html')
});
