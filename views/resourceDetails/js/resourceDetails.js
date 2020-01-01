
var vm = new Vue({
	el: '#notice-detail',
	data: {
		resource: null
	}
});
getData(getQueryString('id'));
function getData(id) {
	ajaxPost(baseUrl + 'resource/get', {id: id}, function(res) {
		vm.resource = res.resource
	}, function(){
		ajaxError();
	})
}
