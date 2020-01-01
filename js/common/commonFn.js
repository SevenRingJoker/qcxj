var userInfo = JSON.parse(localStorage.getItem('userInfo'));
console.log(userInfo)
var isH5 = true;
var push = null;
var os = null;
var wsUrl = "wss://122.51.222.253/qcxj/webSocketServer"
if(userInfo != null) {
	wsUrl += '?userId=' + userInfo.id;
}
var thisUrl = window.location.search != '' ? window.location.pathname + window.location.search : window.location.pathname;
thisUrl = encodeURI(thisUrl.replace(/&/g, '-$-'));
console.log(JSON.stringify(document.location))
console.log(userInfo)

// var baseUrl = document.location.protocol + '//www.wujielp.com/qcxj/';
// var baseUrl ='http://122.51.222.253/api/';
// var fileUrl ='http://122.51.222.253';
var baseUrl ='http://121.41.45.106:8081/qcxj/';
var fileUrl ='http://121.41.45.106:8081';
// var fileUrl = document.location.protocol + '//www.wujielp.com';
// // 
// var baseUrl = document.location.protocol + '//192.168.1.7:8080/qcxj/';
// var fileUrl = document.location.protocol + '//192.168.1.7:8080';

var baseUrlCopy = baseUrl;
mui.init();
// webSocket 建立连接
var loginUrl = baseUrl + 'user/getList';
if(mui.os.plus) {
	isH5 = false;
	var userInfo = localStorage.getItem('userInfo');
	mui.plusReady(function() {
		push = plus.push;
		os = plus.os
		if(userInfo != null) {
			console.log(JSON.stringify(userInfo));
			if(typeof(userInfo) == 'string') {
				userInfo = JSON.parse(userInfo);
			}
			if(userInfo != null && userInfo.appOpenId != null && userInfo.appOpenId != '') {
				getUserById(userInfo.id)
			} else {
				//app登陆
				authLogin();
			}
		} else {
			//app登陆
			authLogin();
		}
		plus.nativeUI.closeWaiting();
		mui.currentWebview.show();
	});
	// plus.nativeUI.closeWaiting();
	//显示当前页面
	// mui.currentWebview.show();
} else {
	// if(getQueryString('wxCallBackId') != null) {
	// 	getUserById(getQueryString('wxCallBackId'));
	// } else {
	// 	var userInfo = localStorage.getItem('userInfo');
	// 	if(userInfo != null) {
	// 		userInfo = JSON.parse(userInfo);
	// 		if(userInfo.openid != null && userInfo.openid != '') {
	// 			getUserById(userInfo.id)
	// 		} else {
	// 			location.href = baseUrl + '/WxLogin?leadNumber=' + getQueryString("leadNumber") + '&scheme=' + document.location.protocol + '&url=' + thisUrl
	// 		}
	// 	} else {
	// 		location.href = baseUrl + '/WxLogin?leadNumber=' + getQueryString("leadNumber") + '&scheme=' + document.location.protocol + '&url=' + thisUrl
	// 	}
	// }
}

function authLogin() {
	plus.oauth.getServices(function(services) {
		// console.log(JSON.stringify(services))
		var auths = services;
		var s = null;
		$.each(auths, function(i, value) {
			console.log(JSON.stringify(value));
			if(value.id == 'weixin') {
				s = value
			}
		});
		console.log(JSON.stringify(s))
		// console.log(baseUrl)
		s.login(function(e) {
			s.getUserInfo(function(e) {
				var appUser = s.userInfo;
				console.log(JSON.stringify(appUser));
				ajaxPost(baseUrl + 'app/appUserInfo', {
					userName: appUser.nickname,
					name: appUser.nickname,
					appOpenId: appUser.openid,
					sex: appUser.sex,
					city: appUser.city,
					Province: appUser.province,
					imgPath: appUser.headimgurl,
					unionid: appUser.unionid,
					leadNumber: getQueryString("leadNumber")
				}, function(res) {
					if(res.state == '200') {
						if(res.user != null) {
							getUserById(res.user.id)
							localStorage.setItem('userInfo', JSON.stringify(res.user));
							mui.toast('登陆成功');
						} else {
							mui.toast('保存用户信息失败');
						}
					}
				}, function(res) {

				})
			}, function(e) {
				mui.toast("获取用户信息失败：" + e.message + " - " + e.code);
			});
		}, function(e) {
			console.log("????")
			console.log(JSON.stringify(e))
			
			console.log(JSON.stringify(s))
			mui.toast("登录认证失败！");
		});
	}, function(e) {
		mui.toast("获取分享服务列表失败：" + e.message + " - " + e.code);
	});
}

