var shoppinglistUrl = baseUrl + 'shopCar/getList';
var deleteShoppingUrl = baseUrl + 'shopCar/del';
var vm = new Vue({
	el: '#shopping-car',
	data: {
		lists: [],
		pageNo: 1,
		pageSize: 10,
		pageCount: 1,
		allBol: false,
		totalMoney: 0
	},
	updated: function() {
		mui('.mui-numbox').numbox();
	}
});
$(function() {
	//全选
	mui('.edit-bar').on('change', 'input', function() {
		var value = this.checked ? true : false;
		vm.allBol = value;
		vm.lists.forEach(function(v, i) {
			if(value) {
				vm.$set(v, 'checked', true);
				vm.totalMoney = vm.totalMoney + Number(v.count) * Number(v.price);
			} else {
				vm.$set(v, 'checked', false);
				vm.totalMoney = 0;
			}
		});
	});

	// 单选
	mui('.order-list').on('change', '.checkBox-btn input', function() {
		var value = this.checked ? true : false;
		var indexNo = Number(this.getAttribute('indexNo'));
		vm.$set(vm.lists[indexNo], 'checked', value);
		vm.totalMoney = 0;
		var isAll = true;
		vm.lists.forEach(function(v, i) {
			if(v.checked) {
				vm.totalMoney = vm.totalMoney + Number(v.count) * Number(v.price);
			} else {
				isAll = false;
			}
		});
		if(!value) {
			vm.allBol = false;
		} else if(isAll) {
			vm.allBol = true;
		}
	});

	mui('.edit-bar').on('tap', '.delete-btn', function() {
		mui.confirm('确定删除？', '提示', ['确定', '取消'], function(e) {
			if(e.index == 0) {
				var ids = [];
				var notSelectArr = []
				vm.lists.forEach(function(v, i) {
					if(v.checked) {
						ids.push(v.id);
					} else {
						notSelectArr.push(v)
					}
				});
				if(ids.length > 0) {
					ajaxPost(deleteShoppingUrl, {
						ids: ids.join(',')
					}, function(res) {
						vm.lists = notSelectArr;
						vm.totalMoney = 0;
						plusToast("删除成功");
					}, function() {
						ajaxError();
					});
				}
			}
		});
	});

	// 编辑数量
	mui('#shopping-car').on('change', '.mui-input-numbox', function() {
		var indexNo = Number(this.getAttribute('indexNo'));
		vm.lists[indexNo].count = $(".mui-input-numbox").eq(indexNo).val();
		vm.totalMoney = 0;
		vm.lists.forEach(function(v, i) {
			if(v.checked) {
				vm.totalMoney = vm.totalMoney + Number(v.count) * Number(v.price);
			} else {
				isAll = false;
			}
		});
	});

	mui('#shopping-car').on('tap', '.jiesuan-btn', function() {
		var ids = [];
		var counts = [];
		var isSame = true;
		var isPassBuy = true;
		var selectArr = vm.lists.filter(function(v) {
			return v.checked
		});
		if(selectArr.length==0){
			mui.toast('请选择购买的商品！')
			return false;
		}
		var receiveStyle = getReciveStyle(selectArr[0].receivingType);
		selectArr.forEach(function(v) {
			if(getReciveStyle(v.receivingType) != receiveStyle) {
				isSame = false;
			}
			if(v.passBuyCount == 0) {
				mui.toast('已被限制限购商品不能购买！')
				isPassBuy = false;
			}
		})
		if(!isPassBuy) {
			return false;
		}

		if(isSame) {
			vm.lists.forEach(function(v, i) {
				if(v.checked) {
					ids.push(v.id);
					counts.push(v.count)
				}
			});
			openWindow('../order/order.html?ids=' + ids.join(',') + '&type=shoppingCar&counts=' + counts.join(','))
		} else {
			plusToast('请将包邮和非包邮的商品分开下单')
		}
	});

});

function getReciveStyle(receivingType) {
	return Number(receivingType) ? '不包邮' : '包邮'
}

pullRefresh('.mui-scroll', function(self, index) {
	self.endPullDownToRefresh();
	vm.pageNo = 1;
	getData(true, function() {
		self.endPullDownToRefresh();
		self.refresh(true);
	})
}, function(self, index) {
	//	self.endPullUpToRefresh(true);
	if(vm.pageNo > vm.pageCount) {
		self.endPullUpToRefresh(true);
		return false;
	}
	getData(false, function() {
		self.endPullUpToRefresh(vm.pageNo > vm.pageCount);
	});
}, true);

function getData(init, cb) {
	ajaxPost(shoppinglistUrl, {
		pageNo: vm.pageNo,
		pageSize: vm.pageSize,
		userId: JSON.parse(localStorage.getItem('userInfo')).id,
		passBuyCountStatus: 'true'
	}, function(res) {
		if(res.data.length > 0) {
			if(init) {
				vm.lists = res.data;
			} else {
				vm.lists = vm.lists.concat(res.data);
			}
			vm.pageCount = res.pageResults.pageCount;
			vm.pageNo += 1;
			setTimeout(function() {
				$.each(vm.lists, function(i, value) {
					if(value.passBuyCount == 0) {
						mui('.shopCarCount' + value.id).numbox().setValue(value.passBuyCount);
						mui('.shopCarCount' + value.id).numbox().setOption('max', value.passBuyCount);
					} else {
						mui('.shopCarCount' + value.id).numbox().setOption('max', value.passBuyCount);

					}
				});
			}, 1000)
			cb && cb();
		} else {
			cb && cb();
		}
	}, function(xhr) {})
}

window.onload = function() {
	var top = $('.edit-bar').outerHeight(true);
	$('.mui-scroll-wrapper').css('top', top);
}

localStorage.getItem('total') && localStorage.removeItem('total');