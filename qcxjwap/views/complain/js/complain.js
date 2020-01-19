var saveComplainUrl = baseUrl + 'complaint/save';
var PicUploadUrl = baseUrl + 'file/uploadImage?state=user';
var vm = new Vue({
    el: '#complain',
    data: {
        imgs: [],
		optionList:[]
    }
});

mui.previewImage();
var userInfo = JSON.parse(localStorage.getItem('userInfo'));
mui('#complain').on('tap', '.btn', function(){
	ajaxPost(saveComplainUrl, {
		title: $(".title-text").val(),
		userId: userInfo.id,
		content: $('.content').val(),
		filePath: vm.imgs.join('|'),
		userName: userInfo.userName,
		status: '待处理'
	}, function(res){
		goback();;
	}, function(){
		ajaxError()
	})
});

uploader('#add-btn', PicUploadUrl, null, null, function(file, res){
	vm.imgs.push(res.imgPath)
}, null, null, true);

mui('#signIn').on('tap', '.delete', function(){
	vm.imgs.splice(Number(this.getAttribute('picIndex')), 1);
});