function getUserById(id) {
	ajaxPost(baseUrl + 'user/get', {
		id: id
	}, function(data) {
		if(data.user != null) {
			localStorage.setItem('userInfo', JSON.stringify(data.user));
			localStorage.setItem('login', true);
			phonePopup();

		} else {
			localStorage.removeItem('userInfo');
			location.reload();
		}

	}, function(data) {
		mui.toast(JSON.stringify(data))
	})
}

//判断用户是否保存电话号码
function phonePopup() {
	// console.log('phonePopup')
	var user = JSON.parse(localStorage.getItem('userInfo'));
	if(user != null && (user.phone == null || user.phone == '') && localStorage.getItem('phonePopup') != 'true') {
		//禁止页面滑动
		document.body.style.overflow = 'hidden';
		document.addEventListener('touchmove', handler, false); //启动
		var item = '<div id="phonePopup" class="phonePopup">' +
			'<div>' +
			'<span id="closePhonePopup" class="iconfont icon-guanbi closePhonePopup"></span>' +
			'<h2>完善信息</h2>' +
			'<div>' +
			'<p>电话号码</p>' +
			'<input id="phonePopup-Phone" type="number" placeholder="请输入" />' +
			'</div>' +
			'<div>' +
			'<p>验证码</p>' +
			'<input id="phonePopup-CodeNumber" type="number" placeholder="请输入" />' +
			'<button type="button" id="phonePopup-GetAuth" class="mui-btn mui-btn-success">获取</button>' +
			'</div>' +
			'<button id="phonePopup-Save" type="button" style="margin-top: 20px;" class="mui-btn mui-btn-danger">保存</button>' +
			'</div>' +
			'</div>';
		$('body').append(item);
		localStorage.setItem('phonePopup', 'true');
		var code = uuid(5);
		//保存信息
		$('#phonePopup-Save').click(function() {
			if($('#phonePopup-Phone').val() != '' && $('#phonePopup-Phone').val().length > 10) {
				if(code == $('#phonePopup-CodeNumber').val()) {
					ajaxPost(baseUrl + 'user/save', {
						id: user.id,
						phone: $('#phonePopup-Phone').val(),
					}, function(res) {
						localStorage.setItem("userInfo", JSON.stringify(res.user));
						location.reload();
					}, function(res) {
						alert('保存用户接口失败')
					});
				} else {
					alert('验证码不正确')
				}
			} else {
				alert('用户手机号码不能为空')
			}
		});
		//获取验证码
		$('#phonePopup-GetAuth').click(function() {
			if($('#phonePopup-Phone').val() != '' && $('#phonePopup-Phone').val().length > 10) {
				$(this).attr('disabled', 'disabled');
				$(this).text('已发送')
				ajaxPost('http://v.juhe.cn/sms/send', {
					mobile: $('#phonePopup-Phone').val(),
					tpl_id: 118724,
					tpl_value: '#code#=' + code,
					key: '90c214ac276a7e4f3d5e9061e5654dfc',
					dtype: 'json'
				}, function(res) {
					console.log(res)
				}, function(res) {
					console.log(res)
				})
			} else {
				alert('用户手机号码不能为空')
			}
		});

		$('#closePhonePopup').click(function() {
			//启动页面滑动
			document.body.style.overflow = ''; //出现滚动条
			document.removeEventListener('touchmove', handler, false); //解除
			$('#phonePopup').remove();
		})

	}
}

//移动端禁止滑动
function handler() {
	event.preventDefault();
}

