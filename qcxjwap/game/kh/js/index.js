var hg = null;

function addClass(element, new_name) {
	if(!element || !new_name) return false;
	if(element.className) {
		var old_class_name = element.className;
		element.className = old_class_name + " " + new_name;
	} else {
		element.className = new_name;
	}
	return true;
}

function removeClass(element, class_name) {
	if(!element || !class_name) return false;
	if(!element.className) return false;
	var all_names = element.className.split(" ");
	for(var i = 0; i < all_names.length; i++) {
		if(all_names[i] === class_name) {
			all_names.splice(i, 1);
			element.className = "";
			for(var j = 0; j < all_names.length; j++) {
				element.className += " ";
				element.className += all_names[j];
			}
			return true;
		}
	}
}
var orderId = null;
$(function() {
	document.getElementById("levelSwitchBox").addEventListener("webkitAnimationEnd", function() {
		$("#levelSwitchBox").css("display", "none")
		$("#levelSwitchBoxMain").attr("src", fileUrl+lipstickGame.level2FilePath+"?v=1.0.0")
		$("#levelSwitchBox").removeClass("hidden")
	})
	$("#levelSwitchBox").addClass("hidden")
	if(!hg) {
		var gameInter = setInterval(function() {
			if(gameApiSuccess) {
				createHg(false)
				clearInterval(gameInter);
			}
		}, 1000)

	}
});

function playAudioInWechat(obj) {
	//	if(window.WeixinJSBridge) {
	//		WeixinJSBridge.invoke('getNetworkType', {}, function(e) {
	//			obj.currentTime = 0;
	//			obj.play();
	//			console.log(22, obj);
	//		}, false);
	//	} else {
	//		document.addEventListener("WeixinJSBridgeReady", function() {
	//			WeixinJSBridge.invoke('getNetworkType', {}, function(e) {
	//				obj.currentTime = 0;
	//				obj.play();
	//			});
	//			console.log(22, obj);
	//		}, false);
	//	}
	//	console.log(22, obj);
}

function createHg(GAMEMODE) {
	//初始化游戏, 两个参数分别表示"游戏所处的canvas画布元素"和"关卡设置, 可以省略(省略后将使用默认设置)"
	hg = new HardestGame(document.getElementById("gameStage"), GAMEMODE);
	//游戏成功过关
	hg.levelSuccessHandle = function() {
		if(hg.level < 4) {
			// playAudioInWechat($("#success_audio").get(0));
			document.getElementById("currentLevel").getElementsByTagName("span")[0].innerHTML = hg.level;
			var time = 4;
			var interval = setInterval(function() {
				time--;
				if(time <= 0) {
					clearInterval(interval);
					hg.gameContinue(true);
				}
			}, 1000);
			//通关
			//			alert('hg.level < 4'+hg.level);
		} else {
			var level = hg.level - 1
			//通关
			$("#app").addClass("blur")
			$("#gameSuccessBox").css("display", "block")
			$("#gameSuccessBoxBtn").on("click", function() {
				saveLipstickGameLog(level)
			});
		}
	}
	//游戏失败结束
	hg.gameOverHandle = function() {
		clearInterval(timeboxInterval);
		hg = null;
		if(hg) {
			delete hg;
		}
		$("#gameOverBox").css("display", "block");
		$("#app").addClass("blur");
		var level = this.level - 1;
		if(level != 0) {
			$('.overGameBtn').css({
				'display': 'block'
			})
			$('#gameOverBox').css({
				'height': '266px'
			})
		} else {
			$('.overGameBtn').css({
				'display': 'none'
			});
			$('#gameOverBox').css({
				'height': '175px'
			});
		}
		$("#tradeProduct").on("click", function() {
				saveLipstickGameLog(level)
		})

	}
	//初始化游戏
	hg.init();
	hg.canvas.parentNode.style.width = hg.canvas.width + "px";
	hg.canvas.parentNode.style.height = hg.canvas.height + "px";
	//游戏开始
	hg.gameStart();
	document.getElementById("currentLevel").getElementsByTagName("span")[0].innerHTML = hg.level;
	return true;
}

function saveLipstickGameLog(level) {
	ajaxPost(baseUrlCopy + 'lipstickGameLog/save', {
		productId: lipstickGame.productId,
		lipstickGameId: lipstickGame.id,
		userId: userInfo.id,
		levelIndex: level,
		subTitle: lipstickGame.subTitle
	}, function(res) {
		var order = res.order;
		openWindow('../../views/order/order.html?orderId=' + order.id + '&count=' + order.count + '&type=mallDetail');
	}, function(res) {
		mui.toast('保存游戏记录接口异常');
		console.log(res);
	});

}