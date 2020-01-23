export function base64EncodeUnicode(str) {
    // First we escape the string using encodeURIComponent to get the UTF-8 encoding of the characters, 
    // then we convert the percent encodings into raw bytes, and finally feed it to btoa() function.
    const utf8Bytes = encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function(match, p1) {
            return String.fromCharCode('0x' + p1);
    });

    return window.btoa(utf8Bytes);
}

export function checkExistence(value) {
	switch (typeof value) {
		case 'string':
			return value.length > 0;
		case 'object':
			return value && value.length > 0;
		default:
			return false;
	}
}

export function stepsFill(steps) {
	const splitSteps = steps.split('\n');
	let string = '<ul>';
	splitSteps.forEach(step => {
		string += `<li>${step}</li>`;
	});
	string += '</ul>';
	return string;
}