function plusWaitting(text) {
	return plus.nativeUI.showWaiting(text, {
		width: '100px',
		height: '100px',
		round: '10px',
		style: 'black',
		background: 'rgba(0,0,0,.4)',
		color: '#fff',
		padlock: true
	});
}

function waittingClose() {
	plus.nativeUI.closeWaiting();
}

function openWindow(url) {
	if(mui.os.plus) {
		mui.openWindow({
			url: url,
			id: url,
			styles: {
				top: 0, //新页面顶部位置
				bottom: 0, //新页面底部位置
			},
			waiting: {
				autoShow: true, //自动显示等待框，默认为true
				title: '正在加载...' //等待对话框上显示的提示内容
			}
		})
	} else {
		location.href = url;
	}
};

function quitTips() {
	var backButtonPress = 0;
	mui.back = function(event) {
		backButtonPress++;
		if(backButtonPress > 1) {
			plus.runtime.quit();
		} else {
			plus.nativeUI.toast('再按一次退出应用');
		}
		setTimeout(function() {
			backButtonPress = 0;
		}, 1000);
		return false;
	};
}

function goback() {
	if(!isH5) {
		var all = plus.webview.all();
		var current = plus.webview.currentWebview().id;
		for(var i = 0, len = all.length; i < len; i++) {
			if(all[i].id !== current) {
				all[i].reload(true);
			}
		}
		mui.back();
	} else {
		window.history.go(-1)
	}
}

function ajaxPost(url, data, success, error, isJsonP) {
	$.ajax({
		url: url,
		data: data,
		dataType: isJsonP ? 'jsonp' : 'json',
		type: 'post',
		//		timeout: 10000,
		success: function(data) {
			success(data);
		},
		error: function(xhr, type, errorThrown) {
			error(xhr, type, errorThrown);
		}
	});
}

function ajaxGet(url, data, success, error) {
	$.ajax({
		url: url,
		data: data,
		dataType: 'json',
		type: 'get',
		timeout: 10000,
		success: function(data) {
			success(data);
		},
		error: function(xhr, type, errorThrown) {
			error(xhr, type, errorThrown);
		}
	});
}

// 三级联动
function poppicker(id, data, layer, cb) {
	var btn = null;
	mui.ready(function() {
		btn = document.querySelector(id);
		btn.addEventListener('tap', function(event) {
			var self = this;
			if(self.pick) {
				self.pick = null;
			}
			if(self.pick) {
				self.pick.show(function(items) {
					cb(items);
					self.pick = null;
				});
			} else {
				self.pick = new mui.PopPicker({
					layer: layer
				})
				self.pick.setData(data);
				self.pick.show(function(items) {
					cb(items);
					self.pick.dispose();
					self.pick = null;
				});
			}
		}, false);
	});

}

function plusToast(text) {
	mui.toast(text);
}

function uuid(len) {
	uId = '';
	for(var i = 0; i < len; i++) {
		uId += Math.floor(Math.random() * 10);
	}
	return uId;
}

function getQueryString(name) {
	var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
	var r = decodeURI(window.location.search).substr(1).match(reg);
	if(r != null) return unescape(r[2]);
	return null;
}

function isNullObject(obj) {
	var bol = false;
	for(var k in obj) {
		if(obj.hasOwnProperty(k)) {
			bol = true;
		}
	}
	if(bol) {
		return false;
	} else {
		return true;
	}
}

function checkLogin() {
	var bol = true;
	console.log(localStorage.getItem('userInfo'))
	// if(!localStorage.getItem('userInfo')) {
	// 	//		plusToast('您还没登陆，请前去登陆');
	// 	bol = false;
	// }
	return bol;
}

// 上拉加载更多，下拉刷新
function pullRefresh(className, pulldownRefresh, pullupRefresh, autoFlag) {
	var auto = false;
	if(autoFlag) {
		auto = autoFlag;
	}
	//阻尼系数
	var deceleration = mui.os.ios ? 0.003 : 0.0009;
	mui('.mui-scroll-wrapper').scroll({
		bounce: false,
		indicators: true, //是否显示滚动条
		deceleration: deceleration
	});
	mui.ready(function() {
		//循环初始化所有下拉刷新，上拉加载。
		mui.each(document.querySelectorAll(className), function(index, pullRefreshEl) {
			mui(pullRefreshEl).pullToRefresh({
				down: {
					callback: function() {
						pulldownRefresh(this, index);
					}
				},
				up: {
					auto: auto,
					callback: function() {
						pullupRefresh(this, index);
					}
				}
			});
		});
	});
}

