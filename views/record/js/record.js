var getListUrl = baseUrl + 'integral/getList';
var vm = new Vue({
	el: '#my-integral',
	data: {
		list: [],
		status: '全部'
	}
})

var userInfo = JSON.parse(localStorage.getItem('userInfo'));
$(function() {
	getList();

});

function getList() {
	ajaxPost(getListUrl, {
		userId: userInfo.id,
		status: vm.status,
		pageNo: 1,
		pageSize: 200
	}, function(res) {
		//		console.log(res);
		vm.count = res.count
		if(res.data.length > 0) {
			vm.list = res.data
		} else {
			vm.list = []
		}
	}, function() {
		plusToast('请求出错')
	})
}

document.querySelector('#picker').addEventListener("tap", function() {
	var roadPick = new mui.PopPicker(); //获取弹出列表组建，假如是二联则在括号里面加入{layer:2}
	roadPick.setData([{ //设置弹出列表的信息，假如是二联，还需要一个children属性
		value: "",
		text: "全部"
	}, {
		value: "待处理",
		text: "待处理"
	}, {
		value: "已完成",
		text: "已完成"
	}, {
		value: "驳回",
		text: "驳回"
	}]);
	roadPick.show(function(item) { //弹出列表并在里面写业务代码
//		console.log(item)
		var itemCallback = roadPick.getSelectedItems();
		vm.status = itemCallback[0].text;
		getList();
	});
});