function onLoad() {
	//document.getElementById("pagenum").value = 1;
    if ( parseInt(document.getElementById("pagenum").innerHTML)  ==1) {
        document.getElementById("btnLeft").disabled = true
    }
    document.getElementById("pginput").value = document.getElementById("pagenum").innerHTML;
}
