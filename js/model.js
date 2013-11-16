LineDirectionEnum = {
	VERTICAL: 'vetical',
	HORIZONTAL: 'horizontal'
};

function getRandomHexCode(){
	var chars = '0,1,2,3,4,5,6,7,8,9,A,B,C,D,E,F'.split(',');
	var code = '#';
	for (var i = 0; i < 6; i++) {
		code += chars[Math.floor(Math.random() * 15)];
	};
	return code;
}