var PicUploadUrl = baseUrl + 'file/uploadImage?state=user'
var communitySaveUrl = baseUrl + 'community/save';

var userInfo = JSON.parse(localStorage.getItem('userInfo'));
// var vm = new Vue({
// 	el: '#signIn',
// 	data: {
// 		imgs: [],
// 		vedioSrc: '' //http://www.cilongdianzikeji.com/qcxj/uploadfile/user/f1e49ae555dc481a.mp4
// 	}
// });

uploadFn();

function uploadFn() {
	uploader('#add-btn', PicUploadUrl, function(file) {
		// 当文件添加进来的成功回调
		mui.showLoading("上传中...", "div");
	}, null, function(file, res) {
		var suffix = getSuffix(res.imgPath);
		if(suffix == 'mp4' || suffix == 'avi' || suffix == 'flv' || suffix == 'MOV') {
			vm.imgs = [];
			vm.vedioSrc = res.imgPath;
		} else if(suffix == 'jpg' || suffix == 'jpeg' || suffix == 'png' || suffix == 'gif') {
			vm.imgs.push(res.imgPath);
		}
		mui.hideLoading();
	});
}

mui.previewImage();

mui('#signIn').on('tap', '.delete', function() {
	vm.imgs.splice(Number(this.getAttribute('picIndex')), 1);
});

function deleteVedio() {
	vm.vedioSrc = '';
	setTimeout(function(){
		uploadFn();
	}, 500)
}

mui('#signIn').on('tap', '.fabu', function() {
	mui.showLoading("正在加载..","div");
	ajaxPost(communitySaveUrl, {
		content: $('.content').val(),
		filePath: vm.vedioSrc ? vm.vedioSrc : vm.imgs.join('|'),
		userId: userInfo.id,
		userName: userInfo.userName,
		userHead:userInfo.imgPath,
		type: '社区',
		praise: 0,
		comment: 0,
		share: 0
	}, function(res) {
		mui.hideLoading();
		plusToast('发布成功!');
		location.reload();
		// goback();
	}, function() {
		ajaxError();
	})
})