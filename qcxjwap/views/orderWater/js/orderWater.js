var vm = new Vue({
	el: '#order-water',
	data: {
		product: null,
		bannerPics: [],
		contentFilePaths: []
	},
	updated: function() {
		mui('#slider').slider();
	}
});
$(function() {
	mui.previewImage();
	mui('#slider').slider();
	var productId = getQueryString('productId');
	getProductDeatail(productId);
	document.querySelector('.mui-slider').addEventListener('slide', function(event) {
		//注意slideNumber是从0开始的；
		document.getElementById("info").innerText = event.detail.slideNumber + 1;
	});
});

var productDetailUrl = baseUrl + 'product/get';
function getProductDeatail(id) {
	ajaxPost(productDetailUrl, {
		id: id
	}, function(res) {
		if(!isNullObject(res.product)) {
			vm.product = res.product;
			vm.bannerPics = res.product.headFilePath.split('|');
			vm.contentFilePaths = res.product.contentFilePath.split('|');
		} else {

		}
	}, function() {

	});
}