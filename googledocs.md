# Testing pull from google docs

---

<pre style="white-space: pre-wrap;"><code id="md">
</code></pre>

<script>

function fetchMd() {
req=new XMLHttpRequest();
req.open("GET",'https://script.googleusercontent.com/macros/echo?user_content_key=Erv4xIFxPI-kBxIsWP0YDtqcfm69E3Tc-4_XTdmXygq08I12meBmxePkAJtc8TJVtIFMwBI4Y3xh7TN7TFJSrE2mNQLpzycUm5_BxDlH2jW0nuo2oDemN9CCS2h10ox_1xSncGQajx_ryfhECjZEnE0XUhVX4uY88ikxbqnaHk6CgZJA7bFTyM2GYHJi8alkjaDsIVMbqnJDRsReZ_qGO6V-rV9yhQ38&lib=MblDl2_cVeRWCLz6N8T1X-5MYprHmXMrb',true);
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