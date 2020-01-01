$(function() {
	$('.search-bar').on('tap', '.search-btn', function() {
		document.querySelector('.search-bar input').blur();
		if(!document.querySelector('.search-bar input').value) {
			plusToast('请输入搜索内容');
			return false;
		}
		//		openWindow("../search/search.html", {keyword: document.querySelector('.search-bar input').value}, '搜索');
		openWindow('../search/search.html?keyword=' + document.querySelector('.search-bar input').value)
		document.querySelector('.search-bar input').value = ''
	});

	document.onkeydown = function(event) {
		var e = event || window.event;
		if(e && e.keyCode == 13) { //回车键的键值为13
			document.querySelector('.search-bar input').blur();
			if(!document.querySelector('.search-bar input').value) {
				plusToast('请输入搜索内容');
				return false;
			}
			//		openWindow("../search/search.html", {keyword: document.querySelector('.search-bar input').value}, '搜索');
			openWindow('../search/search.html?keyword=' + document.querySelector('.search-bar input').value)
			document.querySelector('.search-bar input').value = ''
		}
	};

});