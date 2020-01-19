var noticegetUrl = baseUrl + 'notice/getList';
var vm = new Vue({
	el: '#my-integral',
	data: {
		list:{}
	},
	methods:{
		afficheDetails:function(id){
			openWindow('../afficheDetails/afficheDetails.html?id='+id);
		}
	}
});

$(function() {
	getNotice();
});

function getNotice() {
	ajaxPost(noticegetUrl, {
		pageNo: 1,
		pageSize: 20
	}, function(res) {
//		console.log(res);
		vm.list = res.data;
	}, function() {
		plusToast('请求出错')
	})
}