function ajaxError() {
	plusToast('请求出错');
}

function uploader(addBtn, url, fileQueued, uploadProgress, uploadSuccess, uploadError, uploadComplete, fileTyep) {
	// 初始化Web Uploader
	var uploader = WebUploader.create({
		// 选完文件后，是否自动上传。
		auto: true,
		// swf文件路径
		swf: '../plugin/webUploader/Uploader.swf',

		// 文件接收服务端。
		server: url,

		// 选择文件的按钮。可选。
		// 内部根据当前运行是创建，可能是input元素，也可能是flash.
		pick: addBtn,

		// 只允许选择图片文件。
		accept: fileTyep ? {
			title: 'Images',
			extensions: "gif,jpg,jpeg,bmp,png",
			mimeTypes: 'image/*'
		} : void 0
	});
	// 当有文件添加进来的时候
	uploader.on('fileQueued', function(file) {
		//		var $li = $(
		//				'<div id="' + file.id + '" class="file-item thumbnail">' +
		//				'<img>' +
		//				'<div class="info">' + file.name + '</div>' +
		//				'</div>'
		//			),
		//			$img = $li.find('img');
		//
		//		// $list为容器jQuery实例
		//		$list.append($li);
		//
		//		// 创建缩略图
		//		// 如果为非图片文件，可以不用调用此方法。
		//		// thumbnailWidth x thumbnailHeight 为 100 x 100
		//		uploader.makeThumb(file, function(error, src) {
		//			if(error) {
		//				$img.replaceWith('<span>不能预览</span>');
		//				return;
		//			}
		//
		//			$img.attr('src', src);
		//		}, thumbnailWidth, thumbnailHeight);
		fileQueued && fileQueued(file);
	});
	// 文件上传过程中创建进度条实时显示。
	uploader.on('uploadProgress', function(file, percentage) {
		//		var $li = $('#' + file.id),
		//			$percent = $li.find('.progress span');
		//
		//		// 避免重复创建
		//		if(!$percent.length) {
		//			$percent = $('<p class="progress"><span></span></p>')
		//				.appendTo($li)
		//				.find('span');
		//		}
		//
		//		$percent.css('width', percentage * 100 + '%');
		uploadProgress && uploadProgress();
	});

	// 文件上传成功，给item添加成功class, 用样式标记上传成功。
	uploader.on('uploadSuccess', function(file, response) {
		//		$('#' + file.id).addClass('upload-state-done');
		uploadSuccess && uploadSuccess(file, response);
	});

	// 文件上传失败，显示上传出错。
	uploader.on('uploadError', function(file) {
		//		var $li = $('#' + file.id),
		//			$error = $li.find('div.error');
		//
		//		// 避免重复创建
		//		if(!$error.length) {
		//			$error = $('<div class="error"></div>').appendTo($li);
		//		}
		//
		//		$error.text('上传失败');
		uploadError && uploadError();
	});

	// 完成上传完了，成功或者失败，先删除进度条。
	uploader.on('uploadComplete', function(file) {
		//		$('#' + file.id).find('.progress').remove();
		uploadComplete && uploadComplete();
	});
}

function fnRand(min, max) {
	return parseInt(Math.random() * (max - min) + min);
}

function getSuffix(str) {
	var temp = str.split('.');
	return temp[temp.length - 1].toLowerCase();
}

if(userInfo && userInfo.isMember == 'true' && userInfo.member.pointSize > 0) {
	$('.agent-enter').show();
}

