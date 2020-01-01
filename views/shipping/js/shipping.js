var userInfo = JSON.parse(localStorage.getItem('userInfo'));
var vm = new Vue({
	el: '#shipping',
	data: {
		datas: []
	}
})
$(function() {
	loadData();
	mui('#shipping').on('tap', '.bottom-btn', function() {
		//		openWindow('../addShipping/addShipping.html', null, '添加收货地址');
		openWindow('../addShipping/addShipping.html')
	});

	mui("#shipping").on("tap", ".user-btn", function() {
		var item = JSON.parse(this.getAttribute('address'));
		localStorage.setItem('addressObj', JSON.stringify({
			address: item.address,
			city: item.city,
			name: item.name,
			phone: item.phone,
			province: item.province,
			region: item.region
		}));
		goback();;
	});

	mui('#shipping').on('tap', '.edit', function() {
		//		openWindow('../addShipping/addShipping.html', {addressId: this.getAttribute('addressId')}, '编辑收货地址');
		openWindow('../addShipping/addShipping.html?id=' + this.getAttribute('addressId'))
	});
});

function loadData() {
	ajaxPost(getAddress, {
		userId: userInfo.id,
		pageNo: 1,
		pageSize: 100,
	}, function(res) {
		if(!isNullObject(res.pageResults)) {
			vm.datas = res.pageResults.results
		}
	}, function(xhr) {
		Xhrerror()
	})
}
delAddress