var getAwardUrl = baseUrl + 'game/getList';
var getRecordUrl = baseUrl + 'winningLog/getList';
var saveRecordUrl = baseUrl + 'winningLog/save';
var getOnceAwardUrl = baseUrl + 'game/luckyDraw';
var isConversionPay = false;
var userInfo = JSON.parse(localStorage.getItem('userInfo'));
var wheel = document.getElementById('wheel'); // 转盘
var arrow = document.getElementById('arrow'); // 转盘按钮
var luckDrawCountDom = document.querySelector('.luckDrawCount span'); // 抽奖次数dom
// 转盘游戏属性
var gameState = false; //  游戏状态
var luckDrawCount = userInfo.gameCount == null ? 0 : userInfo.gameCount; //  抽奖次数
if(luckDrawCount == 0) {
	document.getElementsByClassName('tips')[0].setAttribute('style', 'display: block;');
	document.getElementsByClassName('tips')[1].setAttribute('style', 'display: block;')
}

var rotateZPositionCount = 0; //  当前转盘的rotateZ 值
var preUseRotateZ = 0; //  上一次已抽奖中奖奖品的RotateZ
var rotateZ = 360; //  一圈360deg
var rotateZCount = 10; //  旋转圈数的倍数
var runTime = 6; //  游戏过度时间
//页面抽奖次数dom
luckDrawCountDom.innerHTML = luckDrawCount


ajaxPost(baseUrl + 'user/get', {
	id: userInfo.id
}, function(data) {
	if(data.user != null) {
		console.log(data.user);
		userInfo = data.user;
		luckDrawCount = userInfo.gameCount == null ? 0 : userInfo.gameCount; //  抽奖次数
		if(luckDrawCount == 0) {
			document.getElementsByClassName('tips')[0].setAttribute('style', 'display: block;');
			document.getElementsByClassName('tips')[1].setAttribute('style', 'display: block;')
		}
		luckDrawCountDom.innerHTML = luckDrawCount
	}
}, function(data) {
	mui.toast(JSON.stringify(data))
})

// 奖品指针位置
// 20   一等奖，
// 158  二等奖，
// 200  二等奖，
// 112  三等奖， 
// 68   四等奖，
// 计算归着，每次抽奖最终rotateZ值 + 相应的奖品值位置 = (rotateZCount + rotateZPosition[0]) 等于一等奖
var rotateZPosition = [20, 68, 110, 158, 200, 248, 290, 335];

var prize = [ //  奖品设置 传入一个奖项，0，1，2，3，4， 分别是12345等奖

];

//var one = 0,
//	two = 0,
//	three = 0; // one 5% two 30% three 65%
//for(var i = 0; i < 10; i++) {
//	//	if(Math.ceil(Math.random() * 10) > 3) {   //占比=7
//	//		  
//	//		console.log('7');
//	//	} else {   //占比=3
//	//		  
//	//		console.log(3);
//	//	}
//	var r = Number((Math.random() * 10).toFixed(2));
//	if(r < 0.5) {
//		one++;
//	} else if(r < 3.5) {
//		two++
//	} else if(r < 10) {
//		three++
//	}
//}
ajaxPost(getAwardUrl, {
	pageNo: 1,
	pageSize: 10,
	status: '开启'
}, function(res) {
	prize = res.data;
	prize.forEach(function(v) {
		if(v.awardType == '积分') {
			v.des = v.integral + v.awardType
		} else if(v.awardType == '抵扣券') {
			v.des = v.conversion + v.awardType
		} else if(v.awardType == '兑换商品') {
			v.des = v.productTitle
		} else if(v.awardType == '多谢参与') {
			v.des = v.awardType
		}
	});
	$(".level1 .level").text(res.data[0].title);
	$(".level2 .level").text(res.data[1].title);
	$(".level3 .level").text(res.data[2].title);
	$(".level4 .level").text(res.data[3].title);
	$(".level5 .level").text(res.data[4].title);
	$(".level6 .level").text(res.data[5].title);
	$(".level7 .level").text(res.data[6].title);
	$(".level8 .level").text(res.data[7].title);

	$(".level1 .award").text(res.data[0].des);
	$(".level2 .award").text(res.data[1].des);
	$(".level3 .award").text(res.data[2].des);
	$(".level4 .award").text(res.data[3].des);
	$(".level5 .award").text(res.data[4].des);
	$(".level6 .award").text(res.data[5].des);
	$(".level7 .award").text(res.data[6].des);
	$(".level8 .award").text(res.data[7].des);

	// 开始游戏
	arrow.addEventListener('click', function() {
		// 模拟抽奖
		//		var rotateZPositionIndex = Math.round(Math.random() * 4);
		// 判断游戏是否进行中
		if(gameState) return;
		// 判断是否还有抽奖资格
		if(luckDrawCount <= 0) {
			// plusToast('Sorry 您没有抽奖机会了');
			if(userInfo.conversion >= 10) {
				mui.confirm('Sorry 您没有抽奖机会了,是否使用抵扣券？', '温馨提示', ['否', '是'], function(e) {
					if(e.index == 1) {
						userInfo.conversion = userInfo.conversion - 10
						isConversionPay = true;
						goPlay(isConversionPay);
					}
				})
			} else {
				mui.alert('抱歉你的抵扣券不扣,多做做任务吧!', '温馨提示');
			}
		} else {
			goPlay(isConversionPay);
		}

	}, false)
}, function() {
	ajaxError()
});