var ws;
if(checkLogin()) {
	var user = JSON.parse(localStorage.getItem('userInfo'));
	ajaxPost(baseUrl + 'user/get', {
		id: user.id,
		isWebSocket: 'true'
	}, function(res) {
		if('WebSocket' in window) {
			ws = new WebSocket(wsUrl);
		} else if('MozWebSocket' in window) {
			ws = new MozWebSocket(wsUrl);
		} else {
			//如果是低版本的浏览器，则用SockJS这个对象，对应了后台“sockjs/webSocketServer”这个注册器，
			//它就是用来兼容低版本浏览器的
			ws = new SockJS(wsUrl);
		}
		ws.onopen = function(evnt) {
			if(window.location.pathname.indexOf('im.html') > -1) {
				console.log('1111')
				setTimeout(function() {
					ws.send('joinIm:' + JSON.stringify({
						userId: userInfo.id,
						toUserId: getQueryString('seviceId'),
						IMId: getQueryString('imId')
					}));
				}, 2000);
			}
		};
		//接收到消息
		ws.onmessage = function(evnt) {
			//			var obj = {}
			var obj = JSON.parse(evnt.data)
			//			str.split(',').forEach(function(v) {
			//				var arr = v.split("=");
			//				obj[arr[0].replace(" ", '')] = arr[1]
			//			})
			if(window.location.pathname.indexOf('im.html') > -1) {
				// 聊天界面
				if(obj.toUserId == userInfo.id && obj.userId == getQueryString('seviceId')) {
					createChatDom(obj);
				}
				//				vm.msglist.push(obj);
				//				var scroll = mui('#im-page .mui-scroll-wrapper').scroll();
				//重新计算布局值，最大滚动的高度等等
				//				setTimeout(function() {
				//					scroll.reLayout();
				//					//滚动到底部
				//					scroll.scrollToBottom(100);
				//				}, 1000)
			} else {
				//				$("body").css({'position':'fixed', 'min-height': '100%'});
				var msgTips = $('<div></div>').css({
					'position': 'fixed',
					'width': '90%',
					'top': '20px',
					"left": '100%',
					'padding': '10px 16px',
					'border-radius': '10px',
					'background': '#fff',
					'z-index': '30000'
				});
				var title = $('<div>' + obj.userName + ' <span style="font-size: 13px;color: #666;">' + obj.date +
					'<span></div>').css({
					'font-weight': 'bold',
					'color': '#000',
					'font-size': '17px'
				});
				var content = $("<div></div>").html(obj.content).css({
					'font-size': '14px',
					'color': '#333'
				});
				msgTips.append(title);
				msgTips.append(content);
				$("body").append(msgTips);
				msgTips.stop().animate({
					left: '5%'
				}, 1000, function() {
					setTimeout(function() {
						msgTips.remove();
					}, 3000);
				});
				msgTips.click(function() {
					openWindow('http://www.wujielp.com/qcxjwap/main/medicine/pages/im/im.html?userName=' + obj.userName +
						'&seviceId=' + obj.userId + '&imId=' + obj.iMId)
				});

			}
		};
		ws.onerror = function(evnt) {
			console.log(evnt)
		};
		ws.onclose = function(evnt) {}
	}, function() {});

	// 监听消息推送
	listenMsg(function() {
		openWindow('http://wujielp.zaiq520.com/qcxjwap/main/my/my.html')
	})
}

// 推送消息监听
function listenMsg(cb) {
	document.addEventListener('plusready', function() {
		plus.push.setAutoNotification(true);
		//监听推送消息接收
		plus.push.addEventListener("click", function(msg) {
			//延迟2秒跳转
			console.log(JSON.stringify(msg))
			var timeId = setInterval(function() {
				clearInterval(timeId);
				cb()
				plus.push.clear(); //清空所有推送信息
			}, 1500);
		}, false);

		plus.push.addEventListener('receive', function(msg) {
			console.log(JSON.stringify(msg))
			try {
				if(plus.os.name == "iOS") {
					mui.confirm(msg.payload.split(",")[2], '你有新的通知', ['立即前往', '下次再说'], function(e) {
						if(e.index == 0) {
							cb()
							plus.push.clear(); //清空所有推送信息
						} else {
							return;
						}
					})

				} else {
					cb()
					plus.push.clear(); //清空所有推送信息
				}
			} catch(e) {
				malert(e.message);
			}
		}, false);
	}, false);
}