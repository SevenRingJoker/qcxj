var vm = new Vue({
	el: '#addShipping',
	data: {
		province: '省',
		city: '市',
		area: '区',
		userName: '',
		phone: '',
		address: '',
		switchBol: true,
		titleText: '添加收货地址'
	}
});
$(function() {
	//	var ws = plus.webview.currentWebview();
	var userInfo = JSON.parse(localStorage.getItem('userInfo'));
	if(getQueryString('id')) {
		vm.titleText = '编辑收货地址';
		ajaxPost(getCurAddress, {
			id: getQueryString('id')
		}, function(res) {
			if(!isNullObject(res.address)) {
				vm.province = res.address.province;
				vm.ciyt = res.address.city;
				vm.area = res.address.region;
				vm.userName = res.address.name;
				vm.phone = res.address.phone;
				vm.address = res.address.address;
				vm.switchBol = res.address.active == 'true' ? true : false;
				if(vm.switchBol) {
					document.getElementById("mySwitch").classList.add("mui-active");
				} else {
					document.getElementById("mySwitch").classList.remove("mui-active");
				}
			}
		}, function() {
			ajaxError()
		})
	}
	if(vm.switchBol) {
		document.getElementById("mySwitch").classList.add("mui-active");
	}

	document.getElementById("mySwitch").addEventListener("toggle", function(event) {
		if(event.detail.isActive) {
			vm.switchBol = true;
		} else {
			vm.switchBol = false;
		}
	});

	mui('#addShipping').on('tap', '.save-btn', function() {
		if(!vm.city || !vm.userName || !vm.phone || !vm.address) {
			plusToast('请完善收货地址！');
			return false;
		}
		ajaxPost(saveAddress, {
			userId: userInfo.id,
			address: vm.address,
			name: vm.userName,
			phone: vm.phone,
			province: vm.province,
			city: vm.city,
			region: vm.area,
			active: vm.switchBol,
			id: getQueryString('id') ? getQueryString('id') : void 0
		}, function(res) {
			goback();
		}, function() {
			ajaxError()
		});
	});
})

	mui("#addShipping").on('tap', '.del-btn', function() {
		var id = getQueryString('id');
		mui.confirm('确定要删除该记录？', '温馨提示', ['取消', '确定'], function(e) {
			if(e.index == 1) {
				ajaxPost( baseUrl + 'address/del', {
					id: id
				}, function(res) {
					goback();
					plusToast('删除成功');
				}, function() {
					Xhrerror()
				})
			}
		});
	});


poppicker('#city', cityData3, 3, function(items) {
	if(items[0].text != items[1].text) {
		vm.province = items[0].text;
	} else {
		vm.province = '';
	}
	vm.city = items[1].text;
	vm.area = items[2].text;
});