function goPlay(isConversionPay) {
	gameState = true; // 设置游戏当前状态
	// run game
	ajaxPost(getOnceAwardUrl, {
		userId: userInfo.id,
		isConversionPay: isConversionPay
	}, function(res) {
		var rotateZPositionIndex = null;
		prize.forEach(function(v, i) {
			if(v.id == res.game.id) {
				rotateZPositionIndex = i;
			}
		})
		gameAction(rotateZPositionIndex);
	}, function() {
		ajaxError();
	})
}

ajaxPost(getRecordUrl, {
	pageNo: 1,
	pageSize: 100
}, function(res) {
	var htmlArr = [];
	var awardList = res.data.filter(function(v) {
		return v.game.title != "多谢参与"
	})
	awardList.length > 0 && awardList.forEach(function(v) {
		var ele = '<div>恭喜 ' + v.userName.slice(0, 1) + '** 获得 ' + v.game.title + ' </div>'
		htmlArr.push(ele)
	});
	$('.record-list').html(htmlArr.join(' '));
	var index = 0;
	setInterval(function() {
		if(index < awardList.length) {

		} else {
			index = 0
		}
		$(".record-list").css({
			'top': -.7 * index + "rem"
		});
		index++;
	}, 3000);
}, function() {
	ajaxError();
})

// 运行游戏
function gameAction(rotateZPositionIndex) {
	/// 转盘位置计算规则 一圈360deg 乘以 10圈，加上 奖品 rotateZ值，再减去上一次中奖rotateZ值
	var toRotateZCount = (rotateZPositionCount - preUseRotateZ + rotateZPosition[rotateZPositionIndex]) + rotateZ *
		rotateZCount; // 达到圈数位置
	wheel.style.transition = 'transform ' + runTime + 's ease-in-out 0s'; // 过度时间
	wheel.style.transform = 'rotateZ(' + toRotateZCount + 'deg)'; // 旋转
	preUseRotateZ = rotateZPosition[rotateZPositionIndex]; // 上传抽奖的中奖rotateZ
	rotateZPositionCount = toRotateZCount; // 保存当前转盘值
	if(!isConversionPay) {
		luckDrawCount = luckDrawCount - 1; // 游戏次数减一
	}

	// 页面更新抽奖次数
	luckDrawCountDom.innerHTML = luckDrawCount;
	userInfo.gameCount = luckDrawCount;
	localStorage.setItem('userInfo', JSON.stringify(userInfo));
	//  弹出中奖信息
	setTimeout(() => {
		gameState = false; // 设置游戏当前状态
		//		alert(prize[rotateZPositionIndex].title + '\r\n' + prize[rotateZPositionIndex].prize);
		if(prize[rotateZPositionIndex].title == '多谢参与') {
			plusToast(prize[rotateZPositionIndex].title)
		} else {
			mui.alert('恭喜获得：' + prize[rotateZPositionIndex].title + '\r\n' + prize[rotateZPositionIndex].des, '恭喜中奖啦!');
		}

		ajaxPost(saveRecordUrl, {
			userId: userInfo.id,
			userName: userInfo.userName,
			gameId: prize[rotateZPositionIndex].id,
			isConversionPay: isConversionPay
		}, function(res) {})
	}, runTime * 1000);

}

function winLog() {
	openWindow('../gameWinLog/gameWinLog.html')
}