var slider = document.getElementById("myRange");
var output = document.getElementById("bet");
output.value = slider.value; // Display the default slider value

// Update the current slider value (each time you drag the slider handle)
slider.oninput = function() {
	output.value = this.value;
}

function updateSlider()
{
	var bankStr = document.getElementById("bank").innerText;
	slider.max = bankStr;
	output.value = (Math.floor(parseInt(bankStr, 10) / 2));
}