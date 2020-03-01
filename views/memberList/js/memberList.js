var vm = new Vue({
	el: '#memberList',
	data: {
		memberList: [],
		fileUrl: fileUrl,
	},
	methods:{
		goDetails(id){
			openWindow("../memberNoeDetails/memberNoeDetails.html?id="+id);
		}
	}
})
var userInfo = JSON.parse(localStorage.getItem('userInfo'));

getMemberList();

function getMemberList() {
	ajaxPost(baseUrl + 'member/getList', {
		pageNo: 1,
		pageSize:99,
		isShow: 'true',
		memberId: userInfo.isMember == 'true' ? userInfo.memberId : null,
		sort:'joinMoneyAsc',
	}, function(res) {
		console.log(res)
		if(res.data.length > 0) {
			vm.memberList = res.data;
		}
	}, function(res) {
		mui.toast('获取会员列表接口异常');
	})
}