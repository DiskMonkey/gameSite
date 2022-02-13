function insertURLParam(key, value)
{
    if (history.pushState)
    {
        let searchParams = new URLSearchParams(window.location.search);
        searchParams.set(key, value);
        let newurl = window.location.protocol + "//" + window.location.host + window.location.pathname + '?' + searchParams.toString();
        window.history.pushState({ path: newurl }, '', newurl);
    }
}

// to remove the specific key
function removeUrlParameter(paramKey)
{
    const url = window.location.href
    //console.log("url", url)
    var r = new URL(url)
    r.searchParams.delete(paramKey)
    const newUrl = r.href
    //console.log("r.href", newUrl)
    window.history.pushState({ path: newUrl }, '', newUrl)
}