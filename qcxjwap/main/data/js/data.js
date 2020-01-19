var getMemberListUrl = baseUrl + 'member/getList';
var getUserListUrl = baseUrl + 'user/getList';
var vm = new Vue({
	el: '#data-center',
	data: {
		users: [],
		agents: [],
		pageNo: 1,
		pageCount: 1,
		pageSize: 10,
		memberId: '',
		pullObj: null,
		memberName: '',
		everyMonthTotal: 0,
		myUser:userInfo
	}
})

mui.showLoading("正在加载..", "div");

function refresh() {
	window.location.reload();
}


getMembers();
getEveryMonthTotal();

ajaxPost(baseUrl + 'picture/get', {
	id: 1
}, function(res) {
	if(res.picture != null) {
		$('#everyMonthTotal').css({
			'background-image': 'url(' + fileUrl + res.picture.appDataFilePath + ')'
		})
	}
}, function(res) {
	mui.toast('获取图片接口异常');
})

function getMembers() {
	ajaxPost(getMemberListUrl, {
		pageNo: 1,
		pageSize: 999,
		//		url: 'data.html'
	}, function(res) {
		vm.agents = res.data;
		vm.memberId = vm.agents[0].id;
		vm.memberName = vm.agents[0].name;
		//		var htmlArr = [];
		var agentArr = [];
		vm.agents.forEach(function(v, i) {
			if(v.pointSize > 0) {
				var html = '<div class="process-box flex ai jc" id="level-' + (i + 1) + '">' +
					'<div class="item-key">' + v.name + '</div>' +
					'<div class="mui-progressbar item-value">' +
					'<span></span>' +
					'</div>' +
					'<div class="item-remark">' + v.userSize + '/' + v.pointSize + '</div>' +
					'</div>';
				$(".data-center-main").append(html);
				mui('#level-' + (i + 1)).progressbar().setProgress((v.userSize / 200) * 100);
			}
			var agentHtml =
				'<div class="packageItem agent-item" data-id="' + v.id +
				'" data-index="' + i + '">' + v.name + ':'+v.userSize+'人</div>';
			agentArr.push(agentHtml);

		});
		agentArr.length > 1 && $("#agent-box").html(agentArr.join(''));
		$("#agent-box .agent-item").eq(0).addClass('agentAct');
		var top = $(".show-box").outerHeight(true) + $("#agent-box").outerHeight(true);
		$(".mui-scroll-wrapper").css("top", top+10);
		pullRefresh('.mui-scroll', function(self, index) {
			vm.pullObj = self;
			vm.pageNo = 1;
			getData(true, function() {
				self.endPullDownToRefresh();
				self.refresh(true);
			}, vm.memberId)
		}, function(self, index) {
			vm.pullObj = self;
			mui.showLoading("正在加载..", "div");
			if(vm.pageNo > vm.pageCount) {
				mui.hideLoading();
				return false;
			}
			getData(false, function() {
				mui.hideLoading();
				self.endPullUpToRefresh(vm.pageNo > vm.pageCount);
			}, vm.memberId);
		}, true);
	}, function() {
		ajaxError();
	})
}

mui("#agent-box").on('tap', '.agent-item', function() {
	$("#agent-box .agent-item").eq(Number(this.getAttribute('data-index'))).addClass('agentAct').siblings('.agent-item').removeClass(
		'agentAct');
	vm.memberId = this.getAttribute('data-id');
	mui.showLoading("正在加载..", "div");
	mui(".mui-scroll-wrapper").scroll().scrollTo(0, 0, 0);
	var templateArr = vm.agents.filter(function(v) {
		return v.id == vm.memberId
	});
	vm.memberName = templateArr[0].name;
	vm.pageNo = 1;
	getData(true, function() {
//		vm.pullObj.endPullDownToRefresh();
//		vm.pullObj.refresh(true);
	}, vm.memberId)
});

function getData(init, cb, memberId) {
	if(vm.pageCount >= vm.pageNo) {
		ajaxPost(getUserListUrl, {
			pageNo: vm.pageNo,
			pageSize: vm.pageSize,
			isMember: 'true',
			memberId: memberId,
			memberJoinCount:'true'
		}, function(res) {
			mui.hideLoading();
			if(init) {
				vm.users = res.data;
			} else {
				vm.users = vm.users.concat(res.data);
			}
			vm.pageCount = res.pageResults.pageCount;
			vm.pageNo += 1;
			cb && cb();
		}, function(xhr) {})
	}

}

function getEveryMonthTotal() {
	ajaxPost(baseUrl + 'order/everyMonth', {},
		function(res) {
			vm.everyMonthTotal = res.total
		},
		function(res) {
			mui.toast('获取月总受额接口异常');
		});
}