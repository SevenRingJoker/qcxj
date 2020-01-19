var vm = new Vue({
	el: "#resourceType",
	data: {
		resourceTypeList: [],
		headFileList: [],
		headUrlList: [],
	},
	updated: function() {
		mui('#slider').slider({
			interval: 1500
		});
	},
	methods: {
		headUrlDetails: function(url) {
			if(url.indexOf('http') > -1) {
				url = document.location.protocol + "//" + url.split('://')[1]
			}
			openWindow(url)
		},
		resourceTypeDetails: function(type, subType) {
			localStorage.setItem('resourceType',type);
			localStorage.setItem('resourceSubType',subType);
			openWindow('../resourceList/resourceList.html');
		}
	}
})

$(function() {
	mui.showLoading("正在加载..", "div");
	ajaxPost(baseUrl + 'picture/get', {
		id: 1
	}, function(res) {
		vm.headFileList = res.picture.resourceFilePath.split('|');
		vm.headUrlList = res.picture.resourceUrl.split(',')
		mui.hideLoading();
		mui('#slider').slider({});
	}, function(res) {
		mui.toast('获取头部轮播图异常')
	})

	ajaxPost(baseUrl + 'resourceType/getList', {
		pageNo: 1,
		pageSize: 999
	}, function(res) {
		console.log(res.data);
		vm.resourceTypeList = res.data;
	}, function(res) {
		console.log(res);
	})

});