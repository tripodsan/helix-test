# Testing pull from google docs

---

<input type="text" id="path" value="/Helix Hackathon Part V">

<pre style="white-space: pre-wrap;"><code id="md">
</code></pre>

<script>

function fetchMd() {
var path=document.getElementById("path").value;
req=new XMLHttpRequest();
req.open("GET",'https://script.google.com/macros/s/AKfycbyJm5vcxgUcD_BL_HEaXOkYZ1jQGVsHeLkDjlAe31xEQ8P7-wq_/exec?path='+encodeURIComponent(path),true);
req.send();
req.onload=function(){
    var html="";
    json=JSON.parse(req.responseText);
    document.getElementById("md").innerHTML=json.md;
    window.setTimeout(fetchMd, 2000);
};
}

fetchMd();
</script>

---
